import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDir = path.join(__dirname, '../FrontEnd/src');

// Padrões a corrigir
const patterns = [
  // Padrão: `http://${window.location.hostname}:3002`
  { from: /`http:\/\/\$\{window\.location\.hostname\}:3002`/g, to: "'http://localhost:3002'" },
  // Padrão: variações sem template string
  { from: /http:\/\/\$\{window\.location\.hostname\}:3002/g, to: 'http://localhost:3002' },
];

console.log('🔧 Iniciando correção de URLs de API...\n');

function corrigirArquivos(dir) {
  const arquivos = fs.readdirSync(dir);
  let totalCorrecoes = 0;
  const arquivosAlterados = [];

  for (const arquivo of arquivos) {
    const caminhoCompleto = path.join(dir, arquivo);
    const stat = fs.statSync(caminhoCompleto);

    if (stat.isDirectory()) {
      // Recursão para subdirs
      const { correcoes, arquivos: arqs } = corrigirArquivos(caminhoCompleto);
      totalCorrecoes += correcoes;
      arquivosAlterados.push(...arqs);
    } else if (arquivo.endsWith('.jsx') || arquivo.endsWith('.js')) {
      const conteudo = fs.readFileSync(caminhoCompleto, 'utf8');
      let novoConteudo = conteudo;
      let contadorArquivo = 0;

      for (const pattern of patterns) {
        const ocorrencias = (conteudo.match(pattern.from) || []).length;
        if (ocorrencias > 0) {
          novoConteudo = novoConteudo.replace(pattern.from, pattern.to);
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
        arquivosAlterados.push({ arquivo: caminhoRelativo, mudancas: contadorArquivo });
        totalCorrecoes += contadorArquivo;
      }
    }
  }

  return { correcoes: totalCorrecoes, arquivos: arquivosAlterados };
}

const { correcoes, arquivos } = corrigirArquivos(frontendDir);

if (arquivos.length === 0) {
  console.log('ℹ️  Nenhuma URL problemática encontrada!');
} else {
  console.log('✅ Arquivos corrigidos:\n');
  for (const { arquivo, mudancas } of arquivos) {
    console.log(`  📄 ${arquivo}`);
    console.log(`     ${mudancas} ocorrência(s) corrigida(s)\n`);
  }
}

console.log(`🎉 Correção concluída!`);
console.log(`📊 Total de URLs corrigidas: ${correcoes}`);
