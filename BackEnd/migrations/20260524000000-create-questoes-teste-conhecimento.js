export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('questoes_teste_conhecimento', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    enunciado: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    opcoes: {
      type: Sequelize.JSON,
      allowNull: false
    },
    resposta_correta: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    dificuldade: {
      type: Sequelize.ENUM('facil', 'medio', 'dificil'),
      allowNull: false,
      defaultValue: 'medio'
    },
    categoria: {
      type: Sequelize.ENUM('matematica', 'programacao', 'ingles', 'cultura_geral'),
      allowNull: false
    },
    pontos: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 10
    },
    ativo: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
    }
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  });

  // Adicionar índices
  await queryInterface.addIndex('questoes_teste_conhecimento', ['categoria']);
  await queryInterface.addIndex('questoes_teste_conhecimento', ['dificuldade']);
  await queryInterface.addIndex('questoes_teste_conhecimento', ['ativo']);
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('questoes_teste_conhecimento');
};
