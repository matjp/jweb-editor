import * as vscode from 'vscode';
import fs = require('fs');
import path = require('path');
import concatCode from 'markdown-it-concat-code';
import MarkdownIt from 'markdown-it';
import frontMatter from 'markdown-it-front-matter';
import jtangle from '@matjp/jweb';

module.exports.activate = (context: vscode.ExtensionContext) => {

	let outputChannel = vscode.window.createOutputChannel('JWEB');
	context.subscriptions.push(outputChannel);

    const eventDisposable = vscode.workspace.onWillSaveTextDocument( (e: vscode.TextDocumentWillSaveEvent) => {
		const doc = e.document;
		if (!doc.isDirty) return;

		//Determine if we have a JWEB document
		let isJWEBMarkdown = false;
		let mdLang = '';
		const md = MarkdownIt().use(frontMatter, function(fm) {
			const arr = fm.split(':');
			if (arr.length === 2 && arr[0] === 'jweb') {
				isJWEBMarkdown = (arr[0] === 'jweb');
				mdLang = arr[1];
			}});
		md.parse(doc.getText(), {});

		if (isJWEBMarkdown) { // Convert the markdown into WEB source, write it to a file, then call jtangle
			outputChannel.show(true);			
			const src: any = {};
			md.use(concatCode.default, { lang: mdLang, separator: '\n@ \n'}, src)
			md.parse(doc.getText(), {});

			let flagsOn = '+'; let flagsOff = '-';			
			const jwebConfig = vscode.workspace.getConfiguration('jweb');
			if (jwebConfig) {
				if (jwebConfig.get('jtangle.printBanner.enabled')) { flagsOn += 'b' } else { flagsOff += 'b' };
				if (jwebConfig.get('jtangle.showProgress.enabled')) { flagsOn += 'p' } else { flagsOff += 'p' };
				if (jwebConfig.get('jtangle.printDebugInfo.enabled')) { flagsOn += 's' } else { flagsOff += 's' };
				if (jwebConfig.get('jtangle.reportNoErrors.enabled')) { flagsOn += 'h' } else { flagsOff += 'h' };
				if (jwebConfig.get('jtangle.outputComments.enabled')) { flagsOn += 'c' } else { flagsOff += 'c' };
				if (jwebConfig.get('jtangle.outputSectionNumbers.enabled')) { flagsOn += 'n' } else { flagsOff += 'n' };
			};

			const mdUri = doc.uri;
			const mdPath = mdUri.fsPath;
			const cwd = path.parse(mdPath).dir;
			const fn = path.parse(mdPath).name;	
			const wFile = path.join(cwd, fn + '.w');
			const wText = '@*\n' + src.value;
			const outFile = path.join(cwd, fn);

			let changeFile = path.join(cwd, fn + '.ch');
			if (!fs.existsSync(changeFile)) changeFile = '-';
	
			fs.writeFileSync(wFile, wText);
		  		
			let params = [wFile, changeFile, mdLang, outFile];
			if (flagsOff.length > 1) params.unshift(flagsOff);
			if (flagsOn.length > 1) params.unshift(flagsOn);

			jtangle(params, outputChannel.appendLine);

		};
	});

	context.subscriptions.push(eventDisposable);
}
