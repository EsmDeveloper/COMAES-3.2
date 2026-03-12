import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Conquista = sequelize.define('Conquista', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  criterios: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  url_icone: {
    type: DataTypes.STRING(1024),
    allowNull: true,
  },
  criado_em: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'conquistas',
  timestamps: false,
});

export default Conquista;
