import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const TentativaResposta = sequelize.define('TentativaResposta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { 
      model: 'usuarios', 
      key: 'id' 
    },
    onDelete: 'CASCADE'
  },
  torneio_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { 
      model: 'torneios', 
      key: 'id' 
    },
    onDelete: 'CASCADE'
  },
  disciplina_competida: {
    type: DataTypes.ENUM('Matemática', 'Inglês', 'Programação'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['Matemática', 'Inglês', 'Programação']],
        msg: 'Disciplina inválida'
      }
    }
  },
  questao_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { 
      model: 'questoes', 
      key: 'id' 
    },
    onDelete: 'CASCADE'
  },
  resposta_selecionada: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  resposta_correta: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  correta: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  pontos_obtidos: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Pontos não podem ser negativos'
      }
    }
  },
  tempo_gasto: {
    type: DataTypes.INTEGER, // em segundos
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'Tempo não pode ser negativo'
      }
    }
  },
  criado_em: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'tentativas_respostas',
  timestamps: false,
  indexes: [
    { fields: ['usuario_id'] },
    { fields: ['torneio_id'] },
    { fields: ['questao_id'] },
    { fields: ['usuario_id', 'torneio_id'] },
    { fields: ['usuario_id', 'torneio_id', 'disciplina_competida'] },
  ],
});

export default TentativaResposta;
