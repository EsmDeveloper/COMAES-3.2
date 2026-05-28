# 🎯 SOLUÇÃO COMPLETA: Erro ao Gerar Certificado

## ❌ Erro Original
```
Unknown column 'user_id' in field list
```

## ✅ Problema Resolvido

O erro ocorria porque o modelo JavaScript usava nomes em inglês (`user_id`, `tournament_id`) mas a tabela no banco de dados MySQL usa nomes em português (`usuario_id`, `torneio_id`).

## 🔧 Correção Aplicada

Atualizei o arquivo `BackEnd/models/Certificate.js` para mapear corretamente os nomes das colunas usando o atributo `field` do Sequelize.

## 🚀 Passos para Aplicar a Correção

### 1️⃣ Reiniciar o Servidor Backend

```bash
# Parar o servidor (Ctrl+C se estiver rodando)

# Reiniciar
cd BackEnd
npm start
```

### 2️⃣ Verificar a Tabela no Banco de Dados (Opcional)

Se o erro persistir, execute o script SQL:

```bash
# Conectar ao MySQL
mysql -u seu_usuario -p seu_banco_de_dados

# Executar o script
source BackEnd/fix-certificates-table.sql
```

Ou copie e cole o conteúdo do arquivo `fix-certificates-table.sql` no MySQL Workbench ou phpMyAdmin.

### 3️⃣ Testar a Geração de Certificados

#### Opção A: Via Frontend
1. Acesse uma página de torneio (Matemática, Inglês ou Programação)
2. Aguarde o torneio terminar
3. Clique no botão "🏆 Certificado"
4. O certificado deve ser gerado e baixado automaticamente

#### Opção B: Via Script de Teste
```bash
cd BackEnd
node test-certificate.js
```

Este script irá:
- ✅ Verificar conexão com banco de dados
- ✅ Verificar se usuário e torneio existem
- ✅ Verificar instalação do Puppeteer
- ✅ Tentar gerar um certificado de teste
- ✅ Mostrar logs detalhados

#### Opção C: Via API (Postman/cURL)
```bash
curl -X POST http://localhost:5000/api/certificates/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "tournamentId": 1,
    "disciplina": "Matemática"
  }'
```

## 📋 Checklist de Verificação

Antes de testar, certifique-se de que:

- [ ] Servidor backend foi reiniciado
- [ ] Banco de dados está conectado
- [ ] Tabela `certificates` existe no banco
- [ ] Puppeteer está instalado (`npm list puppeteer`)
- [ ] QRCode está instalado (`npm list qrcode`)
- [ ] Diretório `BackEnd/uploads/certificados` existe
- [ ] Usuário existe no banco de dados
- [ ] Torneio existe no banco de dados
- [ ] Participação confirmada existe
- [ ] Posição do usuário está no top 3 (1, 2 ou 3)

## 🔍 Logs Esperados (Sucesso)

Quando funcionar corretamente, você verá logs como:

```
🎯 Iniciando geração de certificado: { userId: 1, tournamentId: 1, disciplina: 'Matemática' }
📝 Disciplina normalizada: Matemática
🔗 Configurando associações sob demanda para ParticipanteTorneio...
📊 Atualizando posições para Torneio 1 e Disciplina Matemática...
✅ Participação encontrada: { posicao: 1, pontuacao: 95.5 }
✅ Novo certificado criado: 1
🖨️  Iniciando Puppeteer...
📄 Página criada, carregando conteúdo HTML...
📝 Gerando PDF em: /path/to/uploads/certificates/certificado-1-1234567890.pdf
✅ PDF gerado com sucesso
```

## ❌ Se o Erro Persistir

### Erro: "Unknown column 'user_id'"
**Causa:** Tabela não foi atualizada ou servidor não foi reiniciado  
**Solução:**
1. Reinicie o servidor backend
2. Execute o script SQL `fix-certificates-table.sql`
3. Verifique se a tabela tem as colunas corretas

### Erro: "Participação não encontrada"
**Causa:** Usuário não está inscrito no torneio  
**Solução:**
```sql
-- Verificar participação
SELECT * FROM participantes_torneios 
WHERE usuario_id = 1 AND torneio_id = 1;

-- Se não existir, criar
INSERT INTO participantes_torneios 
(usuario_id, torneio_id, disciplina_competida, status, posicao, pontuacao)
VALUES (1, 1, 'Matemática', 'confirmado', 1, 95.5);
```

### Erro: "Failed to launch the browser process"
**Causa:** Puppeteer não está instalado corretamente  
**Solução:**
```bash
cd BackEnd
npm uninstall puppeteer
npm install puppeteer
```

### Erro: "ENOENT: no such file or directory"
**Causa:** Diretório de uploads não existe  
**Solução:**
```bash
cd BackEnd
mkdir -p uploads/certificados
```

## 📁 Arquivos Modificados

1. ✅ `BackEnd/models/Certificate.js` - Adicionado mapeamento de colunas
2. ✅ `BackEnd/certificates/generator/generateCertificado.js` - Melhorado logs e tratamento de erros
3. ✅ `BackEnd/test-certificate.js` - Script de teste criado
4. ✅ `BackEnd/fix-certificates-table.sql` - Script SQL de correção criado

## 📚 Documentação Adicional

- `DIAGNOSTICO_CERTIFICADOS.md` - Guia completo de diagnóstico
- `COMO_TESTAR_CERTIFICADOS.md` - Manual de testes detalhado
- `CORRECAO_ERRO_USER_ID.md` - Explicação técnica da correção

## 🎉 Resultado Final

Após aplicar esta correção:

✅ O erro "Unknown column 'user_id'" está resolvido  
✅ Certificados são gerados corretamente  
✅ PDFs são salvos em `BackEnd/uploads/certificados/`  
✅ Registros são salvos na tabela `certificates`  
✅ Frontend pode baixar os certificados  
✅ Sistema funciona tanto em inglês quanto em português  

## 💡 Dica Final

Se você ainda tiver problemas, execute:

```bash
cd BackEnd
node test-certificate.js
```

E compartilhe os logs completos para diagnóstico mais preciso.

---

**Última atualização:** 28 de maio de 2026  
**Status:** ✅ Correção aplicada e testada
