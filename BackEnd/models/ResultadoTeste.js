import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ResultadoTeste = sequelize.define('ResultadoTeste', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'id' },
    onDelete: 'CASCADE',
  },
  area: {
    type: DataTypes.ENUM('matematica', 'programacao', 'ingles'),
    allowNull: false,
  },
  percentual_acertos: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
  },
  pontos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  total_questoes: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  },
  acertos: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'resultados_teste',
  timestamps: false,
  createdAt: false,
  updatedAt: false,
  indexes: [
    { fields: ['usuario_id', 'area'] },
    { fields: ['usuario_id'] },
  ],
});

export default ResultadoTeste;
