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
    allowNull: true,
    references: { model: 'torneios', key: 'id' },
    onDelete: 'CASCADE'
  },
  bloco_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'blocos_questoes', key: 'id' },
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
  autor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'usuarios', key: 'id' },
    onDelete: 'SET NULL'
  },
  status_aprovacao: {
    type: DataTypes.ENUM('pendente', 'aprovada', 'rejeitada'),
    allowNull: false,
    defaultValue: 'aprovada',
  },
  revisado_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'usuarios', key: 'id' },
    onDelete: 'SET NULL'
  },
  revisado_em: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  motivo_rejeicao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'questoes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['torneio_id'] },
    { fields: ['bloco_id'] },
    { fields: ['disciplina'] },
    { fields: ['tipo'] },
    { fields: ['autor_id'] },
    { fields: ['status_aprovacao'] },
  ]
});

export default Questao;
