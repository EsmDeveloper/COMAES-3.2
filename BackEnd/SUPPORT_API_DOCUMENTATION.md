# 🤖 API de Suporte da COMAES - Documentação & Testes

## ✅ Status da API

- **Endpoint**: `POST /api/support/chat`
- **Base URL**: `http://localhost:3002`
- **Autenticação**: JWT Bearer Token (obrigatório)
- **Content-Type**: `application/json`
- **Status**: ✅ **FUNCIONAL** (prompts atualizados com informações completas do projeto)

---

## 📍 Endpoints

### 1. Chat com IA (`POST /api/support/chat`)

Envia uma mensagem ao assistente e recebe uma resposta baseada em conhecimento sobre a COMAES.

**URL**: `http://localhost:3002/api/support/chat`

**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

**Body**:
```json
{
  "message": "Como funciona o ranking?",
  "history": [
    {
      "role": "user",
      "parts": [{"text": "Olá"}]
    },
    {
      "role": "model",
      "parts": [{"text": "Olá! Sou o assistente da COMAES..."}]
    }
  ]
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "response": "O ranking é calculado com base na pontuação total obtida nas respostas..."
}
```

**Response (Error - 429)**:
```json
{
  "success": false,
  "error": "Muitas requisições. Aguarde um momento antes de enviar outra mensagem."
}
```

**Response (Error - 503)**:
```json
{
  "success": false,
  "error": "Serviço indisponível. Tente novamente mais tarde.",
  "debug": "GEMINI_API_KEY não configurado no .env"
}
```

---

## 🧪 Como Testar

### Opção 1: Usando cURL

```bash
# 1. Obtenha um token JWT (faça login primeiro)
TOKEN="seu_jwt_token_aqui"

# 2. Teste a API
curl -X POST http://localhost:3002/api/support/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "Como participo de um torneio?",
    "history": []
  }'
```

### Opção 2: Usando Node.js

```bash
# Prepare o token JWT
export JWT_TOKEN="seu_jwt_token_aqui"

# Execute o script de teste
node test-support-api.js "$JWT_TOKEN" "Como funciona a gamificação?"
```

### Opção 3: Usando o Frontend

1. Acesse a página Home do aplicativo
2. Abra o botão de Suporte (canto inferior direito)
3. Escreva uma pergunta na aba "Chat IA"
4. Aguarde a resposta

---

## 📋 Informações que o Assistente Conhece

O assistente foi **treinado com informações completas da COMAES**, incluindo:

### 1. **Sobre a Plataforma**
- Missão: Automatizar gestão de competições educativas
- Desenvolvido no IPIL (Instituto Politécnico Industrial de Luanda)
- Foco: Autoconhecimento do estudante

### 2. **Torneios**
- Como criar (apenas admins)
- Como participar (estudantes)
- Disciplinas: Matemática, Inglês, Programação
- Fases: Inscrição e Competição

### 3. **Perfis de Utilizador**
- **Estudante**: Participar de torneios, ver ranking, obter certificados
- **Colaborador**: Criar e gerir questões (com aprovação)
- **Administrador**: Criar torneios, gerir utilizadores, emitir certificados

### 4. **Certificados**
- Emitidos automaticamente para top 3
- Validação online com código único
- Formato PDF

### 5. **Avaliação por IA**
- Modelos: Gemini Flash-2.5 e GPT-3.5 Turbo
- Precisão: Correlação 0,91 com avaliação humana
- Disciplinas com diferentes precisões

### 6. **Gamificação**
- Pontos por resposta
- Níveis: Iniciante, Intermediário, Avançado
- Conquistas e rankings em tempo real

### 7. **Ranking**
- Baseado em pontuação total
- Atualizado em tempo real
- Questões difíceis valem mais pontos

---

## 🔧 Configuração Necessária

### Variáveis de Ambiente (`.env`)

```
# Obrigatório para API de Suporte
GEMINI_API_KEY=AIzaSyDHw-wOzheIHexTLRLIl4ppZBzoCfK8dys

# Outras configurações
PORT=3002
JWT_SECRET=comaes_jwt_secret_2026
```

---

## ⚠️ Troubleshooting

### Erro: "Serviço indisponível"

**Causa**: Problema com API do Gemini

**Solução**:
1. Verifique se `GEMINI_API_KEY` está configurada em `.env`
2. Teste a chave diretamente com a Google AI Studio
3. Verifique se a chave não expirou

```bash
# Teste manualmente:
echo $GEMINI_API_KEY  # Deve exibir a chave
```

### Erro: "Muitas requisições"

**Causa**: Rate limiting ativado (máx. 10 requisições por minuto por utilizador)

**Solução**: Aguarde 1 minuto antes de enviar outra mensagem

### Erro: "Mensagem inválida"

**Causa**: 
- Mensagem vazia ou muito longa (máx. 500 caracteres)
- Campo `message` não fornecido

**Solução**:
```json
{
  "message": "Sua pergunta aqui",  // Obrigatório
  "history": []                     // Opcional
}
```

### Erro: 401 Unauthorized

**Causa**: Token JWT inválido ou expirado

**Solução**:
1. Faça login novamente para obter novo token
2. Verifique se o `Authorization` header está correto
3. Formato correto: `Authorization: Bearer <token>`

---

## 📊 Limite de Taxa (Rate Limiting)

- **Máximo**: 10 requisições por minuto por utilizador
- **Janela**: 60 segundos
- **Resposta**: HTTP 429 quando excedido

---

## 🔐 Segurança

- ✅ Autenticação JWT obrigatória
- ✅ Rate limiting implementado
- ✅ Validação de entrada (tamanho máximo 500 caracteres)
- ✅ Histórico limitado a 6 mensagens (3 trocas) para evitar desvios
- ✅ Temperatura baixa (0.3) para respostas determinísticas

---

## 📝 Prompt do Sistema (SYSTEM_PROMPT)

O assistente segue um sistema de prompt detalhado que:

1. **Restringe o escopo** apenas a tópicos da COMAES
2. **Fornece informações específicas** sobre cada funcionalidade
3. **Define comportamentos** (língua, concisão, formato)
4. **Rejeita perguntas fora do escopo** com resposta padrão

```
"Você é o assistente virtual oficial da plataforma COMAES..."
[+120 linhas de contexto detalhado]
```

---

## 🚀 Próximos Passos (Sugestões)

1. **Adicionar persistência**: Salvar conversas em base de dados
2. **Melhorar contexto**: Incluir FAQ adicional específica por problema
3. **Análise de sentimento**: Detectar frustração e escalar para suporte humano
4. **Multilíngue**: Suportar inglês e outras línguas
5. **Treino customizado**: Fine-tuning com dados reais de perguntas dos utilizadores

---

**Última atualização**: 2026-06-22
**Status**: ✅ Totalmente Funcional
**Modelo IA**: Gemini Flash-2.5
**Documentação**: Completa
