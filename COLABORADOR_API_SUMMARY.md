# Backend API Colaborador - Blocos e Questões
## Summary & Delivery

**Data de Entrega**: 2024-01-15  
**Status**: ✅ Completo  
**Versão**: 1.0.0

---

## 📦 O Que Foi Entregue

### 1. **Arquivo de Rotas** (16 endpoints)
**Localização**: `BackEnd/routes/colaboradorBlocosQuestoesRoutes.js`

#### Blocos - Colaborador (5 endpoints)
- `POST /api/colaborador/blocos` - Criar bloco
- `GET /api/colaborador/blocos` - Listar blocos próprios
- `GET /api/colaborador/blocos/:id` - Obter detalhe
- `PUT /api/colaborador/blocos/:id` - Atualizar próprio bloco
- `DELETE /api/colaborador/blocos/:id` - Deletar próprio bloco

#### Questões - Colaborador (5 endpoints)
- `POST /api/colaborador/questoes` - Criar questão
- `GET /api/colaborador/questoes` - Listar questões próprias
- `GET /api/colaborador/questoes/:id` - Obter detalhe
- `PUT /api/colaborador/questoes/:id` - Atualizar própria questão
- `DELETE /api/colaborador/questoes/:id` - Deletar própria questão

#### Admin - Aprovação (6 endpoints)
- `GET /api/admin/blocos-pendentes` - Listar blocos para aprovação
- `POST /api/admin/blocos/:id/aprovar` - Aprovar bloco
- `POST /api/admin/blocos/:id/rejeitar` - Rejeitar bloco
- `GET /api/admin/questoes-colaborador` - Listar questões para aprovação
- `POST /api/admin/questoes/:id/aprovar` - Aprovar questão
- `POST /api/admin/questoes/:id/rejeitar` - Rejeitar questão

---

### 2. **Arquivo de Controller** (12 funções)
**Localização**: `BackEnd/controllers/ColaboradorBlocosQuestoesController.js`

**Blocos**:
- `criarBlocoColaborador()`
- `listarBlocosColaborador()`
- `obterBlocoColaborador()`
- `atualizarBlocoColaborador()`
- `deletarBlocoColaborador()`

**Questões**:
- `criarQuestaoColaborador()`
- `listarQuestoesColaborador()`
- `obterQuestaoColaborador()`
- `atualizarQuestaoColaborador()`
- `deletarQuestaoColaborador()`

**Admin**:
- `listarBlocosPendentes()`
- `aprovarBloco()`
- `rejeitarBloco()`
- `listarQuestoesColaboradorPendentes()`
- `aprovarQuestaoColaborador()`
- `rejeitarQuestaoColaborador()`

---

### 3. **Documentação Completa**
- **API_COLABORADOR_BLOCOS_QUESTOES.md** - Guia completo de uso com exemplos
- **INTEGRATION_GUIDE_COLABORADOR_API.md** - Guia de integração passo-a-passo
- **Este arquivo** - Resumo executivo

---

## ✨ Recursos Principais

### ✅ Autorização & Permissões
- Middleware de autenticação JWT
- Validação de colaborador aprovado
- Validação de admin
- Isolamento de dados por colaborador

### ✅ Validação de Dados
- Validação de campos obrigatórios
- Validação de limites (max chars, pontos, opções)
- Validação de tipos (enum para dificuldade, tipo, status)
- Validação de opções para múltipla escolha

### ✅ Tratamento de Erros
- Mensagens de erro descritivas
- Retorno de erros de validação específicos
- Status HTTP apropriados
- Logging de erros no console

### ✅ Paginação & Filtros
- Paginação com limite configurável
- Filtros por status, dificuldade, tipo, disciplina
- Busca por texto em título/descrição
- Ordenação múltipla (data, título, dificuldade)

### ✅ Estatísticas
- Contadores de blocos/questões por status
- Distribuição por dificuldade
- Distribuição por tipo
- Taxa de aprovação

### ✅ Fluxo de Aprovação
- Blocos/questões começam como "pendente"
- Admins podem aprovar ou rejeitar
- Apenas recursos pendentes podem ser editados
- Histórico de aprovação mantido

### ✅ Responses Padronizadas
- Estrutura consistente para sucesso e erro
- Timestamps em todas as respostas
- Dados organizados logicamente
- Paginação clara

---

## 🔄 Fluxo de Uso Típico

### Cenário 1: Colaborador criando bloco
```
1. Colaborador faz POST /api/colaborador/blocos
   └─ Bloco criado com status "pendente"
   
2. Colaborador visualiza com GET /api/colaborador/blocos
   └─ Vê bloco listado como pendente
   
3. Colaborador pode editar com PUT enquanto pendente
   
4. Administrador vê com GET /api/admin/blocos-pendentes
   
5. Admin aprova com POST /api/admin/blocos/:id/aprovar
   └─ Status muda para "aprovado"
   
6. Colaborador NÃO PODE editar bloco aprovado
   └─ Tentativa retorna erro 403
```

