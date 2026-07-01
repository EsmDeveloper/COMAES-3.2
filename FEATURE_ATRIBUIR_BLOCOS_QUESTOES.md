# ✨ NOVA FUNCIONALIDADE: Atribuir Blocos/Questões a Torneios ou Testes

## 📋 RESUMO

Adicionada funcionalidade para permitir que administradores atribuam blocos e questões aprovados dos colaboradores para uso em **Torneios** ou **Testes de Conhecimento**.

## 🎯 PROBLEMA RESOLVIDO

Na aba "Questões dos Colaboradores", os blocos e questões aprovados não tinham uma forma de serem movidos para as categorias de destino (Torneios ou Testes).

## ✨ SOLUÇÃO IMPLEMENTADA

### Frontend - Componentes Adicionados:

#### 1. **Novo Botão "Atribuir"**
- **Nos Cards de Blocos**: Botão verde com ícone Send entre "Visualizar" e "Deletar"
- **Na Tabela de Questões**: Ícone roxo Send entre "Visualizar" e "Deletar"

#### 2. **Modal de Seleção de Destino**
Interface elegante com 2 opções:
- **Torneios**: Marca azul - "Será usado em competições e torneios"
- **Testes de Conhecimento**: Marca roxa - "Será usado em testes públicos e avaliações"

#### 3. **Estados Adicionados**
```javascript
const [modalAtribuirAberto, setModalAtribuirAberto] = useState(false);
const [destinoSelecionado, setDestinoSelecionado] = useState(''); // 'torneio' | 'teste'
```

#### 4. **Funções Implementadas**

**abrirModalAtribuir:**
```javascript
const abrirModalAtribuir = (item, tipo) => {
  setItemSelecionado(item);
  setTipoItem(tipo); // 'bloco' ou 'questao'
  setDestinoSelecionado('');
  setModalAtribuirAberto(true);
};
```

**handleAtribuirItem:**
```javascript
const handleAtribuirItem = async () => {
  // Valida seleção
  if (!itemSelecionado || !destinoSelecionado) return;
  
  // Chama API
  const endpoint = tipoItem === 'bloco'
    ? `/api/admin/blocos/${id}/atribuir`
    : `/api/admin/questoes/${id}/atribuir`;
  
  const response = await api.patch(endpoint, {
    destino: destinoSelecionado // 'torneio' ou 'teste'
  }, { token });
  
  // Remove item da lista (foi movido)
  if (response.success) {
    // Remove do estado local
    // Mostra feedback de sucesso
  }
};
```

## 🔧 BACKEND - O QUE PRECISA SER IMPLEMENTADO

### 1. **Rota para Blocos**
```javascript
PATCH /api/admin/blocos/:id/atribuir
```

**Request Body:**
```json
{
  "destino": "torneio" | "teste"
}
```

**Response Success:**
```json
{
  "sucesso": true,
  "mensagem": "Bloco atribuído com sucesso",
  "dados": {
    "bloco": { ... }
  }
}
```

**Lógica:**
- Buscar bloco por ID
- Validar que `destino` é 'torneio' ou 'teste'
- Atualizar campo `categoria` ou `tipo_uso` do bloco
- Opcionalmente: Atualizar todas as questões do bloco com o mesmo destino
- Retornar bloco atualizado

### 2. **Rota para Questões**
```javascript
PATCH /api/admin/questoes/:id/atribuir
```

**Request Body:**
```json
{
  "destino": "torneio" | "teste"
}
```

**Response Success:**
```json
{
  "sucesso": true,
  "mensagem": "Questão atribuída com sucesso",
  "dados": {
    "questao": { ... }
  }
}
```

**Lógica:**
- Buscar questão por ID
- Validar que `destino` é 'torneio' ou 'teste'
- Atualizar campo `categoria` ou `tipo_uso` da questão
- Retornar questão atualizada

### 3. **Modelo de Dados (Sugestão)**

Se ainda não existir, adicionar campo na tabela `blocos_questoes` e `questoes`:

```sql
ALTER TABLE blocos_questoes ADD COLUMN tipo_uso VARCHAR(20) DEFAULT 'colaborador';
-- Valores possíveis: 'colaborador', 'torneio', 'teste'

ALTER TABLE questoes ADD COLUMN tipo_uso VARCHAR(20) DEFAULT 'colaborador';
-- Valores possíveis: 'colaborador', 'torneio', 'teste'
```

