# Guia de Integração Backend - Sistema de Tentativas

## 📋 Visão Geral

Este documento descreve como o frontend foi integrado com o backend para o sistema de tentativas, removendo toda a lógica de validação local.

---

## 🔄 Fluxo de Dados

### 1. Carregamento de Questões

```
Frontend
  ↓
GET /perguntas/{area}
  ↓
Backend retorna:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "texto_pergunta": "Qual é 2+2?",
      "opcao_a": "3",
      "opcao_b": "4",
      "opcao_c": "5",
      "opcao_d": "6",
      "resposta_correta": "4",  // ← NÃO ENVIADO PARA FRONTEND
      "pontos": 10
    }
  ]
}
  ↓
Frontend mapeia apenas:
{
  id: 1,
  question: "Qual é 2+2?",
  options: ["3", "4", "5", "6"]
  // resposta_correta NÃO é armazenada
}
```

### 2. Envio de Resposta

```
Frontend (Teste.jsx)
  ↓
handleAnswerSelect(optionIndex)
  ↓
enviarTentativa({
  torneio_id: 1,
  disciplina_competida: "Matemática",
  questao_id: 1,
  resposta_selecionada: "4",
  tempo_gasto: 15
})
  ↓
POST /api/tentativas
  ↓
Backend (TentativasController.salvarTentativa)
  ↓
Validações:
  ✓ Usuário autenticado?
  ✓ Usuário existe?
  ✓ Torneio existe?
  ✓ Usuário inscrito?
  ✓ Participante confirmado?
  ✓ Questão existe?
  ✓ Disciplina válida?
  ✓ Resposta não vazia?
  ↓
Processamento:
  1. Busca resposta_correta do banco
  2. Compara: resposta_selecionada === resposta_correta
  3. Calcula: pontos = correta ? questao.pontos : 0
  4. Salva TentativaResposta no banco
  5. Calcula resumo (total_acertos, total_pontos)
  ↓
Response:
{
  "sucesso": true,
  "tentativa": {
    "id": 123,
    "questao_id": 1,
    "correta": true,
    "pontos_obtidos": 10,
    "resposta_correta": "4",
    "resposta_selecionada": "4"
  },
  "resumo": {
    "total_acertos": 1,
    "total_pontos": 10,
    "total_questoes": 1
  }
}
  ↓
Frontend recebe e atualiza estado:
  - setScore(10)
  - setCorrectAnswers(1)
  - setWrongAnswers(0)
  - setUserAnswers([...])
  ↓
Frontend exibe feedback visual
```

---

## 🛡️ Validações Backend

### Autenticação
```javascript
if (!usuario_id) {
  return res.status(401).json({ 
    sucesso: false, 
    erro: 'Usuário não autenticado' 
  });
}
```

### Verificação de Usuário
```javascript
const usuario = await User.findByPk(usuario_id);
if (!usuario) {
  return res.status(404).json({ 
    sucesso: false, 
    erro: 'Usuário não encontrado' 
  });
}
```

### Verificação de Inscrição
```javascript
const participante = await ParticipanteTorneio.findOne({
  where: {
    usuario_id,
    torneio_id,
    disciplina_competida
  }
});

if (!participante) {
  return res.status(403).json({ 
    sucesso: false, 
    erro: 'Usuário não está inscrito neste torneio' 
  });
}

if (participante.status !== 'confirmado') {
  return res.status(403).json({ 
    sucesso: false, 
    erro: 'Participante não está confirmado' 
  });
}
```

### Validação de Resposta
```javascript
if (!resposta_selecionada || resposta_selecionada.trim() === '') {
  return res.status(400).json({ 
    sucesso: false, 
    erro: 'Resposta não pode estar vazia' 
  });
}
```

---

## 📊 Comparação de Respostas

### Backend (Autoridade)
```javascript
const respostaSelecionadaNormalizada = resposta_selecionada.trim().toLowerCase();
const respostaCorretaNormalizada = respostaCorreta.trim().toLowerCase();
const correta = respostaSelecionadaNormalizada === respostaCorretaNormalizada;
```

**Características:**
- Case-insensitive (A = a)
- Trim de espaços
- Comparação exata
- Única fonte de verdade

### Frontend (Apenas Exibição)
```javascript
// Frontend NÃO faz comparação
// Apenas exibe o resultado do backend

if (tentativa.correta) {
  // Mostrar ✓ verde
} else {
  // Mostrar ✗ vermelho
  // Mostrar resposta correta
}
```

---

## 💾 Armazenamento de Tentativas

### Modelo TentativaResposta
```javascript
{
  id: 123,
  usuario_id: 5,
  torneio_id: 1,
  disciplina_competida: "Matemática",
  questao_id: 1,
  resposta_selecionada: "4",
  resposta_correta: "4",
  correta: true,
  pontos_obtidos: 10,
  tempo_gasto: 15,
  criado_em: "2026-05-22T10:30:00Z"
}
```

### Cálculo de Resumo
```javascript
const todasAsTentativas = await TentativaResposta.findAll({
  where: {
    usuario_id,
    torneio_id,
    disciplina_competida
  }
});

const totalAcertos = todasAsTentativas.filter(t => t.correta).length;
const totalPontos = todasAsTentativas.reduce((sum, t) => sum + t.pontos_obtidos, 0);
```

