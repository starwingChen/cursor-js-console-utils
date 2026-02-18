# Cursor JS Console Utils

[中文说明](README.zh.md)

Quickly insert `console.log` statements in Cursor / VS Code. Inspired by [vscode-js-console-utils](https://github.com/whtouche/vscode-js-console-utils).

![](assets/example.gif)

## Features

- **No selection**: Inserts a blank `console.log();` at the cursor, with the cursor inside the parentheses so you can type a variable or expression directly.
- **With selection**: Based on the selected text, inserts a labeled log at **the end of the line containing the last selection**, in the format:
  ```js
  console.log('variableName: ', variableName);
  ```
- **Multiple selections**: Supports multiple selections; inserts multiple `console.log` lines in document order, one per selection.

## Installation

### From Cursor Extension Market (recommended)
Search for **Cursor JS Console Utils** and install.

### From VSIX

1. In the project root, run: `npm run pkg`
2. In VS Code / Cursor: press **Ctrl+Shift+P** → type **Install from vsix** → select the generated `.vsix` file.

## Usage

1. **Command Palette**: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS), then type and select **"Insert console.log for selection"**.
2. **Keyboard shortcut**: `Shift+Alt+L`.

### Examples

| Action | Result |
|--------|--------|
| Cursor on a line, no selection, run command | Inserts `console.log();` at that position |
| Select variable `userName`, run command | Inserts `console.log('userName: ', userName);` at the end of that line |
| Multi-select `a`, `b`, `c` (three selections), run command | Inserts three lines after the line of the last selection: `console.log('<var>: ', <var>);` |

## Notes

- **Language-agnostic**: The extension does not check file type; it inserts `console.log` in any file. If you use it in non-JavaScript/TypeScript files, ensure it fits your project (e.g. remove or replace with the appropriate print/log for that language).
- **Insert position**: With selection(s), all log lines are inserted **at the end of the line containing the last selection** (after a newline), not after each selection.
- **Shortcut conflicts**: `Shift+Alt+L` may conflict with other extensions or system shortcuts. You can search for **Insert console.log for selection** in **Keyboard Shortcuts** and change it.

## Requirements

- **VS Code** version ≥ 1.75.0 (or a compatible Cursor version).

## Feedback

If this extension helps you, consider leaving a rating or review on the Cursor / VS Code marketplace — it helps others discover it:).

## License

MIT License. See [LICENSE](LICENSE) for details.
