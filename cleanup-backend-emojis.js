// Script para remover emojis dos arquivos Backend
import fs from 'fs';

const files = [
  './BackEnd/apply_migrations_v2.js',
  './BackEnd/apply_migrations.js',
  './BackEnd/apply_migration_types.js',
  './BackEnd/check-admin-password.js',
  './BackEnd/check_schema.js',
  './BackEnd/check-recent.js',
  './BackEnd/check-db.js',
  './BackEnd/add_slug.js'
];

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
};

console.log('\n=== Cleanup Backend Emojis ===\n');

let processedCount = 0;

files.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf-8');
      const originalLength = content.length;
      
      // Substituir cada emoji
      Object.keys(emojiMap).forEach(emoji => {
        const regex = new RegExp(emoji.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'g');
        content = content.replace(regex, emojiMap[emoji]);
      });
      
      // Verificar se houve mudanças
      if (content.length !== originalLength) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`[OK] ${filePath}`);
        processedCount++;
      } else {
        console.log(`[SKIP] ${filePath}`);
      }
    } else {
      console.log(`[NOT FOUND] ${filePath}`);
    }
  } catch (err) {
    console.log(`[ERROR] ${filePath} - ${err.message}`);
  }
});

console.log(`\nProcessados: ${processedCount} arquivos`);
console.log('Status: Completo\n');
