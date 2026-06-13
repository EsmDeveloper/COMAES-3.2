# ⚡ Comece Aqui - Guia Rápido

## 🚀 5 Minutos para Começar

### 1. Abra 2 Terminais

**Terminal 1 - Backend**:
```bash
cd BackEnd
npm run dev
```

Esperar até ver:
```
🚀 Servidor rodando: http://0.0.0.0:3000
✅ Database sincronizada
```

**Terminal 2 - Frontend**:
```bash
cd FrontEnd
npm run dev
```

Esperar até ver:
```
➜  Local: http://localhost:5173
```

### 2. Abra o Navegador
```
http://localhost:5173
```

### 3. Login como Admin
```
Email: admin@example.com
Senha: admin123
```

---

## 📋 Verificação Rápida - O Que Testar

### ✅ Teste 1: Blocos de Matemática Existem (2 min)
1. Vá a **Admin → Blocos de Questões**
2. Procure blocos com IDs: **22, 23, 24**
3. Verifique: Status = "Pendente", Disciplina = "Matemática"

**Esperado**: 3 blocos com ~10 questões no total

---

### ✅ Teste 2: Criar Múltiplos Rascunhos (3 min)
1. Vá a **Admin → Torneios → Criar Novo**
2. Preencha:
   - Título: "Teste Rascunho 1"
   - Datas: Futuro válido
   - Status: **Rascunho** ← importante
3. Clique **Salvar**
4. Veja mensagem: "Torneio criado com sucesso!" ✅

5. Crie OUTRO rascunho (mesmo processo, diferente título)
6. Verifique: **Aparecem 2 rascunhos na lista** ✅

---

### ❌ Teste 3: Segundo Ativo Deve Falhar (2 min)
1. Assegure-se que existe 1 torneio com status "Ativo"
   - Se não, crie um (mesmo como "Teste Rascunho", mas mude para Ativo)
2. Vá a **Admin → Torneios → Criar Novo**
3. Preencha dados (qualquer coisa válida)
4. **Status: Ativo** ← importante
5. Clique **Salvar**

**Esperado**: 
```
❌ Não é possível criar dois torneios ativos ao mesmo tempo...
```
Na Network tab (F12): **Status 409**

---

### 🔒 Teste 4: tipo_torneio é READ-ONLY (2 min)
1. Crie torneio com tipo = "Específico" → "Programação"
2. Clique **Editar** nesse torneio
3. Verifique: **Tipo de Torneio está bloqueado/desabilitado** 🔒

**Esperado**: Não consegue mudar de "Específico" para "Genérico"

---

### 📅 Teste 5: Validação de Datas (1 min)
1. Vá a **Admin → Torneios → Criar Novo**
2. Tente colocar data no PASSADO
3. Clique **Salvar**

**Esperado**: 
```
❌ A data de início deve ser diferente da hora atual...
```

---

## 🐛 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| Servidor não inicia | Verificar se porta 3000 está livre: `netstat -ano \| grep 3000` |
| Banco não conecta | Verificar credenciais em `.env` (BackEnd) |
| Página branca no frontend | Força recarregar: `Ctrl+Shift+R` |
| Blocos não aparecem | Verificar Network tab (F12) → procurar erro 500 |
| Erro de autenticação | Verificar token JWT em localStorage (F12 → Application) |

---

## 📚 Documentos de Referência

| Documento | Para |
|-----------|------|
| 🎯_RESUMO_IMPLEMENTACAO_FINAL.md | Visão geral técnica |
| 🧪_TESTE_RESTRICOES_TORNEIOS.md | 9 casos de teste completos |
| 📋_BLOCOS_QUESTOES_CRIADOS.md | Detalhes dos blocos criados |
| 🎯_ESTADO_ATUAL_SISTEMA_COMPLETO.md | Status técnico detalhado |

---

## 🎯 Checklist Rápido

```
Ao abrir a aplicação:
☐ Consegue fazer login como admin
☐ Painel Admin abre sem erros
☐ Vê 3 blocos de Matemática
☐ Consegue navegar por abas

Testes de Torneios:
☐ Cria rascunho sem problemas
☐ Cria segundo rascunho (múltiplos permitidos)
☐ Segundo ativo retorna erro 409
☐ tipo_torneio não pode ser mudado

Validações:
☐ Datas no passado são rejeitadas
☐ Mensagens de erro aparecem
☐ Toast notifications funcionam
```

---

## 🔥 Recursos Abertos

Os seguintes arquivos estão abertos no editor:
- `TableManager.jsx` - Gerenciamento de tabelas
- `BlocoQuestoesManager.jsx` - **← Leia este para blocos**
- `QuestoesPendentesTab.jsx` - Questões aguardando aprovação
- `ColaboradoresTab.jsx` - Gestão de colaboradores
- `TorneoController.js` - **← Validações de torneios**

---

## ⏱️ Tempo Estimado

- **Iniciar servidores**: 30 segundos
- **Login**: 10 segundos
- **Teste 1-5**: 10 minutos no total
- **Exploração completa**: 30 minutos

---

## 💡 Dica Pro

Abra Developer Tools (F12) na tab **Console** para ver logs:
- Quando criar/editar torneio
- Quando carregar blocos
- Quando teste restrições

Exemplo de log esperado:
```javascript
[TonneoController] Criando torneio com dados: { titulo: "...", tipo_torneio: "generico" }
[TornamentForm] tipo_torneio alterado: { anterior: "generico", novo: "especifico" }
```

---

**Pronto?** Abra os 2 terminais e comece! 🚀

