# 🧪 Como Testar: Aba "Questões Colaboradores"

**Objetivo**: Verificar que a aba "Questões Colaboradores" do Admin Panel carrega dados corretamente sem renderizar página em branco.

---

## 📋 Pré-requisitos

- ✅ Backend rodando em `http://localhost:3002`
- ✅ Frontend rodando em `http://localhost:5173` ou outra porta
- ✅ Login como **ADMIN** (não funcionará com user normal)
- ✅ Deve haver **pelo menos um bloco ou questão aprovada** no banco

---

## 🎬 Passos para Testar

### 1. Faça Login como Admin
```
1. Vá para http://localhost:5173/login
2. Insira credenciais de ADMIN
3. Clique em "Entrar"
4. Aguarde redirecionamento para /administrador
```

### 2. Navegue até o Painel Admin
```
1. Se não estiver em /administrador, vá para lá
2. Deve ver um menu com várias abas/opções
```

### 3. Clique na Aba "Questões dos Colaboradores"
```
1. Procure por aba com nome: "Questões dos Colaboradores"
   - Icon: GraduationCap (ícone de cap/graduado)
   - Cor: Verde ou outro destacado
2. CLIQUE nela
```

### 4. Verifique o Resultado

#### ✅ SE FUNCIONAR (Esperado):
- [ ] Vê header: "Questões Aprovadas dos Colaboradores"
- [ ] Vê descrição: "Visualize e gerencie questões..."
- [ ] Vê seção com filtros:
  - [ ] Campo de busca ("Buscar por título...")
  - [ ] Dropdown de disciplinas (Matemática, Programação, Inglês)
  - [ ] Botão "Atualizar" com ícone de refresh
- [ ] Vê **duas colunas lado a lado**:
  - [ ] **Esquerda**: "Blocos Aprovados" com contador
  - [ ] **Direita**: "Questões Solo Aprovadas" com contador
- [ ] Se tiver dados:
  - [ ] Blocos mostram: título, disciplina, dificuldade, # questões
  - [ ] Questões mostram: título, disciplina, dificuldade, alternativas
  - [ ] Cada item tem botões: "Ver" e "Deletar"
- [ ] Se não tiver dados:
  - [ ] Vê ícone + mensagem "Nenhum bloco aprovado" (OK!)
  - [ ] Vê ícone + mensagem "Nenhuma questão solo aprovada" (OK!)

#### ❌ SE NÃO FUNCIONAR (Erro):
- [ ] Vê página **branca/vazia** → Erro
- [ ] Vê **spinner infinito** de carregamento → Possível timeout
- [ ] Vê mensagem **vermelha de erro** → Backend offline/problema

**Se error**: Clique "Tentar novamente" no botão vermelho

---

## 🔧 Testes Adicionais

### Teste 1: Filtro por Disciplina
```
1. Se houver dados, use o dropdown "Disciplinas"
2. Selecione "Matemática"
   - Resultado: Blocos/questões filtram por Matemática
3. Selecione "Programação"
   - Resultado: Blocos/questões filtram por Programação
```

### Teste 2: Busca
```
1. No campo "Buscar por título ou descrição..."
2. Digite uma palavra-chave (ex: "Algebra")
3. Resultado: Lista filtra em tempo real
```

### Teste 3: Botão Atualizar
```
1. Clique em botão "Atualizar" com ícone refresh
2. Resultado: Dados recarregam (vê spinner, depois dados)
```

### Teste 4: Combinado (Filtro + Busca)
```
1. Selecione disciplina
2. Digite busca
3. Resultado: Filtra por AMBOS os critérios
```

### Teste 5: Visualizar Detalhes
```
1. Clique botão "Ver" em um item
2. Resultado: Abre modal com detalhes completos
```

### Teste 6: Deletar (Cuidado!)
```
1. Clique botão "Deletar" em um item
2. Aparece confirmação: "Tem certeza que deseja deletar..."
3. Clique "Deletar" na modal
4. Resultado: Item desaparece da lista
```

---

## 🐛 Verificar Console para Erros

Se houver problema, abra Developer Tools:

