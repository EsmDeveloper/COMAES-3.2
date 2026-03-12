import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const TicketSuporte = sequelize.define('TicketSuporte', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'usuarios', key: 'id' },
  },
  assunto: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  mensagem: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('aberto', 'pendente', 'fechado'),
    defaultValue: 'aberto',
  },
  prioridade: {
    type: DataTypes.ENUM('baixa', 'media', 'alta'),
    defaultValue: 'media',
  },
  atribuido_para: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'usuarios', key: 'id' },
  },
  criado_em: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  atualizado_em: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  fechado_em: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'tickets_suporte',
  timestamps: false,
  indexes: [
    { fields: ['usuario_id'] },
    { fields: ['status'] },
  ],
});

export default TicketSuporte;
