# ✅ CORREÇÃO FINAL - Erro "user_id" Resolvido

## 🎯 Problema
```
❌ Unknown column 'user_id' in 'field list'
```

## 🔧 Correções Aplicadas

### 1. Modelo Certificate.js
**Mudança:** Usar nomes das colunas do banco diretamente (português) em vez de mapear

**Antes:**
```javascript
user_id: { type: DataTypes.INTEGER, field: 'usuario_id' }
```

**Depois:**
```javascript
usuario_id: { type: DataTypes.INTEGER }
```

### 2. Associações (associations.js)
**Mudança:** Usar `usuario_id` e `torneio_id` nas foreign keys

**Antes:**
```javascript
Certificate.belongsTo(Usuario, { foreignKey: 'user_id' });
```

**Depois:**
```javascript
Certificate.belongsTo(Usuario, { foreignKey: 'usuario_id' });
```

### 3. Generator (certificates/generator/index.js)
**Mudança:** Usar nomes das colunas do banco em queries e creates

**Antes:**
```javascript
Certificate.findOne({ where: { user_id: userId } })
Certificate.create({ user_id: userId, certificate_code: code })
certificate.certificate_code
```

**Depois:**
```javascript
Certificate.findOne({ where: { usuario_id: userId } })
Certificate.create({ usuario_id: userId, codigo_verificacao: code })
certificate.codigo_verificacao
```

## 📋 Arquivos Modificados

1. ✅ `BackEnd/models/Certificate.js`
2. ✅ `BackEnd/models/associations.js`
3. ✅ `BackEnd/certificates/generator/index.js`

## 🚀 INSTRUÇÕES PARA APLICAR

### Passo 1: Parar o Servidor
```bash
# Pressione Ctrl+C no terminal onde o servidor está rodando
```

### Passo 2: Reiniciar o Servidor
```bash
cd BackEnd
npm start
```

### Passo 3: Testar
```bash
# Em outro terminal
cd BackEnd
node test-certificate.js
```

## ✅ Resultado Esperado

Você deve ver logs como:

```
🔍 Iniciando teste de geração de certificado...
✅ Conexão com banco de dados estabelecida
✅ Usuário encontrado: João Silva
✅ Torneio encontrado: Torneio de Matemática
✅ Puppeteer instalado e importado com sucesso
✅ QRCode instalado e importado com sucesso
✅ Diretório de uploads existe
🎨 Gerando certificado...
✅ ✅ ✅ CERTIFICADO GERADO COM SUCESSO! ✅ ✅ ✅
```

## ❌ Se o Erro Persistir

### Verificar se o servidor foi reiniciado
```bash
# O servidor DEVE ser reiniciado para carregar as mudanças
# Ctrl+C e depois npm start
```

### Verificar estrutura da tabela
```sql
DESCRIBE certificates;
```

**Deve mostrar:**
- `usuario_id` (não `user_id`)
- `torneio_id` (não `tournament_id`)
- `pontuacao` (não `score`)
- `posicao` (não `ranking_position`)
- `codigo_verificacao` (não `certificate_code`)
- `url_certificado` (não `certificate_url`)

### Se a tabela estiver errada
```bash
mysql -u seu_usuario -p seu_banco < BackEnd/fix-certificates-table.sql
```

## 🎯 Mapeamento Completo

| Antes (Inglês) | Depois (Português) |
|----------------|-------------------|
| `user_id` | `usuario_id` |
| `tournament_id` | `torneio_id` |
| `score` | `pontuacao` |
| `ranking_position` | `posicao` |
| `certificate_code` | `codigo_verificacao` |
| `certificate_url` | `url_certificado` |

## 📞 Teste Rápido via API

```bash
curl -X POST http://localhost:5000/api/certificates/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "tournamentId": 1,
    "disciplina": "Matemática"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "certificateURL": "/uploads/certificates/certificado-1-1234567890.pdf",
  "certificateCode": "CERT-12345678",
  "position": 1
}
```

## ✅ Checklist Final

- [ ] Servidor backend foi **PARADO** (Ctrl+C)
- [ ] Servidor backend foi **REINICIADO** (npm start)
- [ ] Tabela `certificates` tem colunas em português
- [ ] Teste executado: `node test-certificate.js`
- [ ] Logs mostram sucesso sem erros de "user_id"

## 🎉 Sucesso!

Se você ver:
```
✅ ✅ ✅ CERTIFICADO GERADO COM SUCESSO! ✅ ✅ ✅
```

**Parabéns! O problema está resolvido! 🎓**

---

**IMPORTANTE:** O servidor DEVE ser reiniciado para que as mudanças tenham efeito!
