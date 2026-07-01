import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adminDir = path.join(__dirname, '../FrontEnd/src/Administrador');

// Padrões de correção de encoding UTF-8 mais completos
const replacements = [
  // Padrões do formato "ãµes" (tilde+µ+e+s)
  { from: /sugestãµes/g, to: 'sugestões' },
  { from: /questãµes/g, to: 'questões' },
  { from: /açãµes/g, to: 'ações' },
  
  // Padrões do formato "ãªs"  (tilde+ª+s)
  { from: /Inglãªs/g, to: 'Inglês' },
  { from: /inglãªs/g, to: 'inglês' },
  
  // Padrões "Açã..." (Ação corrompida)
  { from: /Açãães/g, to: 'Ações' },
  { from: /açãães/g, to: 'ações' },
  
  // Padrões "Questã..." (Questão corrompida)
  { from: /AprovarQuestãães/g, to: 'AprovarQuestões' },
  { from: /Questãães/g, to: 'Questões' },
  { from: /questãães/g, to: 'questões' },
  
  // Outros padrões UTF-8 corrompidos
  { from: /QuestÃµes/g, to: 'Questões' },
  { from: /QuestÃo/g, to: 'Questão' },
  { from: /questÃµes/g, to: 'questões' },
  { from: /questÃo/g, to: 'questão' },
  { from: /AçÃµes/g, to: 'Ações' },
  { from: /açÃµes/g, to: 'ações' },
  { from: /OpçÃµes/g, to: 'Opções' },
  { from: /opçÃµes/g, to: 'opções' },
  { from: /ConteÃºdo/g, to: 'Conteúdo' },
  { from: /conteÃºdo/g, to: 'conteúdo' },
  { from: /Ã"timo/g, to: 'Ótimo' },
  { from: /ã"timo/g, to: 'ótimo' },
  { from: /InglÃªs/g, to: 'Inglês' },
  { from: /inglÃªs/g, to: 'inglês' },
  { from: /MÃºltipla/g, to: 'Múltipla' },
  { from: /mÃºltipla/g, to: 'múltipla' },
  { from: /â"€â"€â"€/g, to: '────' },
  { from: /âœ"/g, to: '✓' },
];

console.log('🔧 Iniciando correção completa de encoding...\n');

// Varredura recursiva de todos os arquivos JSX
function corrigirArquivos(dir) {
  const arquivos = fs.readdirSync(dir);
  let totalCorrecoes = 0;

  for (const arquivo of arquivos) {
    const caminhoCompleto = path.join(dir, arquivo);
    const stat = fs.statSync(caminhoCompleto);

    if (stat.isDirectory()) {
      // Recursão para subdirs
      totalCorrecoes += corrigirArquivos(caminhoCompleto);
    } else if (arquivo.endsWith('.jsx') || arquivo.endsWith('.js')) {
      const conteudo = fs.readFileSync(caminhoCompleto, 'utf8');
      let novoConteudo = conteudo;
      let contadorArquivo = 0;

      for (const replacement of replacements) {
        const ocorrencias = (conteudo.match(replacement.from) || []).length;
        if (ocorrencias > 0) {
          novoConteudo = novoConteudo.replace(replacement.from, replacement.to);
          contadorArquivo += ocorrencias;
        }
      }

      // Salvar se teve alterações
      if (contadorArquivo > 0) {
        fs.writeFileSync(caminhoCompleto, novoConteudo, 'utf8');
        const caminhoRelativo = path.relative(
          path.join(__dirname, '../'),
          caminhoCompleto
        );
        console.log(`✅ ${caminhoRelativo}`);
        console.log(`   Alterações: ${contadorArquivo} ocorrências corrigidas\n`);
        totalCorrecoes += contadorArquivo;
      }
    }
  }

  return totalCorrecoes;
}

const totalCorrecoes = corrigirArquivos(adminDir);

console.log(`🎉 Correção completa concluída!`);
console.log(`📊 Total de caracteres corrigidos: ${totalCorrecoes}`);
