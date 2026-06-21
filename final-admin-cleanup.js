import fs from 'fs';
import path from 'path';

const FILES_TO_CLEAN = {
  'FrontEnd/src/Administrador/BlocoQuestoesManager.jsx': [
    { line: 592, pattern: /console\.log\(`🏅 Blocos extraÁdos:`, blocosBackend\);/, replacement: "console.log('[MEDAL] Blocos extraídos:', blocosBackend);" }
  ],
  'FrontEnd/src/Administrador/QuestoesTestesTab.jsx': [
    { line: 29, pattern: /console\.log\('🏅 Recarregando questÁµes individuais\.\.\.'\);/, replacement: "console.log('[MEDAL] Recarregando questões individuais...');" },
    { line: 59, pattern: /console\.log\('🏅 Total de questÁµes carregadas:', questoes\.length\);/, replacement: "console.log('[MEDAL] Total de questões carregadas:', questoes.length);" }
  ],
  'FrontEnd/src/Administrador/QuestoesTorneiosTab.jsx': [
    { line: 27, pattern: /console\.log\('🏅 Recarregando questÁµes individuais\.\.\.'\);/, replacement: "console.log('[MEDAL] Recarregando questões individuais...');" }
  ],
  'FrontEnd/src/Administrador/CertificadosTab.jsx': [
    // STATUS_CONFIG
    { line: 29, pattern: /icon: '🏅',/, replacement: "icon: '[MEDAL]'," },
    // MEDAL_CONFIG
    { line: 44, pattern: /1: \{ label: '🏅 Ouro',/, replacement: "1: { label: '[GOLD] Ouro'," },
    { line: 45, pattern: /2: \{ label: '🏅 Prata',/, replacement: "2: { label: '[SILVER] Prata'," },
    { line: 46, pattern: /3: \{ label: '🏅 Bronze',/, replacement: "3: { label: '[BRONZE] Bronze'," },
    // OPTIONS
    { line: 257, pattern: /<option value="1">🥇 1º Lugar<\/option>/, replacement: '<option value="1">[GOLD-MEDAL] 1º Lugar</option>' },
    { line: 258, pattern: /<option value="2">🥈 2º Lugar<\/option>/, replacement: '<option value="2">[SILVER-MEDAL] 2º Lugar</option>' },
    { line: 259, pattern: /<option value="3">🥉 3º Lugar<\/option>/, replacement: '<option value="3">[BRONZE-MEDAL] 3º Lugar</option>' }
  ]
};

console.log('\n🧹 LIMPEZA FINAL - EMOJIS RESIDUAIS NO ADMIN\n');
console.log('═'.repeat(80));

let totalFixed = 0;
let totalAttempts = 0;

Object.entries(FILES_TO_CLEAN).forEach(([file, replacements]) => {
  if (!fs.existsSync(file)) {
    console.log(`\n⏭️  ${path.basename(file)} - não encontrado`);
    return;
  }
  
  console.log(`\n📝 ${path.basename(file)}`);
  let content = fs.readFileSync(file, 'utf-8');
  let fileFixed = 0;
  
  replacements.forEach(({ line, pattern, replacement }) => {
    totalAttempts++;
    
    // Tentar match exato com padrão
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      fileFixed++;
      totalFixed++;
      console.log(`   ✅ Linha ${line}: substituição bem-sucedida`);
    } else {
      // Fallback: remover qualquer emoji nessa linha
      const lines = content.split('\n');
      if (lines[line - 1] && lines[line - 1].includes('🏅') || 
          lines[line - 1].includes('🥇') || 
          lines[line - 1].includes('🥈') || 
          lines[line - 1].includes('🥉') ||
          lines[line - 1].includes('📋') ||
          lines[line - 1].includes('✅') ||
          lines[line - 1].includes('❌')) {
        // Remove emoji characters
        lines[line - 1] = lines[line - 1]
          .replace(/🏅/g, '[MEDAL]')
          .replace(/🥇/g, '[GOLD]')
          .replace(/🥈/g, '[SILVER]')
          .replace(/🥉/g, '[BRONZE]')
          .replace(/📋/g, '[DOC]')
          .replace(/✅/g, '[CHECK]')
          .replace(/❌/g, '[CROSS]');
        content = lines.join('\n');
        fileFixed++;
        totalFixed++;
        console.log(`   ✅ Linha ${line}: fallback executado (emoji removido)`);
      } else {
        console.log(`   ⚠️  Linha ${line}: padrão não encontrado`);
      }
    }
  });
  
  if (fileFixed > 0) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`   → ${fileFixed} linhas processadas`);
  }
});

console.log('\n' + '═'.repeat(80));
console.log(`\n✅ RESUMO: ${totalFixed}/${totalAttempts} substituições realizadas\n`);
