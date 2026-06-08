# 🧪 GUIA DE TESTE - Questões Pendentes & Aprovação

## PRÉ-REQUISITOS

- Backend rodando em `http://localhost:3000`
- Frontend rodando em `http://localhost:5173` (ou porta Vite)
- Conta admin disponível
- Conta colaborador com permissão para criar questões

---

## SETUP: Criar Questão de Teste

**Objetivo:** Ter uma questão pendente para testar o fluxo de aprovação

### Passo 1: Login como Colaborador
1. Abra `http://localhost:5173`
2. Login com conta colaborador
3. Navegue para: **Minha Dashboard → Minhas Questões** (ou `/colaborador/questoes`)

### Passo 2: Criar Questão de Teste
1. Clique em **+ Criar Questão**
2. Preencha assim:
   ```
   Título: "Teste Aprovação - Capital da França"
   Descrição: "Qual é a capital da França?"
   Disciplina: Programação (qualquer uma)
   Tipo: Múltipla Escolha
   Dificuldade: Fácil
   Pontos: 10
   ```

3. Adicione opções:
   - A) Paris
   - B) Londra
   - C) Berlim
   - D) Madri

4. Marque "Paris" como resposta correta
5. Clique **Salvar Questão**
6. **Resultado esperado:** Questão salva com status = "pendente"

---

## TESTE 1: Panel de Questões Pendentes Carrega Sem Crashes

**Objetivo:** Verificar se QuestoesPendentesTab.jsx carrega sem erros

### Executar:
1. Logout (se necessário) e login como **ADMIN**
2. Navegue para: **Admin Dashboard → Questões & Conteúdo**
3. Clique na aba: **Questões Pendentes** (⏰ clock icon)

### Verificações:
- [ ] Panel carrega sem branco/vazio
- [ ] Questão "Teste Aprovação - Capital da França" aparece
- [ ] Nenhum erro no console (F12 → Console)
- [ ] Todos os botões visíveis (Aprovar, Rejeitar, Ver detalhes)

### Se Falhar:
```javascript
// Abra DevTools (F12)
// Cole no Console:
fetch('/api/questoes?status_aprovacao=pendente', {
  headers: { Authorization: `Bearer ${localStorage.getItem('comaes_token')}` }
})
.then(r => r.json())
.then(d => console.log('Response:', JSON.stringify(d, null, 2)))
.catch(e => console.error('Error:', e))
```
Verifique se resposta vem com estrutura correta.

---

## TESTE 2: Aprovar Questão

**Objetivo:** Verificar se aprovação funciona e questão sai de pendentes

### Executar:
1. Na aba "Questões Pendentes", encontre: "Teste Aprovação - Capital da França"
2. Clique botão verde **Aprovar**

### Verificações:
- [ ] Notificação de sucesso aparece
- [ ] Questão desaparece imediatamente da lista
- [ ] Contador de "Total: X questões pendentes" diminui em 1
- [ ] Nenhum erro no console

