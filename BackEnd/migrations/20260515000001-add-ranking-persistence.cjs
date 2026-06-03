/**
 * Migration: Add Ranking Persistence
 * 
 * Adiciona campos para controlar o congelamento de posição e sincronização de ranking:
 * - posicao_congelada: boolean - indica se a posição foi finalizada/congelada
 * - tempo_congelamento: timestamp - quando a posição foi congelada
 * - ranking_sincronizado: boolean - indica se ranking foi sincronizado para relatório
 */

export const up = async (queryInterface, Sequelize) => {
  const transaction = await queryInterface.sequelize.transaction();
  
  try {
    console.log('🔄 Iniciando migração: Add Ranking Persistence');

    // 1. Adicionar coluna posicao_congelada
    console.log('📝 Adicionando coluna posicao_congelada...');
    await queryInterface.addColumn(
      'participantes_torneios',
      'posicao_congelada',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      { transaction }
    );

    // 2. Adicionar coluna tempo_congelamento
    console.log('📝 Adicionando coluna tempo_congelamento...');
    await queryInterface.addColumn(
      'participantes_torneios',
      'tempo_congelamento',
      {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      },
      { transaction }
    );

    // 3. Adicionar índice para performance em queries de ranking
    console.log('📊 Adicionando índices de performance...');
    await queryInterface.addIndex(
      'participantes_torneios',
      ['torneio_id', 'disciplina_competida', 'status', 'posicao'],
      { transaction }
    );

    await transaction.commit();
    console.log('✅ Migração concluída com sucesso');
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Erro na migração:', error);
    throw error;
  }
};

export const down = async (queryInterface, Sequelize) => {
  const transaction = await queryInterface.sequelize.transaction();
  
  try {
    console.log('🔄 Revertendo migração: Add Ranking Persistence');

    // Remover índice
    await queryInterface.removeIndex(
      'participantes_torneios',
      ['torneio_id', 'disciplina_competida', 'status', 'posicao'],
      { transaction }
    );

    // Remover colunas
    await queryInterface.removeColumn(
      'participantes_torneios',
      'tempo_congelamento',
      { transaction }
    );

    await queryInterface.removeColumn(
      'participantes_torneios',
      'posicao_congelada',
      { transaction }
    );

    await transaction.commit();
    console.log('✅ Revert concluído com sucesso');
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Erro no revert:', error);
    throw error;
  }
};
