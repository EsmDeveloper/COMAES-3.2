import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

/**
 * BlocoQuestoes
 * Repositório de blocos de questões — entidade independente de torneios.
 * Um bloco agrupa questões por disciplina e dificuldade.
 * Pode ser associado a zero ou mais torneios via TorneioBloco.
 */
const BlocoQuestoes = sequelize.define('BlocoQuestoes', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Título é obrigatório' },
      len: { args: [3, 255], msg: 'Título deve ter entre 3 e 255 caracteres' },
    },
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  disciplina: {
    type: DataTypes.ENUM('matematica', 'ingles', 'programacao'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['matematica', 'ingles', 'programacao']],
        msg: 'Disciplina inválida',
      },
    },
  },
  dificuldade: {
    type: DataTypes.ENUM('facil', 'medio', 'dificil'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['facil', 'medio', 'dificil']],
        msg: 'Dificuldade inválida',
      },
    },
  },
  status: {
    type: DataTypes.ENUM('rascunho', 'publicado'),
    allowNull: false,
    defaultValue: 'rascunho',
  },
  criado_por: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'id' },
    onDelete: 'RESTRICT',
  },
}, {
  tableName: 'blocos_questoes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['disciplina'] },
    { fields: ['dificuldade'] },
    { fields: ['status'] },
    { fields: ['criado_por'] },
  ],
});

export default BlocoQuestoes;
