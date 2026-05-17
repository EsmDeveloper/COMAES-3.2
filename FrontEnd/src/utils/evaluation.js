// src/utils/evaluation.js
/**
 * Simulação de IA para avaliação de respostas abertas.
 * Estratégia:
 * 1️⃣ Normaliza a frase (lower‑case, remove pontuação).
 * 2️⃣ Conta palavras‑chave definidas pelo autor da questão.
 * 3️⃣ Calcula similaridade baseada em “Jaccard” (interseção / união).
 * 4️⃣ Produz nota (0‑10) e mensagem de feedback.
 */

export const evaluateOpenAnswer = (
  userAnswer,
  expectedAnswer,
  keywords = []
) => {
  // Normalização simples
  const normalize = (s) =>
    s
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim();

  const u = normalize(userAnswer);
  const e = normalize(expectedAnswer);

  // 1️⃣ Palavras‑chave
  const foundKeywords = keywords.filter((k) => u.includes(k.toLowerCase()));
  const keywordScore = (foundKeywords.length / keywords.length) * 4; // até 4 pts

  // 2️⃣ Similaridade Jaccard de token sets
  const set = (str) => new Set(str.split(/\s+/));
  const iu = set(u);
  const ie = set(e);
  const intersection = new Set([...iu].filter((x) => ie.has(x)));
  const union = new Set([...iu, ...ie]);
  const jaccard = union.size ? intersection.size / union.size : 0;
  const similarityScore = jaccard * 5; // até 5 pts

  // 3️⃣ Coerência (comprimento aproximado)
  const lengthRatio = Math.min(u.length, e.length) / Math.max(u.length, e.length);
  const lengthScore = lengthRatio * 1; // até 1 pt

  // Nota final (0‑10)
  const raw = keywordScore + similarityScore + lengthScore;
  const score = Math.min(10, Math.round(raw));

  // Mensagem de feedback inteligente
  let feedback = 'Obrigado pela resposta! ';
  if (score === 10) {
    feedback += 'Excelente! Você cobriu todos os pontos principais. 🎉';
  } else if (score >= 7) {
    feedback +=
      'Muito bom! Você identificou a maior parte dos conceitos, porém falta algum detalhe. 🤔';
  } else if (score >= 4) {
    feedback +=
      'Parcialmente correto. Alguns conceitos importantes estão ausentes ou incompletos. 🛠️';
  } else {
    feedback +=
      'Resposta distante do esperado. Vamos revisar o conteúdo e tentar novamente. 📚';
  }

  return { score, feedback };
};
