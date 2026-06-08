# 🚀 Guia de Implementação Passo a Passo - Sistema de Torneios Melhorado

**Status:** 📋 PRONTO PARA IMPLEMENTAÇÃO  
**Data:** 8 de Junho de 2026  
**Complexidade:** ⭐⭐⭐ Médio (3 semanas recomendadas)

---

## 📋 PRÉ-REQUISITOS

- ✅ Node.js 18+
- ✅ Sequelize CLI instalado
- ✅ Database local para testes
- ✅ Git (para versionamento)
- ✅ Postman/Insomnia (para testes de API)

---

## 🔄 FASE 1: PREPARAÇÃO DO AMBIENTE (1 dia)

### **1.1 Backup do Database**
```bash
# SQLite
cp BackEnd/database.sqlite BackEnd/database.sqlite.backup.2026-06-08

# MySQL/MariaDB
mysqldump -u usuario -p COMAES_DB > backup_2026-06-08.sql
```

### **1.2 Criar Branch Feature**
```bash
git checkout -b feature/tournament-system-improvements
```

### **1.3 Verificar Estrutura Atual**
```bash
# Listar modelos
ls BackEnd/models/

# Listar migrations
ls BackEnd/migrations/

# Testar conexão
npm run test:db
```

---

## 🗄️ FASE 2: MIGRATIONS DATABASE (1-2 dias)

### **2.1 Executar Migrations**
```bash
cd BackEnd

# Listar todas (deve mostrar as 3 novas)
npx sequelize-cli db:migrate:status

# Executar novas migrations
npx sequelize-cli db:migrate

# Verificar se foram aplicadas
sqlite3 database.sqlite ".tables"
sqlite3 database.sqlite ".schema torneios"
```

### **2.2 Validar Schema**
```sql
-- Verificar colunas adicionadas
SELECT sql FROM sqlite_master WHERE type='table' AND name='torneios';

-- Verificar índices
SELECT * FROM sqlite_master WHERE type='index';

-- Contar registros (antes e depois)
SELECT COUNT(*) FROM torneios;
SELECT COUNT(*) FROM participantes_torneios;
```

### **2.3 Rollback de Teste (Opcional)**
```bash
# Testar revert (em dev apenas)
npx sequelize-cli db:migrate:undo:all

# Reaplicar
npx sequelize-cli db:migrate
```

---

## 🔧 FASE 3: ATUALIZAR MODELOS (2-3 dias)

### **3.1 Atualizar Torneio.js**

**Adicionar campos:**
```javascript
// Em Torneio.js
tipo_torneio: {
  type: DataTypes.ENUM('generico', 'especifico'),
  defaultValue: 'generico',
  allowNull: false,
  validate: {
    isIn: [['generico', 'especifico']]
  }
},
disciplina_especifica: {
  type: DataTypes.STRING(100),
  allowNull: true,
  validate: {
    customValidator(value) {
      if (this.tipo_torneio === 'especifico' && !value) {
        throw new Error('Disciplina obrigatória para torneio específico');
      }
      if (this.tipo_torneio === 'generico' && value) {
        console.warn('⚠️ Disciplina será ignorada para torneio genérico');
      }
    }
  }
}
```

**Adicionar hooks:**
```javascript
hooks: {
  beforeSave: (torneio) => {
    // Validar tipo e disciplina
    if (torneio.tipo_torneio === 'generico') {
      torneio.disciplina_especifica = null;
    }
    if (torneio.tipo_torneio === 'especifico' && !torneio.disciplina_especifica) {
      throw new Error('Disciplina é obrigatória para torneios específicos');
    }
  }
}
```

**Adicionar métodos:**
```javascript
// Métodos estáticos
static async verificarTorneioAtivo() {
  return await this.findOne({ where: { status: 'ativo' } });
}

static async verificarCanAtividate(novoStatus, id) {
  if (novoStatus === 'ativo') {
    const ativo = await this.findOne({
      where: { status: 'ativo', id: { [Op.ne]: id } }
    });
    if (ativo) throw new Error(`Torneio ${ativo.id} já está ativo`);
  }
}
```

