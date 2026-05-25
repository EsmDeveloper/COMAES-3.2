# Checklist de Testes - Integração Frontend-Backend

## 🧪 Testes Funcionais

### 1. Autenticação
- [ ] Usuário não autenticado vê tela de login
- [ ] Usuário autenticado acessa seleção de disciplinas
- [ ] Token é enviado corretamente no header

### 2. Seleção de Disciplina
- [ ] Clique em "Matemática" carrega questões
- [ ] Clique em "Inglês" carrega questões
- [ ] Clique em "Programação" carrega questões
- [ ] Contador de questões é exibido corretamente

### 3. Resposta a Questão
- [ ] Selecionar opção envia POST /api/tentativas
- [ ] Payload contém todos os campos obrigatórios
- [ ] Backend retorna `sucesso: true`
- [ ] Resposta é salva no banco de dados

### 4. Feedback Visual
- [ ] Resposta correta exibida em verde
- [ ] Resposta incorreta exibida em vermelho
- [ ] Resposta correta mostrada se errou
- [ ] Pontos atualizados do backend

### 5. Navegação
- [ ] Botão "Próxima Questão" desabilitado até responder
- [ ] Clique em "Próxima Questão" vai para próxima
- [ ] Último botão muda para "Finalizar"
- [ ] Pode voltar a questões respondidas

### 6. Conclusão do Teste
- [ ] Tela de resultados exibida ao finalizar
- [ ] Pontos totais corretos (do backend)
- [ ] Acertos totais corretos (do backend)
- [ ] Erros totais corretos (do backend)
- [ ] Botão "Refazer Teste" reinicia
- [ ] Botão "Nova Área" volta à seleção

---

## 🔍 Testes de Validação Backend

### 1. Validação de Autenticação
```bash
# Sem token - deve retornar 401
curl -X POST http://localhost:3000/api/tentativas \
  -H "Content-Type: application/json" \
  -d '{"torneio_id":1,"disciplina_competida":"Matemática",...}'

# Esperado: { sucesso: false, erro: "Usuário não autenticado" }
```

### 2. Validação de Usuário
```bash
# Token inválido - deve retornar 401
curl -X POST http://localhost:3000/api/tentativas \
  -H "Authorization: Bearer INVALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Esperado: { sucesso: false, erro: "Usuário não encontrado" }
```

### 3. Validação de Torneio
```bash
# Torneio inexistente - deve retornar 404
curl -X POST http://localhost:3000/api/tentativas \
  -H "Authorization: Bearer VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"torneio_id":99999,"disciplina_competida":"Matemática",...}'

# Esperado: { sucesso: false, erro: "Torneio não encontrado" }
```

### 4. Validação de Inscrição
```bash
# Usuário não inscrito - deve retornar 403
curl -X POST http://localhost:3000/api/tentativas \
  -H "Authorization: Bearer VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"torneio_id":1,"disciplina_competida":"Matemática",...}'

# Esperado: { sucesso: false, erro: "Usuário não está inscrito..." }
```

### 5. Validação de Resposta
```bash
# Resposta vazia - deve retornar 400
curl -X POST http://localhost:3000/api/tentativas \
  -H "Authorization: Bearer VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"torneio_id":1,"disciplina_competida":"Matemática","resposta_selecionada":"",...}'

# Esperado: { sucesso: false, erro: "Resposta não pode estar vazia" }
```

### 6. Sucesso - Resposta Correta
```bash
curl -X POST http://localhost:3000/api/tentativas \
  -H "Authorization: Bearer VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "torneio_id":1,
    "disciplina_competida":"Matemática",
    "questao_id":1,
    "resposta_selecionada":"A",
    "tempo_gasto":15
  }'

# Esperado:
# {
#   "sucesso": true,
#   "tentativa": {
#     "id": 123,
#     "questao_id": 1,
#     "correta": true,
#     "pontos_obtidos": 10,
#     "resposta_correta": "A",
#     "resposta_selecionada": "A"
#   },
#   "resumo": {
#     "total_acertos": 1,
#     "total_pontos": 10,
#     "total_questoes": 1
#   }
# }
```

