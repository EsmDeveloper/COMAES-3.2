import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Questao = sequelize.define('Questao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  torneio_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'torneios', key: 'id' },
    onDelete: 'CASCADE'
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  disciplina: {
    type: DataTypes.ENUM('matematica', 'ingles', 'programacao'),
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM('multipla_escolha', 'texto', 'codigo'),
    allowNull: false,
  },
  dificuldade: {
    type: DataTypes.ENUM('facil', 'medio', 'dificil'),
    allowNull: false,
  },
  opcoes: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  resposta_correta: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  explicacao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  pontos: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  linguagem: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  midia: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'questoes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['torneio_id'] },
    { fields: ['disciplina'] },
    { fields: ['tipo'] },
  ]
});

export default Questao;
