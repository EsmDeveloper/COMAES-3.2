-- ============================================================================
-- LIMPEZA DE QUESTÕES - TORNEIOS E TESTES
-- ============================================================================
USE comaes_db;

SET @now = NOW();

-- ============================================================================
-- 1. LISTAR QUESTÕES ANTES DA LIMPEZA
-- ============================================================================

SELECT '📋 ANTES DA LIMPEZA' AS estado;
SELECT 'Questões de Torneios:' AS info, COUNT(*) as total FROM questoes WHERE torneio_id IS NOT NULL;
SELECT 'Questões de Teste de Conhecimento:' AS info, COUNT(*) as total FROM questoes_teste_conhecimento;

-- ============================================================================
-- 2. REMOVER ASSOCIAÇÕES NOS BLOCOS (bloco_questoes_items)
-- ============================================================================

-- Encontrar IDs das questões a serem deletadas
SET @torneio_questoes_ids = (
  SELECT GROUP_CONCAT(id) FROM questoes WHERE torneio_id IS NOT NULL LIMIT 1000
);

SET @teste_questoes_ids = (
  SELECT GROUP_CONCAT(id) FROM questoes_teste_conhecimento LIMIT 1000
);

-- Remover associações de torneios
DELETE FROM bloco_questoes_items 
WHERE questao_id IN (SELECT id FROM questoes WHERE torneio_id IS NOT NULL);

-- Remover associações de testes
DELETE FROM bloco_questoes_items 
WHERE questao_id IN (SELECT id FROM questoes_teste_conhecimento);

-- ============================================================================
-- 3. REMOVER TENTATIVAS DE RESPOSTA
-- ============================================================================

DELETE FROM tentativas_respostas 
WHERE questao_id IN (SELECT id FROM questoes WHERE torneio_id IS NOT NULL);

DELETE FROM tentativas_respostas 
WHERE questao_id IN (SELECT id FROM questoes_teste_conhecimento);

-- ============================================================================
-- 4. DELETAR AS QUESTÕES
-- ============================================================================

-- Deletar questões de torneios
DELETE FROM questoes WHERE torneio_id IS NOT NULL;
SET @torneios_deletados = ROW_COUNT();

-- Deletar questões de teste de conhecimento
DELETE FROM questoes_teste_conhecimento;
SET @testes_deletados = ROW_COUNT();

-- ============================================================================
-- 5. VERIFICAÇÃO APÓS LIMPEZA
-- ============================================================================

SELECT '\n✅ DEPOIS DA LIMPEZA' AS estado;
SELECT CONCAT('✅ Questões de Torneios deletadas: ', @torneios_deletados) AS resultado;
SELECT CONCAT('✅ Questões de Teste deletadas: ', @testes_deletados) AS resultado;

SELECT '\n📊 STATUS FINAL:' AS info;
SELECT 'Questões de Torneios restantes:' AS info, COUNT(*) as total FROM questoes WHERE torneio_id IS NOT NULL;
SELECT 'Questões de Teste restantes:' AS info, COUNT(*) as total FROM questoes_teste_conhecimento;
SELECT 'Blocos Questões Items restantes:' AS info, COUNT(*) as total FROM bloco_questoes_items;

SELECT '\n🎉 LIMPEZA CONCLUÍDA!' AS resultado;
