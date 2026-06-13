# 🧪 Testes: Restrições de Concorrência de Torneios

## Preparação

1. Abra o navegador
2. Pressione `F12` para abrir DevTools
3. Vá para aba **Network** para monitorar requisições
4. Vá para aba **Console** para ver logs

---

## TESTE 1: ✅ Criar Múltiplos Rascunhos (DEVE FUNCIONAR)

### Passos:
1. Painel Admin → Torneios → Criar Novo
2. Preencha:
   - **Título**: "Rascunho A"
   - **Descrição**: Qualquer coisa
   - **Tipo**: Genérico ou Específico
   - **Status**: **Rascunho** ← IMPORTANTE
   - **Datas**: Futuro válido
3. Clique **Salvar**
4. Verifique: **Torneio criado com sucesso!** ✅

5. Crie outro rascunho (mesmo processo, "Rascunho B")
6. Verifique: **Deve aparecer dois rascunhos na lista** ✅

### Resultado Esperado:
```
✅ Ambos rascunhos aparecem na lista
✅ Nenhuma mensagem de erro
✅ Status: "Rascunho" para ambos
```

---

## TESTE 2: ❌ Criar Segundo Torneio Ativo (DEVE FALHAR)

### Preparação:
- Tenha **1 torneio ativo** na lista (ou crie um com status='ativo')

### Passos:
1. Painel Admin → Torneios → Criar Novo
2. Preencha:
   - **Título**: "Torneio Ativo 2"
   - **Status**: **Ativo** ← IMPORTANTE
   - Outros campos: válidos
3. Clique **Salvar**
4. **RESULTADO**: Deve aparecer mensagem de erro

### Mensagem Esperada:
```
❌ Não é possível criar/ativar dois torneios ao mesmo tempo. 
Finalize o torneio anterior.
```

### Verificação no Console:
```
[TornamentService] Create response status: 409

Erro retornado:
{
  "message": "Não é possível criar dois torneios ativos...",
  "error": "TOURNAMENT_CONFLICT"
}
```

### Verificação na Network Tab:
- Requisição POST `/api/admin/torneos`
- Status: **409 Conflict**
- Response inclui: `"error": "TOURNAMENT_CONFLICT"`

### Resultado Esperado:
```
❌ Mensagem de erro aparece
❌ Torneio NÃO é criado
✅ Lista de torneios permanece igual
```

---

## TESTE 3: ✅ Criar Ativo Após Finalizar Anterior (DEVE FUNCIONAR)

### Preparação:
- Tenha 1 torneio ativo

### Passos:
1. Painel Admin → Torneios → Selecione o torneio ativo
2. Clique **Finalizar Torneio**
3. Confirme
4. **Verifique**: Torneio agora tem status "Finalizado"

5. Crie novo torneio com status='ativo'
6. Clique **Salvar**

### Resultado Esperado:
```
✅ Novo torneio criado com sucesso
✅ Status: "Ativo"
✅ Badge: "⚡ Ativo"
```

---

## TESTE 4: ❌ Data de Início = Hora Atual (DEVE FALHAR)

### Passos:
1. Painel Admin → Torneios → Criar Novo
2. Preencha normalmente
3. **Data de Início**: Clique no campo
4. Selecione **HOJE** com horário **AGORA** (ex: 10:30 se agora é 10:30)
5. Clique **Salvar**

### Resultado Esperado:
```
❌ Mensagem de erro:
"A data de início deve ser diferente da hora atual. 
Escolha uma data posterior."

❌ Campo destacado em vermelho: "Inicia em"
```

### Verificação no Console:
```
Status: 400
Response:
{
  "message": "A data de início deve ser diferente...",
  "field": "inicia_em",
  "suggestedMinTime": "2026-06-10T17:31:00.000Z"
}
```

---

## TESTE 5: ✅ Data de Início = +1 Minuto (DEVE FUNCIONAR)

### Passos:
1. Painel Admin → Torneios → Criar Novo
2. **Data de Início**: Escolha AGORA + 1 minuto
   - Se agora é 10:30 → coloque 10:31
3. Clique **Salvar**

### Resultado Esperado:
```
✅ Torneio criado com sucesso!
✅ Aparece na lista com data correta
```

---

## TESTE 6: ✅ Editar Rascunho (DEVE FUNCIONAR)

### Preparação:
- Tenha 1 torneio em status "Rascunho"

