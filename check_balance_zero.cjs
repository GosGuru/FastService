const fs = require('fs');

const content = fs.readFileSync('components/admin/AdminDashboard.tsx', 'utf-8');
const lines = content.split(/\r?\n/);

let balance = 0;
let inString = null;
let inComment = false;
let startLine = 676; // AdminDashboard starts here

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let j = 0;
  while (j < line.length) {
    const ch = line[j];
    const next = line[j + 1];
    
    if (inComment) {
      if (ch === '*' && next === '/') {
        inComment = false;
        j += 2;
        continue;
      }
      j++;
      continue;
    }
    
    if (inString) {
      if (ch === '\\') {
        j += 2;
        continue;
      }
      if (ch === inString) {
        inString = null;
      }
      j++;
      continue;
    }
    
    if (ch === '/' && next === '/') {
      break;
    }
    
    if (ch === '/' && next === '*') {
      inComment = true;
      j += 2;
      continue;
    }
    
    if (ch === '`') {
      j++;
      continue;
    }
    
    if (ch === '"' || ch === "'") {
      inString = ch;
      j++;
      continue;
    }
    
    if (i + 1 >= startLine) {
      if (ch === '{') {
        balance++;
      } else if (ch === '}') {
        balance--;
        if (balance === 0) {
          console.log(`Balance reached 0 at line ${i + 1}, col ${j + 1}`);
          console.log(`Context: ${line.substring(Math.max(0, j-20), j+1)}`);
          // Stop after first occurrence
          process.exit(0);
        }
      }
    }
    
    j++;
  }
}

console.log(`Final balance: ${balance} (never reached 0)`);
