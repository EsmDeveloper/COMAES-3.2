import fs from 'fs';
import path from 'path';

// Apenas contar problemas, sem exibir caracteres
const MOJIBAKE_PATTERNS = [
  /Ã©/,  // é corrompido
  /Ã¡/,  // á corrompido
  /Ã£/,  // ã corrompido
  /Ã§/,  // ç corrompido
  /Ã¢/,  // â corrompido
  /Ã³/,  // ó corrompido
  /â€™/,  // apóstrofo corrompido
  /â€œ/,  // aspas corrompidas
];

function hasMojibakes(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return MOJIBAKE_PATTERNS.some(p => p.test(content));
  } catch {
    return false;
  }
}

function scanDirectory(dir, ext) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    try {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (!item.startsWith('.') && !item.includes('node_modules') && !item.includes('dist')) {
          files = files.concat(scanDirectory(fullPath, ext));
        }
      } else if (fullPath.endsWith(ext)) {
        files.push(fullPath);
      }
    } catch (e) {}
  });
  
  return files;
}

console.log('\n📊 VERIFICACAO FINAL DE ENCODING\n');

const frontendFiles = scanDirectory('FrontEnd/src', '.jsx').concat(scanDirectory('FrontEnd/src', '.js'));
const backendFiles = scanDirectory('BackEnd', '.js');

let frontendIssues = 0;
let backendIssues = 0;

frontendFiles.forEach(f => { if (hasMojibakes(f)) frontendIssues++; });
backendFiles.forEach(f => { if (hasMojibakes(f)) backendIssues++; });

console.log(`Frontend: ${frontendIssues}/${frontendFiles.length} com mojibakes`);
console.log(`Backend: ${backendIssues}/${backendFiles.length} com mojibakes`);
console.log(`\nTotal com problemas: ${frontendIssues + backendIssues}`);

if (frontendIssues + backendIssues === 0) {
  console.log('\n✅ SUCESSO! Nenhum mojibake detectado\n');
} else {
  console.log('\n⚠️  Ainda existem problemas\n');
}
