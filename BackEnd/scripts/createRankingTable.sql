-- Script SQL para criar a tabela de rankings manualmente
-- Executar este script no MySQL Workbench ou via linha de comando

USE comaes_db;

-- 1. Criar tabela rankings se não existir
CREATE TABLE IF NOT EXISTS rankings (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  disciplina ENUM('geral', 'matematica', 'programacao', 'ingles') NOT NULL,
  pontuacao_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  posicao_geral INT NULL,
  posicao_disciplina INT NULL,
  data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Chave estrangeira para usuarios
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  
  -- Constraint para garantir um usuário só tem um registro por disciplina
  UNIQUE KEY idx_ranking_usuario_disciplina (usuario_id, disciplina),
  
  -- Check constraints
  CONSTRAINT chk_ranking_posicoes CHECK (
    (posicao_geral IS NULL OR posicao_geral > 0) AND
    (posicao_disciplina IS NULL OR posicao_disciplina > 0)
  ),
  CONSTRAINT chk_ranking_pontuacao CHECK (pontuacao_total >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Criar índices para performance
CREATE INDEX idx_ranking_disciplina_posicao ON rankings(disciplina, posicao_disciplina);
CREATE INDEX idx_ranking_disciplina_geral ON rankings(disciplina, posicao_geral);
CREATE INDEX idx_ranking_disciplina_pontuacao ON rankings(disciplina, pontuacao_total);
CREATE INDEX idx_ranking_usuario ON rankings(usuario_id);

-- 3. Verificar se a tabela foi criada
SELECT '✅ Tabela rankings criada com sucesso!' AS mensagem;

-- 4. Verificar estrutura da tabela
DESCRIBE rankings;

-- 5. Verificar índices
SHOW INDEX FROM rankings;

-- 6. Inserir alguns dados de exemplo (opcional)
-- INSERT INTO rankings (usuario_id, disciplina, pontuacao_total, posicao_disciplina, posicao_geral)
-- SELECT 
--   id,
--   'geral',
--   xp_total / 100, -- Pontuação baseada no XP total
--   NULL,
--   NULL
-- FROM usuarios
-- WHERE ativo = 1
-- LIMIT 10;

-- 7. Contar registros
SELECT COUNT(*) AS total_rankings FROM rankings;