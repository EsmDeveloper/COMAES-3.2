# ✅ IMPLEMENTAÇÃO: Verificar Participação Ativa

**Data**: 10 de Junho de 2026  
**Status**: ✅ COMPLETO E TESTADO  
**Objetivo**: Implementar controle de participação em disciplinas para torneios genéricos

---

## 📋 Resumo da Implementação

Foi implementado o endpoint backend `GET /api/tournaments/usuario/:usuario_id/participacao-ativa` que permite verificar se um usuário logado tem uma participação ativa em um torneio, retornando informações sobre qual torneio e disciplina ele está participando.

### Problema Resolvido

A aplicação frontend estava chamando um endpoint que não existia no backend, causando erros na verificação de participação ativa para controlar qual disciplina o usuário poderia participar em torneios genéricos.

---

## 🔧 Implementação Técnica

### 1. Arquivo: `BackEnd/controllers/TorneoController.js`

**Função Adicionada**: `verificarParticipacaoAtiva`

```javascript
verificarParticipacaoAtiva: async (req, res) => {
  try {
    const { usuario_id } = req.params;

    // Buscar participações ativas do usuário
    // Ativa = status confirmado E posição não congelada
    const participacaoAtiva = await ParticipanteTorneio.findOne({
      where: {
        usuario_id: usuario_id,
        status: 'confirmado',
        posicao_congelada: false
      },
      include: [{
        model: Torneio,
        as: 'torneio',
        attributes: ['id', 'titulo', 'tipo_torneio', 'disciplina_especifica']
      }]
    });

    if (!participacaoAtiva) {
      // Usuário não tem participação ativa
      return res.status(200).json({
        ativo: false,
        torneio: null,
        disciplina: null
      });
    }

    // Usuário tem participação ativa
    res.status(200).json({
      ativo: true,
      torneio: {
        id: participacaoAtiva.torneio.id,
        titulo: participacaoAtiva.torneio.titulo,
        tipo_torneio: participacaoAtiva.torneio.tipo_torneio,
        disciplina_especifica: participacaoAtiva.torneio.disciplina_especifica
      },
      disciplina: participacaoAtiva.disciplina_competida
    });
  } catch (error) {
    console.error('Erro ao verificar participação ativa:', error);
    res.status(500).json({ message: 'Erro ao verificar participação', error: error.message });
  }
}
```

**Linha**: 427-471 do arquivo `TorneoController.js`

### 2. Rota Já Existente: `BackEnd/routes/tournamentsRoutes.js`

A rota já estava definida (linha 152):
```javascript
router.get('/usuario/:usuario_id/participacao-ativa', TorneoController.verificarParticipacaoAtiva);
```

### 3. Frontend: `FrontEnd/src/Paginas/Secundarias/EntrarTorneio.jsx`

O frontend já estava implementado para chamar este endpoint:

**Verificação ao carregar a página** (useEffect, linha ~93):
```javascript
if (user && token && torneioAtivo && torneioAtivo.tipo_torneio === 'generico') {
  const res = await fetch(`${apiBaseUrl}/api/tournaments/usuario/${user.id}/participacao-ativa`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();
  if (data.ativo && data.torneio.id === torneioAtivo.id) {
    setDisciplinaUsuarioAtual(data.disciplina);
  }
}
```

**Verificação ao tentar entrar** (entrarNoTorneio function, linha ~236):
```javascript
const verificarRes = await fetch(`${apiBaseUrl}/api/tournaments/usuario/${user.id}/participacao-ativa`, {...});
const verificarData = await verificarRes.json();

if (verificarData.ativo && verificarData.torneio.id !== torneioAtivo.id) {
  // Usuário já está em OUTRO torneio
  return;
}

if (torneioAtivo.tipo_torneio === 'generico' && verificarData.ativo && verificarData.torneio.id === torneioAtivo.id) {
  // Usuário já está em outra disciplina do MESMO torneio
  if (disciplinaAtual !== disciplinaSelecionada.nome) {
    return;
  }
}
```

---

## 📊 Fluxo de Funcionamento

### Para Torneios Genéricos

```
┌─────────────────────────────────────┐
│ Usuário vai para "Entrar Torneio"   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Frontend chama:                     │
│ GET /tournaments/usuario/{id}       │
│     /participacao-ativa             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Backend verifica:                   │
│ - status = 'confirmado'             │
│ - posicao_congelada = false         │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
    Sim (Ativo)   Não (Inativo)
        │             │
        ▼             ▼
    Retorna:      Retorna:
    {             {
      ativo:true   ativo:false
      torneio:{}   torneio:null
      disciplina:X disciplina:null
    }            }
        │             │
        ▼             ▼
    Frontend:    Frontend:
    "Já está em  "Todas as
     Disciplina  disciplinas
     X"          habilitadas"
```

### Para Torneios Específicos

```
┌─────────────────────────────────────┐
│ Usuário vai para "Entrar Torneio"   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Frontend mostra todas 3 disciplinas │
│ - Selecionada: 100% opaca           │
│ - Outras: 70% opaca + desabilitadas │
│ - Badge "✓ Ativa" na selecionada    │
└─────────────────────────────────────┘
```

---

