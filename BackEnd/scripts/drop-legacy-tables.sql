-- Remover constraints de foreign key primeiro
ALTER TABLE tentativas_respostas DROP FOREIGN KEY IF EXISTS tentativas_respostas_ibfk_2;

-- Drop das tabelas legadas
DROP TABLE IF EXISTS perguntas;
DROP TABLE IF EXISTS questoes_matematica;
DROP TABLE IF EXISTS questoes_programacao;
DROP TABLE IF EXISTS questoes_ingles;

-- Verificação final
SELECT COUNT(*) as total_questoes FROM questoes;