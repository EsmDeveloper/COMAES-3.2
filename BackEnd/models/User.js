import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: 'usuarios_telefone_unique',
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: 'usuarios_email_unique',
    validate: {
      isEmail: true,
    },
  },
  nascimento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  sexo: {
    type: DataTypes.ENUM("Masculino", "Feminino"),
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  escola: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  imagem: {
    type: DataTypes.STRING(1024),
    allowNull: true,
  },
  biografia: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
}, {
  tableName: "usuarios",
  timestamps: true,
  defaultScope: {
    attributes: { exclude: ['password'] }
  }
});

export default Usuario;