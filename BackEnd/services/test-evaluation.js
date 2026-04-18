import { evaluate } from './iaEvaluators.js';

/**
 * Script de teste para validar os novos critérios de avaliação
 * Executa: node test-evaluation.js
 */

// ============================================================
// TESTES DE MATEMÁTICA
// ============================================================

const testesMatematica = [
  {
    nome: "Resposta Correta - Equação de Segundo Grau",
    disciplina: "Matemática",
    items: [
      {
        pergunta_id: 1,
        texto: "Resolva: 2x² + 5x - 3 = 0",
        resposta: `
          Passo 1: a=2, b=5, c=-3
          Passo 2: Δ = b² - 4ac = 25 - 4(2)(-3) = 25 + 24 = 49
          Passo 3: x = (-5 ± √49) / (2·2) = (-5 ± 7) / 4
          Passo 4: x₁ = (-5 + 7) / 4 = 2/4 = 0.5
          Passo 5: x₂ = (-5 - 7) / 4 = -12/4 = -3
        `,
        nivel: "medio"
      }
    ],
    esperado: {
      score: 1.0,
      pontos: 10,
      descricao: "Todos os passos corretos"
    }
  },
  {
    nome: "Resposta Parcial - Erros Intermediários",
    disciplina: "Matemática",
    items: [
      {
        pergunta_id: 2,
        texto: "Calcule a área de um círculo com raio 5",
        resposta: `
          Passo 1: A = π × r²
          Passo 2: A = 3.14 × 5²
          Passo 3: A = 3.14 × 25
          Passo 4: A = 78.5
        `,
        nivel: "facil"
      }
    ],
    esperado: {
      score: 0.75,
      pontos: 3.75,
      descricao: "Fórmula e cálculo corretos, mas π aproximado"
    }
  },
  {
    nome: "Resposta Completamente Errada",
    disciplina: "Matemática",
    items: [
      {
        pergunta_id: 3,
        texto: "Quanto é 5 + 3?",
        resposta: "5 + 3 = 9",
        nivel: "facil"
      }
    ],
    esperado: {
      score: 0.0,
      pontos: 0,
      descricao: "Resultado incorreto"
    }
  }
];

// ============================================================
// TESTES DE PROGRAMAÇÃO
// ============================================================

const testesProgramacao = [
  {
    nome: "Código Correto - Validação Geral",
    disciplina: "Programação",
    items: [
      {
        pergunta_id: 1,
        texto: "Escreva uma função que valida se um número é par",
        resposta: `
          function eh_par(n) {
            return n % 2 === 0;
          }
          // Funciona para qualquer número
        `,
        nivel: "facil"
      }
    ],
    esperado: {
      score: 1.0,
      pontos: 5,
      descricao: "Algoritmo correto e geral"
    }
  },
  {
    nome: "Código Hard-coded",
    disciplina: "Programação",
    items: [
      {
        pergunta_id: 2,
        texto: "Escreva uma função que valida email",
        resposta: `
          function validaEmail(email) {
            return email === "usuario@gmail.com";
          }
        `,
        nivel: "medio"
      }
    ],
    esperado: {
      score: 0.0,
      pontos: 0,
      descricao: "Hard-coded para um caso específico"
    }
  },
  {
    nome: "Código Parcialmente Correto",
    disciplina: "Programação",
    items: [
      {
        pergunta_id: 3,
        texto: "Encontre o maior número em um array",
        resposta: `
          function maximo(arr) {
            let max = arr[0];  // ✓ Inicialização correta
            for (let i = 0; i < arr.length; i++) {  // ✓ Loop correto
              if (arr[i] > max) {
                max = arr[i];  // Falta comparação incorreta
              }
            }
            return max;  // ✓ Retorno correto
          }
        `,
        nivel: "facil"
      }
    ],
    esperado: {
      score: 0.7,
      pontos: 3.5,
      descricao: "Entrada/processamento/saída ok, mas lógica falha"
    }
  }
];

// ============================================================
// TESTES DE INGLÊS
// ============================================================

