/**
 * create_math_blocks_test.js
 * 
 * Script para criar blocos de questões de Matemática a partir de um colaborador existente
 * Fluxo completo: Questões → Blocos → Aprovação
 * 
 * Execução: node create_math_blocks_test.js
 */

import sequelize from './config/db.js';
import Usuario from './models/User.js';
import BlocoQuestoes from './models/BlocoQuestoes.js';
import BlocoQuestaoItem from './models/BlocoQuestaoItem.js';
import QuestaoTesteConhecimento from './models/QuestaoTesteConhecimento.js';
import { setupAssociations } from './models/associations.js';

// Setup associações
setupAssociations();

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function criarBlocosMatematica() {
  try {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🧪 TEST: Criar Blocos de Questões de Matemática');
    console.log('═══════════════════════════════════════════════════════════\n');

    // ─────────────────────────────────────────────────────────────────────────
    // PASSO 1: Encontrar colaborador aprovado de Matemática
    // ─────────────────────────────────────────────────────────────────────────
    
    console.log('1️⃣  Buscando colaborador aprovado de Matemática...\n');
    
    const colaborador = await Usuario.findOne({
      where: {
        role: 'colaborador',
        status_colaborador: 'aprovado',
        disciplina_colaborador: 'matematica'
      }
    });

    if (!colaborador) {
      console.log('❌ Nenhum colaborador aprovado de Matemática encontrado!');
      console.log('   Criando colaborador de teste...\n');
      
      const novoColaborador = await Usuario.create({
        nome: 'Prof. Matemática Test',
        username: 'prof_mat_' + Date.now(),
        email: 'prof_mat_' + Date.now() + '@test.com',
        telefone: '+258' + Math.random().toString().substring(2, 11),
        nascimento: new Date('1990-01-15'),
        sexo: 'Masculino',
        password: 'TempPass123!@#',
        role: 'colaborador',
        disciplina_colaborador: 'matematica',
        status_colaborador: 'aprovado',
        nivel_academico: 'licenciado',
        biografia: 'Colaborador de teste para criar blocos de Matemática'
      });
      
      console.log(`✅ Colaborador criado: ID ${novoColaborador.id}`);
      console.log(`   Nome: ${novoColaborador.nome}`);
      console.log(`   Email: ${novoColaborador.email}`);
      console.log(`   Disciplina: ${novoColaborador.disciplina_colaborador}\n`);
      
      return await criarBlocosComColaborador(novoColaborador);
    }

    console.log(`✅ Colaborador encontrado!`);
    console.log(`   ID: ${colaborador.id}`);
    console.log(`   Nome: ${colaborador.nome}`);
    console.log(`   Email: ${colaborador.email}`);
    console.log(`   Status: ${colaborador.status_colaborador}`);
    console.log(`   Disciplina: ${colaborador.disciplina_colaborador}\n`);

    return await criarBlocosComColaborador(colaborador);

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error(error);
    process.exit(1);
  }
}

