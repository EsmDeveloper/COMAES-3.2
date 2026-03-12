import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const TentativaTeste = sequelize.define('TentativaTeste', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'id' },
  },
  iniciado_em: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  concluido_em: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  respostas: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  pontuacao: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('em_progresso', 'concluida', 'cancelada'),
    defaultValue: 'em_progresso',
  },
  duracao_segundos: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'tentativas_teste',
  timestamps: false,
  indexes: [
    { fields: ['usuario_id'] },
  ],
});

export default TentativaTeste;