const testesIngles = [
  {
    nome: "Redação Perfeita",
    disciplina: "Inglês",
    items: [
      {
        pergunta_id: 1,
        texto: "Write a short essay about your favorite hobby",
        resposta: `
          My favorite hobby is reading. I enjoy reading because it allows me to escape from daily stress and explore different worlds. 
          Every evening, I dedicate at least one hour to reading various genres, from science fiction to mystery novels. 
          This habit has significantly improved my vocabulary and critical thinking skills. 
          I believe reading is one of the most rewarding activities anyone can pursue.
        `,
        nivel: "medio"
      }
    ],
    esperado: {
      score: 1.0,
      pontos: 10,
      descricao: "Redação gramaticamente correta, tema bem desenvolvido"
    }
  },
  {
    nome: "Redação com Erros Menores",
    disciplina: "Inglês",
    items: [
      {
        pergunta_id: 2,
        texto: "Describe your daily routine",
        resposta: `
          Every day, I wake up at 7 o'clock and go to school. 
          I take breakfast and after that, I go to classes.
          I has four classes in the morning.
          In the afternoon, I study and play with my friends.
        `,
        nivel: "facil"
      }
    ],
    esperado: {
      score: 0.65,
      pontos: 3.25,
      descricao: "Conteúdo ok, mas com erros gramaticais (has/have)"
    }
  },
  {
    nome: "Redação Completamente Errada",
    disciplina: "Inglês",
    items: [
      {
        pergunta_id: 3,
        texto: "Tell me about your family",
        resposta: "asdfghjkl zxcvbnm qwerty",
        nivel: "facil"
      }
    ],
    esperado: {
      score: 0.0,
      pontos: 0,
      descricao: "Resposta sem sentido"
    }
  }
];

// ============================================================
// FUNÇÃO DE TESTE
// ============================================================

async function executarTeste(teste) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📝 ${teste.nome}`);
  console.log(`${'='.repeat(60)}`);
  
  try {
    const resultado = await evaluate(teste.disciplina, teste.items);
    
    console.log(`\n✅ Resposta recebida:`, JSON.stringify(resultado, null, 2));
    
    if (resultado.length > 0) {
      const res = resultado[0];
      console.log(`\n📊 Análise:`);
      console.log(`   Score recebido: ${res.score} | Esperado: ~${teste.esperado.score}`);
      console.log(`   Pontos: ${res.pontos} | Esperado: ~${teste.esperado.pontos}`);
      console.log(`   Feedback: ${res.feedback}`);
      
      const scoreDiff = Math.abs(res.score - teste.esperado.score);
      if (scoreDiff <= 0.15) {
        console.log(`\n✅ PASSOU - Score dentro da margem (±0.15)`);
      } else {
        console.log(`\n⚠️ ATENÇÃO - Score diferente do esperado`);
        console.log(`   Esperado: ${teste.esperado.descricao}`);
      }
    }
  } catch (err) {
    console.error(`\n❌ ERRO:`, err.message);
  }
}

// ============================================================
// EXECUÇÃO DOS TESTES
// ============================================================

async function rodarTodosTestes() {
  console.log('\n\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   TESTES DO SISTEMA DE AVALIAÇÃO COM IA (v2.0)           ║');
  console.log('║   Critérios Rigorosos por Disciplina                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  console.log('\n\n🧮 TESTES DE MATEMÁTICA');
  console.log('━'.repeat(60));
  for (const teste of testesMatematica) {
    await executarTeste(teste);
  }

  console.log('\n\n💻 TESTES DE PROGRAMAÇÃO');
  console.log('━'.repeat(60));
  for (const teste of testesProgramacao) {
    await executarTeste(teste);
  }

  console.log('\n\n🌐 TESTES DE INGLÊS');
  console.log('━'.repeat(60));
  for (const teste of testesIngles) {
    await executarTeste(teste);
  }

  console.log('\n\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   TESTES CONCLUÍDOS                                       ║');
  console.log('║   Verifique os resultados acima                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');
}

// Executar
rodarTodosTestes().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
