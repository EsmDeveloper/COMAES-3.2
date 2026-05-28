import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Noticia = sequelize.define('Noticia', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  resumo: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  conteudo: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  autor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'id' },
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  url_capa: {
    type: DataTypes.STRING(1024),
    allowNull: true,
  },
  publicado_em: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  publicado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  visualizacoes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
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
  tableName: 'noticias',
  timestamps: false,
  indexes: [
    { fields: ['slug'] },
    { fields: ['autor_id'] },
  ],
});

export default Noticia;
