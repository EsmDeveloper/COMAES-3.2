/**
 * Manual Evaluator - Avaliação local sem dependência de APIs externas
 * Implementa critérios específicos por disciplina conforme regras estabelecidas
 */

/**
 * Mapeia nível de dificuldade para pontuação máxima
 * Fácil: 5 pontos, Médio: 10 pontos, Difícil: 20 pontos
 */
const getMaxPontos = (nivel) => {
  if (!nivel) return 0;
  const n = String(nivel).toLowerCase().trim();
  if (/f[aá]cil/i.test(n)) return 5;
  if (/m[eé]dio/i.test(n)) return 10;
  if (/dif[íi]cil/i.test(n)) return 20;
  return 0;
};

/**
 * AVALIAÇÃO DE MATEMÁTICA
 * Critérios:
 * 1. Passo a passo da resolução (clareza lógica)
 * 2. Uso correto de operações/fórmulas
 * 3. Chegada correta ao resultado final
 */
const avaliarMatematica = (pergunta, resposta, tempoProgresso) => {
  const maxPontos = getMaxPontos(pergunta.dificuldade);
  let score = 0;
  let feedback = [];
  let passos_corretos = 0;
  let passos_totais = 0;

  if (!resposta || resposta.trim().length === 0) {
    return {
      pergunta_id: pergunta.id,
      score: 0,
      pontos: 0,
      feedback: 'Resposta vazia. Nenhum passo avaliado.',
      passos_corretos: 0,
      passos_totais: 0,
      desconto_25_segundos: false,
      evidencias: 'Sem conteúdo para análise'
    };
  }

  const respostaLower = resposta.toLowerCase().trim();
  
  // Verificar estrutura e passo a passo
  const temPassos = /passo|etapa|primeiro|segundo|terceiro|resultado|resposta/i.test(resposta);
  const temOperacoes = /[\+\-\*\/\(\)=]/g.test(resposta);
  const temExplicacao = resposta.split(' ').length > 5;

  passos_totais = 3;

  // Ponto 1: Estrutura/passo a passo
  if (temPassos || temExplicacao) {
    passos_corretos += 1;
    feedback.push('✓ Estrutura lógica presente');
  } else {
    feedback.push('✗ Falta estrutura ou sequência lógica');
  }

  // Ponto 2: Operações matemáticas
  if (temOperacoes) {
    passos_corretos += 1;
    feedback.push('✓ Operações matemáticas utilizadas');
  } else {
    feedback.push('✗ Sem operações matemáticas claras');
  }

  // Ponto 3: Resultado final
  if (respostaLower.includes('total') || respostaLower.includes('resposta') || respostaLower.includes('resultado')) {
    passos_corretos += 1;
    feedback.push('✓ Indicação de resultado final');
  } else {
    feedback.push('✗ Resultado final não claramente indicado');
  }

  // Calcular score proporcional
  score = passos_corretos / passos_totais;

  // Aplicar desconto si tempo < 25 segundos
  const tempoDescontoAplicado = tempoProgresso !== undefined && tempoProgresso < 25;
  if (tempoDescontoAplicado) {
    score *= 0.75; // Desconto de 25%
    feedback.push('⚠ DESCONTO 25%: Resposta entregue em menos de 25 segundos');
  }

  const pontos = Math.round(score * maxPontos * 10) / 10;

  return {
    pergunta_id: pergunta.id,
    score: Math.round(score * 100) / 100,
    pontos,
    feedback: feedback.join('; '),
    passos_corretos,
    passos_totais,
    desconto_25_segundos: tempoDescontoAplicado,
    evidencias: `Análise baseada em estrutura lógica, operações e resultado. ${tempoDescontoAplicado ? 'Desconto aplicado.' : 'Sem desconto.'}`
  };
};

/**
 * AVALIAÇÃO DE INGLÊS
 * Critérios:
 * 1. Estrutura: Cabeça (introdução) / Tronco (desenvolvimento) / Membro (conclusão)
 * 2. Gramática e ortografia
 * 3. Frases com sentido completo
 */
