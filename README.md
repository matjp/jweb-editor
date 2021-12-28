# JWEB Editor

An editor for the [JWEB](https://github.com/matjp/jweb) system of Literate Programming.

## How it works

The extension recognizes JWEB files as Markdown files having this tag at the beginning:

```markdown
---
jweb:<language>
---
```

where `language` is the language specifier of the JWEB program target language. e.g. (c, cpp, js, ts).

Upon saving edits to a JWEB markdown file, a WEB file (*.w) is generated from the fenced code blocks and `jtangle` is called with the WEB file as input.

The target source file will be written to the same directory as the JWEB source file.

Errors and information messages are written to the Output tab.

See the settings for options to control what kind of output is shown.

## Viewing and Publishing JWEB files

Since JWEB files are Markdown files your programs can be viewed and exported for publishing online, or converted to PDF for printing using other Markdown handling extensions.

If you just want to preview as you are editing, VS Code's built-in previewer will suffice.

A Markdown mathematics extension will be useful if your program text includes mathematical notation.

If you find this software useful please consider making a contribution to support the development of free and open software:

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/donate/?business=4Y8W9NDGYET6A&no_recurring=0&currency_code=USD)
