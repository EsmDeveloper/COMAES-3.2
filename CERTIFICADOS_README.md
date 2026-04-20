# 🎓 Sistema de Certificados Digital - COMAES 2.2

## 📋 Resumo Executivo

Implementamos um sistema completo de geração automática e exibição de certificados digitais para os vencedores dos torneios. O sistema suporta:

✅ Geração automática de 3 certificados por torneio (top 3 participantes)
✅ Design moderno com gradientes neon cyberpunk
✅ QR codes únicos para validação
✅ Download em PDF alta resolução
✅ Armazenamento seguro em banco de dados
✅ Verificação de autenticidade

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
├─────────────────────────────────────────────────────────────┤
│  ModalVencedores.jsx ──► [Ver Certificado] ──► CertificadoNovo.jsx
│                                                   - Preview visual
│                                                   - Download PDF
└────────────────────────┬────────────────────────────────────┘
                         │
                    API REST
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   BACKEND (Node.js)                          │
├─────────────────────────────────────────────────────────────┤
│  Routes: certificadosRoutes.js                               │
│  - GET /certificados/:usuarioId/:torneioId/:disciplina       │
│  - POST /certificados/gerar/:torneioId/:disciplina           │
│  - GET /certificados/meus-certificados/:usuarioId           │
│  - GET /certificados/verificar/:codigo                       │
│  - GET /certificados/download/:codigo                        │
│  - DELETE /certificados/:id                                  │
│                                                              │
│  Generator: generateCertificado.js                           │
│  - getMedalData() - Info de medalhas (Ouro/Prata/Bronze)     │
│  - generateQRCode() - Criação de QR codes                    │
│  - getCertificateHTML() - Template HTML/CSS                  │
│  - generateCertificate() - Gera 1 certificado com Puppeteer  │
│  - generateCertificatesForTournament() - Gera top 3          │
│                                                              │
│  Model: Certificado.js                                       │
│  - 13 campos (id, torneio_id, usuario_id, disciplina, etc)   │
│  - Relações com Usuario e Torneio                            │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   DATABASE (Sequelize)                       │
├─────────────────────────────────────────────────────────────┤
│  Tabela: certificados                                        │
│  - Campos: id, torneio_id, usuario_id, disciplina            │
│  - Campos: posicao, pontuacao, codigo_certificado            │
│  - Campos: tipo_medalha, status, metadata                    │
│  - Índices para performance                                  │
└─────────────────────────────────────────────────────────────┘
        ▼
┌─────────────────────────────────────────────────────────────┐
│              ARMAZENAMENTO DE FICHEIROS                      │
├─────────────────────────────────────────────────────────────┤
│  /BackEnd/uploads/certificados/                              │
│  - Ficheiros PDF dos certificados                            │
│  - Organizados por código de certificado                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Design Visual

### Seções do Certificado:

```
┌─────────────────────────────────────────────────────────────┐
│                 [COMAES LOGO] 🦉                             │
│           CERTIFICADO DE VITÓRIA - RANKING OFICIAL           │
│                                                              │
│  ┌───────────┬──────────────────┬──────────────┐            │
│  │  🏆       │  NOME DO JOGADOR  │   SCORE:    │            │
│  │  Medalha  │  (Arial/Cinzel)   │   95 PONTOS │            │
│  │  com      │  Torneio: XYZ     │   ████████  │            │
│  │  Glow     │  Disciplina: MAT   │   [QR Code] │            │
│  │           │  Mensagem de info   │   CERT-123 │            │
│  └───────────┴──────────────────┴──────────────┘            │
│                                                              │
│           🔗 EMITIDO EM | SISTEMA AUTOMÁTICO 🤖            │
└─────────────────────────────────────────────────────────────┘
```

### Cores:

| Posição | Medalha | Cor HTML | Uso                |
| ------- | ------- | -------- | ------------------ |
| 🥇 1º   | Ouro    | #FFD700  | Botão, Borda, Glow |
| 🥈 2º   | Prata   | #C0C0C0  | Botão, Borda, Glow |
| 🥉 3º   | Bronze  | #CD7F32  | Botão, Borda, Glow |
| BG      | Navy    | #0f3460  | Fundo principal    |
| Accent  | Neon    | #1dd1a1  | Bordas, Destaque   |

---

## 🚀 Como Usar

### 1. **Setup Inicial**

```bash
# 1. Executar migração de banco
cd BackEnd
npx sequelize-cli db:migrate

# 2. Criar diretório de uploads (se não existir)
mkdir -p uploads/certificados
chmod 755 uploads/certificados

# 3. Instalar dependências frontend (se necessário)
cd ../FrontEnd
npm install html2canvas jspdf
```

### 2. **Gerar Certificados (Admin)**

Quando um torneio termina, o admin chama:

```bash
POST /api/torneios/1/finalizar
{
  "disciplinas": ["Matemática", "Inglês", "Programação"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Torneio finalizado com sucesso",
  "torneio": { ... },
  "certificados": [
    {
      "id": 1,
      "usuario": { "id": 1, "nome": "João Silva" },
      "posicao": 1,
      "tipo_medalha": "Ouro",
      "codigo_certificado": "CERT-1-1-1234567890-uuid",
      "url_certificado": "/uploads/certificados/CERT-1-1-1234567890-uuid.pdf"
    },
    ...
  ]
}
```

### 3. **Visualizar Certificado (Jogador)**

1. Torneio termina
2. Modal de Vencedores aparece automaticamente
3. Clica "Ver Certificado" para o 1º, 2º ou 3º lugar
4. Abre modal com preview do certificado
5. Clica "Descarregar PDF" para fazer download

