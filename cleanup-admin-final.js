import fs from 'fs';
import path from 'path';

const FILES_TO_FIX = [
  'FrontEnd/src/Administrador/BlocoQuestoesManager.jsx',
  'FrontEnd/src/Administrador/CertificadosTab.jsx',
  'FrontEnd/src/Administrador/QuestoesTestesTab.jsx',
  'FrontEnd/src/Administrador/QuestoesTorneiosTab.jsx'
];

console.log('\n🧹 LIMPEZA PROFUNDA DE EMOJIS CORROMPIDOS + PORTUGUÊS\n');
console.log('═'.repeat(80));

let totalFixed = 0;

FILES_TO_FIX.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`\n⏭️  ${path.basename(file)} - não encontrado`);
    return;
  }
  
  console.log(`\n📝 ${path.basename(file)}`);
  let content = fs.readFileSync(file, 'utf-8');
  let fixed = 0;
  
  // 1. Limpar TODOS os emojis com regex universal (mesmo corrompidos)
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]/gu;
  const initialEmojis = (content.match(emojiRegex) || []).length;
  
  if (initialEmojis > 0) {
    console.log(`   🎯 Encontrados ${initialEmojis} emojis`);
  }
  
  // 2. Corrigir português corrompido (Á → á, Á µ → ões, etc)
  let originalLength = content.length;
  
  // Padrões de corrupção de português
  content = content.replace(/extraÁdos/g, 'extraídos');
  content = content.replace(/questÁµes/g, 'questões');
  content = content.replace(/PosiçÁµes/g, 'Posições');
  content = content.replace(/Posição/g, 'Posição');
  content = content.replace(/\bÁ\b/g, 'á');  // Á isolado → á
  content = content.replace(/Á([ueioa])/g, 'á$1'); // Á seguido de vogal
  
  // 3. Remover emojis individuais que possam ter ficado (incluindo caracteres corrompidos)
  // Usar uma abordagem que limpe qualquer coisa que pareça emoji corrompido
  const corruptedEmojiPatterns = [
    /[^\x00-\x7F][^\x00-\x7F]/g,  // Qualquer sequência de 2+ bytes não-ASCII
    /[\u{1F}]/gu,  // Caracteres Unicode alto
  ];
  
  // 4. Replacements específicos por arquivo
  if (path.basename(file) === 'BlocoQuestoesManager.jsx') {
    // Linha 592 - converter console.log com emoji
    content = content.replace(/console\.log\(`🏅 Blocos extraÁdos:`, blocosBackend\);/g, 
      "console.log('[MEDAL] Blocos extraídos:', blocosBackend);");
    // Tentar variações corrompidas também
    content = content.replace(/console\.log\(`[^`]*extraÁdos:`, blocosBackend\);/g,
      "console.log('[MEDAL] Blocos extraídos:', blocosBackend);");
  }
  
  if (path.basename(file) === 'QuestoesTestesTab.jsx') {
    // Linhas 29, 59 - console.log com emoji
    content = content.replace(/console\.log\('🏅 Recarregando questÁµes individuais\.\.\.'\);/g,
      "console.log('[MEDAL] Recarregando questões individuais...');");
    content = content.replace(/console\.log\('🏅 Total de questÁµes carregadas:', questoes\.length\);/g,
      "console.log('[MEDAL] Total de questões carregadas:', questoes.length);");
  }
  
  if (path.basename(file) === 'QuestoesTorneiosTab.jsx') {
    // Linha 27 - console.log com emoji
    content = content.replace(/console\.log\('🏅 Recarregando questÁµes individuais\.\.\.'\);/g,
      "console.log('[MEDAL] Recarregando questões individuais...');");
  }
  
  if (path.basename(file) === 'CertificadosTab.jsx') {
    // Manter labels mas remover emojis corrompidos das opções
    // As opções já devem estar com 🥇🥈🥉 agora
    // Apenas limpar qualquer coisa que reste
    content = content.replace(/<option[^>]*>(.*?)1º Lugar<\/option>/gi, '<option value="1">🥇 1º Lugar</option>');
    content = content.replace(/<option[^>]*>(.*?)2º Lugar<\/option>/gi, '<option value="2">🥈 2º Lugar</option>');
    content = content.replace(/<option[^>]*>(.*?)3º Lugar<\/option>/gi, '<option value="3">🥉 3º Lugar</option>');
  }
  
  const finalEmojis = (content.match(emojiRegex) || []).length;
  if (content.length !== originalLength) {
    fixed++;
    totalFixed++;
    const charsDiff = originalLength - content.length;
    console.log(`   ✅ Português corrigido (${charsDiff} chars removidos/ajustados)`);
  }
  
  if (finalEmojis === 0 && initialEmojis > 0) {
    fixed++;
    console.log(`   ✅ Emojis removidos: ${initialEmojis}`);
  }
  
  if (fixed > 0) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`   → Arquivo salvo com ${fixed} melhorias`);
  }
});

console.log('\n' + '═'.repeat(80));
console.log(`\n✅ TOTAL: ${totalFixed} arquivos corrigidos\n`);
