import fetch from 'node-fetch';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Mapeia o nível de dificuldade para pontuação máxima
 * Fácil: 5 pontos, Médio: 10 pontos, Difícil: 20 pontos
 */
const nivelMax = (nivel) => {
  if (!nivel) return 0;
  const n = nivel.toLowerCase().trim();
  if (n === 'facil' || n === 'fácil') return 5;
  if (n === 'medio' || n === 'médio') return 10;
  if (n === 'dificil' || n === 'difícil') return 20;
  return 0;
};

/**
 * Constrói o prompt do sistema específico para cada disciplina
 * com os critérios rigorosos definidos nas regras
 */
const buildSystemPrompt = (disciplina) => {
  const normDisciplina = (disciplina || '').toLowerCase();

  if (/matem/i.test(normDisciplina)) {
    return `Você é um avaliador RIGOROSO de Matemática. Suas regras de avaliação OBRIGATÓRIAS são:

1. RESPOSTA TOTALMENTE CORRETA: score 1.0 APENAS se:
   - O resultado final estiver 100% correto
   - TODOS os passos intermediários estiverem corretos
   - Todos os cálculos, fórmulas e lógica estão claros

2. RESPOSTA COM ERRO: score parcial APENAS se:
   - Houver PELO MENOS um passo intermediário correto que demonstre compreensão
   - Identifique precisamente quais passos estão certos e quais errados
   - Calcule score proporcional aos passos corretos

3. RESPOSTA TOTALMENTE ERRADA OU FORA DE CONTEXTO: score 0.0

IMPORTANTE: NUNCA base sua avaliação no tamanho do texto. Ignore completamente o comprimento.
Retorne APENAS um JSON válido com: {pergunta_id, score, pontos, feedback, passos_corretos, passos_totais, evidencias}.
score entre 0 e 1. feedback deve explicar quais passos estão certos/errados.`;
  }

  if (/programa/i.test(normDisciplina)) {
    return `Você é um avaliador RIGOROSO de Programação. Suas regras de avaliação OBRIGATÓRIAS são:

1. RESPOSTA TOTALMENTE CORRETA: score 1.0 APENAS se:
   - O algoritmo resolve CORRETAMENTE o problema proposto
   - Todos os passos da lógica (entrada, processamento, saída) estão corretos
   - Estruturas de controle estão bem formuladas
   - NUNCA há hard-coded ou respostas pré-definidas
   - A solução é geral, não específica para um caso

2. RESPOSTA COM ERRO: score parcial APENAS se:
   - Houver PELO MENOS um passo lógico correto (ex: leitura correta de dados, loop bem estruturado)
   - A lógica final esteja incorreta
   - Identifique precisamente quais componentes funcionam e quais falham

3. RESPOSTA TOTALMENTE ERRADA OU FORA DE CONTEXTO: score 0.0

IMPORTANTE: NUNCA base sua avaliação no tamanho do código. Ignore completamente o comprimento.
Retorne APENAS um JSON válido com: {pergunta_id, score, pontos, feedback, componentes_corretos, componentes_totais, evidencias}.
score entre 0 e 1. feedback deve explicar quais componentes funcionam/falham.`;
  }

  // Inglês
  return `Você é um avaliador RIGOROSO de Inglês. Suas regras de avaliação OBRIGATÓRIAS são:

1. RESPOSTA TOTALMENTE CORRETA: score 1.0 APENAS se:
   - Redação gramaticalmente correta
   - Atende perfeitamente ao solicitado (tema, estrutura, coesão)
   - Todos os argumentos/passos estão corretos e claros
   - Vocabulário apropriado

2. RESPOSTA COM ERRO: score parcial APENAS se:
   - Apresenta PELO MENOS um trecho coerente e relevante
   - Demonstra compreensão do tema
   - Tem erros gramaticais/estruturais mas com conteúdo válido
   - Identifique precisamente quais partes estão corretas

3. RESPOSTA TOTALMENTE ERRADA OU FORA DE CONTEXTO: score 0.0

IMPORTANTE: NUNCA base sua avaliação no número de palavras. Ignore completamente o tamanho da resposta.
Retorne APENAS um JSON válido com: {pergunta_id, score, pontos, feedback, trechos_corretos, total_trechos, evidencias}.
score entre 0 e 1. feedback deve explicar quais partes funcionam/falham.`;
};

/**
 * Chama a API do OpenAI com retry
 */