async function criarBlocosComColaborador(colaborador) {
  try {
    // ─────────────────────────────────────────────────────────────────────────
    // PASSO 2: Criar questões de Matemática
    // ─────────────────────────────────────────────────────────────────────────
    
    console.log('2️⃣  Criando questões de Matemática...\n');

    // Questões de múltipla escolha - usando QuestaoTesteConhecimento com campos corretos
    const questoesMathML = [
      {
        enunciado: 'Qual é a raiz quadrada de 144?',
        categoria: 'matematica',
        dificuldade: 'facil',
        opcoes: [
          { texto: '10', correta: false },
          { texto: '12', correta: true },
          { texto: '14', correta: false },
          { texto: '16', correta: false }
        ],
        resposta_correta: '12',
        pontos: 10
      },
      {
        enunciado: 'Resolva: 2x + 5 = 13',
        categoria: 'matematica',
        dificuldade: 'facil',
        opcoes: [
          { texto: 'x = 3', correta: false },
          { texto: 'x = 4', correta: true },
          { texto: 'x = 5', correta: false },
          { texto: 'x = 6', correta: false }
        ],
        resposta_correta: 'x = 4',
        pontos: 10
      },
      {
        enunciado: 'Qual é a área de um círculo com raio 5?',
        categoria: 'matematica',
        dificuldade: 'medio',
        opcoes: [
          { texto: '78,5', correta: true },
          { texto: '31,4', correta: false },
          { texto: '25', correta: false },
          { texto: '100', correta: false }
        ],
        resposta_correta: '78,5',
        pontos: 15
      },
      {
        enunciado: 'Qual é o valor de log₁₀(100)?',
        categoria: 'matematica',
        dificuldade: 'medio',
        opcoes: [
          { texto: '1', correta: false },
          { texto: '2', correta: true },
          { texto: '3', correta: false },
          { texto: '10', correta: false }
        ],
        resposta_correta: '2',
        pontos: 15
      },
      {
        enunciado: 'Qual é a derivada de f(x) = 3x²?',
        categoria: 'matematica',
        dificuldade: 'dificil',
        opcoes: [
          { texto: 'f\'(x) = 3x', correta: false },
          { texto: 'f\'(x) = 6x', correta: true },
          { texto: 'f\'(x) = 3', correta: false },
          { texto: 'f\'(x) = x', correta: false }
        ],
        resposta_correta: 'f\'(x) = 6x',
        pontos: 20
      },
      {
        enunciado: 'Qual é a solução de x² - 5x + 6 = 0?',
        categoria: 'matematica',
        dificuldade: 'medio',
        opcoes: [
          { texto: 'x = 2 e x = 3', correta: true },
          { texto: 'x = 1 e x = 6', correta: false },
          { texto: 'x = -2 e x = -3', correta: false },
          { texto: 'x = 0 e x = 5', correta: false }
        ],
        resposta_correta: 'x = 2 e x = 3',
        pontos: 15
      }
    ];

    const questoesCriadas = [];

    for (const q of questoesMathML) {
      const questao = await QuestaoTesteConhecimento.create({
        enunciado: q.enunciado,
        categoria: q.categoria,
        dificuldade: q.dificuldade,
        opcoes: q.opcoes,
        resposta_correta: q.resposta_correta,
        pontos: q.pontos,
        ativo: true
      });
      questoesCriadas.push(questao);
      console.log(`   ✅ Questão criada: "${q.enunciado.substring(0, 50)}..." (ID: ${questao.id})`);
    }

    console.log(`\n✅ Total de questões criadas: ${questoesCriadas.length}\n`);

    // ─────────────────────────────────────────────────────────────────────────
    // PASSO 3: Criar blocos de questões
    // ─────────────────────────────────────────────────────────────────────────
    
    console.log('3️⃣  Criando blocos de questões...\n');

    const blocos = [
      {
        titulo: 'Matemática Básica - Fundamentos',
        descricao: 'Bloco de questões básicas: raízes quadradas, equações lineares e cálculos simples',
        dificuldade: 'facil',
        questoes: [questoesCriadas[0], questoesCriadas[1]]  // 2 questões fáceis
      },
      {
        titulo: 'Matemática Intermediária - Álgebra e Geometria',
        descricao: 'Questões de nível médio cobrindo geometria, logaritmos e equações quadráticas',
        dificuldade: 'medio',
        questoes: [questoesCriadas[2], questoesCriadas[3], questoesCriadas[5]]  // 3 questões médias
      },
      {
        titulo: 'Cálculo Diferencial - Conceitos Avançados',
        descricao: 'Questões de cálculo e análise matemática para alunos avançados',
        dificuldade: 'dificil',
        questoes: [questoesCriadas[4]]  // 1 questão difícil (precisamos de mais para 5)
      }
    ];

    // Adicionar questões extras ao terceiro bloco para chegar a 5
    console.log('   ⚠️  Adicionando questões extras para atingir mínimo de 5...\n');
    
    // Criar mais questões rápidas
    for (let i = 0; i < 4; i++) {
      const extraQ = await QuestaoTesteConhecimento.create({
        enunciado: `Exercício Adicional ${i+1} - Cálculo: Calcule a integral indefinida de x²`,
        categoria: 'matematica',
        dificuldade: 'dificil',
        opcoes: [
          { texto: 'x³/3 + C', correta: true },
          { texto: 'x³ + C', correta: false },
          { texto: 'x²/2 + C', correta: false },
          { texto: '2x + C', correta: false }
        ],
        resposta_correta: 'x³/3 + C',
        pontos: 20,
        ativo: true
      });
      blocos[2].questoes.push(extraQ);
      console.log(`   ✅ Questão extra criada: ID ${extraQ.id}`);
    }

    console.log('\n');

    const blocosCriados = [];

    for (const b of blocos) {
      const bloco = await BlocoQuestoes.create({
        titulo: b.titulo,
        descricao: b.descricao,
        disciplina: 'matematica',
        dificuldade: b.dificuldade,
        status: 'pendente',
        contexto: 'torneio',
        criado_por: colaborador.id
      });

      // Associar questões ao bloco
      for (let i = 0; i < b.questoes.length; i++) {
        await BlocoQuestaoItem.create({
          bloco_id: bloco.id,
          questao_id: b.questoes[i].id,
          ordem: i + 1
        });
      }

      blocosCriados.push({ ...bloco.toJSON(), total_questoes: b.questoes.length });
      console.log(`✅ Bloco criado: "${b.titulo}"`);
      console.log(`   ID: ${bloco.id}`);
      console.log(`   Dificuldade: ${b.dificuldade}`);
      console.log(`   Questões: ${b.questoes.length}`);
      console.log(`   Status: ${bloco.status}\n`);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PASSO 4: Verificar fluxo
    // ─────────────────────────────────────────────────────────────────────────
    
    console.log('4️⃣  Verificando fluxo de aprovação...\n');

    // Contar blocos pendentes
    const blocosPendentes = await BlocoQuestoes.count({
      where: { status: 'pendente', disciplina: 'matematica' }
    });

    const questoesPublicadas = await QuestaoTesteConhecimento.count({
      where: { 
        categoria: 'matematica',
        ativo: true
      }
    });

    console.log(`📊 Estatísticas:`);
    console.log(`   Blocos pendentes (Matemática): ${blocosPendentes}`);
    console.log(`   Total de questões (Matemática): ${questoesPublicadas}`);
    console.log(`   Colaborador: ${colaborador.nome} (ID: ${colaborador.id})\n`);

    // ─────────────────────────────────────────────────────────────────────────
    // PASSO 5: Resumo Final
    // ─────────────────────────────────────────────────────────────────────────
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ TESTE CONCLUÍDO COM SUCESSO');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('📋 RESUMO:');
    console.log(`   ✅ Questões criadas: ${questoesCriadas.length}`);
    console.log(`   ✅ Blocos criados: ${blocosCriados.length}`);
    console.log(`   ✅ Total em blocos: ${blocosCriados.reduce((sum, b) => sum + b.total_questoes, 0)} questões`);
    console.log(`   ✅ Status: Pendente (aguardando aprovação do admin)\n`);

    console.log('🔗 PRÓXIMOS PASSOS:');
    console.log('   1. Acesse o Painel Admin');
    console.log('   2. Vá para: Blocos de Questões Pendentes (ou similar)');
    console.log('   3. Revise os blocos criados');
    console.log('   4. Clique em "Aprovar Bloco"');
    console.log('   5. Após aprovação, use os blocos para criar torneios\n');

    console.log('🧪 TESTES POSTERIORES:');
    console.log('   - Teste criar torneio com os blocos aprovados');
    console.log('   - Teste o fluxo completo: Questões → Blocos → Torneio\n');

    console.log('📁 IDs para Referência:');
    blocosCriados.forEach((b, i) => {
      console.log(`   Bloco ${i+1}: ID ${b.id} - "${b.titulo}"`);
    });
    console.log('');

    process.exit(0);

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error(error);
    process.exit(1);
  }
}

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Executar
criarBlocosMatematica();
