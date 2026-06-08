# Guia de Integração - API Colaborador Blocos e Questões

Este documento fornece instruções passo-a-passo para integrar os novos endpoints ao servidor backend.

## 📋 Resumo dos Arquivos Criados

### 1. Routes
- **Arquivo**: `BackEnd/routes/colaboradorBlocosQuestoesRoutes.js`
- **Descrição**: Define todos os endpoints da API
- **Endpoints**: 16 rotas (5 Colaborador Blocos, 5 Colaborador Questões, 6 Admin)

### 2. Controller
- **Arquivo**: `BackEnd/controllers/ColaboradorBlocosQuestoesController.js`
- **Descrição**: Implementa a lógica de negócio para todos os endpoints
- **Funções**: 12 funções principais + helpers

### 3. Documentação
- **Arquivo**: `BackEnd/API_COLABORADOR_BLOCOS_QUESTOES.md`
- **Descrição**: Documentação completa da API com exemplos

## 🚀 Passos de Integração

### Passo 1: Importar as Rotas no index.js

Abra `BackEnd/index.js` e adicione a importação das rotas:

```javascript
// Após as outras importações de rotas (linha ~56)
import colaboradorBlocosQuestoesRoutes from './routes/colaboradorBlocosQuestoesRoutes.js';
```

### Passo 2: Montar as Rotas

Encontre a seção onde as rotas são montadas (procure por `app.use('/api/`)`) e adicione:

```javascript
// Rotas de Colaborador - Blocos e Questões
app.use('/api/colaborador', colaboradorBlocosQuestoesRoutes);
app.use('/api/admin', colaboradorBlocosQuestoesRoutes);
```

**Localização sugerida**: Após `app.use('/api/blocos', blocosRoutes);` ou próximo às outras rotas de colaborador.

### Passo 3: Verificar o Arquivo Models/associations.js

Certifique-se de que as associações entre `Questao` e `BlocoQuestoes` estão definidas:

```javascript
// Deve existir em BackEnd/models/associations.js
Questao.belongsToMany(BlocoQuestoes, {
  through: 'BlocoQuestaoItem',
  foreignKey: 'questao_id',
  otherKey: 'bloco_id',
  as: 'blocos'
});

BlocoQuestoes.belongsToMany(Questao, {
  through: 'BlocoQuestaoItem',
  foreignKey: 'bloco_id',
  otherKey: 'questao_id',
  as: 'questoes'
});
```

### Passo 4: Validar Middlewares

Certifique-se que os middlewares existem:
- ✅ `BackEnd/middlewares/auth.js` - Autenticação JWT
- ✅ `BackEnd/middlewares/isAdmin.js` - Validação de admin
- ✅ `BackEnd/middlewares/canManageQuestoes.js` - Validação de colaborador

Se algum não existir, crie-o conforme necessário.

### Passo 5: Testar os Endpoints

#### 5.1 Iniciar o servidor
```bash
cd BackEnd
npm start
```

#### 5.2 Autenticar como colaborador
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "colaborador@example.com",
    "password": "senha123"
  }'
```

#### 5.3 Criar um bloco
```bash
curl -X POST http://localhost:3000/api/colaborador/blocos \
  -H "Authorization: Bearer <seu_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Teste Bloco",
    "descricao": "Bloco de teste",
    "categoria": "Teste"
  }'
```

## 📊 Estrutura de Permissões

### Colaborador Endpoints
```
/api/colaborador/blocos            → Requer: auth + validarColaboradorAprovado
/api/colaborador/questoes          → Requer: auth + validarColaboradorAprovado
```

### Admin Endpoints
```
/api/admin/blocos-pendentes        → Requer: auth + isAdmin
/api/admin/blocos/:id/aprovar      → Requer: auth + isAdmin
/api/admin/blocos/:id/rejeitar     → Requer: auth + isAdmin
/api/admin/questoes-colaborador    → Requer: auth + isAdmin
/api/admin/questoes/:id/aprovar    → Requer: auth + isAdmin
/api/admin/questoes/:id/rejeitar   → Requer: auth + isAdmin
```

## 🗄️ Modelos de Dados Utilizados

