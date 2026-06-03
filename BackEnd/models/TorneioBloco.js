import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

/**
 * TorneioBloco
 * Tabela de junção N:M entre Torneio e BlocoQuestoes.
 * ON DELETE RESTRICT em bloco_id impede deleção de blocos associados a torneios.
 */
const TorneioBloco = sequelize.define('TorneioBloco', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  torneio_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'torneios', key: 'id' },
    onDelete: 'CASCADE',
  },
  bloco_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'blocos_questoes', key: 'id' },
    onDelete: 'RESTRICT',
  },
  ordem: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'torneio_blocos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['torneio_id'] },
    { fields: ['bloco_id'] },
    { unique: true, fields: ['torneio_id', 'bloco_id'], name: 'uk_torneio_bloco' },
  ],
});

export default TorneioBloco;