### Passos:
1. Painel Admin → Torneios
2. Clique no rascunho para editar
3. Mude o **Título** (ex: "Rascunho A" → "Rascunho A - Editado")
4. Clique **Salvar**

### Resultado Esperado:
```
✅ Alterações salvas com sucesso!
✅ Título atualizado na lista
✅ Status ainda é "Rascunho"
```

---

## TESTE 7: ❌ Ativar Rascunho com Outro Ativo (DEVE FALHAR)

### Preparação:
- Tenha 1 torneio **ativo**
- Tenha 1 torneio em **rascunho**

### Passos:
1. Painel Admin → Torneios
2. Clique no rascunho para editar
3. Mude **Status** de "Rascunho" para "Ativo"
4. Clique **Salvar**

### Resultado Esperado:
```
❌ Mensagem de erro:
"Não é possível ativar dois torneios ao mesmo tempo. 
Finalize o torneio anterior."

❌ Status NÃO muda para "Ativo"
✅ Permanece "Rascunho"
```

---

## TESTE 8: ✅ Ativar Rascunho Após Finalizar Ativo (DEVE FUNCIONAR)

### Passos:
1. Finalize o torneio ativo (como no TESTE 3)
2. Edite o rascunho
3. Mude status para "Ativo"
4. Clique **Salvar**

### Resultado Esperado:
```
✅ Alterações salvas com sucesso!
✅ Status agora é "Ativo"
✅ Badge: "⚡ Ativo"
```

---

## TESTE 9: Verificação no Console

Abra a aba **Console** durante os testes:

### Ao Criar (Sucesso):
```javascript
[TournamentForm] tipo_torneio alterado: {anterior: "generico", novo: "especifico"}
[TournamentForm] ✅ Validação passou! Payload completo: {...}
[TournamentService] Creating tournament with payload: {...}
[TournamentService] Create response status: 201
[TorneiosTab] Torneio criado: {...}
```

### Ao Criar (Conflito):
```javascript
[TournamentForm] Enviando payload: {...}
[TournamentService] Create response status: 409
[TournamentService] Create response: {
  message: "Não é possível criar dois torneios ativos...",
  error: "TOURNAMENT_CONFLICT"
}
[TorneiosTab] Erro ao salvar: Error: Não é possível criar dois... (TOURNAMENT_CONFLICT)
```

---

## Verificação Final no Banco de Dados

Execute no PhpMyAdmin:

```sql
-- Ver todos os torneios
SELECT id, titulo, status, tipo_torneio, inicia_em 
FROM torneios 
ORDER BY criado_em DESC;

-- Ver torneios ativos
SELECT id, titulo, status 
FROM torneios 
WHERE status = 'ativo';

-- Contar torneios por status
SELECT status, COUNT(*) as total 
FROM torneios 
GROUP BY status;
```

### Resultado Esperado:
```
- Máximo 1 torneio com status='ativo'
- Múltiplos torneios com status='rascunho'
- Datas de início sempre no futuro
```

---

## Checklist de Testes

- [ ] TESTE 1: Criar múltiplos rascunhos ✅
- [ ] TESTE 2: Criar 2º ativo bloqueado ❌
- [ ] TESTE 3: Criar ativo após finalizar anterior ✅
- [ ] TESTE 4: Data atual rejeitada ❌
- [ ] TESTE 5: Data +1 min aceita ✅
- [ ] TESTE 6: Editar rascunho ✅
- [ ] TESTE 7: Ativar rascunho com ativo bloqueado ❌
- [ ] TESTE 8: Ativar rascunho após finalizar ativo ✅
- [ ] TESTE 9: Logs console corretos ✅
- [ ] TESTE 10: Banco de dados válido ✅

---

## Troubleshooting

### Problema: Erro ao criar, mas mensagem genérica
**Solução**: Verificar Network tab → Response JSON para ver erro real

### Problema: Rascunho anterior desaparece
**Solução**: Fazer F5 (reload) para atualizar lista

### Problema: Data não funciona como esperado
**Solução**: Usar DevTools para ver hora do servidor (`suggestedMinTime` na resposta)

### Problema: Mensagem diferente da esperada
**Solução**: Verificar Console para erro exato em `[TorneiosTab]`

---

**Data**: 2026-06-10  
**Versão**: 1.0  
**Status**: Pronto para Teste  
**Build**: ✅ Compilado e Validado
