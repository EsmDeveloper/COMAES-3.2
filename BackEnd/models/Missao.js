import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Missao = sequelize.define('Missao', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome:           { type: DataTypes.STRING(120), allowNull: false },
  descricao:      { type: DataTypes.TEXT, allowNull: true },
  ciclo:          { type: DataTypes.ENUM('daily', 'weekly'), allowNull: false, defaultValue: 'daily' },
  tipo_objetivo:  {
    type: DataTypes.ENUM(
      'questoes_corretas', 'acerto_percentual', 'questoes_dificeis',
      'testes_completos', 'streak_dias', 'disciplina_especifica', 'acertos_seguidos'
    ),
    allowNull: false,
  },
  objetivo_valor: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  disciplina:     { type: DataTypes.ENUM('matematica', 'ingles', 'programacao'), allowNull: true },
  dificuldade:    { type: DataTypes.ENUM('facil', 'medio', 'dificil'), allowNull: true },
  recompensa_xp:  { type: DataTypes.INTEGER, allowNull: false, defaultValue: 20 },
  icone:          { type: DataTypes.STRING(10), allowNull: true },
  ativo:          { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  tableName: 'missoes',
  timestamps: false,
});

export default Missao;
