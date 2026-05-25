# Instruções de Teste - Sistema de Tentativas Integrado

## 🎯 Objetivo

Validar que o sistema de tentativas está funcionando corretamente com o backend como autoridade única.

---

## ✅ Pré-requisitos

- [ ] Backend rodando em `http://localhost:3000`
- [ ] Frontend rodando em `http://localhost:5173`
- [ ] Usuário autenticado
- [ ] Inscrito em um torneio
- [ ] Questões carregadas no banco

---

## 🧪 Testes Manuais

### Teste 1: Resposta Correta

**Objetivo**: Verificar que resposta correta é validada e pontos são calculados

**Passos**:
1. Abrir página de teste
2. Selecionar disciplina (ex: Matemática)
3. Ler a primeira questão
4. Selecionar a resposta correta
5. Observar feedback

**Esperado**:
- ✓ Botão fica verde
- ✓ Ícone ✓ aparece
- ✓ Pontos aumentam (ex: +10)
- ✓ Acertos aumentam em 1
- ✓ Sidebar atualiza com novos valores

**Verificar no Console**:
```javascript
// Abrir DevTools (F12)
// Network tab
// Procurar por POST /api/tentativas
// Response deve ter:
{
  "sucesso": true,
  "tentativa": {
    "correta": true,
    "pontos_obtidos": 10
  }
}
```

---

### Teste 2: Resposta Incorreta

**Objetivo**: Verificar que resposta incorreta é detectada e pontos não são dados

**Passos**:
1. Selecionar disciplina
2. Ler a questão
3. Selecionar resposta ERRADA
4. Observar feedback

**Esperado**:
- ✗ Botão selecionado fica vermelho
- ✗ Ícone ✗ aparece
- ✓ Resposta correta fica verde (destacada)
- ✗ Pontos NÃO aumentam
- ✗ Erros aumentam em 1
- ✓ Sidebar atualiza

**Verificar no Console**:
```javascript
// Network tab → POST /api/tentativas
// Response deve ter:
{
  "sucesso": true,
  "tentativa": {
    "correta": false,
    "pontos_obtidos": 0,
    "resposta_correta": "A"  // ← Mostra resposta correta
  }
}
```

---

### Teste 3: Múltiplas Questões

**Objetivo**: Verificar que resumo é atualizado corretamente

**Passos**:
1. Responder 4 questões (ex: 3 corretas, 1 errada)
2. Observar sidebar após cada resposta
3. Ao final, verificar totais

**Esperado**:
- ✓ Acertos: 3
- ✓ Erros: 1
- ✓ Pontos: 30 (3 × 10)
- ✓ Total: 4

**Verificar no Console**:
```javascript
// Última resposta deve ter resumo:
{
  "resumo": {
    "total_acertos": 3,
    "total_pontos": 30,
    "total_questoes": 4
  }
}
```

---

### Teste 4: Progresso Visual

**Objetivo**: Verificar que progresso das questões é exibido corretamente

**Passos**:
1. Responder algumas questões
2. Observar os números na sidebar
3. Verificar cores (verde=correto, vermelho=errado)

**Esperado**:
- ✓ Números 1-4 aparecem
- ✓ Números respondidos ficam coloridos
- ✓ Número atual tem borda
- ✓ Números não respondidos ficam cinza

---

### Teste 5: Tempo Gasto

**Objetivo**: Verificar que tempo é registrado corretamente

**Passos**:
1. Responder uma questão
2. Abrir DevTools
3. Verificar tempo_gasto no request

**Esperado**:
```javascript
// POST /api/tentativas body:
{
  "tempo_gasto": 15  // ← Tempo em segundos
}
```

**Nota**: Tempo deve ser entre 0 e 30 segundos

---

### Teste 6: Histórico de Tentativas

**Objetivo**: Verificar que histórico é salvo corretamente

**Passos**:
1. Completar um teste (4 questões)
2. Abrir DevTools → Console
3. Executar:
```javascript
fetch('http://localhost:3000/api/tentativas/1/Matemática', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(d => console.log(d))
```

**Esperado**:
```javascript
{
  "sucesso": true,
  "tentativas": [
    {
      "id": 1,
      "questao_id": 1,
      "resposta_selecionada": "4",
      "resposta_correta": "4",
      "correta": true,
      "pontos_obtidos": 10,
      "tempo_gasto": 15
    },
    // ... mais tentativas
  ],
  "resumo": {
    "total_acertos": 3,
    "total_pontos": 30,
    "total_questoes": 4
  }
}
```

---

### Teste 7: Estatísticas

**Objetivo**: Verificar que estatísticas são calculadas corretamente

**Passos**:
1. Completar testes em múltiplas disciplinas
2. Abrir DevTools → Console
3. Executar:
```javascript
fetch('http://localhost:3000/api/tentativas/stats/1', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(d => console.log(d))
```

**Esperado**:
```javascript
{
  "sucesso": true,
  "estatisticas": {
    "Matemática": {
      "total_questoes": 4,
      "total_acertos": 3,
      "taxa_acerto": "75.00%",
      "total_pontos": 30,
      "tempo_total_segundos": 60
    },
    "Inglês": {
      "total_questoes": 4,
      "total_acertos": 2,
      "taxa_acerto": "50.00%",
      "total_pontos": 20,
      "tempo_total_segundos": 80
    }
  }
}
```

---

## 🔐 Testes de Segurança

