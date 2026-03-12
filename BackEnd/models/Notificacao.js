import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Notificacao = sequelize.define('Notificacao', {
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
  tipo: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  conteudo: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  lido: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  criado_em: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  lido_em: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'notificacoes',
  timestamps: false,
  indexes: [
    { fields: ['usuario_id'] },
    { fields: ['lido'] },
  ],
});

export default Notificacao;
