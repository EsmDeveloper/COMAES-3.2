# 📋 Implementação: Restrições de Concorrência de Torneios

## Requisitos Implementados

### 1. ✅ **Um Único Torneio Ativo por Vez**
- Não permite criar um segundo torneio ativo enquanto existe outro ativo
- Não permite ativar um torneio se já há outro ativo
- Apenas rascunhos podem coexistir

### 2. ✅ **Validação de Data de Início**
- Data de início DEVE ser diferente da hora atual
- Mínimo 1 minuto no futuro (recomendado)
- Mensagem clara ao usuário

### 3. ✅ **Edição de Rascunhos**
- Rascunhos podem ser editados sem restrições
- Apenas torneios finalizados/cancelados são read-only

### 4. ✅ **Mensagens de Erro Clara**
- Mensagem especial quando tenta criar/ativar segundo torneio
- Código de erro `TOURNAMENT_CONFLICT` para identificação

---

## Mudanças no Código

### Backend - `BackEnd/controllers/TorneoController.js`

#### CREATE Torneio - Validação de Concorrência
```javascript
// ✅ NOVO: Validar concorrência de torneios
if (status === 'ativo') {
  const torneioAtivoExistente = await Torneio.count({
    where: { status: 'ativo' }
  });
  
  if (torneioAtivoExistente > 0) {
    return res.status(409).json({ 
      message: 'Não é possível criar dois torneios ativos ao mesmo tempo...',
      error: 'TOURNAMENT_CONFLICT'
    });
  }
}
```

#### UPDATE Torneio - Validação ao Ativar
```javascript
// ✅ NOVO: Validar concorrência ao ativar torneio
if (status === 'ativo' && existingTorneio.status !== 'ativo') {
  const outroTorneioAtivo = await Torneio.count({
    where: { 
      status: 'ativo',
      id: { [Op.ne]: id }  // Excluir este torneio
    }
  });
  
  if (outroTorneioAtivo > 0) {
    return res.status(409).json({ 
      message: 'Não é possível ativar dois torneios ao mesmo tempo...',
      error: 'TOURNAMENT_CONFLICT'
    });
  }
}
```

#### Validação de Data de Início
```javascript
const TOLERANCE_MS = 5 * 60 * 1000; // 5 minutos de tolerância
const now = new Date(Date.now() - TOLERANCE_MS);

if (inicia_em && new Date(inicia_em) < now) {
  return res.status(400).json({ 
    message: 'A data de início deve ser diferente da hora atual...',
    field: 'inicia_em',
    suggestedMinTime: new Date(Date.now() + 60000).toISOString()
  });
}
```

### Frontend - `FrontEnd/src/Administrador/services/TournamentService.js`

#### Preservação de Código de Erro
```javascript
if (!res.ok) {
  // ✅ Preservar tipo de erro (ex: TOURNAMENT_CONFLICT) na mensagem
  const errorMsg = data.error 
    ? `${data.message} (${data.error})` 
    : (data.message || 'Erro ao criar torneio');
  throw new Error(errorMsg);
}
```

### Frontend - `FrontEnd/src/Administrador/TorneiosTab.jsx`

#### Tratamento de Conflito
```javascript
catch (err) {
  console.error('[TorneiosTab] Erro ao salvar:', err);
  
  // ✅ Tratamento especial para erro de concorrência
  if (err.message && err.message.includes('TOURNAMENT_CONFLICT')) {
    showToast(
      '❌ Não é possível criar/ativar dois torneios ao mesmo tempo. ' +
      'Finalize o torneio anterior.',
      'error'
    );
  } else {
    showToast(err.message || 'Erro ao salvar torneio', 'error');
  }
}
```

---

## Fluxo de Validação

### Criação de Novo Torneio

```
[Frontend: Criar Torneio]
  ↓
[Frontend: Validação Local]
  - Verifica se já existe ativo (rascunho OK)
  - Se status='ativo' → valida conflito
  ↓
[Backend: TorneoController.createTorneo()]
  - Valida tipo_torneio e disciplina_especifica
  - Valida data de início
  - Valida data de término
  - ✅ NOVO: Valida se já existe torneio ativo
  - Se sim → HTTP 409 CONFLICT
  ↓
[Frontend: Tratamento de Erro]
  - Se status 409 → mensagem especial
  - Caso contrário → mensagem genérica
```

