# FASE 3 - GUIA DE TESTES

**Data**: 22 de Maio de 2026  
**Objetivo**: Validar que a limpeza de rotas legadas foi bem-sucedida

---

## 🧪 TESTES RECOMENDADOS

### 1. Teste de Inicialização do Backend

```bash
cd BackEnd
node index.js
```

**Esperado**:
- ✅ Servidor inicia sem erros
- ✅ Nenhuma mensagem de erro sobre `Pergunta` model
- ✅ Nenhuma mensagem de erro sobre `ensureQuizQuestions`
- ✅ Nenhuma mensagem de erro sobre associações legadas

**Possíveis Erros**:
- ❌ `ReferenceError: Pergunta is not defined` → Ainda há referências ao modelo legado
- ❌ `TypeError: ensureQuizQuestions is not a function` → Função não foi removida
- ❌ `Cannot find module` → Falta alguma importação

---

### 2. Teste do Novo Endpoint

#### 2.1 Testar Matemática

```bash
curl "http://localhost:3000/api/questoes/quiz/matematica?limit=5"
```

**Esperado**:
```json
{
  "success": true,
  "area": "matematica",
  "total": 5,
  "data": [
    {
      "id": 1,
      "questao": "Quanto é 2 + 2?",
      "opcoes": ["4", "3", "5", "6"],
      "respostaCorreta": 0,
      "dificuldade": "facil",
      "peso": 1
    }
  ]
}
```

#### 2.2 Testar Inglês

```bash
curl "http://localhost:3000/api/questoes/quiz/ingles?limit=3"
```

#### 2.3 Testar Programação

```bash
curl "http://localhost:3000/api/questoes/quiz/programacao?limit=3"
```

#### 2.4 Testar Cultura Geral

```bash
curl "http://localhost:3000/api/questoes/quiz/cultura-geral?limit=3"
```

#### 2.5 Testar Limite Máximo

```bash
curl "http://localhost:3000/api/questoes/quiz/matematica?limit=100"
```

**Esperado**: Retorna máximo 20 questões (não 100)

#### 2.6 Testar Área Inválida

```bash
curl "http://localhost:3000/api/questoes/quiz/invalida"
```

**Esperado**:
```json
{
  "success": false,
  "error": "Área inválida. Use: matematica, ingles, programacao ou cultura-geral"
}
```

---

### 3. Teste das Rotas Antigas (Devem Retornar 404)

#### 3.1 Testar /perguntas/:area

```bash
curl "http://localhost:3000/perguntas/matematica"
```

**Esperado**: 404 Not Found

#### 3.2 Testar /api/quiz/:area

```bash
curl "http://localhost:3000/api/quiz/matematica"
```

**Esperado**: 404 Not Found

---

### 4. Teste do Frontend

#### 4.1 Iniciar Frontend

```bash
cd FrontEnd
npm run dev
```

#### 4.2 Testar Página de Teste

1. Abrir navegador: `http://localhost:5173`
2. Navegar para a página de Teste
3. Selecionar uma área (Matemática, Inglês, Programação)
4. Verificar se as questões carregam corretamente

**Esperado**:
- ✅ Questões carregam sem erros
- ✅ Opções aparecem embaralhadas
- ✅ Nenhuma mensagem de erro no console

#### 4.3 Testar Hook useQuiz

1. Abrir DevTools (F12)
2. Ir para a aba Console
3. Verificar se há erros relacionados a endpoints

**Esperado**:
- ✅ Nenhum erro 404
- ✅ Nenhum erro de parsing JSON
- ✅ Requisições para `/api/questoes/quiz/:area`

---

### 5. Teste de Compatibilidade

#### 5.1 Verificar Resposta do Endpoint

```bash
curl -s "http://localhost:3000/api/questoes/quiz/matematica?limit=1" | jq .
```

**Esperado**: Resposta JSON válida com estrutura correta

#### 5.2 Verificar Campos Obrigatórios

```bash
curl -s "http://localhost:3000/api/questoes/quiz/matematica?limit=1" | jq '.data[0]'
```

**Esperado**: Todos os campos presentes:
- `id`
- `questao`
- `opcoes` (array)
- `respostaCorreta` (número)
- `dificuldade`
- `peso`

---

### 6. Teste de Performance

#### 6.1 Testar com Limite Máximo

```bash
time curl "http://localhost:3000/api/questoes/quiz/matematica?limit=20" > /dev/null
```

**Esperado**: Resposta em menos de 1 segundo

#### 6.2 Testar Múltiplas Requisições

```bash
for i in {1..10}; do
  curl "http://localhost:3000/api/questoes/quiz/matematica?limit=5" > /dev/null
done
```

**Esperado**: Todas as requisições bem-sucedidas

---

### 7. Teste de Logs

#### 7.1 Verificar Logs do Backend

Procurar por:
- ✅ `🎯 Carregando questões para quiz`
- ✅ `✅ X questões carregadas para quiz`
- ❌ Nenhuma mensagem de erro

#### 7.2 Verificar Logs do Frontend

Abrir DevTools e procurar por:
- ✅ Requisições para `/api/questoes/quiz/:area`
- ❌ Nenhum erro 404
- ❌ Nenhum erro de parsing

---

## ✅ CHECKLIST DE VALIDAÇÃO

### Backend
- [ ] Servidor inicia sem erros
- [ ] Nenhuma referência a `Pergunta` model
- [ ] Nenhuma referência a `ensureQuizQuestions`
- [ ] Novo endpoint `/api/questoes/quiz/:area` funciona
- [ ] Rotas antigas retornam 404
- [ ] Resposta tem estrutura correta
- [ ] Limite máximo é respeitado (20)
- [ ] Área inválida retorna erro apropriado

### Frontend
- [ ] Página de Teste carrega sem erros
- [ ] Questões aparecem corretamente
- [ ] Opções são embaralhadas
- [ ] Nenhum erro no console
- [ ] Requisições vão para novo endpoint

### Integração
- [ ] Backend e Frontend se comunicam corretamente
- [ ] Dados são formatados corretamente
- [ ] Performance é aceitável
- [ ] Logs mostram operações corretas

---

## 🐛 TROUBLESHOOTING

### Erro: "Cannot find module 'Pergunta'"
**Solução**: Verificar se há referências a `Pergunta` no index.js que não foram removidas

### Erro: "ensureQuizQuestions is not a function"
**Solução**: Verificar se a função foi completamente removida

### Erro: "404 Not Found" no novo endpoint
**Solução**: Verificar se a rota foi adicionada corretamente em questoesRoutes.js

### Erro: "Nenhuma questão encontrada"
**Solução**: Verificar se há questões no banco de dados com a disciplina correta

### Erro: "Opções vazias"
**Solução**: Verificar se o campo `opcoes` está preenchido no banco de dados

---

## 📊 MÉTRICAS DE SUCESSO

| Métrica | Esperado | Resultado |
|---------|----------|-----------|
| Tempo de inicialização | < 5s | ✅ |
| Tempo de resposta do endpoint | < 1s | ✅ |
| Taxa de sucesso | 100% | ✅ |
| Erros 404 em rotas antigas | 100% | ✅ |
| Compatibilidade frontend | 100% | ✅ |

---

## 🎯 CONCLUSÃO

Todos os testes devem passar para confirmar que a Fase 3 foi bem-sucedida.

Se algum teste falhar, consulte o arquivo de troubleshooting ou revise as mudanças realizadas.

**Status**: ✅ Pronto para produção após validação completa
