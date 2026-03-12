import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Torneio = sequelize.define('Torneio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  inicia_em: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  termina_em: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  criado_por: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'id' },
  },
  status: {
    type: DataTypes.ENUM('rascunho', 'agendado', 'ativo', 'finalizado', 'cancelado'),
    defaultValue: 'rascunho',
  },
  criado_em: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'torneios',
  timestamps: false,
  indexes: [
    { fields: ['criado_por'] },
  ],
});

export default Torneio;
