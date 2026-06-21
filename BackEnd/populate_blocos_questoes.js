/**
 * populate_blocos_questoes.js
 * Script para popular blocos com questões do sistema
 * 
 * Execução: node populate_blocos_questoes.js
 */

import sequelize from './config/db.js';
import Questao from './models/Questao.js';
import BlocoQuestoes from './models/BlocoQuestoes.js';

const populate = async () => {
  try {
    console.log('📚 Iniciando população de blocos com questões...\n');

    // Buscar blocos publicados
    const blocos = await BlocoQuestoes.findAll({
      where: { status: 'publicado' }
    });

    if (blocos.length === 0) {
      console.log('❌ Nenhum bloco publicado encontrado!');
      process.exit(1);
    }

    console.log(`✅ ${blocos.length} blocos encontrados\n`);

    // Para cada bloco, buscar questões correspondentes e vincular
    for (const bloco of blocos) {
      console.log(`🔗 Vinculando questões ao bloco: ${bloco.titulo}`);
      
      // Buscar questões que correspondem à disciplina do bloco
      const questoes = await Questao.findAll({
        where: {
          disciplina: bloco.disciplina,
          dificuldade: bloco.dificuldade,
          status_aprovacao: 'aprovada'
        },
        limit: 10
      });

      if (questoes.length === 0) {
        console.log(`   ⚠️ Nenhuma questão encontrada para este bloco`);
        
        // Criar questões de exemplo se não houver nenhuma
        console.log(`   📝 Criando questões de exemplo...`);
        
        const exemplos = {
          matematica: [
            { 
              titulo: 'Multiplicação Básica - ' + bloco.dificuldade,
              descricao: `Quanto é 12 × 3? (${bloco.dificuldade})`,
              tipo: 'multipla_escolha',
              opcoes: JSON.stringify(['30', '36', '42', '48']),
              resposta_correta: '36',
              pontos: 10
            },
            {
              titulo: 'Divisão Básica - ' + bloco.dificuldade,
              descricao: `Quanto é 48 ÷ 4? (${bloco.dificuldade})`,
              tipo: 'multipla_escolha',
              opcoes: JSON.stringify(['10', '12', '14', '16']),
              resposta_correta: '12',
              pontos: 10
            },
            {
              titulo: 'Porcentagem - ' + bloco.dificuldade,
              descricao: `Quanto é 25% de 100? (${bloco.dificuldade})`,
              tipo: 'multipla_escolha',
              opcoes: JSON.stringify(['20', '25', '30', '35']),
              resposta_correta: '25',
              pontos: 15
            }
          ],
          ingles: [
            {
              titulo: 'Vocabulary - ' + bloco.dificuldade,
              descricao: `Qual é a tradução de "livro"? (${bloco.dificuldade})`,
              tipo: 'multipla_escolha',
              opcoes: JSON.stringify(['Book', 'Pen', 'Desk', 'Chair']),
              resposta_correta: 'Book',
              pontos: 10
            },
            {
              titulo: 'Phrasal Verbs - ' + bloco.dificuldade,
              descricao: `O que significa "look after"? (${bloco.dificuldade})`,
              tipo: 'multipla_escolha',
              opcoes: JSON.stringify(['Procurar', 'Cuidar', 'Ver', 'Seguir']),
              resposta_correta: 'Cuidar',
              pontos: 15
            },
            {
              titulo: 'Grammar - ' + bloco.dificuldade,
              descricao: `Complete: "I ___ to the store yesterday" (${bloco.dificuldade})`,
              tipo: 'multipla_escolha',
              opcoes: JSON.stringify(['go', 'goes', 'went', 'going']),
              resposta_correta: 'went',
              pontos: 10
            }
          ],
          programacao: [
            {
              titulo: 'Variáveis - ' + bloco.dificuldade,
              descricao: `Como declarar uma variável em JavaScript? (${bloco.dificuldade})`,
              tipo: 'multipla_escolha',
              opcoes: JSON.stringify(['var x;', 'let x;', 'const x;', 'Todas as anteriores']),
              resposta_correta: 'Todas as anteriores',
              pontos: 10
            },
            {
              titulo: 'Loops - ' + bloco.dificuldade,
              descricao: `Qual loop executa enquanto a condição for verdadeira? (${bloco.dificuldade})`,
              tipo: 'multipla_escolha',
              opcoes: JSON.stringify(['for', 'while', 'do...while', 'forEach']),
              resposta_correta: 'while',
              pontos: 15
            },
            {
              titulo: 'Funções - ' + bloco.dificuldade,
              descricao: `O que é uma função? (${bloco.dificuldade})`,
              tipo: 'multipla_escolha',
              opcoes: JSON.stringify(['Um bloco reutilizável de código', 'Uma variável', 'Um tipo de dado', 'Um operador']),
              resposta_correta: 'Um bloco reutilizável de código',
              pontos: 10
            }
          ]
        };

        const novasQuestoes = exemplos[bloco.disciplina] || [];
        for (const exemplo of novasQuestoes) {
          await Questao.create({
            ...exemplo,
            disciplina: bloco.disciplina,
            dificuldade: bloco.dificuldade,
            status_aprovacao: 'aprovada',
            autor_id: 1, // Admin
            pontos: exemplo.pontos || 10
          });
        }
        console.log(`   ✅ ${novasQuestoes.length} questões de exemplo criadas`);
      } else {
        console.log(`   ✅ ${questoes.length} questões vinculadas`);
      }
    }

    console.log('\n');
    console.log('✅ POPULAÇÃO DE BLOCOS CONCLUÍDA COM SUCESSO!');
    console.log('\n');

    console.log('📊 RESUMO:');
    for (const bloco of blocos) {
      const countQuestoes = await Questao.count({
        where: {
          disciplina: bloco.disciplina,
          dificuldade: bloco.dificuldade,
          status_aprovacao: 'aprovada'
        }
      });
      console.log(`   • ${bloco.titulo}: ${countQuestoes} questões`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante população:', error);
    process.exit(1);
  }
};

populate();
