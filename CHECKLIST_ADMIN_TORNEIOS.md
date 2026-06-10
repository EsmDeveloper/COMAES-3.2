# ✅ Checklist para Admin - Sistema de Torneios Atualizado

## 📋 Antes de Criar um Torneio

- [ ] Verificar se já existe torneio ativo (máximo 1)
- [ ] Preparar blocos de questões necessários
- [ ] Publicar os blocos de questões ANTES de criar o torneio
- [ ] Definir se será **genérico** ou **específico**

---

## 🎯 Criando um Torneio GENÉRICO

### Configuração

```
Tipo de Torneio: GENÉRICO (multidisciplinar)
Disciplina Específica: (deixar vazio - não aparece)
```

### O que Acontece

✅ Aparecem TODAS as disciplinas que têm blocos publicados
- Exemplo: Se Matemática e Inglês têm blocos → 2 opções aparecem
- Exemplo: Se Programação não tem blocos → não aparece

✅ Usuário pode escolher qualquer uma das disciplinas disponíveis

✅ Usuário fica restrito APENAS à disciplina escolhida até terminar torneio

### Verificação

```bash
# No terminal, testar:
curl http://localhost:3000/api/torneios/ativo/disciplinas

# Deve retornar algo como:
{
  "disciplinas": ["Matemática", "Inglês"],
  "tipo_torneio": "generico"
}
```

---

## 🔒 Criando um Torneio ESPECÍFICO

### Configuração

```
Tipo de Torneio: ESPECÍFICO (uma disciplina)
Disciplina Específica: [Selecionar uma]
                       - Matemática
                       - Inglês
                       - Programação
```

### O que Acontece

✅ Aparece APENAS a disciplina selecionada

✅ Usuário NÃO pode escolher outra disciplina

✅ Se tentar entrar em disciplina diferente → **ERRO 400**

### Verificação

```bash
# Testar:
curl http://localhost:3000/api/torneios/ativo/disciplinas

# Deve retornar algo como:
{
  "disciplinas": ["Matemática"],
  "tipo_torneio": "especifico",
  "disciplina_especifica": "Matemática"
}
```

---

## ⚠️ Regras Importantes

### Regra 1: Uma Disciplina Por Vez

| Situação | O que Acontece |
|----------|---|
| Usuário entra em Torneio A (Matemática) | Perde acesso a outras disciplinas |
| Usuário tenta entrar em Torneio B (Inglês) | ❌ ERRO: "Termine outro torneio primeiro" |
| Torneio A termina (data_fim passou) | Agora pode entrar em Torneio B |

### Regra 2: Expiração Automática

| Situação | O que Acontece |
|----------|---|
| Torneio tem data_fim = agora - 10 min | ❌ Expirou automaticamente |
| Qualquer usuário tenta entrar | ❌ ERRO: "Torneio expirou" |
| Status do torneio | Muda de "ativo" para "finalizado" |
| Rankings dos participantes | Congelados (não mudam mais) |

### Regra 3: Disciplinas sem Blocos não Aparecem

| Situação | O que Aparece |
|----------|---|
| Matemática tem 3 blocos | ✅ Aparece |
| Inglês tem 0 blocos | ❌ NÃO aparece |
| Programação tem 1 bloco | ✅ Aparece |

---

## 📝 Passo a Passo: Criar Torneio Genérico

### 1️⃣ Preparar Blocos (PRÉ-REQUISITO)

```
No Painel Admin → Blocos de Questões:
  1. Criar blocos para Matemática (publicar)
  2. Criar blocos para Inglês (publicar)
  3. Deixar Programação sem blocos (vai ficar oculta)
  4. Verificar: todos "publicado"
```

### 2️⃣ Criar Torneio

```
No Painel Admin → Torneios → Novo Torneio:

✓ Título: "Torneio Geral 2026"
✓ Descrição: "Competição multidisciplinar"
✓ Data Início: 2026-06-10 10:00
✓ Data Fim: 2026-06-17 18:00
✓ Tipo: GENÉRICO
✓ Disciplina: (deixar vazio)
✓ Status: Rascunho (depois ativa)
✓ Blocos: Selecionar os blocos de Math e Inglês
```

