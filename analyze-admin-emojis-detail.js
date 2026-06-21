import fs from 'fs';
import path from 'path';

// Regex para encontrar emojis em contexto
const EMOJI_PATTERN = /[💻⚡🚀🧮📐🔢🌍⭐🦉🐣📚✏️🎯🏅🔬🌟👑🔥✅❌⚠️🎊🎉🏆🥇🥈🥉📊💎🎓]/g;

const FILES_TO_ANALYZE = [
  'FrontEnd/src/Administrador/BlocoQuestoesManager.jsx',
  'FrontEnd/src/Administrador/CertificadosTab.jsx',
  'FrontEnd/src/Administrador/QuestoesTestesTab.jsx',
  'FrontEnd/src/Administrador/QuestoesTorneiosTab.jsx',
];

console.log('\n🔍 ANÁLISE DETALHADA DE EMOJIS NO ADMIN\n');
console.log('═'.repeat(80));

FILES_TO_ANALYZE.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`\n⏭️  ${path.basename(filePath)} - não encontrado`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  console.log(`\n📄 ${path.basename(filePath)}`);
  console.log('─'.repeat(80));
  
  const emojiLines = [];
  
  lines.forEach((line, lineNum) => {
    const matches = line.match(EMOJI_PATTERN);
    if (matches) {
      emojiLines.push({ line: lineNum + 1, text: line.trim().substring(0, 120), emojis: matches });
    }
  });
  
  if (emojiLines.length > 0) {
    console.log(`\nEncontrados ${emojiLines.length} linhas com emojis:\n`);
    
    emojiLines.forEach(({ line, text, emojis }) => {
      console.log(`   Linha ${line}:`);
      console.log(`   └─ ${text}`);
      console.log(`   └─ Emojis: ${emojis.join(', ')}`);
      console.log();
    });
  } else {
    console.log(`\n✅ Nenhum emoji encontrado (já convertido ou não há)\n`);
  }
});

console.log('═'.repeat(80) + '\n');
