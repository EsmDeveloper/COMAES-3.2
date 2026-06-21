# ✅ CHECKLIST DE IMPLEMENTAÇÃO - REESTRUTURAÇÃO COMAES 3.2

**IMPORTANTE**: Seguir esta ordem EXATAMENTE. Não pular etapas.

---

## 📋 PRÉ-REQUISITOS

- [ ] Fazer backup completo da database:
  ```bash
  mysqldump -u root -p comaes_db > backup_$(date +%Y%m%d_%H%M%S).sql
  ```
- [ ] Criar branch git:
  ```bash
  git checkout -b restructure/auth-system-unified
  ```
- [ ] Verificar que sistema funciona atualmente:
  ```bash
  cd BackEnd && npm run dev
  cd FrontEnd && npm run dev
  ```

---

## 🔧 FASE 1: BACKEND CORE (2 horas)

### 1.1 Atualizar index.js (login endpoint)

- [ ] Abrir `BackEnd/index.js`
- [ ] Encontrar o endpoint `POST /auth/login`
- [ ] REMOVER do payload JWT:
  ```javascript
  // ❌ REMOVER
  isAdmin: user.isAdmin,
  ```
- [ ] JWT deve conter APENAS:
  ```javascript
  const token = jwt.sign(
    {
      id: user.id,
      role: user.role || 'estudante'
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  ```
- [ ] REMOVER do SELECT SQL qualquer referência a `isAdmin`
- [ ] Mudar:
  ```javascript
  // ❌ ANTES
  role: user.role || (user.isAdmin ? 'admin' : 'estudante')
  
  // ✅ DEPOIS
  role: user.role || 'estudante'
  ```

### 1.2 Atualizar UserController.js

- [ ] Abrir `BackEnd/controllers/UserController.js`
- [ ] REMOVER todas referências a `isAdmin`:
  - [ ] Linha ~108: `role = data.role || (data.isAdmin ? 'admin' : 'estudante')`
  - [ ] Linha ~148: `const requestedRole = body.isAdmin ? 'admin' : ...`
  - [ ] Linha ~149: `if ((body.isAdmin || requestedRole === 'admin') && !requestingUser?.isAdmin)`
  - [ ] Linha ~152: `fieldErrors: { isAdmin: '...' }`
  - [ ] Linha ~179: `isAdmin: requestingUser?.isAdmin ? ...`
  - [ ] Linha ~180: `role: requestingUser?.isAdmin ? ...`
  - [ ] Linha ~213: `if (!requestingUser?.isAdmin)`
  - [ ] Linha ~261: `isAdmin: true`
  - [ ] Linha ~287: `if (String(requestingUser?.id) === String(id) && body.isAdmin !== undefined)`
  - [ ] Linha ~294: `if ((body.isAdmin !== undefined ...) && !requestingUser?.isAdmin)`
  - [ ] Linha ~297: `fieldErrors: { isAdmin: '...' }`
  - [ ] E TODAS as outras (grep isAdmin no arquivo)

- [ ] Substituir lógica:
  ```javascript
  // ❌ REMOVER
  if (!requestingUser?.isAdmin) { ... }
  
  // ✅ USAR
  if (requestingUser?.role !== 'admin') { ... }
  ```

### 1.3 Atualizar adminStatsController.js

- [ ] Abrir `BackEnd/controllers/adminStatsController.js`
- [ ] Linha 17:
  ```javascript
  // ❌ ANTES
  const totalAdmins = await Usuario.count({ where: { isAdmin: true } });
  
  // ✅ DEPOIS
  const totalAdmins = await Usuario.count({ where: { role: 'admin' } });
  ```

### 1.4 Atualizar QuestoesController.js

