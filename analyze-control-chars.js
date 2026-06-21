import fs from 'fs';
import path from 'path';

// Analisar especificamente caracteres Unicode problemáticos
function analyzeControlCharacters(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const content = buffer.toString('utf-8');
    
    const charCounts = {};
    const suspiciousLines = [];
    
    content.split('\n').forEach((line, lineNum) => {
      let suspiciousChars = [];
      
      for (let i = 0; i < line.length; i++) {
        const code = line.charCodeAt(i);
        
        // Caracteres de controle
        if ((code >= 0x80 && code <= 0x9F) || (code >= 0x00 && code <= 0x08) || (code >= 0x0E && code <= 0x1F)) {
          suspiciousChars.push({ code: code.toString(16), char: JSON.stringify(line[i]) });
          charCounts[code] = (charCounts[code] || 0) + 1;
        }
        
        // Caracteres visualmente problemáticos
        if (code === 0xFEFF || code === 0x200B || code === 0x200C || code === 0x200D) {
          suspiciousChars.push({ code: code.toString(16), type: 'invisível' });
          charCounts[code] = (charCounts[code] || 0) + 1;
        }
      }
      
      if (suspiciousChars.length > 0 && lineNum < 50) {
        suspiciousLines.push({ line: lineNum + 1, chars: suspiciousChars });
      }
    });
    
    return {
      total: Object.values(charCounts).reduce((a, b) => a + b, 0),
      chars: charCounts,
      examples: suspiciousLines,
    };
  } catch (err) {
    return null;
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

console.log('\n🔬 ANÁLISE DETALHADA - CARACTERES DE CONTROLE OCULTOS\n');
console.log('═'.repeat(70));

const criticalFiles = [
  'FrontEnd/src/Colaborador/ColaboradorDashboard.jsx',
  'BackEnd/index.js',
  'FrontEnd/src/Administrador/BlocoQuestoesManager.jsx',
  'BackEnd/controllers/QuestoesController.js',
];

console.log('\n🔍 Analisando arquivos críticos:\n');

criticalFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  ${path.basename(filePath)} - não encontrado`);
    return;
  }
  
  const analysis = analyzeControlCharacters(filePath);
  if (!analysis) {
    console.log(`⏭️  ${path.basename(filePath)} - erro ao analisar`);
    return;
  }
  
  if (analysis.total > 0) {
    console.log(`📄 ${path.basename(filePath)}`);
    console.log(`   Total de caracteres suspeitos: ${analysis.total}`);
    console.log(`   Tipos encontrados:`);
    
    Object.entries(analysis.chars).forEach(([code, count]) => {
      const codeNum = parseInt(code, 16);
      let type = 'desconhecido';
      
      if (codeNum >= 0x80 && codeNum <= 0x9F) type = 'controle (80-9F)';
      else if (codeNum >= 0xC2 && codeNum <= 0xDF) type = 'multi-byte UTF-8';
      else if (codeNum === 0xFEFF) type = 'BOM (Byte Order Mark)';
      else if (codeNum === 0x200B) type = 'zero-width space';
      
      console.log(`      • 0x${code.toUpperCase()}: ${count}x (${type})`);
    });
    
    if (analysis.examples.length > 0) {
      console.log(`   Exemplos (primeiras linhas com problema):`);
      analysis.examples.slice(0, 2).forEach(ex => {
        console.log(`      └─ Linha ${ex.line}: ${ex.chars.length} caracteres suspeitos`);
      });
    }
  }
  
  console.log();
});

console.log('═'.repeat(70) + '\n');