### 3️⃣ Ativar Torneio

```
No Painel Admin → Torneios:
  1. Encontrar seu torneio
  2. Mudar Status: "Rascunho" → "Ativo"
  3. ✅ Pronto! Usuários já veem

Observação: Só 1 torneio ativo por vez
```

### 4️⃣ Validar (Terminal)

```bash
# Terminal do servidor:
curl http://localhost:3000/api/torneios/ativo

# Resposta esperada:
{
  "ativo": true,
  "torneio": {
    "id": 5,
    "titulo": "Torneio Geral 2026",
    "tipo_torneio": "generico"
  }
}
```

---

## 📝 Passo a Passo: Criar Torneio Específico

### 1️⃣ Preparar Blocos

```
No Painel Admin → Blocos de Questões:
  1. Criar blocos para Matemática (publicar)
  2. Deixar Inglês e Programação sem blocos
```

### 2️⃣ Criar Torneio

```
No Painel Admin → Torneios → Novo Torneio:

✓ Título: "Torneio de Matemática"
✓ Descrição: "Somente para Matemática"
✓ Data Início: 2026-06-10 10:00
✓ Data Fim: 2026-06-17 18:00
✓ Tipo: ESPECÍFICO
✓ Disciplina: Matemática (OBRIGATÓRIO)
✓ Status: Rascunho
✓ Blocos: Selecionar os blocos de Matemática
```

### 3️⃣ Ativar

```
No Painel Admin → Torneios:
  1. Mudar Status: "Ativo"
  2. ✅ Usuários só veem Matemática
```

### 4️⃣ Testar

```bash
# Tentar entrar em disciplina errada:
curl -X POST http://localhost:3000/api/participantes/registrar \
  -H "Content-Type: application/json" \
  -d '{"usuario_id": 1, "disciplina_competida": "Inglês"}'

# Resposta esperada (ERRO):
{
  "message": "Este torneio é específico apenas para Matemática",
  "field": "disciplina_incompativel"
}
```

---

## 🔄 Finalizar Torneio

### Opção 1: Automática (Recomendado)

```
Deixar a data de término passar.
Backend vai:
  1. Auto-finalizar o torneio
  2. Congelar rankings
  3. Rejeitar novas inscrições
```

### Opção 2: Manual

```
No Painel Admin → Torneios:
  1. Encontrar o torneio
  2. Mudar Status: "Ativo" → "Finalizado"
  3. ✅ Pronto!

Nota: Rankings ficam congelados automaticamente
```

### Verificação

```bash
# Verificar que torneio foi finalizado:
curl http://localhost:3000/api/torneios/ativo

# Resposta esperada:
{
  "ativo": false,
  "message": "Nenhum torneio ativo encontrado"
}
```

---

## 🚨 Troubleshooting

### ❌ "Disciplinas não aparecem"

**Causa:** Nenhum bloco publicado

**Solução:**
```
1. Painel Admin → Blocos de Questões
2. Verificar que blocos têm status = "publicado"
3. Garantir que estão associados ao torneio correto
4. Tentar novamente: GET /api/torneios/ativo/disciplinas
```

### ❌ "Não consigo ativar novo torneio"

**Causa:** Já existe outro torneio ativo (máximo 1)

**Solução:**
```
1. Painel Admin → Torneios
2. Finalizar o torneio ativo
3. Aguardar confirmação: status = "finalizado"
4. Ativar o novo torneio
```

### ❌ "Usuário consegue participar de 2 torneios"

**Causa:** Possível bug de sincronização

**Solução:**
```
1. Backend → F5 restart
2. BD → Verificar ParticipanteTorneio.posicao_congelada
3. Se problema persistir: contatar dev
```

### ❌ "Torneio continua aceitando após expiração"

**Causa:** Frontend em cache ou intervalo grande

**Solução:**
```
1. Fazer refresh (Ctrl+F5 - hard refresh)
2. Ou aguardar próxima chamada automática
3. Backend vai auto-finalizar: status = "finalizado"
```

---

## 📊 Exemplo Prático Completo

### Cenário: Torneio Genérico COMAES 2026

**STEP 1: Preparar Blocos (1 dia antes)**