### Teste 8: Sem Autenticação

**Objetivo**: Verificar que requisição sem token é rejeitada

**Passos**:
1. Abrir DevTools → Console
2. Executar:
```javascript
fetch('http://localhost:3000/api/tentativas', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
    // ← SEM Authorization
  },
  body: JSON.stringify({
    torneio_id: 1,
    disciplina_competida: 'Matemática',
    questao_id: 1,
    resposta_selecionada: 'A',
    tempo_gasto: 15
  })
})
.then(r => r.json())
.then(d => console.log(d))
```

**Esperado**:
```javascript
{
  "sucesso": false,
  "erro": "Usuário não autenticado"
}
// Status: 401
```

---

### Teste 9: Usuário Não Inscrito

**Objetivo**: Verificar que usuário não inscrito é rejeitado

**Passos**:
1. Abrir DevTools → Console
2. Executar:
```javascript
fetch('http://localhost:3000/api/tentativas', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({
    torneio_id: 999,  // ← Torneio que não está inscrito
    disciplina_competida: 'Matemática',
    questao_id: 1,
    resposta_selecionada: 'A',
    tempo_gasto: 15
  })
})
.then(r => r.json())
.then(d => console.log(d))
```

**Esperado**:
```javascript
{
  "sucesso": false,
  "erro": "Usuário não está inscrito neste torneio para esta disciplina"
}
// Status: 403
```

---

### Teste 10: Resposta Vazia

**Objetivo**: Verificar que resposta vazia é rejeitada

**Passos**:
1. Abrir DevTools → Console
2. Executar:
```javascript
fetch('http://localhost:3000/api/tentativas', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({
    torneio_id: 1,
    disciplina_competida: 'Matemática',
    questao_id: 1,
    resposta_selecionada: '',  // ← Vazia
    tempo_gasto: 15
  })
})
.then(r => r.json())
.then(d => console.log(d))
```

**Esperado**:
```javascript
{
  "sucesso": false,
  "erro": "Resposta não pode estar vazia"
}
// Status: 400
```

---

## 🐛 Testes de Bugs Comuns

### Teste 11: Resposta com Espaços

**Objetivo**: Verificar que espaços são ignorados

**Passos**:
1. Questão com resposta correta: "A"
2. Enviar resposta: "  A  " (com espaços)
3. Verificar se é considerada correta

**Esperado**:
```javascript
{
  "correta": true,
  "pontos_obtidos": 10
}
```

---

### Teste 12: Case-Insensitive

**Objetivo**: Verificar que maiúsculas/minúsculas são ignoradas

**Passos**:
1. Questão com resposta correta: "A"
2. Enviar resposta: "a" (minúscula)
3. Verificar se é considerada correta

**Esperado**:
```javascript
{
  "correta": true,
  "pontos_obtidos": 10
}
```

---

### Teste 13: Pontos Corretos

**Objetivo**: Verificar que pontos são calculados corretamente

**Passos**:
1. Verificar pontos da questão no banco
2. Responder corretamente
3. Verificar se pontos_obtidos = questao.pontos

**Esperado**:
```javascript
// Se questão tem 10 pontos:
{
  "pontos_obtidos": 10
}

// Se questão tem 15 pontos:
{
  "pontos_obtidos": 15
}
```

---

## 📊 Checklist de Testes

- [ ] Teste 1: Resposta Correta
- [ ] Teste 2: Resposta Incorreta
- [ ] Teste 3: Múltiplas Questões
- [ ] Teste 4: Progresso Visual
- [ ] Teste 5: Tempo Gasto
- [ ] Teste 6: Histórico
- [ ] Teste 7: Estatísticas
- [ ] Teste 8: Sem Autenticação
- [ ] Teste 9: Não Inscrito
- [ ] Teste 10: Resposta Vazia
- [ ] Teste 11: Espaços
- [ ] Teste 12: Case-Insensitive
- [ ] Teste 13: Pontos Corretos

---

## 🚨 Troubleshooting

### Problema: "Erro ao enviar resposta"

**Solução**:
1. Verificar se backend está rodando
2. Verificar se token é válido
3. Verificar console do backend para erros
4. Verificar Network tab para status HTTP

### Problema: Pontos não aumentam

**Solução**:
1. Verificar se resposta está correta
2. Verificar se questão tem pontos > 0
3. Verificar response do backend
4. Verificar se resumo está sendo atualizado

### Problema: Histórico vazio

**Solução**:
1. Verificar se tentativas foram salvas
2. Verificar se torneio_id está correto
3. Verificar se disciplina está correta
4. Verificar banco de dados

### Problema: Erro 401 Unauthorized

**Solução**:
1. Fazer login novamente
2. Verificar se token está em localStorage
3. Verificar se token não expirou
4. Limpar cache do navegador

---

## 📝 Relatório de Testes

Após completar todos os testes, preencher:

```
Data: ___/___/______
Testador: ________________

Testes Passados: ___/13
Testes Falhados: ___/13

Bugs Encontrados:
- [ ] Nenhum
- [ ] Listar abaixo:

1. ___________________________________
2. ___________________________________
3. ___________________________________

Observações:
_____________________________________
_____________________________________
_____________________________________

Status: [ ] APROVADO [ ] REPROVADO
```

---

## ✅ Conclusão

Se todos os testes passarem, o sistema está pronto para produção!

**Sistema de Tentativas Integrado com Sucesso! 🎉**
