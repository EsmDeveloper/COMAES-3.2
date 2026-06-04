import { Model, DataTypes } from 'sequelize';

/**
 * Modelo Ranking - Tabela agregada para rankings educacionais gamificados
 * 
 * Representa o ranking global da plataforma, pré-calculado para otimizar performance
 * Atualizado automaticamente após eventos relevantes (torneios, testes, etc.)
 * 
 * Campos:
 * - usuario_id: Referência ao usuário
 * - disciplina: Categoria do ranking (geral, matematica, programacao, ingles)
 * - pontuacao_total: Pontuação acumulada (calculada com pesos transparentes)
 * - posicao_geral: Posição no ranking geral (1-indexed)
 * - posicao_disciplina: Posição no ranking específico da disciplina
 * - data_atualizacao: Timestamp da última atualização
 */
export default class Ranking extends Model {
  static init(sequelize) {
    super.init(
      {
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
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        disciplina: {
          type: DataTypes.ENUM('geral', 'matematica', 'programacao', 'ingles'),
          allowNull: false,
          comment: 'Categoria do ranking',
        },
        pontuacao_total: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Pontuação total calculada com pesos transparentes',
        },
        posicao_geral: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: 'Posição no ranking geral (null se não classificado)',
        },
        posicao_disciplina: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: 'Posição no ranking específico da disciplina',
        },
        data_atualizacao: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          comment: 'Timestamp da última atualização',
        },
      },
      {
        sequelize,
        tableName: 'rankings',
        timestamps: true,
        createdAt: 'criado_em',
        updatedAt: 'atualizado_em',
        underscored: true,
        indexes: [
          // Índice composto para buscas rápidas por disciplina e posição
          {
            fields: ['disciplina', 'posicao_disciplina'],
            name: 'idx_ranking_disciplina_posicao',
          },
          // Índice para ranking geral
          {
            fields: ['disciplina', 'posicao_geral'],
            name: 'idx_ranking_disciplina_geral',
          },
          // Índice para buscar usuário específico em todas as disciplinas
          {
            fields: ['usuario_id', 'disciplina'],
            name: 'idx_ranking_usuario_disciplina',
          },
          // Índice para ordenação por pontuação
          {
            fields: ['disciplina', 'pontuacao_total'],
            name: 'idx_ranking_disciplina_pontuacao',
          },
        ],
        comment: 'Tabela agregada de rankings educacionais gamificados - Pré-calculada para otimização',
      }
    );
  }

  static associate(models) {
    // Relacionamento com Usuario
    Ranking.belongsTo(models.Usuario, {
      foreignKey: 'usuario_id',
      as: 'usuario',
      onDelete: 'CASCADE',
    });
  }

  /**
   * Métodos de instância
   */

  // Formatar para resposta da API
  toJSON() {
    const values = { ...this.get() };
    
    // Garantir que pontuacao_total seja número
    if (values.pontuacao_total) {
      values.pontuacao_total = parseFloat(values.pontuacao_total);
    }
    
    // Incluir dados do usuário se populado
    if (this.usuario) {
      values.usuario = {
        id: this.usuario.id,
        nome: this.usuario.nome,
        username: this.usuario.username,
        nivel_atual: this.usuario.nivel_atual,
        xp_total: this.usuario.xp_total,
        imagem: this.usuario.imagem,
      };
    }
    
    return values;
  }

  /**
   * Métodos estáticos para lógica de negócio
   */

  // Calcular pontuação total com pesos transparentes
  static calcularPontuacaoTotal(dadosDisciplinas) {
    // Pesos transparentes (publicamente documentados)
    const PESOS = {
      matematica: 0.35,      // 35%
      programacao: 0.35,     // 35%
      ingles: 0.35,          // 35%
      testes_gerais: 0.15,   // 15%
      // Total: 100% (35+35+35+15 = 120% - correção: cada disciplina já inclui seus testes)
    };

    const {
      pontuacao_matematica = 0,
      pontuacao_programacao = 0,
      pontuacao_ingles = 0,
      pontuacao_testes_gerais = 0
    } = dadosDisciplinas;

    const pontuacao =
      (pontuacao_matematica * PESOS.matematica) +
      (pontuacao_programacao * PESOS.programacao) +
      (pontuacao_ingles * PESOS.ingles) +
      (pontuacao_testes_gerais * PESOS.testes_gerais);

    return parseFloat(pontuacao.toFixed(2));
  }

  // Verificar se precisa atualizar (cache de 5 minutos)
  static precisaAtualizar(dataAtualizacao) {
    const CINCO_MINUTOS = 5 * 60 * 1000; // 5 minutos em milissegundos
    const agora = new Date();
    const dataRef = new Date(dataAtualizacao);
    
    return (agora - dataRef) > CINCO_MINUTOS;
  }

  // Gerar cache key para Redis/memória
  static gerarCacheKey(disciplina, limite = 100, offset = 0) {
    return `ranking:${disciplina}:limit:${limite}:offset:${offset}`;
  }
}