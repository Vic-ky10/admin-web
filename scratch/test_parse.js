const ts = require('typescript');
const fs = require('fs');

const fileName = 'c:/Users/vigne/OneDrive/Desktop/InfiniGoal-Portal/admin-web/features/expense/components/analytics/EmployeeExpenseTrackerClient.tsx';
const fileContent = fs.readFileSync(fileName, 'utf8');

const sourceFile = ts.createSourceFile(
  fileName,
  fileContent,
  ts.ScriptTarget.ES2020,
  true
);

const diagnostics = ts.getPreEmitDiagnostics(ts.createProgram([fileName], {
  jsx: ts.JsxEmit.React,
  noEmit: true
}));

for (const diag of diagnostics) {
  if (diag.file && diag.file.fileName === fileName) {
    const { line, character } = diag.file.getLineAndCharacterOfPosition(diag.start);
    const message = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
    console.log(`Line ${line + 1}, Col ${character + 1}: ${message}`);
  }
}
