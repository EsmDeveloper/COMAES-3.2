import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Certificate = sequelize.define('Certificate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'id' },
    onDelete: 'CASCADE'
  },
  tournament_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'torneios', key: 'id' },
    onDelete: 'CASCADE'
  },
  score: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  ranking_position: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  certificate_code: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  certificate_url: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  disciplina: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'certificates',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  paranoid: true,
});

export default Certificate;
