# 🚀 GUIA RÁPIDO - SISTEMA DE QUESTÕES REFATORADO

**Versão**: 1.0  
**Data**: 22 de Maio de 2026  
**Status**: ✅ Pronto para Produção

---

## 📌 ACESSO RÁPIDO

### Para Administradores

1. **Acessar Painel Admin**
   - URL: `http://localhost:3000/admin` (ou seu domínio)
   - Faça login com credenciais de admin

2. **Ir para Questões**
   - No menu lateral, clique em **"Questões (Unificado)"**
   - Você verá a lista de todas as questões

3. **Criar Nova Questão**
   - Clique no botão verde **"+ Nova Questão"**
   - Preencha o formulário
   - Clique em **"Criar Questão"**

---

## 📝 CRIAR QUESTÃO - PASSO A PASSO

### 1️⃣ Abrir Formulário
```
Menu → Questões (Unificado) → + Nova Questão
```

### 2️⃣ Preencher Campos Obrigatórios

| Campo | Tipo | Exemplo |
|-------|------|---------|
| **Torneio** | Seleção | COMAES 2026 |
| **Disciplina** | Seleção | Matemática / Inglês / Programação |
| **Tipo** | Seleção | Múltipla Escolha / Texto / Código |
| **Título** | Texto | Resolva a equação quadrática |
| **Descrição** | Texto Longo | Encontre as raízes de x² + 5x + 6 = 0 |
| **Dificuldade** | Seleção | Fácil / Médio / Difícil |
| **Pontos** | Número | 10 (padrão) |
| **Resposta Correta** | Texto | -2 e -3 |

### 3️⃣ Campos Específicos por Tipo

#### 🔘 Múltipla Escolha
- Adicione pelo menos 2 opções
- Clique "+ Adicionar Opção" para mais
- Exemplo:
  - Opção 1: -2 e -3
  - Opção 2: 2 e 3
  - Opção 3: -2 e 3
  - Opção 4: 2 e -3

#### 📝 Texto
- Resposta correta é o texto esperado
- Exemplo: "A capital de Angola é Luanda"

#### 💻 Código
- Selecione linguagem: JavaScript, Python, Java, C++
- Resposta correta é o código esperado
- Exemplo: `function sum(a, b) { return a + b; }`

### 4️⃣ Campos Opcionais
- **Explicação**: Texto que explica a resposta correta
- **Linguagem**: Apenas para tipo "Código"

### 5️⃣ Salvar
- Clique em **"Criar Questão"**
- Aguarde confirmação
- Questão aparecerá na lista

---

## 🔍 GERENCIAR QUESTÕES

### Buscar Questão
```
Campo "Buscar" → Digite título ou descrição → Enter
```

### Filtrar por Disciplina
```
Dropdown "Disciplina" → Selecione (Matemática/Inglês/Programação)
```

### Filtrar por Torneio
```
Dropdown "Torneio" → Selecione torneio
```

### Editar Questão
```
Clique botão "Editar" (em desenvolvimento)
```

### Deletar Questão
```
Clique botão "Deletar" → Confirme → Questão removida
```

---

## 🎯 EXEMPLOS PRÁTICOS

### Exemplo 1: Questão de Múltipla Escolha (Matemática)

```
Torneio: COMAES 2026
Disciplina: Matemática
Tipo: Múltipla Escolha
Título: Quanto é 2 + 2?
Descrição: Calcule a soma de 2 + 2
Dificuldade: Fácil
Pontos: 5
Opções:
  - 3
  - 4 ← CORRETA
  - 5
  - 6
Resposta Correta: 4
Explicação: 2 + 2 = 4
```

### Exemplo 2: Questão de Texto (Inglês)

```
Torneio: COMAES 2026
Disciplina: Inglês
Tipo: Texto
Título: Tradução de "Livro"
Descrição: Qual é a tradução de "livro" em inglês?
Dificuldade: Fácil
Pontos: 10
Resposta Correta: book
Explicação: A palavra "book" significa livro em inglês
```

### Exemplo 3: Questão de Código (Programação)

```
Torneio: COMAES 2026
Disciplina: Programação
Tipo: Código
Título: Função de Soma
Descrição: Escreva uma função que soma dois números
Dificuldade: Médio
Pontos: 20
Linguagem: JavaScript
Resposta Correta: function sum(a, b) { return a + b; }
Explicação: A função recebe dois parâmetros e retorna sua soma
```

---

## 📊 VISUALIZAR QUESTÕES

### Tabela de Questões

| Coluna | Descrição |
|--------|-----------|
| **Título** | Nome da questão |
| **Disciplina** | Matemática / Inglês / Programação |
| **Tipo** | Múltipla Escolha / Texto / Código |
| **Dificuldade** | Fácil (🟢) / Médio (🟡) / Difícil (🔴) |
| **Pontos** | Pontuação da questão |
| **Ações** | Editar / Deletar |

