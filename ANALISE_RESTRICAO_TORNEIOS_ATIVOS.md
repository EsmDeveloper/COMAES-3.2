# 📊 ANÁLISE - Restrição de Torneios Ativos Simultâneos

**Data**: 9 de Junho de 2026  
**Pergunta**: É possível ter torneios de disciplinas diferentes ativos ao mesmo tempo?

---

## ❌ **RESPOSTA: NÃO** (Atualmente restringido)

A lógica atual **permite apenas 1 torneio ativo por vez**, independentemente da disciplina.

---

## 🔍 **ONDE A RESTRIÇÃO ESTÁ?**

### Backend - TorneioController.js (linha 553-562)

```javascript
// Verificar se existe outro torneio ativo
const outroAtivo = await Torneio.findOne({
    where: { 
        status: 'ativo',
        id: { [sequelize.Sequelize.Op.ne]: id }  // ← Ignora disciplina
    },
    transaction
});

if (outroAtivo) {
    await transaction.rollback();
    return res.status(400).json({
        message: `Já existe um torneio ativo: "${outroAtivo.titulo}". Máximo permitido: 1`,
        torneioAtivo: outroAtivo
    });
}
```

### Frontend - TorneiosTab.jsx (linha 168-178)

```javascript
// Validação: se tentando ativar um torneio, verificar se já existe outro ativo
if (payload.status === 'ativo' && modalForm.mode === 'create') {
    const torneioAtivoExistente = torneios.some(t => t.status === 'ativo');
    if (torneioAtivoExistente) {
        showToast('❌ Já existe um torneio ativo! Finalize-o antes de criar outro.', 'error');
        setIsProcessing(false);
        return;
    }
}
```

---

## 🧠 **LÓGICA ATUAL**

```
Status: ativo?
├─ SIM → Procura ANY outro torneio com status='ativo'
│       └─ Encontrou? → BLOQUEIA ("Já existe um ativo")
│       └─ Não encontrou? → PERMITE ativar
└─ NÃO → Continua normal
```

**O que a lógica ignora:**
- ❌ `tipo_torneio` (generico vs especifico)
- ❌ `disciplina_especifica` (qual disciplina)
- ❌ Apenas verifica se `status = 'ativo'`

---

## 💡 **CASOS DE USO BLOQUEADOS ATUALMENTE**

```
Exemplo 1: BLOQUEADO ❌
┌──────────────────────────────────┐
│ Torneio 1: Genérico (Ativo)     │
│ Torneio 2: Especifico-Math (?) │  ← Tenta ativar
└──────────────────────────────────┘
Resultado: "Já existe um torneio ativo"

Exemplo 2: BLOQUEADO ❌
┌──────────────────────────────────┐
│ Torneio 1: Especifico-Prog (Ativo) │
│ Torneio 2: Especifico-Math (?)    │  ← Tenta ativar
└──────────────────────────────────┘
Resultado: "Já existe um torneio ativo"

Exemplo 3: BLOQUEADO ❌
┌──────────────────────────────────┐
│ Torneio 1: Genérico (Ativo)       │
│ Torneio 2: Genérico (?)           │  ← Tenta ativar
└──────────────────────────────────┘
Resultado: "Já existe um torneio ativo"
```

---

## 🤔 **DEVERIA SER PERMITIDO?**

### Vantagens de permitir múltiplos simultâneos (por disciplina)

✅ **Flexibilidade**: Estudantes fazem concurso da sua disciplina em paralelo  
✅ **Exclusividade**: Cada disciplina tem seu próprio torneio  
✅ **Competição isolada**: Sem misturar Matemática com Programação  
✅ **Melhor experiência**: Aluno só compete na sua área  

### Desvantagens

❌ **Complexidade**: Lógica de participação fica mais complexa  
❌ **Confusão**: Múltiplas notificações simultâneas  
❌ **Performance**: Mais cálculos de ranking em paralelo  
❌ **Certicados**: Precisa coordenar top 3 por disciplina  

---

## 📋 **CENÁRIOS POSSÍVEIS**

### Cenário 1: Status Quo (Atual - Mais Restritivo)
```
PERMITIDO:
- 1 Genérico ativo ✅
- 1 Específico-Math ativo ✅

BLOQUEADO:
- 1 Genérico + 1 Específico-Math ❌
- 2 Específicos diferentes ❌
- 2 Qualquer tipo ❌
```

### Cenário 2: Múltiplos por Disciplina (Mais Flexível)
```
PERMITIDO:
- 1 Genérico + 1 Específico-Math ✅
- 1 Genérico + 1 Específico-Prog ✅
- 1 Específico-Math + 1 Específico-Prog ✅

BLOQUEADO:
- 2 Genéricos ❌
- 2 Específicos-Math ❌
- 3+ torneios qualquer ❌
```

