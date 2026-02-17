# Cursor JS Console Utils

在 Cursor / VS Code 中快速插入 `console.log` 调试语句的扩展。

## 功能

- **无选区时**：在光标处插入空白 `console.log();`，光标停留在括号内，方便直接输入变量或表达式。
- **有选区时**：根据选中的文本，在**最后一处选区所在行的末尾**插入带标签的日志，格式为：
  ```js
  console.log('变量名: ', 变量名);
  ```
- **多选区**：支持多处选区，会按在文档中的先后顺序，一次性插入多行 `console.log`，每行对应一个选区。
- **标签转义**：选中内容中的单引号 `'` 会被转义，避免生成的字符串语法错误。
- **光标与滚动**：插入完成后，光标会移动到**最后插入的那一行末尾**，并滚动到该位置。

## 安装

### 从cursor拓展市场安装(推荐)
搜索 Cursor JS Console Utils 并安装

### 从 VSIX 安装

1. 在项目根目录执行：`npm run pkg`
2. 在 VS Code / Cursor 中：按 **Ctrl+Shift+P** → 输入 **Install from vsix** → 选择生成的 `.vsix` 文件。

## 使用方式

1. **命令面板**：`Ctrl+Shift+P`（Windows/Linux）或 `Cmd+Shift+P`（macOS），输入并选择 **“Insert console.log for selection”**。
2. **快捷键**：`Shift+Alt+L`。

### 使用示例

| 操作 | 结果 |
|------|------|
| 光标在某行，无选区，执行命令 | 在该位置插入 `console.log();` |
| 选中变量 `userName`，执行命令 | 在该行下方插入 `console.log('userName: ', userName);` |
| 多选 `a`、`b`、`c`（三处选区），执行命令 | 在最后选区所在行下方插入三行：`console.log('a: ', a);` 等 |

## 注意事项

1. **语言无关**：扩展不区分语言，任何文件类型下都会插入 `console.log`。若在非 JavaScript/TypeScript 文件中使用，请自行确认是否符合项目习惯（如删除或替换为对应语言的打印方式）。
2. **插入位置**：有选区时，所有日志行都插入在**最后一处选区所在行的行末**（换行后），不会在每处选区后分别插入。
3. **只读/未保存**：若当前文档只读或无法编辑，插入可能失败；建议在可编辑且已保存的文档中使用。
4. **无打开编辑器**：未打开任何编辑器时执行命令，会提示 “Can't insert log because no document is open”。
5. **快捷键冲突**：`Shift+Alt+L` 可能与其他扩展或系统快捷键冲突，可在 **键盘快捷方式** 中搜索 `Insert console.log for selection` 自行修改。
6. **生产代码**：插入的 `console.log` 仅适合本地调试，提交前请删除或使用条件编译/构建工具过滤，避免泄露信息或影响性能。

## 环境要求

- **VS Code** 版本 ≥ 1.75.0（或兼容的 Cursor 版本）。

## 开发与打包

```bash
# 安装依赖
npm install

# 编译 TypeScript
npm run compile

# 监听并自动编译
npm run watch

# 打包为 .vsix
npm run pkg
```

## 许可证

MIT License，详见 [LICENSE](LICENSE)。
