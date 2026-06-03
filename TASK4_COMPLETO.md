# TASK 4 COMPLETO: Regras de Edição de Questões pelo Colaborador

## STATUS: ✅ COMPLETO

## Implementação das Regras de Edição

### 1. Validação de Acesso Aprimorada ✅
**Localização**: `BackEnd/controllers/QuestoesControllerRefactored.js` (função `validarAcessoQuestao`)

**Antes**: Só verificava disciplina
```javascript
return questao?.disciplina === req.user.disciplina_colaborador;
```

**Depois**: Verifica disciplina E autor da questão
```javascript
return questao?.disciplina === req.user.disciplina_colaborador && 
       questao?.autor_id === req.user.id;
```

### 2. Regras de Edição na Função `atualizar()` ✅
**Localização**: `BackEnd/controllers/QuestoesControllerRefactored.js` (linhas 220-245)

**Regras implementadas para colaborador**:

1. **Colaborador não pode mudar disciplina**
   ```javascript
   delete dados.disciplina;
   ```

2. **Verificação do status atual**
   ```javascript
   const statusAtual = questao.status_aprovacao;
   const statusAprovado = 'aprovada';
   
   if (statusAtual === statusAprovado) {
     // Questão aprovada: colaborador pode editar mas força nova revisão
     console.log(`📝 Colaborador editando questão aprovada (ID: ${id}). Status voltará para "pendente".`);
     dados.status_aprovacao = 'pendente';
   } else {
     // Questão pendente ou rejeitada: mantém status pendente
     dados.status_aprovacao = 'pendente';
   }
   ```

3. **Limpeza de campos de revisão**
   ```javascript
   dados.revisado_por = null;
   dados.revisado_em = null;
   dados.motivo_rejeicao = null;
   ```

### 3. Frontend: Aviso Visual para Questões Aprovadas ✅
**Localização**: `FrontEnd/src/Paginas/Secundarias/MinhasQuestoes.jsx` (componente `QuestaoModal`)

**Aviso adicionado**:
```javascript
{isEdit && isQuestaoAprovada && (
  <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
    <div>
      <p className="font-semibold">Atenção: Questão já aprovada</p>
      <p className="mt-1">
        Ao editar esta questão, ela voltará para status <strong>"pendente"</strong> 
        e precisará ser aprovada novamente por um administrador.
      </p>
    </div>
  </div>
)}
```

### 4. Mensagens de Erro Melhoradas ✅
**Antes**:
- `"Colaborador so pode atualizar questoes da sua disciplina"`
- `"Colaborador so pode deletar questoes da sua disciplina"`

**Depois**:
- `"Colaborador só pode atualizar questões da sua disciplina e que sejam suas"`
- `"Colaborador só pode deletar questões da sua disciplina e que sejam suas"`

### 5. Cenários de Teste Implementados ✅

#### ✅ **Cenários Permitidos**

1. **Colaborador edita questão pendente (criada por ele)**
   - Status permanece "pendente"
   - É permitido

2. **Colaborador edita questão rejeitada (criada por ele)**
   - Status muda para "pendente"
   - É permitido

3. **Colaborador edita questão aprovada (criada por ele)**
   - Status muda para "pendente" (exige nova revisão)
   - Aviso visual no frontend
   - Campos de revisão são limpos

4. **Admin edita qualquer questão**
   - Sem restrições
   - Mantém status atual

#### ❌ **Cenários Bloqueados**

5. **Colaborador tenta editar questão de outro colaborador**
   - Erro 403: `"Colaborador só pode atualizar questões da sua disciplina e que sejam suas"`

6. **Colaborador tenta editar questão de disciplina diferente**
   - Erro 403: `"Colaborador só pode atualizar questões da sua disciplina e que sejam suas"`

### 6. Função `aplicarEscopoColaborador()` Atualizada ✅
**Localização**: `BackEnd/controllers/QuestoesControllerRefactored.js` (função `aplicarEscopoColaborador`)

**Implementação**:
```javascript
const aplicarEscopoColaborador = (req, where = {}) => {
  if (req.user?.isColaborador) {
    where.disciplina = req.user.disciplina_colaborador;
    // Colaborador só vê suas próprias questões
    where.autor_id = req.user.id;  // ← NOVO
  }
  return where;
};
```

**Impacto**: Todas as listagens para colaborador agora filtram apenas suas próprias questões.

### 7. Consistência em Todas as Operações ✅
- **PUT `/api/questoes/:id`** (atualizar) → Regras implementadas
- **DELETE `/api/questoes/:id`** (deletar) → Mesma validação
- **GET `/api/questoes/:id`** (obter) → Mesma validação
- **GET `/api/questoes`** (listar todas) → Filtra apenas questões do colaborador
- **GET `/api/questoes/torneio/:torneioId`** (listar por torneio) → Filtra apenas questões do colaborador

## Arquivos Modificados

### BackEnd
1. **`BackEnd/controllers/QuestoesControllerRefactored.js`** - ✅ Atualizado
   - Função `validarAcessoQuestao()` aprimorada
   - Função `atualizar()` com regras de status
   - Mensagens de erro melhoradas

### FrontEnd
2. **`FrontEnd/src/Paginas/Secundarias/MinhasQuestoes.jsx`** - ✅ Atualizado
   - Aviso visual para edição de questões aprovadas
   - Lógica para detectar status da questão

## Conclusão

**TODOS OS REQUISITOS DA TASK 4 FORAM ATENDIDOS:**

✅ **Regra 1**: Colaborador só pode editar suas próprias questões (verificação `autor_id`)  
✅ **Regra 2**: Colaborador pode editar questões pendentes ou rejeitadas  
✅ **Regra 3**: Se questão aprovada, colaborador pode editar mas status volta para pendente (exige nova revisão)  
✅ **Regra 4**: Admin pode editar qualquer questão mantendo status  
✅ **Regra 5**: Frontend mostra aviso claro para questões aprovadas  
✅ **Regra 6**: Deleção segue as mesmas regras de validação  
✅ **Regra 7**: Mensagens de erro específicas e informativas  

**O sistema de edição de questões está seguro e segue exatamente as regras solicitadas.**