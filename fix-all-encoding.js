import fs from 'fs';
import path from 'path';

const mojibakeReplacements = [
  // Acentos corrompidos como Ã<char>
  { from: /Ã©/g, to: 'é' },
  { from: /Ã¡/g, to: 'á' },
  { from: /Ã£/g, to: 'ã' },
  { from: /Ã§/g, to: 'ç' },
  { from: /Ã¢/g, to: 'â' },
  { from: /Ã¨/g, to: 'è' },
  { from: /Ã­/g, to: 'í' },
  { from: /Ã³/g, to: 'ó' },
  { from: /Ã´/g, to: 'ô' },
  { from: /Ã¼/g, to: 'ü' },
  { from: /â€™/g, to: "'" },
  { from: /â€œ/g, to: '"' },
  { from: /â€œ/g, to: '"' },
  { from: /â€•/g, to: '"' },
  { from: /â€¢/g, to: '•' },
  { from: /â€"/g, to: '–' },
  { from: /â€"/g, to: '—' },
  { from: /Â/g, to: '' },
  { from: /°¸/g, to: '' },
  { from: /¥/g, to: '' },
  { from: /┬/g, to: '' },
  { from: /├/g, to: '' },
  { from: /ð/g, to: '🏅' },
  { from: /ï¸/g, to: '' },
];

function scanDirectory(dir, ext) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!item.startsWith('.') && !item.includes('node_modules') && !item.includes('dist')) {
        files = files.concat(scanDirectory(fullPath, ext));
      }
    } else if (fullPath.endsWith(ext)) {
      files.push(fullPath);
    }
  });
  
  return files;
}

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalLength = content.length;
    
    // Aplicar todas as substituições
    mojibakeReplacements.forEach(({ from, to }) => {
      content = content.replace(from, to);
    });
    
    // Remover caracteres de controle problemáticos
    content = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    if (content.length !== originalLength) {
      fs.writeFileSync(filePath, content, 'utf-8');
      return true;
    }
    
    return false;
  } catch (err) {
    return false;
  }
}

console.log('\n🔧 CORREÇÃO EM LOTE - 60 ARQUIVOS COM ENCODING INVÁLIDO\n');
console.log('═'.repeat(60));

const frontendFiles = scanDirectory('FrontEnd/src', '.jsx').concat(scanDirectory('FrontEnd/src', '.js'));
const backendFiles = scanDirectory('BackEnd', '.js');

let totalFixed = 0;
let skipped = 0;

// Frontend
console.log('\n📁 FRONTEND (.jsx/.js)\n');
let frontendFixed = 0;
frontendFiles.forEach(file => {
  if (fixFile(file)) {
    frontendFixed++;
    totalFixed++;
    process.stdout.write('.');
  }
});

if (frontendFixed === 0) {
  process.stdout.write('✓ (sem problemas)');
}

console.log(`\n   ${frontendFixed} arquivos corrigidos`);

// Backend
console.log('\n📁 BACKEND (.js)\n');
let backendFixed = 0;
backendFiles.forEach(file => {
  if (fixFile(file)) {
    backendFixed++;
    totalFixed++;
    process.stdout.write('.');
  }
});

if (backendFixed === 0) {
  process.stdout.write('✓ (sem problemas)');
}

console.log(`\n   ${backendFixed} arquivos corrigidos`);

console.log('\n' + '═'.repeat(60));
console.log(`\n✅ TOTAL: ${totalFixed} arquivos corrigidos\n`);
