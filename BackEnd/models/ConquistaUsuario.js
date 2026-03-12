import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ConquistaUsuario = sequelize.define('ConquistaUsuario', {
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
  conquista_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'conquistas', key: 'id' },
  },
  concedido_em: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  concedido_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'usuarios', key: 'id' },
  },
}, {
  tableName: 'conquistas_usuario',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['usuario_id', 'conquista_id'] },
    { fields: ['usuario_id'] },
  ],
});

export default ConquistaUsuario;