### Se Falhar:
```javascript
// No DevTools Console, copie o ID da questão e execute:
fetch('/api/questoes/[ID]/aprovacao', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('comaes_token')}`
  },
  body: JSON.stringify({ status_aprovacao: 'aprovada' })
})
.then(r => r.json())
.then(d => console.log('Response:', JSON.stringify(d, null, 2)))
.catch(e => console.error('Error:', e))
```

---

## TESTE 3: Questão Aprovada Aparece no Tab de Colaboradores

**Objetivo:** Verificar se questão aprovada move para a aba correta

### Executar:
1. Clique na aba: **Questões dos Colaboradores**

### Verificações:
- [ ] Panel carrega (sem branco)
- [ ] "Teste Aprovação - Capital da França" aparece na lista
- [ ] Status mostra: "✓ Aprovada" (verde)
- [ ] Contador "Total Aprovadas" aumentou

### Se Falhar:
```javascript
// No DevTools Console:
fetch('/api/questoes?status_aprovacao=aprovada&limite=100', {
  headers: { Authorization: `Bearer ${localStorage.getItem('comaes_token')}` }
})
.then(r => r.json())
.then(d => console.log('Approved:', d.dados.questoes.length, d.dados.questoes))
.catch(e => console.error('Error:', e))
```

---

## TESTE 4: Rejeitar Questão

**Objetivo:** Verificar se rejeição funciona com motivo

### Preparar:
1. Crie outra questão pendente (repita SETUP)

### Executar:
1. Na aba "Questões Pendentes", clique **Rejeitar** em nova questão
2. Modal abre pedindo "Motivo da Rejeição"
3. Digite: `"Falta explicação adequada"` ou qualquer motivo
4. Clique **Confirmar Rejeição**

### Verificações:
- [ ] Modal valida se motivo foi preenchido
- [ ] Notificação de sucesso aparece
- [ ] Questão desaparece da lista pendentes
- [ ] Contador diminui em 1
- [ ] Nenhum erro no console

---

## TESTE 5: Filtro por Disciplina

**Objetivo:** Verificar se filtro por disciplina funciona

### Executar:
1. Crie 3 questões com disciplinas diferentes:
   - Questão 1: Matemática
   - Questão 2: Inglês
   - Questão 3: Programação

2. Na aba "Questões Pendentes", abra o filtro: **"Todas as disciplinas"**
3. Selecione: **Programação**

### Verificações:
- [ ] Lista filtra para mostrar APENAS questões de Programação
- [ ] Contador atualiza: "Total: 1 questão pendente"
- [ ] Selecione outra disciplina, lista muda
- [ ] "Todas as disciplinas" mostra todas novamente

---

## TESTE 6: Ver Detalhes de Questão

**Objetivo:** Verificar se modal de detalhes funciona

### Executar:
1. Na aba "Questões Pendentes", clique **"Ver detalhes"** em qualquer questão

### Verificações:
- [ ] Modal abre sem erros
- [ ] Mostra todos os campos:
  - Título
  - Descrição
  - Alternativas com resposta correta marcada (verde)
  - Pontos
  - Disciplina, Dificuldade
  - Data de criação
- [ ] Pode fechar modal (botão X)

---

## TESTE 7: Busca de Questões

**Objetivo:** Verificar se busca por texto funciona

### Executar:
1. Na aba "Questões Pendentes", encontre campo: **"Buscar por título ou descrição..."**
2. Digite: `"Capital"` (parte da questão de teste)
3. Apague e digite: `"xyz123"` (que não existe)

### Verificações:
- [ ] Com "Capital": questão aparece
- [ ] Com "xyz123": mensagem "Nenhuma questão pendente"
- [ ] Limpar busca: volta a listar todas

---

## TESTE 8: Refreshar Lista

**Objetivo:** Verificar se botão de atualizar funciona

### Executar:
1. Na aba "Questões Pendentes", clique botão **"Atualizar"** (🔄 clock icon)

### Verificações:
- [ ] Lista carrega novamente
- [ ] Nenhum erro
- [ ] Dados são atualizados (se houver mudanças de outras abas)

---

## CHECKLIST FINAL

Após completar todos os testes acima, verifique:

### Frontend
- [ ] QuestoesPendentesTab não quebra ao carregar
- [ ] QuestoesColaboradoresTab exibe questões aprovadas
- [ ] Nenhum erro no console (F12)
- [ ] Todas as ações (aprovar, rejeitar, filtrar, buscar) funcionam

### Backend
- [ ] Sem erros de validação nos logs
- [ ] Status de questão atualiza corretamente:
  ```sql
  SELECT id, titulo, status_aprovacao, revisado_por, revisado_em 
  FROM questoes 
  WHERE id = [ID_DA_QUESTAO];
  ```
  - status_aprovacao mudou de 'pendente' para 'aprovada'?
  - revisado_por foi preenchido com ID do admin?
  - revisado_em foi preenchido com timestamp?

### Database
- [ ] Conecte ao MySQL e verifique:
  ```sql
  -- Ver questões pendentes
  SELECT COUNT(*) as total FROM questoes WHERE status_aprovacao = 'pendente';
  
  -- Ver questões aprovadas
  SELECT COUNT(*) as total FROM questoes WHERE status_aprovacao = 'aprovada';
  
  -- Ver questões rejeitadas
  SELECT COUNT(*) as total FROM questoes WHERE status_aprovacao = 'rejeitada';
  ```

---

## TROUBLESHOOTING

### "Panel está em branco"
1. Abra DevTools (F12)
2. Vá para aba "Network"
3. Clique na aba "Questões Pendentes"
4. Procure requisição GET para `/api/questoes?status_aprovacao=pendente`
5. Clique nela e veja:
   - Status: deve ser 200
   - Response: deve ter estrutura `{ sucesso: true, dados: { questoes: [...] } }`

### "Questão não desaparece após aprovar"
1. Abra console (F12)
2. Procure por erro: `"Erro ao revisar questão"`
3. Se houver, verifique se:
   - Token de admin é válido
   - ID da questão existe
   - Questão não foi já aprovada/rejeitada

### "Questão não aparece em Colaboradores"
1. Verifique que a questão tem `status_aprovacao = 'aprovada'` no DB
2. No console, execute:
   ```javascript
   fetch('/api/questoes?status_aprovacao=aprovada&limite=100', {
     headers: { Authorization: `Bearer ${localStorage.getItem('comaes_token')}` }
   })
   .then(r => r.json())
   .then(d => console.table(d.dados.questoes))
   ```
3. Procure pelo ID da questão na tabela

---

## SUCESSO! ✅

Quando todos os testes passarem, o sistema de aprovação de questões está funcionando corretamente:

1. Colaboradores criam questões (status = pendente)
2. Admin revisa na aba "Questões Pendentes"
3. Admin aprova → questão sai de pendentes
4. Questão aprovada aparece em "Questões dos Colaboradores"
5. Questões rejeitadas são removidas com motivo registrado

---

**Data:** 7 de Junho de 2026  
**Status:** Pronto para Testar
