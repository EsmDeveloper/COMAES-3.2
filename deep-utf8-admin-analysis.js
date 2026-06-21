import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Padrões de UTF-8 corrompido
const CORRUPTION_PATTERNS = {
  'Ã§': 'ç', // c cedilla
  'Ã£': 'ã', // a tilde
  'Ã¡': 'á', // a acute
  'Ã©': 'é', // e acute
  'Ã­': 'í', // i acute
  'Ã³': 'ó', // o acute
  'Ã¹': 'ú', // u acute
  'Ã±': 'ñ', // n tilde
  'Â': '', // broken char
  'ÔÇó': '•', // bullet
  'ÔÇÇ': '"', // quote
  'ÔÇÖ': '"', // quote
  'ÔÇØ': '"', // quote
  'Ôöé': '→', // arrow
  'ÔÇî': '-', // dash
  'ÔÇô': '-', // dash
  'Á': 'á', // Á alone might be corrupted
  'µ': 'ã', // context-specific
};

// Emojis que devem ser removidos/substituídos
const EMOJI_PATTERNS = {
  '✅': '[CHECK]',
  '❌': '[CROSS]',
  '📋': '[DOC]',
  '🏅': '[MEDAL]',
  '🥇': '[GOLD]',
  '🥈': '[SILVER]',
  '🥉': '[BRONZE]',
  '⭐': '[STAR]',
  '💻': '[CODE]',
  '🚀': '[ROCKET]',
  '🎯': '[TARGET]',
  '✏️': '[PENCIL]',
  '📊': '[CHART]',
  '📈': '[GRAPH]',
};

const ADMIN_FILES = [
  'FrontEnd/src/Administrador/BlocoQuestoesManager.jsx',
  'FrontEnd/src/Administrador/CertificadosTab.jsx',
  'FrontEnd/src/Administrador/QuestoesTestesTab.jsx',
  'FrontEnd/src/Administrador/QuestoesTorneiosTab.jsx',
  'FrontEnd/src/Administrador/QuestoesManager.jsx',
  'FrontEnd/src/Administrador/TorneiosTab.jsx',
  'FrontEnd/src/Administrador/ColaboradoresTab.jsx',
  'FrontEnd/src/Administrador/NotificationsTab.jsx',
  'FrontEnd/src/Administrador/DisciplinasAdmin.jsx',
  'FrontEnd/src/Administrador/EditQuestaoForm.jsx',
  'FrontEnd/src/Administrador/CreateQuestaoForm.jsx',
  'FrontEnd/src/Administrador/AprovarQuestões.jsx',
  'FrontEnd/src/Administrador/QuestoesPendentesTab.jsx',
];

console.log('\n🔍 ANÁLISE PROFUNDA UTF-8 + EMOJIS - ADMIN PANEL\n');
console.log('═'.repeat(80));

let totalProblems = 0;
let filesWithProblems = 0;
const problemsList = [];

ADMIN_FILES.forEach(file => {
  if (!fs.existsSync(file)) {
    return;
  }
  
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  let fileProblems = 0;
  const fileIssues = [];
  
  lines.forEach((line, lineNum) => {
    // Verificar caracteres corrompidos
    for (const [corrupted, correct] of Object.entries(CORRUPTION_PATTERNS)) {
      if (line.includes(corrupted) && corrupted !== correct) {
        fileProblems++;
        totalProblems++;
        fileIssues.push({
          type: 'UTF-8 CORRUPTED',
          line: lineNum + 1,
          corrupted,
          correct,
          content: line.substring(0, 80)
        });
      }
    }
    
    // Verificar emojis
    for (const emoji of Object.keys(EMOJI_PATTERNS)) {
      if (line.includes(emoji)) {
        fileProblems++;
        totalProblems++;
        fileIssues.push({
          type: 'EMOJI FOUND',
          line: lineNum + 1,
          emoji,
          content: line.substring(0, 80)
        });
      }
    }
  });
  
  if (fileProblems > 0) {
    filesWithProblems++;
    problemsList.push({
      file: path.basename(file),
      problems: fileProblems,
      issues: fileIssues
    });
    
    console.log(`\n📄 ${path.basename(file)}`);
    console.log(`   Problemas encontrados: ${fileProblems}`);
    fileIssues.slice(0, 5).forEach(issue => {
      console.log(`   • Linha ${issue.line}: ${issue.type}`);
      if (issue.corrupted) console.log(`     Corrupted: "${issue.corrupted}" → "${issue.correct}"`);
      if (issue.emoji) console.log(`     Emoji: ${issue.emoji}`);
    });
    if (fileIssues.length > 5) {
      console.log(`   ... e ${fileIssues.length - 5} mais problemas`);
    }
  }
});

console.log('\n' + '═'.repeat(80));
console.log(`\n📊 RESUMO ANÁLISE UTF-8 + EMOJIS\n`);
console.log(`   Arquivos analisados: ${ADMIN_FILES.length}`);
console.log(`   Arquivos com problemas: ${filesWithProblems}`);
console.log(`   Total de problemas: ${totalProblems}`);

if (totalProblems === 0) {
  console.log(`\n✅ SUCESSO! Nenhum problema UTF-8 ou emoji encontrado no Admin Panel`);
} else {
  console.log(`\n⚠️  ATENÇÃO! ${totalProblems} problemas detectados`);
  console.log(`\nProblemas por arquivo:`);
  problemsList.forEach(item => {
    console.log(`   • ${item.file}: ${item.problems} problemas`);
  });
}

console.log('\n' + '═'.repeat(80) + '\n');
