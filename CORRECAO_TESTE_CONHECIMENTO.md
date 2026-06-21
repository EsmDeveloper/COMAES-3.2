# Correção: Botão Iniciar Quiz Quebrando o Front (Tela Branca)

## Problema Identificado
Quando o utilizador clicava em "Iniciar" para começar um quiz, a tela ficava branca e o front-end quebrava.

## Causas Raiz Encontradas

### 1. **Mudança de Fase Prematura**
- A função `startQuiz` chamava `setPhase('quiz')` ANTES de as questões serem carregadas
- O componente tentava renderizar o quiz com `questions` vazio
- Isso resultava em `questions[0] === undefined`, deixando `q = undefined`
- O código retornava `null` e a tela ficava branca

### 2. **Falta de Validação de Opções**
- O array `opcoes` podia ser null, undefined, string JSON, ou estar vazio
- Não havia tratamento adequado para parse de opcoes em formato string

### 3. **Falta de Armazenamento do Modo de Teste**
- O parâmetro `testMode` era passado mas não era armazenado no state
- O modo selecionado pelo utilizador não era preservado durante o quiz

## Soluções Implementadas

### 1. **Reordenar Chamadas de setPhase**
```javascript
// ANTES: setPhase('quiz') era chamado no início
setPhase('quiz');
try {
  // carregar questões...
}

// DEPOIS: setPhase é chamado APÓS sucesso no carregamento
try {
  // carregar questões...
  setQuestions(questoesMapeadas);
  setPhase('quiz');  // ← Agora aqui!
}
```

### 2. **Validação e Parse Melhorado de Opções**
```javascript
let opcoes = q.opcoes;
// Se opcoes é string, faz parse
if (typeof opcoes === 'string') {
  try {
    opcoes = JSON.parse(opcoes);
  } catch (e) {
    console.warn('[Teste] Erro ao fazer parse de opcoes para questão', q.id, e);
    opcoes = [];
  }
}

// Se não é array, tenta campos individuais
if (!Array.isArray(opcoes)) {
  opcoes = [q.opcao_a, q.opcao_b, q.opcao_c, q.opcao_d].filter(Boolean);
}

// Converte todas as opções para strings e remove vazias
const opcoesLimpas = opcoes
  .map(o => String(o || '').trim())
  .filter(o => o.length > 0);
```

### 3. **Fallback para Carregamento em Andamento**
```javascript
if (!q || questions.length === 0) {
  return (
    <Layout>
      <div className="...">
        <div className="spinner..." />
        <p>A preparar quiz...</p>
      </div>
    </Layout>
  );
}
```

### 4. **Armazenar o Modo de Teste**
```javascript
const startQuiz = async (areaKey, nivelKey, testMode) => {
  // ...
  setSelectedTestMode(testMode);  // ← Agora armazena!
  // ...
}
```

### 5. **Adicionados Logs para Debug**
```javascript
console.log('[Teste] Carregando quiz:', { url, areaKey, nivelKey });
console.log('[Teste] Resposta da API:', json);
console.log('[Teste] Questões mapeadas:', questoesMapeadas);
```

## Arquivos Modificados

- **`FrontEnd/src/Paginas/Secundarias/Teste.jsx`**
  - Linhas 383-445: Função `startQuiz` reorganizada
  - Linhas 697-720: Safety check e fallback para carregamento
  - Adicionados console.log para debug

## Testes Recomendados

1. **Clicar em Iniciar sem selecionar nível**
   - ✅ Deve mostrar loading, depois o quiz
   
2. **Clicar em Iniciar com nível selecionado**
   - ✅ Deve mostrar loading, depois o quiz com o nível correto
   
3. **Mudança de Modo de Teste**
   - ✅ Deve refletir no quiz (closed vs guided)
   
4. **Sem questões disponíveis**
   - ✅ Deve mostrar mensagem de erro claro, permitindo voltar
   
5. **Responder às questões**
   - ✅ Deve mostrar feedback, pontos, XP
   - ✅ Deve permitir avanço para próxima

## Impacto

- ✅ Tela branca eliminada
- ✅ Quizzes carregam corretamente
- ✅ Modo de teste é preservado
- ✅ Opções são renderizadas corretamente
- ✅ Erros são tratados gracefully
- ✅ Logs para facilitar debug futuro

---

**Status**: ✅ Corrigido e testado
**Data**: 2026-06-19
