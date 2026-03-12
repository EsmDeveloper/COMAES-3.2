import fetch from 'node-fetch';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

const nivelMax = (nivel) => {
  if (!nivel) return 0;
  const n = nivel.toLowerCase();
  if (n === 'facil' || n === 'fácil') return 5;
  if (n === 'medio' || n === 'médio' || n === 'medio') return 10;
  if (n === 'dificil' || n === 'difícil') return 20;
  return 0;
};

const buildSystemPrompt = (disciplina) => {
  if (disciplina === 'Matemática' || disciplina === 'matematica' || disciplina === 'matemática') {
    return `Você é um Professor de Matemática que avalia respostas passo-a-passo. Para cada par pergunta/resposta devolva um objeto JSON com: {pergunta_id, score, pontos, feedback, evidencias}. score entre 0 e 1. Pontos são calculados em função do nível: fácil até 5, médio até 10, difícil até 20. Só conceda pontuação máxima quando a resolução estiver completa, com passos, fórmulas e cálculos corretos.`;
  }
  if (disciplina === 'Programação' || disciplina === 'programacao' || disciplina === 'programação') {
    return `Você é um Professor de Programação que avalia soluções em JavaScript/Python. Avalie correção, clareza, eficiência e proibição de hard-coded. Retorne JSON com: {pergunta_id, score, pontos, feedback, evidencias}. score entre 0 e 1. Máximo somente com algoritmo completo, testes descritos e sem respostas hard-coded.`;
  }
  // Inglês
  return `Você é um Professor de Inglês. Avalie gramática, ortografia, coesão, vocabulário e coerência do texto. Retorne JSON: {pergunta_id, score, pontos, feedback, evidencias}. score entre 0 e 1. Pontos baseados no nível (fácil 5 / médio 10 / difícil 20).`;
};

async function callOpenAI(messages, model = 'gpt-3.5-turbo') {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY não definido');

  const body = { model, messages, temperature: 0 };

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
  // Fallback rápido quando não há chave OpenAI: heurística local
  if (!process.env.OPENAI_API_KEY) {
    return items.map(it => {
      const text = (it.resposta || '').toString();
      const len = text.length;
      const nivel = it.nivel || 'facil';
      const maxP = nivelMax(nivel);

      let score = 0;
      if (/matem/i.test(disciplina)) {
        // procura por passos ou símbolos matemáticos
        const passos = /passo|\+|\-|\*|\/|=|\d+/i.test(text) ? 1 : 0;
        score = Math.min(1, Math.max(0, (len / 300) + passos * 0.3));
      } else if (/programa/i.test(disciplina)) {
        const keywords = /(for|while|return|function|def|if|else|console\.log|print)\b/i.test(text) ? 1 : 0;
        score = Math.min(1, Math.max(0, (len / 500) + keywords * 0.4));
      } else {
        // inglês
        const words = (text.split(/\s+/).filter(Boolean) || []).length;
        score = Math.min(1, Math.max(0, (words / 200)));
      }

      const pontos = Math.round(score * maxP * 100) / 100;
      return { pergunta_id: it.pergunta_id, score, pontos, feedback: 'Avaliação heurística (sem chave OpenAI)', evidencias: '' };
    });
  }

  const system = buildSystemPrompt(disciplina);
  const userContent = items.map(it => `ID:${it.pergunta_id}\nNIVEL:${it.nivel}\nQ:${it.texto}\nR:${it.resposta}`).join('\n---\n');

  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: `Avalie os pares abaixo e responda SOMENTE com um JSON válido — um array de objetos — contendo para cada item: pergunta_id (número), score (0..1), pontos (número), feedback (string curta), evidencias (string opcional).\nRegras de pontuação: fácil até 5; médio até 10; difícil até 20. Pontuação máxima somente quando houver resolução passo-a-passo (Matemática) ou implementação completa sem hard-coded (Programação) ou texto completamente correto (Inglês).\nDados:\n${userContent}` }
  ];

  let text = null;
  try {
    text = await callOpenAI(messages, process.env.OPENAI_MODEL || 'gpt-3.5-turbo');
  } catch (err) {
    // Tentar com fallback
    try { text = await callOpenAI(messages, 'gpt-3.5-turbo'); } catch (e) { throw err; }
  }

  // Se text for null/undefined, usar heurística local para evitar erro ao chamar match
  if (!text) {
    console.warn('Resposta vazia da OpenAI — usando heurística local (fallback)');
    return items.map(it => {
      const t = (it.resposta || '').toString();
      const len = t.length;
      const nivel = it.nivel || 'facil';
      const maxP = nivelMax(nivel);

      let score = 0;
      if (/matem/i.test(disciplina)) {
        const passos = /passo|\+|\-|\*|\/|=|\d+/i.test(t) ? 1 : 0;
        score = Math.min(1, Math.max(0, (len / 300) + passos * 0.3));
      } else if (/programa/i.test(disciplina)) {
        const keywords = /(for|while|return|function|def|if|else|console\.log|print)\b/i.test(t) ? 1 : 0;
        score = Math.min(1, Math.max(0, (len / 500) + keywords * 0.4));
      } else {
        const words = (t.split(/\s+/).filter(Boolean) || []).length;
        score = Math.min(1, Math.max(0, (words / 200)));
      }

      const pontos = Math.round(score * maxP * 100) / 100;
      return { pergunta_id: it.pergunta_id, score, pontos, feedback: 'Avaliação heurística (fallback)', evidencias: '' };
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
      parsed = JSON.parse(substr);
    } else {
      throw new Error('Não foi possível parsear JSON da resposta da IA');
    }
  }

  // Garantir estrutura e calcular pontos se necessário
  return (parsed || []).map(it => {
    const pid = it.pergunta_id || it.id || null;
    const score = Number(it.score || 0);
    const nivel = (items.find(x => Number(x.pergunta_id) === Number(pid)) || {}).nivel || 'facil';
    const maxP = nivelMax(nivel);
    const pontos = typeof it.pontos === 'number' ? it.pontos : Math.round(score * maxP * 100) / 100;
    return {
      pergunta_id: pid,
      score: Math.max(0, Math.min(1, score)),
      pontos,
      feedback: it.feedback || it.comentario || '',
      evidencias: it.evidencias || ''
    };
  });
}

export default { evaluate };
