import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Disciplina = sequelize.define(
  'Disciplina',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'Nome da disciplina é obrigatório',
        },
        len: {
          args: [1, 100],
          msg: 'Nome deve ter entre 1 e 100 caracteres',
        },
      },
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'Slug é obrigatório',
        },
      },
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cor: {
      type: DataTypes.STRING(7),
      allowNull: true,
      validate: {
        is: {
          args: [/^#[0-9A-Fa-f]{6}$/],
          msg: 'Cor deve ser um código hexadecimal válido (ex: #FF5733)',
        },
      },
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'disciplinas',
    timestamps: true,
    underscored: true,
  }
);

export default Disciplina;
