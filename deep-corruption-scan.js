import fs from 'fs';
import path from 'path';

// Padrões de corrupção UTF-8 mais complexos (múltiplos níveis)
const ADVANCED_CORRUPTION_PATTERNS = {
  // Acentos em português
  'Ã§': 'ç',      // cedilla
  'Ã£': 'ã',      // tilde a
  'Ã¡': 'á',      // acute a
  'Ã©': 'é',      // acute e
  'Ã­': 'í',      // acute i
  'Ã³': 'ó',      // acute o
  'Ã¹': 'ú',      // acute u
  'Ã°': 'ð',      // eth
  'Ã¢': 'â',      // circumflex a
  'Ãª': 'ê',      // circumflex e
  'Ã´': 'ô',      // circumflex o
  'Â': '',        // broken char
  'Á': 'á',       // broken á
  'µ': 'ã',       // broken ã
  
  // Símbolos especiais
  'â€"': '–',     // en dash
  'â€"': '—',     // em dash
  'â€™': "'",     // right single quote
  'â€œ': '"',     // left double quote
  'â€ ':  '"',    // right double quote
  'â€¢': '*',     // bullet
  'â€¦': '...',   // ellipsis
  'â€˜': "'",     // left single quote
  
  // Acentos duplicados
  'Ã¡Â': 'á',
  'Ã©Â': 'é',
  'Ã³Â': 'ó',
  'Ã£Â': 'ã',
  'Ã§Â': 'ç',
  
  // Padrões específicos encontrados
  'AçÃµes': 'Ações',
  'operaçÃµes': 'operações',
  'posiçÃµes': 'posições',
  'questÃµes': 'questões',
  'criaçÃµes': 'criações',
  'funçÃµes': 'funções',
  'soluçÃµes': 'soluções',
  'informaçÃµes': 'informações',
  'descriçÃµes': 'descrições',
  'configuraçÃµes': 'configurações',
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
  'FrontEnd/src/Administrador/AdminDashboard.jsx',
  'FrontEnd/src/Administrador/TableManager.jsx',
  'FrontEnd/src/Administrador/BlocosColaboradoresTab.jsx',
  'FrontEnd/src/Administrador/ColaboradorBlocosQuestoesTab.jsx',
];

console.log('\n🔍 ANÁLISE PROFUNDA - PADRÕES DE CORRUPÇÃO AVANÇADOS\n');
console.log('═'.repeat(90));

let totalProblems = 0;
const detailedIssues = [];

ADMIN_FILES.forEach(file => {
  if (!fs.existsSync(file)) {
    return;
  }
  
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  const fileIssues = [];
  
  lines.forEach((line, lineNum) => {
    // Verificar cada padrão de corrupção
    for (const [corrupted, correct] of Object.entries(ADVANCED_CORRUPTION_PATTERNS)) {
      if (line.includes(corrupted) && corrupted !== correct) {
        totalProblems++;
        fileIssues.push({
          line: lineNum + 1,
          corrupted,
          correct,
          context: line.trim().substring(0, 100),
          type: getCorruptionType(corrupted)
        });
      }
    }
  });
  
  if (fileIssues.length > 0) {
    detailedIssues.push({
      file: path.basename(file),
      fullPath: file,
      issues: fileIssues
    });
  }
});

console.log(`\n📊 RESULTADOS DA ANÁLISE PROFUNDA\n`);
console.log(`Total de problemas encontrados: ${totalProblems}\n`);

if (totalProblems === 0) {
  console.log('✅ SUCESSO! Nenhuma corrupção encontrada!\n');
} else {
  detailedIssues.forEach(item => {
    console.log(`\n📄 ${item.file}`);
    console.log(`   Problemas: ${item.issues.length}`);
    
    item.issues.forEach((issue, idx) => {
      if (idx < 3) { // Mostrar apenas os 3 primeiros
        console.log(`   \n   Linha ${issue.line} [${issue.type}]`);
        console.log(`   ├─ Corrupto: "${issue.corrupted}" → Correto: "${issue.correct}"`);
        console.log(`   └─ Contexto: ${issue.context}...`);
      }
    });
    
    if (item.issues.length > 3) {
      console.log(`   \n   ... e ${item.issues.length - 3} mais problemas`);
    }
  });
}

console.log('\n' + '═'.repeat(90));
console.log(`\n📋 RESUMO\n`);
console.log(`   Arquivos analisados: ${ADMIN_FILES.length}`);
console.log(`   Arquivos com problemas: ${detailedIssues.length}`);
console.log(`   Total de problemas: ${totalProblems}\n`);

// Exportar para uso em limpeza
const summary = {
  totalProblems,
  filesWithIssues: detailedIssues.length,
  details: detailedIssues
};

console.log('═'.repeat(90) + '\n');

function getCorruptionType(corrupted) {
  if (corrupted.includes('Ã')) return 'ACCENT';
  if (corrupted.includes('â€')) return 'SYMBOL';
  if (corrupted.includes('µ')) return 'UNICODE';
  return 'UNKNOWN';
}
