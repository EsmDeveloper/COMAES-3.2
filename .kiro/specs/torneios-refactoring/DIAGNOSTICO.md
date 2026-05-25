# 🔍 RELATÓRIO DE DIAGNÓSTICO - Módulo de Torneios & Questões

**Data**: 21/05/2026  
**Status**: Análise Completa  
**Severidade**: CRÍTICA

---

## 📊 RESUMO EXECUTIVO

Após análise profunda do código, identificamos **problemas críticos** na gestão de questões que comprometem a funcionalidade do módulo:

| Problema | Severidade | Impacto |
|----------|-----------|--------|
| Sem interface de criação de questões no admin | 🔴 CRÍTICA | Impossível criar questões |
| Sem validação de campos de questões | 🔴 CRÍTICA | Dados inválidos na BD |
| Sem edição de questões | 🔴 CRÍTICA | Impossível corrigir erros |
| Sem busca/filtro de questões | 🟠 ALTA | Difícil gerenciar questões |
| Sem preview de questões | 🟠 ALTA | Sem validação visual |
| Sem duplicação de questões | 🟠 ALTA | Retrabalho desnecessário |
| Possível falha na associação torneio_id | 🔴 CRÍTICA | Questões órfãs |
| Sem serviço centralizado de questões | 🟠 ALTA | Código duplicado |
| Sem testes de integridade | 🟠 ALTA | Sem garantias |

---

## 🔴 PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. FALTA DE INTERFACE DE CRIAÇÃO DE QUESTÕES

**Localização**: `FrontEnd/src/Administrador/`

**Problema**:
- ❌ Não existe componente especializado para criar questões
- ❌ TableManager tenta usar GenericController para questões
- ❌ Sem campos dinâmicos por modalidade
- ❌ Sem validação específica por tipo

**Evidência**:
```javascript
// TableManager.jsx - Definição genérica de questões
questaomatematica: {
    title: 'Questões de Matemática',
    columns: ['id', 'pergunta_id', 'enunciado', 'resposta_correta'],
    fields: [
        { name: 'pergunta_id', label: 'Pergunta ID', type: 'number', required: true },
        { name: 'enunciado', label: 'Enunciado', type: 'textarea', required: true },
        // ... campos genéricos
    ]
}
```

**Impacto**: 
- Usuário não consegue criar questões
- Interface confusa e desorganizada
- Sem feedback visual adequado

---

### 2. FALTA DE SELEÇÃO DE TORNEIO

**Localização**: `FrontEnd/src/Administrador/TableManager.jsx`

**Problema**:
- ❌ Não há campo para selecionar torneio ao criar questão
- ❌ torneio_id não é enviado no formulário
- ❌ Questões podem ficar órfãs (sem torneio_id)

**Evidência**:
```javascript
// TableModal.jsx - Não há campo de torneio
const handleSubmit = async () => {
    // formData não contém torneio_id
    const response = await apiClient.post(url, formData);
};
```

**Impacto**:
- 🔴 **CRÍTICO**: Questões não vinculadas ao torneio correto
- Questões órfãs na base de dados
- Impossível filtrar questões por torneio

---

### 3. VALIDAÇÃO INCOMPLETA

**Localização**: `BackEnd/controllers/GenericController.js`

**Problema**:
- ❌ Validação genérica não específica para questões
- ❌ Sem validação de campos obrigatórios por tipo
- ❌ Sem validação de dificuldade
- ❌ Sem validação de pontos
- ❌ Sem validação de opcoes (JSON)

**Evidência**:
```javascript
// GenericController.js - Validação genérica
export const create = async (req, res) => {
    const newRecord = await Model.create(req.body);
    // Sem validação específica de questões
};
```

**Impacto**:
- Dados inválidos na BD
- Sem garantia de integridade
- Erros em tempo de execução

---

### 4. SEM EDIÇÃO DE QUESTÕES

**Localização**: `FrontEnd/src/Administrador/`

**Problema**:
- ❌ Não há componente para editar questões
- ❌ TableManager não suporta edição de questões
- ❌ Sem preservação de dados ao editar

