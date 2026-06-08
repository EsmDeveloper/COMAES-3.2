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
    allowNull: true,  // ✨ Nullable para certificados que não são de torneio
    references: { model: 'torneios', key: 'id' },
    onDelete: 'CASCADE',
    comment: 'ID do torneio associado ao certificado'
  },
  pontuacao: {  // ← Usando o nome da coluna do banco diretamente
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  posicao: {  // ← Usando o nome da coluna do banco diretamente
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'Posição deve ser maior que 0'
      },
      max: {
        args: [3],
        msg: 'Apenas top 3 são elegíveis para certificado'
      }
    },
    comment: 'Posição no torneio (1, 2 ou 3 para certificados automáticos)'
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
    comment: 'Data de geração do certificado'
  },
  data_validacao: {  // ← Adicionado
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data de validação/aprovação do certificado'
  },
  status: {  // ← Adicionado
    type: DataTypes.ENUM('gerado', 'validado', 'cancelado'),
    defaultValue: 'gerado',
    comment: 'Status do certificado'
  },
  tipo_medalha: {  // ← Adicionado
    type: DataTypes.ENUM('Ouro', 'Prata', 'Bronze'),
    allowNull: true,
    comment: 'Tipo de medalha: 1º=Ouro, 2º=Prata, 3º=Bronze'
  },
  // ✨ NEW: Auto-generation tracking (Sistema de Torneios)
  auto_gerado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Indica se foi gerado automaticamente pelo sistema'
  },
  metadata: {  // ← Adicionado
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Metadados adicionais do certificado'
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
  indexes: [
    { fields: ['usuario_id'], name: 'idx_cert_usuario', comment: 'Índice para buscar certificados por usuário' },
    { fields: ['torneio_id'], name: 'idx_cert_torneio', comment: 'Índice para buscar certificados por torneio' },
    { fields: ['auto_gerado', 'torneio_id'], name: 'idx_cert_auto_torneio', comment: 'Índice para buscar certificados automáticos de um torneio' },
    { fields: ['status'], name: 'idx_cert_status' },
    { fields: ['codigo_verificacao'], name: 'idx_cert_verificacao' },
  ],
  hooks: {
    // ✨ Validação: apenas top 3 podem ter certificados automáticos
    beforeCreate: (cert) => {
      if (cert.auto_gerado && cert.posicao > 3) {
        throw new Error('Apenas os 3 primeiros lugares são elegíveis para certificado automático');
      }
      
      // Auto-atribuir tipo de medalha baseado em posição
      if (cert.auto_gerado) {
        if (cert.posicao === 1) cert.tipo_medalha = 'Ouro';
        else if (cert.posicao === 2) cert.tipo_medalha = 'Prata';
        else if (cert.posicao === 3) cert.tipo_medalha = 'Bronze';
      }
    },
    
    beforeUpdate: (cert) => {
      // Garantir que auto_gerado não pode ser alterado após criação
      if (cert.changed('auto_gerado')) {
        throw new Error('Propriedade auto_gerado não pode ser alterada após criação');
      }
      
      // Garantir que apenas top 3 permanecem com certificado automático
      if (cert.auto_gerado && cert.posicao > 3) {
        throw new Error('Posição inválida para certificado automático (apenas top 3)');
      }
    }
  }
});

// ✨ Métodos de Helper
Certificate.prototype.isAutomatico = function() {
  return this.auto_gerado === true;
};

Certificate.prototype.isPrimeiroLugar = function() {
  return this.posicao === 1 && this.tipo_medalha === 'Ouro';
};

Certificate.prototype.isSegundoLugar = function() {
  return this.posicao === 2 && this.tipo_medalha === 'Prata';
};

Certificate.prototype.isTerceiroLugar = function() {
  return this.posicao === 3 && this.tipo_medalha === 'Bronze';
};

Certificate.prototype.validar = async function() {
  this.status = 'validado';
  this.data_validacao = new Date();
  return this.save();
};

Certificate.prototype.cancelar = async function() {
  this.status = 'cancelado';
  return this.save();
};

// ✨ Métodos estáticos
Certificate.gerarAutomaticamente = async function(usuarioId, torneioId, posicao, pontuacao, disciplina) {
  // Validação: apenas top 3
  if (posicao > 3) {
    throw new Error('Apenas os 3 primeiros lugares são elegíveis para certificado automático');
  }

  // Verificar se certificado já existe
  const existente = await this.findOne({
    where: {
      usuario_id: usuarioId,
      torneio_id: torneioId,
      auto_gerado: true
    }
  });

  if (existente) {
    console.log(`⚠️ Certificado automático já existe para usuário ${usuarioId} no torneio ${torneioId}`);
    return existente;
  }

  // Gerar código único de verificação
  const codigo = `CERT-${Date.now()}-${usuarioId}-${torneioId}`;
  const url = `/certificados/verificar/${codigo}`;

  // Determinar tipo de medalha
  let tipoMedalha;
  if (posicao === 1) tipoMedalha = 'Ouro';
  else if (posicao === 2) tipoMedalha = 'Prata';
  else if (posicao === 3) tipoMedalha = 'Bronze';

  // Criar certificado
  const cert = await this.create({
    usuario_id: usuarioId,
    torneio_id: torneioId,
    posicao,
    pontuacao,
    disciplina,
    codigo_verificacao: codigo,
    url_certificado: url,
    status: 'gerado',
    tipo_medalha: tipoMedalha,
    auto_gerado: true,
    metadata: {
      motivo: 'Geração automática - Top 3',
      data_geracao_sistema: new Date().toISOString()
    }
  });

  console.log(`✅ Certificado automático criado para usuário ${usuarioId}, posição ${posicao}`);
  return cert;
};

Certificate.listarPorTorneio = function(torneioId, apenasAutomaticos = false) {
  const where = { torneio_id: torneioId };
  if (apenasAutomaticos) {
    where.auto_gerado = true;
  }
  
  return this.findAll({
    where,
    order: [['posicao', 'ASC']],
    attributes: ['id', 'usuario_id', 'posicao', 'tipo_medalha', 'status', 'data_geracao', 'auto_gerado']
  });
};

Certificate.countAutomaticosEmTorneio = function(torneioId) {
  return this.count({
    where: {
      torneio_id: torneioId,
      auto_gerado: true
    }
  });
};

export default Certificate;