async function callOpenAI(messages, model = 'gpt-4-turbo') {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY não definido');

  const body = { model, messages, temperature: 0, max_tokens: 1000 };

  const resp = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify(body)
  });

  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || null;

  if (!text) {
    console.error('OpenAI retornou payload sem conteúdo. status=', resp.status, 'body=', JSON.stringify(data));
    return null;
  }

  return text;
}

export async function evaluate(disciplina, items) {
  // items: [{ pergunta_id, texto, resposta, nivel }]
  if (!items || items.length === 0) return [];

  // Fallback rápido quando não há chave OpenAI: retornar zeros
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY não definido. Retornando zeros (sem IA disponível)');
    return items.map(it => {
      const nivel = it.nivel || 'facil';
      const maxP = nivelMax(nivel);
      return {
        pergunta_id: it.pergunta_id,
        score: 0,
        pontos: 0,
        feedback: 'Sem chave OpenAI configurada - avaliação não disponível',
        evidencias: ''
      };
    });
  }

  const system = buildSystemPrompt(disciplina);
  
  // Construir conteúdo do usuário com informações detalhadas
  const userContent = items
    .map(it => {
      return `ID:${it.pergunta_id}\nDificuldade:${it.nivel || 'facil'}\nEnunciado:\n${it.texto}\n\nResposta do aluno:\n${it.resposta}`;
    })
    .join('\n\n---\n\n');

  const messages = [
    { role: 'system', content: system },
    {
      role: 'user',
      content: `Avalie rigorosamente as respostas abaixo. Responda SOMENTE com um JSON array válido contendo para cada resposta:
{
  "pergunta_id": <número>,
  "score": <0-1>,
  "pontos": <calculado>,
  "feedback": <string explicativa>,
  "evidencias": <detalhes técnicos>
}

Pontuação por nível: fácil até 5; médio até 10; difícil até 20.
REGRA CRÍTICA: Resposta completamente correta com todos os passos = 100%. Resposta errada mas com passos corretos = parcial. Resposta totalmente errada = 0.
NÃO avalie baseado no tamanho. Avalie APENAS qualidade e correção.

Dados a avaliar:
${userContent}`
    }
  ];

  let text = null;
  try {
    text = await callOpenAI(messages, process.env.OPENAI_MODEL || 'gpt-4-turbo');
  } catch (err) {
    console.error('Erro ao chamar OpenAI:', err.message);
    // Fallback para modelo mais barato se gpt-4 falhar
    try {
      text = await callOpenAI(messages, 'gpt-3.5-turbo');
    } catch (e) {
      throw new Error(`Erro ao avaliar com IA: ${err.message}`);
    }
  }

  // Se text for null/undefined, usar fallback
  if (!text) {
    console.warn('Resposta vazia da OpenAI — retornando zeros');
    return items.map(it => {
      const nivel = it.nivel || 'facil';
      const maxP = nivelMax(nivel);
      return {
        pergunta_id: it.pergunta_id,
        score: 0,
        pontos: 0,
        feedback: 'Erro ao conectar com IA - sem avaliação disponível',
        evidencias: ''
      };
    });
  }

  // Extrair JSON do texto
  const match = text.match(/\[.*\]/s);
  let parsed = null;
  try {
    parsed = match ? JSON.parse(match[0]) : JSON.parse(text);
  } catch (err) {
    // Tentar reparar respostas comuns (remover comentários antes/after)
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket >= 0 && lastBracket > firstBracket) {
      const substr = text.slice(firstBracket, lastBracket + 1);
      try {
        parsed = JSON.parse(substr);
      } catch (e) {
        console.error('Erro ao parsear JSON da IA:', e.message, 'Texto:', text.substring(0, 200));
        throw new Error('Não foi possível parsear JSON da resposta da IA');
      }
    } else {
      console.error('Erro ao encontrar JSON na resposta:', text.substring(0, 200));
      throw new Error('Não foi possível parsear JSON da resposta da IA');
    }
  }

  // Garantir estrutura e calcular pontos se necessário
  return (parsed || []).map(it => {
    const pid = it.pergunta_id || it.id || null;
    const score = Math.max(0, Math.min(1, Number(it.score || 0)));
    const nivel = (items.find(x => Number(x.pergunta_id) === Number(pid)) || {}).nivel || 'facil';
    const maxP = nivelMax(nivel);
    const pontos = typeof it.pontos === 'number' ? it.pontos : Math.round(score * maxP * 100) / 100;
    
    return {
      pergunta_id: pid,
      score: score,
      pontos: Math.round(pontos * 100) / 100,
      feedback: (it.feedback || it.comentario || '').toString(),
      evidencias: (it.evidencias || '').toString()
    };
  });
}

export default { evaluate };
