# 🔧 GUIA DE DEBUG - Torneio Específico Sendo Salvo como Genérico

**Objetivo**: Identificar exatamente onde o `tipo_torneio` está sendo perdido

---

## 📋 PROCEDIMENTO DE DEBUG

### Passo 1: Abrir o Formulário

1. Acesse: `http://localhost:5173/administrador`
2. Clique no botão azul "Criar Torneio"
3. Modal deve aparecer com o formulário

---

### Passo 2: Abrir Console do Navegador

1. Pressione **F12** (ou Ctrl+Shift+I)
2. Vá para aba **"Console"**
3. Deixe a janela aberta enquanto testa

---

### Passo 3: Preencher Formulário

Preencha os campos exatamente assim:

| Campo | Valor |
|-------|-------|
| Título | "Torneio Debug" |
| Descrição | "Para testes" |
| **Tipo de Torneio** | **"Específico (Uma Disciplina)"** ← IMPORTANTE |
| **Disciplina** | **"Matemática"** ← Deve aparecer após selecionar Específico |
| Inicia em | (data/hora no futuro) |
| Termina em | (data/hora depois de inicia) |

---

### Passo 4: Verificar o Log ANTES de Submeter

**Olhe para o campo "Tipo de Torneio"** na modal:
- [ ] Está em "Específico"?
- [ ] O campo "Disciplina" apareceu abaixo?
- [ ] "Matemática" está selecionado?

Se **NÃO**, há um problema com o formulário condicional.

---

### Passo 5: Submeter Formulário

Clique "Criar Torneio"

---

### Passo 6: Verificar Logs no Navegador (IMPORTANTE!)

No **Console (F12)**, procure pela mensagem:

```
📤 Enviando para backend: Object
```

**Expanda** o objeto clicando nele. Você verá:

```javascript
{
  titulo: "Torneio Debug"
  descricao: "Para testes"
  inicia_em: "2026-06-10T14:00"
  termina_em: "2026-06-10T16:00"
  tipo_torneio: "???"  ← QUAL É O VALOR AQUI?
  disciplina_especifica: "???"  ← E AQUI?
}
```

**📝 ANOTE OS VALORES**:
- `tipo_torneio` = ___________________
- `disciplina_especifica` = ___________________

---

### Passo 7: Verificar Logs do Backend

Na janela do backend (terminal onde rodou `npm start`), procure por:

```
🔄 Criando torneio com dados RECEBIDOS:
```

Você verá algo como:

```
🔍 Valores extraídos:
  - titulo: Torneio Debug
  - tipo_torneio: ??? (tipo: string)
  - disciplina_especifica: ???
```

**📝 ANOTE OS VALORES**:
- `tipo_torneio` (backend) = ___________________
- `disciplina_especifica` (backend) = ___________________

---

### Passo 8: Verificar Dados Salvos no Banco

Após o torneio ser criado, procure pelo log:

```
✅ Torneio criado no banco:
  - tipo_torneio (BD): ???
  - disciplina_especifica (BD): ???
```

**📝 ANOTE OS VALORES**:
- `tipo_torneio` (BD) = ___________________
- `disciplina_especifica` (BD) = ___________________

---

### Passo 9: Comparar os Valores

| Etapa | tipo_torneio | disciplina_especifica |
|-------|--------------|----------------------|
| Frontend (formulário) | Específico? | Matemática? |
| Frontend (antes enviar) | ? | ? |
| Backend (recebido) | ? | ? |
| Backend (BD salvo) | ? | ? |

---

## 🔍 INTERPRETANDO OS RESULTADOS

### Cenário 1: Tudo começa como "generico"
```
Frontend (enviando): tipo_torneio = undefined
```
**Problema**: Formulário não está coletando o valor corretamente
**Solução**: Verificar binding do select

---

### Cenário 2: Frontend envia correto, backend recebe errado
```
Frontend (enviando): tipo_torneio = "especifico" ✅
Backend (recebido): tipo_torneio = undefined ❌
```
**Problema**: Parsing do JSON ou routing incorreto
**Solução**: Verificar endpoint `/api/tournaments`

---

### Cenário 3: Backend recebe correto, BD salva errado
```
Backend (recebido): tipo_torneio = "especifico" ✅
Backend (BD salvo): tipo_torneio = "generico" ❌
```
**Problema**: Hook do Sequelize ou validação
**Solução**: Verificar modelo Torneio.js

---

### Cenário 4: Tudo correto, mas frontend mostra errado
```
Backend (BD salvo): tipo_torneio = "especifico" ✅
Tabela Admin: mostra "Genérico" ❌
```
**Problema**: GET endpoint ou formatação
**Solução**: Verificar como dados são retornados ao frontend

---

## 📞 COMPARTILHAR LOGS

Depois de executar todos os passos, copie e cole aqui:

**Logs do Navegador (F12 > Console)**:
```
[Copie e cole os logs aqui]
```

**Logs do Backend (terminal)**:
```
[Copie e cole os logs aqui]
```

Com esses logs, consigo identificar exatamente onde o problema está!

---

## ⚡ CHECKLIST RÁPIDO

- [ ] Instalei as atualizações (npm install no Backend se necessário)
- [ ] Reiniciei o backend (`npm start`)
- [ ] Acessei `http://localhost:5173/administrador`
- [ ] Abri o Console (F12)
- [ ] Preenchi o formulário com Tipo = "Específico"
- [ ] Procurei por "📤 Enviando para backend"
- [ ] Anotei o valor de `tipo_torneio` no log
- [ ] Procurei por "🔍 Valores extraídos" no backend
- [ ] Anotei o valor recebido
- [ ] Criei documento com os logs
- [ ] Compartilhei comigo

