# 🔑 CREDENCIAIS DE ACESSO RÁPIDO - COMAES 3.2

## 🌐 URLs

- **Frontend:** http://localhost:5177
- **Backend API:** http://localhost:3000
- **Database:** localhost:3306 (comaes_db)

---

## 👨‍💼 ADMINISTRADOR

**Email:** `admin@comaes.com`  
**Senha:** `Senha123!`  
**Acesso:** Painel Administrativo Completo

**O que testar:**
- Acessar menu "Questões & Conteúdo" com 4 subsecções
- Revisar questões pendentes dos colaboradores
- Gerenciar torneios e certificados
- Ver estatísticas gerais

---

## 👥 COLABORADORES

### Colaborador 1: Pendente (Aguardando Aprovação)

**Email:** `joao.prof.mat@example.com`  
**Senha:** `Senha123!`  
**Disciplina:** Matemática  
**Status:** 🔴 Pendente  

**O que testar:**
- Tentar acessar como colaborador (verificar se sistema bloqueia ou permite acesso limitado)
- Retornar ao admin e aprovar/rejeitar este colaborador

---

### Colaborador 2: Aprovado com Questões Pendentes

**Email:** `maria.prof.ing@example.com`  
**Senha:** `Senha123!`  
**Disciplina:** Inglês  
**Status:** ✅ Aprovado  
**Questões Pendentes:** 3 questões em revisão  

**O que testar:**
- Acessar painel do colaborador
- Ver questões em "Status: Pendente"
- Retornar ao admin e revisar as 3 questões de Maria
- Testar aprovação/rejeição individual

---

### Colaborador 3: Aprovado com Questões Aceitas

**Email:** `carlos.prof.prog@example.com`  
**Senha:** `Senha123!`  
**Disciplina:** Programação  
**Status:** ✅ Aprovado  
**Questões Aprovadas:** 3+ questões no banco  

**O que testar:**
- Acessar painel do colaborador
- Ver questões em "Status: Aprovado"
- No admin, ir para "Questões dos Colaboradores" e verificar questões de Carlos

---

## 📊 ESTATÍSTICAS DE TESTE

```
Total de Usuários: 19
├── 5 Estudantes
├── 8 Colaboradores (2 pendentes, 6 aprovados)
└── 6 Admins

Questões Populadas:
├── 273 Questões de Teste de Conhecimento
├── 162 Questões Regulares
└── 14 Blocos de Questões

Distribuição:
├── 🏆 Torneios: 1 (com 3 blocos)
├── 📚 Testes: 273 questões
├── ⏳ Pendentes: Questões dos colaboradores
└── 👥 Colaboradores: 6+ questões aprovadas
```

---

## 🧪 FLUXOS DE TESTE RÁPIDOS

### Flow 1: Admin Revisa Colaborador Pendente
```
1. Login: admin@comaes.com / Senha123!
2. Menu → "Usuários & Comunidade" → "Pedidos de Colaboradores"
3. Encontrar João (joao.prof.mat@example.com)
4. Clicar em "Aprovar" ou "Rejeitar"
5. Confirmar ação
```

### Flow 2: Admin Revisa Questões de Colaborador
```
1. Login: admin@comaes.com / Senha123!
2. Menu → "Questões & Conteúdo" → "Questões Pendentes"
3. Procurar questões de Maria (prof.ing)
4. Expandir detalhes
5. Clicar "Aprovar" ou "Rejeitar"
6. Questões aprovadas vão para "Questões dos Colaboradores"
```

### Flow 3: Visualizar Menu Novo
```
1. Login: admin@comaes.com / Senha123!
2. Menu esquerdo → "Questões & Conteúdo"
3. Clicar em cada uma:
   ✅ "Questões de Torneios" (14 blocos)
   ✅ "Questões dos Testes" (273 questões)
   ✅ "Questões Pendentes" (revisão)
   ✅ "Questões dos Colaboradores" (banco aprovado)
```

### Flow 4: Colaborador Aprovado Acessa Sistema
```
1. Logout
2. Login: maria.prof.ing@example.com / Senha123!
3. Verificar dashboard/perfil
4. Procurar seção de "Minhas Questões" (se existir)
5. Ver questões em status "Pendente" e "Aprovado"
```

---

## 🔍 DEBUG RÁPIDO

### Verificar se backend está rodando:
```bash
curl http://localhost:3000/api/health
# ou
netstat -ano | findstr :3000
```

### Verificar se frontend está rodando:
```bash
netstat -ano | findstr :5177
```

### Verificar dados no banco:
```bash
cd BackEnd
node verify_data.js
```

---

## ⚠️ NOTAS IMPORTANTES

1. **Senhas:** Todas as contas usam a senha `Senha123!`
2. **Ambiente:** Desenvolvimento local (localhost)
3. **Banco de Dados:** MySQL em localhost:3306
4. **Servidor Backend:** Node.js/Express em localhost:3000
5. **Servidor Frontend:** React/Vite em localhost:5177

---

## 🎯 OBJETIVOS DE TESTE

- [ ] Menu "Questões & Conteúdo" carrega com 4 abas
- [ ] Cada aba exibe dados corretos (14 blocos, 273 questões, etc.)
- [ ] Busca e filtros funcionam em cada aba
- [ ] Admin pode aprovar/rejeitar colaboradores
- [ ] Admin pode revisar questões pendentes
- [ ] Questões aprovadas aparecem no banco de colaboradores
- [ ] Colaboradores pendentes não podem acessar painel (se bloqueado)
- [ ] Colaboradores aprovados podem acessar seu painel

---

**Última atualização:** 2026-06-06  
**Status:** ✅ Pronto para testes
