# 🚀 Guia de Início Rápido - Camada de Persistência de Tentativas

**Data:** 22 de Maio de 2026  
**Tempo Estimado:** 15 minutos

---

## ⚡ 5 Passos para Começar

### Passo 1: Verificar Ficheiros (2 minutos)

Confirme que todos os ficheiros foram criados:

```bash
# Verificar modelos
ls -la BackEnd/models/TentativaResposta.js

# Verificar controllers
ls -la BackEnd/controllers/TentativasController.js

# Verificar rotas
ls -la BackEnd/routes/tentativasRoutes.js

# Verificar migrations
ls -la BackEnd/migrations/20260522000000-create-tentativas-respostas-table.js

# Verificar scripts
ls -la BackEnd/scripts/testTentativas.js
```

### Passo 2: Executar Migration (3 minutos)

Criar a tabela no banco de dados:

```bash
cd BackEnd

# Opção 1: Usando sequelize-cli
npx sequelize-cli db:migrate

# Opção 2: Usando script customizado
node scripts/runMigration.js
```

**Verificar se foi criada:**
```bash
mysql -u root -p seu_banco -e "SHOW TABLES LIKE 'tentativas_respostas';"
```

### Passo 3: Iniciar Backend (2 minutos)

```bash
cd BackEnd

# Desenvolvimento
npm run dev

# Produção
npm start
```

**Verificar se está rodando:**
```bash
curl http://localhost:3000/health
```

### Passo 4: Executar Testes (5 minutos)

```bash
cd BackEnd
node scripts/testTentativas.js
```

**Esperado:**
```
✓ Testes Passados: 5
✗ Testes Falhados: 0
Total: 5
```

### Passo 5: Testar Endpoints (3 minutos)

```bash
# Obter token (assumindo que você tem um usuário)
TOKEN="seu_token_jwt_aqui"

# Teste 1: Salvar tentativa
curl -X POST http://localhost:3000/api/tentativas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "torneio_id": 1,
    "disciplina_competida": "Matemática",
    "questao_id": 1,
    "resposta_selecionada": "b"
  }'

# Teste 2: Obter histórico
curl -X GET http://localhost:3000/api/tentativas/1/Matemática \
  -H "Authorization: Bearer $TOKEN"

# Teste 3: Obter estatísticas
curl -X GET http://localhost:3000/api/tentativas/stats/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📚 Próximos Passos

### Leitura Recomendada

1. **Primeiro (5 min):** `TENTATIVAS_README.md`
2. **Depois (10 min):** `TENTATIVAS_EXECUTIVE_SUMMARY.md`
3. **Depois (15 min):** `TENTATIVAS_API_DOCUMENTATION.md`
4. **Depois (20 min):** `TENTATIVAS_INTEGRATION_EXAMPLE.md`

### Integração com Frontend

1. Ler: `TENTATIVAS_INTEGRATION_EXAMPLE.md`
2. Implementar: Função `salvarResposta()` no frontend
3. Testar: Com usuários reais
4. Deploy: Em produção

### Próxima Fase

1. Integração de Ranking (Fase 2)
2. Integração Frontend (Fase 3)
3. Validações Adicionais (Fase 4)

---

## 🆘 Troubleshooting Rápido

### Problema: "Cannot find module 'TentativaResposta'"

**Solução:**
```bash
# Verificar se o ficheiro existe
ls -la BackEnd/models/TentativaResposta.js

# Verificar import no index.js
grep "TentativaResposta" BackEnd/index.js

# Reiniciar servidor
npm run dev
```

### Problema: "Tabela 'tentativas_respostas' não existe"

**Solução:**
```bash
# Executar migration
npx sequelize-cli db:migrate

# Verificar se foi criada
mysql -u root -p seu_banco -e "SHOW TABLES LIKE 'tentativas_respostas';"
```

### Problema: "Token não fornecido"

**Solução:**
```bash
# Verificar se está enviando o header Authorization
curl -X GET http://localhost:3000/api/tentativas/1/Matemática \
  -H "Authorization: Bearer seu_token_aqui"
