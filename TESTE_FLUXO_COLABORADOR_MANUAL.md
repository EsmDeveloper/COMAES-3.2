# 🧪 Teste Manual: Fluxo Completo de Cadastro de Colaborador

**Data**: 2026-06-10  
**Duração**: ~10 minutos  
**Requisitos**: Aplicação rodando (Backend + Frontend)

---

## ⏱️ Passo a Passo (10 minutos)

### PASSO 1: Iniciar Servidores (2 min)

```bash
# Terminal 1: Backend
cd BackEnd
npm run dev

# Terminal 2: Frontend
cd FrontEnd
npm run dev
```

**Esperado**:
- Backend: "Servidor rodando em http://0.0.0.0:3000" ✓
- Frontend: "Local: http://localhost:5173" ✓

---

### PASSO 2: Navegador - Ir para Registro de Colaborador (1 min)

1. Abra http://localhost:5173
2. Procure pelo botão "Criar Conta de Colaborador"
3. OU vá para http://localhost:5173/auth?mode=colaborador-registro

**Esperado**: Formulário visível com campos

---

### PASSO 3: Preencher o Formulário (3 min)

Preencha com estes dados de TESTE (use esses valores exatos):

```
Nome Completo:       🟢 João Silva Professor
Username:            🟢 joao_silva_prof_2026
Email:               🟢 joao.silva.2026@gmail.com
Área Especialidade:  🟢 Matemática (dropdown)
Nível Académico:     🟢 Professor (dropdown)
Biografia:           🟢 Sou um professor de matemática com 10 anos de experiência 
                        em ensino. Tenho certificação em pedagogia moderna.
Palavra-passe:       🟢 SecurePass123!
Confirmar Palavra:   🟢 SecurePass123!
Documentos:          ⚪ Deixe em branco (opcional)
```

**Importante**: 
- Palavra-passe DEVE ter maiúscula, minúscula, número E símbolo
- Especialidade DEVE ser selecionada (Não vazio!)
- Nível académico DEVE ser selecionado

---

### PASSO 4: Verificar Resumo (1 min)

Antes de clicar no botão enviar, DEVE aparecer:

```
📋 Resumo da sua candidatura:
• Nome: João Silva Professor
• Email: joao.silva.2026@gmail.com
• Área: Matemática        ← IMPORTANTE: verificar se aparece!
• Nível: Professor
• Documentos: Nenhum
```

**Se a Área aparecer como (vazio)**: ❌ Problema backend/frontend  
**Se aparecer corretamente**: ✅ OK!

---

### PASSO 5: Enviar Candidatura (1 min)

1. Clique no botão azul que diz:
   ```
   ✓ Enviar Candidatura para Análise do Admin
   ```

2. Aguarde a resposta (deve mostrar "Enviando..." com spinner)

3. **Esperado**: Mensagem de sucesso
   ```
   ✅ Registo enviado com sucesso. 
      A sua candidatura será analisada pelo administrador.
   ```

4. Se aparecer ❌ ERRO:
   - Verifique o console (F12)
   - Verifique o email (pode ser que já exista)
   - Verifique a palavra-passe (precisa cumprir requisitos)

---

### PASSO 6: Admin Panel - Ver Colaborador Pendente (2 min)

1. Logout (se estava logado)
2. Faça login como Admin:
   ```
   Email: admin@example.com
   Senha: admin123
   ```

3. Vá para **Admin Panel** → **Gestão de Colaboradores**
   OU
   **Admin Panel** → **Colaboradores Pendentes**

4. **Deve ver** a nova entrada:
   ```
   Nome: João Silva Professor
   Email: joao.silva.2026@gmail.com
   Status: Pendente (azul)
   Área: Matemática  ← VERIFICAR SE APARECE!
   ```

5. Clique no colaborador para ver detalhes

---

### PASSO 7: Verificar Especialidade Salva (1 min)

No modal de detalhes do colaborador, DEVE aparecer:

```
Área pretendida: Matemática  ← IMPORTANT! Se não aparecer = PROBLEMA
Nível académico: Professor
```

**Se aparecer como vazio ou "null"**: ❌ Não foi salvo  
**Se aparecer "Matemática"**: ✅ FOI SALVO CORRETAMENTE!

---

### PASSO 8: Aprovar Colaborador (1 min)

