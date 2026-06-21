import fs from 'fs';
import path from 'path';

const adminFiles = [
  'FrontEnd/src/Administrador/BlocoQuestoesManager.jsx',
  'FrontEnd/src/Administrador/CertificadosTab.jsx',
  'FrontEnd/src/Administrador/QuestoesTestesTab.jsx',
  'FrontEnd/src/Administrador/QuestoesTorneiosTab.jsx',
];

console.log('\n🔧 CORRIGINDO ENCODING - PAINEL DE ADMIN\n');

const replacements = [
  { from: /Ã©/g, to: 'é' },
  { from: /Ã¡/g, to: 'á' },
  { from: /Ã£/g, to: 'ã' },
  { from: /Ã§/g, to: 'ç' },
  { from: /Ã¢/g, to: 'â' },
  { from: /Ã¨/g, to: 'è' },
  { from: /Ã¬/g, to: 'í' },
  { from: /Ã³/g, to: 'ó' },
  { from: /Ã´/g, to: 'ô' },
  { from: /Ã¼/g, to: 'ü' },
  { from: /Ã¡/g, to: 'á' },
  { from: /Ã/g, to: 'Á' },
  { from: /â€™/g, to: "'" },
  { from: /â€œ/g, to: '"' },
  { from: /â€•/g, to: '"' },
  { from: /â€¢/g, to: '•' },
  { from: /â€"/g, to: '–' },
  { from: /â€"/g, to: '—' },
  { from: /Â/g, to: '' },
  { from: /ð/g, to: '🏅' },
  { from: /ï¸/g, to: '' },
  { from: /┬/g, to: '' },
  { from: /├/g, to: '' },
  { from: /°¸/g, to: '' },
  { from: /¥/g, to: '' },
];

let totalFixed = 0;

adminFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  ${path.basename(filePath)} - não encontrado`);
    return;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    // Aplicar todas as correções
    replacements.forEach(({ from, to }) => {
      content = content.replace(from, to);
    });
    
    // Remover caracteres de controle incomuns
    content = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      const changes = originalContent.length - content.length;
      console.log(`✅ ${path.basename(filePath)} - ${changes} caracteres corrompidos removidos`);
      totalFixed++;
    } else {
      console.log(`✓  ${path.basename(filePath)} - sem problemas detectados`);
    }
    
  } catch (err) {
    console.log(`⚠️  ${path.basename(filePath)} - ${err.message}`);
  }
});

console.log(`\n✅ ${totalFixed} arquivos corrigidos\n`);
