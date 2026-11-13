# Online Code Editor

A browser-based code playground with real-time live preview for HTML, CSS, and JavaScript, similar to CodePen. Built with plain HTML, CSS, and JavaScript. No frameworks or build step.

## Features

- Live preview that updates as you type (debounced)
- Separate HTML, CSS, and JavaScript tabs
- Built-in console panel that captures `console.log`, `warn`, and errors from the preview
- Auto-save with `localStorage`, so your code is still there after a refresh
- Tab key inserts indentation
- Switch between side-by-side and stacked layouts
- Download your work as a single `project.html` file
- Preview runs in a sandboxed `iframe`

## Run it

Open `index.html` in any modern browser. No install needed.

## How it works

1. Each editor is a `<textarea>`; an `input` listener fires on every keystroke.
2. A debounce waits 300 ms, then combines the three inputs into one HTML document.
3. The document is loaded into a sandboxed `<iframe>` through `srcdoc`.
4. A small injected script forwards console output to the parent page with `postMessage`.
5. Editor content is saved to `localStorage` and restored on load.

## Project structure

```
online-code-editor/
├── index.html
├── style.css
├── script.js
├── README.md
└── .gitignore
```

## Ideas for next steps

- Syntax highlighting with CodeMirror or Monaco
- Resizable panes
- Shareable links that encode the code in the URL
- Light and dark themes

## License

MIT
