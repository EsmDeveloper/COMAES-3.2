# ✅ TESTE DE CORREÇÃO - Tipo de Torneio

## O Problema
O formulário `TournamentForm.jsx` já tinha os campos `tipo_torneio` e `disciplina_especifica` implementados, mas o backend não estava capturando e salvando esses campos na criação de torneios.

## A Solução Implementada

### 1. Backend - `TorneoController.js`

#### Função `createTorneo` (Linhas 44-127)
- ✅ Adicionado destructuring de `tipo_torneio` e `disciplina_especifica` do `req.body`
- ✅ Adicionada validação de `tipo_torneio` (deve ser 'generico' ou 'especifico')
- ✅ Adicionada validação de `disciplina_especifica` (obrigatória se tipo = especifico)
- ✅ Adicionados os campos ao objeto `torneioData` antes de salvar
- ✅ Adicionados logs de debug para verificar os dados recebidos e salvos

#### Função `updateTorneo` (Linhas 131-237)
- ✅ Adicionado destructuring de `tipo_torneio` e `disciplina_especifica`
- ✅ Adicionadas validações equivalentes
- ✅ Adicionados campos ao objeto `updateData`
- ✅ Garantido que torneios genéricos sempre têm `disciplina_especifica = null`
- ✅ Adicionados logs de debug

#### Função `getAllTorneos` (Linhas 28-42)
- ✅ Adicionados `tipo_torneio` e `disciplina_especifica` aos atributos retornados

### 2. Frontend - `TournamentForm.jsx`
✅ Já estava completo com:
- Radio buttons para seleção de tipo (Genérico vs Específico)
- Select condicional para disciplina (só mostra se tipo = especifico)
- Validação de que disciplina é obrigatória para torneios específicos
- Filtragem de blocos por disciplina se torneio for específico
- Payload inclui ambos os campos

### 3. Frontend - `TorneiosTab.jsx`
✅ Já estava correto:
- Passa `payload` completo para o backend (inclui `tipo_torneio` e `disciplina_especifica`)
- Exibe tipo de torneio na tabela com badge visual
- Mostra disciplina específica quando aplicável

## Como Testar

### Via Interface (Frontend)
1. Vá para "Admin Panel" → "Gerenciar Torneios"
2. Clique em "Criar Torneio"
3. Preencha os dados básicos
4. **IMPORTANTE**: No campo "Tipo de Torneio", selecione "Específico"
5. Um novo campo "Disciplina" deve aparecer - selecione uma (ex: Matemática)
6. Clique em "Criar Torneio"
7. Verifique no console (F12):
   - Deve aparecer: `📤 Enviando para backend: {..., tipo_torneio: "especifico", disciplina_especifica: "Matemática"}`
8. Na lista de torneios, deve aparecer com badge "Específico (Matemática)"

### Via Console do Backend
Ao criar um torneio específico, você deve ver:
```
[TorneioController] Criando torneio com dados: {..., tipo_torneio: "especifico", disciplina_especifica: "Matemática"}
[TorneioController] Dados formatados para criar torneio: {
  titulo: "...",
  tipo_torneio: "especifico",
  disciplina_especifica: "Matemática",
  status: "ativo"
}
[TorneioController] Torneio criado com sucesso: {
  id: 52,
  tipo_torneio: "especifico",
  disciplina_especifica: "Matemática"
}
```

### Via cURL (API Direta)
```bash
curl -X POST http://localhost:3000/api/admin/torneos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "titulo": "Torneio Específico de Matemática",
    "descricao": "Um torneio só de matemática",
    "tipo_torneio": "especifico",
    "disciplina_especifica": "Matemática",
    "inicia_em": "2026-06-10T14:00:00",
    "termina_em": "2026-06-10T16:00:00",
    "status": "ativo",
    "criado_por": 1
  }'
```

A resposta deve incluir:
```json
{
  "message": "Torneio criado com sucesso!",
  "torneio": {
    "id": 52,
    "titulo": "Torneio Específico de Matemática",
    "tipo_torneio": "especifico",
    "disciplina_especifica": "Matemática",
    ...
  }
}
```

## Verificação Banco de Dados
Execute a query:
```sql
SELECT id, titulo, tipo_torneio, disciplina_especifica FROM Torneios ORDER BY id DESC LIMIT 5;
```

Você deve ver:
```
id | titulo                      | tipo_torneio | disciplina_especifica
52 | Torneio Específico de Mat. | especifico   | Matemática
```

(Antes da correção, `tipo_torneio` estava sempre como "generico" e `disciplina_especifica` era sempre NULL)

## Status da Correção
✅ **COMPLETO** - O problema foi corrigido. O sistema agora:
1. Captura `tipo_torneio` e `disciplina_especifica` do frontend
2. Valida corretamente
3. Salva no banco de dados
4. Retorna ao frontend com os campos preenchidos
5. Exibe corretamente na interface
