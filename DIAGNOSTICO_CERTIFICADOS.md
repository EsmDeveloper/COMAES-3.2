# 🔍 Diagnóstico e Solução - Erro ao Gerar Certificado

## Problemas Comuns e Soluções

### 1. **Puppeteer não instalado ou com problemas**

**Sintomas:**
- Erro: "Cannot find module 'puppeteer'"
- Erro: "Failed to launch the browser process"

**Soluções:**
```bash
# Reinstalar Puppeteer
cd BackEnd
npm uninstall puppeteer
npm install puppeteer

# Se o problema persistir, instalar com skip-download e depois baixar o Chrome
npm install puppeteer --ignore-scripts
npx puppeteer browsers install chrome
```

### 2. **Falta de dependências do sistema (Linux/Windows)**

**Sintomas:**
- Erro: "error while loading shared libraries"
- Erro: "Failed to launch chrome"

**Solução Windows:**
- Geralmente não há problemas no Windows
- Certifique-se de que o antivírus não está bloqueando o Puppeteer

**Solução Linux:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils
```

### 3. **Diretório de uploads não existe**

**Sintomas:**
- Erro: "ENOENT: no such file or directory"

**Solução:**
```bash
# Criar diretórios necessários
cd BackEnd
mkdir -p uploads/certificados
chmod 755 uploads
chmod 755 uploads/certificados
```

### 4. **Problemas com QRCode**

**Sintomas:**
- Erro: "Cannot find module 'qrcode'"
- QR Code não aparece no certificado

**Solução:**
```bash
cd BackEnd
npm install qrcode
```

### 5. **Problemas com associações do Sequelize**

**Sintomas:**
- Erro: "usuario is not associated to Certificado"
- Erro: "torneio is not associated to Certificado"

**Solução:**
Verificar se o arquivo `models/associations.js` está sendo importado corretamente no `index.js`:

```javascript
// No index.js, adicionar ANTES de usar os modelos:
import './models/associations.js';
```

### 6. **Timeout do Puppeteer**

**Sintomas:**
- Erro: "Navigation timeout of 30000 ms exceeded"
- Processo trava ao gerar PDF

**Solução:**
Já implementado no código com timeout de 120 segundos e `domcontentloaded`.

### 7. **Participação não encontrada**

**Sintomas:**
- Erro: "Participação não encontrada para este torneio/disciplina"

**Solução:**
Verificar se:
- O usuário está inscrito no torneio
- A disciplina está correta (Matemática, Inglês, Programação)
- O status da participação é "confirmado"

```sql
-- Verificar participação
SELECT * FROM participantes_torneios 
WHERE usuario_id = ? 
  AND torneio_id = ? 
  AND disciplina_competida = ?
  AND status = 'confirmado';
```

### 8. **Posição fora do top 3**

**Sintomas:**
- Erro: "Certificado disponível apenas para os 3 primeiros colocados"

**Solução:**
Certificados só são gerados para as 3 primeiras posições. Verificar:

```sql
-- Verificar posição do usuário
SELECT posicao, pontuacao 
FROM participantes_torneios 
WHERE usuario_id = ? 
  AND torneio_id = ? 
  AND disciplina_competida = ?;
```

## 🧪 Como Testar

### Teste Rápido
```bash
cd BackEnd
node test-certificate.js
```

Este script irá:
1. ✅ Verificar conexão com banco de dados
2. ✅ Verificar se usuário e torneio existem
3. ✅ Verificar se Puppeteer está instalado
4. ✅ Verificar se QRCode está instalado
5. ✅ Verificar diretório de uploads
6. ✅ Tentar gerar um certificado de teste

### Teste Manual via API

```bash
# Gerar certificado para um usuário específico
curl -X POST http://localhost:5000/api/certificados/gerar/1/Matemática \
  -H "Content-Type: application/json"

# Verificar certificado gerado
curl http://localhost:5000/api/certificados/meus-certificados/1
```

## 📋 Checklist de Verificação

- [ ] Puppeteer instalado (`npm list puppeteer`)
- [ ] QRCode instalado (`npm list qrcode`)
- [ ] Diretório `uploads/certificados` existe
- [ ] Permissões corretas no diretório uploads
- [ ] Banco de dados conectado
- [ ] Tabela `certificados` existe
- [ ] Associações do Sequelize configuradas
- [ ] Usuário existe no banco
- [ ] Torneio existe no banco
- [ ] Participação confirmada existe
- [ ] Posição do usuário está no top 3

## 🔧 Logs Úteis

Para ativar logs detalhados:

```javascript
// No arquivo generateCertificado.js, adicionar no início:
console.log('[DEBUG] Iniciando geração de certificado');
console.log('[DEBUG] Parâmetros:', { torneioId, usuarioId, disciplina, posicao, pontuacao });
```

## 📞 Próximos Passos

1. Execute o script de teste: `node test-certificate.js`
2. Verifique os logs para identificar o erro específico
3. Siga a solução correspondente acima
4. Se o problema persistir, verifique os logs do servidor

## 🆘 Erros Específicos

### "Error: Failed to launch the browser process"
- **Causa:** Puppeteer não consegue iniciar o Chrome
- **Solução:** Reinstalar Puppeteer ou instalar dependências do sistema

### "ENOENT: no such file or directory"
- **Causa:** Diretório de uploads não existe
- **Solução:** Criar diretório `mkdir -p uploads/certificados`

### "Navigation timeout of 30000 ms exceeded"
- **Causa:** Timeout ao carregar HTML
- **Solução:** Já corrigido com timeout de 120s e `domcontentloaded`

### "usuario is not associated to Certificado"
- **Causa:** Associações do Sequelize não configuradas
- **Solução:** Importar `models/associations.js` no `index.js`

### "Participação não encontrada"
- **Causa:** Usuário não está inscrito ou status não é "confirmado"
- **Solução:** Verificar tabela `participantes_torneios`

### "Certificado disponível apenas para os 3 primeiros colocados"
- **Causa:** Posição do usuário > 3
- **Solução:** Verificar ranking e posição do usuário