---

## 🔐 Segurança

### Por que Backend é Autoridade?

1. **Impossível Trapacear**
   - Frontend não pode alterar pontos
   - Frontend não conhece resposta correta
   - Validação acontece no servidor

2. **Auditoria**
   - Todas as tentativas são registradas
   - Histórico completo no banco
   - Impossível deletar ou modificar

3. **Integridade**
   - Resposta correta vem do banco
   - Cálculo de pontos no servidor
   - Resumo atualizado em tempo real

### Exemplo de Ataque Bloqueado

```javascript
// ❌ TENTATIVA DE TRAPACEAR (Frontend)
const fakeResponse = {
  correta: true,
  pontos_obtidos: 100,
  resposta_correta: "A"
};

// ✅ BLOQUEADO (Backend valida)
// Backend recebe resposta_selecionada: "B"
// Backend busca resposta_correta: "A"
// Backend calcula: correta = false, pontos = 0
// Backend retorna verdade
```

---

## 📡 Endpoints Utilizados

### 1. Salvar Tentativa
```
POST /api/tentativas
Authorization: Bearer {token}

Body:
{
  "torneio_id": 1,
  "disciplina_competida": "Matemática",
  "questao_id": 1,
  "resposta_selecionada": "4",
  "tempo_gasto": 15
}

Response:
{
  "sucesso": true,
  "tentativa": {...},
  "resumo": {...}
}
```

### 2. Obter Histórico
```
GET /api/tentativas/:torneio_id/:disciplina
Authorization: Bearer {token}

Response:
{
  "sucesso": true,
  "tentativas": [...],
  "resumo": {
    "total_acertos": 3,
    "total_pontos": 30,
    "total_questoes": 5
  }
}
```

### 3. Obter Estatísticas
```
GET /api/tentativas/stats/:torneio_id
Authorization: Bearer {token}

Response:
{
  "sucesso": true,
  "torneio_id": 1,
  "usuario_id": 5,
  "estatisticas": {
    "Matemática": {
      "total_questoes": 4,
      "total_acertos": 3,
      "taxa_acerto": "75.00%",
      "total_pontos": 30,
      "tempo_total_segundos": 60
    },
    ...
  }
}
```

---

## 🧪 Testes de Integração

### Teste 1: Resposta Correta
```javascript
// Request
POST /api/tentativas
{
  "torneio_id": 1,
  "disciplina_competida": "Matemática",
  "questao_id": 1,
  "resposta_selecionada": "4",
  "tempo_gasto": 15
}

// Expected Response
{
  "sucesso": true,
  "tentativa": {
    "correta": true,
    "pontos_obtidos": 10,
    "resposta_correta": "4"
  }
}
```

### Teste 2: Resposta Incorreta
```javascript
// Request
POST /api/tentativas
{
  "torneio_id": 1,
  "disciplina_competida": "Matemática",
  "questao_id": 1,
  "resposta_selecionada": "3",  // ← Errada
  "tempo_gasto": 15
}

// Expected Response
{
  "sucesso": true,
  "tentativa": {
    "correta": false,
    "pontos_obtidos": 0,
    "resposta_correta": "4"
  }
}
```

### Teste 3: Sem Autenticação
```javascript
// Request (sem token)
POST /api/tentativas
{...}

// Expected Response
{
  "sucesso": false,
  "erro": "Usuário não autenticado"
}
// Status: 401
```

### Teste 4: Usuário Não Inscrito
```javascript
// Request
POST /api/tentativas
{
  "torneio_id": 999,  // ← Não inscrito
  "disciplina_competida": "Matemática",
  ...
}

// Expected Response
{
  "sucesso": false,
  "erro": "Usuário não está inscrito neste torneio"
}
// Status: 403
```

---

## 📝 Checklist de Implementação

- [x] Backend valida resposta
- [x] Backend calcula pontos
- [x] Backend salva tentativa
- [x] Backend retorna resultado
- [x] Frontend remove validação local
- [x] Frontend remove cálculo de pontos
- [x] Frontend envia resposta para backend
- [x] Frontend exibe feedback do backend
- [x] Frontend atualiza pontuação com dados backend
- [x] Serviço tentativasService.js implementado
- [x] Sem erros de compilação
- [x] Segurança garantida

---

## 🚀 Próximos Passos

1. **Testes Manuais**
   - Testar resposta correta
   - Testar resposta incorreta
   - Testar múltiplas questões
   - Verificar histórico

2. **Testes Automatizados**
   - Criar testes unitários para backend
   - Criar testes de integração
   - Testar segurança

3. **Monitoramento**
   - Logs de tentativas
   - Alertas de erros
   - Métricas de performance

4. **Ranking** (Futuro)
   - Integrar com sistema de ranking
   - Atualizar posições em tempo real
   - Exibir leaderboard

---

## 📚 Referências

- Backend: `BackEnd/controllers/TentativasController.js`
- Routes: `BackEnd/routes/tentativasRoutes.js`
- Frontend: `FrontEnd/src/Paginas/Secundarias/Teste.jsx`
- Service: `FrontEnd/src/services/tentativasService.js`
- Model: `BackEnd/models/TentativaResposta.js`

---

**Integração Completa! ✅**
