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
    validate: {
      is: {
        args: [/^[A-Za-zÀ-ÖØ-öø-ÿ'\s]+$/],
        msg: 'O nome deve conter apenas letras e espaços.'
      },
      notNumeric(value) {
        if (/^\d+$/.test(value)) {
          throw new Error('O nome não pode ser apenas números.');
        }
      }
    }
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: 'usuarios_username_unique',
    validate: {
      is: {
        args: [/^[a-zA-Z0-9_-]{3,30}$/],
        msg: 'O username pode conter apenas letras, números, _ e - (3-30 caracteres).'
      }
    }
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
      isEmail: {
        args: true,
        msg: 'Formato de email inválido.'
      },
      isValidDomain(value) {
        // Aceita apenas domínios comuns e rejeita domínios inválidos
        if (!/^[^@]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)) {
          throw new Error('Email deve conter um domínio válido.');
        }
        // Bloqueia domínios comuns digitados errado
        if (/@(gmai|gmal|gmial|gmaill|hotmal|hotmial|outlok|yaho|yhoo)\.com$/i.test(value)) {
          throw new Error('Domínio de email inválido. Verifique o domínio.');
        }
      }
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
    validate: {
      isStrong(value) {
        // Mínimo 8 caracteres, pelo menos uma maiúscula, uma minúscula, um número e um caractere especial
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(value)) {
          throw new Error('A senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial.');
        }
      }
    }
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
  role: {
    type: DataTypes.ENUM('estudante', 'colaborador', 'admin'),
    allowNull: false,
    defaultValue: 'estudante',
  },
  disciplina_colaborador: {
    type: DataTypes.ENUM('matematica', 'ingles', 'programacao'),
    allowNull: true,
  },
  nivel_academico: {
    type: DataTypes.ENUM(
      'estudante_universitario', 'tecnico', 'licenciado', 'mestre',
      'doutor', 'professor', 'profissional', 'outro'
    ),
    allowNull: true,
    comment: 'Nível académico/profissional do colaborador',
  },
  documentos_colaborador: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
    comment: 'Documentos enviados pelo colaborador',
  },
  status_colaborador: {
    type: DataTypes.ENUM('pendente', 'aprovado', 'rejeitado'),
    allowNull: false,
    defaultValue: 'pendente',
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  // ── Sistema de Níveis COMAES ──────────────────────────────────
  xp_total: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'XP acumulado baseado em desempenho académico real',
  },
  nivel_atual: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Número do nível actual do utilizador (1–10)',
  },
}, {
  tableName: "usuarios",
  timestamps: true,
  defaultScope: {
    attributes: { exclude: ['password'] }
  }
});

export default Usuario;
