# 🚀 Guia de Deployment - Sistema de Avaliação v2.0

## ✅ Checklist de Implementação

### 1. Validação Local (Antes de Deploy)

```bash
# 1. Verificar se os ficheiros foram criados/alterados
ls -la BackEnd/services/iaEvaluators.js
ls -la BackEnd/services/EVALUATION_CRITERIA.md
ls -la BackEnd/services/test-evaluation.js

# 2. Executar testes
cd BackEnd
node services/test-evaluation.js

# 3. Verificar sintaxe
npm run lint  # Se tiver eslint configurado
```

### 2. Configuração de Variáveis de Ambiente

```bash
# Adicionar ao ficheiro .env (BackEnd/.env)
GEMINI_API_KEY=AIza...  # Chave do Google Generative AI (Gemini)

# Verificar se está configurado
echo $GEMINI_API_KEY
```

### 3. Validação de Compatibilidade

✅ **Endpoint `/api/avaliar` - SEM MUDANÇAS**

- Entrada: Mesma (usuario_id, disciplina, respostas)
- Saída: Mesma estrutura (success, data, feedbacks)
- Backward compatible: Sim

✅ **Banco de Dados - SEM MUDANÇAS**

- Nenhuma alteração em tabelas
- Nenhuma migração necessária
- Estrutura existente funciona

⚠️ **Mudança de Comportamento**

- Scores agora são mais rigorosos
- Feedbacks mais detalhados
- Avaliação qualitativa vs. tamanho

### 4. Teste de Integração

```bash
# 1. Iniciar o servidor
npm run dev

# 2. Testar o endpoint (em outro terminal)
curl -X POST http://localhost:5000/api/avaliar \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 1,
    "disciplina": "Matemática",
    "respostas": [
      {
        "pergunta_id": 1,
        "texto": "Resolva: 2x + 3 = 7",
        "resposta": "2x = 7 - 3 = 4, x = 2",
        "nivel": "facil"
      }
    ]
  }'

# 3. Verificar resposta
# Esperado: { "success": true, "data": { ... }, "feedbacks": [...] }
```

### 5. Monitoramento Após Deploy

```bash
# Logs em tempo real
tail -f BackEnd/logs/server.log | grep -i "avaliacao\|evaluate"

# Verificar taxa de sucesso
grep "feedbacks" BackEnd/logs/server.log | wc -l

# Verificar erros de IA
grep -i "erro IA\|openai" BackEnd/logs/server.log
```

---

## 📋 Processo de Deployment

### Opção 1: Deployment Local (Desenvolvimento)

```bash
# 1. Parar o servidor atual (se estiver rodando)
# Ctrl+C no terminal onde npm run dev está ativo

# 2. Confirmação de ficheiros
git status
# Deve mostrar:
# - modified: BackEnd/services/iaEvaluators.js
# - new file: BackEnd/services/EVALUATION_CRITERIA.md
# - new file: BackEnd/services/test-evaluation.js

# 3. Reiniciar o servidor
npm run dev

# 4. Testar nova avaliação
# Acesse http://localhost:5173 (frontend)
# Submeta respostas para um torneio
# Verifique se os scores são mais rigorosos
```

### Opção 2: Deployment em Produção

```bash
# 1. Commit das alterações
git add BackEnd/services/iaEvaluators.js
git add BackEnd/services/EVALUATION_CRITERIA.md
git add BackEnd/services/test-evaluation.js
git add EVALUATION_CHANGES_SUMMARY.md

git commit -m "refactor: Update AI evaluation system with strict criteria (v2.0)

- Replace heuristic-based scoring with quality-based scoring
- Add discipline-specific prompts (Math, English, Programming)
- Implement partial credit system (0.0-1.0 scale)
- Upgrade to gpt-4-turbo for better accuracy
- Add detailed feedback for each evaluation

Fixes: IssueNumber (if applicable)
"

# 2. Push para repositório
git push origin main

# 3. Deploy no servidor de produção
# (Seu processo de CI/CD aqui)
```

---

## 🧪 Casos de Teste Importantes

### Caso 1: Resposta Totalmente Correta

