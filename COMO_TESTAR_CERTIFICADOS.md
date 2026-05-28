# 🎓 Como Testar a Geração de Certificados

## 📋 Pré-requisitos

Antes de testar, certifique-se de que:

1. ✅ O backend está rodando (`npm start` ou `npm run dev`)
2. ✅ O banco de dados está conectado
3. ✅ Puppeteer está instalado (`npm list puppeteer`)
4. ✅ QRCode está instalado (`npm list qrcode`)

## 🧪 Método 1: Script de Teste Automático

Este é o método mais rápido para diagnosticar problemas:

```bash
cd BackEnd
node test-certificate.js
```

### O que o script faz:
- ✅ Verifica conexão com banco de dados
- ✅ Verifica se usuário e torneio existem
- ✅ Verifica se Puppeteer está instalado
- ✅ Verifica se QRCode está instalado
- ✅ Verifica diretório de uploads
- ✅ Tenta gerar um certificado de teste
- ✅ Mostra logs detalhados de cada etapa

### Ajustar parâmetros do teste:

Edite o arquivo `test-certificate.js` e altere estas linhas:

```javascript
const torneioId = 1;      // ← Altere para o ID do seu torneio
const usuarioId = 1;      // ← Altere para o ID do seu usuário
const disciplina = 'Matemática';  // ← Matemática, Inglês ou Programação
const posicao = 1;        // ← 1, 2 ou 3
const pontuacao = 95.5;   // ← Pontuação do usuário
```

## 🌐 Método 2: Teste via API (Postman/Insomnia/cURL)

### 2.1. Gerar certificados para os 3 primeiros colocados

```bash
POST http://localhost:5000/api/certificados/gerar/:torneioId/:disciplina
```

**Exemplo:**
```bash
curl -X POST http://localhost:5000/api/certificados/gerar/1/Matemática
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "certificatesGenerated": 3,
    "details": [
      {
        "success": true,
        "code": "CERT-1-5-1234-A1B2",
        "url": "/uploads/certificados/certificado_5_1_1234567890.pdf"
      }
    ]
  }
}
```

### 2.2. Buscar certificado de um usuário

```bash
GET http://localhost:5000/api/certificados/:usuarioId/:torneioId/:disciplina
```

**Exemplo:**
```bash
curl http://localhost:5000/api/certificados/1/1/Matemática
```

### 2.3. Listar todos os certificados de um usuário

```bash
GET http://localhost:5000/api/certificados/meus-certificados/:usuarioId
```

**Exemplo:**
```bash
curl http://localhost:5000/api/certificados/meus-certificados/1
```

### 2.4. Verificar certificado por código

```bash
GET http://localhost:5000/api/certificados/verificar/:codigo
```

**Exemplo:**
```bash
curl http://localhost:5000/api/certificados/verificar/CERT-1-5-1234-A1B2
```

### 2.5. Download do certificado

```bash
GET http://localhost:5000/api/certificados/download/:codigo
```

**Exemplo:**
```bash
curl -O http://localhost:5000/api/certificados/download/CERT-1-5-1234-A1B2
```

## 🖥️ Método 3: Teste via Frontend

### 3.1. Verificar se o hook está funcionando

O hook `useCertificado` deve exibir automaticamente o certificado quando:
- O torneio terminou
- O usuário está no top 3
- O usuário tem pontuação válida

### 3.2. Botão manual de download

Se houver um botão "Baixar Certificado" no frontend, clique nele e verifique:
- Se o modal/popup aparece
- Se o PDF é gerado
- Se o download inicia

## 🔍 Verificar Logs

### Logs do Backend

Ao gerar um certificado, você deve ver logs como:

```
[CERTIFICADO] Iniciando geração para: 1, Posição: 1
[CERTIFICADO] Parâmetros: torneioId=1, disciplina=Matemática, pontuacao=95.5
[CERTIFICADO] ✅ Usuário: João Silva
[CERTIFICADO] ✅ Torneio: Torneio de Matemática 2026
[CERTIFICADO] Consultando total de participantes...
[CERTIFICADO] Total de participantes: 25
[CERTIFICADO] Código gerado: CERT-1-1-1234-A1B2
[CERTIFICADO] Gerando QR Code...
[CERTIFICADO] ✅ QR Code gerado com sucesso
[CERTIFICADO] Gerando HTML do certificado...
[CERTIFICADO] HTML gerado (15234 caracteres)
[CERTIFICADO] ✅ Diretório existe: /path/to/uploads/certificados
[CERTIFICADO] Iniciando Puppeteer...
[CERTIFICADO] ✅ Puppeteer iniciado
[CERTIFICADO] Página criada
[CERTIFICADO] Carregando conteúdo HTML...
[CERTIFICADO] ✅ HTML carregado
[CERTIFICADO] Gerando PDF: certificado_1_1_1234567890.pdf
[CERTIFICADO] ✅ PDF gerado e navegador fechado
[CERTIFICADO] ✅ Arquivo criado: certificado_1_1_1234567890.pdf (245678 bytes)
[CERTIFICADO] Salvando no banco de dados...
[CERTIFICADO] ✅ Certificado salvo no banco de dados (ID: 1)
[CERTIFICADO] ✅ ✅ ✅ Certificado gerado com sucesso: CERT-1-1-1234-A1B2
```