const avaliarIngles = (pergunta, resposta, tempoProgresso) => {
  const maxPontos = getMaxPontos(pergunta.dificuldade);
  let score = 0;
  let feedback = [];
  let trechos_corretos = 0;
  let total_trechos = 0;

  if (!resposta || resposta.trim().length === 0) {
    return {
      pergunta_id: pergunta.id,
      score: 0,
      pontos: 0,
      feedback: 'Resposta vazia. Nenhum trecho avaliado.',
      trechos_corretos: 0,
      total_trechos: 0,
      desconto_25_segundos: false,
      evidencias: 'Sem conteúdo para análise'
    };
  }

  const sentencas = resposta.match(/[^.!?]+[.!?]+/g) || [resposta];
  const palavras = resposta.trim().split(/\s+/);

  total_trechos = 3; // Cabeça, Tronco, Membro

  // Análise de estrutura (muito simplificada)
  let temIntroducao = false;
  let temDesenvolvimento = false;
  let temConclusao = false;

  // Verificar introdução (palavras chave no início)
  const introducaoKeywords = /^(i think|in my opinion|first|initially|to begin)/i;
  if (introducaoKeywords.test(resposta)) {
    temIntroducao = true;
    trechos_corretos += 1;
    feedback.push('✓ Introdução presente');
  } else if (sentencas.length >= 3) {
    temIntroducao = true;
    trechos_corretos += 1;
    feedback.push('✓ Múltiplas sentenças (estrutura detectada)');
  } else {
    feedback.push('✗ Introdução não clara');
  }

  // Verificar desenvolvimento (tamanho e conectores)
  const conectores = /furthermore|besides|however|additionally|also|moreover|then|while/i;
  if (palavras.length > 10 || conectores.test(resposta)) {
    temDesenvolvimento = true;
    trechos_corretos += 1;
    feedback.push('✓ Desenvolvimento com múltiplas ideias');
  } else {
    feedback.push('✗ Desenvolvimento de ideias insuficiente');
  }

  // Verificar conclusão
  const conclusaoKeywords = /in conclusion|finally|in summary|to conclude|therefore/i;
  if (conclusaoKeywords.test(resposta) || (sentencas.length >= 3 && sentencas[sentencas.length - 1].length > 5)) {
    temConclusao = true;
    trechos_corretos += 1;
    feedback.push('✓ Conclusão presente');
  } else {
    feedback.push('✗ Conclusão não clara');
  }

  // Verificar erros ortográficos básicos
  const errosOrtograficos = /\b(teh|recieve|ocurred|writting|seperate)\b/i.test(resposta);
  if (!errosOrtograficos) {
    feedback.push('✓ Sem erros ortográficos óbvios');
  } else {
    feedback.push('✗ Erros ortográficos detectados');
    trechos_corretos = Math.max(0, trechos_corretos - 1);
  }

  // Verificar se há sentenças completas (com sujeito e verbo)
  const temSujeito = /\b(i|you|he|she|it|we|they|the|a|an)\b/i.test(resposta);
  const temVerbo = /\b(is|are|was|were|have|has|do|does|did|am|be|been|being|can|could|will|would|should|may|might)\b/i.test(resposta);
  if (temSujeito && temVerbo) {
    feedback.push('✓ Sentenças com estrutura completa');
  } else {
    feedback.push('✗ Falta estrutura gramatical completa');
  }

  // Calcular score proporcional
  score = trechos_corretos / total_trechos;

  // Aplicar desconto si tempo < 25 segundos
  const tempoDescontoAplicado = tempoProgresso !== undefined && tempoProgresso < 25;
  if (tempoDescontoAplicado) {
    score *= 0.75; // Desconto de 25%
    feedback.push('⚠ DESCONTO 25%: Resposta entregue em menos de 25 segundos');
  }

  const pontos = Math.round(score * maxPontos * 10) / 10;

  return {
    pergunta_id: pergunta.id,
    score: Math.round(score * 100) / 100,
    pontos,
    feedback: feedback.join('; '),
    trechos_corretos,
    total_trechos,
    desconto_25_segundos: tempoDescontoAplicado,
    evidencias: `Análise de estrutura (introdução/desenvolvimento/conclusão), gramática e completude. ${tempoDescontoAplicado ? 'Desconto aplicado.' : 'Sem desconto.'}`
  };
};

/**
 * AVALIAÇÃO DE PROGRAMAÇÃO
 * Critérios:
 * 1. Entrada de dados
 * 2. Processamento/lógica
 * 3. Controle de fluxo (if/loop/etc)
 * 4. Saída de resultados
 */