```
Input:
- Disciplina: Matemática
- Questão: "Resolva: x + 5 = 10"
- Resposta: "x = 10 - 5 = 5"
- Nível: Fácil

Esperado:
- Score: 1.0
- Pontos: 5.0
- Feedback: "Resolução correta"
```

### Caso 2: Resposta com Erros Parciais

```
Input:
- Disciplina: Programação
- Questão: "Escreva função que dobra um número"
- Resposta: "function dobro(n) { return n * 2; }"
- Nível: Médio

Esperado:
- Score: 1.0 (correto, sem hard-coded)
- Pontos: 10.0
- Feedback: "Algoritmo correto e geral"
```

### Caso 3: Resposta Hard-coded

```
Input:
- Disciplina: Programação
- Questão: "Valide email"
- Resposta: "function validaEmail(e) { return e === 'user@gmail.com'; }"
- Nível: Médio

Esperado:
- Score: 0.0
- Pontos: 0.0
- Feedback: "Hard-coded para um caso específico"
```

### Caso 4: Redação com Erros Menores

```
Input:
- Disciplina: Inglês
- Questão: "Escreva sobre seu hobby favorito"
- Resposta: "My hoby is play football. I like very much it..."
- Nível: Fácil

Esperado:
- Score: 0.6-0.7 (conteúdo ok, erros gramaticais)
- Pontos: 3.0-3.5
- Feedback: "Conteúdo relevante, mas com erros gramaticais"
```

---

## ⚠️ Possíveis Problemas e Soluções

### Problema 1: API Key não configurada

```
Erro: OPENAI_API_KEY não definido
Solução:
  1. Adicione a chave ao ficheiro .env
  2. Reinicie o servidor
  3. Verifique: console.log(process.env.OPENAI_API_KEY.substring(0, 5))
```

### Problema 2: Scores parecem muito baixos

```
Solução:
  1. Isto é esperado! O novo sistema é mais rigoroso
  2. Antes: Tamanho era fator importante
  3. Agora: Apenas qualidade conta
  4. Execute testes para confirmar comportamento correto
```

### Problema 3: Erro "Não foi possível parsear JSON da IA"

```
Solução:
  1. A IA retornou formato inválido
  2. Tente novamente (pode ser timeout)
  3. Se persistir, mude para gpt-3.5-turbo temporariamente
  4. Reporte o erro
```

### Problema 4: Requests muito lentos

```
Solução:
  1. Isto é normal - gpt-4-turbo é mais lento que gpt-3.5
  2. Considere usar paralelização para múltiplas respostas
  3. Implemente cache de respostas similares
  4. Aumente o timeout em caso de necessário
```

---

## 📊 Métricas de Sucesso

Depois do deployment, verificar:

```
✅ Avaliações bem-sucedidas: > 95%
✅ Tempo médio de resposta: < 10 segundos
✅ Scores com distribuição mais realista: média 0.6-0.7
✅ Feedback detalhado em 100% das respostas
✅ Taxa de hard-coded detectado: > 90%
```

---

## 🔄 Rollback (em caso de problemas)

```bash
# 1. Reverter para versão anterior
git revert HEAD

# 2. Reiniciar servidor
npm run dev

# 3. Verificar que tudo funciona
# (Testes podem retornar scores antigos)

# 4. Investigar problema
# - Verificar logs
# - Testar com gpt-3.5-turbo
# - Reporte o erro
```

---

## 📞 Suporte

**Para questões sobre o deployment:**

1. Consulte `EVALUATION_CHANGES_SUMMARY.md`
2. Revise `BackEnd/services/EVALUATION_CRITERIA.md`
3. Execute `node services/test-evaluation.js`
4. Verifique os logs do servidor

**Para problemas técnicos:**

- Verifique a chave API OpenAI
- Tente com gpt-3.5-turbo como fallback
- Verifique conectividade de rede
- Reporte com logs completos

---

**Data de Deploy Recomendada:** Assim que possível (sem dependências)  
**Nível de Risco**: Baixo (backward compatible, sem mudanças de BD)  
**Tempo Estimado de Implementação**: 5-10 minutos