### 7. Sucesso - Resposta Incorreta
```bash
curl -X POST http://localhost:3000/api/tentativas \
  -H "Authorization: Bearer VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "torneio_id":1,
    "disciplina_competida":"Matemática",
    "questao_id":1,
    "resposta_selecionada":"B",
    "tempo_gasto":15
  }'

# Esperado:
# {
#   "sucesso": true,
#   "tentativa": {
#     "id": 124,
#     "questao_id": 1,
#     "correta": false,
#     "pontos_obtidos": 0,
#     "resposta_correta": "A",
#     "resposta_selecionada": "B"
#   },
#   "resumo": {
#     "total_acertos": 0,
#     "total_pontos": 0,
#     "total_questoes": 1
#   }
# }
```

---

## 📊 Testes de Dados

### 1. Verificar Persistência
```sql
-- Após responder uma questão, verificar:
SELECT * FROM tentativas_respostas 
WHERE usuario_id = ? AND torneio_id = ? 
ORDER BY criado_em DESC LIMIT 1;

-- Deve conter:
-- - usuario_id: ID do usuário
-- - torneio_id: ID do torneio
-- - disciplina_competida: "Matemática" | "Inglês" | "Programação"
-- - questao_id: ID da questão
-- - resposta_selecionada: Texto da opção
-- - resposta_correta: Texto da resposta correta
-- - correta: 1 ou 0
-- - pontos_obtidos: Número de pontos
-- - tempo_gasto: Segundos gastos
-- - criado_em: Timestamp
```

### 2. Verificar Resumo
```sql
-- Após responder múltiplas questões:
SELECT 
  COUNT(*) as total_questoes,
  SUM(CASE WHEN correta = 1 THEN 1 ELSE 0 END) as total_acertos,
  SUM(pontos_obtidos) as total_pontos
FROM tentativas_respostas
WHERE usuario_id = ? AND torneio_id = ? AND disciplina_competida = ?;

-- Deve corresponder aos valores exibidos no frontend
```

---

## 🔐 Testes de Segurança

### 1. Manipulação de Resposta
- [ ] Não é possível enviar resposta com pontos alterados
- [ ] Backend recalcula pontos sempre
- [ ] Resposta correta é validada no backend

### 2. Manipulação de Tempo
- [ ] Não é possível enviar tempo negativo
- [ ] Backend aceita tempo_gasto como informação
- [ ] Pontos não dependem do tempo (apenas da correção)

### 3. Múltiplas Respostas
- [ ] Não é possível responder mesma questão 2x
- [ ] Backend permite múltiplas tentativas (histórico)
- [ ] Resumo inclui todas as tentativas

### 4. Acesso Não Autorizado
- [ ] Usuário A não pode ver respostas de Usuário B
- [ ] Usuário não inscrito não pode responder
- [ ] Participante não confirmado não pode responder

---

## 🎯 Testes de Performance

### 1. Tempo de Resposta
- [ ] POST /api/tentativas responde em < 500ms
- [ ] GET /api/tentativas/:torneio_id/:disciplina responde em < 1s
- [ ] GET /api/tentativas/stats/:torneio_id responde em < 1s

### 2. Carga
- [ ] 100 respostas simultâneas não causam erro
- [ ] Banco de dados não fica travado
- [ ] Resumo é calculado corretamente

---

## 📋 Checklist Final

- [ ] Todas as validações funcionais passam
- [ ] Todos os testes de backend passam
- [ ] Dados são persistidos corretamente
- [ ] Segurança validada
- [ ] Performance aceitável
- [ ] Sem erros no console
- [ ] Sem erros no servidor
- [ ] Documentação atualizada
- [ ] Código revisado
- [ ] Pronto para produção

---

**Status**: 🔄 Aguardando Testes
**Data**: 22 de Maio de 2026
