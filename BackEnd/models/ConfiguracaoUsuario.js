import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ConfiguracaoUsuario = sequelize.define('ConfiguracaoUsuario', {
  usuario_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'usuarios', key: 'id' },
  },
  preferencias: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  },
  atualizado_em: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'configuracoes_usuario',
  timestamps: false,
});

export default ConfiguracaoUsuario;