- [ ] Abrir `BackEnd/controllers/QuestoesController.js`
- [ ] Encontrar TODAS as linhas com `isAdmin`:
  - [ ] Linha ~113: `const isAdmin = req.user?.isAdmin || req.user?.role === 'admin';`
  - [ ] Linha ~750: `} else if (req.user.isAdmin || req.user.role === 'admin') {`
  - [ ] Linha ~773: `if (req.user.isAdmin) {`
  - [ ] Linha ~785: `...(req.user.isAdmin && { porDisciplina: disciplinas }),`
  - [ ] Linha ~1139: `const isAdmin = req.user?.isAdmin || req.user?.role === 'admin';`
  - [ ] Linha ~1140: `if (!isAdmin) {`
  - [ ] Linha ~1241: `const isAdmin = req.user?.isAdmin || req.user?.role === 'admin';`
  - [ ] Linha ~1242: `if (!isAdmin) {`
  - [ ] Linha ~1323: `const isAdmin = req.user?.isAdmin || req.user?.role === 'admin';`
  - [ ] Linha ~1324: `if (!isAdmin) {`

- [ ] Substituir TODAS por:
  ```javascript
  // ✅ USAR
  const isAdmin = req.user?.role === 'admin';
  if (req.user.role === 'admin') { ... }
  ```

### 1.5 Atualizar rankingController.js

- [ ] Abrir `BackEnd/controllers/rankingController.js`
- [ ] Linha ~103: `if (!req.user?.isAdmin)`
- [ ] Linha ~114: `if (!req.user?.isAdmin)`
- [ ] Substituir por:
  ```javascript
  if (req.user?.role !== 'admin')
  ```

### 1.6 Atualizar colaboradorRegistroController.js

- [ ] Abrir `BackEnd/controllers/colaboradorRegistroController.js`
- [ ] Linha ~142: `isAdmin: false,`
- [ ] ✅ REMOVER linha completamente

### 1.7 Atualizar TODAS as rotas

- [ ] Listar todos arquivos em `BackEnd/routes/`:
  ```bash
  ls BackEnd/routes/*.js
  ```
- [ ] Para CADA arquivo:
  - [ ] REMOVER: `import isAdmin from '../middlewares/isAdmin.js';`
  - [ ] ADICIONAR:
    ```javascript
    import { authenticate } from '../middlewares/auth.js';
    import { requireAdmin } from '../middlewares/authorize.js';
    ```
  - [ ] Substituir em TODAS as rotas admin:
    ```javascript
    // ❌ ANTES
    router.get('/admin/...',  isAdmin, controller);
    
    // ✅ DEPOIS
    router.get('/admin/...', authenticate, requireAdmin, controller);
    ```

### 1.8 Verificar imports

- [ ] Grep para verificar que nenhum import antigo ficou:
  ```bash
  grep -r "import.*isAdmin.*from.*middlewares/isAdmin" BackEnd/
  # Deve retornar vazio
  ```

- [ ] Verificar lint:
  ```bash
  cd BackEnd && npm run lint
  ```

---

## 🗄️ FASE 2: DATABASE MIGRATION (30 min)

### 2.1 Backup OBRIGATÓRIO

- [ ] Fazer backup:
  ```bash
  mysqldump -u root -p comaes_db > backup_before_drop_isAdmin.sql
  ```
- [ ] Verificar que backup foi criado:
  ```bash
  ls -lh backup_before_drop_isAdmin.sql
  ```

### 2.2 Executar Migration

- [ ] Abrir MySQL:
  ```bash
  mysql -u root -p comaes_db
  ```
- [ ] Executar:
  ```bash
  source MIGRATION_DATABASE.sql
  ```
- [ ] OU copiar/colar commands do arquivo `MIGRATION_DATABASE.sql`

### 2.3 Verificações Pós-Migration

- [ ] Verificar que coluna foi removida:
  ```sql
  DESCRIBE usuarios;
  -- Não deve ter isAdmin
  ```

- [ ] Verificar admin master:
  ```sql
  SELECT id, nome, email, role FROM usuarios WHERE id = 1;
  -- Deve ter role='admin'
  ```

