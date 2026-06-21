import fs from 'fs';
import path from 'path';

// Padrões de mojibake e encoding problemático
const PROBLEMATIC_PATTERNS = [
  { pattern: /Ã©/g, name: 'é corrompido', type: 'accent' },
  { pattern: /Ã¡/g, name: 'á corrompido', type: 'accent' },
  { pattern: /Ã£/g, name: 'ã corrompido', type: 'accent' },
  { pattern: /Ã§/g, name: 'ç corrompido', type: 'accent' },
  { pattern: /Ã¢/g, name: 'â corrompido', type: 'accent' },
  { pattern: /Ã³/g, name: 'ó corrompido', type: 'accent' },
  { pattern: /Ã´/g, name: 'ô corrompido', type: 'accent' },
  { pattern: /Ã¼/g, name: 'ü corrompido', type: 'accent' },
  { pattern: /Ã‰/g, name: 'É maiúsculo corrompido', type: 'accent' },
  
  // Emojis não convertidos para React
  { pattern: /[💻⚡🚀🧮📐🔢🌍⭐🦉🐣📚✏️🎯🏅🔬🌟👑🔥]/g, name: 'emoji não convertido', type: 'emoji' },
  
  // Caracteres especiais problemáticos
  { pattern: /ƒ|Ô|Ö|├|┤|┬|├º|├ú/g, name: 'caractere especial corrompido', type: 'special' },
];

// Lista completa de arquivos Admin
const ADMIN_FILES = [
  'FrontEnd/src/Administrador/AdminDashboard.jsx',
  'FrontEnd/src/Administrador/AdminBlocosColaboradoresPendentesTab.jsx',
  'FrontEnd/src/Administrador/AdminQuestionsColaboradorPendentesTab.jsx',
  'FrontEnd/src/Administrador/AprovarQuestões.jsx',
  'FrontEnd/src/Administrador/BlocosColaboradoresTab.jsx',
  'FrontEnd/src/Administrador/BlocoQuestoesManager.jsx',
  'FrontEnd/src/Administrador/CertificadosTab.jsx',
  'FrontEnd/src/Administrador/ColaboradoresTab.jsx',
  'FrontEnd/src/Administrador/CreateQuestaoForm.jsx',
  'FrontEnd/src/Administrador/CreateQuestaoTesteForm.jsx',
  'FrontEnd/src/Administrador/DisciplinasAdmin.jsx',
  'FrontEnd/src/Administrador/EditQuestaoForm.jsx',
  'FrontEnd/src/Administrador/NotificationsTab.jsx',
  'FrontEnd/src/Administrador/QuestionsColaboradorPendentesTab.jsx',
  'FrontEnd/src/Administrador/QuestoesManager.jsx',
  'FrontEnd/src/Administrador/QuestoesPendentesTab.jsx',
  'FrontEnd/src/Administrador/QuestoesTestesTab.jsx',
  'FrontEnd/src/Administrador/QuestoesTorneiosTab.jsx',
  'FrontEnd/src/Administrador/TableManager.jsx',
  'FrontEnd/src/Administrador/TesteConhecimentoManager.jsx',
  'FrontEnd/src/Administrador/TorneiosTab.jsx',
  'FrontEnd/src/Administrador/index.jsx',
  'FrontEnd/src/Administrador/components/AtribuirColaborador.jsx',
];

function analyzeFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const issues = {};
    
    lines.forEach((line, lineNum) => {
      PROBLEMATIC_PATTERNS.forEach(({ pattern, name, type }) => {
        const matches = line.match(pattern);
        if (matches) {
          if (!issues[type]) issues[type] = [];
          issues[type].push({
            line: lineNum + 1,
            content: line.trim().substring(0, 100),
            matches: matches.length,
          });
        }
      });
    });
    
    return Object.keys(issues).length > 0 ? issues : null;
  } catch (err) {
    return null;
  }
}

console.log('\n🔬 ANÁLISE PROFUNDA - PAINEL ADMIN (PORTUGUÊS + EMOJIS)\n');
console.log('═'.repeat(80));

let totalAccentIssues = 0;
let totalEmojiIssues = 0;
let totalSpecialIssues = 0;
let filesWithProblems = [];

ADMIN_FILES.forEach(filePath => {
  const issues = analyzeFile(filePath);
  
  if (issues) {
    filesWithProblems.push({ file: filePath, issues });
    
    const accentCount = issues.accent ? issues.accent.length : 0;
    const emojiCount = issues.emoji ? issues.emoji.length : 0;
    const specialCount = issues.special ? issues.special.length : 0;
    
    totalAccentIssues += accentCount;
    totalEmojiIssues += emojiCount;
    totalSpecialIssues += specialCount;
    
    console.log(`\n📄 ${path.basename(filePath)}`);
    
    if (accentCount > 0) {
      console.log(`   ❌ Acentos corrompidos: ${accentCount}`);
      if (issues.accent[0]) {
        console.log(`      └─ Linha ${issues.accent[0].line}: "${issues.accent[0].content.substring(0, 70)}"`);
      }
    }
    
    if (emojiCount > 0) {
      console.log(`   ⚠️  Emojis não convertidos: ${emojiCount}`);
      if (issues.emoji[0]) {
        console.log(`      └─ Linha ${issues.emoji[0].line}: encontrado emoji direto em JSX`);
      }
    }
    
    if (specialCount > 0) {
      console.log(`   ⚠️  Caracteres especiais: ${specialCount}`);
    }
  }
});

console.log('\n' + '═'.repeat(80));
console.log(`\n📊 RESUMO ADMIN PANEL:\n`);
console.log(`   Arquivos analisados: ${ADMIN_FILES.length}`);
console.log(`   Arquivos com problemas: ${filesWithProblems.length}`);
console.log(`   Total de acentos corrompidos: ${totalAccentIssues}`);
console.log(`   Total de emojis não convertidos: ${totalEmojiIssues}`);
console.log(`   Total de caracteres especiais: ${totalSpecialIssues}`);

if (filesWithProblems.length === 0) {
  console.log(`\n✅ SUCESSO! Admin panel limpo\n`);
} else {
  console.log(`\n⚠️  PROBLEMAS ENCONTRADOS:\n`);
  filesWithProblems.forEach(({ file }) => {
    console.log(`   • ${path.basename(file)}`);
  });
}

console.log('\n');
