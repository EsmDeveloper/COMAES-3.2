# Critérios de Avaliação com IA - Versão Melhorada

## 📋 Visão Geral

Este documento descreve os novos critérios rigorosos de avaliação implementados no serviço `iaEvaluators.js`. O sistema foi reformulado para avaliar a **qualidade e correção do conteúdo**, e não o tamanho das respostas.

---

## 1️⃣ Regras Gerais (Aplicáveis a Todas as Disciplinas)

### Resposta Completamente Correta

- **Score**: 1.0 (100%)
- **Critério**: Todos os passos/componentes estão corretos
- **Pontos**: Máximo baseado no nível (Fácil: 5, Médio: 10, Difícil: 20)

### Resposta com Erros (Parcial)

- **Score**: 0.1 a 0.9 (proporcional aos passos corretos)
- **Critério**: Pelo menos um passo está correto, mostrando compreensão parcial
- **Pontos**: Calculado proporcionalmente aos passos corretos

### Resposta Totalmente Errada ou Fora de Contexto

- **Score**: 0.0
- **Critério**: Nenhum passo correto ou resposta irrelevante
- **Pontos**: 0

### ⚠️ O que NÃO será avaliado

- ❌ Tamanho do texto/código
- ❌ Número de linhas
- ❌ Quantidade de palavras
- ❌ Comprimento da resposta

---

## 2️⃣ Matemática

### Fonte de Questões

- Tabela: `questoes_matematica`

### Critérios de Avaliação

#### ✅ Resposta Totalmente Correta (Score 1.0)

- Resultado final está 100% correto
- **TODOS** os passos intermediários estão corretos
- Todos os cálculos estão visíveis e corretos
- Fórmulas aplicadas corretamente
- Lógica matemática clara

**Exemplos de feedback:**

- "Resolução perfeita com todos os passos corretos"
- "Cálculos corretos, resultado final exato"

#### ⚠️ Resposta com Erros Parciais (Score 0.1-0.9)

- Pelo menos um passo intermediário está correto
- Demonstra compreensão parcial do problema
- Alguns cálculos errados, mas a abordagem é válida

**Exemplo:**

- 2 passos corretos de 5 totais = Score ~0.4

**Feedback deve incluir:**

- "Passos 1 e 2 corretos. Passos 3 e 4 com erros de cálculo. Passo 5 incorreto."

#### ❌ Resposta Totalmente Errada (Score 0.0)

- Nenhum passo correto
- Fórmula errada aplicada
- Resultado final completamente incorreto
- Resposta fora de contexto

---

## 3️⃣ Inglês

### Fonte de Questões

- Tabela: `questoes_ingles`

### Critérios de Avaliação

#### ✅ Resposta Totalmente Correta (Score 1.0)

- Redação gramaticalmente correta (sem erros)
- Atende perfeitamente ao solicitado:
  - ✓ Tema adequado
  - ✓ Estrutura clara
  - ✓ Coesão entre parágrafos
- Vocabulário apropriado
- Todos os argumentos/ideias estão corretos e claros

**Exemplos de feedback:**

- "Redação excelente, gramaticalmente correta, tema bem desenvolvido"
- "Estrutura clara, coesão perfeita, vocabulário apropriado"

#### ⚠️ Resposta com Erros Parciais (Score 0.1-0.9)

- Apresenta pelo menos um trecho coerente e relevante
- Demonstra compreensão do tema
- Tem erros gramaticais/estruturais, mas conteúdo válido
- Alguns trechos com problemas, outros corretos

**Exemplo:**

- 3 parágrafos: 1 perfeito, 1 com pequenos erros, 1 com erros significativos = Score ~0.5

**Feedback deve incluir:**

- "Parágrafo 1 está bem. Parágrafo 2 tem 2 erros gramaticais. Parágrafo 3 falta coesão."

#### ❌ Resposta Totalmente Errada (Score 0.0)

- Nenhum trecho coerente
- Não compreende o tema
- Erros gramaticais graves em toda a resposta
- Resposta fora de contexto

---

## 4️⃣ Programação

### Fonte de Questões

- Tabela: `questoes_programacao`

### Critérios de Avaliação

#### ✅ Resposta Totalmente Correta (Score 1.0)

- Algoritmo resolve **corretamente** o problema proposto
- Todos os passos da lógica estão corretos:
  - ✓ Entrada de dados
  - ✓ Processamento
  - ✓ Saída
  - ✓ Estruturas de controle bem formuladas
- Sem hard-coded ou respostas pré-definidas
- Solução é **geral**, funciona para todos os casos

**Exemplos de feedback:**

