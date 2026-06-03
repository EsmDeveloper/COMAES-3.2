import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

/**
 * SequenciaAprendizagem — tabela `sequencias_aprendizagem`
 *
 * Um registo por utilizador (UNIQUE em usuario_id).
 * Guarda streak_atual, streak_maximo e a última data de atividade.
 */
const SequenciaAprendizagem = sequelize.define('SequenciaAprendizagem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: { model: 'usuarios', key: 'id' },
    onDelete: 'CASCADE',
  },
  streak_atual: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  streak_maximo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  ultima_data_atividade: {
    type: DataTypes.DATEONLY, // Apenas a data, sem hora
    allowNull: true,
  },
}, {
  tableName: 'sequencias_aprendizagem',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em',
  indexes: [
    { unique: true, fields: ['usuario_id'] },
  ],
});

export default SequenciaAprendizagem;
