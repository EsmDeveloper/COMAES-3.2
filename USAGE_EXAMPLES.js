// 📚 EXEMPLO DE USO - Sistema de Avaliação com IA v2.0

// ============================================================
// EXEMPLO 1: MATEMÁTICA - Resposta Correta
// ============================================================

const exemplo1_matematica_correto = {
  usuario_id: 1,
  disciplina: "Matemática",
  respostas: [
    {
      pergunta_id: 101,
      texto: "Resolva a equação: 2x + 5 = 13",
      resposta: `
        Passo 1: 2x + 5 = 13
        Passo 2: 2x = 13 - 5
        Passo 3: 2x = 8
        Passo 4: x = 8 ÷ 2
        Passo 5: x = 4
      `,
      nivel: "facil"
    }
  ]
};

// Resultado Esperado:
// {
//   "success": true,
//   "data": {
//     "participante": { ... },
//     "feedbacks": [
//       {
//         "pergunta_id": 101,
//         "score": 1.0,
//         "pontos": 5.0,
//         "feedback": "Resolução perfeita! Todos os passos estão corretos.",
//         "evidencias": "Isolamento de x correto em cada etapa."
//       }
//     ],
//     "totalPontos": 5.0
//   }
// }

// ============================================================
// EXEMPLO 2: MATEMÁTICA - Resposta com Erros Parciais
// ============================================================

const exemplo2_matematica_parcial = {
  usuario_id: 2,
  disciplina: "Matemática",
  respostas: [
    {
      pergunta_id: 102,
      texto: "Calcule a área de um retângulo com base 5 e altura 3",
      resposta: `
        A = base × altura
        A = 5 × 3
        A = 16
      `,
      nivel: "facil"
    }
  ]
};

// Resultado Esperado:
// {
//   "feedbacks": [
//     {
//       "pergunta_id": 102,
//       "score": 0.5,
//       "pontos": 2.5,
//       "feedback": "Fórmula correta (A = b×h), mas cálculo errado. 5×3=15, não 16.",
//       "evidencias": "Passos corretos: 2. Passos errados: 1."
//     }
//   ]
// }

// ============================================================
// EXEMPLO 3: PROGRAMAÇÃO - Resposta Correta
// ============================================================

const exemplo3_programacao_correto = {
  usuario_id: 3,
  disciplina: "Programação",
  respostas: [
    {
      pergunta_id: 201,
      texto: "Escreva uma função que retorna o maior número de um array",
      resposta: `
        function maximo(arr) {
          if (arr.length === 0) return null;
          let max = arr[0];
          for (let i = 1; i < arr.length; i++) {
            if (arr[i] > max) {
              max = arr[i];
            }
          }
          return max;
        }
      `,
      nivel: "medio"
    }
  ]
};

// Resultado Esperado:
// {
//   "feedbacks": [
//     {
//       "pergunta_id": 201,
//       "score": 1.0,
//       "pontos": 10.0,
//       "feedback": "Algoritmo correto, geral, sem hard-coded. Trata caso vazio.",
//       "evidencias": "Entrada validada, processamento correto, saída esperada."
//     }
//   ]
// }

// ============================================================
// EXEMPLO 4: PROGRAMAÇÃO - Hard-Coded (Errado)
// ============================================================

const exemplo4_programacao_hardcoded = {
  usuario_id: 4,
  disciplina: "Programação",
  respostas: [
    {
      pergunta_id: 202,
      texto: "Valide se um email tem formato correto",
      resposta: `
        function validaEmail(email) {
          return email === "aluno@gmail.com";  // ❌ Hard-coded!
        }
      `,
      nivel: "facil"
    }
  ]
};

// Resultado Esperado:
// {
//   "feedbacks": [
//     {
//       "pergunta_id": 202,
//       "score": 0.0,
//       "pontos": 0.0,
//       "feedback": "Solução hard-coded para um caso específico. Não funciona como algoritmo geral.",
//       "evidencias": "Falta completamente a lógica de validação de email."
//     }
//   ]
// }

// ============================================================
// EXEMPLO 5: INGLÊS - Redação Correta
// ============================================================

const exemplo5_ingles_correto = {
  usuario_id: 5,
  disciplina: "Inglês",
  respostas: [
    {
      pergunta_id: 301,
      texto: "Write about your favorite hobby",
      resposta: `
        My favorite hobby is reading. I have been passionate about 
        books since childhood. Reading allows me to explore different 
        worlds and expand my knowledge. Every evening, I dedicate at 
        least one hour to reading various genres. This hobby has greatly 
        improved my vocabulary and critical thinking skills. I recommend 
        reading to everyone who wants to grow intellectually.
      `,
      nivel: "medio"
    }
  ]
};

