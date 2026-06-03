import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

/**
 * Modelo Nivel — tabela `niveis`
 * Define os 10 patamares de evolução académica temáticos da coruja COMAES.
 */
const Nivel = sequelize.define('Nivel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  numero: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    comment: 'Número do nível (1–10)',
  },
  titulo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Título temático (ex: Filhote de Coruja)',
  },
  xp_minimo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'XP mínimo acumulado para atingir este nível',
  },
  icone: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Emoji representativo do nível',
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descrição motivacional',
  },
  cor: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Cor hex para UI',
  },
}, {
  tableName: 'niveis',
  timestamps: false,
  // Apenas leitura — os níveis são dados de referência imutáveis
});

export default Nivel;