- [ ] Verificar todos admins:
  ```sql
  SELECT id, nome, email, role FROM usuarios WHERE role='admin';
  ```

---

## 🎨 FASE 3: FRONTEND (1 hora)

### 3.1 Atualizar AuthContext.jsx

- [ ] Abrir `FrontEnd/src/context/AuthContext.jsx`
- [ ] REMOVER todas referências a `isAdmin`:
  - [ ] Função `getPostLoginRoute`: remover check `user.isAdmin`
  - [ ] Função `normalize`: remover `isAdmin` do objeto

- [ ] Substituir:
  ```javascript
  // ❌ ANTES
  const role = user.role || (user.isAdmin ? 'admin' : 'estudante');
  if (role === 'admin' || user.isAdmin === true) return '/administrador';
  
  // ✅ DEPOIS
  const role = user.role || 'estudante';
  if (role === 'admin') return '/administrador';
  ```

### 3.2 Atualizar TableManager.jsx

- [ ] Abrir `FrontEnd/src/Administrador/TableManager.jsx`
- [ ] REMOVER completamente a função `buildTableInfoFromData`
- [ ] Remover o uso dela (linha ~290):
  ```javascript
  // ❌ REMOVER
  } else {
    const built = buildTableInfoFromData(rows);
    setTableInfo(built);
  }
  
  // ✅ SUBSTITUIR
  } else {
    setError('Tabela não tem definição estática. Configure STATIC_TABLE_DEFS.');
    setTableInfo(null);
  }
  ```

### 3.3 Atualizar todos componentes admin

- [ ] Grep em FrontEnd:
  ```bash
  grep -r "isAdmin" FrontEnd/src/Administrador/
  ```
- [ ] Para CADA ocorrência:
  - [ ] Substituir `user.isAdmin` por `user.role === 'admin'`
  - [ ] Substituir `isAdmin || role === 'admin'` por `role === 'admin'`

### 3.4 Build do frontend

- [ ] Testar build:
  ```bash
  cd FrontEnd && npm run build
  ```
- [ ] Deve passar sem erros

---

## 🧪 FASE 4: TESTING (1 hora)

### 4.1 Testes de Autenticação

- [ ] Iniciar backend:
  ```bash
  cd BackEnd && npm run dev
  ```

- [ ] Iniciar frontend:
  ```bash
  cd FrontEnd && npm run dev
  ```

- [ ] Login como admin:
  - [ ] Email: admin@comaes.com
  - [ ] Verificar que login funciona
  - [ ] Verificar que redireciona para `/administrador`

### 4.2 Testes do Painel Admin

- [ ] Acessar: http://localhost:3001/administrador
- [ ] Verificar cada aba:
  - [ ] ✅ Visão Geral (dashboard)
  - [ ] ✅ Gerenciar Torneios
  - [ ] ✅ Gerenciar Certificados
  - [ ] ✅ Questões de Torneios
  - [ ] ✅ Questões dos Testes
  - [ ] ✅ Questões Pendentes
  - [ ] ✅ Questões dos Colaboradores
  - [ ] ✅ Gerenciar Usuários
  - [ ] ✅ Pedidos de Colaboradores
  - [ ] ✅ Todos os Colaboradores
  - [ ] ✅ Gerenciar Notícias
  - [ ] ✅ Centro de Notificações

### 4.3 Testes de Segurança

- [ ] Tentar acessar modelo não autorizado:
  - [ ] Modificar URL: `?table=redefinicaosenha`
  - [ ] Deve mostrar erro: "Tabela não permitida"

- [ ] Verificar que não há erros 403 inconsistentes:
  - [ ] Navegar entre abas múltiplas vezes
  - [ ] Refresh da página
  - [ ] Voltar e avançar no browser

- [ ] Verificar console do browser:
  - [ ] Não deve ter erros JavaScript
  - [ ] Não deve ter avisos de CORS

