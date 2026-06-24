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
    type: DataTypes.ENUM('rascunho', 'pendente', 'aprovado', 'rejeitado'),
    allowNull: false,
    defaultValue: 'rascunho',
    comment: 'Status do bloco: rascunho (em criação), pendente (submetido, aguardando aprovação), aprovado (pronto para usar), rejeitado (recusado pelo admin)',
  },
  aprovado_por_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'usuarios', key: 'id' },
    onDelete: 'SET NULL',
    comment: 'ID do admin que aprovou o bloco',
  },
  data_aprovacao: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data e hora da aprovação',
  },
  motivo_rejeicao: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Motivo da rejeição (se aplicável)',
  },
  observacoes_admin: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações do admin sobre o bloco',
  },
  contexto: {
    type: DataTypes.ENUM('torneio', 'teste'),
    allowNull: true,
    defaultValue: 'torneio',
    comment: 'Contexto do bloco: torneio (para competições) ou teste (para testes de conhecimento)',
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
    { fields: ['aprovado_por_id'] },
  ],
});

export default BlocoQuestoes;
