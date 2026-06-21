import fs from 'fs';
import path from 'path';

// Caracteres problemáticos específicos encontrados
const PROBLEMATIC_CHARS = [
  0xFEFF,   // BOM (Byte Order Mark)
  0x200B,   // Zero-width space
  0x200C,   // Zero-width non-joiner
  0x200D,   // Zero-width joiner
  0x129,    // Caractere inválido
  0x143,    // Caractere inválido
  0x157,    // Caractere inválido
  0xAD,     // Soft hyphen
  0x2060,   // Word joiner
];

// Caracteres de controle genuinamente problemáticos (não incluir \n, \r, \t)
function isProblematicControlChar(code) {
  if (code === 9 || code === 10 || code === 13) return false; // Tab, LF, CR OK
  if (code >= 0x80 && code <= 0x9F) return true;  // Control range
  if (PROBLEMATIC_CHARS.includes(code)) return true;
  if (code === 0 || (code >= 1 && code <= 8) || (code >= 11 && code <= 12) || (code >= 14 && code <= 31)) {
    return true;
  }
  return false;
}

function cleanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalLength = content.length;
    
    // Remover BOM se existir no início
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.substring(1);
    }
    
    // Limpar caracteres problemáticos
    let cleaned = '';
    for (let i = 0; i < content.length; i++) {
      const code = content.charCodeAt(i);
      if (!isProblematicControlChar(code)) {
        cleaned += content[i];
      }
    }
    
    if (cleaned !== content) {
      fs.writeFileSync(filePath, cleaned, 'utf-8');
      return { fixed: true, removed: originalLength - cleaned.length };
    }
    
    return { fixed: false };
  } catch (err) {
    return { error: err.message };
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
    } catch (e) {
      // Ignore
    }
  });
  
  return files;
}

console.log('\n🧹 LIMPEZA PROFUNDA - BOM E CARACTERES DE CONTROLE\n');
console.log('═'.repeat(70));

const frontendFiles = scanDirectory('FrontEnd/src', '.jsx').concat(scanDirectory('FrontEnd/src', '.js'));
const backendFiles = scanDirectory('BackEnd', '.js');

let frontendFixed = 0;
let backendFixed = 0;
let totalRemoved = 0;

console.log('\n📁 FRONTEND\n');

frontendFiles.forEach(file => {
  const result = cleanFile(file);
  if (result.fixed) {
    frontendFixed++;
    totalRemoved += result.removed;
    process.stdout.write('.');
  }
});

console.log(`\n   ${frontendFixed} arquivos limpos`);

console.log('\n📁 BACKEND\n');

backendFiles.forEach(file => {
  const result = cleanFile(file);
  if (result.fixed) {
    backendFixed++;
    totalRemoved += result.removed;
    process.stdout.write('.');
  }
});

console.log(`\n   ${backendFixed} arquivos limpos`);

console.log('\n' + '═'.repeat(70));
console.log(`\n✅ RESUMO:`);
console.log(`   Frontend: ${frontendFixed} arquivos`);
console.log(`   Backend: ${backendFixed} arquivos`);
console.log(`   Total: ${frontendFixed + backendFixed} arquivos`);
console.log(`   Caracteres removidos: ${totalRemoved}\n`);
