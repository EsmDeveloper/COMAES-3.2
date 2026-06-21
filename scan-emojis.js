import fs from 'fs';
import path from 'path';

// Padrão de regex para encontrar caracteres Unicode que indicam emojis ou mojibakes
const patterns = {
  emojis: /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{27BF}]|[\u{2300}-\u{23FF}]|[\u{2B50}]|[\u{1F600}-\u{1F64F}]/gu,
  // Caracteres potencialmente corrompidos (acentos mal encodificados, etc)
  // Usaremos uma abordagem mais simples
};

const directories = [
  './FrontEnd/src',
  './BackEnd',
];

const extensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];

let foundEmojis = [];

function scanFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return;
    
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Buscar emojis
    const emojiMatches = content.matchAll(patterns.emojis);
    for (const match of emojiMatches) {
      const line = content.substring(0, match.index).split('\n').length;
      foundEmojis.push({
        file: filePath,
        line: line,
        char: match[0],
        code: '0x' + match[0].charCodeAt(0).toString(16).toUpperCase()
      });
    }
  } catch (err) {
    // Silenciar erros de leitura
  }
}

function walkDir(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      if (file.startsWith('.') || file === 'node_modules') continue;
      
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (extensions.some(ext => fullPath.endsWith(ext))) {
        scanFile(fullPath);
      }
    }
  } catch (err) {
    // Silenciar erros
  }
}

console.log('\n=== SCAN: Emojis Restantes ===\n');

directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    walkDir(dir);
  }
});

console.log(`\n📊 EMOJIS ENCONTRADOS: ${foundEmojis.length}`);
if (foundEmojis.length > 0) {
  const uniqueFiles = [...new Set(foundEmojis.map(e => e.file))];
  console.log(`   Arquivos afetados: ${uniqueFiles.length}\n`);
  
  uniqueFiles.forEach(file => {
    const count = foundEmojis.filter(e => e.file === file).length;
    console.log(`   ${file} (${count} emojis)`);
  });
}

console.log('\n✅ Scan concluído\n');

// Salvar relatório em JSON
const report = {
  timestamp: new Date().toISOString(),
  emojis_found: foundEmojis.length,
  emoji_files: [...new Set(foundEmojis.map(e => e.file))],
};

fs.writeFileSync('./emoji-scan-report.json', JSON.stringify(report, null, 2));