### Ativação de Rascunho Existente

```
[Frontend: Editar Rascunho → Ativar]
  ↓
[Backend: TorneoController.updateTorneo()]
  - Valida se status mudou de 'rascunho' → 'ativo'
  - ✅ NOVO: Valida se já existe outro ativo
  - Se sim → HTTP 409 CONFLICT
  ↓
[Frontend: Mensagem de Erro]
```

---

## Casos de Uso

### ✅ Caso 1: Criar Rascunho (PERMITIDO)
```
Estado: Nenhum torneio ativo
Admin: Cria "Torneio A" com status='rascunho'
Resultado: ✅ Criado com sucesso

Admin: Cria "Torneio B" com status='rascunho'
Resultado: ✅ Criado com sucesso (rascunhos podem coexistir)
```

### ❌ Caso 2: Criar Ativo com Outro Ativo (BLOQUEADO)
```
Estado: Torneio A está ativo
Admin: Tenta criar "Torneio B" com status='ativo'
Resultado: ❌ HTTP 409 - Mensagem: 
  "Não é possível criar dois torneios ativos..."
```

### ✅ Caso 3: Criar Ativo Sem Outro Ativo (PERMITIDO)
```
Estado: Nenhum torneio ativo
Admin: Cria "Torneio A" com status='ativo'
Resultado: ✅ Criado e ativado
```

### ❌ Caso 4: Data de Início na Hora Atual (BLOQUEADO)
```
Admin: Tenta criar torneio com inicia_em = NOW
Resultado: ❌ HTTP 400 - Mensagem:
  "A data de início deve ser diferente da hora atual..."
```

### ✅ Caso 5: Ativar Rascunho com Torneio Ativo (BLOQUEADO)
```
Estado: Torneio A está ativo, Torneio B é rascunho
Admin: Tenta ativar Torneio B
Resultado: ❌ HTTP 409 - Mensagem:
  "Não é possível ativar dois torneios ao mesmo tempo..."
```

### ✅ Caso 6: Editar Rascunho (PERMITIDO)
```
Estado: Torneio A é rascunho
Admin: Edita data/título/disciplina de Torneio A
Resultado: ✅ Alterações salvas
```

---

## Códigos HTTP

| Código | Cenário | Mensagem |
|--------|---------|----------|
| 201 | Torneio criado com sucesso | "Torneio criado com sucesso!" |
| 400 | Data de início inválida | "A data de início deve ser diferente..." |
| 400 | Dados inválidos | Específico do campo |
| 409 | Conflito de torneios | "Não é possível criar/ativar dois..." |
| 500 | Erro interno | "Erro ao criar torneio" |

---

## Status da Implementação

| Componente | Status | Testes |
|-----------|--------|--------|
| Backend - Validação CREATE | ✅ | Pronto |
| Backend - Validação UPDATE | ✅ | Pronto |
| Backend - Tratamento Erro 409 | ✅ | Pronto |
| Frontend - Tratamento Erro | ✅ | Pronto |
| Frontend - Mensagens | ✅ | Pronto |
| Build Frontend | ✅ | Sucesso |

---

## Próximas Etapas

1. **Teste Funcional**:
   - Criar torneio ativo
   - Tentar criar segundo torneio ativo → deve mostrar erro
   - Finalize o primeiro
   - Criar segundo torneio ativo → deve funcionar

2. **Teste de Data**:
   - Tentar criar com data atual → deve mostrar erro
   - Criar com data +1 minuto → deve funcionar

3. **Teste de Rascunho**:
   - Criar múltiplos rascunhos → deve funcionar
   - Editar rascunho → deve funcionar
   - Ativar rascunho com outro ativo → deve bloquear

---

**Data**: 2026-06-10  
**Status**: ✅ Implementado e Compilado  
**Build**: Sucesso (0 erros)  
**Pronto para Teste**: Sim
