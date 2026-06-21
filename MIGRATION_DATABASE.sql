-- ═══════════════════════════════════════════════════════════════════════
-- COMAES 3.2 - DATABASE MIGRATION
-- Eliminar isAdmin, usar apenas role
-- ═══════════════════════════════════════════════════════════════════════
-- 
-- ⚠️ ATENÇÃO: Esta migration é IRREVERSÍVEL!
-- FAZER BACKUP ANTES DE EXECUTAR!
--
-- Backup command:
-- mysqldump -u root -p comaes_db > backup_before_restructure_$(date +%Y%m%d_%H%M%S).sql
-- ═══════════════════════════════════════════════════════════════════════

USE comaes_db;

-- ────────────────────────────────────────────────────────────────────────
-- FASE 1: VERIFICAÇÃO PRÉ-MIGRATION
-- ────────────────────────────────────────────────────────────────────────

-- Ver quantos usuários têm isAdmin=true
SELECT 
  COUNT(*) as total_admins,
  'Usuários com isAdmin=true' as descricao
FROM usuarios 
WHERE isAdmin = true;

-- Ver inconsistências (isAdmin=true MAS role != 'admin')
SELECT 
  id, 
  nome, 
  email, 
  isAdmin, 
  role,
  'INCONSISTENTE!' as status
FROM usuarios 
WHERE isAdmin = true AND role != 'admin';

-- Ver todos admins (por qualquer critério)
SELECT 
  id, 
  nome, 
  email, 
  isAdmin, 
  role, 
  status_colaborador
FROM usuarios 
WHERE isAdmin = true OR role = 'admin'
ORDER BY id;

-- ────────────────────────────────────────────────────────────────────────
-- FASE 2: NORMALIZAÇÃO (Corrigir inconsistências)
-- ────────────────────────────────────────────────────────────────────────

-- Garantir que admin master (ID=1) tem role correto
UPDATE usuarios 
SET role = 'admin'
WHERE id = 1;

-- Sincronizar: todos com isAdmin=true devem ter role='admin'
UPDATE usuarios 
SET role = 'admin'
WHERE isAdmin = true AND role != 'admin';

-- Sincronizar inverso: todos com role='admin' devem ter isAdmin=true
-- (temporário, isAdmin será dropado logo)
UPDATE usuarios 
SET isAdmin = true
WHERE role = 'admin' AND isAdmin = false;

-- Verificar normalização
SELECT 
  COUNT(*) as total,
  'Usuários com isAdmin E role corretos' as descricao
FROM usuarios 
WHERE (isAdmin = true AND role = 'admin') 
   OR (isAdmin = false AND role != 'admin');

-- ────────────────────────────────────────────────────────────────────────
-- FASE 3: REMOÇÃO DA COLUNA isAdmin
-- ────────────────────────────────────────────────────────────────────────

-- ⚠️ IRREVERSÍVEL! Fazer backup antes!
ALTER TABLE usuarios DROP COLUMN isAdmin;

-- Verificar que coluna foi removida
DESCRIBE usuarios;

-- ────────────────────────────────────────────────────────────────────────
-- FASE 4: VERIFICAÇÃO PÓS-MIGRATION
-- ────────────────────────────────────────────────────────────────────────

-- Verificar que coluna isAdmin não existe mais
SELECT 
  TABLE_NAME,
  COLUMN_NAME,
  DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'comaes_db' 
  AND TABLE_NAME = 'usuarios'
  AND COLUMN_NAME = 'isAdmin';
-- Deve retornar vazio (0 rows)

-- Ver todos administradores (agora apenas por role)
SELECT 
  id, 
  nome, 
  email, 
  role, 
  status_colaborador,
  createdAt
FROM usuarios 
WHERE role = 'admin'
ORDER BY id;

-- Verificar que admin master existe e está correto
SELECT 
  id,
  nome,
  email,
  role,
  CASE 
    WHEN id = 1 AND role = 'admin' THEN '✅ CORRETO'
    WHEN id = 1 AND role != 'admin' THEN '❌ ERRO: role incorreto'
    ELSE 'Outro usuário'
  END as status
FROM usuarios
WHERE id = 1;

-- Estatísticas finais
SELECT 
  role,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM usuarios), 2) as percentagem
FROM usuarios
GROUP BY role
ORDER BY total DESC;

-- ────────────────────────────────────────────────────────────────────────
-- CONCLUSÃO
-- ────────────────────────────────────────────────────────────────────────

SELECT 
  '✅ Migration completa!' as status,
  'Coluna isAdmin removida, apenas role é usado' as resultado,
  NOW() as timestamp;

-- ═══════════════════════════════════════════════════════════════════════
-- ROLLBACK (se necessário - APENAS se tiver backup)
-- ═══════════════════════════════════════════════════════════════════════
--
-- Para fazer rollback, restaurar o backup:
-- mysql -u root -p comaes_db < backup_before_restructure_YYYYMMDD_HHMMSS.sql
--
-- ═══════════════════════════════════════════════════════════════════════
