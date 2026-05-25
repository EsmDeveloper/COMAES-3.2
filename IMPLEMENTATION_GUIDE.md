# 🚀 Guia de Implementação - Sistema de Tentativas Integrado

## 📌 Resumo Executivo

O sistema de tentativas foi refatorado para remover toda a lógica de validação do frontend. Agora:
- **Frontend**: Interface + Exibição de feedback
- **Backend**: Validação + Cálculo de pontos + Persistência

---

## 🔧 Arquivos Modificados

### 1. `FrontEnd/src/Paginas/Secundarias/Teste.jsx`

**Mudanças principais:**
- ✅ Importado `enviarTentativa` do serviço
- ✅ Removido cálculo de `correctIndex`
- ✅ Removido `timeStarted` (não utilizado)
- ✅ `handleAnswerSelect` agora usa o serviço
- ✅ Sem validação local de resposta

**Antes:**
```javascript
// Validação local
const correta = respostaSelecionadaNormalizada === respostaCorretaNormalizada;
const pontosObtidos = correta ? questao.pontos : 0;
```

**Depois:**
```javascript
// Apenas envia para backend
const result = await enviarTentativa({...});
const tentativa = result.tentativa; // Backend retorna validação
```

---

### 2. `FrontEnd/src/services/tentativasService.js` (NOVO)

**Arquivo criado com:**
- `enviarTentativa()` - POST /api/tentativas
- `obterHistorico()` - GET /api/tentativas/:torneio_id/:disciplina
- `obterEstatisticas()` - GET /api/tentativas/stats/:torneio_id

**Responsabilidades:**
- Centralizar comunicação com backend
- Gerenciar autenticação (token)
- Tratamento de erros
- Documentação JSDoc

---

## 📡 Fluxo de Comunicação

### Passo 1: Usuário Seleciona Resposta
```javascript
// Em Teste.jsx
const handleAnswerSelect = async (optionIndex) => {
  const selectedOption = currentQ.options[optionIndex];
  const tempoGasto = 30 - timeLeft;
  
  // Enviar para backend
  const result = await enviarTentativa({
    torneio_id: 1,
    disciplina_competida: 'Matemática',
    questao_id: 45,
    resposta_selecionada: selectedOption,
    tempo_gasto: tempoGasto
  });
}
```

### Passo 2: Backend Processa
```javascript
// Em BackEnd/controllers/TentativasController.js
export const salvarTentativa = async (req, res) => {
  // 1. Validações
  // 2. Buscar resposta correta
  // 3. Comparar respostas
  // 4. Calcular pontos
  // 5. Salvar em BD
  // 6. Retornar resultado
}
```

### Passo 3: Frontend Recebe Resultado
```javascript
// Backend retorna
{
  sucesso: true,
  tentativa: {
    correta: true,
    pontos_obtidos: 10,
    resposta_correta: "B"
  },
  resumo: {
    total_acertos: 3,
    total_pontos: 30,
    total_questoes: 5
  }
}

// Frontend atualiza UI
setScore(resumo.total_pontos);
setCorrectAnswers(resumo.total_acertos);
```

---

## 🔐 Segurança Implementada

### Backend Valida:
- ✅ Usuário autenticado
- ✅ Usuário inscrito no torneio
- ✅ Disciplina válida
- ✅ Questão existe
- ✅ Resposta correta (não confia no frontend)

### Frontend Não Faz:
- ❌ Validação de resposta
- ❌ Cálculo de pontos
- ❌ Comparação de respostas
- ❌ Lógica de negócio

---

## 📊 Estrutura de Dados

### Request (Frontend → Backend)
```javascript
{
  torneio_id: number,           // ID do torneio
  disciplina_competida: string, // "Matemática" | "Inglês" | "Programação"
  questao_id: number,           // ID da questão
  resposta_selecionada: string, // Resposta do usuário
  tempo_gasto: number           // Segundos gastos
}
```

