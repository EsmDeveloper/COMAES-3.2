import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Certificado = sequelize.define('Certificado', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  torneio_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'torneios', key: 'id' },
    onDelete: 'CASCADE'
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'id' },
    onDelete: 'CASCADE'
  },
  disciplina: {
    type: DataTypes.ENUM('Matemática', 'Inglês', 'Programação'),
    allowNull: false,
  },
  posicao: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '1 para campeão, 2 para vice, 3 para terceiro lugar'
  },
  pontuacao: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  codigo_certificado: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    comment: 'Código único de validação do certificado'
  },
  url_certificado: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL ou caminho do ficheiro gerado'
  },
  tipo_medalha: {
    type: DataTypes.ENUM('Ouro', 'Prata', 'Bronze'),
    allowNull: false,
    comment: 'Tipo de medalha baseado na posição'
  },
  data_geracao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  data_validacao: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data quando o certificado foi validado/visualizado'
  },
  status: {
    type: DataTypes.ENUM('gerado', 'validado', 'cancelado'),
    defaultValue: 'gerado',
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Dados adicionais do certificado'
  },
  criado_em: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  atualizado_em: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW,
  },
}, {
  tableName: 'certificados',
  timestamps: false,
  indexes: [
    { fields: ['torneio_id'] },
    { fields: ['usuario_id'] },
    { fields: ['codigo_certificado'] },
    { fields: ['torneio_id', 'usuario_id', 'disciplina'] }
  ]
});

export default Certificado;
