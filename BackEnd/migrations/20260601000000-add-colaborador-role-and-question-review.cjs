'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if role column exists before adding
    const [roles] = await queryInterface.sequelize.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_NAME = 'usuarios' 
      AND TABLE_SCHEMA = DATABASE()
      AND COLUMN_NAME = 'role'
    `);
    
    if (roles.length === 0) {
      await queryInterface.addColumn('usuarios', 'role', {
        type: Sequelize.ENUM('estudante', 'colaborador', 'admin'),
        allowNull: false,
        defaultValue: 'estudante',
      });
      console.log('✅ Coluna role adicionada');
    } else {
      console.log('ℹ️  Coluna role já existe, pulando...');
    }

    // Check if disciplina_colaborador column exists before adding
    const [disciplinas] = await queryInterface.sequelize.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_NAME = 'usuarios' 
      AND TABLE_SCHEMA = DATABASE()
      AND COLUMN_NAME = 'disciplina_colaborador'
    `);
    
    if (disciplinas.length === 0) {
      await queryInterface.addColumn('usuarios', 'disciplina_colaborador', {
        type: Sequelize.ENUM('matematica', 'ingles', 'programacao'),
        allowNull: true,
      });
      console.log('✅ Coluna disciplina_colaborador adicionada');
    } else {
      console.log('ℹ️  Coluna disciplina_colaborador já existe, pulando...');
    }

    // Check torneio_id column
    const [torneidId] = await queryInterface.sequelize.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_NAME = 'questoes' 
      AND TABLE_SCHEMA = DATABASE()
      AND COLUMN_NAME = 'torneio_id'
    `);
    
    if (torneidId.length > 0) {
      await queryInterface.changeColumn('questoes', 'torneio_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'torneios', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      console.log('✅ Coluna torneio_id atualizada');
    }

    // Check if autor_id column exists before adding
    const [autorId] = await queryInterface.sequelize.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_NAME = 'questoes' 
      AND TABLE_SCHEMA = DATABASE()
      AND COLUMN_NAME = 'autor_id'
    `);
    
    if (autorId.length === 0) {
      await queryInterface.addColumn('questoes', 'autor_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'usuarios', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
      console.log('✅ Coluna autor_id adicionada');
    } else {
      console.log('ℹ️  Coluna autor_id já existe, pulando...');
    }

    // Check if status_aprovacao column exists before adding
    const [statusAprov] = await queryInterface.sequelize.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_NAME = 'questoes' 
      AND TABLE_SCHEMA = DATABASE()
      AND COLUMN_NAME = 'status_aprovacao'
    `);
    
    if (statusAprov.length === 0) {
      await queryInterface.addColumn('questoes', 'status_aprovacao', {
        type: Sequelize.ENUM('pendente', 'aprovada', 'rejeitada'),
        allowNull: false,
        defaultValue: 'aprovada',
      });
      console.log('✅ Coluna status_aprovacao adicionada');
    } else {
      console.log('ℹ️  Coluna status_aprovacao já existe, pulando...');
    }

    // Check if revisado_por column exists before adding
    const [revisadoPor] = await queryInterface.sequelize.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_NAME = 'questoes' 
      AND TABLE_SCHEMA = DATABASE()
      AND COLUMN_NAME = 'revisado_por'
    `);
    
    if (revisadoPor.length === 0) {
      await queryInterface.addColumn('questoes', 'revisado_por', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'usuarios', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
      console.log('✅ Coluna revisado_por adicionada');
    } else {
      console.log('ℹ️  Coluna revisado_por já existe, pulando...');
    }

    // Check if revisado_em column exists before adding
    const [revisadoEm] = await queryInterface.sequelize.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_NAME = 'questoes' 
      AND TABLE_SCHEMA = DATABASE()
      AND COLUMN_NAME = 'revisado_em'
    `);
    
    if (revisadoEm.length === 0) {
      await queryInterface.addColumn('questoes', 'revisado_em', {
        type: Sequelize.DATE,
        allowNull: true,
      });
      console.log('✅ Coluna revisado_em adicionada');
    } else {
      console.log('ℹ️  Coluna revisado_em já existe, pulando...');
    }

    // Check if motivo_rejeicao column exists before adding
    const [motivoRej] = await queryInterface.sequelize.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_NAME = 'questoes' 
      AND TABLE_SCHEMA = DATABASE()
      AND COLUMN_NAME = 'motivo_rejeicao'
    `);
    
    if (motivoRej.length === 0) {
      await queryInterface.addColumn('questoes', 'motivo_rejeicao', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
      console.log('✅ Coluna motivo_rejeicao adicionada');
    } else {
      console.log('ℹ️  Coluna motivo_rejeicao já existe, pulando...');
    }

    // Check and add indexes
    try {
      await queryInterface.addIndex('questoes', ['autor_id']);
      console.log('✅ Índice autor_id adicionado');
    } catch (e) {
      console.log('ℹ️  Índice autor_id já existe');
    }
    
    try {
      await queryInterface.addIndex('questoes', ['status_aprovacao']);
      console.log('✅ Índice status_aprovacao adicionado');
    } catch (e) {
      console.log('ℹ️  Índice status_aprovacao já existe');
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('questoes', ['status_aprovacao']);
    await queryInterface.removeIndex('questoes', ['autor_id']);
    await queryInterface.removeColumn('questoes', 'motivo_rejeicao');
    await queryInterface.removeColumn('questoes', 'revisado_em');
    await queryInterface.removeColumn('questoes', 'revisado_por');
    await queryInterface.removeColumn('questoes', 'status_aprovacao');
    await queryInterface.removeColumn('questoes', 'autor_id');
    await queryInterface.changeColumn('questoes', 'torneio_id', {
      type: queryInterface.sequelize.Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'torneios', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.removeColumn('usuarios', 'disciplina_colaborador');
    await queryInterface.removeColumn('usuarios', 'role');
  },
};