### Response (Backend → Frontend)
```javascript
{
  sucesso: boolean,
  tentativa: {
    id: number,
    questao_id: number,
    correta: boolean,
    pontos_obtidos: number,
    resposta_correta: string,
    resposta_selecionada: string
  },
  resumo: {
    total_acertos: number,
    total_pontos: number,
    total_questoes: number
  }
}
```

---

## 🧪 Como Testar

### Teste 1: Resposta Correta
```bash
# 1. Abrir DevTools (F12)
# 2. Ir para aba Network
# 3. Selecionar resposta correta
# 4. Verificar POST /api/tentativas
# 5. Response deve ter correta: true
# 6. UI deve exibir feedback verde
```

### Teste 2: Resposta Incorreta
```bash
# 1. Selecionar resposta incorreta
# 2. Verificar POST /api/tentativas
# 3. Response deve ter correta: false
# 4. UI deve exibir feedback vermelho
# 5. Resposta correta deve ser mostrada
```

### Teste 3: Múltiplas Tentativas
```bash
# 1. Responder 3 questões
# 2. Verificar se total_acertos está correto
# 3. Verificar se total_pontos está correto
# 4. Verificar se total_questoes está correto
```

---

## 🐛 Troubleshooting

### Erro: "Token não encontrado"
**Causa**: Usuário não autenticado
**Solução**: Fazer login antes de responder

### Erro: "Usuário não está inscrito"
**Causa**: Usuário não inscrito no torneio
**Solução**: Inscrever usuário no torneio

### Erro: "Questão não encontrada"
**Causa**: questao_id inválido
**Solução**: Verificar se questão existe no banco

### Erro: "Disciplina inválida"
**Causa**: disciplina_competida incorreta
**Solução**: Usar "Matemática", "Inglês" ou "Programação"

---

## 📈 Monitoramento

### Logs Recomendados

**Frontend:**
```javascript
console.log('Enviando tentativa:', tentativa);
console.log('Resposta do backend:', result);
console.log('Erro ao enviar:', error);
```

**Backend:**
```javascript
console.log('Tentativa recebida:', req.body);
console.log('Resposta correta:', respostaCorreta);
console.log('Tentativa salva:', tentativa);
```

---

## 🔄 Fluxo Completo de Uma Sessão

```
1. Usuário faz login
   ↓
2. Vai para página de testes
   ↓
3. Seleciona disciplina
   ↓
4. Questões são carregadas (sem resposta correta)
   ↓
5. Usuário seleciona resposta
   ↓
6. Frontend envia para backend
   ↓
7. Backend valida e calcula
   ↓
8. Backend retorna resultado
   ↓
9. Frontend exibe feedback
   ↓
10. Próxima questão ou finalizar
```

---

## 📝 Checklist de Implementação

- [x] Arquivo `tentativasService.js` criado
- [x] `Teste.jsx` importa o serviço
- [x] `handleAnswerSelect` usa o serviço
- [x] Removida lógica de validação local
- [x] Removida lógica de cálculo de pontos
- [x] Backend valida resposta
- [x] Backend calcula pontos
- [x] Frontend exibe feedback visual
- [x] Testes manuais recomendados
- [x] Documentação completa

---

## 🚀 Próximos Passos

1. **Testes Manuais**: Executar testes recomendados
2. **Testes Automatizados**: Criar testes unitários
3. **Monitoramento**: Verificar logs do backend
4. **Otimização**: Adicionar cache se necessário
5. **Expansão**: Implementar histórico e estatísticas

---

## 📚 Referências

- Backend: `BackEnd/controllers/TentativasController.js`
- Rotas: `BackEnd/routes/tentativasRoutes.js`
- Modelo: `BackEnd/models/TentativaResposta.js`
- Serviço: `FrontEnd/src/services/tentativasService.js`
- Componente: `FrontEnd/src/Paginas/Secundarias/Teste.jsx`

---

**Status**: ✅ Implementação Completa
**Data**: 22 de Maio de 2026
**Versão**: 1.0
