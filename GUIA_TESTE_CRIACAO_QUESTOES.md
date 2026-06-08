# 🧪 GUIA DE TESTE - CRIAÇÃO DE QUESTÕES

**Data**: 7 de Junho de 2026  
**Objetivo**: Validar que os fixes resolveram os problemas de criação de questões  
**Tempo Estimado**: 15-20 minutos

---

## 🚀 PRÉ-REQUISITOS

- [x] Servidor backend rodando em `http://localhost:3000`
- [x] Frontend rodando em `http://localhost:5173` (ou similar)
- [x] Usuário admin logado
- [x] Browser com DevTools aberto (F12)

---

## 📋 TESTES

### TESTE 1: Criar Questão Múltipla Escolha Simples

**Objetivo**: Validar fluxo básico de criação

**Passos**:
1. Abrir painel admin → Questões
2. Clicar botão "Adicionar Questão" ou "Criar"
3. Preencher:
   - **Título**: "Quanto é 2 + 2?"
   - **Descrição**: "Pergunta básica de matemática"
   - **Disciplina**: "Matemática"
   - **Tipo**: "Múltipla Escolha"
   - **Dificuldade**: "Fácil"
   - **Pontos**: "10"
   - **Opção 1**: "3" (marcar como correta)
   - **Opção 2**: "4"
   - **Opção 3**: "5"
4. Clicar "Criar Questão"

**Resultado Esperado**:
- ✅ Campo `resposta_correta` se preencheu automaticamente com "4"
- ✅ Mensagem de sucesso: "Questão criada com sucesso!"
- ✅ Modal fecha
- ✅ Questão aparece na lista

**Se Falhar**:
- 🔴 Verificar DevTools (F12) → Console
- 🔴 Procurar por erro "resposta_correta deve estar entre as opções"
- 🔴 Se sim: Bug não foi corrigido

---

### TESTE 2: Validação de Opções Mínimas

**Objetivo**: Validar que precisa mínimo 2 opções

**Passos**:
1. Criar questão múltipla escolha
2. **Deixar apenas 1 opção** (remover a 2ª)
3. Tentar clicar "Criar Questão"

**Resultado Esperado**:
- ✅ Erro apareça: "Mínimo 2 opções preenchidas..."
- ✅ Botão fica vermelho ou destacado
- ✅ Questão NÃO é criada

---

### TESTE 3: Sincronização de Resposta Correta

**Objetivo**: Validar que `resposta_correta` sincroniza ao marcar opção

**Passos**:
1. Criar formulário múltipla escolha
2. **Opção 1**: "Paris" (radio deselecionado)
3. **Opção 2**: "Londres" (radio deselecionado)
4. **Opção 3**: "Berlim" (marcar como correta ← clique no radio)
5. Observar campo "Resposta Correta"

**Resultado Esperado**:
- ✅ Campo "Resposta Correta" foi preenchido automaticamente com "Berlim"
- ✅ Se clicar em outro radio, campo atualiza
- ✅ Campo é cinza (desabilitado) em múltipla escolha

---

### TESTE 4: Criar Questão de Texto

**Objetivo**: Validar tipo "Texto"

**Passos**:
1. Criar questão com tipo "Texto/Aberta"
2. Preencher:
   - **Título**: "Qual é a capital da França?"
   - **Descrição**: "Resposta aberta"
   - **Resposta Correta**: "Paris"
3. Criar

**Resultado Esperado**:
- ✅ Campo de opções desaparece (não mostra)
- ✅ Campo "Resposta Correta" fica habilitado (branco, não cinza)
- ✅ Questão criada com sucesso

---

### TESTE 5: Criar Questão de Código

**Objetivo**: Validar tipo "Código"

**Passos**:
1. Criar questão com tipo "Código"
2. Preencher:
   - **Título**: "Escreva uma função que retorna 'Olá'"
   - **Descrição**: "Programação básica"
   - **Linguagem**: "JavaScript"
   - **Resposta Correta**: `function hello() { return 'Olá'; }`
3. Criar

**Resultado Esperado**:
- ✅ Campo de linguagem aparece
- ✅ Campo de opções desaparece
- ✅ Questão criada

---

### TESTE 6: Disciplina Obrigatória

**Objetivo**: Validar que disciplina é obrigatória

**Passos**:
1. Criar questão
2. **Deixar "Disciplina" vazia** (se possível)
3. Tentar criar

**Resultado Esperado**:
- ✅ Erro local: "Disciplina é obrigatória"
- ✅ Se passou pela validação local, backend retorna erro

---

### TESTE 7: Erro de Timeout

**Objetivo**: Validar comportamento se servidor não responde

**Passos**:
1. Abrir DevTools → Network
2. Throttle connection (simular conexão lenta)
3. Criar questão
4. Observar por 10+ segundos

**Resultado Esperado**:
- ✅ Após 10 segundos, erro apareça
- ✅ Mensagem: "Timeout: servidor não respondeu em tempo"
- ✅ Botão volta a "Criar Questão" (não fica em loop)

---

### TESTE 8: Mensagem de Erro Específica

**Objetivo**: Validar que erro mostra quais opções são válidas

**Passos**:
1. Criar questão múltipla escolha
2. **Opção 1**: "A"
3. **Opção 2**: "B"
4. **Opção 3**: "C"
5. **Resposta Correta** (editar manualmente): "D"
6. Tentar criar

**Resultado Esperado**:
- ✅ Erro mostra: `resposta_correta "D" deve estar entre as opções disponíveis: A, B, C`
- ✅ Mensagem é clara e informativa

