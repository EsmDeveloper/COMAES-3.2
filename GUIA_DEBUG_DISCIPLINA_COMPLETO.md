# 🔍 GUIA COMPLETO DE DEBUG - Onde Vai a Disciplina?

**STATUS**: ✅ Debug logging implementado em TODOS os pontos críticos

---

## 📍 5 PONTOS CRÍTICOS PARA MONITORAR

### 1️⃣ **FRONTEND - Mudança do Campo (SELECT)**
```
Onde: FrontEnd/src/Paginas/Primarias/CollaboratorRegisterForm.jsx
Quando: Você clica em "Selecione a área" e escolhe uma disciplina
O que aparece no console:
  🎯 MUDANÇA DETECTADA: area_especialidade = "matematica"
     Tipo do valor: string
     Valor está vazio? false
```

**Como verificar**:
1. Abrir formulário de registo
2. Clicar no SELECT "Área de especialidade"
3. Selecionar uma opção (ex: "Matemática")
4. Abrir DevTools (F12)
5. Ir para Console
6. Deve aparecer a mensagem com `area_especialidade = "matematica"`

---

### 2️⃣ **FRONTEND - Resumo Visual (Form State)**
```
Onde: Na própria página, seção "📋 Resumo da sua candidatura"
O que mudou: Agora mostra EXPLICITAMENTE a disciplina selecionada
```

**Como verificar**:
1. No formulário, rolar até "Resumo da sua candidatura"
2. Ver campo "Área:" 
3. Se preencheu corretamente, deve mostrar:
   - ✅ Disciplina preenchida! Pronto para submeter.
   - Valor em verde
4. Se deixou vazio, mostra:
   - ❌ FALTA PREENCHER A DISCIPLINA!

---

### 3️⃣ **FRONTEND - Envio (FormData)**
```
Onde: Console quando clica em "✓ Enviar Candidatura"
O que aparece:
  🔍 ════════════════════════════════════════════════════════
  📤 PREPARANDO FORMDATA PARA ENVIO:
  🔍 Form State ANTES:
  {
    "nome": "Seu Nome",
    "email": "email@test.com",
    "area_especialidade": "matematica",  ← AQUI!
    ...
  }
  ✅ Adicionando: area_especialidade = "matematica"
  📋 FormData construído. Campos:
     - area_especialidade: matematica
  ════════════════════════════════════════════════════════
```

**Como verificar**:
1. Preencher formulário completo
2. Clicar "✓ Enviar Candidatura"
3. DevTools → Console
4. Ver os logs com o FormData sendo construído
5. Procure por: `area_especialidade: matematica`

---

### 4️⃣ **BACKEND - Recepção (req.body)**
```
Onde: Console do backend (terminal onde rodando npm start)
Quando: Após clicar em "Enviar Candidatura"
O que aparece:
  🚨 ════════════════════════════════════════════════════════
  📥 REGISTO COLABORADOR - DUMP COMPLETO DO req.body:
  🔍 Todas as chaves: [
    'nome', 'username', 'email', 'area_especialidade', ...
  ]
  🔍 Conteúdo completo:
  {
    "nome": "Seu Nome",
    "email": "email@test.com",
    "area_especialidade": "matematica",  ← ESTÁ AQUI?
    ...
  }
  ════════════════════════════════════════════════════════
```

**Como verificar**:
1. Abrir terminal do backend
2. Preencher e submeter formulário
3. Procurar pelos logs no terminal
4. Verificar se `area_especialidade` aparece em "Todas as chaves"
5. Verificar se tem o valor no dump JSON

---

### 5️⃣ **BANCO DE DADOS - Persistência**
```
Onde: Executar script de verificação
Comando:
  node BackEnd/verificar_integridade_disciplinas.js

O que aparece:
  📊 Total de colaboradores: 15
  
  ✅ COLABORADORES COM DISCIPLINA:
     Seu Nome | seu@email.com | matematica | pendente
  
  ❌ COLABORADORES SEM DISCIPLINA:
     (lista vazia = SUCESSO!)
```

**Como verificar**:
1. Abrir terminal na pasta do projeto
2. Executar: `node BackEnd/verificar_integridade_disciplinas.js`
3. Ver se seu novo registo aparece em "COM DISCIPLINA"
4. Ver se o valor é "matematica" (ou a que escolheu)

---

## 🔄 FLUXO COMPLETO COM DEBUG

```
1. FRONTEND - FORMULÁRIO
   ├─ Você seleciona disciplina
   ├─ Console mostra: "🎯 MUDANÇA DETECTADA: area_especialidade = ..."
   ├─ Resumo atualiza: "✅ Disciplina preenchida!"
   └─ Estado FRONT: area_especialidade = "matematica" ✅

2. FRONTEND - SUBMISSÃO
   ├─ Clica "Enviar"
   ├─ Console mostra: "📤 PREPARANDO FORMDATA..."
   ├─ Mostra: "✅ Adicionando: area_especialidade = ..."
   └─ FormData contém: area_especialidade ✅

3. NETWORK - HTTP
   ├─ POST /auth/registro-colaborador
   ├─ Content-Type: multipart/form-data
   └─ Body: area_especialidade=matematica ✅

4. BACKEND - RECEPÇÃO
   ├─ Multer processa
   ├─ req.body.area_especialidade = "matematica"
   ├─ Console mostra: "📥 DUMP COMPLETO..."
   ├─ Validação: ✅ Aceita
   └─ Backend recebeu: area_especialidade ✅

5. BACKEND - SALVAMENTO
   ├─ Usuario.create({
   │    disciplina_colaborador: body.area_especialidade,
   │  })
   ├─ BD: INSERT INTO usuarios (disciplina_colaborador) VALUES ('matematica')
   └─ BD salvou: disciplina_colaborador = "matematica" ✅

6. ADMIN PANEL
   ├─ Query: SELECT ... FROM usuarios
   ├─ Resultado: disciplina_colaborador = "matematica"
   ├─ ModalAprovar mostra: "Matemática"
   └─ Admin aprova: ✅ Sucesso!
```