const avaliarProgramacao = (pergunta, resposta, tempoProgresso) => {
  const maxPontos = getMaxPontos(pergunta.dificuldade);
  let score = 0;
  let feedback = [];
  let componentes_corretos = 0;
  let componentes_totais = 0;

  if (!resposta || resposta.trim().length === 0) {
    return {
      pergunta_id: pergunta.id,
      score: 0,
      pontos: 0,
      feedback: 'Resposta vazia. Nenhum componente avaliado.',
      componentes_corretos: 0,
      componentes_totais: 0,
      desconto_25_segundos: false,
      evidencias: 'Sem conteúdo para análise'
    };
  }

  componentes_totais = 4;

  // 1. Entrada de dados
  const temEntrada = /(input|read|scanf|cin|entrada|receber|ler|dados)/i.test(resposta);
  if (temEntrada) {
    componentes_corretos += 1;
    feedback.push('✓ Entrada de dados presente');
  } else {
    feedback.push('✗ Sem entrada de dados clara');
  }

  // 2. Processamento/lógica
  const temProcessamento = /(calcul|process|operacao|for|let|var|const|=|if|função|function)/i.test(resposta);
  if (temProcessamento) {
    componentes_corretos += 1;
    feedback.push('✓ Processamento/operações lógicas presentes');
  } else {
    feedback.push('✗ Sem processamento/operações detectadas');
  }

  // 3. Controle de fluxo
  const temControle = /(if|else|for|while|switch|case|loop|condição|loop|iteration)/i.test(resposta);
  if (temControle) {
    componentes_corretos += 1;
    feedback.push('✓ Controle de fluxo implementado');
  } else {
    feedback.push('✗ Sem controle de fluxo claro');
  }

  // 4. Saída de resultados
  const temSaida = /(output|print|console|write|resultado|saida|exibir|retorn)/i.test(resposta);
  if (temSaida) {
    componentes_corretos += 1;
    feedback.push('✓ Saída de resultados presente');
  } else {
    feedback.push('✗ Sem saída de resultados');
  }

  // Verificar se há hard-coded ou resposta memorizada
  const temHardCoded = /^\s*[-\d.,][\d.,\s]*$/.test(resposta); // Apenas números
  if (temHardCoded) {
    componentes_corretos = Math.max(0, componentes_corretos - 2);
    feedback.push('⚠ Possível resposta hard-coded (apenas números)');
  }

  // Verificar estrutura e organização
  if (resposta.length > 30) {
    feedback.push('✓ Algoritmo com tamanho apropriado');
  }

  // Calcular score proporcional
  score = componentes_corretos / componentes_totais;

  // Aplicar desconto si tempo < 25 segundos
  const tempoDescontoAplicado = tempoProgresso !== undefined && tempoProgresso < 25;
  if (tempoDescontoAplicado) {
    score *= 0.75; // Desconto de 25%
    feedback.push('⚠ DESCONTO 25%: Resposta entregue em menos de 25 segundos');
  }

  const pontos = Math.round(score * maxPontos * 10) / 10;

  return {
    pergunta_id: pergunta.id,
    score: Math.round(score * 100) / 100,
    pontos,
    feedback: feedback.join('; '),
    componentes_corretos,
    componentes_totais,
    desconto_25_segundos: tempoDescontoAplicado,
    evidencias: `Análise de estrutura de algoritmo: entrada, processamento, controle, saída. ${tempoDescontoAplicado ? 'Desconto aplicado.' : 'Sem desconto.'}`
  };
};

/**
 * Função principal de avaliação
 * Detecta disciplina e chama avaliador apropriado
 */
const avaliarRespostaManualmente = (pergunta, resposta, tempoProgresso) => {
  if (!pergunta) {
    throw new Error('Pergunta não fornecida');
  }

  // Normalizar disciplina
  const disciplina = (pergunta.disciplina || pergunta.tipo || '').toLowerCase();

  if (/matem/i.test(disciplina)) {
    return avaliarMatematica(pergunta, resposta, tempoProgresso);
  } else if (/programa/i.test(disciplina)) {
    return avaliarProgramacao(pergunta, resposta, tempoProgresso);
  } else if (/ingl/i.test(disciplina)) {
    return avaliarIngles(pergunta, resposta, tempoProgresso);
  } else {
    throw new Error(`Disciplina desconhecida: ${disciplina}`);
  }
};

export {
  avaliarRespostaManualmente,
  avaliarMatematica,
  avaliarIngles,
  avaliarProgramacao,
  getMaxPontos
};