### **3.2 Atualizar ParticipanteTorneio.js**

**Adicionar novos campos:**
```javascript
encerrado_operacionalmente: {
  type: DataTypes.BOOLEAN,
  defaultValue: false
},
data_encerramento_operacional: {
  type: DataTypes.DATE,
  allowNull: true
},
elegivel_certificado: {
  type: DataTypes.BOOLEAN,
  defaultValue: false
}
```

**Adicionar métodos:**
```javascript
// Verificar se usuário tem participação ativa
static async temParticipaçaoAtiva(usuarioId, excludeTorneioId = null) {
  const where = {
    usuario_id: usuarioId,
    status: 'confirmado',
    posicao_congelada: false,
    encerrado_operacionalmente: false
  };
  
  if (excludeTorneioId) {
    where.torneio_id = { [Op.ne]: excludeTorneioId };
  }
  
  const existe = await this.findOne({ where });
  return existe || null;
}

// Marcar como encerrado operacionalmente
async marcarEncerradoOperacionalmente() {
  this.encerrado_operacionalmente = true;
  this.data_encerramento_operacional = new Date();
  return await this.save();
}

// Marcar como elegível para certificado (top 3)
async marcarElegivelCertificado(posicao) {
  if (posicao <= 3) {
    this.elegivel_certificado = true;
    await this.save();
    return true;
  }
  return false;
}
```

### **3.3 Adicionar/Atualizar Certificate.js**

**Verificar e adicionar campos se não existirem:**
```javascript
auto_gerado: {
  type: DataTypes.BOOLEAN,
  defaultValue: false
},
torneio_id: {
  type: DataTypes.INTEGER,
  allowNull: true,
  references: { model: 'torneios', key: 'id' }
},
posicao: {
  type: DataTypes.INTEGER,
  allowNull: true,
  validate: {
    min: 1,
    max: 3,
    msg: 'Apenas top 3 pode receber certificado'
  }
}
```

**Adicionar método:**
```javascript
static async validarTopTres(posicao) {
  if (posicao > 3) {
    throw new Error('Apenas participantes no top 3 recebem certificado');
  }
  return true;
}
```

---

## 🎮 FASE 4: ATUALIZAR CONTROLLERS (3-4 dias)

### **4.1 Atualizar TorneioController.js**

**Método: createTorneo() - Validar tipo**
```javascript
// Adicionar após outras validações
const { tipo_torneio, disciplina_especifica } = req.body;

// Validar tipo
if (tipo_torneio && !['generico', 'especifico'].includes(tipo_torneio)) {
  return res.status(400).json({
    message: 'Tipo de torneio inválido',
    field: 'tipo_torneio',
    validos: ['generico', 'especifico']
  });
}

// Validar disciplina se específico
if (tipo_torneio === 'especifico' && !disciplina_especifica) {
  return res.status(400).json({
    message: 'Disciplina é obrigatória para torneios específicos',
    field: 'disciplina_especifica'
  });
}

// Validar disciplina válida
const disciplinasValidas = ['Matemática', 'Inglês', 'Programação'];
if (tipo_torneio === 'especifico' && !disciplinasValidas.includes(disciplina_especifica)) {
  return res.status(400).json({
    message: 'Disciplina inválida',
    field: 'disciplina_especifica',
    validas: disciplinasValidas
  });
}

// Adicionar campos ao torneio
torneioData.tipo_torneio = tipo_torneio || 'generico';
if (tipo_torneio === 'especifico') {
  torneioData.disciplina_especifica = disciplina_especifica;
}
```

**Método: updateTorneo() - Validar ativação única**
```javascript
// Adicionar ao updateTorneo
if (status === 'ativo') {
  const temAtivoJa = await Torneio.findOne({
    where: {
      status: 'ativo',
      id: { [Op.ne]: id }
    }
  });
  
  if (temAtivoJa) {
    return res.status(409).json({
      message: 'Já existe um torneio ativo',
      torneioAtivo: {
        id: temAtivoJa.id,
        titulo: temAtivoJa.titulo,
        inicia_em: temAtivoJa.inicia_em,
        termina_em: temAtivoJa.termina_em
      }
    });
  }
}
```

