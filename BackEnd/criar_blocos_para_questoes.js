#!/usr/bin/env node

/**
 * Script para criar blocos de questões e associar as 45 questões inseridas
 * Cria blocos por disciplina e dificuldade, depois associa ao torneio
 */

import sequelize from './config/db.js';
import Torneio from './models/Torneio.js';
import Questao from './models/Questao.js';
import BlocoQuestoes from './models/BlocoQuestoes.js';
import BlocoQuestaoItem from './models/BlocoQuestaoItem.js';
import TorneioBloco from './models/TorneioBloco.js';
import QuestaoTesteConhecimento from './models/QuestaoTesteConhecimento.js';

async function criarBlocosEAssociar() {
  try {
    console.log('🚀 Iniciando criação de blocos para questões...\n');

    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados\n');

    // Encontrar torneio ativo
    let torneio = await Torneio.findOne({
      where: { status: 'ativo' },
      order: [['id', 'DESC']],
    });

    if (!torneio) {
      console.log('⚠️  Nenhum torneio ativo encontrado, usando o mais recente...');
      torneio = await Torneio.findOne({
        order: [['id', 'DESC']],
      });
    }

    console.log(`📌 Torneio: "${torneio.titulo}" (ID: ${torneio.id})\n`);

    const disciplinas = ['matematica', 'ingles', 'programacao'];
    const dificuldades = ['facil', 'medio', 'dificil'];
    const usuarioAdmin = 1; // ID do usuário admin (geralmente 1)

    let blocoscriados = 0;
    let questoesAdicionadas = 0;

    // Criar blocos por disciplina e dificuldade
    for (const disciplina of disciplinas) {
      for (const dificuldade of dificuldades) {
        try {
          console.log(`\n📦 Criando bloco: ${disciplina.toUpperCase()} - ${dificuldade.toUpperCase()}`);

          // Criar bloco
          const bloco = await BlocoQuestoes.create({
            titulo: `${disciplina.charAt(0).toUpperCase() + disciplina.slice(1)} - ${dificuldade.charAt(0).toUpperCase() + dificuldade.slice(1)}`,
            descricao: `Bloco de questões de ${disciplina} com nível de dificuldade ${dificuldade}`,
            disciplina: disciplina,
            dificuldade: dificuldade,
            status: 'publicado',
            criado_por: usuarioAdmin,
          });

          blocosriados++;
          console.log(`   ✓ Bloco criado (ID: ${bloco.id})`);

          // Buscar questões do torneio nesta disciplina e dificuldade
          const questoes = await Questao.findAll({
            where: {
              torneio_id: torneio.id,
              disciplina: disciplina,
              dificuldade: dificuldade,
            },
          });

          console.log(`   📚 Encontradas ${questoes.length} questões`);

          // Adicionar cada questão ao bloco
          for (const questao of questoes) {
            try {
              // Verificar se a questão já existe em QuestaoTesteConhecimento
              let questaoTeste = await QuestaoTesteConhecimento.findOne({
                where: { questao_id: questao.id },
              });

              // Se não existe, criar referência
              if (!questaoTeste) {
                questaoTeste = await QuestaoTesteConhecimento.create({
                  questao_id: questao.id,
                  titulo: questao.titulo,
                  descricao: questao.descricao,
                  disciplina: questao.disciplina,
                  tipo: questao.tipo,
                  dificuldade: questao.dificuldade,
                  opcoes: questao.opcoes,
                  resposta_correta: questao.resposta_correta,
                  explicacao: questao.explicacao,
                  pontos: questao.pontos,
                });
              }

              // Adicionar ao bloco
              await BlocoQuestaoItem.create({
                bloco_id: bloco.id,
                questao_id: questaoTeste.id,
                posicao: questoes.indexOf(questao) + 1,
              });

              questoesAdicionadas++;
            } catch (itemErr) {
              if (!itemErr.message.includes('Duplicate')) {
                console.error(`   ❌ Erro ao adicionar questão ${questao.id}:`, itemErr.message);
              }
            }
          }

          // Associar bloco ao torneio
          try {
            await TorneioBloco.create({
              torneio_id: torneio.id,
              bloco_id: bloco.id,
              status: 'publicado',
            });
            console.log(`   ✓ Bloco associado ao torneio`);
          } catch (assocErr) {
            if (!assocErr.message.includes('Duplicate')) {
              console.error(`   ⚠️  Erro ao associar ao torneio:`, assocErr.message);
            } else {
              console.log(`   ✓ Bloco já associado ao torneio`);
            }
          }

        } catch (blocoErr) {
          console.error(`❌ Erro ao criar bloco ${disciplina}-${dificuldade}:`, blocoErr.message);
        }
      }
    }

    console.log(`\n\n📊 Verificação final...\n`);

    // Verificar blocos criados
    const totalBlocos = await BlocoQuestoes.count({
      where: {
        disciplina: { [sequelize.Op.in]: disciplinas },
        dificuldade: { [sequelize.Op.in]: dificuldades },
      },
    });

    // Verificar associações
    const totalAssociacoes = await TorneioBloco.count({
      where: { torneio_id: torneio.id },
    });

    // Verificar itens
    const totalItens = await BlocoQuestaoItem.count();

    console.log(`✅ Blocos criados: ${totalBlocos}`);
    console.log(`✅ Questões adicionadas: ${questoesAdicionadas}`);
    console.log(`✅ Blocos associados ao torneio: ${totalAssociacoes}`);

    // Listar blocos do torneio
    console.log('\n📋 Blocos do torneio:');
    const blocosDoTorneio = await TorneioBloco.findAll({
      where: { torneio_id: torneio.id },
      include: [
        {
          model: BlocoQuestoes,
          as: 'bloco',
        },
      ],
    });

    for (const tb of blocosDoTorneio) {
      const itens = await BlocoQuestaoItem.count({
        where: { bloco_id: tb.bloco.id },
      });
      console.log(`   • ${tb.bloco.titulo} (${itens} questões)`);
    }

    console.log('\n✅ Blocos criados e questões associadas com sucesso!');
    console.log('\n🔍 As questões agora aparecem no painel administrativo em "Questões (Torneios)"\n');

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
    await sequelize.close();
    process.exit(1);
  }
}

criarBlocosEAssociar();
