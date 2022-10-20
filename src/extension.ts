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

			let flags = '';
			const jwebConfig = vscode.workspace.getConfiguration('jweb');
			if (jwebConfig) {
				const printBanner = jwebConfig.get('jtangle.printBanner.enabled');
				if (printBanner) flags += 'b';
				const showProgress = jwebConfig.get('jtangle.showProgress.enabled');
				if (showProgress) flags += 'p';
				const debugInfo = jwebConfig.get('jtangle.printDebugInfo.enabled');
				if (debugInfo) flags += 's';
				const reportNoErrors = jwebConfig.get('jtangle.reportNoErrors.enabled');
				if (reportNoErrors) flags += 'h';
				const outputComments = jwebConfig.get('jtangle.outputComments.enabled');
				if (outputComments) flags += 'c';
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
			if (flags.length > 0) params.unshift('+' + flags);

			jtangle(params, outputChannel.appendLine);

		};
	});

	context.subscriptions.push(eventDisposable);
}