### Cores de Dificuldade
- 🟢 **Fácil**: Verde
- 🟡 **Médio**: Amarelo
- 🔴 **Difícil**: Vermelho

---

## 🔗 ENDPOINTS DA API

### Para Desenvolvedores

#### Criar Questão
```bash
POST /api/questoes
Authorization: Bearer {token}
Content-Type: application/json

{
  "torneio_id": 1,
  "titulo": "Questão de Teste",
  "descricao": "Descrição da questão",
  "disciplina": "matematica",
  "tipo": "multipla_escolha",
  "dificuldade": "facil",
  "resposta_correta": "A",
  "pontos": 10,
  "opcoes": ["A", "B", "C", "D"],
  "explicacao": "Explicação da resposta"
}
```

#### Listar Questões
```bash
GET /api/questoes?disciplina=matematica&pagina=1&limite=20
Authorization: Bearer {token}
```

#### Obter Questão
```bash
GET /api/questoes/{id}
Authorization: Bearer {token}
```

#### Atualizar Questão
```bash
PUT /api/questoes/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "titulo": "Novo Título",
  "descricao": "Nova Descrição"
}
```

#### Deletar Questão
```bash
DELETE /api/questoes/{id}
Authorization: Bearer {token}
```

#### Listar por Torneio
```bash
GET /api/questoes/torneio/{torneioId}?disciplina=matematica
Authorization: Bearer {token}
```

#### Carregar Quiz
```bash
GET /api/questoes/quiz/matematica?limit=10
(Sem autenticação)
```

---

## ⚠️ ERROS COMUNS

### ❌ "Selecione um torneio"
- **Causa**: Campo torneio vazio
- **Solução**: Selecione um torneio no dropdown

### ❌ "Título é obrigatório"
- **Causa**: Campo título vazio
- **Solução**: Digite um título para a questão

### ❌ "Adicione pelo menos 2 opções"
- **Causa**: Menos de 2 opções para múltipla escolha
- **Solução**: Clique "+ Adicionar Opção" e preencha

### ❌ "Todas as opções devem ser preenchidas"
- **Causa**: Alguma opção está vazia
- **Solução**: Preencha todas as opções ou remova as vazias

### ❌ "Erro ao criar questão"
- **Causa**: Erro no servidor
- **Solução**: Verifique console do backend, tente novamente

---

## 💡 DICAS E BOAS PRÁTICAS

### ✅ Faça
- ✅ Use títulos descritivos e claros
- ✅ Forneça descrições detalhadas
- ✅ Adicione explicações para ajudar alunos
- ✅ Varie dificuldades nas questões
- ✅ Use pontuação apropriada
- ✅ Teste questões antes de usar em torneios

### ❌ Evite
- ❌ Títulos muito longos (>100 caracteres)
- ❌ Descrições muito curtas (<10 caracteres)
- ❌ Opções duplicadas em múltipla escolha
- ❌ Respostas ambíguas
- ❌ Pontuação muito alta (>100)
- ❌ Questões sem explicação

---

## 🔄 FLUXO COMPLETO

```
1. Admin acessa painel
   ↓
2. Clica em "Questões (Unificado)"
   ↓
3. Vê lista de questões existentes
   ↓
4. Clica "+ Nova Questão"
   ↓
5. Preenche formulário
   ↓
6. Clica "Criar Questão"
   ↓
7. Questão é validada no frontend
   ↓
8. Dados são enviados para /api/questoes
   ↓
9. Backend valida novamente
   ↓
10. Questão é salva em Questao.js
    ↓
11. Resposta de sucesso retorna
    ↓
12. Modal fecha
    ↓
13. Lista é atualizada
    ↓
14. Nova questão aparece na tabela
```

---

## 📞 SUPORTE

### Problemas Técnicos
1. Verifique se o backend está rodando
2. Verifique se o banco de dados está acessível
3. Abra DevTools (F12) e verifique console
4. Verifique logs do backend

### Dúvidas sobre Funcionalidades
- Consulte este guia
- Verifique exemplos práticos acima
- Teste com dados de exemplo

---

## 🎓 RECURSOS ADICIONAIS

- **Documentação Completa**: `INTEGRATION_COMPLETE_SUMMARY.md`
- **Testes de Integração**: `INTEGRATION_TEST_QUESTOES.js`
- **Modelo de Dados**: `BackEnd/models/Questao.js`
- **Controller**: `BackEnd/controllers/QuestoesControllerRefactored.js`
- **Rotas**: `BackEnd/routes/questoesRoutesRefactored.js`

---

**Última atualização**: 22 de Maio de 2026  
**Versão**: 1.0  
**Status**: ✅ Pronto para Produção
