/**
 * Migration: Add Ranking Persistence
 * 
 * Adiciona campos para controlar o congelamento de posição e sincronização de ranking:
 * - posicao_congelada: boolean - indica se a posição foi finalizada/congelada
 * - tempo_congelamento: timestamp - quando a posição foi congelada
 * - ranking_sincronizado: boolean - indica se ranking foi sincronizado para relatório
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Iniciando migração: Add Ranking Persistence');

      // 1. Adicionar coluna posicao_congelada (com tratamento de erro se já existe)
      console.log('📝 Adicionando coluna posicao_congelada...');
      try {
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
      } catch (e) {
        if (!e.message.includes('Duplicate column')) {
          throw e;
        }
        console.log('ℹ️  Coluna posicao_congelada já existe');
      }

      // 2. Adicionar coluna tempo_congelamento (com tratamento de erro se já existe)
      console.log('📝 Adicionando coluna tempo_congelamento...');
      try {
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
      } catch (e) {
        if (!e.message.includes('Duplicate column')) {
          throw e;
        }
        console.log('ℹ️  Coluna tempo_congelamento já existe');
      }

      // 3. Adicionar índice para performance em queries de ranking
      console.log('📊 Adicionando índices de performance...');
      try {
        await queryInterface.addIndex(
          'participantes_torneios',
          ['torneio_id', 'disciplina_competida', 'status', 'posicao'],
          { name: 'idx_part_ranking', transaction }
        );
      } catch (e) {
        if (!e.message.includes('Duplicate')) {
          throw e;
        }
        console.log('ℹ️  Índice já existe');
      }

      await transaction.commit();
      console.log('✅ Migração concluída com sucesso');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erro na migração:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Revertendo migração: Add Ranking Persistence');

      // Remover índice com tratamento de erro
      try {
        await queryInterface.removeIndex(
          'participantes_torneios',
          'idx_part_ranking',
          { transaction }
        );
      } catch (e) {
        console.log('ℹ️  Índice não encontrado');
      }

      // Remover colunas com tratamento de erro
      try {
        await queryInterface.removeColumn(
          'participantes_torneios',
          'tempo_congelamento',
          { transaction }
        );
      } catch (e) {
        console.log('ℹ️  Coluna tempo_congelamento não encontrada');
      }

      try {
        await queryInterface.removeColumn(
          'participantes_torneios',
          'posicao_congelada',
          { transaction }
        );
      } catch (e) {
        console.log('ℹ️  Coluna posicao_congelada não encontrada');
      }

      await transaction.commit();
      console.log('✅ Revert concluído com sucesso');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erro no revert:', error);
      throw error;
    }
  }
};
