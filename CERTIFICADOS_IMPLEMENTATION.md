# 🎓 Sistema de Certificados - Implementação Completa

## ✅ O que foi implementado

### 1. **Backend - Database Model** (`BackEnd/models/Certificado.js`)

- ✅ Modelo Sequelize com 13 campos
- ✅ Relações com Usuario, Torneio e Disciplina
- ✅ Campos: id, torneio_id, usuario_id, disciplina, posicao (1/2/3)
- ✅ Campos: codigo_certificado (único), url_certificado, tipo_medalha
- ✅ Status: gerado | validado | cancelado
- ✅ Metadata em JSON para dados adicionais

### 2. **Backend - Gerador de Certificados** (`BackEnd/certificates/generator/generateCertificado.js`)

- ✅ Função `getMedalData(posicao)` para 3 tipos de medalhas
  - 🥇 Ouro (#FFD700) para campeão
  - 🥈 Prata (#C0C0C0) para vice-campeão
  - 🥉 Bronze (#CD7F32) para terceiro lugar
- ✅ Função `generateQRCode()` para códigos QR únicos
- ✅ Função `getCertificateHTML()` com design moderno cyberpunk
  - Gradiente azul/marinho (#0f3460 → #16213e)
  - Bordas de neon cyan (#1dd1a1)
  - 4 seções: medalha, jogador, QR code, score
  - Animações CSS com @keyframes
  - Estilos print-ready para PDF A4 landscape
- ✅ Função `generateCertificate()` para gerar 1 certificado
  - Query automática do jogador e torneio
  - Código único: CERT-{torneioId}-{usuarioId}-{timestamp}-{uuid}
  - QR code com link de validação
  - Geração de PDF com Puppeteer
  - Persistência em banco de dados
  - Armazenamento em `/uploads/certificados/`
- ✅ Função `generateCertificatesForTournament()` para top 3
  - Query automática dos 3 melhores por score
  - Geração em loop com posições 1, 2, 3
  - Retorna array com resultados

### 3. **Backend - API Routes** (`BackEnd/routes/certificadosRoutes.js`)

- ✅ `GET /api/certificados/:usuarioId/:torneioId/:disciplina` - Obter certificado
- ✅ `POST /api/certificados/gerar/:torneioId/:disciplina` - Gerar para top 3
- ✅ `GET /api/certificados/meus-certificados/:usuarioId` - Listar todos
- ✅ `GET /api/certificados/verificar/:codigo` - Verificar autenticidade
- ✅ `GET /api/certificados/download/:codigo` - Download PDF
- ✅ `DELETE /api/certificados/:id` - Cancelar certificado

### 4. **Backend - Endpoint de Finalização** (`BackEnd/index.js`)

- ✅ `POST /api/torneios/:id/finalizar` - Finaliza torneio e gera certificados
- ✅ Recebe array de disciplinas
- ✅ Marca torneio como finalizado e inativo
- ✅ Chama `generateCertificatesForTournament()` para cada disciplina
- ✅ Retorna certificados gerados

### 5. **Backend - Database Migration** (`BackEnd/migrations/20260416000000-create-certificados-table.js`)

- ✅ Criação completa da tabela `certificados`
- ✅ Todos os campos com tipos corretos
- ✅ Chaves estrangeiras com CASCADE delete
- ✅ Índices para performance:
  - índice em `torneio_id`
  - índice em `usuario_id`
  - índice em `codigo_certificado`
  - índice composto em (torneio_id, usuario_id, disciplina)

### 6. **Frontend - Componente de Certificado** (`FrontEnd/src/certificados/CertificadoNovo.jsx`)

- ✅ Modal elegante com preview visual do certificado
- ✅ Design responsivo (desktop, tablet, mobile)
- ✅ Renderização do certificado com:
  - Decorações de canto (borders cyan)
  - Medalha animada com gradiente
  - Ranking badge (#1/#2/#3)
  - Nome do jogador em Cinzel font
  - Informações do torneio/disciplina
  - Barra de performance visual
  - QR code
  - Código de validação
- ✅ Botão de download PDF com `html2canvas` + `jsPDF`
- ✅ Display de informações adicionais:
  - Posição, disciplina, pontuação
  - Código de validação completo
- ✅ Animações Framer Motion suaves

### 7. **Frontend - Atualização ModalVencedores** (`FrontEnd/src/components/ModalVencedores.jsx`)

- ✅ Adicionados botões "Ver Certificado" para cada vencedor
- ✅ Cores de botão correspondentes (dourado, prata, bronze)
- ✅ Função `handleOpenCertificado()` para abrir modal
- ✅ Estado de certificado para cada posição
- ✅ Integração suave do componente CertificadoNovo

### 8. **Backend - Integração no index.js**

- ✅ Importação do model `Certificado`
- ✅ Importação das rotas `certificadosRoutes`
- ✅ Registro em `app.use('/api/certificados', certificadosRoutes)`

## 🔄 Fluxo de Funcionamento

### Quando um torneio termina:

1. **Frontend** - Exibe ModalVencedores com top 3
2. **Usuário** - Clica "Ver Certificado" para cada vencedor
3. **Frontend** - Abre CertificadoNovo modal com preview
4. **Usuário** - Clica "Descarregar PDF"
5. **Frontend** - Converte HTML para PDF com html2canvas
6. **Sistema** - Fornece opção de download

### Geração automática de certificados:

1. **Administrador** - Chama `POST /api/torneios/:id/finalizar`
2. **Backend** - Marca torneio como finalizado
3. **Backend** - Para cada disciplina:
   - Query top 3 participantes por pontuação
   - Gera certificado com QR code para cada um
   - Salva PDF em `/uploads/certificados/`
   - Persiste em base de dados com status "gerado"
4. **Sistema** - Retorna array com certificados gerados

## 🎨 Design Visual

### Cores Utilizadas:

- **Fundo**: Gradiente azul escuro (#0f3460 → #16213e)
- **Ouro**: #FFD700 (1º lugar - Campeão)
- **Prata**: #C0C0C0 (2º lugar - Vice-campeão)
- **Bronze**: #CD7F32 (3º lugar - Terceiro lugar)
- **Neon**: #1dd1a1 (bordas e destaques)
- **Branco**: #FFFFFF (texto principal)

### Estilos de Badge:

- Formato: #1, #2, #3
- Estilo Rank: S, A, B
- Descrições personalizadas por medalha

### Animações:

- Medal: `@keyframes pulse` com glow
- Componente: fade-in + scale da Framer Motion
- Botões: hover scale com spring physics

## 📋 Checklist de Deployamento

- [ ] Executar migração: `npx sequelize-cli db:migrate`
- [ ] Criar diretório: `BackEnd/uploads/certificados/`
- [ ] Verificar permissões de escrita em `/uploads/certificados/`
- [ ] Instalar dependências: `npm install` (frontend)
- [ ] Verificar Puppeteer instalado: `npm list puppeteer`
- [ ] Verificar QRCode instalado: `npm list qrcode`
- [ ] Testar endpoint de finalização: `POST /api/torneios/1/finalizar`
- [ ] Testar obtenção de certificado: `GET /api/certificados/1/1/Matemática`

## 🧪 Teste Rápido

### 1. Finalizar um torneio:

```bash
curl -X POST http://localhost:3000/api/torneios/1/finalizar \
  -H "Content-Type: application/json" \
  -d '{"disciplinas": ["Matemática", "Programação", "Inglês"]}'
```

### 2. Obter certificado:

```bash
curl http://localhost:3000/api/certificados/meus-certificados/1
```

### 3. Verificar autenticidade:

```bash
curl http://localhost:3000/api/certificados/verificar/CERT-1-1-1234567890-abc123
```

### 4. Download PDF:

```bash
curl http://localhost:3000/api/certificados/download/CERT-1-1-1234567890-abc123 \
  -o certificado.pdf
```

## 📁 Arquivos Criados/Modificados

### Criados:

- ✅ `BackEnd/models/Certificado.js`
- ✅ `BackEnd/certificates/generator/generateCertificado.js`
- ✅ `BackEnd/routes/certificadosRoutes.js`
- ✅ `BackEnd/migrations/20260416000000-create-certificados-table.js`
- ✅ `FrontEnd/src/certificados/CertificadoNovo.jsx`

### Modificados:

- ✅ `BackEnd/index.js` (importações + rotas + endpoint de finalização)
- ✅ `FrontEnd/src/components/ModalVencedores.jsx` (adicionados botões e integração)

## 🔐 Segurança

- ✅ Códigos de certificado únicos com UUID
- ✅ Status tracking (gerado → validado → cancelado)
- ✅ Endpoints de verificação de autenticidade
- ✅ Armazenamento em diretório protegido
- ✅ Soft delete com status cancela do

## 📊 Performance

- ✅ Índices na tabela para queries rápidas
- ✅ Query eficiente para top 3 com ORDER BY + LIMIT
- ✅ Cache de QR codes (base64 em DB)
- ✅ Puppeteer renderizado apenas quando necessário
- ✅ PDFs armazenados, não regenerados

## 🚀 Próximos Passos (Opcional)

1. Compartilhamento de certificados em redes sociais
2. Validação de certificado por QR code em endpoint público
3. Template customizável por disciplina
4. Email automático com certificado após torneio
5. Integração com blockchain para selos digitais
6. Dashboard de certificados emitidos para admin
7. Traduções (PT, EN, ES)

---

**Status**: ✅ IMPLEMENTAÇÃO COMPLETA
**Versão**: 2.0
**Data**: Abril de 2025
**Desenvolvedor**: Sistema COMAES
