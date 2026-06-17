const fs = require('fs');

const content = fs.readFileSync('components/admin/AdminDashboard.tsx', 'utf-8');
const lines = content.split(/\r?\n/);

let balance = 0;
let inString = null;
let inComment = false;
let inTemplate = false;
let templateDepth = 0;

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
      inTemplate = !inTemplate;
      j++;
      continue;
    }
    
    if (ch === '"' || ch === "'") {
      inString = ch;
      j++;
      continue;
    }
    
    if (ch === '{') {
      balance++;
      if (balance <= 5 || i > 1149) {
        console.log(`${i + 1}:${j + 1}  {  balance=${balance}`);
      }
    } else if (ch === '}') {
      balance--;
      if (balance <= 5 || i > 1149) {
        console.log(`${i + 1}:${j + 1}  }  balance=${balance}`);
      }
    }
    
    j++;
  }
}

console.log(`Final balance: ${balance}`);