**Novo método: finalizarTorneio()**
```javascript
finalizarTorneio: async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { disciplina } = req.body;
    
    const torneio = await Torneio.findByPk(id, { transaction });
    if (!torneio) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Torneio não encontrado' });
    }
    
    if (torneio.status !== 'ativo') {
      await transaction.rollback();
      return res.status(400).json({
        message: 'Apenas torneios ativos podem ser finalizados'
      });
    }
    
    // 1. Congelar ranking
    const freezeResult = await ParticipanteTorneio.congelarRanking(id, disciplina);
    
    // 2. Marcar participantes como encerrados operacionalmente
    await ParticipanteTorneio.update(
      { encerrado_operacionalmente: true, data_encerramento_operacional: new Date() },
      { where: { torneio_id: id }, transaction }
    );
    
    // 3. Gerar certificados para top 3
    const certificados = await gerarCertificadosAutoTopTres(id, disciplina, transaction);
    
    // 4. Finalizar torneio
    await torneio.update({ status: 'finalizado' }, { transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      message: 'Torneio finalizado com sucesso',
      data: {
        torneio: formatTorneioForFrontend(torneio),
        ranking: freezeResult,
        certificados: certificados
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao finalizar torneio:', error);
    res.status(500).json({ message: error.message });
  }
}
```

**Novo método: verificarEncerramento()**
```javascript
verificarEncerramento: async (req, res) => {
  try {
    const { id } = req.params;
    const { disciplina } = req.query;
    
    const torneio = await Torneio.findByPk(id);
    if (!torneio) {
      return res.status(404).json({ message: 'Torneio não encontrado' });
    }
    
    const agora = new Date();
    const estaEncerrado = torneio.termina_em && new Date(torneio.termina_em) < agora;
    
    if (estaEncerrado && torneio.status === 'ativo') {
      // Buscar ranking para mostrar
      const ranking = await ParticipanteTorneio.obterRankingPersistido(id, disciplina);
      
      res.status(200).json({
        encerrado: true,
        motivo: 'Data de término foi atingida',
        data_termino: torneio.termina_em,
        ranking: ranking,
        mensagem: 'O torneio foi encerrado. Visualize o ranking final.'
      });
    } else {
      res.status(200).json({
        encerrado: false,
        status: torneio.status
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
```

### **4.2 Atualizar ParticipanteTorneio inscrição**

**Método: inscreverParticipante() - Adicionar validação**
```javascript
// Adicionar ANTES de verificar inscrição existente

// Verificar participação ativa em outro torneio
const temOutraAtiva = await ParticipanteTorneio.temParticipaçaoAtiva(usuario_id, torneio_id);
if (temOutraAtiva) {
  await transaction.rollback();
  const torneioOutro = await Torneio.findByPk(temOutraAtiva.torneio_id, { transaction });
  return res.status(409).json({
    message: 'Usuário já possui participação ativa em outro torneio',
    torneioAtivo: {
      id: temOutraAtiva.torneio_id,
      titulo: torneioOutro.titulo,
      disciplina: temOutraAtiva.disciplina_competida
    }
  });
}

// Se torneio é específico, validar disciplina
if (torneio.tipo_torneio === 'especifico') {
  if (disciplina_competida !== torneio.disciplina_especifica) {
    await transaction.rollback();
    return res.status(400).json({
      message: `Este torneio é específico para ${torneio.disciplina_especifica}`,
      disciplina_obrigatoria: torneio.disciplina_especifica,
      field: 'disciplina_competida'
    });
  }
}
```

### **4.3 Novo Controller: CertificateController.js**

