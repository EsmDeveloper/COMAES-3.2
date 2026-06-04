/**
 * Migration: Create Rankings Table
 * 
 * Cria tabela agregada para rankings educacionais gamificados COMAES
 * Armazena pontuações totais e posições por usuário e disciplina
 */

export const up = async (queryInterface, Sequelize) => {
  const transaction = await queryInterface.sequelize.transaction();
  
  try {
    console.log('🔄 Iniciando migração: Create Rankings Table');

    // Criar tabela rankings
    await queryInterface.createTable('rankings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      disciplina: {
        type: Sequelize.ENUM('matematica', 'programacao', 'ingles', 'geral'),
        allowNull: false
      },
      pontuacao_total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      pontuacao_mat: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      pontuacao_prog: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      pontuacao_ing: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      pontuacao_testes: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      posicao_geral: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Posição no ranking geral'
      },
      posicao_disciplina: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Posição específica por disciplina'
      },
      data_atualizacao: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    }, { transaction });

    // Adicionar índices para performance
    console.log('📊 Adicionando índices para performance...');
    
    // Índice composto para queries frequentes
    await queryInterface.addIndex(
      'rankings',
      ['disciplina', 'pontuacao_total'],
      {
        name: 'idx_rankings_disciplina_pontuacao',
        transaction
      }
    );

    // Índice para ranking geral
    await queryInterface.addIndex(
      'rankings',
      ['pontuacao_total'],
      {
        name: 'idx_rankings_pontuacao_total',
        transaction
      }
    );

    // Índice para ranking por usuário
    await queryInterface.addIndex(
      'rankings',
      ['usuario_id', 'disciplina'],
      {
        name: 'idx_rankings_usuario_disciplina',
        unique: true,
        transaction
      }
    );

    await transaction.commit();
    console.log('✅ Tabela rankings criada com sucesso');
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Erro na migração:', error);
    throw error;
  }
};

export const down = async (queryInterface, Sequelize) => {
  const transaction = await queryInterface.sequelize.transaction();
  
  try {
    console.log('🔄 Revertendo migração: Create Rankings Table');

    // Remover índices
    await queryInterface.removeIndex('rankings', 'idx_rankings_usuario_disciplina', { transaction });
    await queryInterface.removeIndex('rankings', 'idx_rankings_pontuacao_total', { transaction });
    await queryInterface.removeIndex('rankings', 'idx_rankings_disciplina_pontuacao', { transaction });

    // Remover tabela
    await queryInterface.dropTable('rankings', { transaction });

    await transaction.commit();
    console.log('✅ Revert concluído com sucesso');
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Erro no revert:', error);
    throw error;
  }
};