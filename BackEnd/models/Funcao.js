import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Funcao = sequelize.define('Funcao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: 'funcoes_nome_unique',
  },
  permissoes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  },
  criado_em: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  atualizado_em: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'funcoes',
  timestamps: false,
});

export default Funcao;
