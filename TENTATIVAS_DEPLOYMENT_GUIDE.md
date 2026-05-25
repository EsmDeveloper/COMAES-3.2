# 🚀 Guia de Deployment - Camada de Persistência de Tentativas

**Data:** 22 de Maio de 2026  
**Versão:** 1.0

---

## 📋 Pré-requisitos

### Ambiente
- Node.js 16+ instalado
- npm ou yarn
- MySQL/MariaDB em execução
- Variáveis de ambiente configuradas

### Dependências
- express
- sequelize
- jsonwebtoken
- bcryptjs
- dotenv

---

## 🔧 Passos de Instalação

### 1. Verificar Ficheiros Criados

```bash
# Verificar se todos os ficheiros foram criados
ls -la BackEnd/models/TentativaResposta.js
ls -la BackEnd/controllers/TentativasController.js
ls -la BackEnd/routes/tentativasRoutes.js
ls -la BackEnd/migrations/20260522000000-create-tentativas-respostas-table.js
ls -la BackEnd/scripts/testTentativas.js
```

### 2. Verificar Alterações no index.js

```bash
# Verificar se as importações foram adicionadas
grep "TentativaResposta" BackEnd/index.js
grep "tentativasRoutes" BackEnd/index.js
grep "app.use('/api/tentativas'" BackEnd/index.js
```

### 3. Instalar Dependências (se necessário)

```bash
cd BackEnd
npm install
```

### 4. Executar Migration

```bash
# Opção 1: Usando sequelize-cli
npx sequelize-cli db:migrate

# Opção 2: Usando script customizado (se existir)
node scripts/runMigration.js
```

### 5. Verificar Tabela Criada

```bash
# Conectar ao MySQL
mysql -u root -p seu_banco

# Verificar tabela
SHOW TABLES LIKE 'tentativas_respostas';
DESCRIBE tentativas_respostas;
SHOW INDEXES FROM tentativas_respostas;
```

---

## ✅ Verificação Pós-Instalação

### 1. Verificar Sintaxe

```bash
cd BackEnd

# Verificar cada ficheiro
node -c models/TentativaResposta.js
node -c controllers/TentativasController.js
node -c routes/tentativasRoutes.js
```

### 2. Iniciar Backend

```bash
# Opção 1: Desenvolvimento
npm run dev

# Opção 2: Produção
npm start
```

### 3. Testar Endpoints

```bash
# Teste 1: Verificar se servidor está rodando
curl http://localhost:3000/health

# Teste 2: Tentar acessar endpoint sem autenticação (deve retornar 401)
curl -X POST http://localhost:3000/api/tentativas \
  -H "Content-Type: application/json" \
  -d '{"torneio_id": 1}'
```

### 4. Executar Testes Automatizados

```bash
cd BackEnd
node scripts/testTentativas.js
```

---

## 🧪 Testes Manuais

### Teste 1: Salvar Tentativa Correta

```bash
# 1. Obter token (assumindo que você tem um usuário)
TOKEN="seu_token_jwt_aqui"

# 2. Enviar tentativa
curl -X POST http://localhost:3000/api/tentativas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "torneio_id": 1,
    "disciplina_competida": "Matemática",
    "questao_id": 1,
    "resposta_selecionada": "b",
    "tempo_gasto": 45
  }'

# Esperado: 201 Created com sucesso: true
```

### Teste 2: Obter Histórico

```bash
TOKEN="seu_token_jwt_aqui"

curl -X GET http://localhost:3000/api/tentativas/1/Matemática \
  -H "Authorization: Bearer $TOKEN"

# Esperado: 200 OK com array de tentativas
```

### Teste 3: Obter Estatísticas

```bash
TOKEN="seu_token_jwt_aqui"

curl -X GET http://localhost:3000/api/tentativas/stats/1 \
  -H "Authorization: Bearer $TOKEN"

# Esperado: 200 OK com estatísticas por disciplina
```

---

## 🔍 Troubleshooting

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

# Verificar se o token é válido
# Token deve estar no formato: Bearer eyJhbGc...
```

### Problema: "Usuário não está inscrito"

**Solução:**
```bash
# Verificar se o usuário está inscrito no torneio
mysql -u root -p seu_banco -e "
  SELECT * FROM participantes_torneios 
  WHERE usuario_id = 1 AND torneio_id = 1;
"

# Verificar se o status é 'confirmado'
# Se não estiver, inscrever o usuário manualmente
```

### Problema: "Questão não encontrada"

**Solução:**
```bash
# Verificar se a questão existe
mysql -u root -p seu_banco -e "
  SELECT * FROM perguntas WHERE id = 1;
"

# Se não existir, criar questões de teste
node BackEnd/scripts/seedQuestoes.js
```

---

## 📊 Verificação de Dados

### Verificar Tentativas Salvas

```bash
mysql -u root -p seu_banco -e "
  SELECT * FROM tentativas_respostas 
  ORDER BY criado_em DESC 
  LIMIT 10;
