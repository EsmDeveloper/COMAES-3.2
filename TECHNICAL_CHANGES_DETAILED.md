# 🔧 Mudanças Técnicas Detalhadas

## 📋 Índice
1. [Arquivo: Teste.jsx](#arquivo-testejsx)
2. [Arquivo: tentativasService.js](#arquivo-tentativasservicejs)
3. [Comparação Antes/Depois](#comparação-antesdepois)
4. [Impacto nas Funcionalidades](#impacto-nas-funcionalidades)

---

## Arquivo: Teste.jsx

### 1. Imports Modificados

**ANTES:**
```javascript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from "./Layout";
import { 
  CheckCircle,
  Lock
} from 'lucide-react';
```

**DEPOIS:**
```javascript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from "./Layout";
import { enviarTentativa } from '../../services/tentativasService'; // ✨ NOVO
import { 
  CheckCircle,
  Lock
} from 'lucide-react';
```

**Mudança**: Adicionado import do serviço `tentativasService`

---

### 2. State Removido

**ANTES:**
```javascript
const [timeStarted, setTimeStarted] = useState(null);
const [torneioId, setTorneioId] = useState(null);
```

**DEPOIS:**
```javascript
const [torneioId, setTorneioId] = useState(null);
// timeStarted removido (não era utilizado)
```

**Razão**: `timeStarted` não era utilizado em nenhum lugar do código

---

### 3. Carregamento de Questões

**ANTES:**
```javascript
const mappedQuestions = result.data.map(q => {
  const options = [q.opcao_a, q.opcao_b, q.opcao_c, q.opcao_d].filter(opt => opt !== null);
  
  let correctIndex = 0;
  const rc = q.resposta_correta;
  
  if (rc === q.opcao_a) correctIndex = 0;
  else if (rc === q.opcao_b) correctIndex = 1;
  else if (rc === q.opcao_c) correctIndex = 2;
  else if (rc === q.opcao_d) correctIndex = 3;
  else if (rc === 'A' || rc === 'a') correctIndex = 0;
  else if (rc === 'B' || rc === 'b') correctIndex = 1;
  else if (rc === 'C' || rc === 'c') correctIndex = 2;
  else if (rc === 'D' || rc === 'd') correctIndex = 3;
  
  return {
    id: q.id,
    question: q.texto_pergunta,
    options: options,
    correct: correctIndex,           // ❌ REMOVIDO
    correctValue: rc                 // ❌ REMOVIDO
  };
});
```

**DEPOIS:**
```javascript
const mappedQuestions = result.data.map(q => {
  const options = [q.opcao_a, q.opcao_b, q.opcao_c, q.opcao_d].filter(opt => opt !== null);
  
  return {
    id: q.id,
    question: q.texto_pergunta,
    options: options
    // Sem informação de resposta correta
  };
});
```

**Razão**: 
- Remover `correctIndex` evita que o frontend saiba a resposta correta
- Remover `correctValue` aumenta segurança
- Backend é responsável por validar

---

### 4. handleAreaSelect

**ANTES:**
```javascript
const handleAreaSelect = (area) => {
  setSelectedArea(area);
  setCurrentQuestion(0);
  setScore(0);
  setCorrectAnswers(0);
  setWrongAnswers(0);
  setTimeLeft(30);
  setTimeStarted(Date.now());  // ❌ REMOVIDO
  setUserAnswers([]);
  setQuizCompleted(false);
};
```

**DEPOIS:**
```javascript
const handleAreaSelect = (area) => {
  setSelectedArea(area);
  setCurrentQuestion(0);
  setScore(0);
  setCorrectAnswers(0);
  setWrongAnswers(0);
  setTimeLeft(30);
  setUserAnswers([]);
  setQuizCompleted(false);
};
```

**Razão**: `setTimeStarted` removido pois `timeStarted` não era utilizado

---

### 5. handleAnswerSelect - MUDANÇA PRINCIPAL

**ANTES:**
```javascript
const handleAnswerSelect = async (optionIndex) => {
  if (quizCompleted || submittingAnswer) return;

  const currentQuiz = quizzes[selectedArea];
  const currentQ = currentQuiz.questions[currentQuestion];
  const selectedOption = currentQ.options[optionIndex];
  
  setSubmittingAnswer(true);

  try {
    const tempoGasto = 30 - timeLeft;

    // ❌ VALIDAÇÃO LOCAL (REMOVIDA)
    const respostaSelecionadaNormalizada = selectedOption.trim().toLowerCase();
    const respostaCorretaNormalizada = currentQ.correctValue.trim().toLowerCase();
    const correta = respostaSelecionadaNormalizada === respostaCorretaNormalizada;
    const pontosObtidos = correta ? currentQ.pontos : 0;

    // ❌ CÁLCULO LOCAL (REMOVIDO)
    const newUserAnswers = [...userAnswers, {
      question: currentQuestion,
      selected: optionIndex,
      correct: correta,
      pontosObtidos: pontosObtidos,
      respostaCorreta: currentQ.correctValue
    }];
    
    setUserAnswers(newUserAnswers);
    setScore(score + pontosObtidos);
    setCorrectAnswers(correta ? correctAnswers + 1 : correctAnswers);
    setWrongAnswers(correta ? wrongAnswers : wrongAnswers + 1);

    if (currentQuestion === currentQuiz.questions.length - 1) {
      setQuizCompleted(true);
    } else {
      setTimeout(() => {
        handleNextQuestion();
      }, 1500);
    }
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    setSubmittingAnswer(false);
  }
};
```

**DEPOIS:**
```javascript
const handleAnswerSelect = async (optionIndex) => {
  if (quizCompleted || submittingAnswer) return;

  const currentQuiz = quizzes[selectedArea];
  const currentQ = currentQuiz.questions[currentQuestion];
  const selectedOption = currentQ.options[optionIndex];
  
  setSubmittingAnswer(true);

  try {
    const tempoGasto = 30 - timeLeft;

    // ✅ ENVIA PARA BACKEND (NOVO)
    const result = await enviarTentativa({
      torneio_id: torneioId || 1,
      disciplina_competida: selectedArea === 'matematica' ? 'Matemática' : selectedArea === 'programacao' ? 'Programação' : 'Inglês',
      questao_id: currentQ.id,
      resposta_selecionada: selectedOption,
      tempo_gasto: tempoGasto
    });

    // ✅ BACKEND RETORNA VALIDAÇÃO (NOVO)
    const tentativa = result.tentativa;
    const resumo = result.resumo;

    // ✅ APENAS ARMAZENA DADOS DO BACKEND (NOVO)
    const newUserAnswers = [...userAnswers, {
      question: currentQuestion,
      selected: optionIndex,
      correct: tentativa.correta,
      pontosObtidos: tentativa.pontos_obtidos,
      respostaCorreta: tentativa.resposta_correta
    }];
    
    setUserAnswers(newUserAnswers);

    // ✅ ATUALIZA COM DADOS DO BACKEND (NOVO)
    setScore(resumo.total_pontos);
    setCorrectAnswers(resumo.total_acertos);
    setWrongAnswers(resumo.total_questoes - resumo.total_acertos);

    if (currentQuestion === currentQuiz.questions.length - 1) {
      setQuizCompleted(true);
    } else {
      setTimeout(() => {
        handleNextQuestion();
      }, 1500);
    }
  } catch (error) {
    console.error('Erro ao enviar resposta:', error);
    alert(`Erro ao enviar resposta: ${error.message}`);
  } finally {
    setSubmittingAnswer(false);
  }
};
```

**Mudanças Principais:**
1. ❌ Removida validação local (`correta = ...`)
2. ❌ Removido cálculo local de pontos (`pontosObtidos = ...`)
3. ✅ Adicionado `enviarTentativa()` do serviço
4. ✅ Backend retorna `tentativa` com validação
5. ✅ Backend retorna `resumo` com totais
6. ✅ Frontend apenas armazena dados do backend

---

## Arquivo: tentativasService.js

### Novo Arquivo Criado

**Localização**: `FrontEnd/src/services/tentativasService.js`

**Conteúdo:**

```javascript
/**
 * Serviço de Tentativas
 * Centraliza toda a comunicação com o backend para tentativas
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;

/**
 * Enviar uma tentativa de resposta para o backend
 * @param {Object} tentativa - Dados da tentativa
 * @returns {Promise<Object>} Resposta do backend
 */
export const enviarTentativa = async (tentativa) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Token não encontrado. Usuário não autenticado.');
    }

    const response = await fetch(`${API_BASE_URL}/api/tentativas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(tentativa)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.erro || 'Erro ao enviar tentativa');
    }

    return result;
  } catch (error) {
    console.error('Erro ao enviar tentativa:', error);
    throw error;
  }
};

