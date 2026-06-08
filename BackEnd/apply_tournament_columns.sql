-- 🎯 SCRIPT: Aplicar Colunas do Sistema de Torneios
-- Data: 08 de Junho de 2026
-- Descrição: Adiciona colunas e índices necessários para o sistema de torneios

-- =====================================================
-- 1. TABELA: torneios
-- =====================================================
-- Adicionar tipo de torneio
ALTER TABLE torneios ADD COLUMN IF NOT EXISTS tipo_torneio ENUM('generico', 'especifico') DEFAULT 'generico' COMMENT 'Tipo de torneio: generico (multidisciplinar) ou especifico (uma disciplina)';

-- Adicionar disciplina específica (para torneios específicos)
ALTER TABLE torneios ADD COLUMN IF NOT EXISTS disciplina_especifica VARCHAR(100) DEFAULT NULL COMMENT 'Disciplina específica quando tipo_torneio = "especifico"';

-- =====================================================
-- 2. TABELA: participantes_torneios
-- =====================================================
-- Adicionar status de encerramento operacional
ALTER TABLE participantes_torneios ADD COLUMN IF NOT EXISTS encerrado_operacionalmente BOOLEAN DEFAULT FALSE COMMENT 'Indica se torneio foi encerrado operacionalmente para este participante (data passou)';

-- Adicionar data de encerramento operacional
ALTER TABLE participantes_torneios ADD COLUMN IF NOT EXISTS data_encerramento_operacional DATETIME DEFAULT NULL COMMENT 'Timestamp de quando o torneio foi encerrado operacionalmente';

-- Adicionar status de elegibilidade para certificado
ALTER TABLE participantes_torneios ADD COLUMN IF NOT EXISTS elegivel_certificado BOOLEAN DEFAULT FALSE COMMENT 'Indica se participante é elegível para receber certificado (top 3)';

-- Criar índice para melhorar queries de participação ativa
ALTER TABLE participantes_torneios ADD INDEX IF NOT EXISTS idx_participacao_ativa (usuario_id, status, posicao_congelada) COMMENT 'Índice para queries de participação ativa';

-- =====================================================
-- 3. TABELA: certificados
-- =====================================================
-- Adicionar torneio_id (FK)
ALTER TABLE certificados ADD COLUMN IF NOT EXISTS torneio_id INT DEFAULT NULL COMMENT 'ID do torneio associado ao certificado';

-- Adicionar constraint FK se coluna foi adicionada
ALTER TABLE certificados ADD CONSTRAINT IF NOT EXISTS fk_certificados_torneio FOREIGN KEY (torneio_id) REFERENCES torneios(id) ON DELETE CASCADE;

-- Adicionar indicador de geração automática
ALTER TABLE certificados ADD COLUMN IF NOT EXISTS auto_gerado BOOLEAN DEFAULT FALSE COMMENT 'Indica se foi gerado automaticamente pelo sistema';

-- Criar índices para performance
ALTER TABLE certificados ADD INDEX IF NOT EXISTS idx_cert_usuario (usuario_id) COMMENT 'Índice para buscar certificados por usuário';
ALTER TABLE certificados ADD INDEX IF NOT EXISTS idx_cert_torneio (torneio_id) COMMENT 'Índice para buscar certificados por torneio';
ALTER TABLE certificados ADD INDEX IF NOT EXISTS idx_cert_auto_torneio (auto_gerado, torneio_id) COMMENT 'Índice para buscar certificados automáticos de um torneio';

-- =====================================================
-- VERIFICAÇÃO: Confirmar colunas foram adicionadas
-- =====================================================

SELECT '✅ Coluna adicionada' as status, COLUMN_NAME as coluna, TABLE_NAME as tabela
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME IN ('torneios', 'participantes_torneios', 'certificados')
AND COLUMN_NAME IN ('tipo_torneio', 'disciplina_especifica', 'encerrado_operacionalmente', 'data_encerramento_operacional', 'elegivel_certificado', 'auto_gerado', 'torneio_id')
ORDER BY TABLE_NAME, COLUMN_NAME;

-- =====================================================
-- RESUMO
-- =====================================================
-- Tabela torneios:       +2 colunas (tipo_torneio, disciplina_especifica)
-- Tabela participantes:  +3 colunas + 1 índice (encerrado_operacionalmente, data_encerramento, elegivel_certificado, idx_participacao_ativa)
-- Tabela certificados:   +2 colunas + 3 índices (torneio_id, auto_gerado, idx_cert_usuario, idx_cert_torneio, idx_cert_auto_torneio)
--
-- Total: 7 novas colunas, 5 novos índices, estrutura pronta para Fase 2 (Modelos)
