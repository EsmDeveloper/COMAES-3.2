import fs from 'fs';
import path from 'path';

// Padrões de problemas em português
const PORTUGUESE_ISSUES = [
  // Acentos corrompidos
  { pattern: /Ã£/g, name: 'ã corrompido', example: 'Ã£o → ão' },
  { pattern: /Ã©/g, name: 'é corrompido', example: 'Ã© → é' },
  { pattern: /Á\w*/g, name: 'Á maiúsculo corrompido', example: 'Á → A' },
  { pattern: /Ã¡/g, name: 'á corrompido', example: 'Ã¡ → á' },
  { pattern: /Ã§/g, name: 'ç corrompido', example: 'Ã§ → ç' },
  { pattern: /Ã³/g, name: 'ó corrompido', example: 'Ã³ → ó' },
  { pattern: /Ã²/g, name: 'ò corrompido', example: 'Ã² → ò' },
  { pattern: /Ã´/g, name: 'ô corrompido', example: 'Ã´ → ô' },
  { pattern: /Ã‰/g, name: 'É maiúsculo corrompido', example: 'Ã‰ → É' },
  { pattern: /Ã«/g, name: 'ë corrompido', example: 'Ã« → ë' },
  
  // Palavras comuns portuguesas com problemas
  { pattern: /configura.*o/gi, name: 'configuração (pode estar corrompida)' },
  { pattern: /fun.*o/gi, name: 'função (pode estar corrompida)' },
  { pattern: /informa.*o/gi, name: 'informação (pode estar corrompida)' },
  { pattern: /sa.*da/gi, name: 'saída (pode estar corrompida)' },
  { pattern: /entrada/gi, name: 'entrada' },
  
  // Emojis corrompidos (não-imprimíveis)
  { pattern: /ƒ/g, name: 'emoji corrompido ƒ', example: 'ƒ' },
  { pattern: /Ô/g, name: 'emoji corrompido Ô', example: 'Ô' },
  { pattern: /Ö/g, name: 'emoji corrompido Ö', example: 'Ö' },
  { pattern: /°/g, name: 'grau corrompido °', example: '°' },
  { pattern: /[\\u0080-\\u009F]/g, name: 'caractere de controle' },
];

// Emojis válidos para esta plataforma
const VALID_EMOJIS = [
  '💻', '⚡', '🚀', '🧮', '📐', '🔢', '🌍', '⭐', '🦉', '🐣', '📚',
  '✏️', '🎯', '🏅', '🔬', '🌟', '👑', '🔥', '✅', '❌', '⚠️', '🎓',
  '📊', '🎓', '🏆', '🥇', '🥈', '🥉', '💎', '🎊', '🎉',
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

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const issues = [];
    
    lines.forEach((line, lineNum) => {
      PORTUGUESE_ISSUES.forEach(({ pattern, name }) => {
        const matches = line.match(pattern);
        if (matches && !line.includes('//') && !line.includes('*')) {
          issues.push({
            line: lineNum + 1,
            type: name,
            content: line.trim().substring(0, 100),
            matches: matches.length,
          });
        }
      });
    });
    
    return issues.length > 0 ? issues : null;
  } catch (err) {
    return null;
  }
}

console.log('\n🔍 ANÁLISE PROFUNDA - PORTUGUÊS E EMOJIS\n');
console.log('═'.repeat(70));

const frontendFiles = scanDirectory('FrontEnd/src', '.jsx').concat(scanDirectory('FrontEnd/src', '.js'));
const backendFiles = scanDirectory('BackEnd', '.js');

let issuesFound = {};
let fileCount = 0;

console.log('\n📁 FRONTEND - Analisando...\n');

frontendFiles.forEach(file => {
  const issues = analyzeFile(file);
  if (issues) {
    const relPath = file.replace(/\\/g, '/');
    issuesFound[relPath] = issues;
    fileCount++;
    
    process.stdout.write('.');
    if (fileCount % 50 === 0) console.log(` (${fileCount})`);
  }
});

console.log('\n\n📁 BACKEND - Analisando...\n');

backendFiles.forEach(file => {
  const issues = analyzeFile(file);
  if (issues) {
    const relPath = file.replace(/\\/g, '/');
    issuesFound[relPath] = issues;
    fileCount++;
    
    process.stdout.write('.');
  }
});

console.log('\n\n' + '═'.repeat(70));
console.log(`\n📊 RESULTADOS DA ANÁLISE:\n`);
console.log(`Total de arquivos com problemas: ${fileCount}`);
console.log(`\n⚠️  Problemas encontrados:\n`);

const sortedFiles = Object.entries(issuesFound).sort((a, b) => b[1].length - a[1].length);

sortedFiles.slice(0, 15).forEach(([file, issues]) => {
  console.log(`\n📄 ${path.basename(file)}`);
  console.log(`   Problemas: ${issues.length}`);
  
  // Agrupar por tipo
  const byType = {};
  issues.forEach(issue => {
    byType[issue.type] = (byType[issue.type] || 0) + 1;
  });
  
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`   • ${type}: ${count}x`);
  });
  
  // Mostrar primeira linha com problema
  if (issues.length > 0) {
    console.log(`   └─ Exemplo (linha ${issues[0].line}): "${issues[0].content.substring(0, 60)}"`);
  }
});

if (sortedFiles.length > 15) {
  console.log(`\n   ... e ${sortedFiles.length - 15} mais arquivos com problemas`);
}

console.log('\n' + '═'.repeat(70) + '\n');
