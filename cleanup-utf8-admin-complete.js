import fs from 'fs';
import path from 'path';

// Mapeamento de corrupções UTF-8
const UTF8_FIXES = {
  'Á': 'á', // Á maiúsculo → á minúsculo
  'µ': 'ã', // µ → ã
  'Ã§': 'ç',
  'Ã£': 'ã',
  'Ã¡': 'á',
  'Ã©': 'é',
  'Ã­': 'í',
  'Ã³': 'ó',
  'Ã¹': 'ú',
  'Ã±': 'ñ',
  'Â': '',
};

// Mapeamento de emojis → tags
const EMOJI_FIXES = {
  '✅': '[CHECK]',
  '❌': '[CROSS]',
  '📋': '[DOC]',
  '🏅': '[MEDAL]',
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

console.log('\n🧹 LIMPEZA COMPLETA UTF-8 + EMOJIS - ADMIN PANEL\n');
console.log('═'.repeat(80));

let totalFixed = 0;
let filesFixed = 0;

ADMIN_FILES.forEach(file => {
  if (!fs.existsSync(file)) {
    return;
  }
  
  let content = fs.readFileSync(file, 'utf-8');
  const originalLength = content.length;
  let fileFixed = 0;
  
  // Aplicar todas as correções UTF-8
  for (const [corrupted, correct] of Object.entries(UTF8_FIXES)) {
    if (content.includes(corrupted)) {
      const regex = new RegExp(corrupted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      content = content.replace(regex, correct);
      fileFixed++;
      totalFixed++;
    }
  }
  
  // Aplicar todas as correções de emoji
  for (const [emoji, tag] of Object.entries(EMOJI_FIXES)) {
    if (content.includes(emoji)) {
      content = content.replace(new RegExp(emoji, 'g'), tag);
      fileFixed++;
      totalFixed++;
    }
  }
  
  if (fileFixed > 0) {
    fs.writeFileSync(file, content, 'utf-8');
    filesFixed++;
    const charDiff = originalLength - content.length;
    console.log(`✅ ${path.basename(file)}: ${fileFixed} correções (${charDiff} bytes economizados)`);
  }
});

console.log('\n' + '═'.repeat(80));
console.log(`\n✅ RESUMO LIMPEZA\n`);
console.log(`   Arquivos corrigidos: ${filesFixed}`);
console.log(`   Total de correções: ${totalFixed}`);
console.log(`   Caracteres corrompidos removidos: ~${totalFixed * 2}`);

console.log('\n' + '═'.repeat(80) + '\n');