### Cenário 3: Sem Restrição (Mais Caótico)
```
PERMITIDO:
- Qualquer quantidade de torneios ativos ✅
- Mesmo tipo/disciplina múltiplos ✅

Resultado: CAOS (não recomendado)
```

---

## 🔧 **COMO IMPLEMENTAR MÚLTIPLOS SIMULTÂNEOS?**

Se você quiser permitir torneios de **disciplinas diferentes** ativos em paralelo:

### Opção A: Múltiplos por Disciplina (Recomendado)

**Validação seria**:
```javascript
// Procurar outro ativo MESMA disciplina
const outroMesmaDisciplina = await Torneio.findOne({
    where: { 
        status: 'ativo',
        id: { [Op.ne]: id },
        // NOVO: Verificar disciplina/tipo
        [Op.or]: [
            // Se genérico: só bloqueia outro genérico
            sequelize.where(
                sequelize.col('tipo_torneio'), 
                Op.eq, 
                'generico'
            ),
            // Se específico: só bloqueia mesma disciplina
            sequelize.where(
                sequelize.col('disciplina_especifica'), 
                Op.eq, 
                disciplina_especifica
            )
        ]
    },
    transaction
});
```

**Lógica completa**:
```javascript
// Se tentar ativar GENÉRICO
if (tipo_torneio === 'generico') {
    // Só bloqueia outro genérico ativo
    const outroGenerico = await Torneio.findOne({
        where: {
            status: 'ativo',
            id: { [Op.ne]: id },
            tipo_torneio: 'generico'
        }
    });
    if (outroGenerico) BLOQUEIA;
}

// Se tentar ativar ESPECÍFICO
if (tipo_torneio === 'especifico') {
    // Bloqueia outro com MESMA disciplina ativa
    const outroMesmaDisciplina = await Torneio.findOne({
        where: {
            status: 'ativo',
            id: { [Op.ne]: id },
            tipo_torneio: 'especifico',
            disciplina_especifica: disciplina_especifica
        }
    });
    if (outroMesmaDisciplina) BLOQUEIA;
}
```

---

## 📊 **MATRIZ DE PERMISSÕES (Opção A)**

|Tentando ativar|Genérico ativo|Prog ativo|Math ativo|Result|
|---|---|---|---|---|
|Genérico|❌ Bloqueia|✅ Permite|✅ Permite|OK|
|Programação|✅ Permite|❌ Bloqueia|✅ Permite|OK|
|Matemática|✅ Permite|✅ Permite|❌ Bloqueia|OK|

---

## ✅ **RECOMENDAÇÃO**

### Se a intenção é:
- **Alunos competindo em sua disciplina específica**: Implemente **Opção A**
- **Um único torneio por vez (simplidade)**: Mantenha **Status Quo**
- **Total liberdade** (caótico): Use **Opção 3** (não recomendado)

### Próximos passos:

1. **Decisão**: Qual modelo você quer?
2. **Se Opção A**: Precisa alterar:
   - `TorneioController.js` → Lógica de ativação
   - `TorneiosTab.jsx` → Validação frontend
   - Documentação de regras

3. **Se Status Quo**: Deixar como está ✅ (Atual)

---

## 🚀 **Para Ativar Opção A**

**Arquivo a modificar**: `BackEnd/controllers/TorneioController.js` (linha 553-562)

**Alteração**:
```javascript
// ATUAL (bloqueia todos)
const outroAtivo = await Torneio.findOne({
    where: { 
        status: 'ativo',
        id: { [sequelize.Sequelize.Op.ne]: id }
    },
    transaction
});

// NOVO (permite diferentes disciplinas)
let outroAtivo;
if (torneio.tipo_torneio === 'generico') {
    // Genérico: bloqueia outro genérico
    outroAtivo = await Torneio.findOne({
        where: { 
            status: 'ativo',
            id: { [sequelize.Sequelize.Op.ne]: id },
            tipo_torneio: 'generico'
        },
        transaction
    });
} else {
    // Específico: bloqueia mesma disciplina
    outroAtivo = await Torneio.findOne({
        where: { 
            status: 'ativo',
            id: { [sequelize.Sequelize.Op.ne]: id },
            tipo_torneio: 'especifico',
            disciplina_especifica: torneio.disciplina_especifica
        },
        transaction
    });
}
```

---

**Você quer que eu implemente a Opção A? Ou prefere manter o Status Quo?**