### 4. **Verificar Autenticidade (Público)**

```bash
GET /api/certificados/verificar/CERT-1-1-1234567890-uuid
```

**Response:**

```json
{
  "success": true,
  "data": {
    "valido": true,
    "usuario": "João Silva",
    "torneio": "Torneio Matemática 2025",
    "disciplina": "Matemática",
    "posicao": 1,
    "pontuacao": 95.5,
    "dataGeracao": "2025-04-16T10:30:00Z",
    "status": "validado"
  }
}
```

---

## 📊 Dados & Estrutura

### Modelo Certificado:

```javascript
{
  id: INTEGER (PK),
  torneio_id: INTEGER (FK),
  usuario_id: INTEGER (FK),
  disciplina: ENUM('Matemática', 'Inglês', 'Programação'),
  posicao: INTEGER (1, 2, ou 3),
  pontuacao: DECIMAL(10, 2),
  codigo_certificado: STRING (UNIQUE),
  url_certificado: STRING (path do PDF),
  tipo_medalha: ENUM('Ouro', 'Prata', 'Bronze'),
  data_geracao: DATE,
  data_validacao: DATE (NULL até validar),
  status: ENUM('gerado', 'validado', 'cancelado'),
  metadata: JSON (dados adicionais),
  criado_em: DATE (timestamp),
  atualizado_em: DATE (timestamp)
}
```

### Exemplo de QR Code:

O QR code codifica uma URL assim:

```
https://comaes.edu.pt/certificados/validar/CERT-1-1-1234567890-uuid
```

---

## 🧪 Testes Rápidos

### Teste 1: Finalizar Torneio

```bash
curl -X POST http://localhost:3000/api/torneios/1/finalizar \
  -H "Content-Type: application/json" \
  -d '{"disciplinas": ["Matemática"]}'
```

### Teste 2: Listar Meus Certificados

```bash
curl http://localhost:3000/api/certificados/meus-certificados/1
```

### Teste 3: Verificar Autenticidade

```bash
curl http://localhost:3000/api/certificados/verificar/CERT-1-1-1234567890-abc123
```

### Teste 4: Download PDF

```bash
curl http://localhost:3000/api/certificados/download/CERT-1-1-1234567890-abc123 \
  -o certificado.pdf
```

---

## 📁 Ficheiros Criados

```
BackEnd/
├── models/
│   └── Certificado.js                          [NOVO]
├── certificates/
│   └── generator/
│       └── generateCertificado.js              [NOVO]
├── routes/
│   └── certificadosRoutes.js                   [NOVO]
├── migrations/
│   └── 20260416000000-create-certificados-table.js [NOVO]
└── index.js                                    [MODIFICADO]

FrontEnd/
└── src/
    ├── certificados/
    │   └── CertificadoNovo.jsx                 [NOVO]
    └── components/
        └── ModalVencedores.jsx                 [MODIFICADO]
```

---

## 🔒 Segurança

- ✅ Códigos de certificado únicos com UUID v4
- ✅ Status tracking para auditoria
- ✅ Armazenamento em diretório protegido
- ✅ Endpoint de verificação públic o (sem auth)
- ✅ Soft delete com status "cancelado"
- ✅ Timestamps automáticos

---

## ⚡ Performance

- 🚀 Índices em campos chave (torneio_id, usuario_id, codigo)
- 📊 Query otimizada para top 3 (LIMIT 3)
- 🎨 QR codes em base64 armazenados (não regenerados)
- 📄 PDFs cacheados em disco
- 🔄 Puppeteer renderizado sob demanda

---

## 🎯 Funcionalidades

### ✅ Implementadas:

- [x] Geração automática de certificados
- [x] Design moderno com cyberpunk aesthetic
- [x] QR codes únicos
- [x] Download em PDF
- [x] Verificação de autenticidade
- [x] Base de dados estruturada
- [x] API completa
- [x] Frontend responsivo
- [x] Animações suaves

### 🔮 Possíveis Melhorias:

- [ ] Partilha em redes sociais
- [ ] Email automático com certificado
- [ ] Assinatura digital/Blockchain
- [ ] Templates customizáveis por disciplina
- [ ] Dashboard de certificados para admin
- [ ] Tradução (PT, EN, ES)
- [ ] Suporte para múltiplas assinaturas
- [ ] Validação QR em app mobile

---

## 🐛 Troubleshooting

### Problema: Certificados não são gerados

**Solução:**

1. Verificar se Puppeteer está instalado: `npm list puppeteer`
2. Verificar permissões de `/uploads/certificados/`
3. Ver logs do servidor para erros

### Problema: QR codes não aparecem

**Solução:**

1. Verificar se qrcode está instalado: `npm list qrcode`
2. Verificar se a biblioteca está sendo importada corretamente

### Problema: PDF não é criado

**Solução:**

1. Verificar se Puppeteer consegue renderizar
2. Testar HTML manualmente em browser
3. Aumentar timeout do Puppeteer se necessário

---

## 📞 Suporte

Para mais informações ou reportar bugs, contacte o time de desenvolvimento.

**Status**: ✅ COMPLETO E PRONTO PARA PRODUÇÃO
**Versão**: 2.0
**Atualizado**: Abril 2025

---

## 📚 Referências

- Sequelize ORM: https://sequelize.org/
- Puppeteer PDF: https://pptr.dev/
- QRCode lib: https://www.npmjs.com/package/qrcode
- Framer Motion: https://www.framer.com/motion/
- Tailwind CSS: https://tailwindcss.com/

---

**Desenvolvido para COMAES - Competições Educativas Online**