### 4.4 Testes de Roles

- [ ] Logout do admin
- [ ] Login como estudante:
  - [ ] Tentar acessar `/administrador`
  - [ ] Deve redirecionar ou mostrar 403

- [ ] Login como colaborador:
  - [ ] Tentar acessar `/administrador`
  - [ ] Deve redirecionar ou mostrar 403

---

## ✅ VERIFICAÇÃO FINAL

### Checklist de Código

- [ ] ❌ Zero referências a `isAdmin` no código:
  ```bash
  grep -r "isAdmin" BackEnd/ --exclude-dir=node_modules | grep -v "// ❌" | grep -v "deprecated"
  grep -r "isAdmin" FrontEnd/src/ --exclude-dir=node_modules | grep -v "// ❌"
  ```

- [ ] ✅ JWT contém apenas `{id, role}`:
  ```bash
  grep -A 10 "jwt.sign" BackEnd/index.js
  # Verificar payload
  ```

- [ ] ✅ Database não tem coluna `isAdmin`:
  ```sql
  DESCRIBE usuarios;
  ```

- [ ] ✅ Todos middlewares usam sistema novo:
  ```bash
  grep -r "from.*auth.js" BackEnd/routes/
  grep -r "from.*authorize.js" BackEnd/routes/
  ```

### Checklist de Funcionalidade

- [ ] Login funciona
- [ ] Painel admin acessível
- [ ] Todas as abas funcionam
- [ ] Nenhum erro 403 inconsistente
- [ ] UI não muda inesperadamente
- [ ] Modelos não autorizados são rejeitados
- [ ] Build do frontend passa
- [ ] Lint do backend passa

---

## 🚀 DEPLOY

### Preparação

- [ ] Commit das mudanças:
  ```bash
  git add .
  git commit -m "refactor: unify auth system, remove isAdmin, implement whitelist"
  ```

- [ ] Push para repositório:
  ```bash
  git push origin restructure/auth-system-unified
  ```

- [ ] Criar Pull Request com:
  - [ ] Link para RESTRUCTURE_COMPLETE_SUMMARY.md
  - [ ] Checklist de testing completo
  - [ ] Screenshots do painel funcionando

### Produção (APENAS após aprovação)

- [ ] Fazer backup da database de produção
- [ ] Aplicar migration em produção
- [ ] Deploy do backend
- [ ] Deploy do frontend
- [ ] Testar em produção
- [ ] Monitorar logs por 24h

---

## 📞 TROUBLESHOOTING

### Problema: Build falha

**Solução**:
```bash
# Limpar cache
rm -rf FrontEnd/node_modules/.vite
rm -rf FrontEnd/dist

# Rebuild
cd FrontEnd && npm run build
```

### Problema: Erros 403 após migration

**Solução**:
- Verificar que role está correto no DB
- Verificar que JWT está sendo gerado corretamente
- Limpar localStorage do browser
- Fazer logout e login novamente

### Problema: "Tabela não permitida"

**Solução**:
- Verificar ALLOWED_ADMIN_MODELS em:
  - `BackEnd/utils/modelMapperSecure.js`
  - `FrontEnd/src/Administrador/adminService.js`
- Adicionar modelo à whitelist se necessário

### Rollback Completo

Se algo der muito errado:

```bash
# 1. Restaurar database
mysql -u root -p comaes_db < backup_before_drop_isAdmin.sql

# 2. Voltar código
git checkout main
git branch -D restructure/auth-system-unified

# 3. Restart servers
```

---

**CONCLUSÃO**: Após completar TODAS as etapas, o sistema estará completamente reestruturado com:
- ✅ UMA fonte de verdade (role)
- ✅ UMA forma de autorização (authenticate + requireRole)
- ✅ Whitelist estrita de modelos
- ✅ Zero inconsistências
- ✅ Zero erros 403 inesperados

**Tempo estimado total**: 4-5 horas