```javascript
// BackEnd/controllers/CertificateController.js

import Certificate from '../models/Certificate.js';
import ParticipanteTorneio from '../models/ParticipanteTorneio.js';
import Torneio from '../models/Torneio.js';
import Usuario from '../models/User.js';

export const CertificateController = {
  // Gerar certificados automaticamente para top 3
  gerarCertificadosAuto: async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
      const { torneio_id, disciplina } = req.body;
      
      if (!torneio_id || !disciplina) {
        return res.status(400).json({
          message: 'torneio_id e disciplina são obrigatórios'
        });
      }
      
      // 1. Validar torneio
      const torneio = await Torneio.findByPk(torneio_id, { transaction });
      if (!torneio) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Torneio não encontrado' });
      }
      
      // 2. Obter top 3
      const top3 = await ParticipanteTorneio.findAll({
        where: {
          torneio_id,
          disciplina_competida: disciplina,
          status: 'confirmado',
          posicao: { [Op.lte]: 3 }
        },
        include: [{ model: Usuario, as: 'usuario' }],
        order: [['posicao', 'ASC']],
        transaction
      });
      
      if (top3.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          message: 'Sem participantes no top 3'
        });
      }
      
      // 3. Gerar certificado para cada
      const certificados = [];
      for (const participante of top3) {
        const conteudo = gerarConteudoCertificado(participante, torneio);
        
        const certificado = await Certificate.create({
          usuario_id: participante.usuario_id,
          torneio_id,
          posicao: participante.posicao,
          auto_gerado: true,
          conteudo,
          data_geracao: new Date()
        }, { transaction });
        
        // Marcar participante como elegível
        participante.elegivel_certificado = true;
        await participante.save({ transaction });
        
        certificados.push(certificado);
      }
      
      await transaction.commit();
      
      res.status(201).json({
        message: 'Certificados gerados com sucesso',
        data: {
          quantidade: certificados.length,
          certificados: certificados
        }
      });
      
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao gerar certificados:', error);
      res.status(500).json({ message: error.message });
    }
  },
  
  // Listar certificados de um usuário
  listarCertificadosUsuario: async (req, res) => {
    try {
      const { usuario_id } = req.params;
      
      const certificados = await Certificate.findAll({
        where: { usuario_id },
        include: [
          { model: Torneio, attributes: ['id', 'titulo', 'descricao'] }
        ],
        order: [['data_geracao', 'DESC']]
      });
      
      res.status(200).json(certificados);
      
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  // Validar elegibilidade (top 3 apenas)
  validarElegibilidade: async (req, res) => {
    try {
      const { torneio_id, usuario_id, disciplina } = req.body;
      
      const participante = await ParticipanteTorneio.findOne({
        where: {
          torneio_id,
          usuario_id,
          disciplina_competida: disciplina
        }
      });
      
      if (!participante) {
        return res.status(404).json({ message: 'Participação não encontrada' });
      }
      
      const elegivel = participante.posicao && participante.posicao <= 3;
      
      res.status(200).json({
        elegivel,
        posicao: participante.posicao,
        mensagem: elegivel ? 'Elegível para certificado' : 'Não elegível (fora do top 3)'
      });
      
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

// Helper: Gerar conteúdo do certificado
function gerarConteudoCertificado(participante, torneio) {
  const posicoes = ['Primeiro', 'Segundo', 'Terceiro'];
  const posicaoTexto = posicoes[participante.posicao - 1] || 'Participante';
  
  return `
    <html>
      <body style="font-family: Arial; text-align: center; padding: 40px;">
        <h1>CERTIFICADO DE PARTICIPAÇÃO</h1>
        <p>Certificamos que</p>
        <h2>${participante.usuario?.nome || 'Participante'}</h2>
        <p>Conquistou o ${posicaoTexto} lugar no Torneio</p>
        <h2>${torneio.titulo}</h2>
        <p>Disciplina: ${participante.disciplina_competida}</p>
        <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
        <p>Pontuação: ${participante.pontuacao} pontos</p>
        <hr>
        <p><small>COMAES - Plataforma de Competições Acadêmicas</small></p>
      </body>
    </html>
  `;
}

export default CertificateController;
```

---

## 🛣️ FASE 5: ROTAS API (1 dia)

### **5.1 Adicionar Rotas em torneiosRoutes.js**

```javascript
// Adicionar rotas novas
router.post('/:id/finalizar', TorneoController.finalizarTorneio);
router.get('/:id/verificar-encerramento', TorneoController.verificarEncerramento);

// Rotas de certificados
router.post('/certificados/gerar-auto', CertificateController.gerarCertificadosAuto);
router.get('/certificados/usuario/:usuario_id', CertificateController.listarCertificadosUsuario);
router.post('/certificados/validar-elegibilidade', CertificateController.validarElegibilidade);
```

