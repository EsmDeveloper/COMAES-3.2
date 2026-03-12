import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const RedefinicaoSenha = sequelize.define('RedefinicaoSenha', {
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
  hash_token: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  expira_em: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  usado_em: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  criado_em: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'redefinicoes_senha',
  timestamps: false,
});

export default RedefinicaoSenha;