/**
 * Obter histórico de tentativas do usuário
 * @param {number} torneio_id - ID do torneio
 * @param {string} disciplina - Disciplina
 * @returns {Promise<Object>} Histórico de tentativas
 */
export const obterHistorico = async (torneio_id, disciplina) => {
  // ... implementação
};

/**
 * Obter estatísticas de tentativas
 * @param {number} torneio_id - ID do torneio
 * @returns {Promise<Object>} Estatísticas
 */
export const obterEstatisticas = async (torneio_id) => {
  // ... implementação
};
```

**Responsabilidades:**
- Centralizar comunicação com backend
- Gerenciar autenticação (token)
- Tratamento de erros
- Documentação JSDoc

---

## Comparação Antes/Depois

### Fluxo de Validação

**ANTES (Validação Local):**
```
Frontend: Usuário seleciona resposta
  ↓
Frontend: Valida localmente
  ├─ Compara resposta com correctValue
  ├─ Calcula pontos
  └─ Atualiza UI
  ↓
Backend: Apenas salva (sem validação)
```

**DEPOIS (Validação no Backend):**
```
Frontend: Usuário seleciona resposta
  ↓
Backend: Valida resposta
  ├─ Busca resposta correta
  ├─ Compara respostas
  ├─ Calcula pontos
  └─ Salva em BD
  ↓