1. Clique no botão "Aprovar" (verde)
2. Selecione disciplina:
   - Pode ser IGUAL (Matemática) ou DIFERENTE
   - Para teste, escolha **Programação** (para testar que pode ser diferente)
3. Clique "Confirmar"

**Esperado**: 
```
✅ João Silva Professor aprovado com sucesso!
```

Status muda de "Pendente" para "Aprovado"

---

### PASSO 9: Verificar Acesso como Colaborador (1 min)

1. Logout do Admin
2. **Novo login** com dados do colaborador criado:
   ```
   Email: joao.silva.2026@gmail.com
   Senha: SecurePass123!
   ```

3. **Deve ter acesso** a:
   - ✅ Dashboard Colaborador
   - ✅ Criar Questões
   - ✅ Ver Minhas Questões
   - ✅ Submeter Blocos

**Se receber erro de acesso**: ❌ Aprovação não funcionou

---

## ✅ Checklist Final

Marque o que funcionou:

- [ ] Formulário carrega sem erros
- [ ] Campo "Nome" está visível e preenchível
- [ ] Campo "Área" é obrigatório e tem options
- [ ] Resumo mostra "Área: Matemática" (correto)
- [ ] Botão "Enviar para Análise do Admin" funciona
- [ ] Colaborador aparece na aba "Pendentes" do admin
- [ ] Admin vê "Área: Matemática" no detalhe
- [ ] Admin consegue aprovar
- [ ] Colaborador consegue fazer login após aprovação
- [ ] Colaborador consegue criar questões

**Se tudo marcado**: ✅ **FLUXO COMPLETO FUNCIONANDO!**

---

## 🐛 Se Algo Não Funcionar

### Cenário A: Colaborador não aparece na aba de Pendentes
**Diagnóstico**:
1. F12 → Console → verifique se há erros de JavaScript
2. F12 → Network → POST /auth/registro-colaborador
   - Status deve ser 201
   - Response deve ter "success": true
3. Se status for 422: Validação falhou (veja qual campo)
4. Se status for 409: Email já existe

**Solução**: Use email DIFERENTE para cada teste

### Cenário B: Área não aparece no resumo
**Diagnóstico**:
1. Verificar se selecionou Área no dropdown
2. F12 → Console → ver se há logs de erro
3. F12 → Network → FormData deve incluir "area_especialidade"

**Solução**: Recarregar página e tentar novamente

### Cenário C: Área não salva no admin
**Diagnóstico**:
1. Abrir DevTools do navegador (F12)
2. Network → GET /api/admin/colaboradores-pendentes
   - Response deve ter "area_especialidade": "matematica"
3. Se estiver null: Backend NÃO está salvando

**Solução**: Verificar se o código foi alterado corretamente

---

## 📊 Informações do Teste

| Item | Valor | Status |
|------|-------|--------|
| Backend Endpoint | POST /auth/registro-colaborador | ✅ |
| Frontend Form | CollaboratorRegisterForm.jsx | ✅ |
| Admin Endpoint | GET /api/admin/colaboradores-pendentes | ✅ |
| Campo Nome | Presente e validado | ✅ |
| Campo Área | Presente e AGORA SALVO | ✅ |
| Resumo Visual | ADICIONADO | ✅ |
| Botão Enviar | MELHORADO | ✅ |

---

## 💾 Arquivos Envolvidos

```
Frontend:
  - src/Paginas/Primarias/CollaboratorRegisterForm.jsx ← MODIFICADO
  - src/Paginas/Primarias/AuthContainer.jsx (usa o form)
  - src/Administrador/ColaboradoresPendentesTab.jsx (mostra pendentes)
  - src/Administrador/adminService.js (faz chamadas API)

Backend:
  - controllers/colaboradorRegistroController.js ← MODIFICADO
  - controllers/UserController.js (getColaboradoresPendentes)
  - routes/authRoutes.js (POST /auth/registro-colaborador)
  - routes/adminPanelRoutes.js (GET /admin/colaboradores-pendentes)

Database:
  - usuarios table (role='colaborador', status_colaborador='pendente')
```

---

**Duração estimada**: 10 minutos  
**Dificuldade**: ⭐ Muito Fácil  
**Resultado esperado**: ✅ Fluxo completo funcionando  

