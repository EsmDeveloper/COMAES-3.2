-- Fix: Adicionar coluna 'contexto' à tabela blocos_questoes
-- Se a coluna não existir, adiciona
-- Se existir, não faz nada

ALTER TABLE blocos_questoes 
ADD COLUMN contexto ENUM('torneio', 'teste') DEFAULT 'torneio' NULL AFTER observacoes_admin;

-- Confirmar
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'blocos_questoes' AND COLUMN_NAME = 'contexto';