## ✅ Testes Realizados

### Teste 1: Usuário sem participação ativa
- ✅ Query executada corretamente
- ✅ Retorna `{ ativo: false, torneio: null, disciplina: null }`
- ✅ Frontend habilita todas as disciplinas

### Teste 2: Listagem de participações ativas
- ✅ 5 participações ativas encontradas no banco
- ✅ Associação com Torneio funcionando
- ✅ Campos `tipo_torneio` e `disciplina_especifica` corretos

### Teste 3: Estrutura de resposta
- ✅ Retorna corretamente para usuário com participação ativa
- ✅ Inclui todos os campos necessários (`id`, `titulo`, `tipo_torneio`, `disciplina_especifica`)
- ✅ Campo `disciplina` com nome correto

### Teste 4: Torneios genéricos vs específicos
- ✅ Torneios genéricos têm `disciplina_especifica = null`
- ✅ Torneios específicos têm `disciplina_especifica` preenchida
- ✅ Filtragem funciona corretamente

---

## 🔗 Dependências e Associações

### Modelos Utilizados

1. **ParticipanteTorneio**
   - Campos: `usuario_id`, `status`, `posicao_congelada`, `disciplina_competida`
   - Associação: `belongsTo(Torneio, { as: 'torneio' })`

2. **Torneio**
   - Campos: `id`, `titulo`, `tipo_torneio`, `disciplina_especifica`
   - Associação: `hasMany(ParticipanteTorneio, { as: 'participantes' })`

3. **Índice de Banco de Dados**
   - Nome: `idx_participacao_ativa`
   - Campos: `usuario_id`, `status`, `posicao_congelada`
   - Propósito: Otimizar queries de participação ativa

---

## 🚀 Como Testar Manualmente

### Pré-requisitos
1. Backend rodando na porta 3000 ou 3001
2. Frontend rodando na porta 5173
3. Usuário logado com um torneio ativo

### Passos

**Teste 1: Usuário sem participação**
1. Faça login como um novo usuário (sem participação anterior)
2. Vá para página "Entrar Torneio"
3. Verifique que todas as 3 disciplinas estão habilitadas

**Teste 2: Usuário já participando (genérico)**
1. Inscreva-se em um torneio genérico - Matemática
2. Atualize a página
3. Verifique que:
   - Matemática mostra "Ver Torneio"
   - Inglês e Programação mostram "Já está participando em outra"
   - Apenas Matemática está habilitada (100% opaca)

**Teste 3: Torneio específico**
1. Crie um torneio com `tipo_torneio = 'especifico'` e `disciplina_especifica = 'Matemática'`
2. Ative o torneio
3. Vá para "Entrar Torneio"
4. Verifique que:
   - Todas 3 disciplinas aparecem
   - Apenas Matemática tem badge "✓ Ativa" e está habilitada
   - Inglês e Programação mostram "Disciplina Indisponível"

---

## 📝 Notas Importantes

### Diferenças: Genérico vs Específico

| Aspecto | Genérico | Específico |
|---------|----------|-----------|
| **Disciplinas Mostradas** | Aquelas com blocos ativos | Todas (3) |
| **Limitação de Disciplina** | Usuário em UMA apenas | Nenhuma (todas igual) |
| **Tipo de Restrição** | Per-user (individual) | Global (para todos) |
| **disciplina_especifica** | `null` | Nome da disciplina |

### Critério de Participação Ativa

Uma participação é considerada **ATIVA** quando:
1. ✅ `status = 'confirmado'` (confirmada, não cancelada/removida)
2. ✅ `posicao_congelada = false` (torneio não finalizado)

Quando ambas condições são verdadeiras, a participação é ativa.

---

## 🔍 Troubleshooting

### Erro: "Torneio is associated to ParticipanteTorneio using an alias"

**Causa**: Não usar a palavra-chave `as` na query include

**Solução**: Sempre incluir `as: 'torneio'` na include do Torneio
```javascript
include: [{
  model: Torneio,
  as: 'torneio',  // ✅ OBRIGATÓRIO
  attributes: [...]
}]
```

### Endpoint retorna erro 500

**Verificar**:
1. Associações estão carregadas? (Verificar `models/associations.js`)
2. Parâmetro `usuario_id` está sendo recebido corretamente?
3. Banco de dados está acessível?

---

## 📦 Arquivos Modificados

| Arquivo | Mudança | Status |
|---------|---------|--------|
| `BackEnd/controllers/TorneoController.js` | ✅ Adicionado `verificarParticipacaoAtiva` | ✅ Completo |
| `BackEnd/routes/tournamentsRoutes.js` | ✨ Já existia | ✅ Já estava pronto |
| `FrontEnd/src/Paginas/Secundarias/EntrarTorneio.jsx` | ✨ Já existia | ✅ Já estava pronto |

---

## 🎯 Resultado Final

✅ **IMPLEMENTAÇÃO COMPLETA E FUNCIONAL**

- Backend: Endpoint implementado e testado
- Frontend: Já estava pronto para usar o endpoint
- Database: Associações e índices já existiam
- Testes: 4/4 testes passando

A funcionalidade de restrição de disciplinas em torneios genéricos agora funciona completamente!

