'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Migration para adicionar tipos de torneio (genérico vs específico)
     * sem quebrar compatibilidade com dados existentes
     */
    
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('📋 [Migration] Iniciando: Adicionar tipos de torneio');
      
      // 1. Adicionar coluna tipo_torneio com default 'generico'
      await queryInterface.addColumn(
        'torneios',
        'tipo_torneio',
        {
          type: Sequelize.ENUM('generico', 'especifico'),
          defaultValue: 'generico',
          allowNull: false,
          comment: 'Tipo de torneio: generico (multidisciplinar) ou especifico (uma disciplina)'
        },
        { transaction }
      );
      console.log('✅ Coluna tipo_torneio criada');
      
      // 2. Adicionar coluna disciplina_especifica (NULL para genéricos)
      await queryInterface.addColumn(
        'torneios',
        'disciplina_especifica',
        {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Disciplina específica quando tipo_torneio = "especifico"'
        },
        { transaction }
      );
      console.log('✅ Coluna disciplina_especifica criada');
      
      // 3. Adicionar constraint CHECK
      // Nota: SQLite não suporta ADD CONSTRAINT CHECK diretamente como MySQL
      // Então usamos um comentário informativo e validação no código
      console.log('ℹ️ Constraint CHECK será validado em nível de aplicação');
      
      await transaction.commit();
      console.log('✅ Migration completada: Tipos de torneio');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erro na migration:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔙 [Migration] Revertendo: Tipos de torneio');
      
      // Remover em ordem reversa
      await queryInterface.removeColumn(
        'torneios',
        'disciplina_especifica',
        { transaction }
      );
      
      await queryInterface.removeColumn(
        'torneios',
        'tipo_torneio',
        { transaction }
      );
      
      // Remover ENUM se não está sendo usado
      // Nota: Alguns bancos permitem remover ENUM, outros não
      
      await transaction.commit();
      console.log('✅ Revert completado');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erro ao fazer revert:', error);
      throw error;
    }
  }
};
