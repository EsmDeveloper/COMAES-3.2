# 🔑 Localização da Chave de API - COMAES 3.2

## Chave de API Atual

### **GEMINI_API_KEY** (Google Generative AI)

**Valor Atual:**
```
AIzaSyDHw-wOzheIHexTLRLIl4ppZBzoCfK8dys
```

**Localização:**
```
BackEnd/.env
Linha 10: GEMINI_API_KEY=AIzaSyDHw-wOzheIHexTLRLIl4ppZBzoCfK8dys
```

## Onde é Usada

### 1. **Avaliação de Respostas de Torneios**
**Arquivo:** `BackEnd/services/iaEvaluators.js`

**Função:** Avalia respostas de estudantes nos torneios usando IA do Google Gemini

**Uso:**
```javascript
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
```

**Disciplinas Avaliadas:**
- ✅ Matemática - Avalia lógica e passos do raciocínio
- ✅ Programação - Avalia algoritmos e detecta hard-coding
- ✅ Inglês - Avalia clareza, coesão e lógica textual

**Pontuação por Nível:**
- Fácil: até 5 pontos
- Médio: até 10 pontos
- Difícil: até 20 pontos

### 2. **Chat de Suporte com IA**
**Arquivo:** `BackEnd/services/supportChatService.js`

**Função:** Chatbot de assistência para estudantes

**Uso:**
```javascript
const key = process.env.GEMINI_API_KEY;
if (!key) throw new Error('GEMINI_API_KEY não configurado no .env');
const _genAI = new GoogleGenerativeAI(key);
```

## Modelo de IA Utilizado

**Nome:** `gemini-2.5-flash`

**Configuração:**
```javascript
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash' 
});
```

**Parâmetros de Geração:**
- `temperature: 0` - Respostas determinísticas e consistentes
- `maxOutputTokens: 2048` - Limite de tokens na resposta

## Como Alterar a Chave

### Opção 1: Editar .env Diretamente
```bash
# Abrir o arquivo
notepad BackEnd/.env

# Alterar a linha:
GEMINI_API_KEY=SUA_NOVA_CHAVE_AQUI
```

### Opção 2: Usar Variável de Ambiente do Sistema (Windows)
```cmd
setx GEMINI_API_KEY "SUA_NOVA_CHAVE_AQUI"
```

### Após Alterar:
```bash
# Reiniciar o backend
cd BackEnd
npm start
```

## Como Obter Nova Chave

1. Acesse: https://aistudio.google.com/
2. Faça login com conta Google
3. Clique em "Get API Key"
4. Crie novo projeto ou selecione existente
5. Copie a chave gerada
6. Cole no arquivo `.env`

## Validação da Chave

### Teste 1: Verificar se está configurada
```bash
cd BackEnd
node -e "console.log(process.env.GEMINI_API_KEY ? '✅ Configurada' : '❌ Não configurada')"
```

### Teste 2: Diagnóstico Completo
```bash
cd BackEnd
node diagnose-support-api.js
```

**O que verifica:**
- ✅ Arquivo .env existe
- ✅ GEMINI_API_KEY está definida
- ✅ Chave é válida (testa com Google)
- ✅ Modelo está acessível
- ✅ Geração de conteúdo funciona

### Teste 3: Testar Avaliação de IA
```bash
cd BackEnd
node services/test-evaluation.js
```

## Segurança

### ⚠️ IMPORTANTE:
1. **NÃO commitar** o arquivo `.env` no Git
2. `.env` está no `.gitignore`
3. Chave é secreta - não compartilhar publicamente
4. Em produção, usar variáveis de ambiente do servidor

### Verificar se .env está no Git:
```bash
git status
# .env NÃO deve aparecer na lista
```

## Limites da API (Google Gemini Free Tier)

- **Requisições por minuto:** 60
- **Requisições por dia:** 1,500
- **Tokens por minuto:** 32,000

**Se atingir limite:**
```
Erro: RESOURCE_EXHAUSTED
Solução: Aguardar 1 minuto ou fazer upgrade para plano pago
```

## Arquivos Relacionados

### Backend:
- ✅ `BackEnd/.env` - Configuração da chave
- ✅ `BackEnd/services/iaEvaluators.js` - Avaliação de torneios
- ✅ `BackEnd/services/supportChatService.js` - Chat de suporte
- ✅ `BackEnd/diagnose-support-api.js` - Diagnóstico
- ✅ `BackEnd/test-support-api.js` - Teste manual

### Documentação:
- ✅ `SUPPORT_API_DOCUMENTATION.md` - Documentação do chat
- ✅ `DEPLOYMENT_GUIDE.md` - Guia de deploy
- ✅ `DOCUMENTACAO_COMPLETA_COMAES.md` - Documentação completa

## Status Atual

✅ **Chave configurada e funcional**
✅ **Avaliação de torneios operacional**
✅ **Chat de suporte operacional**

## Contato de Suporte

**Email da plataforma:** comaesplataform@gmail.com

## Data de Criação deste Documento
22 de Junho de 2026
