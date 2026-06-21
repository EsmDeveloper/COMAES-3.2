import fs from 'fs';
import path from 'path';

// Padrões problemáticos e suas correções
const replacements = [
  { pattern: /â€™/g, replacement: "'" },    // ' corrompido
  { pattern: /â€œ/g, replacement: '"' },    // " corrompido
  { pattern: /â€•/g, replacement: '"' },    // " corrompido
  { pattern: /â€¢/g, replacement: '•' },    // • corrompido
  { pattern: /â€"/g, replacement: '–' },    // – corrompido (en dash)
  { pattern: /â€"/g, replacement: '—' },    // — corrompido (em dash)
  { pattern: /â€˜/g, replacement: "'" },    // ' corrompido
  { pattern: /â€™/g, replacement: "'" },    // ' corrompido
  { pattern: /Â/g, replacement: '' },       // Caractere de controle
  { pattern: /Â /g, replacement: ' ' },     // Espaço corrompido
];

const filesWithIssues = [
  'FrontEnd/src/Administrador/BlocoQuestoesManager.jsx',
  'FrontEnd/src/Administrador/CertificadosTab.jsx',
  'FrontEnd/src/Administrador/QuestoesTestesTab.jsx',
  'FrontEnd/src/Administrador/QuestoesTorneiosTab.jsx',
  'FrontEnd/src/certificados/CertificadoBase.jsx',
  'FrontEnd/src/certificados/MeusCertificados.jsx',
  'FrontEnd/src/components/TournamentFinishedModal.jsx',
  'FrontEnd/src/Paginas/Primarias/CollaboratorRegisterForm.jsx',
  'FrontEnd/src/Paginas/Primarias/Dashboard.jsx',
  'FrontEnd/src/Paginas/Secundarias/EntrarTorneio.jsx',
  'FrontEnd/src/Paginas/Secundarias/MinhaJornada.jsx',
  'FrontEnd/src/Paginas/Secundarias/Ranking.jsx',
  'FrontEnd/src/Paginas/Secundarias/RankingCompleto.jsx',
  'FrontEnd/src/Paginas/Secundarias/RankingGlobal.jsx',
  'FrontEnd/src/certificados/InglesOriginal.jsx',
  'FrontEnd/src/certificados/MatematicaOriginal.jsx',
  'FrontEnd/src/certificados/ProgramacaoOriginal.jsx',
  'BackEnd/insert_questoes_v2.js',
  'BackEnd/seedMatematicaFacil.js',
];

console.log('\n=== CORREÇÃO DE MOJIBAKES ===\n');

let totalProcessed = 0;
let totalFixed = 0;

filesWithIssues.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    return;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    // Aplicar todas as correções
    replacements.forEach(({ pattern, replacement }) => {
      content = content.replace(pattern, replacement);
    });
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`[FIXED] ${path.basename(filePath)}`);
      totalProcessed++;
      totalFixed++;
    }
  } catch (err) {
    console.log(`[ERROR] ${path.basename(filePath)} - ${err.message}`);
  }
});

console.log(`\n✅ ${totalFixed} arquivos corrigidos\n`);
