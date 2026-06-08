'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Migration para melhorar sistema de certificados
     * - Suportar certificação automática para top 3
     * - Rastrear torneios e posições
     */
    
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('📋 [Migration] Iniciando: Melhorar sistema de certificados');
      
      // 1. Verificar se tabela certificados existe
      const tableExists = await queryInterface.sequelize.query(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='certificados'",
        { transaction }
      );
      
      if (tableExists.length === 0) {
        console.log('⚠️ Tabela certificados não encontrada. Criando...');
        
        await queryInterface.createTable(
          'certificados',
          {
            id: {
              type: Sequelize.INTEGER,
              primaryKey: true,
              autoIncrement: true
            },
            usuario_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: 'usuarios', key: 'id' },
              onDelete: 'CASCADE'
            },
            torneio_id: {
              type: Sequelize.INTEGER,
              allowNull: true,
              references: { model: 'torneios', key: 'id' },
              onDelete: 'CASCADE'
            },
            posicao: {
              type: Sequelize.INTEGER,
              allowNull: true,
              comment: 'Posição no torneio (1, 2 ou 3 para certificado)'
            },
            auto_gerado: {
              type: Sequelize.BOOLEAN,
              defaultValue: false,
              comment: 'Indica se foi gerado automaticamente pelo sistema'
            },
            data_geracao: {
              type: Sequelize.DATE,
              defaultValue: Sequelize.NOW
            },
            conteudo: {
              type: Sequelize.TEXT,
              allowNull: true,
              comment: 'Conteúdo HTML/PDF do certificado'
            }
          },
          { transaction }
        );
        
        console.log('✅ Tabela certificados criada');
      } else {
        console.log('ℹ️ Tabela certificados já existe. Adicionando colunas se necessário...');
        
        // Adicionar colunas se não existirem
        try {
          await queryInterface.addColumn(
            'certificados',
            'torneio_id',
            {
              type: Sequelize.INTEGER,
              allowNull: true,
              references: { model: 'torneios', key: 'id' },
              onDelete: 'CASCADE'
            },
            { transaction }
          );
          console.log('✅ Coluna torneio_id adicionada');
        } catch (e) {
          if (!e.message.includes('duplicate column')) throw e;
          console.log('ℹ️ Coluna torneio_id já existe');
        }
        
        try {
          await queryInterface.addColumn(
            'certificados',
            'auto_gerado',
            {
              type: Sequelize.BOOLEAN,
              defaultValue: false,
              comment: 'Indica se foi gerado automaticamente'
            },
            { transaction }
          );
          console.log('✅ Coluna auto_gerado adicionada');
        } catch (e) {
          if (!e.message.includes('duplicate column')) throw e;
          console.log('ℹ️ Coluna auto_gerado já existe');
        }
      }
      
      // 2. Criar índices para melhor performance
      try {
        await queryInterface.addIndex(
          'certificados',
          ['usuario_id'],
          { name: 'idx_cert_usuario', transaction }
        );
        console.log('✅ Índice idx_cert_usuario criado');
      } catch (e) {
        if (!e.message.includes('UNIQUE constraint failed')) {
          console.log('ℹ️ Índice idx_cert_usuario já existe ou erro menor');
        }
      }
      
      try {
        await queryInterface.addIndex(
          'certificados',
          ['torneio_id'],
          { name: 'idx_cert_torneio', transaction }
        );
        console.log('✅ Índice idx_cert_torneio criado');
      } catch (e) {
        if (!e.message.includes('UNIQUE constraint failed')) {
          console.log('ℹ️ Índice idx_cert_torneio já existe ou erro menor');
        }
      }
      
      try {
        await queryInterface.addIndex(
          'certificados',
          ['auto_gerado', 'torneio_id'],
          { name: 'idx_cert_auto_torneio', transaction }
        );
        console.log('✅ Índice idx_cert_auto_torneio criado');
      } catch (e) {
        if (!e.message.includes('UNIQUE constraint failed')) {
          console.log('ℹ️ Índice idx_cert_auto_torneio já existe ou erro menor');
        }
      }
      
      await transaction.commit();
      console.log('✅ Migration completada: Certificados');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erro na migration:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔙 [Migration] Revertendo: Certificados');
      
      // Não fazer downgrade da tabela certificados por ser crítica
      // Apenas remover novos índices
      try {
        await queryInterface.removeIndex(
          'certificados',
          'idx_cert_auto_torneio',
          { transaction }
        );
      } catch (e) {
        console.log('ℹ️ Índice idx_cert_auto_torneio não encontrado');
      }
      
      try {
        await queryInterface.removeIndex(
          'certificados',
          'idx_cert_torneio',
          { transaction }
        );
      } catch (e) {
        console.log('ℹ️ Índice idx_cert_torneio não encontrado');
      }
      
      try {
        await queryInterface.removeIndex(
          'certificados',
          'idx_cert_usuario',
          { transaction }
        );
      } catch (e) {
        console.log('ℹ️ Índice idx_cert_usuario não encontrado');
      }
      
      await transaction.commit();
      console.log('✅ Revert completado (preservando dados)');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erro ao fazer revert:', error);
      throw error;
    }
  }
};