### Cenário 2: Admin rejeitando questão
```
1. Admin lista pendentes: GET /api/admin/questoes-colaborador
   
2. Admin rejeita com POST /api/admin/questoes/:id/rejeitar
   └─ Status muda para "rejeitado"
   └─ Motivo é registrado
   
3. Colaborador vê questão rejeitada na lista
   
4. Colaborador pode deletar com DELETE /api/colaborador/questoes/:id
   
5. Colaborador recria questão melhorada
```

---

## 📊 Estrutura de Dados

### Bloco (BlocoQuestoes)
```javascript
{
  id: UUID,
  titulo: string (255),
  descricao: string,
  categoria: string,
  ordem: number,
  ativo: boolean,
  
  // Novos campos
  autor_id: UUID,                    // Quem criou
  status_aprovacao: 'pendente' | 'aprovado' | 'rejeitado',
  disciplina: string,
  aprovado_por_id: UUID,             // Admin que aprovou
  data_aprovacao: timestamp,
  rejeitado_por_id: UUID,            // Admin que rejeitou
  data_rejeicao: timestamp,
  motivo_rejeicao: string,
  observacoes_admin: string,
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Questão (Questao)
```javascript
{
  id: UUID,
  titulo: string (255),
  descricao: string,
  tipo: 'multipla_escolha' | 'texto' | 'codigo',
  dificuldade: 'facil' | 'medio' | 'dificil',
  pontos: number (1-100),
  
  // Específico do tipo
  opcoes: [{texto, correta, explicacao}],    // multipla_escolha
  resposta_esperada: string,                  // texto/codigo
  explicacao: string,
  
  // Novos campos
  autor_id: UUID,                    // Quem criou
  bloco_id: UUID,                    // Associado a bloco
  status_aprovacao: 'pendente' | 'aprovada' | 'rejeitada',
  disciplina: string,
  aprovado_por_id: UUID,
  data_aprovacao: timestamp,
  rejeitado_por_id: UUID,
  data_rejeicao: timestamp,
  motivo_rejeicao: string,
  observacoes_admin: string,
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## 🔒 Segurança Implementada

### Autenticação
- ✅ Token JWT obrigatório em headers
- ✅ Validação de expiração de token
- ✅ Proteção contra token inválido

### Autorização
- ✅ Colaborador só acessa seus próprios recursos
- ✅ Admin pode acessar todos os recursos
- ✅ Verificação de status "aprovado" para colaboradores
- ✅ Verificação de propriedade antes de operações

### Validação
- ✅ Sanitização de entrada
- ✅ Validação de tipos
- ✅ Validação de limites (255 chars, pontos 1-100)
- ✅ Validação de enums

### Boas Práticas
- ✅ Passwords não retornados em responses
- ✅ Prepared statements (via Sequelize ORM)
- ✅ Tratamento seguro de erros (sem stack trace ao cliente)
- ✅ Logging de ações administrativas

---

## 📝 Validações Implementadas

### Blocos
| Campo | Validação |
|-------|-----------|
| titulo | Obrigatório, máx 255 chars |
| descricao | Opcional, string válida |
| categoria | Opcional, string válida |
| ordem | Opcional, número |
| ativo | Opcional, boolean |

### Questões - Múltipla Escolha
| Campo | Validação |
|-------|-----------|
| titulo | Obrigatório, máx 255 chars |
| descricao | Obrigatório, string válida |
| tipo | Obrigatório, valor: "multipla_escolha" |
| dificuldade | Obrigatório: facil, medio, dificil |
| pontos | Obrigatório: 1-100 |
| opcoes | Obrigatório: 2-10 opções, 1+ correta |

### Questões - Texto/Código
| Campo | Validação |
|-------|-----------|
| titulo | Obrigatório, máx 255 chars |
| descricao | Obrigatório |
| tipo | Obrigatório: texto ou codigo |
| dificuldade | Obrigatório: facil, medio, dificil |
| pontos | Obrigatório: 1-100 |
| resposta_esperada | Opcional |

### Aprovação
| Ação | Validação |
|------|-----------|
| Aprovar | Recurso deve estar "pendente" |
| Rejeitar | Recurso deve estar "pendente", motivo obrigatório |
| Editar | Recurso deve estar "pendente" |
| Deletar | Recurso deve estar "pendente" ou "rejeitado" |

---

## 🧪 Casos de Teste Sugeridos

### Testes Funcionais - Blocos Colaborador

```javascript
describe('POST /api/colaborador/blocos', () => {
  it('deve criar bloco com dados válidos', () => { /* ... */ });
  it('deve retornar 400 com título vazio', () => { /* ... */ });
  it('deve retornar 403 sem autenticação', () => { /* ... */ });
  it('deve retornar 403 se colaborador não aprovado', () => { /* ... */ });
});

describe('GET /api/colaborador/blocos', () => {
  it('deve listar apenas blocos próprios', () => { /* ... */ });
  it('deve aplicar filtro de status', () => { /* ... */ });
  it('deve aplicar paginação corretamente', () => { /* ... */ });
  it('deve buscar por título', () => { /* ... */ });
});

describe('PUT /api/colaborador/blocos/:id', () => {
  it('deve atualizar bloco pendente', () => { /* ... */ });
  it('deve retornar 403 se bloco aprovado', () => { /* ... */ });
  it('deve retornar 404 se bloco não existe', () => { /* ... */ });
});

describe('DELETE /api/colaborador/blocos/:id', () => {
  it('deve deletar bloco pendente', () => { /* ... */ });
  it('deve deletar bloco rejeitado', () => { /* ... */ });
  it('deve retornar 403 se bloco aprovado', () => { /* ... */ });
});
```

### Testes Funcionais - Admin

```javascript
describe('POST /api/admin/blocos/:id/aprovar', () => {
  it('deve aprovar bloco pendente', () => { /* ... */ });
  it('deve retornar 400 se já aprovado', () => { /* ... */ });
  it('deve registrar quem aprovou', () => { /* ... */ });
  it('deve retornar 403 sem ser admin', () => { /* ... */ });
});

describe('POST /api/admin/blocos/:id/rejeitar', () => {
  it('deve rejeitar com motivo válido', () => { /* ... */ });
  it('deve retornar 400 sem motivo', () => { /* ... */ });
  it('deve registrar motivo e observações', () => { /* ... */ });
});

describe('GET /api/admin/blocos-pendentes', () => {
  it('deve listar blocos pendentes', () => { /* ... */ });
  it('deve filtrar por disciplina', () => { /* ... */ });
  it('deve filtrar por colaborador', () => { /* ... */ });
});
```

---

## 🚀 Como Integrar

### Passo 1: Copiar Arquivos
```bash
# Rotas
cp routes/colaboradorBlocosQuestoesRoutes.js BackEnd/routes/

# Controller
cp controllers/ColaboradorBlocosQuestoesController.js BackEnd/controllers/
```

### Passo 2: Atualizar index.js
```javascript
// Após outras importações de rotas
import colaboradorBlocosQuestoesRoutes from './routes/colaboradorBlocosQuestoesRoutes.js';

// Onde as rotas são montadas
app.use('/api/colaborador', colaboradorBlocosQuestoesRoutes);
app.use('/api/admin', colaboradorBlocosQuestoesRoutes);
```

### Passo 3: Executar Migrações (se necessário)
```bash
npx sequelize-cli db:migrate
```

### Passo 4: Testar
```bash
npm start
# Acessar http://localhost:3000/api/colaborador/blocos com token válido
```

**Ver**: `INTEGRATION_GUIDE_COLABORADOR_API.md` para detalhes completos

---

## 📚 Documentação Gerada

1. **API_COLABORADOR_BLOCOS_QUESTOES.md**
   - Documentação completa de cada endpoint
   - Exemplos de request/response
   - Validações e erros
   - Fluxos de uso

2. **INTEGRATION_GUIDE_COLABORADOR_API.md**
   - Passo-a-passo de integração
   - Estrutura de permissões
   - Migrações SQL
   - Troubleshooting

3. **COLABORADOR_API_SUMMARY.md** (este arquivo)
   - Resumo executivo
   - O que foi entregue
   - Instruções rápidas

---

## 🎯 Funcionalidades Principais

### ✅ CRUD Completo
- Create: POST endpoints para blocos e questões
- Read: GET endpoints com filtros e paginação
- Update: PUT endpoints (apenas para pendentes)
- Delete: DELETE endpoints (apenas para pendentes/rejeitados)

### ✅ Workflow de Aprovação
- Status progressivo: pendente → aprovado/rejeitado
- Imutabilidade de recursos aprovados
- Rastreamento de quem aprovou/rejeitou
- Histórico de decisões

### ✅ Filtros & Busca
- Filtro por status de aprovação
- Filtro por dificuldade (fácil, médio, difícil)
- Filtro por tipo de questão
- Filtro por disciplina
- Filtro por colaborador (admin)
- Busca por texto em título/descrição
- Ordenação múltipla

### ✅ Paginação
- Limite configurável (até 100 itens/página)
- Informações completas de paginação
- Cálculo automático de páginas totais

### ✅ Estatísticas
- Contagem por status
- Contagem por dificuldade
- Contagem por tipo
- Distribuição de questões

---

## 📊 Endpoints Quick Reference

| Método | Endpoint | Quem Pode | Função |
|--------|----------|----------|--------|
| POST | `/api/colaborador/blocos` | Colab | Criar bloco |
| GET | `/api/colaborador/blocos` | Colab | Listar blocos |
| GET | `/api/colaborador/blocos/:id` | Colab | Ver bloco |
| PUT | `/api/colaborador/blocos/:id` | Colab | Editar bloco |
| DELETE | `/api/colaborador/blocos/:id` | Colab | Deletar bloco |
| POST | `/api/colaborador/questoes` | Colab | Criar questão |
| GET | `/api/colaborador/questoes` | Colab | Listar questões |
| GET | `/api/colaborador/questoes/:id` | Colab | Ver questão |
| PUT | `/api/colaborador/questoes/:id` | Colab | Editar questão |
| DELETE | `/api/colaborador/questoes/:id` | Colab | Deletar questão |
| GET | `/api/admin/blocos-pendentes` | Admin | Ver blocos para aprovar |
| POST | `/api/admin/blocos/:id/aprovar` | Admin | Aprovar bloco |
| POST | `/api/admin/blocos/:id/rejeitar` | Admin | Rejeitar bloco |
| GET | `/api/admin/questoes-colaborador` | Admin | Ver questões para aprovar |
| POST | `/api/admin/questoes/:id/aprovar` | Admin | Aprovar questão |
| POST | `/api/admin/questoes/:id/rejeitar` | Admin | Rejeitar questão |

---

## 🔧 Configuração Recomendada

### Middlewares (já devem existir)
- `auth` - Autenticação JWT
- `isAdmin` - Verificação de admin
- `canManageQuestoes` - Verificação de colaborador

### Modelos (já devem existir)
- `Usuario` - Usuários do sistema
- `Questao` - Questões
- `BlocoQuestoes` - Blocos

### Associações (verificar)
- `Questao` ↔ `BlocoQuestoes` (many-to-many)
- `Usuario` → `Questao` (autor)
- `Usuario` → `BlocoQuestoes` (autor)

---

## ⚠️ Notas Importantes

1. **Colaboradores aprovados**: Apenas usuários com `role='colaborador'` e `status_colaborador='aprovado'` podem usar endpoints de colaborador

2. **Propriedade de recurso**: Colaboradores só podem acessar seus próprios blocos/questões

3. **Imutabilidade**: Recursos aprovados não podem ser editados (apenas deletados após rejeição)

4. **Motivo obrigatório**: Rejeições requerem motivo obrigatório

5. **Histórico**: Quem aprovou/rejeitou é registrado para auditoria

6. **Timestamps**: Todas as respostas incluem `timestamp` em ISO 8601

---

## 📞 Suporte & Próximas Etapas

### Próximas Melhorias (Future)
- [ ] Notificações por email para aprovações/rejeições
- [ ] Webhooks para integrações
- [ ] Auditoria detalhada com logs
- [ ] Rate limiting
- [ ] Cache para listagens
- [ ] Bulk operations

### Integrações Necessárias
- [ ] Frontend: Criar componentes para criar/editar blocos
- [ ] Frontend: Criar painel de aprovação para admin
- [ ] Frontend: Adicionar notificações de aprovação/rejeição
- [ ] Emails: Sistema de notificações
- [ ] Analytics: Relatórios de colaboradores

---

## ✅ Checklist Final

- [x] Rotas criadas e documentadas
- [x] Controller implementado
- [x] Validações completas
- [x] Tratamento de erros
- [x] Autorização e permissões
- [x] Paginação e filtros
- [x] Respostas padronizadas
- [x] Documentação API completa
- [x] Guia de integração
- [x] Exemplos de uso
- [x] Teste de fluxos principais

---

## 📄 Arquivos Criados

```
BackEnd/
├── routes/
│   └── colaboradorBlocosQuestoesRoutes.js    ← Nova
├── controllers/
│   └── ColaboradorBlocosQuestoesController.js ← Nova
├── API_COLABORADOR_BLOCOS_QUESTOES.md         ← Nova (Docs)
└── INTEGRATION_GUIDE_COLABORADOR_API.md       ← Nova (Docs)

./
└── COLABORADOR_API_SUMMARY.md                 ← Nova (Este arquivo)
```

---

**Status**: ✅ PRONTO PARA INTEGRAÇÃO  
**Versão**: 1.0.0  
**Data**: 2024-01-15
