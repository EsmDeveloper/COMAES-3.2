import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Mapeia o nível de dificuldade para pontuação máxima
 * Fácil: 5 pontos, Médio: 10 pontos, Difícil: 20 pontos
 */
const getMaxPontos = (nivel) => {
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
    return `Você é um avaliador especializado em Matemática para fins educacionais.
Sua tarefa é avaliar respostas estudantis com foco em CLAREZA e LÓGICA do raciocínio.

CRITÉRIOS DE AVALIAÇÃO:
1. **Resposta Totalmente Correta (1.0)**: Resultado correto + todos os passos claros
2. **Resposta Parcial (0.1 a 0.9)**: Demonstra compreensão com alguns erros
3. **Resposta Incorreta (0.0)**: Sem lógica correta

IMPORTANTE: Avalie a CLAREZA e LÓGICA, não o tamanho do texto.

RETORNE um array JSON VÁLIDO com este formato EXATO para CADA resposta:
[{
  "pergunta_id": <número>,
  "score": <0.0 a 1.0>,
  "pontos": <número>,
  "feedback": "<explicação>",
  "evidencias": "<detalhes>"
}]`;
  }

  if (/programa/i.test(normDisciplina)) {
    return `Você é um avaliador especializado em Programação para fins educacionais.
Sua tarefa é avaliar respostas estudantis com foco em CLAREZA e LÓGICA do algoritmo.

CRITÉRIOS DE AVALIAÇÃO:
1. **Resposta Totalmente Correta (1.0)**: Algoritmo correto + lógica clara + sem hard-coding
2. **Resposta Parcial (0.1 a 0.9)**: Demonstra compreensão com alguns componentes errados
3. **Resposta Incorreta (0.0)**: Lógica fundamentalmente errada

IMPORTANTE: Avalie a CLAREZA e LÓGICA, não o tamanho do código. Detecte hard-coding.

RETORNE um array JSON VÁLIDO com este formato EXATO para CADA resposta:
[{
  "pergunta_id": <número>,
  "score": <0.0 a 1.0>,
  "pontos": <número>,
  "feedback": "<explicação>",
  "evidencias": "<detalhes>"
}]`;
  }

  return `Você é um avaliador especializado em Inglês para fins educacionais.
Sua tarefa é avaliar respostas estudantis com foco em CLAREZA, COESÃO e LÓGICA.

CRITÉRIOS DE AVALIAÇÃO:
1. **Resposta Totalmente Correta (1.0)**: Texto correto + coeso + atende ao solicitado
2. **Resposta Parcial (0.1 a 0.9)**: Demonstra compreensão com alguns erros
3. **Resposta Incorreta (0.0)**: Sem coerência ou fora de contexto

IMPORTANTE: Avalie a CLAREZA e COESÃO, não o número de palavras.

RETORNE um array JSON VÁLIDO com este formato EXATO para CADA resposta:
[{
  "pergunta_id": <número>,
  "score": <0.0 a 1.0>,
  "pontos": <número>,
  "feedback": "<explicação>",
  "evidencias": "<detalhes>"
}]`;
};

/**
 * Avalia respostas usando Google Gemini
 */

export async function evaluate(disciplina, items) {
  if (!items || items.length === 0) return [];

  if (!GEMINI_API_KEY) {
    throw new Error('❌ GEMINI_API_KEY não definido. Configure a variável de ambiente antes de usar o sistema de avaliação.');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const systemPrompt = buildSystemPrompt(disciplina);

  // Construir conteúdo do usuário com informações detalhadas
  const userContent = items
    .map(it => {
      return `ID: ${it.pergunta_id}
Dificuldade: ${it.nivel || 'fácil'}
Enunciado:
${it.texto}

Resposta do aluno:
${it.resposta}`;
    })
    .join('\n\n---\n\n');

  const evaluationPrompt = `${systemPrompt}

Avalie rigorosamente as seguintes respostas estudantis.

Pontuação por nível: fácil (até 5 pontos), médio (até 10 pontos), difícil (até 20 pontos).

Para CADA resposta, retorne um JSON válido com score entre 0.0 e 1.0 e os pontos calculados proporcionalmente.

Respostas a avaliar:

${userContent}

Retorne um array JSON VÁLIDO com todas as avaliações.`;

  try {
    console.log('📤 Enviando para Google Gemini...');
    const result = await model.generateContent({
      systemInstruction: systemPrompt,
      contents: [
        {
          role: 'user',
          parts: [{ text: evaluationPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 2048,
      }
    });

    const responseText = result.response.text();

    if (!responseText) {
      console.error('Resposta do Gemini sem texto válido:', JSON.stringify(result.response, null, 2));
      throw new Error('Resposta vazia do Gemini');
    }

    console.log('📥 Resposta recebida do Gemini');

    // Extrair JSON do texto
    const match = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
    let parsed = null;

    try {
      parsed = match ? JSON.parse(match[0]) : JSON.parse(responseText);
    } catch (err) {
      console.error('❌ Erro ao parsear JSON:', err.message);
      console.error('Resposta do Gemini:', responseText.substring(0, 500));
      throw new Error(`Falha ao parsear resposta do Gemini: ${err.message}`);
    }

    // Processar e validar respostas
    return (parsed || []).map(it => {
      const pergunta_id = it.pergunta_id || it.id;
      const score = Math.max(0, Math.min(1, Number(it.score || 0)));
      const item = items.find(x => Number(x.pergunta_id) === Number(pergunta_id));
      const nivel = item?.nivel || 'facil';
      const maxPontos = getMaxPontos(nivel);
      const pontos = typeof it.pontos === 'number' ? it.pontos : Math.round(score * maxPontos * 100) / 100;

      return {
        pergunta_id,
        score,
        pontos: Math.round(pontos * 100) / 100,
        feedback: (it.feedback || '').toString(),
        evidencias: (it.evidencias || '').toString()
      };
    });
  } catch (error) {
    console.error('❌ Erro na avaliação com Gemini:', error.message);
    throw error;
  }
}

export default { evaluate };