- "Algoritmo perfeito, todos os componentes funcionam"
- "Entrada correta, processamento lógico, saída esperada"

#### ⚠️ Resposta com Erros Parciais (Score 0.1-0.9)

- Pelo menos um passo lógico está correto
- Exemplos:
  - ✓ Leitura de dados correta, mas lógica final incorreta
  - ✓ Loop bem estruturado, mas condição errada
  - ✓ Processamento parcial correto
- Lógica final pode estar incorreta
- Pode ter hard-coded parcial

**Exemplo:**

- Entrada correta (1 componente), processamento errado (1 componente), saída errada (1 componente)
- Score = 1/3 ≈ 0.33

**Feedback deve incluir:**

- "Entrada correta. Processamento com erro: loop infinito. Saída não alcançada."

#### ❌ Resposta Totalmente Errada (Score 0.0)

- Nenhum componente lógico correto
- Algoritmo completamente hard-coded
- Solução específica para um caso único
- Resposta fora de contexto

---

## 5️⃣ Exemplo Prático de Avaliação

### Matemática - Equação de Segundo Grau

**Questão:** Resolva: 2x² + 5x - 3 = 0

**Resposta do Aluno:**

```
Passo 1: a=2, b=5, c=-3
Passo 2: Δ = b² - 4ac = 25 - 4(2)(-3) = 25 + 24 = 49 ✓
Passo 3: x = (-5 ± √49) / (2·2) = (-5 ± 7) / 4
Passo 4: x₁ = (-5 + 7) / 4 = 2/4 = 0.5 ✓
Passo 5: x₂ = (-5 - 7) / 4 = -12/4 = -3 ✓
```

**Avaliação:** ✅ Score 1.0 (Todos os 5 passos corretos)

---

### Programação - Validação de Email

**Questão:** Escreva um algoritmo que valida se um email tem formato correto

**Resposta Ruim (Hard-coded):**

```javascript
function validaEmail(email) {
  return email === "usuario@gmail.com"; // Hard-coded para um caso específico
}
```

**Score:** 0.0 - Solução específica, não geral

**Resposta Parcial:**

```javascript
function validaEmail(email) {
  if (email.includes("@")) {
    // ✓ Componente 1 correto
    const dominio = email.split("@")[1]; // ✓ Componente 2 correto
    if (dominio.includes(".")) {
      return true; // ✗ Falta validar sufixo válido
    }
  }
  return false;
}
```

**Score:** ~0.6 - 2 componentes corretos de 3

**Resposta Completa:**

```javascript
function validaEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email); // ✓ Validação geral e completa
}
```

**Score:** 1.0 - Solução correta e geral

---

## 6️⃣ Implementação Técnica

### Função: `evaluate(disciplina, items)`

**Entrada:**

```javascript
{
  disciplina: "Matemática" | "Inglês" | "Programação",
  items: [
    {
      pergunta_id: 1,
      texto: "enunciado da questão",
      resposta: "resposta do aluno",
      nivel: "facil" | "medio" | "dificil"
    }
  ]
}
```

**Saída:**

```javascript
[
  {
    pergunta_id: 1,
    score: 0.8,
    pontos: 8.0, // score * nivelMax
    feedback: "Explicação detalhada do que foi avaliado",
    evidencias: "Detalhes técnicos específicos",
  },
];
```

### Modelo de IA Recomendado

- **Preferência**: `gpt-4-turbo` para melhor qualidade
- **Fallback**: `gpt-3.5-turbo` se gpt-4 falhar
- **Temperature**: 0 (determinístico)
- **Max Tokens**: 1000

---

## 7️⃣ Logs e Debugging

O sistema registra:

- ✅ Avaliações bem-sucedidas
- ⚠️ Falhas de conexão com OpenAI
- ❌ Erros de parsing JSON
- 📊 Scores e pontos calculados

**Exemplo de log:**

```
[INFO] Avaliação de 3 questões para Programação
[DEBUG] Score para pergunta_id 1: 0.8 (pontos: 12.0)
[DEBUG] Score para pergunta_id 2: 0.0 (pontos: 0.0)
[DEBUG] Score para pergunta_id 3: 0.5 (pontos: 5.0)
```

---

## 8️⃣ Changelog

### Versão 2.0 (Nova)

- ✅ Prompts rigorosos e específicos por disciplina
- ✅ Avaliação baseada em qualidade, não em tamanho
- ✅ Suporte a avaliação parcial com feedback detalhado
- ✅ Melhor tratamento de erros
- ✅ Logging aprimorado

### Versão 1.0 (Antiga - Descontinuada)

- ❌ Avaliação baseada em tamanho de texto
- ❌ Prompts genéricos
- ❌ Sem feedback detalhado