```
1. Pressione F12 (ou Ctrl+Shift+I no Windows)
2. Vá para aba "Console"
3. Procure por mensagens com:
   - [ERROR] - Erros críticos
   - [WARN] - Avisos
   - Messages em vermelho

EXEMPLOS ESPERADOS (OK):
✅ "Carregando blocos..."
✅ "Carregando questões..."
✅ Nenhum erro após 2 segundos

EXEMPLOS DE ERRO (Não OK):
❌ "Token de autenticação não encontrado"
❌ "Erro ao carregar blocos"
❌ "TypeError: carregando is not a function"
```

---

## 🌐 Verificar Network

Se suspeitar de problema de API:

```
1. Pressione F12
2. Vá para aba "Network"
3. Recarregue a página (F5)
4. Procure por requests:
   - GET /api/blocos-colaboradores
   - GET /api/questoes
   - GET /api/blocos (fallback)

Cada um deve retornar:
✅ Status 200 com dados
✅ Response JSON com array de blocos/questões

Se retornar:
❌ Status 404 - Endpoint não existe
❌ Status 401 - Token inválido
❌ Status 500 - Erro no servidor
```

---

## 📊 Esperado vs Real

### Estado 1: Carregando
```
[Spinner girando]
Carregando blocos...
```
**Duração esperada**: 1-3 segundos

### Estado 2: Com Dados
```
Blocos Aprovados [5]          Questões Solo Aprovadas [12]
┌─────────────────────┐       ┌──────────────────────────┐
│ Bloco 1             │       │ Questão 1                │
│ Matemática | Médio  │       │ Programação | Difícil    │
│ 5 questões          │       │ Alternativas: A, B, C, D │
│ [Ver] [Deletar]     │       │ [Ver detalhes] [Deletar] │
└─────────────────────┘       └──────────────────────────┘
```

### Estado 3: Vazio (Sem Dados)
```
Blocos Aprovados [0]          Questões Solo Aprovadas [0]
┌─────────────────────┐       ┌──────────────────────────┐
│     [Ícone]         │       │     [Ícone]              │
│ Nenhum bloco        │       │ Nenhuma questão          │
│ aprovado            │       │ solo aprovada            │
└─────────────────────┘       └──────────────────────────┘
```

### Estado 4: Erro
```
┌────────────────────────────────────────────────────────┐
│ ⚠️ Erro ao carregar questões. Verifique a conexão     │
│    com o servidor.                                     │
│                                      [Tentar novamente]│
└────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist Final

- [ ] Aba carrega sem ficar em branco
- [ ] Header e descrição visíveis
- [ ] Filtros renderizam corretamente
- [ ] Dados carregam (ou mensagem vazia se sem dados)
- [ ] Duas colunas layout funciona
- [ ] Filtro de disciplina funciona
- [ ] Busca funciona
- [ ] Botão atualizar funciona
- [ ] Nenhuma mensagem de erro no console (exceto avisos)
- [ ] Aba não trava/congela

---

## 🆘 Se Ainda Tiver Problemas

### 1. Verificar Backend
```
curl http://localhost:3002/health
```
Deve retornar: `{"status":"ok"}`

### 2. Verificar Token
```
F12 → Application/Storage → LocalStorage
Procurar por "comaes_token"
Se não tiver → Fazer login novamente
```

### 3. Verificar Banco de Dados
```
Se não houver dados:
- Dados podem estar em status "pendente" (não "aprovada")
- Criar dados de teste em outro lugar
- Ou usar dados já aprovados
```

### 4. Reiniciar
```
1. Frontend: Ctrl+Shift+Delete (limpar cache) depois F5
2. Backend: Parar e reiniciar servidor
3. Banco: Verificar se está online
```

---

## 📝 Relatar Problema

Se ainda tiver problema após testes, relatar com:

```
1. Screenshot de what you see (página branca? spinner? erro?)
2. Console errors (F12 → Console)
3. Network requests status (F12 → Network)
4. Backend status (curl /health)
5. Passo exato que fez antes de erro
```

---

**Status**: A aba deve estar **100% funcional**. Se ver página em branco, é um bug que deve ser reportado com informações acima.
