/**
 * Migration: Create Rankings Table
 * 
 * Cria a tabela agregada 'rankings' para o sistema de rankings educacionais gamificados
 * Tabela pré-calculada para otimizar performance e implementar cache
 * 
 * Campos:
 * - usuario_id: Referência ao usuário (FK para usuarios.id)
 * - disciplina: Categoria do ranking (geral, matematica, programacao, ingles)
 * - pontuacao_total: Pontuação acumulada com pesos transparentes
 * - posicao_geral: Posição no ranking geral (NULL se não classificado)
 * - posicao_disciplina: Posição no ranking específico da disciplina
 * - data_atualizacao: Timestamp da última atualização
 * 
 * Índices otimizados para:
 * 1. Busca rápida por disciplina e posição
 * 2. Ordenação por pontuação
 * 3. Consultas por usuário específico
 * 4. Atualização incremental
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Iniciando migração: Create Rankings Table');
      
      // 1. Criar tabela rankings
      console.log('📝 Criando tabela rankings...');
      await queryInterface.createTable('rankings', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        usuario_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'usuarios',
            key: 'id',
          },
          onDelete: 'CASCADE',
          comment: 'Referência ao usuário participante',
        },
        disciplina: {
          type: Sequelize.ENUM('geral', 'matematica', 'programacao', 'ingles'),
          allowNull: false,
          comment: 'Categoria do ranking (geral, matematica, programacao, ingles)',
        },
        pontuacao_total: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0.00,
          comment: 'Pontuação total calculada com pesos transparentes',
        },
        posicao_geral: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'Posição no ranking geral (NULL se não classificado)',
        },
        posicao_disciplina: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'Posição no ranking específico da disciplina',
        },
        data_atualizacao: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          comment: 'Timestamp da última atualização do ranking',
        },
        criado_em: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        atualizado_em: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      }, { transaction });

      // 2. Adicionar índices para performance
      console.log('📊 Adicionando índices de performance...');
      
      // Índice composto para buscas rápidas por disciplina e posição
      await queryInterface.addIndex('rankings', ['disciplina', 'posicao_disciplina'], {
        name: 'idx_ranking_disciplina_posicao',
        transaction,
      });

      // Índice para ranking geral
      await queryInterface.addIndex('rankings', ['disciplina', 'posicao_geral'], {
        name: 'idx_ranking_disciplina_geral',
        transaction,
      });

      // Índice para buscar usuário específico em todas as disciplinas
      await queryInterface.addIndex('rankings', ['usuario_id', 'disciplina'], {
        name: 'idx_ranking_usuario_disciplina',
        unique: true, // Um usuário só pode ter um registro por disciplina
        transaction,
      });

      // Índice para ordenação por pontuação (otimiza ORDER BY)
      await queryInterface.addIndex('rankings', ['disciplina', 'pontuacao_total'], {
        name: 'idx_ranking_disciplina_pontuacao',
        transaction,
      });

      // 3. Adicionar constraint para garantir integridade
      console.log('🔒 Adicionando constraints de integridade...');
      await queryInterface.sequelize.query(
        `ALTER TABLE rankings 
         ADD CONSTRAINT chk_ranking_posicoes 
         CHECK (
           (posicao_geral IS NULL OR posicao_geral > 0) AND
           (posicao_disciplina IS NULL OR posicao_disciplina > 0)
         )`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `ALTER TABLE rankings 
         ADD CONSTRAINT chk_ranking_pontuacao 
         CHECK (pontuacao_total >= 0)`,
        { transaction }
      );

      // 4. Comentários da tabela (PostgreSQL/MySQL)
      console.log('💬 Adicionando comentários da tabela...');
      try {
        await queryInterface.sequelize.query(
          `COMMENT ON TABLE rankings IS 'Tabela agregada de rankings educacionais gamificados - Pré-calculada para otimização de performance e implementação de cache'`,
          { transaction }
        );
      } catch (error) {
        // Ignorar se não suportar comentários (SQLite)
        console.log('⚠️ Comentários de tabela não suportados pelo banco');
      }

      await transaction.commit();
      console.log('✅ Migração concluída: Tabela rankings criada com sucesso!');

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erro na migração:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Revertendo migração: Drop Rankings Table');
      
      // Remover índices primeiro
      console.log('🗑️ Removendo índices...');
      await queryInterface.removeIndex('rankings', 'idx_ranking_disciplina_posicao', { transaction });
      await queryInterface.removeIndex('rankings', 'idx_ranking_disciplina_geral', { transaction });
      await queryInterface.removeIndex('rankings', 'idx_ranking_usuario_disciplina', { transaction });
      await queryInterface.removeIndex('rankings', 'idx_ranking_disciplina_pontuacao', { transaction });
      
      // Remover tabela
      console.log('🗑️ Removendo tabela rankings...');
      await queryInterface.dropTable('rankings', { transaction });
      
      await transaction.commit();
      console.log('✅ Migração revertida: Tabela rankings removida com sucesso!');

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erro ao reverter migração:', error);
      throw error;
    }
  }
};