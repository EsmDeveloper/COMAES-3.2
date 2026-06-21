import fs from 'fs';
import path from 'path';

// Mapeamento de acentos corrompidos em português
const ACCENT_CORRECTIONS = [
  { from: /Ã£/g, to: 'ã', desc: 'ã corrompido' },
  { from: /Ã©/g, to: 'é', desc: 'é corrompido' },
  { from: /Ã¡/g, to: 'á', desc: 'á corrompido' },
  { from: /Ã§/g, to: 'ç', desc: 'ç corrompido' },
  { from: /Ã¢/g, to: 'â', desc: 'â corrompido' },
  { from: /Ã³/g, to: 'ó', desc: 'ó corrompido' },
  { from: /Ã²/g, to: 'ò', desc: 'ò corrompido' },
  { from: /Ã´/g, to: 'ô', desc: 'ô corrompido' },
  { from: /Ã‰/g, to: 'É', desc: 'É maiúsculo corrompido' },
  { from: /Ã/g, to: 'Á', desc: 'Á maiúsculo corrompido' },
  { from: /Ã§/g, to: 'ç', desc: 'ç corrompido' },
  { from: /Ã«/g, to: 'ë', desc: 'ë corrompido' },
  { from: /Ã­/g, to: 'í', desc: 'í corrompido' },
  { from: /Ã¼/g, to: 'ü', desc: 'ü corrompido' },
  { from: /â€™/g, to: "'", desc: "apóstrofo corrompido" },
  { from: /â€œ/g, to: '"', desc: "aspas corrompidas" },
  { from: /â€"/g, to: '–', desc: "travessão corrompido" },
  { from: /Â /g, to: ' ', desc: "espaço corrompido" },
  { from: /Â/g, to: '', desc: "Â isolado (remover)" },
];

// Emojis válidos
const VALID_EMOJIS = new Set([
  '💻', '⚡', '🚀', '🧮', '📐', '🔢', '🌍', '⭐', '🦉', '🐣', '📚', 
  '✏️', '🎯', '🏅', '🔬', '🌟', '👑', '🔥', '✅', '❌', '⚠️',
  '🎊', '🎉', '🏆', '🥇', '🥈', '🥉', '📊', '💎', '🎓',
]);

function cleanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalLength = content.length;
    
    // Aplicar correções de acentos
    ACCENT_CORRECTIONS.forEach(({ from, to }) => {
      content = content.replace(from, to);
    });
    
    if (content.length !== originalLength) {
      fs.writeFileSync(filePath, content, 'utf-8');
      return { fixed: true, removed: originalLength - content.length };
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

console.log('\n🔤 CORREÇÃO DE ACENTOS PORTUGUESES CORROMPIDOS\n');
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

console.log(`\n   ${frontendFixed} arquivos corrigidos`);

console.log('\n📁 BACKEND\n');

backendFiles.forEach(file => {
  const result = cleanFile(file);
  if (result.fixed) {
    backendFixed++;
    totalRemoved += result.removed;
    process.stdout.write('.');
  }
});

console.log(`\n   ${backendFixed} arquivos corrigidos`);

console.log('\n' + '═'.repeat(70));
console.log(`\n✅ RESUMO:`);
console.log(`   Frontend: ${frontendFixed} arquivos`);
console.log(`   Backend: ${backendFixed} arquivos`);
console.log(`   Total: ${frontendFixed + backendFixed} arquivos`);
console.log(`   Caracteres corrigidos: ${totalRemoved}\n`);
