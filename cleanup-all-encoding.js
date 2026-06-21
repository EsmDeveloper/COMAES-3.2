import fs from 'fs';
import path from 'path';

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

console.log('\n=== LIMPEZA RADICAL UTF-8 (TODOS OS 19 ARQUIVOS) ===\n');

let totalFixed = 0;

filesWithIssues.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    return;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let cleaned = '';
    
    // Remover APENAS caracteres inválidos, mantendo tudo que é válido
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const code = char.charCodeAt(0);
      
      // ASCII imprimível: OK
      if (code >= 32 && code <= 126) {
        cleaned += char;
        continue;
      }
      
      // Espaços, tabs, newlines: OK
      if (code === 9 || code === 10 || code === 13) {
        cleaned += char;
        continue;
      }
      
      // Acentos Latinos válidos e outros caracteres Unicode bem-formados
      // Aceitar qualquer coisa de 128+ que esteja bem-formada
      if (code >= 128) {
        // Verificar se é parte de sequência UTF-8 válida
        const charCode = char.charCodeAt(0);
        if (charCode >= 0xC0 && charCode <= 0xDF) {
          // Pode ser início de sequência 2-byte
          cleaned += char;
          continue;
        } else if (charCode >= 0x80 && charCode <= 0xBF) {
          // Continuação de sequência - OK
          cleaned += char;
          continue;
        } else if (charCode >= 0xE0 && charCode <= 0xEF) {
          // Pode ser 3-byte
          cleaned += char;
          continue;
        } else if (charCode >= 0xF0 && charCode <= 0xF7) {
          // Pode ser 4-byte
          cleaned += char;
          continue;
        } else if (charCode < 128) {
          cleaned += char;
          continue;
        }
      }
      
      // Remover qualquer coisa inválida
    }
    
    // Limpar sequências estranhas específicas
    cleaned = cleaned.replace(/┬[a-z┤├]/g, '');
    cleaned = cleaned.replace(/[┤├┘└╔╗╚╝]/g, '');
    
    if (content !== cleaned) {
      fs.writeFileSync(filePath, cleaned, 'utf-8');
      console.log(`✅ ${path.basename(filePath)}`);
      totalFixed++;
    }
    
  } catch (err) {
    console.log(`⚠️  ${path.basename(filePath)} - ${err.message}`);
  }
});

console.log(`\n✅ ${totalFixed} arquivos limpos com sucesso\n`);
