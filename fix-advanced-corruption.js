import fs from 'fs';
import path from 'path';

const CORRECTION_MAP = {
  // Acentos simples
  'Ãª': 'ê',      // InglÃªs → Inglês
  'Ã§': 'ç',      // cedilla
  'Ã£': 'ã',      // tilde a
  'Ã¡': 'á',      // acute a
  'Ã©': 'é',      // acute e
  'Ã­': 'í',      // acute i
  'Ã³': 'ó',      // acute o
  'Ã¹': 'ú',      // acute u
  'Ã´': 'ô',      // circumflex o
  'Ã¢': 'â',      // circumflex a
  'Â': '',        // broken char
  'µ': 'ã',       // broken ã
  'Á': 'á',       // broken á
  
  // Padrões compostos
  'questÃµes': 'questões',
  'funçÃµes': 'funções',
  'operaçÃµes': 'operações',
  'configuraçÃµes': 'configurações',
  'descriçÃµes': 'descrições',
  'soluçÃµes': 'soluções',
  'informaçÃµes': 'informações',
  'criaçÃµes': 'criações',
  'posiçÃµes': 'posições',
  'AçÃµes': 'Ações',
  'vÃªm': 'vêm',
  'concorrÃªncia': 'concorrência',
  'vocÃª': 'você',
  'PortuguÃªs': 'Português',
};

const ADMIN_FILES = [
  'FrontEnd/src/Administrador/QuestoesManager.jsx',
  'FrontEnd/src/Administrador/TorneiosTab.jsx',
  'FrontEnd/src/Administrador/ColaboradoresTab.jsx',
  'FrontEnd/src/Administrador/DisciplinasAdmin.jsx',
  'FrontEnd/src/Administrador/EditQuestaoForm.jsx',
  'FrontEnd/src/Administrador/CreateQuestaoForm.jsx',
  'FrontEnd/src/Administrador/AprovarQuestões.jsx',
  'FrontEnd/src/Administrador/QuestoesPendentesTab.jsx',
  'FrontEnd/src/Administrador/TableManager.jsx',
  'FrontEnd/src/Administrador/BlocosColaboradoresTab.jsx',
  'FrontEnd/src/Administrador/ColaboradorBlocosQuestoesTab.jsx',
];

console.log('\n🧹 LIMPEZA AUTOMÁTICA - CORRUPÇÕES UTF-8 AVANÇADAS\n');
console.log('═'.repeat(90));

let totalFixed = 0;
let filesFixed = 0;

ADMIN_FILES.forEach(file => {
  if (!fs.existsSync(file)) {
    return;
  }
  
  let content = fs.readFileSync(file, 'utf-8');
  const originalContent = content;
  let fileFixed = 0;
  
  // Aplicar correções (ordem importa - padrões maiores antes)
  for (const [corrupted, correct] of Object.entries(CORRECTION_MAP)) {
    if (content.includes(corrupted)) {
      // Usar regex com escape properly
      const regex = new RegExp(
        corrupted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'g'
      );
      const beforeCount = (content.match(regex) || []).length;
      content = content.replace(regex, correct);
      if (beforeCount > 0) {
        fileFixed++;
        totalFixed++;
      }
    }
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf-8');
    filesFixed++;
    console.log(`✅ ${path.basename(file)}: ${fileFixed} tipo(s) de correção aplicados`);
  }
});

console.log('\n' + '═'.repeat(90));
console.log(`\n✅ RESUMO LIMPEZA\n`);
console.log(`   Arquivos processados: ${filesFixed}`);
console.log(`   Tipos de correção: ${totalFixed}`);
console.log('\n' + '═'.repeat(90) + '\n');
