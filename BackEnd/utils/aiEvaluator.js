// Using native Node.js fetch (available in Node.js 18+)
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

async function evaluate(items) {
  // items: [{ pergunta_id, texto, resposta, pontos }]
  if (!items || items.length === 0) return [];

  // If OPENAI_API_KEY provided, call OpenAI Chat Completion to grade answers
  const key = process.env.OPENAI_API_KEY;
  if (key) {
    try {
      const messages = [
        { role: 'system', content: 'Você é um avaliador objetivo que recebe pares pergunta/resposta e retorna uma lista JSON com {pergunta_id, score} onde score está entre 0 e 1, sem explicações.' },
      ];
      const userContent = items.map(it => `ID:${it.pergunta_id}\nQ:${it.texto}\nR:${JSON.stringify(it.resposta)}\nPontos:${it.pontos}`).join('\n---\n');
      messages.push({ role: 'user', content: `Avalie os seguintes pares e devolva apenas JSON válido: [${items.map(it => `{"pergunta_id": ${it.pergunta_id}}`).join(',')}]\n\nDados:\n${userContent}` });

      const body = {
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0,
        max_tokens: 600
      };

      const resp = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify(body)
      });

      const data = await resp.json();
      const text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if (!text) return items.map(it => ({ pergunta_id: it.pergunta_id, score: 0, pontos: it.pontos }));

      // Try to extract JSON from response
      const match = text.match(/\[.*\]/s);
      let parsed = null;
      if (match) parsed = JSON.parse(match[0]);
      if (!parsed) parsed = JSON.parse(text);

      // Map parsed results to items
      return items.map(it => {
        const found = (parsed || []).find(p => Number(p.pergunta_id) === Number(it.pergunta_id));
        return { pergunta_id: it.pergunta_id, score: found && found.score ? Number(found.score) : 0, pontos: it.pontos };
      });
    } catch (err) {
      console.error('AI evaluation error:', err.message || err);
      // fallback
    }
  }

  // Fallback: no AI key or error -> return zeros
  return items.map(it => ({ pergunta_id: it.pergunta_id, score: 0, pontos: it.pontos }));
}

export default { evaluate };