---

### TESTE 9: Verificar Dados no Banco

**Objetivo**: Validar que dados foram armazenados corretamente

**Passos**:
1. Abrir banco de dados (MySQL/PostgreSQL)
2. Consultar: `SELECT id, titulo, opcoes, resposta_correta FROM questoes ORDER BY id DESC LIMIT 1;`
3. Verificar campos

**Resultado Esperado**:
- ✅ `opcoes` é JSON array de strings: `["A", "B", "C"]`
- ✅ `resposta_correta` é string: `"B"`
- ✅ Não é array de objetos

**Exemplo Correto**:
```sql
id: 42
titulo: "Quanto é 2 + 2?"
opcoes: ["3", "4", "5"]
resposta_correta: "4"
```

**Exemplo Errado (antes do fix)**:
```sql
id: 42
opcoes: [{"texto":"3","correta":false}, ...]
resposta_correta: NULL
```

---

### TESTE 10: Verificar Logs do Backend

**Objetivo**: Validar que backend processou corretamente

**Passos**:
1. Criar questão (como nos testes anteriores)
2. Abrir logs do backend (terminal onde roda Node)
3. Procurar por:
   - `📝 Criando questão:`
   - `✅ Questão criada com sucesso`

**Resultado Esperado**:
- ✅ Log mostra: `📝 Criando questão: { titulo: '...', disciplina: '...', torneio_id: ... }`
- ✅ Log mostra: `✅ Questão criada com sucesso - ID: 42`
- ✅ Nenhum erro no logs

**Se ver erro**:
```
❌ Erro ao criar questão: ValidationError: ...
```

---

## 📊 MATRIZ DE TESTES

| # | Teste | Tipo | Status | Notas |
|---|-------|------|--------|-------|
| 1 | Múltipla Escolha Simples | Funcional | [ ] | Caso feliz |
| 2 | Validação Opções Min | Validação | [ ] | Edge case |
| 3 | Sincronização Resposta | UX | [ ] | Auto-preenchimento |
| 4 | Tipo Texto | Funcional | [ ] | Tipo alternativo |
| 5 | Tipo Código | Funcional | [ ] | Tipo alternativo |
| 6 | Disciplina Obrigatória | Validação | [ ] | Campo obrigatório |
| 7 | Timeout | Edge case | [ ] | Comportamento timeout |
| 8 | Erro Específico | UX | [ ] | Mensagem informativa |
| 9 | Dados no Banco | Dados | [ ] | Integridade |
| 10 | Logs Backend | DevOps | [ ] | Observabilidade |

---

## 🐛 TROUBLESHOOTING

### Problema: Erro "resposta_correta não está entre opções"

**Causa**: Backend ainda com versão antiga sem normalização

**Solução**:
1. Verificar se `BackEnd/controllers/QuestoesController.js` tem a normalização (linhas 69-87)
2. Se não tiver, aplicar o fix manualmente
3. Reiniciar backend: `npm start` ou `node index.js`

---

### Problema: "Erro ao criar questão" (mensagem genérica)

**Causa**: Erro no backend não está sendo capturado

**Solução**:
1. Abrir DevTools → Network
2. Clicar em requisição POST `/api/questoes`
3. Ver aba "Response"
4. Procurar pelo erro específico
5. Aplicar fix correspondente

---

### Problema: Form fica em "Salvando..." infinitamente

**Causa**: Timeout não foi aplicado OU middleware falha silenciosamente

**Solução**:
1. Verificar se o axios tem `timeout: 10000` (linhas 159-161 do CreateQuestaoForm)
2. Verificar se middleware `canManageQuestoes` está funcionando:
   - Abrir DevTools → Console
   - Procurar por erro 401/403
3. Se 401: Token expirado, fazer login de novo
4. Se 403: User não é admin/colaborador

---

### Problema: Dados não estão no banco após "sucesso"

**Causa**: Response da API diz sucesso mas dados não foram salvos

**Solução**:
1. Verificar se `Questao.create()` foi chamado (log `✅ Questão criada`)
2. Se log aparece mas dados não existem:
   - Problema de migration/sequelize
   - Verificar se tabela `questoes` existe: `SHOW TABLES;`
   - Verificar campos: `DESC questoes;`

---

## ✅ CHECKLIST FINAL

Antes de considerar os fixes completos:

- [ ] TESTE 1 passou ✅
- [ ] TESTE 2 passou ✅
- [ ] TESTE 3 passou ✅
- [ ] TESTE 4 passou ✅
- [ ] TESTE 5 passou ✅
- [ ] TESTE 6 passou ✅
- [ ] TESTE 7 passou ✅
- [ ] TESTE 8 passou ✅
- [ ] TESTE 9 passou ✅
- [ ] TESTE 10 passou ✅
- [ ] Nenhum erro no console (F12)
- [ ] Nenhum erro nos logs backend
- [ ] Dados aparecem na lista de questões
- [ ] Dados estão corretos no banco

---

## 🎉 PRÓXIMOS PASSOS

Após validar todos os testes:

1. ✅ Testes de integração completos
2. ✅ Validar abas administrativas (não quebram)
3. ✅ Testar fluxo de aprovação (admin aprova questão colaborador)
4. ✅ Popular banco com dados (seeds)
5. ✅ Validar rendimento com muitas questões

---

**Tempo de Teste**: ~20 minutos  
**Documentação**: ✅ Completa  
**Pronto para Teste**: ✅ SIM