Ou usar campo existente se já houver alguma categorização.

### 4. **Validações Backend**
- ✅ Verificar se ID existe
- ✅ Verificar se status é 'aprovado'
- ✅ Validar que destino é 'torneio' ou 'teste'
- ✅ Verificar permissões de admin
- ✅ Retornar erro 404 se não encontrar
- ✅ Retornar erro 400 se validação falhar

## 📂 ARQUIVOS MODIFICADOS

### Frontend:
- ✅ `FrontEnd/src/Administrador/QuestoesColaboradoresTab.jsx`

### Backend (A IMPLEMENTAR):
- 🔲 `BackEnd/controllers/ColaboradorBlocosQuestoesControllerV2.js` (ou controller apropriado)
  - Adicionar `atribuirBlocoAdmin`
  - Adicionar `atribuirQuestaoAdmin`

- 🔲 `BackEnd/routes/colaboradorBlocosQuestoesRoutes.js` (ou rotas apropriadas)
  - `router.patch('/admin/blocos/:id/atribuir', auth, isAdmin, atribuirBlocoAdmin)`
  - `router.patch('/admin/questoes/:id/atribuir', auth, isAdmin, atribuirQuestaoAdmin)`

- 🔲 `BackEnd/models/BlocoQuestoes.js` (se necessário adicionar campo)
- 🔲 `BackEnd/models/Questao.js` (se necessário adicionar campo)

## 🎨 DESIGN DO MODAL

```
┌─────────────────────────────────────┐
│ 🚀 Atribuir Bloco                   │
├─────────────────────────────────────┤
│ Selecione para onde deseja          │
│ atribuir o bloco "Matemática        │
│ Avançada":                          │
│                                      │
│ ┌─────────────────────────────────┐ │
│ │ ⚪ Torneios                      │ │
│ │ Será usado em competições e     │ │
│ │ torneios                         │ │
│ └─────────────────────────────────┘ │
│                                      │
│ ┌─────────────────────────────────┐ │
│ │ ⚪ Testes de Conhecimento        │ │
│ │ Será usado em testes públicos   │ │
│ │ e avaliações                     │ │
│ └─────────────────────────────────┘ │
│                                      │
│ [Cancelar]  [🚀 Atribuir]          │
└─────────────────────────────────────┘
```

## 🔄 FLUXO COMPLETO

1. **Admin acessa "Questões dos Colaboradores"**
2. **Vê blocos/questões aprovados**
3. **Clica em "Atribuir" (botão verde/roxo)**
4. **Modal abre com 2 opções**
5. **Seleciona destino (Torneios ou Testes)**
6. **Clica em "Atribuir"**
7. **Frontend chama API PATCH**
8. **Backend atualiza categoria/tipo_uso**
9. **Item desaparece da lista de Colaboradores**
10. **Item aparece na aba de destino (Torneios ou Testes)**

## ✅ PRÓXIMOS PASSOS

### Frontend: ✅ Completo
- ✅ Botão "Atribuir" nos cards de blocos
- ✅ Botão "Atribuir" na tabela de questões
- ✅ Modal de seleção de destino
- ✅ Função de API call
- ✅ Feedback visual (toast)
- ✅ Remoção do item da lista após sucesso

### Backend: 🔲 A Implementar
1. Criar rotas `PATCH /api/admin/blocos/:id/atribuir`
2. Criar rotas `PATCH /api/admin/questoes/:id/atribuir`
3. Implementar controllers com validações
4. Adicionar campo `tipo_uso` nas tabelas (se necessário)
5. Testar endpoints

### Testes: 🔲 A Fazer
1. Testar atribuição de bloco para torneios
2. Testar atribuição de bloco para testes
3. Testar atribuição de questão para torneios
4. Testar atribuição de questão para testes
5. Verificar que itens aparecem nas abas corretas
6. Testar validações e erros

---

**Data:** 22/06/2026  
**Status:** Frontend ✅ | Backend 🔲 | Testes 🔲  
**Prioridade:** Média (melhoria de fluxo de trabalho)
