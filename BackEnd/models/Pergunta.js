import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Pergunta = sequelize.define('Pergunta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ordem_indice: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM('matematica', 'ingles', 'programacao', 'multipla_escolha', 'texto'),
    allowNull: false,
  },
  texto_pergunta: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  opcao_a: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  opcao_b: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  opcao_c: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  opcao_d: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  resposta_correta: {
     type: DataTypes.ENUM('a', 'b', 'c', 'd'),
    allowNull: false,
  },
  pontos: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  midia: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  criado_em: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'perguntas',
  timestamps: false,
});

export default Pergunta;
