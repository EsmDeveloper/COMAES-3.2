# 🧪 TESTE PRÁTICO - Verificar Correção de Tipo de Torneio

## ✅ Pré-requisitos
- [ ] Frontend compilado: `npm run build`
- [ ] Backend iniciado: `npm run dev` (em `/BackEnd`)
- [ ] Navegador aberto em: `http://localhost:5173` (ou sua URL)
- [ ] Autenticado como Admin
- [ ] Console do navegador aberto: F12 → Console

---

## 📋 Teste 1: Criar Torneio Genérico (Controle)

### Passo a Passo
1. Vá para: **Admin Panel** → **Gerenciar Torneios**
2. Clique: **Criar Torneio**
3. Preencha:
   - Título: `Torneio Genérico Teste`
   - Descrição: `Teste de torneio genérico`
   - Tipo: **Genérico** (selecione o radio button à esquerda)
   - Data Início: `2026-06-10 14:00`
   - Data Fim: `2026-06-10 16:00`
   - Status: `Ativo`
4. Clique: **Criar Torneio**

### Verificações

#### ✓ Frontend Console (F12 → Console)
Procure por:
```
[TournamentService] Creating tournament with payload: {
  titulo: "Torneio Genérico Teste",
  tipo_torneio: "generico",
  disciplina_especifica: "",
  ...
}
[TournamentService] Create response: {
  message: "Torneio criado com sucesso!",
  torneio: {
    tipo_torneio: "generico",
    disciplina_especifica: null,
    ...
  }
}
```

#### ✓ Backend Console (Terminal)
Procure por:
```
[TorneioController] Criando torneio com dados: {
  tipo_torneio: "generico",
  disciplina_especifica: undefined,
  ...
}
[TorneioController] Dados formatados para criar torneio: {
  tipo_torneio: "generico",
  disciplina_especifica: null,
  ...
}
[TorneioController] Torneio criado com sucesso: {
  id: XX,
  tipo_torneio: "generico",
  disciplina_especifica: null
}
```

#### ✓ Interface
- Torneio deve aparecer na tabela com badge: **Genérico** (cor roxa)

#### ✓ Banco de Dados
```sql
SELECT id, titulo, tipo_torneio, disciplina_especifica FROM Torneios 
WHERE titulo = 'Torneio Genérico Teste';

-- Esperado:
-- id | titulo                    | tipo_torneio | disciplina_especifica
-- XX | Torneio Genérico Teste   | generico     | NULL
```

---

## 📋 Teste 2: Criar Torneio Específico (Principal)

### Passo a Passo
1. Vá para: **Admin Panel** → **Gerenciar Torneios**
2. Clique: **Criar Torneio**
3. Preencha:
   - Título: `Torneio Específico Matemática`
   - Descrição: `Teste de torneio específico`
   - **Tipo: Específico** (selecione o radio button à direita) ⚠️ IMPORTANTE
4. **Novo campo deve aparecer**: "Disciplina"
   - Selecione: **Matemática**
5. Preencha datas e status
6. Clique: **Criar Torneio**

### Verificações

#### ✓ Frontend - Comportamento Visual
- [ ] Ao clicar em "Específico", o campo "Disciplina" deve aparecer com animação
- [ ] Ao clicar em "Genérico", o campo deve desaparecer
- [ ] Campo de disciplina deve ser obrigatório quando específico

#### ✓ Frontend Console (F12 → Console)
```
[TournamentService] Creating tournament with payload: {
  titulo: "Torneio Específico Matemática",
  tipo_torneio: "especifico",
  disciplina_especifica: "Matemática",
  ...
}
[TournamentService] Create response status: 201
[TournamentService] Create response: {
  message: "Torneio criado com sucesso!",
  torneio: {
    id: XX,
    titulo: "Torneio Específico Matemática",
    tipo_torneio: "especifico",
    disciplina_especifica: "Matemática",
    ...
  }
}
[TorneiosTab] Torneio criado: {
  tipo_torneio: "especifico",
  disciplina_especifica: "Matemática",
  ...
}
```

#### ✓ Backend Console (Terminal)
```
[TorneioController] Criando torneio com dados: {
  ...,
  tipo_torneio: "especifico",
  disciplina_especifica: "Matemática",
  ...
}
[TorneioController] Dados formatados para criar torneio: {
  ...,
  tipo_torneio: "especifico",
  disciplina_especifica: "Matemática",
  status: "ativo"
}
[TorneioController] Torneio criado com sucesso: {
  id: XX,
  tipo_torneio: "especifico",
  disciplina_especifica: "Matemática"
}
```

#### ✓ Interface
- Torneio deve aparecer na tabela com badge: **Específico (Matemática)** (cor azul)
- Quando passar o mouse, deve mostrar ícone 📚