**Impacto**:
- Impossível corrigir erros
- Necessário deletar e recriar
- Perda de histórico

---

### 5. SEM BUSCA/FILTRO DE QUESTÕES

**Localização**: `FrontEnd/src/Administrador/`

**Problema**:
- ❌ Sem componente de listagem de questões
- ❌ Sem busca por título
- ❌ Sem filtro por modalidade
- ❌ Sem filtro por dificuldade
- ❌ Sem paginação

**Impacto**:
- Difícil gerenciar muitas questões
- Sem visibilidade do que foi criado
- Sem controle de qualidade

---

### 6. SEM PREVIEW DE QUESTÕES

**Localização**: `FrontEnd/src/Administrador/`

**Problema**:
- ❌ Sem visualização antes de salvar
- ❌ Sem validação visual
- ❌ Sem feedback de como ficará

**Impacto**:
- Erros descobertos apenas após salvar
- Retrabalho necessário
- Experiência ruim do admin

---

### 7. POSSÍVEL FALHA NA ASSOCIAÇÃO TORNEIO_ID

**Localização**: `BackEnd/models/` e `BackEnd/controllers/`

**Problema**:
- ⚠️ torneio_id é obrigatório nos modelos
- ⚠️ Mas não há validação no controller
- ⚠️ Frontend não envia torneio_id
- ⚠️ Possível criar questões sem torneio

**Evidência**:
```javascript
// QuestaoMatematica.js
torneio_id: {
    type: DataTypes.INTEGER,
    allowNull: false,  // ← Obrigatório
    references: { model: 'torneios', key: 'id' },
}

// Mas no frontend:
// Não há campo para selecionar torneio
```

**Impacto**:
- 🔴 **CRÍTICO**: Questões órfãs
- Violação de integridade referencial
- Erros ao recuperar questões

---

### 8. SEM SERVIÇO CENTRALIZADO DE QUESTÕES

**Localização**: `BackEnd/services/`

**Problema**:
- ❌ Não existe `questoesService.js`
- ❌ Lógica espalhada em controllers genéricos
- ❌ Sem reutilização de código
- ❌ Sem testes unitários

**Impacto**:
- Código duplicado
- Difícil manutenção
- Sem testes

---

### 9. SEM TESTES DE INTEGRIDADE

**Localização**: `BackEnd/scripts/`

**Problema**:
- ❌ Sem script para verificar questões órfãs
- ❌ Sem script para validar integridade
- ❌ Sem script para limpar dados inválidos

**Impacto**:
- Sem garantia de dados válidos
- Difícil diagnosticar problemas
- Sem auditoria

---

## 🟠 PROBLEMAS SECUNDÁRIOS

### 10. Sem Duplicação de Questões
- Necessário recriar questões similares do zero
- Retrabalho desnecessário

### 11. Sem Confirmação de Exclusão
- Possível deletar questão por acidente
- Sem recuperação

### 12. Sem Indicadores Visuais
- Sem ícones de status
- Sem cores de dificuldade
- Sem contador de questões

### 13. Sem Logging
- Sem auditoria de quem criou/editou/deletou
- Sem rastreamento de mudanças

### 14. Sem Tratamento de Erros
- Erros genéricos
- Sem mensagens claras ao usuário

---

## 📋 ANÁLISE DETALHADA POR COMPONENTE

### Backend - Models

#### ✅ Bom
- Modelos bem estruturados (QuestaoMatematica, QuestaoIngles, QuestaoProgramacao)
- Foreign keys configuradas corretamente
- Índices em torneio_id

#### ❌ Ruim
- Sem validação de campos específicos
- Sem métodos de instância para operações comuns
- Sem hooks para auditoria

### Backend - Controllers

#### ✅ Bom
- GenericController implementado
- CRUD básico funcionando

#### ❌ Ruim
- Sem validação específica para questões
- Sem tratamento de erros adequado
- Sem logging
- Sem suporte a busca/filtro

### Backend - Routes

#### ✅ Bom
- Rotas genéricas configuradas
- Proteção com isAdmin