---

## 🚨 POSSÍVEIS PROBLEMAS & SOLUÇÕES

### Problema 1: "Resumo mostra ❌ FALTA PREENCHER"
**Causa**: Você não selecionou nada no dropdown  
**Solução**:
1. Clicar no select "Área de especialidade"
2. Ver opções:
   - Selecione a área (vazio - não clique aqui!)
   - Matemática
   - Programação
   - Inglês
3. Clicar em UMA delas

---

### Problema 2: "Console não mostra nada quando mudo"
**Causa**: DevTools não aberto  
**Solução**:
1. Pressionar F12
2. Ir para "Console"
3. Depois mudar o select
4. Ver logs aparecendo

---

### Problema 3: "FormData não mostra area_especialidade"
**Causa**: Seleção não foi feita antes de submeter  
**Solução**:
1. Preencher formulário INTEIRO
2. Inclusive o SELECT de disciplina
3. DEPOIS submeter
4. Ver nos logs se está lá

---

### Problema 4: "Backend console não mostra nada"
**Causa**: Backend não rodando ou log não aparecendo  
**Solução**:
1. Verificar se backend rodando: `npm start` na pasta BackEnd
2. Backend deve estar em http://localhost:3001
3. Submeter formulário
4. Procurar por "🚨" e "📥" no terminal

---

### Problema 5: "BD mostra sem disciplina ainda"
**Causa**: Dados novos ainda não salvos corretamente  
**Solução**:
1. Verificar TODOS os passos 1-4 acima
2. Se não aparece campo no FormData → problema FRONTEND
3. Se aparece no FormData mas não no backend → problema MIDDLEWARE
4. Se aparece no backend mas não na BD → problema BACKEND

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Antes de dizer "não funciona", verificar:

- [ ] **Passo 1**: Abrir DevTools (F12)
- [ ] **Passo 2**: Ir para Console
- [ ] **Passo 3**: Recarregar página (Ctrl+R)
- [ ] **Passo 4**: Preencher formulário:
  - [ ] Nome: ✅
  - [ ] Email: ✅
  - [ ] Username: ✅
  - [ ] Disciplina (SELECT): ✅
  - [ ] Nível: ✅
  - [ ] Género: ✅
  - [ ] Nascimento: ✅
  - [ ] Senha: ✅
- [ ] **Passo 5**: Resumo mostra "✅ Disciplina preenchida!"
- [ ] **Passo 6**: Clicar "Enviar"
- [ ] **Passo 7**: Console mostra FormData logs
- [ ] **Passo 8**: Terminal backend mostra dump do req.body
- [ ] **Passo 9**: Backend mostra "area_especialidade" no dump
- [ ] **Passo 10**: Esperar 2-3 segundos
- [ ] **Passo 11**: Abrir terminal, rodar verificação:
  ```bash
  node BackEnd/verificar_integridade_disciplinas.js
  ```
- [ ] **Passo 12**: Novo registo aparece em "COM DISCIPLINA" ✅

---

## 📝 FICHEIROS COM DEBUG

| Ficheiro | O Que Debug |
|----------|-----------|
| `FrontEnd/src/Paginas/Primarias/CollaboratorRegisterForm.jsx` | handleChange + handleSubmit |
| `BackEnd/controllers/colaboradorRegistroController.js` | req.body dump |
| `BackEnd/verificar_integridade_disciplinas.js` | Verification script |

---

## 🎯 RESULTADO ESPERADO

Se tudo estiver FUNCIONANDO CORRECTAMENTE:

```
Frontend Console:
  🎯 MUDANÇA DETECTADA: area_especialidade = "matematica"
  📤 PREPARANDO FORMDATA...
  ✅ Adicionando: area_especialidade = "matematica"

Backend Console:
  🚨 REGISTO COLABORADOR - DUMP COMPLETO...
  🔍 Todas as chaves: [..., 'area_especialidade', ...]
  🔍 "area_especialidade": "matematica"

BD Verification:
  ✅ COLABORADORES COM DISCIPLINA: 10
  Seu Nome | seu@email.com | matematica | pendente

Admin Panel:
  Novo registo aparece
  Disciplina: "Matemática" ✅
  Botão "Aprovar": ATIVO (verde) ✅
```

---

## 🆘 SE AINDA NÃO FUNCIONAR

Enviar print screens de:
1. **Frontend Console** (quando muda o select)
2. **Frontend Console** (quando submete)
3. **Backend Console** (logo após submeter)
4. **Output do script de verificação**

Assim posso ver exactamente onde está o problema! 🎯

---

**Versão**: Build 39.83s - Setembro 2026  
**Status**: ✅ Debug completo implementado