### Se houver erro, você verá:

```
[CERTIFICADO] ❌ ❌ ❌ Erro ao gerar certificado: [mensagem do erro]
[CERTIFICADO] Stack trace: [detalhes do erro]
```

## 🗄️ Verificar Banco de Dados

### Verificar se o certificado foi salvo:

```sql
SELECT * FROM certificados 
WHERE usuario_id = 1 
  AND torneio_id = 1 
  AND disciplina = 'Matemática';
```

### Verificar participação do usuário:

```sql
SELECT * FROM participantes_torneios 
WHERE usuario_id = 1 
  AND torneio_id = 1 
  AND disciplina_competida = 'Matemática'
  AND status = 'confirmado';
```

### Verificar ranking:

```sql
SELECT usuario_id, posicao, pontuacao, casos_resolvidos
FROM participantes_torneios 
WHERE torneio_id = 1 
  AND disciplina_competida = 'Matemática'
  AND status = 'confirmado'
ORDER BY posicao ASC
LIMIT 3;
```

## 📁 Verificar Arquivos Gerados

Os certificados são salvos em:

```
BackEnd/uploads/certificados/
```

Liste os arquivos:

```bash
# Windows
dir BackEnd\uploads\certificados

# Linux/Mac
ls -lh BackEnd/uploads/certificados/
```

## ❌ Erros Comuns e Soluções

### Erro: "Utilizador ou torneio não encontrado"

**Solução:**
```sql
-- Verificar se o usuário existe
SELECT id, nome FROM usuarios WHERE id = 1;

-- Verificar se o torneio existe
SELECT id, titulo FROM torneios WHERE id = 1;
```

### Erro: "Participação não encontrada"

**Solução:**
```sql
-- Verificar participação
SELECT * FROM participantes_torneios 
WHERE usuario_id = 1 AND torneio_id = 1;

-- Se não existir, criar participação
INSERT INTO participantes_torneios 
(usuario_id, torneio_id, disciplina_competida, status, posicao, pontuacao)
VALUES (1, 1, 'Matemática', 'confirmado', 1, 95.5);
```

### Erro: "Failed to launch the browser process"

**Solução:**
```bash
# Reinstalar Puppeteer
cd BackEnd
npm uninstall puppeteer
npm install puppeteer

# Ou instalar Chrome manualmente
npx puppeteer browsers install chrome
```

### Erro: "ENOENT: no such file or directory"

**Solução:**
```bash
# Criar diretório de uploads
cd BackEnd
mkdir -p uploads/certificados

# Windows
mkdir uploads\certificados
```

### Erro: "Cannot find module 'qrcode'"

**Solução:**
```bash
cd BackEnd
npm install qrcode
```

## ✅ Checklist Final

Antes de reportar um problema, verifique:

- [ ] Backend está rodando
- [ ] Banco de dados está conectado
- [ ] Puppeteer está instalado
- [ ] QRCode está instalado
- [ ] Diretório `uploads/certificados` existe
- [ ] Usuário existe no banco
- [ ] Torneio existe no banco
- [ ] Participação confirmada existe
- [ ] Posição do usuário está no top 3 (1, 2 ou 3)
- [ ] Logs do backend não mostram erros

## 📞 Próximos Passos

1. Execute o script de teste: `node test-certificate.js`
2. Verifique os logs detalhados
3. Se houver erro, consulte o arquivo `DIAGNOSTICO_CERTIFICADOS.md`
4. Se o problema persistir, compartilhe os logs completos

## 🎉 Sucesso!

Se tudo funcionar, você verá:
- ✅ Logs de sucesso no console
- ✅ Arquivo PDF criado em `uploads/certificados/`
- ✅ Registro no banco de dados na tabela `certificados`
- ✅ Certificado disponível para download via API