#### ❌ Ruim
- Sem rotas especializadas para questões
- Sem suporte a busca/filtro
- Sem suporte a duplicação

### Frontend - Components

#### ✅ Bom
- TableManager genérico
- TableModal com validação básica

#### ❌ Ruim
- Sem componente especializado para questões
- Sem preview
- Sem busca/filtro
- Sem edição
- Sem duplicação

### Frontend - Services

#### ✅ Bom
- adminService genérico
- Proxy para acesso fácil

#### ❌ Ruim
- Sem serviço especializado para questões
- Sem cache local
- Sem tratamento de erros

---

## 🔧 RAIZ DOS PROBLEMAS

### 1. Falta de Planejamento
- Módulo de questões foi implementado de forma genérica
- Sem considerar necessidades específicas

### 2. Falta de Especialização
- Tudo usa GenericController
- Sem lógica específica para questões

### 3. Falta de Validação
- Sem validação em múltiplas camadas
- Sem testes

### 4. Falta de Documentação
- Sem guia de como criar questões
- Sem exemplos

### 5. Falta de Testes
- Sem testes unitários
- Sem testes de integração
- Sem testes end-to-end

---

## 📈 IMPACTO NO NEGÓCIO

### Usuários Afetados
- ❌ Administradores: Impossível criar/gerenciar questões
- ❌ Participantes: Sem questões para responder
- ❌ Suporte: Muitos tickets sobre questões

### Funcionalidades Bloqueadas
- ❌ Criar torneio com questões
- ❌ Editar questões
- ❌ Gerenciar questões
- ❌ Visualizar questões

### Riscos
- 🔴 Dados inválidos na BD
- 🔴 Questões órfãs
- 🔴 Violação de integridade referencial
- 🔴 Impossível usar o sistema em produção

---

## ✅ RECOMENDAÇÕES

### Curto Prazo (Imediato)
1. ✅ Criar serviço centralizado de questões
2. ✅ Criar controller especializado
3. ✅ Criar rotas especializadas
4. ✅ Criar componente de formulário
5. ✅ Implementar validação

### Médio Prazo (1-2 semanas)
1. ✅ Criar componente de listagem
2. ✅ Implementar busca/filtro
3. ✅ Implementar edição
4. ✅ Implementar duplicação
5. ✅ Implementar preview

### Longo Prazo (2-4 semanas)
1. ✅ Testes unitários
2. ✅ Testes de integração
3. ✅ Testes end-to-end
4. ✅ Documentação
5. ✅ Auditoria de dados

---

## 🎯 PRÓXIMOS PASSOS

1. **Criar Serviço Backend** (`questoesService.js`)
   - Métodos CRUD para cada modalidade
   - Validação centralizada
   - Busca/filtro
   - Duplicação

2. **Criar Controller Backend** (`QuestoesController.js`)
   - Endpoints especializados
   - Tratamento de erros
   - Logging

3. **Criar Rotas Backend** (`questoesRoutes.js`)
   - Endpoints para CRUD
   - Endpoints para busca/filtro
   - Endpoints para duplicação

4. **Criar Componente Frontend** (`QuestaoForm.jsx`)
   - Seleção de modalidade
   - Campos dinâmicos
   - Validação em tempo real
   - Preview

5. **Criar Componente Frontend** (`QuestoesList.jsx`)
   - Tabela de questões
   - Busca/filtro
   - Ações (editar, deletar, duplicar)

6. **Integrar com AdminDashboard**
   - Adicionar aba "Gerenciar Questões"
   - Integrar componentes

7. **Testes**
   - Testes unitários
   - Testes de integração
   - Testes end-to-end

---

## 📝 CONCLUSÃO

O módulo de Torneios & Questões apresenta **problemas críticos** que impedem seu funcionamento adequado. A refatoração é **urgente e necessária** para:

1. ✅ Permitir criação de questões
2. ✅ Garantir integridade de dados
3. ✅ Melhorar experiência do admin
4. ✅ Preparar para produção

**Estimativa de Tempo**: 15-20 horas de desenvolvimento

**Risco de Não Fazer**: Sistema não funcional em produção

