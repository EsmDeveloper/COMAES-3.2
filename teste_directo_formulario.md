# 🔬 TESTE DIRECTO - Rastreie Exatamente o Que Acontece

## Instruções Passo a Passo

### 1. Reiniciar Backend COM DEBUG
```bash
# Abrir terminal na pasta BackEnd
cd BackEnd
npm start
```

**Vai ver no terminal algo como:**
```
🔧 Iniciando configuração do banco de dados...
✅ Conexão estabelecida com sucesso!
🚀 Servidor rodando em http://localhost:3001
```

### 2. Abrir Frontend em Browser
```
http://localhost:5175  (ou a porta que usar)
```

### 3. Abrir DevTools
Pressionar `F12` → ir para "Console"

### 4. Preencher Formulário
- Nome: "Teste Debug"
- Email: "teste@debug.com"
- Username: "teste_debug_123"
- Disciplina: **SELECIONAR UMA** (ex: "Matemática")
- Nível: "Licenciado"
- Género: "Masculino"
- Nascimento: "1990-01-15"
- Senha: "TestPass123!@#"
- Confirmar: "TestPass123!@#"

### 5. Clicar "Enviar Candidatura"

### 6. Verificar TRÊS CONSOLES

#### **CONSOLE 1: Browser (DevTools F12)**
Procure por:
```
🔍 ════════════════════════════════════════════════════════
📤 PREPARANDO FORMDATA PARA ENVIO:
🔍 Form State ANTES: {
   "area_especialidade": "matematica",
   ...
}
✅ Adicionando: area_especialidade = "matematica"
```

**SE VÊRITO → Problema NÃO está no frontend**
**SE NÃO VÊRITO → Problema ESTÁ no frontend (JavaScript)**

---

#### **CONSOLE 2: Terminal Backend**
Procure por:
```
🚨 ════════════════════════════════════════════════════════
📥 REGISTO COLABORADOR - DUMP COMPLETO DO req.body:
🔍 Todas as chaves: [
  'nome', 'email', 'area_especialidade', ...
]
🔍 area_especialidade recebida: "matematica" (tipo: string)
```

**SE VÊRITO "area_especialidade recebida: matematica" → Campo chegou ao backend ✅**
**SE VÊRITO "area_especialidade recebida: undefined" → Campo NÃO chegou ❌**
**SE VÊRITO "area_especialidade recebida: '' (tipo: string)" → Campo vazio ❌**

---

#### **CONSOLE 3: Resultado do Registo**
Se tudo funcionar, ver no browser:
```
✅ Sucesso! Candidatura enviada.
```

Se erro, ver:
```
❌ A área de especialidade é obrigatória.
```

---

##  🎯 Possíveis Resultados

### RESULTADO 1: Funciona Normalmente
```
Browser Console:
   ✅ Adicionando: area_especialidade = "matematica"

Backend Console:
   ✅ area_especialidade recebida: "matematica"
   ✅ Validação passou!

Browser:
   ✅ Sucesso!

BD (depois):
   ✅ Disciplina salva
```
→ **TUDO BOM, PROBLEMA RESOLVIDO!**

---

### RESULTADO 2: Campo Não Chega ao Backend
```
Browser Console:
   ✅ Adicionando: area_especialidade = "matematica"

Backend Console:
   ❌ area_especialidade recebida: undefined
   ❌ VALIDAÇÃO FALHOU:
      Erros: { area_especialidade: "..." }

Browser:
   ❌ A área de especialidade é obrigatória.
```
→ **MULTER NÃO ESTÁ PROCESSANDO O CAMPO**
→ **PROBLEMA: Middleware bloqueando multipart**

---

### RESULTADO 3: Campo Não Sai do Frontend
```
Browser Console:
   ❌ Não aparece "Adicionando: area_especialidade"
   ❌ FormData vazio ou sem o campo

Backend Console:
   ❌ Nada relacionado com registo

Browser:
   ❌ Erro de conexão ou timeout
```
→ **PROBLEMA: FormData construção no React**

---

### RESULTADO 4: Aceita Mas Salva como NULL
```
Browser Console:
   ✅ Adicionando: area_especialidade = "matematica"

Backend Console:
   ✅ area_especialidade recebida: "matematica"
   ✅ Validação passou!

Browser:
   ✅ Sucesso!

BD (depois):
   ❌ Disciplina = NULL
```
→ **PROBLEMA: Usuario.create() não está salvando o campo**
→ **Possível: Model não reconhece o campo**

---

## 📝 O Que Reportar

Se não funcionar, tire PRINTS de:
1. **Browser Console** (output completo)
2. **Terminal Backend** (onde rode npm start)
3. **Admin Panel** (novo colaborador criado)

E diga EXACTAMENTE qual é o output que vê!

---

## ⏱️ Tempo Esperado
- Com debug: 2-3 minutos para ver resultado
- Pode haver mensagens de erro no terminal = NORMAL
- Procure pelas mensagens com 📥 ou ✅ ou ❌

