export async function up(sequelize) {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    // Remover a constraint existente
    await queryInterface.removeConstraint('questoes', 'questoes_ibfk_1');
    
    // Adicionar a constraint com CASCADE
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
    
    console.log('✅ Constraint de questoes corrigida com CASCADE');
  } catch (error) {
    console.error('❌ Erro ao corrigir constraint:', error.message);
    throw error;
  }
}

export async function down(sequelize) {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    // Reverter para a constraint original (sem CASCADE)
    await queryInterface.removeConstraint('questoes', 'questoes_ibfk_1');
    
    await queryInterface.addConstraint('questoes', {
      fields: ['torneio_id'],
      type: 'foreign key',
      name: 'questoes_ibfk_1',
      references: {
        table: 'torneios',
        field: 'id'
      }
    });
    
    console.log('⏮️ Constraint de questoes revertida');
  } catch (error) {
    console.error('❌ Erro ao reverter constraint:', error.message);
    throw error;
  }
}