// Resultado Esperado:
// {
//   "feedbacks": [
//     {
//       "pergunta_id": 301,
//       "score": 1.0,
//       "pontos": 10.0,
//       "feedback": "Redação excelente! Gramaticalmente perfeita, tema bem desenvolvido, boa coesão.",
//       "evidencias": "Estrutura: introdução, desenvolvimento, conclusão. Sem erros."
//     }
//   ]
// }

// ============================================================
// EXEMPLO 6: INGLÊS - Com Erros Menores
// ============================================================

const exemplo6_ingles_com_erros = {
  usuario_id: 6,
  disciplina: "Inglês",
  respostas: [
    {
      pergunta_id: 302,
      texto: "Tell me about your family",
      resposta: `
        My family is very important for me. I has three members: 
        my mother, my father and my brother. We lives together in 
        a nice house. Every day, we going to spend time together. 
        I love my family very much.
      `,
      nivel: "facil"
    }
  ]
};

// Resultado Esperado:
// {
//   "feedbacks": [
//     {
//       "pergunta_id": 302,
//       "score": 0.6,
//       "pontos": 3.0,
//       "feedback": "Conteúdo relevante e compreensível, mas com erros gramaticais. Ex: 'I has' deveria ser 'I have'.",
//       "evidencias": "Trechos corretos: 3/5. Erros: has/have, lives/live, going/go."
//     }
//   ]
// }

// ============================================================
// Como Usar estes Exemplos
// ============================================================

/*
1. Abra o terminal e navegue para o servidor:
   cd BackEnd
   npm run dev

2. Em outro terminal, use curl para testar:
   
   curl -X POST http://localhost:5000/api/avaliar \
     -H "Content-Type: application/json" \
     -d '{"usuario_id": 1, "disciplina": "Matemática", "respostas": [...]}'

3. Ou use Postman/Insomnia para testar interativamente

4. Verifique a resposta e os scores retornados
*/

// ============================================================
// Estrutura de Resposta Completa
// ============================================================

const estruturaRespostaCompleta = {
  success: true,
  data: {
    participante: {
      id: 1,
      usuario_id: 1,
      torneio_id: 1,
      disciplina_competida: "Matemática",
      pontuacao: 15.5,  // Total acumulado
      casos_resolvidos: 3,
      status: "confirmado",
      historico_pontuacao: [
        {
          pontos: 5.0,
          descricao: "Avaliação IA (Matemática)",
          data: "2026-04-16T10:30:00.000Z"
        }
      ]
    },
    feedbacks: [
      {
        pergunta_id: 1,
        score: 1.0,  // 0.0 a 1.0
        pontos: 5.0,  // Calculado automaticamente
        feedback: "Explicação clara do que foi avaliado",
        evidencias: "Detalhes técnicos da avaliação"
      }
    ],
    totalPontos: 5.0  // Soma de todos os feedbacks
  }
};

// ============================================================
// Notas Importantes
// ============================================================

/*
1. SCORING
   - Score 1.0 = 100% correto
   - Score 0.0 = Completamente errado
   - Score 0.5 = Meio caminho percorrido
   
2. PONTOS CALCULADOS AUTOMATICAMENTE
   Pontos = Score × NívelMax
   - Fácil: 5 pontos máximo
   - Médio: 10 pontos máximo
   - Difícil: 20 pontos máximo

3. FEEDBACK
   - Sempre detalhado
   - Explica quais passos estão corretos/errados
   - Específico por disciplina

4. EXEMPLOS IMPORTANTES
   - Resposta grande ≠ Nota alta (avalia qualidade)
   - Resultado certo sem passos = Nota zero (em Matemática)
   - Hard-coded detectado = Nota zero (em Programação)
   - Pequenos erros gramaticais = Nota parcial (em Inglês)

5. TIMEOUT
   - Máximo 10 segundos por avaliação
   - Se exceder, erro é retornado
   - Retry automático com gpt-3.5-turbo se gpt-4 falhar
*/

// ============================================================
// Teste Rápido com Node.js
// ============================================================

/*
Se quiser testar a função diretamente sem API:

import { evaluate } from './services/iaEvaluators.js';

const items = [
  {
    pergunta_id: 1,
    texto: "Resolva: 2x + 3 = 7",
    resposta: "2x = 4, x = 2",
    nivel: "facil"
  }
];

const resultados = await evaluate("Matemática", items);
console.log(JSON.stringify(resultados, null, 2));
*/

// ============================================================
// Troubleshooting
// ============================================================

/*
PROBLEMA: "OPENAI_API_KEY não definido"
SOLUÇÃO: Adicione ao BackEnd/.env e reinicie o servidor

PROBLEMA: "Não foi possível parsear JSON da resposta da IA"
SOLUÇÃO: Execute novamente (pode ser timeout)

PROBLEMA: Scores parecem incorretos
SOLUÇÃO: Execute: node BackEnd/services/test-evaluation.js

PROBLEMA: Avaliação muito lenta (>10s)
SOLUÇÃO: Normal para gpt-4-turbo, considere usar gpt-3.5-turbo como fallback
*/
