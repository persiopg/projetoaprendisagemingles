const fs = require('fs');
const path = require('path');
const file = path.resolve('.cache/mostCommonEnglishWords2000.dataset.json');
let s = fs.readFileSync(file, 'utf8');
// Remove trailing commas before closing } or ]
// This is a conservative approach: replace ",\n\s*}" -> "\n}\n" and ",\n\s*]" -> "\n]\n"
s = s.replace(/,\s*\n(\s*[}\]])/g, '\n$1');
// Try parsing
try {
  JSON.parse(s);
  fs.writeFileSync(file, s, 'utf8');
  console.log('Fixed trailing commas and JSON parsed OK.');
} catch (err) {
  console.error('Fixer could not produce valid JSON:', err.message);
  process.exit(1);
}