"
```

### Verificar Estatísticas

```bash
mysql -u root -p seu_banco -e "
  SELECT 
    usuario_id,
    torneio_id,
    disciplina_competida,
    COUNT(*) as total_questoes,
    SUM(CASE WHEN correta = 1 THEN 1 ELSE 0 END) as total_acertos,
    SUM(pontos_obtidos) as total_pontos
  FROM tentativas_respostas
  GROUP BY usuario_id, torneio_id, disciplina_competida;
"
```

### Verificar Índices

```bash
mysql -u root -p seu_banco -e "
  SHOW INDEXES FROM tentativas_respostas;
"
```

---

## 🔐 Segurança

### Verificar Autenticação

```bash
# Teste sem token (deve retornar 401)
curl -X POST http://localhost:3000/api/tentativas \
  -H "Content-Type: application/json" \
  -d '{"torneio_id": 1}'

# Teste com token inválido (deve retornar 401)
curl -X POST http://localhost:3000/api/tentativas \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json" \
  -d '{"torneio_id": 1}'
```

### Verificar Validações

```bash
# Teste com usuário não inscrito (deve retornar 403)
curl -X POST http://localhost:3000/api/tentativas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "torneio_id": 999,
    "disciplina_competida": "Matemática",
    "questao_id": 1,
    "resposta_selecionada": "b"
  }'

# Teste com disciplina inválida (deve retornar 400)
curl -X POST http://localhost:3000/api/tentativas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "torneio_id": 1,
    "disciplina_competida": "Inválida",
    "questao_id": 1,
    "resposta_selecionada": "b"
  }'
```

---

## 📈 Performance

### Verificar Índices

```bash
# Verificar se os índices foram criados
mysql -u root -p seu_banco -e "
  SHOW INDEXES FROM tentativas_respostas;
"

# Esperado: 5 índices
# - idx_usuario_id
# - idx_torneio_id
# - idx_questao_id
# - idx_usuario_torneio
# - idx_usuario_torneio_disciplina
```

### Otimizar Queries

```bash
# Verificar plano de execução
mysql -u root -p seu_banco -e "
  EXPLAIN SELECT * FROM tentativas_respostas 
  WHERE usuario_id = 1 AND torneio_id = 1;
"

# Deve usar índice idx_usuario_torneio
```

---

## 🔄 Rollback (Se Necessário)

### Desfazer Migration

```bash
# Opção 1: Usando sequelize-cli
npx sequelize-cli db:migrate:undo

# Opção 2: Remover tabela manualmente
mysql -u root -p seu_banco -e "
  DROP TABLE IF EXISTS tentativas_respostas;
"
```

### Remover Ficheiros

```bash
# Remover ficheiros criados
rm BackEnd/models/TentativaResposta.js
rm BackEnd/controllers/TentativasController.js
rm BackEnd/routes/tentativasRoutes.js
rm BackEnd/migrations/20260522000000-create-tentativas-respostas-table.js
rm BackEnd/scripts/testTentativas.js
```

### Reverter Alterações no index.js

```bash
# Remover as 3 linhas adicionadas:
# - import TentativaResposta
# - import tentativasRoutes
# - app.use('/api/tentativas', tentativasRoutes)
```

---

## 📝 Checklist de Deployment

### Pré-Deployment
- [ ] Todos os ficheiros criados
- [ ] Alterações no index.js verificadas
- [ ] Sintaxe verificada
- [ ] Testes automatizados passaram
- [ ] Banco de dados acessível
- [ ] Variáveis de ambiente configuradas

### Deployment
- [ ] Migration executada
- [ ] Tabela criada com sucesso
- [ ] Índices criados
- [ ] Backend iniciado
- [ ] Endpoints testados
- [ ] Autenticação funcionando
- [ ] Validações funcionando

### Pós-Deployment
- [ ] Testes manuais executados
- [ ] Dados verificados no banco
- [ ] Performance verificada
- [ ] Segurança verificada
- [ ] Logs monitorados
- [ ] Usuários notificados

---

## 🆘 Suporte

### Ficheiros de Referência
- `TENTATIVAS_API_DOCUMENTATION.md` - Documentação da API
- `TENTATIVAS_IMPLEMENTATION_REPORT.md` - Relatório técnico
- `TENTATIVAS_IMPLEMENTATION_SUMMARY.md` - Sumário
- `TENTATIVAS_CHECKLIST.md` - Checklist

### Contactos
- Desenvolvedor: [Seu Nome]
- Data: 22 de Maio de 2026
- Versão: 1.0

---

## 📞 Próximos Passos

1. **Fase 2:** Integração de Ranking Automático
2. **Fase 3:** Integração Frontend
3. **Fase 4:** Validações Adicionais

---

**Guia de Deployment concluído em 22 de Maio de 2026**

Desenvolvido com ❤️ para o COMAES
