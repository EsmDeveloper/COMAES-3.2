# 🔐 CREDENCIAIS DE TESTE - BANCO DE DADOS POPULADO

**Data**: 2026-06-06  
**Status**: ✅ Banco de dados abastecer com sucesso!

---

## 📊 RESUMO DO QUE FOI CRIADO

### 📚 Questões de Teste de Conhecimento
- **Total**: 14 questões
- **Matemática**: 5 questões (fácil, médio, difícil)
- **Inglês**: 4 questões (fácil, médio)
- **Programação**: 5 questões (fácil, médio, difícil)

### 🏆 Torneio
- **Título**: Torneio de Conhecimento Geral 2026
- **ID**: 35
- **Status**: Ativo
- **Data**: 15/06/2026 a 30/06/2026
- **Blocos**: 3 blocos de questões (Matemática, Inglês, Programação)

### 👥 Colaboradores
- **Total**: 2 colaboradores
- **1 PENDENTE** (aguardando aprovação do admin)
- **1 APROVADO** (com cenários de teste)

---

## 🔐 CREDENCIAIS DE ACESSO

### 👤 COLABORADOR 1 - PENDENTE
**Status**: ⏳ Aguardando aprovação (NÃO PODE ACESSAR)

```
Email:      joao.prof.mat@example.com
Senha:      Senha123!
Telefone:   923456101
Disciplina: Matemática
Nome:       João Silva
```

**O que fazer**:
1. Fazer login como ADMIN
2. Revisar colaboradores pendentes
3. Aprovar ou rejeitar João Silva

---

### 👤 COLABORADOR 2 - APROVADO  
**Status**: ✅ Já pode acessar

```
Email:      maria.prof.ing@example.com
Senha:      Senha123!
Telefone:   924567102
Disciplina: Inglês
Nome:       Maria Santos
```

**Cenários de Teste**:

#### Cenário 1️⃣: Questões Pendentes
Maria tem **3 questões PENDENTES** aguardando revisão do admin:
1. Present Perfect - Exercício 1
2. Conditional - Exercício 2
3. Phrasal Verbs - Exercício 3

**O que testar**:
- Fazer login como Maria
- Ver questões pendentes no dashboard
- Como admin, revisar questões de Maria
- Marcar como "Aprovado" ou "Rejeitado"

#### Cenário 2️⃣: Questões Aprovadas
Maria tem **3 questões APROVADAS** já validadas:
1. Vocabulary - Colors
2. Listening Comprehension - Question 1
3. Grammar - Tenses

**O que testar**:
- Fazer login como Maria
- Ver questões aprovadas (já revisadas pelo admin)
- Verificar que não pode rejeitar questões aprovadas
- Verificar que questões aprovadas podem ser editadas (mas voltam para pendente)

---

### 🛡️ ADMINISTRADOR
**Status**: ✅ Acesso total

```
Email:  admin@comaes.com
Senha:  Senha123!
```

**O que fazer**:
1. Fazer login como admin
2. Visualizar colaboradores (1 pendente, 1 aprovado)
3. Revisar questões pendentes de Maria
4. Revisar blocos de questões
5. Gerenciar torneio e blocos

---

## 📋 FLUXOS DE TESTE RECOMENDADOS

### Fluxo 1: Aprovação de Colaborador
1. ✅ Login como ADMIN
2. ✅ Ir para seção de Colaboradores
3. ✅ Ver João Silva com status PENDENTE
4. ✅ Aprovar ou rejeitar
5. ✅ Verificar se João consegue acessar após aprovação

### Fluxo 2: Revisão de Questões Pendentes
1. ✅ Login como ADMIN
2. ✅ Ir para seção "Questões Pendentes"
3. ✅ Ver 3 questões de Maria em status PENDENTE
4. ✅ Revisar cada questão
5. ✅ Marcar como "Aprovado"
6. ✅ Questões devem aparecer em "Questões Aprovadas"

### Fluxo 3: Edição de Questões Aprovadas
1. ✅ Login como MARIA (Colaborador aprovado)
2. ✅ Ver questões aprovadas no dashboard
3. ✅ Editar uma questão aprovada
4. ✅ Verificar se status volta para PENDENTE
5. ✅ Verificar se admin vê a questão como pendente novamente

### Fluxo 4: Criação de Nova Questão
1. ✅ Login como MARIA
2. ✅ Criar nova questão
3. ✅ Questão deve aparecer como PENDENTE
4. ✅ Login como ADMIN
5. ✅ Revisar nova questão de Maria
6. ✅ Aprovar ou rejeitar

### Fluxo 5: Visualização de Torneio
1. ✅ Login como ADMIN
2. ✅ Ver torneio "Torneio de Conhecimento Geral 2026"
3. ✅ Ver 3 blocos associados
4. ✅ Cada bloco tem uma disciplina e dificuldade

---

## 🔄 ESTRUTURA DOS DADOS

### Banco de Dados
- **Database**: comaes_db
- **Host**: localhost
- **Port**: 3306
- **User**: root

### Tabelas Populadas
- `questoes_teste_conhecimento` - 14 questões
- `torneios` - 1 torneio
- `blocos_questoes` - 3 blocos
- `usuarios` - 3 usuários (1 admin + 2 colaboradores)
- `questoes` - 6 questões (3 pendentes + 3 aprovadas de Maria)

---

## ✅ VALIDAÇÕES

- [x] Questões de teste criadas corretamente
- [x] Torneio criado com blocos
- [x] Colaboradores criados com status correto
- [x] Questões de Maria criadas com ambos os status (pendente e aprovado)
- [x] Admin criado com permissões totais
- [x] Todas as credenciais funcionais

---

## 🎯 PRÓXIMOS PASSOS

1. **Iniciar Backend**: `npm run dev`
2. **Iniciar Frontend**: `npm run dev`
3. **Testar Login**: Usar credenciais acima
4. **Verificar Fluxos**: Testar cada cenário descrito

---

**Criado por**: Script `seed_dados_teste.js`  
**Arquivo**: `BackEnd/seed_dados_teste.js`  
**Última execução**: 2026-06-06 10:06:17

Para resetar o banco e rodar o seed novamente:
```bash
node seed_dados_teste.js
```

---

## 📝 NOTAS

- ⚠️ As senhas são: `Senha123!` (mesma para todos)
- ⚠️ O banco pode ter dados anteriores (blocos, questões já existentes)
- ⚠️ Novos colaboradores terão IDs sequenciais após o último
- ⚠️ Questões de teste estão na tabela `questoes_teste_conhecimento`, não em `questoes`
- ℹ️ As questões de Maria estão na tabela `questoes` com seu `autor_id`
