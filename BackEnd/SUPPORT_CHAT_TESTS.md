# 🧪 Testes para o Novo Assistente com Perguntas Gerais

## Teste 1: Obter Nome do Utilizador (Primeira Mensagem)

**Pergunta:**
```
Olá, tudo bem?
```

**Resposta Esperada:**
```
Olá! Tudo bem sim! 
Qual é o seu nome? Gostaria de saber para personalizar nossa conversa.
```

---

## Teste 2: Responder com Nome (Mensagem Sobre COMAES)

**Histórico:** 
- User: "Olá, tudo bem?"
- Assistant: "Qual é o seu nome?"

**Pergunta:**
```
Meu nome é João
```

**Resposta Esperada:**
```
Prazer em conhecê-lo, João! 
[Qualquer resposta amigável usando o nome]
```

---

## Teste 3: Pergunta Geral Após Obter Nome

**Histórico:**
- User: "Olá"
- Assistant: "Qual é seu nome?"
- User: "Meu nome é Maria"
- Assistant: "Prazer, Maria!"

**Pergunta:**
```
Que dia é hoje?
```

**Resposta Esperada:**
```
Ótimo, Maria! Hoje é [data do dia]. 
[Informação adicional relevante]
```

✅ **Note**: Usando o nome da utilizadora

---

## Teste 4: Pergunta Sobre COMAES

**Pergunta:**
```
Como funciona o ranking da COMAES?
```

**Resposta Esperada:**
```
Ótimo [Nome], ótima pergunta sobre o ranking da COMAES!

O ranking é calculado com base na pontuação total obtida nas respostas:
- Questões difíceis valem mais pontos que questões fáceis
- É atualizado em tempo real durante o torneio
- Você pode visualizar o ranking global e por disciplina
```

---

## Teste 5: Pergunta Geral (Matemática)

**Pergunta:**
```
Qual é o resultado de 25 × 4?
```

**Resposta Esperada:**
```
Ótimo [Nome], a resposta é bem simples:

25 × 4 = 100

É uma multiplicação direta onde 4 vezes 25 é 100.
```

---

## Teste 6: Pergunta Fora do Escopo (Agora Permitida)

**Pergunta:**
```
Como fazer um bolo de chocolate?
```

**Resposta Esperada:**
```
Ótimo [Nome], aqui está uma receita básica de bolo de chocolate:

[Receita]

Se tiver dúvidas sobre a COMAES, ficarei feliz em ajudar! 😊
```

---

## Como Executar os Testes

### Via cURL:

```bash
# 1. Obter token JWT
TOKEN="seu_jwt_token_aqui"

# 2. Teste 1
curl -X POST http://localhost:3002/api/support/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Olá, tudo bem?","history":[]}'

# 3. Teste 2
curl -X POST http://localhost:3002/api/support/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message":"Meu nome é João",
    "history":[
      {"role":"user","parts":[{"text":"Olá, tudo bem?"}]},
      {"role":"model","parts":[{"text":"Qual é o seu nome?"}]}
    ]
  }'

# 4. Teste 3 (Pergunta Geral)
curl -X POST http://localhost:3002/api/support/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message":"Que dia é hoje?",
    "history":[
      {"role":"user","parts":[{"text":"Olá"}]},
      {"role":"model","parts":[{"text":"Qual é seu nome?"}]},
      {"role":"user","parts":[{"text":"Meu nome é Maria"}]},
      {"role":"model","parts":[{"text":"Prazer, Maria!"}]}
    ]
  }'
```

### Via Frontend:

1. Abra http://localhost:5175 (ou URL do frontend)
2. Login na sua conta
3. Abra o chat de suporte (botão no canto inferior direito)
4. Teste as perguntas na aba "Chat IA"

---

## Checklist de Verificação

- [ ] Assistente pede nome na primeira mensagem
- [ ] Assistente usa o nome nas respostas subsequentes
- [ ] Assistente responde perguntas sobre COMAES corretamente
- [ ] Assistente responde perguntas gerais (data, matemática, etc.)
- [ ] Tom é amigável em todas as respostas
- [ ] Respostas são concisas (máx. 250 palavras)
- [ ] Prioriza informações de COMAES quando relevante

---

**Última Atualização**: 2026-06-22
**Status**: ✅ Pronto para Testes
