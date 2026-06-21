import fs from 'fs';
import path from 'path';

// Padrões mais agressivos de mojibakes
const aggressiveReplacements = [
  // Sequências de 2+ caracteres corrompidos
  { from: /├º├ú/g, to: 'ão' },
  { from: /├º/g, to: 'ã' },
  { from: /├ú/g, to: 'ú' },
  { from: /├Á/g, to: 'á' },
  { from: /├í/g, to: 'í' },
  { from: /├ì/g, to: 'ì' },
  { from: /├¡/g, to: '¡' },
  
  // Emoji corrompidos comuns
  { from: /ƒöù/g, to: '' },  // Emoji corrompido
  { from: /ƒø/g, to: '' },   // Emoji corrompido
  { from: /ƒæ/g, to: '' },   // Emoji corrompido
  { from: /ƒô/g, to: '' },   // Emoji corrompido
  { from: /ƒ/g, to: '' },    // Caractere de controle
  
  // Outros corrompidos
  { from: /ÔÜÖ´©Å/g, to: '' },
  { from: /Ô/g, to: '' },
  { from: /Ö´/g, to: '' },
  { from: /´©Å/g, to: '' },
  
  // Boxes/Unicode inválido
  { from: /┬/g, to: '' },
  { from: /├/g, to: '' },
  { from: /┤/g, to: '' },
  { from: /└/g, to: '' },
  { from: /┘/g, to: '' },
  { from: /┴/g, to: '' },
  { from: /┬/g, to: '' },
  
  // Outros padrões comuns
  { from: /Ã©/g, to: 'é' },
  { from: /Ã¡/g, to: 'á' },
  { from: /Ã£/g, to: 'ã' },
  { from: /Ã§/g, to: 'ç' },
  { from: /Ã¢/g, to: 'â' },
  { from: /Ã¸/g, to: 'ø' },
  { from: /Ã¼/g, to: 'ü' },
  { from: /Ã³/g, to: 'ó' },
];

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

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalLength = content.length;
    
    // Aplicar todas as substituições
    aggressiveReplacements.forEach(({ from, to }) => {
      content = content.replace(from, to);
    });
    
    // Remover qualquer sequência estranha de 3+ caracteres especiais seguidos
    content = content.replace(/[^a-zA-Z0-9\s\n\t\r.,;:(){}[\]"'éàáâãäèéêëìíîïòóôõöùúûüýÿçñ\-_/\\\<\>=\&\|\*\+\%\$\#\@\!\?\`\~^]{3,}/g, '');
    
    // Remover caracteres de controle
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

console.log('\n🧹 LIMPEZA RADICAL - CARACTERES ESPECIAIS RESIDUAIS\n');
console.log('═'.repeat(60));

const frontendFiles = scanDirectory('FrontEnd/src', '.jsx').concat(scanDirectory('FrontEnd/src', '.js'));
const backendFiles = scanDirectory('BackEnd', '.js');

let totalFixed = 0;

console.log('\n📁 FRONTEND\n');
let frontendFixed = 0;
let processed = 0;

frontendFiles.forEach(file => {
  processed++;
  if (fixFile(file)) {
    frontendFixed++;
    totalFixed++;
    if (frontendFixed % 10 === 0) {
      console.log(`   ${frontendFixed}...`);
    } else {
      process.stdout.write('.');
    }
  }
});

console.log(`\n   ${frontendFixed}/${processed} arquivos corrigidos`);

console.log('\n📁 BACKEND\n');
let backendFixed = 0;
processed = 0;

backendFiles.forEach(file => {
  processed++;
  if (fixFile(file)) {
    backendFixed++;
    totalFixed++;
    process.stdout.write('.');
  }
});

console.log(`\n   ${backendFixed}/${processed} arquivos corrigidos`);

console.log('\n' + '═'.repeat(60));
console.log(`\n✅ TOTAL: ${totalFixed} arquivos corrigidos com limpeza radical\n`);
