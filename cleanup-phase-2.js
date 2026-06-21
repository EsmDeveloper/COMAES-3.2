import fs from 'fs';
import path from 'path';

// Mapeamento de emojis para tags
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
  '🔢': '[NUMBER]',
  '✏️': '[PENCIL]',
};

// Arquivos adicionais Backend com console.log
const additionalFiles = [
  'BackEnd/controllers/ColaboradorBlocosQuestoesControllerV2.js',
  'BackEnd/controllers/CertificateController.js',
  'BackEnd/controllers/streakController.js',
  'BackEnd/certificates/generator/index.js',
  'BackEnd/check-db-status.js',
  'BackEnd/config/db.js',
  'BackEnd/models/associations.js',
];

console.log('\n=== FASE 2: Limpeza Adicional Backend ===\n');

let totalProcessed = 0;
let totalEmojisRemoved = 0;

additionalFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    return;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalLength = content.length;
    
    // Contar emojis
    let emojiCount = 0;
    Object.keys(emojiMap).forEach(emoji => {
      const regex = new RegExp(emoji.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) emojiCount += matches.length;
    });
    
    if (emojiCount === 0) {
      return;
    }
    
    // Remover apenas de console
    const lines = content.split('\n');
    const processedLines = lines.map(line => {
      if (!line.includes('console.')) {
        return line;
      }
      
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
      console.log(`[OK] ${path.basename(filePath)} - ${emojiCount} emojis`);
      totalProcessed++;
      totalEmojisRemoved += emojiCount;
    }
  } catch (err) {
    // Silenciar erros
  }
});

console.log(`\n✅ Fase 2: ${totalProcessed} arquivos, ${totalEmojisRemoved} emojis removidos\n`);
