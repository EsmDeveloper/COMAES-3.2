import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Fix UTF-8 Encoding Issues
 * Detecta e corrige caracteres quebrados de encoding em arquivos JSX do Admin
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = [
  'FrontEnd/src/Administrador/AprovarQuestões.jsx',
  'FrontEnd/src/Administrador/BlocosColaboradoresTab.jsx',
  'FrontEnd/src/Administrador/AdminBlocosColaboradoresPendentesTab.jsx',
  'FrontEnd/src/Administrador/CertificadosTab.jsx',
  'FrontEnd/src/Administrador/TesteConhecimentoManager.jsx'
];

const replacements = [
  { from: /QuestÃµes/g, to: 'Questões' },
  { from: /QuestÃo/g, to: 'Questão' },
  { from: /questÃµes/g, to: 'questões' },
  { from: /questÃo/g, to: 'questão' },
  { from: /AçÃµes/g, to: 'Ações' },
  { from: /açÃµes/g, to: 'ações' },
  { from: /OpçÃµes/g, to: 'Opções' },
  { from: /AprovarQuestÃµes/g, to: 'AprovarQuestões' },
  { from: /ConteÃºdo/g, to: 'Conteúdo' },
  { from: /Ã"timo/g, to: 'Ótimo' },
  { from: /Ã/g, to: 'ã' },
  { from: /â"€â"€â"€/g, to: '────' },
  { from: /âœ"/g, to: '✓' },
  { from: /Ã s/g, to: 'às' },
  { from: /Matem\u00e1tica/g, to: 'Matemática' },
  { from: /Programa\u00e7\u00e3o/g, to: 'Programação' },
  { from: /Ingl\u00eas/g, to: 'Inglês' },
  { from: /MÃºltipla/g, to: 'Múltipla' },
  { from: /Ã©/g, to: 'é' },
  { from: /Ã£/g, to: 'ã' },
  { from: /Ã§/g, to: 'ç' },
  { from: /Ã¡/g, to: 'á' },
  { from: /Ã³/g, to: 'ó' },
  { from: /Ã­/g, to: 'í' },
  { from: /Ã´/g, to: 'ô' },
  { from: /Ã¢/g, to: 'â' },
  { from: /Ã¨/g, to: 'è' },
  { from: /Ã¼/g, to: 'ü' }
];

console.log('🔧 Iniciando correção de encoding...\n');

files.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  ${filePath} - Arquivo não encontrado`);
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let originalLength = content.length;
    let changeCount = 0;

    // Aplicar todas as substituições
    replacements.forEach(({ from, to }) => {
      const matches = content.match(from);
      if (matches) {
        changeCount += matches.length;
      }
      content = content.replace(from, to);
    });

    fs.writeFileSync(fullPath, content, 'utf8');
    
    if (changeCount > 0) {
      console.log(`✅ ${filePath}`);
      console.log(`   Alterações: ${changeCount} ocorrências corrigidas\n`);
    } else {
      console.log(`✓  ${filePath} - Sem problemas de encoding\n`);
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
  }
});

console.log('🎉 Correção concluída!');
