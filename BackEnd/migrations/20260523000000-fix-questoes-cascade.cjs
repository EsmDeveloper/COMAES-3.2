module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Check if questoes table exists
      const tableExists = await queryInterface.showAllTables();
      if (!tableExists.includes('questoes')) {
        console.log('ℹ️  Tabela questoes não existe ainda, pulando');
        return;
      }

      // Remove orphaned rows first (questões com torneio_id que não existe)
      try {
        await queryInterface.sequelize.query(`
          DELETE FROM questoes 
          WHERE torneio_id NOT IN (SELECT id FROM torneios)
        `);
        console.log('✅ Linhas órfãs removidas de questoes');
      } catch (e) {
        console.log('ℹ️  Nenhuma linha órfã encontrada');
      }

      // Try to remove the constraint if it exists
      try {
        const constraints = await queryInterface.showConstraints('questoes');
        const hasFk = constraints.some(c => c.name === 'questoes_ibfk_1');
        
        if (hasFk) {
          await queryInterface.removeConstraint('questoes', 'questoes_ibfk_1');
          console.log('ℹ️  Removida constraint existente');
        }
      } catch (e) {
        console.log('ℹ️  Nenhuma constraint anterior encontrada');
      }
      
      // Add the constraint with CASCADE
      await queryInterface.addConstraint('questoes', {
        fields: ['torneio_id'],
        type: 'foreign key',
        name: 'questoes_ibfk_1',
        references: {
          table: 'torneios',
          field: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      
      console.log('✅ Constraint de questoes adicionada/atualizada com CASCADE');
    } catch (error) {
      console.error('❌ Erro na migração:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      const tableExists = await queryInterface.showAllTables();
      if (!tableExists.includes('questoes')) {
        return;
      }

      // Try to remove the constraint
      try {
        await queryInterface.removeConstraint('questoes', 'questoes_ibfk_1');
        console.log('✅ Constraint removida');
      } catch (e) {
        console.log('ℹ️  Constraint não encontrada');
      }
    } catch (error) {
      console.error('❌ Erro ao reverter:', error.message);
    }
  }
};
