# Integração Frontend-Backend: Sistema de Tentativas

## 📋 Objetivo Alcançado
Transformar o frontend de teste num sistema dependente do backend, removendo toda a lógica de validação local.

---

## ✅ Mudanças Realizadas

### 1. **Remoção de Lógica de Validação Local**

#### ❌ REMOVIDO do Frontend:
- Cálculo de `correctIndex` (mapeamento de resposta correta)
- Validação de resposta no frontend
- Lógica de "correto/incorreto" local
- Cálculo de pontos no frontend
- Comparação de respostas no frontend

#### Arquivo: `Teste.jsx`
```javascript
// ANTES (REMOVIDO):
let correctIndex = 0;
const rc = q.resposta_correta;
if (rc === q.opcao_a) correctIndex = 0;
else if (rc === q.opcao_b) correctIndex = 1;
// ... mais lógica de validação

// DEPOIS (SIMPLIFICADO):
return {
  id: q.id,
  question: q.texto_pergunta,
  options: options
  // Sem informação de resposta correta
};
```

---

### 2. **Novo Fluxo de Resposta**

#### Antes (Validação Local):
```
Frontend: Usuário seleciona resposta
  ↓
Frontend: Valida localmente
  ↓
Frontend: Calcula pontos
  ↓
Frontend: Exibe resultado
```

#### Depois (Validação no Backend):
```
Frontend: Usuário seleciona resposta
  ↓
Frontend: Envia para Backend
  ↓
Backend: Valida resposta correta
  ↓
Backend: Calcula pontos
  ↓
Backend: Retorna resultado
  ↓
Frontend: Apenas exibe feedback visual
```

---

### 3. **Novo Serviço: `tentativasService.js`**

Criado arquivo: `FrontEnd/src/services/tentativasService.js`

**Responsabilidades:**
- Centralizar comunicação com backend
- Gerenciar autenticação (token)
- Tratamento de erros
- Três endpoints principais:

```javascript
// 1. Enviar tentativa (POST /api/tentativas)
enviarTentativa({
  torneio_id,
  disciplina_competida,
  questao_id,
  resposta_selecionada,
  tempo_gasto
})

// 2. Obter histórico (GET /api/tentativas/:torneio_id/:disciplina)
obterHistorico(torneio_id, disciplina)

// 3. Obter estatísticas (GET /api/tentativas/stats/:torneio_id)
obterEstatisticas(torneio_id)
```

---

### 4. **Atualização do `handleAnswerSelect`**

#### Antes:
```javascript
// Validação local
const correta = respostaSelecionadaNormalizada === respostaCorretaNormalizada;
const pontosObtidos = correta ? questao.pontos : 0;
```

#### Depois:
```javascript
// Apenas envia para backend
const result = await enviarTentativa({
  torneio_id,
  disciplina_competida,
  questao_id,
  resposta_selecionada,
  tempo_gasto
});

// Backend retorna validação
const tentativa = result.tentativa; // { correta, pontos_obtidos, resposta_correta }
const resumo = result.resumo; // { total_acertos, total_pontos, total_questoes }
```

---

### 5. **Resposta do Backend Esperada**

```json
{
  "sucesso": true,
  "tentativa": {
    "id": 123,
    "questao_id": 45,
    "correta": true,
    "pontos_obtidos": 10,
    "resposta_correta": "B",
    "resposta_selecionada": "B"
  },
  "resumo": {
    "total_acertos": 3,
    "total_pontos": 30,
    "total_questoes": 5
  }
}
```

---

### 6. **Frontend Agora Apenas Exibe**

O frontend recebe dados do backend e apenas:
- ✅ Exibe feedback visual (correto/incorreto)
- ✅ Mostra pontos ganhos
- ✅ Atualiza progresso
- ✅ Renderiza resposta correta (se errou)

**Não faz mais:**
- ❌ Validação de resposta
- ❌ Cálculo de pontos
- ❌ Comparação de respostas
- ❌ Lógica de negócio

---

### 7. **Variáveis Removidas**

- `timeStarted` - Não era utilizada
- Referência a `setTorneioId` - Será preenchida dinamicamente

---

## 🔄 Fluxo Completo de Uma Tentativa

### 1. Usuário seleciona resposta
```javascript
handleAnswerSelect(optionIndex)
```

### 2. Frontend envia para backend
```javascript
const result = await enviarTentativa({
  torneio_id: 1,
  disciplina_competida: 'Matemática',
  questao_id: 45,
  resposta_selecionada: 'B',
  tempo_gasto: 15
});
```

### 3. Backend processa
- Valida que usuário está autenticado
- Valida que está inscrito no torneio
- Busca resposta correta da questão
- Compara respostas (case-insensitive)
- Calcula pontos
- Salva na base de dados

### 4. Backend retorna resultado
```json
{
  "sucesso": true,
  "tentativa": {
    "correta": true,
    "pontos_obtidos": 10,
    "resposta_correta": "B"
  },
  "resumo": {
    "total_acertos": 3,
    "total_pontos": 30,
    "total_questoes": 5
  }
}
```

### 5. Frontend atualiza UI
- Armazena resposta com dados do backend
- Atualiza pontuação
- Exibe feedback visual
- Passa para próxima questão

---

## 📊 Arquitetura Resultante

```
Frontend (Interface)
├── Teste.jsx (Componente principal)
├── tentativasService.js (Comunicação com backend)
└── Exibe apenas feedback visual

Backend (Regra de Negócio)
├── TentativasController.js (Lógica de validação)
├── TentativaResposta.js (Modelo)
└── Valida, calcula e persiste dados
```

---

## 🎯 Benefícios

1. **Segurança**: Validação não pode ser burlada no frontend
2. **Confiabilidade**: Fonte única de verdade (backend)
3. **Manutenibilidade**: Lógica centralizada no backend
4. **Escalabilidade**: Fácil adicionar novas regras de negócio
5. **Auditoria**: Todas as tentativas registradas no backend

---

## 📝 Próximos Passos (Não Alterados)

- ✅ Ranking (mantém estrutura atual)
- ✅ Modelo Pergunta (sem mudanças)
- ✅ Estrutura de base de dados (sem mudanças)

---

## 🧪 Testes Recomendados

1. Enviar resposta correta → Verificar pontos
2. Enviar resposta incorreta → Verificar feedback
3. Múltiplas tentativas → Verificar acumulação de pontos
4. Sem autenticação → Verificar erro 401
5. Usuário não inscrito → Verificar erro 403

---

## 📂 Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `Teste.jsx` | Removida lógica de validação, importado serviço |
| `tentativasService.js` | ✨ NOVO - Centraliza comunicação com backend |

---

## 🔗 Endpoints Backend Utilizados

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/tentativas` | Enviar tentativa |
| GET | `/api/tentativas/:torneio_id/:disciplina` | Histórico |
| GET | `/api/tentativas/stats/:torneio_id` | Estatísticas |

---

**Status**: ✅ Integração Completa
**Data**: 22 de Maio de 2026
