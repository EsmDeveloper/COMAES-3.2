import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const QuestaoTesteConhecimento = sequelize.define('QuestaoTesteConhecimento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  enunciado: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  opcoes: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Array com as opções de resposta'
  },
  resposta_correta: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  dificuldade: {
    type: DataTypes.ENUM('facil', 'medio', 'dificil'),
    allowNull: false,
    defaultValue: 'medio'
  },
  categoria: {
    type: DataTypes.ENUM('matematica', 'programacao', 'ingles', 'cultura_geral'),
    allowNull: false,
  },
  pontos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  tableName: 'questoes_teste_conhecimento',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['categoria'] },
    { fields: ['dificuldade'] },
    { fields: ['ativo'] },
  ]
});

export default QuestaoTesteConhecimento;