### Questao (já existente)
```javascript
{
  id,
  titulo,
  descricao,
  tipo,                  // 'multipla_escolha', 'texto', 'codigo'
  dificuldade,           // 'facil', 'medio', 'dificil'
  pontos,
  autor_id,              // Novo: referência ao usuário criador
  status_aprovacao,      // Novo: 'pendente', 'aprovada', 'rejeitada'
  disciplina,
  opcoes,                // Para múltipla escolha
  resposta_esperada,     // Para texto/código
  explicacao,
  bloco_id,              // Novo: associação a bloco
  aprovado_por_id,       // Novo: admin que aprovou
  data_aprovacao,        // Novo
  rejeitado_por_id,      // Novo
  data_rejeicao,         // Novo
  motivo_rejeicao,       // Novo
  observacoes_admin,     // Novo
  createdAt,
  updatedAt
}
```

### BlocoQuestoes (já existente)
```javascript
{
  id,
  titulo,
  descricao,
  categoria,
  ordem,
  ativo,
  autor_id,              // Novo: referência ao usuário criador
  status_aprovacao,      // Novo: 'pendente', 'aprovado', 'rejeitado'
  disciplina,            // Novo
  aprovado_por_id,       // Novo
  data_aprovacao,        // Novo
  rejeitado_por_id,      // Novo
  data_rejeicao,         // Novo
  motivo_rejeicao,       // Novo
  observacoes_admin,     // Novo
  questoes: [],          // Associação many-to-many
  createdAt,
  updatedAt
}
```

## 🗄️ Migrações Necessárias

Se os campos novos não existem nas tabelas, crie migrações:

### Para tabela `questoes`
```sql
ALTER TABLE questoes ADD COLUMN autor_id UUID;
ALTER TABLE questoes ADD COLUMN status_aprovacao VARCHAR(50) DEFAULT 'pendente';
ALTER TABLE questoes ADD COLUMN aprovado_por_id UUID;
ALTER TABLE questoes ADD COLUMN data_aprovacao TIMESTAMP;
ALTER TABLE questoes ADD COLUMN rejeitado_por_id UUID;
ALTER TABLE questoes ADD COLUMN data_rejeicao TIMESTAMP;
ALTER TABLE questoes ADD COLUMN motivo_rejeicao TEXT;
ALTER TABLE questoes ADD COLUMN observacoes_admin TEXT;
ALTER TABLE questoes ADD COLUMN bloco_id UUID;

ALTER TABLE questoes ADD FOREIGN KEY (autor_id) REFERENCES usuarios(id);
ALTER TABLE questoes ADD FOREIGN KEY (aprovado_por_id) REFERENCES usuarios(id);
ALTER TABLE questoes ADD FOREIGN KEY (rejeitado_por_id) REFERENCES usuarios(id);
ALTER TABLE questoes ADD FOREIGN KEY (bloco_id) REFERENCES bloco_questoes(id);
```

### Para tabela `bloco_questoes`
```sql
ALTER TABLE bloco_questoes ADD COLUMN autor_id UUID;
ALTER TABLE bloco_questoes ADD COLUMN status_aprovacao VARCHAR(50) DEFAULT 'pendente';
ALTER TABLE bloco_questoes ADD COLUMN disciplina VARCHAR(100);
ALTER TABLE bloco_questoes ADD COLUMN aprovado_por_id UUID;
ALTER TABLE bloco_questoes ADD COLUMN data_aprovacao TIMESTAMP;
ALTER TABLE bloco_questoes ADD COLUMN rejeitado_por_id UUID;
ALTER TABLE bloco_questoes ADD COLUMN data_rejeicao TIMESTAMP;
ALTER TABLE bloco_questoes ADD COLUMN motivo_rejeicao TEXT;
ALTER TABLE bloco_questoes ADD COLUMN observacoes_admin TEXT;

ALTER TABLE bloco_questoes ADD FOREIGN KEY (autor_id) REFERENCES usuarios(id);
ALTER TABLE bloco_questoes ADD FOREIGN KEY (aprovado_por_id) REFERENCES usuarios(id);
ALTER TABLE bloco_questoes ADD FOREIGN KEY (rejeitado_por_id) REFERENCES usuarios(id);
```