#### ✓ Banco de Dados
```sql
SELECT id, titulo, tipo_torneio, disciplina_especifica FROM Torneios 
WHERE titulo = 'Torneio Específico Matemática';

-- Esperado:
-- id | titulo                          | tipo_torneio | disciplina_especifica
-- XX | Torneio Específico Matemática  | especifico   | Matemática
```

---

## 📋 Teste 3: Editar Torneio Específico

### Passo a Passo
1. Vá para: **Admin Panel** → **Gerenciar Torneios**
2. Encontre o torneio do Teste 2
3. Clique no ícone: **Edit** (lápis)
4. Altere:
   - Título para: `Torneio Específico Programação` (opcional)
   - **Disciplina para: Programação** (importante)
5. Clique: **Salvar Alterações**

### Verificações

#### ✓ Backend Console
```
[TorneioController] updateData: {
  ...,
  tipo_torneio: "especifico",
  disciplina_especifica: "Programação",
  ...
}
[TorneioController] Torneio atualizado: {
  id: XX,
  tipo_torneio: "especifico",
  disciplina_especifica: "Programação"
}
```

#### ✓ Interface
- Badge deve mudar para: **Específico (Programação)**

#### ✓ Banco de Dados
```sql
SELECT disciplina_especifica FROM Torneios WHERE id = XX;
-- Esperado: Programação
```

---

## 📋 Teste 4: Converter Genérico → Específico

### Passo a Passo
1. Editar o torneio do Teste 1 (Genérico)
2. Mudar tipo para: **Específico**
3. Campo disciplina deve aparecer
4. Selecionar: **Inglês**
5. Salvar

### Verificações

#### ✓ Interface
- Badge deve mudar de "Genérico" para "Específico (Inglês)"

#### ✓ Banco de Dados
```sql
SELECT tipo_torneio, disciplina_especifica FROM Torneios 
WHERE titulo = 'Torneio Genérico Teste';

-- Esperado:
-- tipo_torneio | disciplina_especifica
-- especifico   | Inglês
```

---

## 📋 Teste 5: Validação - Específico sem Disciplina

### Passo a Passo
1. Criar um novo torneio
2. Selecionar tipo: **Específico**
3. NÃO selecionar disciplina
4. Tentar enviar o formulário

### Verificações

#### ✓ Frontend
- Deve aparecer mensagem de erro vermelha: 
  "Disciplina é obrigatória para torneios específicos"
- Botão "Criar Torneio" não deve ficar ativo

#### ✓ Backend (não deve ser atingido)
- Nenhuma request deve chegar ao servidor

---

## 🔍 Checklist de Diagnóstico

Se algo não funcionar, verifique:

### Backend
- [ ] Arquivo `BackEnd/controllers/TorneoController.js` foi modificado?
- [ ] Funções `createTorneo` e `updateTorneo` incluem `tipo_torneio` e `disciplina_especifica`?
- [ ] `getAllTorneos` retorna esses campos nos atributos?
- [ ] Terminal do backend mostra os logs de debug?

### Frontend
- [ ] Frontend foi compilado? `npm run build`
- [ ] Browser foi recarregado? F5 ou Ctrl+Shift+R
- [ ] Cache foi limpo? DevTools → Application → Storage → Clear all

### Banco de Dados
- [ ] Colunas `tipo_torneio` e `disciplina_especifica` existem em `Torneios`?
- [ ] Execute: `DESC Torneios;` para verificar

### API
- [ ] Endpoint é `http://localhost:3000/api/admin/torneos` (não 3001)?
- [ ] Token de autenticação é válido?

---

## 📊 Resultado Esperado

| Campo | Antes (Bug) | Depois (Corrigido) |
|-------|-------------|-------------------|
| Usuario seleciona tipo | "Específico" | "Específico" ✅ |
| Usuario seleciona disciplina | "Matemática" | "Matemática" ✅ |
| Frontend envia | ✓ Correto | ✓ Correto |
| Backend recebe | ❌ tipo_torneio = undefined | ✓ tipo_torneio = "especifico" |
| Backend salva | ❌ generico + null | ✓ especifico + "Matemática" |
| Banco de dados | ❌ generico, null | ✓ especifico, "Matemática" |
| Interface exibe | ❌ Genérico | ✓ Específico (Matemática) |

---

## 📞 Se Algo Não Funcionar

1. **Parar tudo**: `Ctrl+C` em todos os terminais
2. **Limpar cache**: 
   - Browser: F12 → Application → Storage → Clear All
   - Node_modules: `rm -r node_modules package-lock.json` e `npm install`
3. **Recompile**:
   - Frontend: `npm run build`
   - Backend: `npm run dev`
4. **Verifique os logs** no console do backend e browser

---

## ✅ Teste Concluído Com Sucesso!

Se todos os testes passarem:
- ✅ Sistema está funcionando corretamente
- ✅ Torneios são salvos com tipo_torneio e disciplina_especifica corretos
- ✅ Interface exibe os dados corretamente
- ✅ Banco de dados tem os dados corretos
