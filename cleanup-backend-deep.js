import fs from 'fs';
import path from 'path';

// Lista de arquivos Backend com muitos console.log
const backendFiles = [
  'BackEnd/index.js',
  'BackEnd/controllers/QuestoesController.js',
  'BackEnd/controllers/BlocosController.js',
  'BackEnd/controllers/TorneioController.js',
  'BackEnd/controllers/UserController.js',
  'BackEnd/certificates/generator/generateCertificado.js',
];

// Mapeamento de emojis para tags (como antes)
const emojiMap = {
  '🚀': '[ROCKET]',
  '✅': '[SUCCESS]',
  '❌': '[ERROR]',
  '⚠️': '[WARNING]',
  '📊': '[CHART]',
  '🔧': '[TOOL]',
  '🔔': '[NOTIFY]',
  '💻': '[CODE]',
  '⚡': '[ZAPPER]',
  '1️⃣': '[1]',
  '2️⃣': '[2]',
  '3️⃣': '[3]',
  'ℹ️': '[INFO]',
  '📋': '[LIST]',
  '📚': '[BOOK]',
  '💡': '[IDEA]',
  '✨': '[SPECIAL]',
  '🔄': '[REFRESH]',
  '🏅': '[MEDAL]',
  '🎉': '[CELEBRATE]',
  '🎯': '[TARGET]',
  '🌟': '[STAR]',
  '👑': '[CROWN]',
  '🔥': '[FIRE]',
  '📐': '[RULER]',
  '🧮': '[CALC]',
  '🌍': '[WORLD]',
  '🗣️': '[SPEAK]',
  '🤖': '[BOT]',
  '😊': '[HAPPY]',
  '🤔': '[THINK]',
  '👍': '[THUMBSUP]',
  '😅': '[OOPS]',
  '⏰': '[TIME]',
  '🏆': '[TROPHY]',
  '🥇': '[GOLD]',
  '🥈': '[SILVER]',
  '🥉': '[BRONZE]',
  '🐣': '[EGG]',
  '🦉': '[OWL]',
  '📐': '[RULER]',
  '🔢': '[NUMBER]',
};

console.log('\n=== LIMPEZA PROFUNDA DE EMOJIS Backend ===\n');

let totalProcessed = 0;
let totalEmojisRemoved = 0;

backendFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`[NOT FOUND] ${filePath}`);
    return;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalLength = content.length;
    
    // Contar emojis antes
    let emojiCount = 0;
    Object.keys(emojiMap).forEach(emoji => {
      const regex = new RegExp(emoji.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) emojiCount += matches.length;
    });
    
    if (emojiCount === 0) {
      console.log(`[SKIP] ${path.basename(filePath)} - sem emojis`);
      return;
    }
    
    // Remover APENAS de console.log/error/warn (não data structures)
    const lines = content.split('\n');
    const processedLines = lines.map(line => {
      if (!line.includes('console.') || line.includes('const ') || line.includes('= {')) {
        return line;
      }
      
      // Substituir emojis nessa linha de console
      let modified = line;
      Object.keys(emojiMap).forEach(emoji => {
        const regex = new RegExp(emoji.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'g');
        modified = modified.replace(regex, emojiMap[emoji]);
      });
      
      return modified;
    });
    
    content = processedLines.join('\n');
    
    if (content.length !== originalLength) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`[CLEANED] ${path.basename(filePath)} - ${emojiCount} emojis removidos`);
      totalProcessed++;
      totalEmojisRemoved += emojiCount;
    }
  } catch (err) {
    console.log(`[ERROR] ${filePath} - ${err.message}`);
  }
});

console.log(`\n✅ Processados: ${totalProcessed} arquivos`);
console.log(`   Total de emojis removidos: ${totalEmojisRemoved}`);
console.log('');
