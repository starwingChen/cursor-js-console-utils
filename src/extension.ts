import * as vscode from 'vscode';

function insertLogStatement(): void {
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
    const snippet = new vscode.SnippetString('console.log($0);');
    editor.insertSnippet(snippet, position);
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
  const insertPosition = document.lineAt(lastItem.selection.end.line).range.end;
  const block = byDocumentOrder
    .map(({ name }) => {
      const escaped = escapeForSingleQuotedString(name);
      return `console.log('${escaped}: ', ${name});`;
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
  const insertLogStatementCmd = vscode.commands.registerCommand(
    'cursorJsConsoleUtils.insertLogStatement',
    insertLogStatement
  );
  context.subscriptions.push(insertLogStatementCmd);
}

export function deactivate(): void {}
