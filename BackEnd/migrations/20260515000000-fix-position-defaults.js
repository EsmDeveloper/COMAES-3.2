/**
 * Migration: Fix Position Defaults
 * 
 * Remove the 9999 default position value and recalculate all rankings
 * to ensure participants show correct positions even with 0 points.
 */

export const up = async (queryInterface, Sequelize) => {
  const transaction = await queryInterface.sequelize.transaction();
  
  try {
    console.log('🔄 Iniciando migração: Fix Position Defaults');

    // 1. Alterar a coluna posicao para aceitar NULL como padrão
    console.log('📝 Alterando coluna posicao para DEFAULT NULL...');
    await queryInterface.changeColumn(
      'participantes_torneios',
      'posicao',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      { transaction }
    );

    // 2. Atualizar todos os registros com posicao = 9999 para NULL
    console.log('🔄 Atualizando registros com posicao = 9999 para NULL...');
    await queryInterface.sequelize.query(
      `UPDATE participantes_torneios SET posicao = NULL WHERE posicao = 9999`,
      { transaction }
    );

    // 3. Recalcular rankings para todos os torneios ativos
    console.log('📊 Recalculando rankings...');
    
    // Buscar todos os torneios únicos
    const [torneios] = await queryInterface.sequelize.query(
      `SELECT DISTINCT torneio_id, disciplina_competida 
       FROM participantes_torneios 
       WHERE status = 'confirmado'
       ORDER BY torneio_id, disciplina_competida`,
      { transaction }
    );

    console.log(`📋 Encontrados ${torneios.length} combinações torneio/disciplina para recalcular`);

    // Para cada combinação torneio/disciplina, recalcular posições
    for (const { torneio_id, disciplina_competida } of torneios) {
      // Buscar participantes ordenados por pontuação (DESC) e data de entrada (ASC)
      const [participantes] = await queryInterface.sequelize.query(
        `SELECT id, pontuacao 
         FROM participantes_torneios 
         WHERE torneio_id = ? 
           AND disciplina_competida = ? 
           AND status = 'confirmado'
         ORDER BY pontuacao DESC, entrou_em ASC`,
        {
          replacements: [torneio_id, disciplina_competida],
          transaction
        }
      );

      if (participantes.length === 0) continue;

      // Agrupar por pontuação para tratar empates
      const gruposPorPontuacao = {};
      participantes.forEach(p => {
        const pontuacao = parseFloat(p.pontuacao || 0).toFixed(2);
        if (!gruposPorPontuacao[pontuacao]) {
          gruposPorPontuacao[pontuacao] = [];
        }
        gruposPorPontuacao[pontuacao].push(p.id);
      });

      const pontuacoesOrdenadas = Object.keys(gruposPorPontuacao)
        .sort((a, b) => parseFloat(b) - parseFloat(a));

      let posicaoAtual = 1;

      // Atualizar posições
      for (const pontuacao of pontuacoesOrdenadas) {
        const ids = gruposPorPontuacao[pontuacao];
        
        // Todos os participantes com a mesma pontuação recebem a mesma posição
        await queryInterface.sequelize.query(
          `UPDATE participantes_torneios 
           SET posicao = ? 
           WHERE id IN (${ids.join(',')})`,
          {
            replacements: [posicaoAtual],
            transaction
          }
        );

        posicaoAtual += ids.length;
      }

      console.log(`  ✅ Torneio ${torneio_id} - ${disciplina_competida}: ${participantes.length} participantes atualizados`);
    }

    await transaction.commit();
    console.log('✅ Migração concluída com sucesso!');
    
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Erro na migração:', error);
    throw error;
  }
};

export const down = async (queryInterface, Sequelize) => {
  const transaction = await queryInterface.sequelize.transaction();
  
  try {
    console.log('🔄 Revertendo migração: Fix Position Defaults');

    // Reverter para o valor padrão antigo (9999)
    await queryInterface.changeColumn(
      'participantes_torneios',
      'posicao',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 9999
      },
      { transaction }
    );

    // Atualizar registros NULL de volta para 9999
    await queryInterface.sequelize.query(
      `UPDATE participantes_torneios SET posicao = 9999 WHERE posicao IS NULL`,
      { transaction }
    );

    await transaction.commit();
    console.log('✅ Reversão concluída');
    
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Erro na reversão:', error);
    throw error;
  }
};
