# ⚡ Guia Rápido: Corrigir Erro de Certificados

## 🎯 Problema
```
❌ Unknown column 'user_id' in field list
```

## ✅ Solução em 3 Passos

### 1️⃣ Reiniciar o Servidor
```bash
cd BackEnd
npm start
```

### 2️⃣ Testar
```bash
node test-certificate.js
```

### 3️⃣ Verificar
- ✅ Logs sem erros
- ✅ PDF criado em `uploads/certificados/`
- ✅ Registro na tabela `certificates`

---

## 🔧 Se Ainda Não Funcionar

### Opção A: Verificar Tabela
```sql
DESCRIBE certificates;
```

**Deve ter estas colunas:**
- `usuario_id` (não `user_id`)
- `torneio_id` (não `tournament_id`)
- `pontuacao` (não `score`)
- `posicao` (não `ranking_position`)
- `codigo_verificacao` (não `certificate_code`)
- `url_certificado` (não `certificate_url`)

### Opção B: Recriar Tabela
```bash
mysql -u seu_usuario -p seu_banco < BackEnd/fix-certificates-table.sql
```

---

## 📊 Estrutura do Sistema

```
Frontend (TournamentFinishedModal.jsx)
    ↓
    POST /api/certificates/generate
    ↓
Backend (certificatesRoutes.js)
    ↓
Generator (certificates/generator/index.js)
    ↓
Model (Certificate.js) ← CORRIGIDO AQUI
    ↓
    user_id → usuario_id
    tournament_id → torneio_id
    score → pontuacao
    ↓
Database (MySQL)
    ↓
Tabela: certificates
```

---

## 🎯 O Que Foi Corrigido

**Antes:**
```javascript
user_id: {
  type: DataTypes.INTEGER,
  // ❌ Tentava usar 'user_id' no banco
}
```

**Depois:**
```javascript
user_id: {
  type: DataTypes.INTEGER,
  field: 'usuario_id', // ✅ Mapeia para 'usuario_id' no banco
}
```

---

## 📝 Checklist Rápido

- [ ] Servidor reiniciado
- [ ] Tabela `certificates` existe
- [ ] Colunas em português (`usuario_id`, `torneio_id`, etc.)
- [ ] Puppeteer instalado
- [ ] Diretório `uploads/certificados` existe

---

## 🆘 Comandos Úteis

```bash
# Verificar se Puppeteer está instalado
npm list puppeteer

# Criar diretório de uploads
mkdir -p uploads/certificados

# Reinstalar Puppeteer (se necessário)
npm uninstall puppeteer && npm install puppeteer

# Testar geração
node test-certificate.js
```

---

## 📞 Arquivos de Ajuda

1. `SOLUCAO_ERRO_CERTIFICADO.md` - Solução completa
2. `DIAGNOSTICO_CERTIFICADOS.md` - Diagnóstico detalhado
3. `COMO_TESTAR_CERTIFICADOS.md` - Manual de testes
4. `fix-certificates-table.sql` - Script SQL de correção

---

## ✅ Sucesso!

Se você ver isto:
```
✅ Certificado gerado com sucesso: CERT-1-1-1234-A1B2
✅ Arquivo criado: certificado_1_1_1234567890.pdf (245678 bytes)
```

**Parabéns! Está funcionando! 🎉**
