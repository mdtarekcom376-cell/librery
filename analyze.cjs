const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');
const lines = code.split('\n');

let hasReadDb = false;
let hasWriteDb = false;
const endpoints = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('function readDb')) hasReadDb = true;
  if (line.includes('function writeDb')) hasWriteDb = true;
  if (line.includes('const readDb =')) hasReadDb = true;
  if (line.includes('const writeDb =')) hasWriteDb = true;
  if (line.includes('readDb(')) hasReadDb = true;
  if (line.includes('writeDb(')) hasWriteDb = true;

  const appRouteMatch = line.match(/app\.(get|post|put|delete)\(['"]([^'"]+)['"]/);
  if (appRouteMatch) {
    let method = appRouteMatch[1];
    let route = appRouteMatch[2];
    
    let usesMySQL = false;
    let usesJsonDb = false;
    let mixed = false;
    let j = i;
    let openBraces = 0;
    
    while (j < lines.length) {
      if (lines[j].includes('{')) openBraces += (lines[j].match(/\{/g) || []).length;
      if (lines[j].includes('}')) openBraces -= (lines[j].match(/\}/g) || []).length;
      
      if (lines[j].includes('pool.') || lines[j].includes('INSERT INTO') || lines[j].includes('SELECT * FROM')) usesMySQL = true;
      if (lines[j].includes('readDb(') || lines[j].includes('writeDb(')) usesJsonDb = true;
      
      if (openBraces === 0 && j > i) break;
      j++;
    }
    
    if (usesMySQL && usesJsonDb) mixed = true;
    
    endpoints.push({ method, route, usesMySQL, usesJsonDb, mixed, startLine: i + 1, endLine: j + 1 });
  }
}

console.log('hasReadDb:', hasReadDb);
console.log('hasWriteDb:', hasWriteDb);
console.log('\nEndpoints:');
endpoints.forEach(e => {
  let status = e.mixed ? 'MIXED' : (e.usesMySQL ? 'MYSQL' : (e.usesJsonDb ? 'JSONDB' : 'UNKNOWN'));
  console.log(`${e.method.toUpperCase().padEnd(6)} ${e.route.padEnd(40)} | ${status} | Lines: ${e.startLine}-${e.endLine}`);
});