Frontend: Recebe validação
  ├─ Armazena dados
  └─ Atualiza UI
```

---

### Segurança

**ANTES:**
```javascript
// Frontend conhece resposta correta
correct: correctIndex,
correctValue: rc

// Usuário pode:
// 1. Modificar correctValue no DevTools
// 2. Sempre marcar como correto
// 3. Ganhar pontos sem responder
```

**DEPOIS:**
```javascript
// Frontend NÃO conhece resposta correta
// Apenas recebe validação do backend

// Usuário NÃO pode:
// 1. Modificar validação (vem do backend)
// 2. Ganhar pontos sem responder corretamente
// 3. Burlar o sistema
```

---

### Performance

**ANTES:**
```javascript
// Cálculos locais
const correta = respostaSelecionadaNormalizada === respostaCorretaNormalizada;
const pontosObtidos = correta ? questao.pontos : 0;
const newScore = score + pontosObtidos;
const newCorrectAnswers = correctAnswers + (correta ? 1 : 0);
```

**DEPOIS:**
```javascript
// Backend retorna totais
setScore(resumo.total_pontos);
setCorrectAnswers(resumo.total_acertos);
// Sem cálculos locais
```

---

## Impacto nas Funcionalidades

### ✅ Funcionalidades Mantidas
- Seleção de resposta
- Exibição de feedback visual
- Progresso do quiz
- Temporizador
- Tela de resultados
- Navegação entre questões

### ✅ Funcionalidades Melhoradas
- Segurança (validação no backend)
- Confiabilidade (fonte única de verdade)
- Auditoria (todas as tentativas registradas)
- Escalabilidade (fácil adicionar regras)

### ❌ Funcionalidades Removidas
- Cálculo local de pontos
- Validação local de resposta
- Conhecimento da resposta correta no frontend

### ⚠️ Funcionalidades Não Alteradas
- Ranking (mantém estrutura atual)
- Modelo Pergunta (sem mudanças)
- Base de dados (sem mudanças)

---

## Testes de Regressão

### Teste 1: Resposta Correta
```javascript
// Antes: Frontend calcula
// Depois: Backend calcula
// Resultado: Deve ser igual
```

### Teste 2: Resposta Incorreta
```javascript
// Antes: Frontend marca como incorreta
// Depois: Backend marca como incorreta
// Resultado: Deve ser igual
```

### Teste 3: Múltiplas Tentativas
```javascript
// Antes: Frontend soma pontos
// Depois: Backend soma pontos
// Resultado: Deve ser igual
```

---

## Conclusão

A refatoração remove toda a lógica de validação do frontend, centralizando-a no backend. Isso resulta em:

1. **Segurança**: Validação não pode ser burlada
2. **Confiabilidade**: Fonte única de verdade
3. **Manutenibilidade**: Lógica centralizada
4. **Escalabilidade**: Fácil adicionar regras
5. **Auditoria**: Todas as tentativas registradas

---

**Status**: ✅ Refatoração Completa
**Data**: 22 de Maio de 2026
**Versão**: 1.0
