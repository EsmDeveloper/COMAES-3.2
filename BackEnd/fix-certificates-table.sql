-- Script para verificar e corrigir a tabela certificates
-- Execute este script se o erro persistir

-- 1. Verificar se a tabela existe
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_KEY
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'certificates'
ORDER BY 
    ORDINAL_POSITION;

-- 2. Se a tabela não existir ou estiver com estrutura errada, recrie:
DROP TABLE IF EXISTS `certificates`;

CREATE TABLE `certificates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL COMMENT 'ID do usuário (mapeado como user_id no código)',
  `torneio_id` int(11) NOT NULL COMMENT 'ID do torneio (mapeado como tournament_id no código)',
  `pontuacao` decimal(10,2) NOT NULL COMMENT 'Pontuação do usuário (mapeado como score no código)',
  `posicao` int(11) NOT NULL COMMENT 'Posição no ranking (mapeado como ranking_position no código)',
  `codigo_verificacao` varchar(255) NOT NULL COMMENT 'Código único de verificação (mapeado como certificate_code no código)',
  `url_certificado` varchar(255) NOT NULL COMMENT 'URL do arquivo PDF (mapeado como certificate_url no código)',
  `disciplina` varchar(255) NOT NULL COMMENT 'Disciplina do torneio (Matemática, Inglês, Programação)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data de atualização',
  `deleted_at` datetime DEFAULT NULL COMMENT 'Data de exclusão (soft delete)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_verificacao` (`codigo_verificacao`),
  KEY `idx_usuario_id` (`usuario_id`),
  KEY `idx_torneio_id` (`torneio_id`),
  KEY `idx_disciplina` (`disciplina`),
  KEY `idx_usuario_torneio_disciplina` (`usuario_id`, `torneio_id`, `disciplina`),
  CONSTRAINT `certificates_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `certificates_ibfk_2` FOREIGN KEY (`torneio_id`) REFERENCES `torneios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela de certificados gerados para os vencedores dos torneios';

-- 3. Verificar se a tabela foi criada corretamente
DESCRIBE certificates;

-- 4. Verificar dados existentes (se houver)
SELECT 
    id,
    usuario_id,
    torneio_id,
    disciplina,
    posicao,
    codigo_verificacao,
    created_at
FROM 
    certificates
ORDER BY 
    created_at DESC
LIMIT 10;

-- 5. Estatísticas
SELECT 
    COUNT(*) as total_certificados,
    COUNT(DISTINCT usuario_id) as usuarios_com_certificados,
    COUNT(DISTINCT torneio_id) as torneios_com_certificados
FROM 
    certificates
WHERE 
    deleted_at IS NULL;
