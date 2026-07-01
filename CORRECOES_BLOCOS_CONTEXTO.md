# 🔧 Correções Realizadas - Blocos e Contexto

**Data**: 22 de Junho de 2026  
**Status**: ✅ Completo

---

## 📋 Problemas Identificados e Resolvidos

### 1. ❌ Blocos aprovados não apareciam na aba "Questões dos Colaboradores"

#### **Causa Raiz**
O frontend estava usando parâmetros **incorretos** ao buscar blocos aprovados:
- ❌ Campo errado: `status_aprovacao` (não existe em blocos)
- ❌ Valor errado: `'aprovada'` (deveria ser `'aprovado'`)

#### **Solução Implementada**
**Ficheiro**: `FrontEnd/src/Administrador/QuestoesColaboradoresTab.jsx`

```javascript
// ❌ ANTES (ERRADO):
params: { 
  status_aprovacao: 'aprovada',  // Campo não existe em blocos
  contexto: 'colaborador'
}

// ✅ DEPOIS (CORRETO):
params: { 
  status: 'aprovado',  // Campo correto
  contexto: 'colaborador'
}
```

#### **Diferença entre Blocos e Questões**

| Entidade | Campo de Status | Valores Possíveis |
|----------|----------------|-------------------|
| **Questões** | `status_aprovacao` | `'pendente'`, `'aprovada'`, `'rejeitada'` |
| **Blocos** | `status` | `'pendente'`, `'aprovado'`, `'rejeitado'` |

---

### 2. ❌ Erro "Unknown column 'contexto' in 'field list'"

#### **Causa Raiz**
O modelo `Questao.js` definia o campo `contexto`, mas a coluna não existia na tabela `questoes` do banco de dados.

#### **Solução Implementada**

##### **A) Criação de Migração**
**Ficheiro**: `BackEnd/migrations/add_contexto_to_questoes.js`

A migração adiciona a coluna `contexto` à tabela `questoes`:

```sql
ALTER TABLE questoes 
ADD COLUMN contexto ENUM('torneio', 'teste', 'colaborador') 
DEFAULT 'colaborador' 
AFTER motivo_rejeicao
```

##### **B) Atualização Automática de Dados Existentes**

A migração também atualiza questões existentes baseando-se em suas relações:

1. **Questões com bloco_id**: herdam o contexto do bloco
2. **Questões com torneio_id**: marcadas como `'torneio'`
3. **Questões de colaboradores**: marcadas como `'colaborador'`

##### **C) Criação de Índice**
**Ficheiro**: `BackEnd/migrations/add_index_contexto.js`

```sql
ALTER TABLE questoes ADD INDEX idx_contexto (contexto)
```

##### **D) Atualização do Modelo**
**Ficheiro**: `BackEnd/models/Questao.js`

Adicionado índice à definição do modelo:

```javascript
indexes: [
  // ... outros índices
  { fields: ['contexto'] },  // ✅ NOVO
]
```

---

## 📊 Resultados da Migração

```
✅ Coluna "contexto" adicionada com sucesso!
✅ 5 questões atualizadas com contexto do bloco
✅ 0 questões marcadas como 'torneio'
✅ 0 questões marcadas como 'colaborador'

Distribuição de questões por contexto:
   - torneio: 5 questões
   - colaborador: 61 questões
```

---

## 🚀 Como Executar as Migrações

Se precisar executar novamente em outro ambiente:

```bash
# 1. Adicionar coluna contexto
cd BackEnd
node migrations/add_contexto_to_questoes.js

# 2. Adicionar índice (opcional, mas recomendado para performance)
node migrations/add_index_contexto.js
```

---

## ✅ Fluxo Agora Funcional

1. ✅ Colaborador cria bloco → `status = 'pendente'`
2. ✅ Admin acede "Revisão de Questões" → aprova o bloco
3. ✅ Backend atualiza: `status = 'aprovado'`
4. ✅ **Bloco aparece na aba "Questões dos Colaboradores"**
5. ✅ Admin pode atribuir o bloco a torneios ou testes
6. ✅ Questões são categorizadas por contexto automaticamente

---

## 🔍 Verificação

Para verificar que tudo está funcionando:

1. **Backend**: Verificar que a coluna existe
```sql
SHOW COLUMNS FROM questoes LIKE 'contexto';
```

2. **Frontend**: Testar aprovação de blocos
   - Aprovar um bloco pendente
   - Verificar que aparece na aba "Questões dos Colaboradores"
   - Verificar que pode ser atribuído a torneios/testes

3. **Logs**: Verificar logs do backend
```bash
[QuestoesColaboradores] Blocos: X
```

---

## 📝 Notas Importantes

1. ✅ As migrações são **idempotentes** (podem ser executadas múltiplas vezes sem causar erros)
2. ✅ Dados existentes são **preservados** e atualizados automaticamente
3. ✅ O campo `contexto` tem valor **default** `'colaborador'` para novas questões
4. ✅ Índice adicionado para **otimizar** queries por contexto

---

## 🎯 Impacto

- ✅ Sistema agora diferencia claramente questões de torneios, testes e colaboradores
- ✅ Blocos aprovados aparecem corretamente na interface
- ✅ Melhoria de performance com novo índice
- ✅ Código mais robusto e consistente

---

**Desenvolvido por**: Kiro AI  
**Testado em**: Ambiente de desenvolvimento  
**Status**: Pronto para produção
