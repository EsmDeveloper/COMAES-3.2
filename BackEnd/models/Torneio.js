import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Torneio = sequelize.define('Torneio', {
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
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  inicia_em: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  termina_em: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  criado_por: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'id' },
  },
  status: {
    type: DataTypes.ENUM('rascunho', 'agendado', 'ativo', 'finalizado', 'cancelado'),
    defaultValue: 'rascunho',
  },
  // ✨ NEW: Tournament Types (Sistema de Torneios)
  tipo_torneio: {
    type: DataTypes.ENUM('generico', 'especifico'),
    defaultValue: 'generico',
    allowNull: false,
    comment: 'Tipo de torneio: generico (multidisciplinar) ou especifico (uma disciplina)',
    validate: {
      isIn: {
        args: [['generico', 'especifico']],
        msg: 'tipo_torneio deve ser generico ou especifico'
      }
    }
  },
  disciplina_especifica: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Disciplina específica quando tipo_torneio = especifico',
    validate: {
      validateDisciplinaEspecifica(value) {
        // Se tipo_torneio é específico, disciplina_especifica é obrigatória
        if (this.tipo_torneio === 'especifico' && !value) {
          throw new Error('disciplina_especifica é obrigatória para torneios específicos');
        }
        // Se tipo_torneio é genérico, disciplina_especifica deve ser NULL
        if (this.tipo_torneio === 'generico' && value) {
          throw new Error('disciplina_especifica deve ser NULL para torneios genéricos');
        }
      }
    }
  },
  criado_em: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'torneios',
  timestamps: false,
  indexes: [
    { fields: ['criado_por'] },
    { fields: ['tipo_torneio'] },  // ✨ Index para filtrar por tipo
    { fields: ['disciplina_especifica'] },  // ✨ Index para filtrar por disciplina
  ],
  hooks: {
    // ✨ Validação antes de salvar
    beforeValidate: (torneio) => {
      // Garantir que genéricos não tenham disciplina específica
      if (torneio.tipo_torneio === 'generico') {
        torneio.disciplina_especifica = null;
      }
    }
  }
});

// ✨ Métodos de Helper
Torneio.prototype.isGenerico = function() {
  return this.tipo_torneio === 'generico';
};

Torneio.prototype.isEspecifico = function() {
  return this.tipo_torneio === 'especifico';
};

Torneio.prototype.getDisciplina = function() {
  return this.isGenerico() ? 'Multidisciplinar' : this.disciplina_especifica;
};

export default Torneio;