```

### Problema: "Usuário não está inscrito"

**Solução:**
```bash
# Verificar se o usuário está inscrito no torneio
mysql -u root -p seu_banco -e "
  SELECT * FROM participantes_torneios 
  WHERE usuario_id = 1 AND torneio_id = 1;
"
```

---

## 📊 Checklist de Verificação

- [ ] Todos os ficheiros criados
- [ ] Migration executada
- [ ] Tabela criada no banco
- [ ] Backend iniciado
- [ ] Testes passando
- [ ] Endpoints respondendo
- [ ] Documentação lida
- [ ] Pronto para integração

---

## 💡 Dicas Úteis

### 1. Usar Postman/Insomnia para Testar

```
POST http://localhost:3000/api/tentativas
Headers:
  Authorization: Bearer seu_token
  Content-Type: application/json

Body:
{
  "torneio_id": 1,
  "disciplina_competida": "Matemática",
  "questao_id": 1,
  "resposta_selecionada": "b"
}
```

### 2. Verificar Dados no Banco

```bash
mysql -u root -p seu_banco -e "
  SELECT * FROM tentativas_respostas 
  ORDER BY criado_em DESC 
  LIMIT 10;
"
```

### 3. Monitorar Logs

```bash
# Ver logs em tempo real
tail -f BackEnd/logs/app.log

# Ou usar npm com debug
DEBUG=* npm run dev
```

### 4. Testar com Múltiplos Usuários

```bash
# Criar múltiplos usuários de teste
node BackEnd/scripts/seedUsers.js

# Inscrever em torneios
node BackEnd/scripts/seedParticipants.js

# Criar questões
node BackEnd/scripts/seedQuestoes.js
```

---

## 🎯 Próximas Ações

### Hoje
- [x] Implementação completa
- [x] Testes passando
- [x] Documentação pronta

### Amanhã
- [ ] Integração com frontend
- [ ] Testes com usuários reais
- [ ] Feedback dos usuários

### Esta Semana
- [ ] Fase 2: Integração de Ranking
- [ ] Testes de carga
- [ ] Deploy em staging

### Próxima Semana
- [ ] Deploy em produção
- [ ] Monitoramento
- [ ] Fase 3: Integração Frontend

---

## 📞 Suporte

### Dúvidas Técnicas?
→ Consulte: `TENTATIVAS_API_DOCUMENTATION.md`

### Dúvidas sobre Deployment?
→ Consulte: `TENTATIVAS_DEPLOYMENT_GUIDE.md`

### Dúvidas sobre Integração?
→ Consulte: `TENTATIVAS_INTEGRATION_EXAMPLE.md`

### Dúvidas sobre Implementação?
→ Consulte: `TENTATIVAS_IMPLEMENTATION_REPORT.md`

---

## ✨ Parabéns!

Você completou o guia de início rápido. Agora está pronto para:

1. ✅ Usar a API de tentativas
2. ✅ Integrar com o frontend
3. ✅ Fazer deploy em produção
4. ✅ Monitorar o sistema

---

## 📚 Documentação Completa

- `TENTATIVAS_README.md` - Visão geral
- `TENTATIVAS_EXECUTIVE_SUMMARY.md` - Sumário executivo
- `TENTATIVAS_API_DOCUMENTATION.md` - Documentação da API
- `TENTATIVAS_IMPLEMENTATION_REPORT.md` - Relatório técnico
- `TENTATIVAS_DEPLOYMENT_GUIDE.md` - Guia de deployment
- `TENTATIVAS_INTEGRATION_EXAMPLE.md` - Exemplos de integração
- `TENTATIVAS_CHECKLIST.md` - Checklist de implementação
- `TENTATIVAS_DOCUMENTATION_INDEX.md` - Índice de documentação

---

**Guia de Início Rápido concluído em 22 de Maio de 2026**

Desenvolvido com ❤️ para o COMAES

---

## 🚀 Comece Agora!

```bash
# 1. Executar migration
npx sequelize-cli db:migrate

# 2. Iniciar backend
npm run dev

# 3. Executar testes
node BackEnd/scripts/testTentativas.js

# 4. Testar endpoints
curl -X GET http://localhost:3000/api/tentativas/1/Matemática \
  -H "Authorization: Bearer seu_token"
```

**Pronto? Boa sorte! 🎉**
