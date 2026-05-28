import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Certificate = sequelize.define('Certificate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuario_id: {  // ← Usando o nome da coluna do banco diretamente
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'id' },
    onDelete: 'CASCADE'
  },
  torneio_id: {  // ← Usando o nome da coluna do banco diretamente
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'torneios', key: 'id' },
    onDelete: 'CASCADE'
  },
  pontuacao: {  // ← Usando o nome da coluna do banco diretamente
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  posicao: {  // ← Usando o nome da coluna do banco diretamente
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  codigo_verificacao: {  // ← Usando o nome da coluna do banco diretamente
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  url_certificado: {  // ← Usando o nome da coluna do banco diretamente
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  disciplina: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  data_geracao: {  // ← Adicionado
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  data_validacao: {  // ← Adicionado
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {  // ← Adicionado
    type: DataTypes.ENUM('gerado', 'validado', 'cancelado'),
    defaultValue: 'gerado',
  },
  tipo_medalha: {  // ← Adicionado
    type: DataTypes.ENUM('Ouro', 'Prata', 'Bronze'),
    allowNull: true,
  },
  metadata: {  // ← Adicionado
    type: DataTypes.JSON,
    allowNull: true,
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
  tableName: 'certificados',  // ← CORRIGIDO: tabela se chama 'certificados', não 'certificates'
  timestamps: true,
  createdAt: 'criado_em',  // ← CORRIGIDO
  updatedAt: 'atualizado_em',  // ← CORRIGIDO
  paranoid: false,  // ← Desabilitado porque a tabela não tem deleted_at
});

export default Certificate;
