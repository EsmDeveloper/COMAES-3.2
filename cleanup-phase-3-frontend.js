import fs from 'fs';
import path from 'path';

// Mapeamento
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

// Arquivos Frontend para limpeza (excluindo iconMapper.js que é mapping)
const frontendFiles = [
  'FrontEnd/src/Administrador/components/TournamentForm.jsx',
  'FrontEnd/src/Colaborador/ColaboradorDashboard.jsx',
  'FrontEnd/src/components/ModalVencedores.jsx',
  'FrontEnd/src/Paginas/Secundarias/Certificacoes.jsx',
  'FrontEnd/src/Paginas/Secundarias/Perfil.jsx',
  'FrontEnd/src/Paginas/Primarias/AuthContainer.jsx',
  'FrontEnd/src/components/WaitingScreen.jsx',
];

console.log('\n=== FASE 3: Limpeza Frontend ===\n');

let totalProcessed = 0;
let totalEmojisRemoved = 0;

frontendFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    return;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalLength = content.length;
    
    // Contar emojis que NÃO estão em objetos data
    let emojiCount = 0;
    const lines = content.split('\n');
    
    let inDataStructure = false;
    const processedLines = lines.map((line, idx) => {
      // Detectar início/fim de estruturas de dados
      if (line.match(/\s*(\w+):\s*\{|const.*=\s*\{|const.*=\s*\[/)) {
        inDataStructure = true;
      }
      if (inDataStructure && line.includes('};')) {
        inDataStructure = false;
      }
      
      // Se estamos em data structure, não remover emojis
      if (inDataStructure) {
        return line;
      }
      
      // Contar e remover de linhas não-data
      let modified = line;
      let removedCount = 0;
      
      Object.keys(emojiMap).forEach(emoji => {
        const regex = new RegExp(emoji.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'g');
        const matches = line.match(regex);
        if (matches) {
          removedCount += matches.length;
        }
        modified = modified.replace(regex, emojiMap[emoji]);
      });
      
      emojiCount += removedCount;
      return modified;
    });
    
    const newContent = processedLines.join('\n');
    
    if (newContent.length !== originalLength && emojiCount > 0) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log(`[OK] ${path.basename(filePath)} - ${emojiCount} emojis`);
      totalProcessed++;
      totalEmojisRemoved += emojiCount;
    }
  } catch (err) {
    // Silenciar erros
  }
});

console.log(`\n✅ Fase 3: ${totalProcessed} arquivos, ${totalEmojisRemoved} emojis removidos\n`);
