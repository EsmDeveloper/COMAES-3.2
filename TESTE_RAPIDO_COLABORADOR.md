# ⚡ Teste Rápido do Painel Colaborador

**Tempo estimado:** 5 minutos  
**Data:** 7 de Junho de 2026

---

## 🎯 Objetivo

Verificar se todas as correções estão funcionando:
- ✅ Carregar questões
- ✅ Criar questão
- ✅ Admin revisar
- ✅ Colaborador ver aprovada

---

## 📋 Pré-requisitos

- ✅ Backend rodando (`npm start` ou `yarn start`)
- ✅ Frontend rodando (`npm run dev`)
- ✅ Database com dados de teste
- ✅ Navegador com DevTools aberto (F12)

---

## 🧪 Passos de Teste

### PASSO 1: Login como Colaborador (1 min)

1. Acesse `http://localhost:5173` (ou sua URL)
2. **Email:** `joao.prof@example.com`
3. **Senha:** `senha123` (ou conforme seu sistema)
4. Você deve estar em **Disciplina: Matemática**
5. Clique em **"Painel do Colaborador"**

**Esperado:**
```
✅ Dashboard carrega sem erro
✅ Mostra: Questões Aprovadas, Questões em Revisão, Total
```

---

### PASSO 2: Verificar Carregamento de Questões (1 min)

1. Na página **"Minhas Questões"**, observe a aba **"Questões"**
2. Abra **DevTools** → **Console**
3. Procure por mensagens de log

**Esperado no Console:**
```javascript
// Sucesso:
GET /api/colaborador/questoes 200 OK
✅ response.dados.questoes array com items

// Se erro:
❌ Procure por: "Unknown column", "Acesso negado", "Failed to fetch"
```

**Esperado na Página:**
```
✅ Lista de questões carrega
✅ Questões aparecem em cards
✅ Sem mensagem de erro vermelha
```

---

### PASSO 3: Criar Nova Questão (2 min)

1. Na aba **"Submeter Questão"**, preencha:

```
Título:           "Quanto é 2+2?"
Enunciado:        "Escolha a resposta correta"
Disciplina:       "Matemática" (automático)
Dificuldade:      "Fácil"
Pontos:           10
Opções:           "3 | 4 | 5 | 6"
Resposta Correta: "4"
Explicação:       "Porque 2+2=4" (opcional)
```

2. Clique **"Submeter Questão"**

**Esperado:**
```
✅ Mensagem verde: "✅ Questão criada! Aguarde aprovação"
✅ Página volta para "Minhas Questões" após 3 segundos
✅ Questão aparece em "Questões em Revisão"

No Console:
✅ POST /api/colaborador/questoes 201 Created
```

---

### PASSO 4: Testar Validações (30 seg)

1. Clique **"Nova Questão"** novamente
2. **Deixe em branco** e clique **"Submeter"**

**Esperado:**
```
❌ Mensagem de erro: "Título da questão é obrigatório"
✅ Não submete o formulário
```

3. Preencha tudo, mas coloque **Resposta Correta: "10"** (não existe)
4. Clique **"Submeter"**

**Esperado:**
```
❌ Mensagem de erro: "Resposta correta deve estar entre as opções"
```

---

### PASSO 5: Login como Admin (30 seg)

1. Clique **"Sair"** (ou logout)
2. Login como **Admin**:
   - **Email:** `admin@example.com`
   - **Senha:** `admin123` (conforme seu sistema)

3. Vá para **"Revisão de Questões"** (na aba Admin)

**Esperado:**
```
✅ Página carrega sem erro
✅ Questão que criamos aparece com status "Pendente"
```

---

### PASSO 6: Admin Aprova Questão (30 seg)

1. Na lista de questões pendentes, encontre a que criamos
2. Clique **"Aprovar"**

**Esperado:**
```
✅ Toast/notificação: "Questão aprovada!"
✅ Questão desaparece da lista de pendentes

No Console:
✅ POST /api/admin/questoes/{id}/aprovar 200 OK
```

---

### PASSO 7: Colaborador Vê Aprovada (30 seg)

1. Clique **"Sair"**
2. Login novamente como **Colaborador**
3. Vá para **"Minhas Questões"**

**Esperado:**
```
✅ Questão aparece em "Questões Aprovadas"
✅ Status muda de "Pendente" para "Aprovada"
```

---

## 🎉 Sucesso!

Se chegou aqui e tudo funcionou:

```
✅ Todas as correções estão funcionando
✅ Fluxo de questões está operacional
✅ Sistema pronto para uso
```

---

## ❌ Se Algo Falhou

### Erro: "Erro ao obter questões"

**Solução:**
1. Abra DevTools → Console
2. Procure pela mensagem de erro real
3. Consulte a tabela abaixo:

| Erro | Causa | Solução |
|------|-------|---------|
| `Unknown column 'Questao.createdAt'` | Coluna errada | Verifique se `'created_at'` está correto em ColaboradorController linha 262 |
| `Acesso negado` | Token inválido | Faça logout e login novamente |
| `Colaborador não aprovado` | Colaborador não foi aprovado | Admin deve aprovar via "Colaboradores" |
| `Failed to fetch` | Backend offline | Inicie o backend |
| `401 Unauthorized` | Token expirado | Faça login novamente |
| `404 Not Found` | Endpoint não existe | Verifique se rota foi adicionada em routes |

### Erro ao Criar Questão

**Solução:**
1. Verifique se todos os campos obrigatórios estão preenchidos
2. Verifique se "Resposta Correta" é idêntica a uma das opções
3. Abra DevTools → Network → procure requisição POST falhada
4. Clique na requisição e veja "Response" para erro real

### Admin Não Consegue Aprovar

**Solução:**
1. Verifique se você está logado como **admin** (role = 'admin')
2. Verifique se questão está em status **"pendente"**
3. Abra DevTools → Console e veja erro real

---

## 📝 Notas de Debug

### Logs Úteis para Verificar

No **DevTools Console**, procure por:

```javascript
// ✅ Sucesso ao carregar questões
GET /api/colaborador/questoes 200
✅ response.dados.questoes: [...]

// ✅ Sucesso ao criar questão
POST /api/colaborador/questoes 201
✅ response.dados: { id: 123, status_aprovacao: 'pendente' }

// ✅ Sucesso ao aprovar (admin)
POST /api/admin/questoes/123/aprovar 200
✅ response: { sucesso: true }

// ❌ Erro - coluna errada (já corrigido)
Unknown column 'Questao.createdAt' in 'order clause'

// ❌ Erro - não aprovado
{ mensagem: "Colaborador não aprovado" }
```

---

## ⏱️ Checklist Rápido

- [ ] Login como colaborador funciona
- [ ] "Minhas Questões" carrega sem erro
- [ ] Consegue criar nova questão
- [ ] Validações funcionam
- [ ] Admin consegue revisar questões
- [ ] Admin consegue aprovar
- [ ] Colaborador vê questão aprovada
- [ ] Sem erros no console

Se todos estão ✅, **SUCESSO!**

---

**Tempo total gasto:** ~5 minutos  
**Status:** ✅ Pronto para Validação
