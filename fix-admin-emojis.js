import fs from 'fs';
import path from 'path';

// Mapeamento de emojis para tags profissionais (para console.log)
const EMOJI_TO_TAG = {
  '🏅': '[MEDAL]',
  '💻': '[CODE]',
  '⚡': '[ENERGY]',
  '🚀': '[ROCKET]',
  '🧮': '[CALC]',
  '📐': '[RULER]',
  '🔢': '[NUMBER]',
  '🌍': '[WORLD]',
  '⭐': '[STAR]',
  '🦉': '[OWL]',
  '🐣': '[EGG]',
  '📚': '[BOOKS]',
  '✏️': '[PENCIL]',
  '🎯': '[TARGET]',
  '🔬': '[MICRO]',
  '🌟': '[SHINE]',
  '👑': '[CROWN]',
  '🔥': '[FIRE]',
  '✅': '[OK]',
  '❌': '[FAIL]',
  '⚠️': '[WARN]',
};

const CORRECTIONS = [
  {
    file: 'FrontEnd/src/Administrador/BlocoQuestoesManager.jsx',
    replacements: [
      { from: /console\.log\(`🏅 Carregando blocos com filtros:`, params\);/, to: "console.log('[MEDAL] Carregando blocos com filtros:', params);" },
      { from: /console\.log\(`🏅 Resposta do backend:`, res\);/, to: "console.log('[MEDAL] Resposta do backend:', res);" },
      { from: /console\.log\(`🏅 Blocos extraídos:`, blocosBackend\);/, to: "console.log('[MEDAL] Blocos extraídos:', blocosBackend);" },
      { from: /console\.log\(`🏅 Estrutura dos blocos carregados:`\);/, to: "console.log('[MEDAL] Estrutura dos blocos carregados:');" },
    ]
  },
  {
    file: 'FrontEnd/src/Administrador/QuestoesTestesTab.jsx',
    replacements: [
      { from: /console\.log\('🏅 Recarregando questões individuais...'\);/, to: "console.log('[MEDAL] Recarregando questões individuais...');" },
      { from: /console\.log\('🏅 Modal de agrupamento aberto - recarregando blocos...'\);/, to: "console.log('[MEDAL] Modal de agrupamento aberto - recarregando blocos...');" },
      { from: /console\.log\('🏅 Total de questões carregadas:', questoes\.length\);/, to: "console.log('[MEDAL] Total de questões carregadas:', questoes.length);" },
      { from: /console\.warn\('🏅 Resposta completa:', data\);/, to: "console.warn('[MEDAL] Resposta completa:', data);" },
      { from: /console\.error\('🏅 Detalhes do erro:', error\.message\);/, to: "console.error('[MEDAL] Detalhes do erro:', error.message);" },
      { from: /console\.log\(`\\n🏅 INICIANDO AGRUPAMENTO`\);/, to: "console.log(`\\n[MEDAL] INICIANDO AGRUPAMENTO`);" },
      { from: /console\.log\(`   🏅 Bloco ID =/, to: "console.log(`   [MEDAL] Bloco ID =" },
      { from: /console\.log\(`🏅 Status da resposta:/, to: "console.log(`[MEDAL] Status da resposta:" },
    ]
  },
  {
    file: 'FrontEnd/src/Administrador/QuestoesTorneiosTab.jsx',
    replacements: [
      { from: /console\.log\('🏅 Recarregando questões individuais...'\);/, to: "console.log('[MEDAL] Recarregando questões individuais...');" },
      { from: /console\.warn\('🏅 Resposta completa:', data\);/, to: "console.warn('[MEDAL] Resposta completa:', data);" },
      { from: /console\.error\('🏅 Detalhes do erro:', error\.message\);/, to: "console.error('[MEDAL] Detalhes do erro:', error.message);" },
      { from: /console\.log\(`🏅 Enviando questão/, to: "console.log(`[MEDAL] Enviando questão" },
      { from: /console\.log\(`🏅 Status da resposta:/, to: "console.log(`[MEDAL] Status da resposta:" },
      { from: /console\.error\(`🏅 Mensagem completa:/, to: "console.error(`[MEDAL] Mensagem completa:" },
    ]
  }
];

console.log('\n🔧 CONVERSÃO DE EMOJIS → TAGS EM CONSOLE.LOG\n');
console.log('═'.repeat(80));

let totalFixed = 0;

CORRECTIONS.forEach(({ file, replacements }) => {
  if (!fs.existsSync(file)) {
    console.log(`\n⏭️  ${path.basename(file)} - não encontrado`);
    return;
  }
  
  console.log(`\n📝 ${path.basename(file)}`);
  
  let content = fs.readFileSync(file, 'utf-8');
  let fileFixed = 0;
  
  replacements.forEach(({ from, to }) => {
    if (from.test(content)) {
      content = content.replace(from, to);
      fileFixed++;
      totalFixed++;
      console.log(`   ✅ ${from.source.substring(0, 50)}...`);
    }
  });
  
  if (fileFixed > 0) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`   → ${fileFixed} linhas convertidas`);
  }
});

// Para CertificadosTab.jsx, precisa de conversão diferente (data structure)
const certFile = 'FrontEnd/src/Administrador/CertificadosTab.jsx';
if (fs.existsSync(certFile)) {
  console.log(`\n📝 CertificadosTab.jsx (estrutura de dados)`);
  
  let content = fs.readFileSync(certFile, 'utf-8');
  let originalLength = content.length;
  
  // Manter emojis em data structures, mas converter em UI
  // Exemplo: '🏅 Ouro' → manter emoji na label já que é dados
  // Mas em <option> value podemos remover
  
  content = content.replace(/<option value="1">🏅 1º Lugar<\/option>/g, '<option value="1">🥇 1º Lugar</option>');
  content = content.replace(/<option value="2">🏅 2º Lugar<\/option>/g, '<option value="2">🥈 2º Lugar</option>');
  content = content.replace(/<option value="3">🏅 3º Lugar<\/option>/g, '<option value="3">🥉 3º Lugar</option>');
  
  if (content.length !== originalLength) {
    fs.writeFileSync(certFile, content, 'utf-8');
    totalFixed++;
    console.log(`   ✅ Emojis em <option> convertidos para medalhas corretas`);
    console.log(`   → 3 linhas de UI atualizadas`);
  }
}

console.log('\n' + '═'.repeat(80));
console.log(`\n✅ TOTAL: ${totalFixed} substituições realizadas\n`);