```
Admin cria blocos:
  ✓ "Matemática Básica" (5 questões) → Publicar
  ✓ "Inglês Intermediário" (3 questões) → Publicar
  ✓ "Programação Avançada" (2 questões) → Publicar
  ✗ Deixa Programação sem blocos por enquanto
```

**STEP 2: Criar Torneio (1 dia antes)**

```
Admin acessa: Painel Admin → Torneios → Novo

Preenche:
  - Título: "Torneio Geral COMAES 2026"
  - Descrição: "Competição multidisciplinar com 3 disciplinas"
  - Início: 10 de Junho, 10:00 AM
  - Fim: 17 de Junho, 6:00 PM
  - Tipo: GENÉRICO
  - Blocos: Seleciona todos os 3 blocos
  - Status: Rascunho

Clica: CRIAR TORNEIO
```

**STEP 3: Ativar (Dia do Torneio)**

```
Admin acessa: Painel Admin → Torneios
Encontra: "Torneio Geral COMAES 2026"
Muda Status: Rascunho → Ativo
Clica: SALVAR

✅ Torneio agora é público!
```

**STEP 4: Usuários Entram**

```
Usuário A acessa: Entrar no Torneio
Vê: 3 cards (Math, Inglês, Programação)
Clica: Matemática
Entra no torneio

✅ Agora apenas Matemática disponível
✅ Inglês e Programação estão "bloqueadas" para A
```

**STEP 5: Participação**

```
Usuário B tenta entrar em Torneio (enquanto A está em Torneio)
Vê: "Você já está participando de outro torneio"
❌ Bloqueado até A terminar
```

**STEP 6: Finalizar (Dia 17, 6:01 PM)**

```
Sistema automaticamente:
  1. Detecta: now > termina_em
  2. Finaliza: status = "finalizado"
  3. Congela rankings: posicao_congelada = true
  4. Rejeita novas inscrições

✅ Torneio encerrado!
```

---

## 💡 Dicas Profissionais

### Dica 1: Planejar com Antecedência

```
Idealmente:
  • Criar blocos: 1 semana antes
  • Criar torneio: 2-3 dias antes
  • Ativar torneio: dia do evento
```

### Dica 2: Genérico para Teste, Específico para Produção

```
Teste:  Genérico (mais flexível)
Prod:   Específico (mais controlado)
```

### Dica 3: Monitorar Participações

```
No Painel Admin → Torneios → Ver Detalhes:
  • Quantos participantes por disciplina
  • Ranking em tempo real
  • Status de cada participante
```

### Dica 4: Não Deixar Sem Blocos

```
Se criar torneio e nenhuma disciplina tem blocos:
  → Interface fica vazia
  → Usuários veem: "Torneio sem conteúdo"
  → Ruim para experiência

SEMPRE ter pelo menos 1 bloco!
```

---

## 📞 FAQ Rápido

**P: Posso ter 2 torneios ativos?**
R: Não. Sistema permite máximo 1 ativo. Finalize um antes de ativar outro.

**P: E se o torneio expira e ninguém percebe?**
R: Backend auto-finaliza. Usuários receberão "Torneio expirou" se tentarem entrar.

**P: Posso mudar de genérico para específico?**
R: Não recomendado. Melhor criar novo torneio.

**P: Usuário pode entrar em 2 disciplinas do MESMO torneio?**
R: Não. Assim que entra em uma, as outras são bloqueadas até terminar.

**P: Blocos sem torneio associado aparecem?**
R: Não. Blocos estão sempre criados, mas só importam se associados a torneio ativo.

---

## ✅ Checklist Final

- [ ] Blocos criados e publicados
- [ ] Torneio configurado (tipo definido)
- [ ] Datas válidas (fim > início)
- [ ] Pelo menos 1 bloco associado
- [ ] Status inicial = "Rascunho"
- [ ] Verificar GET /api/torneios/ativo/disciplinas
- [ ] Ativar torneio
- [ ] Teste de entrada (por um usuário)
- [ ] Verificar participacao-ativa funciona
- [ ] Documentar datas e detalhes
- [ ] Monitorar até expiração

---

**Versão:** 1.0  
**Atualizado:** 09 de Junho de 2026  
**Status:** Pronto para Administrador
