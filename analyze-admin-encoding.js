import fs from 'fs';
import path from 'path';

// Padrões de mojibake/encoding problemáticos
const mojibakePatterns = [
  /â€™/g,      // ' corrompido
  /â€œ/g,      // " corrompido
  /â€•/g,      // " corrompido
  /â€¢/g,      // • corrompido
  /â€"/g,      // – corrompido
  /â€"/g,      // — corrompido
  /Ã©/g,       // é corrompido
  /Ã¡/g,       // á corrompido
  /Ã£/g,       // ã corrompido
  /Ã§/g,       // ç corrompido
  /Ã¢/g,       // â corrompido
  /Ã¨/g,       // è corrompido
  /Ã¬/g,       // ì corrompido
  /Ã³/g,       // ó corrompido
  /Ã´/g,       // ô corrompido
  /Ã¼/g,       // ü corrompido
  /Â/g,        // Controle Â
  /┬/g,        // Caixa corrompida
  /├/g,        // Caixa corrompida
  /°¸/g,       // Caractere estranho
  /¥/g,        // Caractere estranho
];

function scanForMojibakes(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    const issues = [];
    
    lines.forEach((line, lineNum) => {
      mojibakePatterns.forEach(pattern => {
        if (pattern.test(line)) {
          issues.push({
            line: lineNum + 1,
            content: line.substring(0, 120),
            pattern: pattern.toString(),
          });
        }
      });
    });
    
    return issues.length > 0 ? issues : null;
    
  } catch (err) {
    return null;
  }
}

const adminFiles = [
  'FrontEnd/src/Administrador/AdminDashboard.jsx',
  'FrontEnd/src/Administrador/BlocoQuestoesManager.jsx',
  'FrontEnd/src/Administrador/CertificadosTab.jsx',
  'FrontEnd/src/Administrador/QuestoesTestesTab.jsx',
  'FrontEnd/src/Administrador/QuestoesTorneiosTab.jsx',
  'FrontEnd/src/Administrador/index.jsx',
];

console.log('\n🔍 ANÁLISE DE ENCODING - PAINEL DE ADMIN\n');
console.log('═'.repeat(60));

let totalIssues = 0;
const filesWithIssues = [];

adminFiles.forEach(filePath => {
  const issues = scanForMojibakes(filePath);
  
  if (issues) {
    filesWithIssues.push(filePath);
    console.log(`\n⚠️  ${path.basename(filePath)}`);
    console.log(`   Problemas encontrados: ${issues.length}`);
    
    issues.slice(0, 3).forEach(issue => {
      console.log(`   └─ Linha ${issue.line}: ${issue.content.substring(0, 80)}`);
    });
    
    if (issues.length > 3) {
      console.log(`   └─ ... e ${issues.length - 3} mais`);
    }
    
    totalIssues += issues.length;
  }
});

console.log('\n' + '═'.repeat(60));
console.log(`\n📊 RESUMO:`);
console.log(`   Arquivos com problemas: ${filesWithIssues.length}`);
console.log(`   Total de problemas encontrados: ${totalIssues}`);

if (filesWithIssues.length > 0) {
  console.log(`\n🔧 Arquivos a corrigir:`);
  filesWithIssues.forEach(f => console.log(`   • ${path.basename(f)}`));
}

console.log('\n');
