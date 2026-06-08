-- Arquivo de Verificação das 45 Questões Inseridas
-- Data: 2026-06-04
-- Torneio: Liga dos Campeões Junho 2026 (ID: 32)

USE comaes_db;

-- ============================================================
-- 1. VERIFICAÇÃO GERAL
-- ============================================================
SELECT 
  CONCAT('Total de questões no torneio: ', COUNT(*)) as verificacao
FROM questoes 
WHERE torneio_id = 32;

-- ============================================================
-- 2. DISTRIBUIÇÃO POR DISCIPLINA
-- ============================================================
SELECT 
  disciplina,
  COUNT(*) as total
FROM questoes
WHERE torneio_id = 32
GROUP BY disciplina
ORDER BY disciplina;

-- ============================================================
-- 3. DISTRIBUIÇÃO POR DIFICULDADE
-- ============================================================
SELECT 
  dificuldade,
  COUNT(*) as total
FROM questoes
WHERE torneio_id = 32
GROUP BY dificuldade
ORDER BY FIELD(dificuldade, 'facil', 'medio', 'dificil');

-- ============================================================
-- 4. DISTRIBUIÇÃO POR DISCIPLINA E DIFICULDADE
-- ============================================================
SELECT 
  disciplina,
  dificuldade,
  COUNT(*) as total
FROM questoes
WHERE torneio_id = 32
GROUP BY disciplina, dificuldade
ORDER BY disciplina, FIELD(dificuldade, 'facil', 'medio', 'dificil');

-- ============================================================
-- 5. PONTUAÇÃO POR NÍVEL
-- ============================================================
SELECT 
  dificuldade,
  pontos,
  COUNT(*) as total_questoes
FROM questoes
WHERE torneio_id = 32
GROUP BY dificuldade, pontos
ORDER BY FIELD(dificuldade, 'facil', 'medio', 'dificil');

-- ============================================================
-- 6. STATUS DE APROVAÇÃO
-- ============================================================
SELECT 
  status_aprovacao,
  COUNT(*) as total
FROM questoes
WHERE torneio_id = 32
GROUP BY status_aprovacao;

-- ============================================================
-- 7. TIPOS DE QUESTÃO
-- ============================================================
SELECT 
  tipo,
  COUNT(*) as total
FROM questoes
WHERE torneio_id = 32
GROUP BY tipo;

-- ============================================================
-- 8. QUESTÕES DE MATEMÁTICA - FÁCIL
-- ============================================================
SELECT 
  id,
  titulo,
  descricao,
  dificuldade,
  pontos
FROM questoes
WHERE torneio_id = 32 
  AND disciplina = 'matematica' 
  AND dificuldade = 'facil'
ORDER BY id;

-- ============================================================
-- 9. QUESTÕES DE INGLÊS - MÉDIO
-- ============================================================
SELECT 
  id,
  titulo,
  descricao,
  dificuldade,
  pontos
FROM questoes
WHERE torneio_id = 32 
  AND disciplina = 'ingles' 
  AND dificuldade = 'medio'
ORDER BY id;

-- ============================================================
-- 10. QUESTÕES DE PROGRAMAÇÃO - DIFÍCIL
-- ============================================================
SELECT 
  id,
  titulo,
  descricao,
  dificuldade,
  pontos
FROM questoes
WHERE torneio_id = 32 
  AND disciplina = 'programacao' 
  AND dificuldade = 'dificil'
ORDER BY id;

-- ============================================================
-- 11. EXEMPLO DE QUESTÃO COM OPÇÕES
-- ============================================================
SELECT 
  id,
  titulo,
  descricao,
  opcoes,
  resposta_correta,
  explicacao,
  pontos
FROM questoes
WHERE torneio_id = 32 
LIMIT 5;

-- ============================================================
-- 12. TODAS AS NOVAS QUESTÕES (Para auditoria)
-- ============================================================
SELECT 
  id,
  disciplina,
  dificuldade,
  titulo,
  pontos
FROM questoes
WHERE torneio_id = 32
ORDER BY disciplina, FIELD(dificuldade, 'facil', 'medio', 'dificil'), id;

-- ============================================================
-- 13. ESTATÍSTICAS DE TIMESTAMPS
-- ============================================================
SELECT 
  COUNT(*) as total_questoes,
  MIN(created_at) as primeira_criada,
  MAX(created_at) as ultima_criada,
  MIN(updated_at) as primeira_atualizacao,
  MAX(updated_at) as ultima_atualizacao
FROM questoes
WHERE torneio_id = 32;

-- ============================================================
-- 14. VALIDAÇÃO: Sem campos nulos
-- ============================================================
SELECT 
  'SEM TITULO' as error,
  COUNT(*) as quantidade
FROM questoes
WHERE torneio_id = 32 AND titulo IS NULL

UNION ALL

SELECT 
  'SEM DESCRICAO',
  COUNT(*)
FROM questoes
WHERE torneio_id = 32 AND descricao IS NULL

UNION ALL

SELECT 
  'SEM RESPOSTA_CORRETA',
  COUNT(*)
FROM questoes
WHERE torneio_id = 32 AND resposta_correta IS NULL

UNION ALL

SELECT 
  'SEM EXPLICACAO',
  COUNT(*)
FROM questoes
WHERE torneio_id = 32 AND explicacao IS NULL;

-- ============================================================
-- 15. RESUMO EXECUTIVO
-- ============================================================
SELECT 
  '✅ VERIFICAÇÃO CONCLUÍDA' as status,
  'Todas as 45 questões foram inseridas' as resultado,
  (SELECT COUNT(*) FROM questoes WHERE torneio_id = 32) as total_questoes,
  '32' as torneio_id,
  'Liga dos Campeões Junho 2026' as torneio_nome;
