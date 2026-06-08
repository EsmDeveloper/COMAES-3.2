'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if column already exists
      const tableDesc = await queryInterface.describeTable('usuarios');
      if (tableDesc.status_colaborador) {
        console.log('ℹ️  Coluna status_colaborador já existe');
        return;
      }

      // Adicionar campo status_colaborador
      await queryInterface.addColumn('usuarios', 'status_colaborador', {
        type: Sequelize.ENUM('pendente', 'aprovado', 'rejeitado'),
        allowNull: false,
        defaultValue: 'pendente',
      });

      // Atualizar colaboradores existentes para aprovado (já foram aprovados por admin)
      await queryInterface.sequelize.query(`
        UPDATE usuarios 
        SET status_colaborador = 'aprovado' 
        WHERE role = 'colaborador'
      `);

      // Atualizar estudantes e admins para aprovado (não precisam de aprovação)
      await queryInterface.sequelize.query(`
        UPDATE usuarios 
        SET status_colaborador = 'aprovado' 
        WHERE role IN ('estudante', 'admin')
      `);

      console.log('✅ Coluna status_colaborador adicionada');
    } catch (error) {
      console.error('❌ Erro:', error.message);
      throw error;
    }
  },

  down: async (queryInterface) => {
    try {
      const tableDesc = await queryInterface.describeTable('usuarios');
      if (tableDesc.status_colaborador) {
        await queryInterface.removeColumn('usuarios', 'status_colaborador');
        console.log('✅ Coluna removida');
      }
    } catch (error) {
      console.error('❌ Erro:', error.message);
    }
  },
};