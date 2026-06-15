import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

/**
 * BlocoQuestaoItem
 * Tabela de junção N:M entre BlocoQuestoes e QuestaoTesteConhecimento.
 * Permite que uma questão pertença a múltiplos blocos.
 */
const BlocoQuestaoItem = sequelize.define('BlocoQuestaoItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  bloco_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'blocos_questoes', key: 'id' },
    onDelete: 'CASCADE',
  },
  questao_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'questoes', key: 'id' },
    onDelete: 'CASCADE',
  },
  ordem: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'bloco_questoes_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['bloco_id'] },
    { fields: ['questao_id'] },
    { unique: true, fields: ['bloco_id', 'questao_id'], name: 'uk_bloco_questao' },
  ],
});

export default BlocoQuestaoItem;
