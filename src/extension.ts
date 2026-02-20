import * as vscode from 'vscode';
import * as path from 'path'

function indentForNextLine(lineText: string, editor: vscode.TextEditor): string {
  let indent = lineText.match(/^\s*/)?.[0] ?? '';
  if (/{\s*$/.test(lineText.trimEnd())) {
    const tabSize = editor.options.tabSize as number;
    const insertSpaces = editor.options.insertSpaces as boolean;
    indent += insertSpaces ? ' '.repeat(tabSize) : '\t';
  }
  return indent;
}

function getRelativePath(editor: vscode.TextEditor): string | undefined {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
  if (workspaceFolder) {
    const relative = path.relative(workspaceFolder.uri.fsPath, editor.document.fileName);
    // posix format for better readability in log
    return relative.replace(/\\/g, '/');
  }
  return undefined;
}


type BuildParams = {
  name?: string;  // "a"
  variable?: string; // a
  logFile?: boolean;
  logLine?: boolean;
  line?: number;  
};

function buildConsolelogCode({ name, variable, logFile, logLine, line }: BuildParams): string {
  const editor = vscode.window.activeTextEditor;
  const args: string[] = [];

  let prefix = '';
  if (logFile && editor) {
    const relativePath = getRelativePath(editor);
    if (relativePath) {
      prefix += relativePath;
    } else {
      prefix += path.basename(editor.document.fileName);
    }
  }
  if (logLine) {
    let lineNumber: number | undefined;
    if (line !== undefined) {
      lineNumber = line;                  
    } else if (editor) {
      lineNumber = editor.selection.active.line; 
    }
    if (lineNumber !== undefined) {
      if (prefix) prefix += ' ';
      prefix += `line ${lineNumber + 1}`;    
    }
  }

  if (prefix) {
    args.push(`"${prefix}"`);
  }

  if (variable) {
    const label = name || variable;
    args.push(`"${label}:"`);
    args.push(variable);

  }

  return `console.log(${args.join(', ')});`;
}


function insertLogStatement(config: any): void {
  const logFile = config.get("logFile", false)
  const logLine = config.get("logLine", false)
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    void vscode.window.showErrorMessage(
      "Can't insert log because no document is open"
    );
    return;
  }

  const document = editor.document;
  const selections = editor.selections;

  const hasNonEmptySelection = selections.some((sel) => {
    const text = document.getText(sel).trim();
    return text.length > 0;
  });

  if (!hasNonEmptySelection) {
    const position = editor.selection.active;
    const line = document.lineAt(position.line);
    const lineHasContent = line.text.trim().length > 0;

    if (lineHasContent) {
      const indent = indentForNextLine(line.text, editor);
      const insertPosition = line.range.end;
      const textToInsert = '\n' + indent + buildConsolelogCode({ logFile, logLine, line: position.line });
      const edit = new vscode.WorkspaceEdit();
      edit.insert(document.uri, insertPosition, textToInsert);
      void vscode.workspace.applyEdit(edit).then((ok) => {
        if (!ok) return;
        const ed = vscode.window.activeTextEditor;
        if (!ed || ed.document !== document) return;
        const cursorPos = new vscode.Position(
          position.line + 1,
          indent.length + 'console.log('.length
        );
        ed.selection = new vscode.Selection(cursorPos, cursorPos);
        ed.revealRange(new vscode.Range(cursorPos, cursorPos));
      });
    } else {
      const snippet = new vscode.SnippetString(buildConsolelogCode({ variable:'$0', logFile, logLine }));
      editor.insertSnippet(snippet, position);
    }
    return;
  }

  // Multi-selection insert (non-empty selections)
  type Item = { selection: vscode.Selection; name: string };
  const items: Item[] = [];
  for (const sel of selections) {
    const name = document.getText(sel).trim();
    if (name.length > 0) {
      items.push({ selection: sel, name });
    }
  }
  if (items.length === 0) {
    return;
  }

  const escapeForSingleQuotedString = (s: string): string =>
    s.replace(/'/g, "\\'");

  const byDocumentOrder = [...items].sort((a, b) => {
    const endA = a.selection.end;
    const endB = b.selection.end;
    if (endA.line !== endB.line) return endA.line - endB.line;
    return endA.character - endB.character;
  });

  const lastItem = byDocumentOrder[byDocumentOrder.length - 1];
  const lastLine = document.lineAt(lastItem.selection.end.line);
  const indent = indentForNextLine(lastLine.text, editor);
  const insertPosition = lastLine.range.end;
  const block = byDocumentOrder
    .map(({ name, selection }) => {
      const escaped = escapeForSingleQuotedString(name);
      return (
        indent +
        buildConsolelogCode({
          name: escaped,
          variable: name,
          logFile,
          logLine,
          line: selection.start.line, 
        })
      );
    })
    .join('\n');

  const edit = new vscode.WorkspaceEdit();
  edit.insert(document.uri, insertPosition, '\n' + block);

  const insertedLineCount = byDocumentOrder.length;
  const lastInsertLine = lastItem.selection.end.line + 1;
  const cursorLine = lastInsertLine + insertedLineCount - 1;

  void vscode.workspace.applyEdit(edit).then((ok) => {
    if (!ok) return;
    const ed = vscode.window.activeTextEditor;
    if (!ed || ed.document !== document) return;
    const lineEnd = ed.document.lineAt(cursorLine).range.end;
    ed.selection = new vscode.Selection(lineEnd, lineEnd);
    ed.revealRange(new vscode.Range(lineEnd, lineEnd));
  });
}

export function activate(context: vscode.ExtensionContext): void {
  const config = vscode.workspace.getConfiguration()
  const insertLogStatementCmd = vscode.commands.registerCommand(
    'cursorJsConsoleUtils.insertLogStatement',
    ()=>insertLogStatement(config),
  );
  context.subscriptions.push(insertLogStatementCmd);
}

export function deactivate(): void {}
