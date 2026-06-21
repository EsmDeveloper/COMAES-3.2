import fs from 'fs';
import path from 'path';

// Padrão de regex para encontrar emojis
const emojiPattern = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{27BF}]|[\u{2300}-\u{23FF}]|[\u{2B50}]|[\u{1F600}-\u{1F64F}]/gu;

const files = [
  'FrontEnd/src/certificados/CertProgramacao.jsx',
  'FrontEnd/src/certificados/CertMatematica.jsx',
  'FrontEnd/src/certificados/CertIngles.jsx',
  'FrontEnd/src/components/NivelBadge.jsx',
  'FrontEnd/src/utils/iconMapper.js',
  'BackEnd/index.js',
  'BackEnd/controllers/QuestoesController.js',
];

console.log('\n=== ANÁLISE DE EMOJIS POR CONTEXTO ===\n');

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`[SKIP] ${filePath} - não encontrado`);
    return;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    let dataStructures = [];
    let consoleLogging = [];
    let stringMessages = [];
    
    lines.forEach((line, idx) => {
      const matches = [...line.matchAll(emojiPattern)];
      if (matches.length === 0) return;
      
      const lineNum = idx + 1;
      
      if (line.includes('console.log') || line.includes('console.error') || line.includes('console.warn')) {
        consoleLogging.push({ line: lineNum, content: line.trim().substring(0, 80) });
      } else if (line.includes('icone') || line.includes('emoji') || line.includes('icon') || line.includes('medal')) {
        dataStructures.push({ line: lineNum, content: line.trim().substring(0, 80) });
      } else {
        stringMessages.push({ line: lineNum, content: line.trim().substring(0, 80) });
      }
    });
    
    console.log(`📄 ${path.basename(filePath)}`);
    console.log(`   Data Structures: ${dataStructures.length}`);
    console.log(`   Console Logging: ${consoleLogging.length}`);
    console.log(`   String Messages: ${stringMessages.length}`);
    console.log('');
    
  } catch (err) {
    console.log(`[ERROR] ${filePath} - ${err.message}`);
  }
});

console.log('✅ Análise concluída\n');