## 🔍 Verificação de Funcionalidade

### 1. Listar blocos criados pelo colaborador
```bash
GET /api/colaborador/blocos
Authorization: Bearer <token_colaborador>
```
✅ Deve retornar apenas blocos criados por este colaborador

### 2. Listar blocos pendentes (admin)
```bash
GET /api/admin/blocos-pendentes
Authorization: Bearer <token_admin>
```
✅ Deve retornar blocos com `status_aprovacao: 'pendente'`

### 3. Aprovar um bloco
```bash
POST /api/admin/blocos/<bloco_id>/aprovar
Authorization: Bearer <token_admin>
Content-Type: application/json

{
  "observacoes": "Ótimo trabalho!"
}
```
✅ Deve mudar status para 'aprovado' e registrar admin que aprovou

### 4. Rejeitar um bloco
```bash
POST /api/admin/blocos/<bloco_id>/rejeitar
Authorization: Bearer <token_admin>
Content-Type: application/json

{
  "motivo": "Descrição não está clara",
  "observacoes": "Por favor revise e reenvie"
}
```
✅ Deve mudar status para 'rejeitado' e registrar motivo

## 🛠️ Troubleshooting

### Erro: "Middleware auth não encontrado"
**Solução**: Certifique-se de importar `auth` de `../middlewares/auth.js`

### Erro: "Model associação não encontrada"
**Solução**: Verifique que `associations.js` é importado em `index.js` ANTES das rotas

### Erro: "Colaborador não aprovado"
**Solução**: No banco de dados, atualize `status_colaborador` para 'aprovado' para o usuário

### Questões aparecem como "pendentes" depois de aprovadas
**Solução**: Verifique se o campo `status_aprovacao` foi adicionado à tabela via migração

## 📝 Exemplos de Uso Completo

### Cenário: Criar e Aprovar um Bloco

```bash
# 1. Login como colaborador
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "colaborador@example.com", "password": "senha"}' \
  | jq -r '.dados.token')

# 2. Criar bloco
BLOCO_ID=$(curl -X POST http://localhost:3000/api/colaborador/blocos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Estatística Aplicada",
    "descricao": "Conceitos de estatística"
  }' | jq -r '.dados.id')

# 3. Login como admin
ADMIN_TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "senha"}' \
  | jq -r '.dados.token')

# 4. Aprovar bloco
curl -X POST http://localhost:3000/api/admin/blocos/$BLOCO_ID/aprovar \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"observacoes": "Excelente bloco!"}'

# 5. Verificar que bloco foi aprovado
curl -X GET http://localhost:3000/api/colaborador/blocos/$BLOCO_ID \
  -H "Authorization: Bearer $TOKEN" | jq '.dados.bloco.status_aprovacao'
# Saída: "aprovado"
```

## 🚀 Próximos Passos

### Futuras Melhorias
1. Adicionar notificações por email quando blocos/questões são aprovados/rejeitados
2. Implementar webhooks para eventos de aprovação
3. Adicionar auditoria completa com logs
4. Rate limiting para prevenir spam
5. Cache para listagens frequentes
6. Bulk operations (aprovar múltiplos de uma vez)

### Integrações Recomendadas
1. Sistema de notificações (já existente?)
2. Sistema de emails
3. Analytics/Dashboard admin
4. Relatórios de colaboradores

## 📞 Suporte

Para problemas na integração:
1. Verifique os logs do servidor: `npm start` (console)
2. Teste endpoints individuais com Postman/curl
3. Verifique permissões de banco de dados
4. Confirme que o usuário teste é colaborador aprovado

## ✅ Checklist de Integração

- [ ] Arquivos copiados para a pasta correta
- [ ] Rotas importadas em `index.js`
- [ ] Rotas montadas em `app.use()`
- [ ] Middlewares verificados
- [ ] Modelos e associações validadas
- [ ] Migrações executadas (se necessário)
- [ ] Servidor iniciado sem erros
- [ ] Endpoints testados com sucesso
- [ ] Documentação atualizada no frontend
- [ ] Testes automatizados criados (se aplicável)
