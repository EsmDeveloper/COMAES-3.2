// BackEnd/migrations/20260416000000-create-certificados-table.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists
    const tableExists = await queryInterface.showAllTables();
    if (tableExists.includes('certificados')) {
      console.log('⚠️ certificados table already exists, skipping creation');
      return;
    }

    await queryInterface.createTable('certificados', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      torneio_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'torneios', key: 'id' },
        onDelete: 'CASCADE',
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onDelete: 'CASCADE',
      },
      disciplina: {
        type: Sequelize.ENUM('Matemática', 'Inglês', 'Programação'),
        allowNull: false,
      },
      posicao: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '1 para campeão, 2 para vice, 3 para terceiro lugar',
      },
      pontuacao: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      codigo_certificado: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      url_certificado: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      tipo_medalha: {
        type: Sequelize.ENUM('Ouro', 'Prata', 'Bronze'),
        allowNull: false,
      },
      data_geracao: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      data_validacao: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('gerado', 'validado', 'cancelado'),
        defaultValue: 'gerado',
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      criado_em: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      atualizado_em: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Criar índices - but check if they already exist
    try {
      await queryInterface.addIndex('certificados', ['torneio_id']);
    } catch (err) {
      console.log('⚠️ Index on torneio_id already exists');
    }
    try {
      await queryInterface.addIndex('certificados', ['usuario_id']);
    } catch (err) {
      console.log('⚠️ Index on usuario_id already exists');
    }
    try {
      await queryInterface.addIndex('certificados', ['codigo_certificado']);
    } catch (err) {
      console.log('⚠️ Index on codigo_certificado already exists');
    }
    try {
      await queryInterface.addIndex('certificados', ['torneio_id', 'usuario_id', 'disciplina']);
    } catch (err) {
      console.log('⚠️ Composite index already exists');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.showAllTables();
    if (tableExists.includes('certificados')) {
      await queryInterface.dropTable('certificados');
    }
  }
};