### **5.2 Testar com Postman**

```bash
# Criar torneio genérico
POST /api/torneios
{
  "titulo": "Torneio Geral 2026",
  "tipo_torneio": "generico",
  "inicia_em": "2026-06-10T10:00:00Z",
  "termina_em": "2026-06-10T18:00:00Z"
}

# Criar torneio específico
POST /api/torneios
{
  "titulo": "Desafio de Programação",
  "tipo_torneio": "especifico",
  "disciplina_especifica": "Programação"
}

# Verificar ativação única
PUT /api/torneios/:id
{
  "status": "ativo"
}

# Inscrever com validação de participação ativa
POST /api/torneios/:id/inscrever
{
  "usuario_id": 1,
  "disciplina_competida": "Programação"
}
```

---

## ✅ FASE 6: TESTES (2-3 dias)

### **6.1 Testes Unitários**

```javascript
// BackEnd/tests/torneio.test.js
describe('Sistema de Torneios Melhorado', () => {
  test('Deve criar torneio genérico', async () => {
    // ...
  });
  
  test('Deve criar torneio específico', async () => {
    // ...
  });
  
  test('Deve validar participação ativa', async () => {
    // ...
  });
  
  test('Deve impedir múltiplos torneios ativos', async () => {
    // ...
  });
  
  test('Deve gerar certificados apenas para top 3', async () => {
    // ...
  });
});
```

### **6.2 Testes de Integração**

```javascript
// BackEnd/tests/integration/tournament-flow.test.js
describe('Fluxo completo de torneio', () => {
  test('Criar → Inscrever → Finalizar → Certificar', async () => {
    // ...
  });
  
  test('Validar exclusividade de participação', async () => {
    // ...
  });
  
  test('Validar encerramento automático', async () => {
    // ...
  });
});
```

---

## 🎯 FASE 7: FRONTEND (Opcional nesta fase)

### **7.1 Componentes a Atualizar**

1. **CriarTorneio.jsx** - Adicionar seletor de tipo
2. **EditarTorneio.jsx** - Mostrar validação de ativo único
3. **InscricaoTorneio.jsx** - Validar participação ativa
4. **TorneioAtivo.jsx** - Verificar encerramento automático
5. **Ranking.jsx** - Mostrar certificados ao lado do ranking

### **7.2 Modal de Encerramento**

```jsx
// Quando torneio está encerrado
<Modal isOpen={torneioEncerrado}>
  <h2>Torneio Encerrado</h2>
  <p>O torneio foi encerrado em {torneio.termina_em}</p>
  <RankingCompleto />
  <button onClick={sairDoTorneio}>Sair</button>
</Modal>
```

---

## 🚀 DEPLOY (1 dia)

### **8.1 Staging**
```bash
# Fazer merge para branch staging
git checkout staging
git pull
git merge feature/tournament-system-improvements

# Deploy em staging
npm run deploy:staging

# Testes em staging
npm run test:staging
```

### **8.2 Produção**
```bash
# Criar release
git checkout main
git pull
git merge staging

# Tag release
git tag v3.3.0

# Deploy em produção
npm run deploy:production

# Verificar
npm run verify:production
```

---

## 📊 CHECKLIST FINAL

- [ ] Todos os modelos atualizados
- [ ] Migrations executadas com sucesso
- [ ] Controllers implementados e testados
- [ ] Rotas registradas e funcionando
- [ ] Testes unitários passando
- [ ] Testes de integração passando
- [ ] Documentação de API atualizada
- [ ] Frontend atualizado (se necessário)
- [ ] Testes em staging OK
- [ ] Deploy em produção
- [ ] Monitoramento de erros
- [ ] Documentação de usuário pronta

---

**Total Estimado: 2-3 semanas de desenvolvimento**

Qualquer dúvida durante a implementação, consulte o plano completo em `PLANO_IMPLEMENTACAO_TORNEIOS_MELHORADO.md`.
