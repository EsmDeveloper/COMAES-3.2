import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const MissaoUsuario = sequelize.define('MissaoUsuario', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id:      { type: DataTypes.INTEGER, allowNull: false,
                     references: { model: 'usuarios', key: 'id' }, onDelete: 'CASCADE' },
  missao_id:       { type: DataTypes.INTEGER, allowNull: false,
                     references: { model: 'missoes', key: 'id' }, onDelete: 'CASCADE' },
  ciclo_inicio:    { type: DataTypes.DATEONLY, allowNull: false,
                     comment: 'Data UTC de início do ciclo' },
  progresso_atual: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  concluida:       { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  concluida_em:    { type: DataTypes.DATE, allowNull: true },
  xp_concedido:    { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, {
  tableName: 'missoes_usuario',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em',
  indexes: [
    { unique: true, fields: ['usuario_id', 'missao_id', 'ciclo_inicio'], name: 'idx_missao_usuario_ciclo' },
    { fields: ['usuario_id', 'ciclo_inicio'], name: 'idx_missao_usuario_periodo' },
  ],
});

export default MissaoUsuario;
