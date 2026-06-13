# 🧪 Teste: Verificar tipo_torneio Persistence

## Problema Relatado
Torneios criados como "Específico" estão mostrando como "Genérico" no painel admin.

## Investigação Realizada

### ✅ Backend - VERIFICADO E CORRETO
1. **Modelo** (`Torneio.js`): Campos `tipo_torneio` e `disciplina_especifica` definidos corretamente
2. **Banco de Dados**: Colunas existem e foram migradas corretamente
3. **Controller** (`TorneoController.js`): 
   - `createTorneo()` salva corretamente ✅
   - `getAllTorneos()` retorna com ambos campos ✅
4. **Teste de Fluxo Completo**: 
   - Criando via banco: `tipo_torneio` salvo como 'especifico' ✅
   - Recuperando: retorna 'especifico' ✅
   - JSON para frontend: inclui 'especifico' ✅

### 🔧 Frontend - MELHORADO
Adicionados console.logs para debug:
- `handleFieldChange`: Log quando `tipo_torneio` muda
- `handleSubmit`: Log detalhado do payload antes de enviar

## Como Testar

### Passo 1: Abrir DevTools do Navegador
1. Pressione `F12` ou `Ctrl+Shift+I`
2. Vá para a aba **Console**

### Passo 2: Criar um Torneio Específico
1. Painel Admin → Torneios
2. Criar Novo Torneio
3. Preencha dados:
   - **Título**: "Torneio Teste Específico"
   - **Descrição**: qualquer coisa
   - **Tipo**: Selecione "Específico"  ← IMPORTANTE
   - **Disciplina**: "Matemática"
   - **Datas**: Válidas
   - **Blocos**: Selecione alguns (opcional)
4. Clique em Salvar

### Passo 3: Verificar Logs no Console
No Console, procure por logs como:

```
[TournamentForm] tipo_torneio alterado: {
  anterior: "generico",
  novo: "especifico",
  timestamp: "2026-06-10T..."
}

[TournamentForm] ✅ Validação passou! Payload completo: {
  tipo_torneio_no_formdata: "especifico",
  tipo_torneio_no_payload: "especifico",
  disciplina_no_formdata: "Matemática",
  disciplina_no_payload: "Matemática",
  ...
}

[TournamentService] Creating tournament with payload: {
  ...
  tipo_torneio: "especifico",
  disciplina_especifica: "Matemática",
  ...
}

[TournamentService] Create response: {
  message: "Torneio criado com sucesso!",
  torneio: {
    id: XXX,
    ...
    tipo_torneio: "especifico",
    disciplina_especifica: "Matemática"
  }
}
```

### Passo 4: Verificar no Painel
Após criar, o torneio deve aparecer na lista com:
- **Badge**: 📚 Específico (Matemática)  ← NÃO 🌍 Genérico

### Se o Problema Persistir:

1. **Força reload**: `Ctrl+Shift+R` (cache limpo)
2. **Verifique o banco**: Vá ao PhpMyAdmin e verifique se a coluna `tipo_torneio` tem valor 'especifico'
3. **Copie os logs do console**: Screenshots do console com os logs do teste

## Resultado Esperado

✅ **Sucesso**: Torneio aparece com badge correto ("📚 Específico (Matemática)")
❌ **Falha**: Torneio aparece com "🌍 Genérico"

## Debug Avançado (se precisar)

Se o badge ainda mostrar incorreto, execute no Console:

```javascript
// Listar todos os torneios em memória
console.log(document.body.innerHTML.match(/tipo_torneio/g))

// Ou abra Network tab (F12 → Network) e veja a resposta de GET /api/admin/torneos
// Verifique se tipo_torneio está presente e com valor correto
```

## Próximas Etapas se Problema Persistir

1. Compartilhe screenshot do console com logs
2. Compartilhe response de GET /api/admin/torneos (aba Network → veja JSON response)
3. Verifique conteúdo do banco: `SELECT id, titulo, tipo_torneio, disciplina_especifica FROM torneios ORDER BY criado_em DESC LIMIT 10;`

---

**Data**: 2026-06-10  
**Status**: Pronto para teste
**Versão Build**: Latest
