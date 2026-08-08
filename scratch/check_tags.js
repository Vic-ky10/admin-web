const fs = require('fs');
const content = fs.readFileSync('c:/Users/vigne/OneDrive/Desktop/InfiniGoal-Portal/admin-web/features/expense/components/analytics/EmployeeExpenseTrackerClient.tsx', 'utf8');

let line = 1;
let braceStack = [];

for (let i = 0; i < content.length; i++) {
  const char = content[i];
  if (char === '\n') {
    line++;
  }
  if (char === '{') {
    braceStack.push({ type: '{', line });
  }
  if (char === '}') {
    const pop = braceStack.pop();
    if (!pop) {
      console.log(`[Error] Unmatched closing brace } at line ${line}`);
    }
  }
}

console.log('Unclosed braces remaining:', braceStack);
