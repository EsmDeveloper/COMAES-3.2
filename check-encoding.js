import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('\n=== VERIFICAÇÃO E CORREÇÃO DE ENCODING UTF-8 ===\n');

// Padrões que indicam encoding problemático
const suspiciousPatterns = [
  /â€™/g,  // ' corrompido
  /â€œ/g,  // " corrompido
  /â€¢/g,  // • corrompido
  /â€"/g,  // – corrompido
  /â€"/g,  // — corrompido
  /â€˜/g,  // ' corrompido
  /Â/g,    // Quebra de encoding
];

const directories = ['./FrontEnd/src', './BackEnd'];
let filesWithIssues = [];

function scanForMojibakes(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      if (file.startsWith('.') || file === 'node_modules') continue;
      
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanForMojibakes(fullPath);
      } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          
          for (const pattern of suspiciousPatterns) {
            if (pattern.test(content)) {
              filesWithIssues.push({
                file: fullPath,
                issue: 'Mojibake/Encoding Issue',
              });
              break;
            }
          }
        } catch (err) {
          // Ignorar
        }
      }
    }
  } catch (err) {
    // Ignorar
  }
}

console.log('🔍 Escaneando arquivos...\n');

directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    scanForMojibakes(dir);
  }
});

if (filesWithIssues.length === 0) {
  console.log('✅ Nenhum mojibake encontrado!');
  console.log('✅ Encoding UTF-8 está correto\n');
} else {
  console.log(`⚠️  ENCONTRADOS ${filesWithIssues.length} arquivos com problemas:\n`);
  
  filesWithIssues.slice(0, 20).forEach(item => {
    console.log(`  ${path.basename(item.file)}`);
  });
  
  if (filesWithIssues.length > 20) {
    console.log(`\n  ... e mais ${filesWithIssues.length - 20} arquivos`);
  }
  
  console.log('\n💡 Dica: Se houver mojibakes, executar:\n');
  console.log('  for f in $(find . -name "*.js" -o -name "*.jsx"); do');
  console.log('    iconv -f UTF-8 -t UTF-8 -c "$f" > "$f.tmp" && mv "$f.tmp" "$f"');
  console.log('  done\n');
}

// Salvar relatório
fs.writeFileSync('./encoding-check-report.json', JSON.stringify({
  timestamp: new Date().toISOString(),
  mojibakes_found: filesWithIssues.length,
  files_with_issues: filesWithIssues.map(f => f.file),
}, null, 2));

console.log('✅ Verificação concluída\n');
