# 💻 CÓDIGO EXATO - TODAS AS ALTERAÇÕES

**Versão**: 3.2  
**Data**: 9 de junho de 2026  

---

## 📂 ARQUIVO 1: BackEnd/index.js

### Seção 1: GET /api/torneios/ativo (Linhas 870-959)

**Localização**: Lines 870-959

```javascript
// 1. Verificar torneio ativo
app.get('/api/torneios/ativo', async (req, res) => {
  try {
    const agora = new Date();

    console.log('🔍 Verificando torneio ativo...');
    console.log('📅 Data atual:', agora.toISOString());

    const torneio = await Torneio.findOne({
      where: {
        status: 'ativo'
      },
      order: [['inicia_em', 'DESC']]
    });

    console.log('🏆 Torneio encontrado:', torneio ?
      `ID: ${torneio.id}, Título: "${torneio.titulo}", Status: ${torneio.status}` :
      'Nenhum');

    if (!torneio) {
      return res.json({
        success: true,
        ativo: false,
        message: 'Nenhum torneio ativo encontrado'
      });
    }

    const inicio = new Date(torneio.inicia_em);
    const fim = new Date(torneio.termina_em);

    console.log('📅 Período do torneio:', {
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      agora: agora.toISOString()
    });

    // ✅ NOVO: Verificar expiração automática
    if (agora > fim) {
      console.log('⏰ Torneio expirou automaticamente. Finalizando...');
      await torneio.update({ status: 'finalizado' });
      
      // Congelar rankings de todas as disciplinas
      const disciplinas = ['Matemática', 'Inglês', 'Programação'];
      for (const disciplina of disciplinas) {
        try {
          await ParticipanteTorneio.congelarRanking(torneio.id, disciplina);
        } catch (e) {
          console.warn(`Aviso ao congelar ${disciplina}:`, e.message);
        }
      }

      return res.json({
        success: true,
        ativo: false,
        expirou_automaticamente: true,
        message: 'Torneio expirou e foi finalizado automaticamente'
      });
    }

    const dentroDoPeriodo = agora >= inicio && agora <= fim;

    // ✅ CORRIGIDO: Serializar manualmente em vez de usar toJSON()
    const torneioData = {
      id: torneio.id,
      titulo: torneio.titulo,
      descricao: torneio.descricao,
      slug: torneio.slug,
      inicia_em: torneio.inicia_em ? new Date(torneio.inicia_em).toISOString() : null,
      termina_em: torneio.termina_em ? new Date(torneio.termina_em).toISOString() : null,
      status: torneio.status,
      criado_por: torneio.criado_por,
      tipo_torneio: torneio.tipo_torneio,
      disciplina_especifica: torneio.disciplina_especifica
    };

    res.json({
      success: true,
      ativo: dentroDoPeriodo,
      dentroDoPeriodo,
      torneio: torneioData,
      mensagem: dentroDoPeriodo ?
        'Torneio ativo e em andamento' :
        'Torneio marcado como ativo mas fora do período programado'
    });
  } catch (error) {
    console.error('❌ Erro ao verificar torneio ativo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

### Seção 2: GET /api/torneios/ativo/disciplinas (Linhas 961-1070)

**Localização**: Lines 961-1070

```javascript
// ✅ NOVO: 1.5 Obter disciplinas disponíveis do torneio ativo
app.get('/api/torneios/ativo/disciplinas', async (req, res) => {
  try {
    const agora = new Date();

    // Buscar torneio ativo
    const torneio = await Torneio.findOne({
      where: { status: 'ativo' },
      order: [['inicia_em', 'DESC']]
    });

    if (!torneio) {
      console.log('ℹ️  Nenhum torneio ativo encontrado');
      return res.json({
        success: true,
        disciplinas: [],
        tipo_torneio: null,
        message: 'Nenhum torneio ativo'
      });
    }

    console.log('🔍 Torneio ativo:', {
      id: torneio.id,
      titulo: torneio.titulo,
      tipo: torneio.tipo_torneio,
      disciplina_especifica: torneio.disciplina_especifica
    });

    // Verificar expiração
    const inicio = new Date(torneio.inicia_em);
    const fim = new Date(torneio.termina_em);
    
    console.log('📅 Verificando período:', {
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      agora: agora.toISOString(),
      expirou: agora > fim
    });

    if (agora > fim) {
      console.log('⏰ Torneio expirou');
      return res.json({
        success: true,
        disciplinas: [],
        tipo_torneio: torneio.tipo_torneio,
        expirou: true,
        message: 'Torneio expirou'
      });
    }

    if (agora < inicio) {
      console.log('⏰ Torneio ainda não iniciou');
      return res.json({
        success: true,
        disciplinas: [],
        tipo_torneio: torneio.tipo_torneio,
        ainda_nao_iniciou: true,
        message: 'Torneio ainda não iniciou'
      });
    }

    // ✅ CORRIGIDO: Determinar disciplinas baseado no tipo
    let disciplinasParaVerificar = [];

    if (torneio.tipo_torneio === 'especifico' && torneio.disciplina_especifica) {
      // Apenas disciplina específica
      disciplinasParaVerificar = [torneio.disciplina_especifica];
      console.log('🔒 Torneio específico para:', torneio.disciplina_especifica);
    } else {
      // Genérico: todas as disciplinas
      disciplinasParaVerificar = ['Matemática', 'Inglês', 'Programação'];
      console.log('🌐 Torneio genérico: verificando todas as disciplinas');
    }

    // ✅ CORRIGIDO: Verificar quais disciplinas têm blocos de questões
    const disciplinasComBlocos = [];

    for (const disciplina of disciplinasParaVerificar) {
      const mapeoDisciplina = {
        'Matemática': 'matematica',
        'Inglês': 'ingles',
        'Programação': 'programacao'
      };

      const disciplinaBloco = mapeoDisciplina[disciplina];
      
      // ✅ CORRIGIDO: NÃO filtrar por torneio_id (blocos não estão vinculados a torneio no BD)
      const blocos = await BlocoQuestoes.findAll({
        where: {
          disciplina: disciplinaBloco,
          status: 'publicado'
        },
        limit: 1
      });

      console.log(`  📋 Disciplina "${disciplina}": ${blocos.length} bloco(s) publicado(s)`);

      if (blocos.length > 0) {
        disciplinasComBlocos.push(disciplina);
      }
    }

    console.log('✅ Disciplinas com blocos:', disciplinasComBlocos);

    res.json({
      success: true,
      torneio_id: torneio.id,
      tipo_torneio: torneio.tipo_torneio,
      disciplina_especifica: torneio.disciplina_especifica || null,
      disciplinas: disciplinasComBlocos,
      message: `${disciplinasComBlocos.length} disciplina(s) disponível(eis)`
    });
  } catch (error) {
    console.error('❌ Erro ao obter disciplinas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## 📂 ARQUIVO 2: BackEnd/controllers/TorneoController.js

### Seção 1: inscreverParticipante - Validação de Expiração (Linhas 240-248)

**Localização**: Lines 240-248

```javascript
const agora = new Date();

// ✅ NOVO: Verificar se torneio expirou automaticamente
if (torneio.termina_em && new Date(torneio.termina_em) < agora) {
  await transaction.rollback();
  return res.status(400).json({ 
    message: 'Este torneio expirou e nao aceita mais inscricoes',
    field: 'torneio_expirado'
  });
}
```

---

### Seção 2: inscreverParticipante - Validação de Tipo (Linhas 258-267)

**Localização**: Lines 258-267

```javascript
// ✅ NOVO: Validar disciplina conforme tipo de torneio
if (torneio.tipo_torneio === 'especifico' && disciplina_competida !== torneio.disciplina_especifica) {
  await transaction.rollback();
  return res.status(400).json({ 
    message: `Este torneio e especifico apenas para ${torneio.disciplina_especifica}`,
    disciplina_esperada: torneio.disciplina_especifica,
    field: 'disciplina_incompativel'
  });
}
```

---

### Seção 3: inscreverParticipante - Bloqueio de Simultaneidade (Linhas 270-290)

**Localização**: Lines 270-290

```javascript
// ✅ NOVO: Verificar participacao simultanea em outro torneio
const participacaoAtiva = await ParticipanteTorneio.findOne({
  where: {
    usuario_id,
    status: 'confirmado',
    posicao_congelada: false
  },
  include: [{
    model: Torneio,
    attributes: ['id', 'titulo', 'termina_em'],
    where: {
      id: { [sequelize.Sequelize.Op.ne]: torneio_id }
    }
  }],
  lock: transaction.LOCK.UPDATE,
  transaction
});

if (participacaoAtiva) {
  await transaction.rollback();
  return res.status(409).json({ 
    message: `Usuario ja esta participando de outro torneio: "${participacaoAtiva.Torneio.titulo}". Termine esse primeiro.`,
    torneio_ativo: participacaoAtiva.Torneio,
    field: 'participacao_simultanea'
  });
}
```

---

## 📂 ARQUIVO 3: FrontEnd/src/Paginas/Secundarias/EntrarTorneio.jsx

### Seção 1: State Management - useState (Linhas 25-52)

**Localização**: Lines 25-52

```javascript
// ✅ CORRIGIDO: Usar useState em vez de const simples
const [disciplinaSelecionada, setDisciplinaSelecionada] = useState(null);
const [showLoginModal, setShowLoginModal] = useState(false);
const [loading, setLoading] = useState(false);
const [torneioAtivo, setTorneioAtivo] = useState(null);
const [estatisticasParticipantes, setEstatisticasParticipantes] = useState(null);
const [totalUsuarios, setTotalUsuarios] = useState(0);
const [error, setError] = useState(null);
const [isVerifying, setIsVerifying] = useState(true);

// ✅ CORRIGIDO: useState com setter para atualizar
const [disciplinasDisponiveis, setDisciplinasDisponiveis] = useState([
  {
    id: "matematica",
    nome: "Matemática",
    imagem: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    cor: "from-blue-600 to-purple-600",
    nivel: "Intermediário",
    descricao: "Desafie suas habilidades matemáticas com problemas de álgebra, cálculo e lógica"
  },
  {
    id: "programacao",
    nome: "Programação",
    imagem: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    cor: "from-emerald-600 to-cyan-600",
    nivel: "Avançado",
    descricao: "Teste suas habilidades de codificação em algoritmos e estrutura de dados"
  },
  {
    id: "ingles",
    nome: "Inglês",
    imagem: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    cor: "from-rose-600 to-orange-500",
    nivel: "Todos os níveis",
    descricao: "Aprimore seu vocabulário e compreensão da língua inglesa"
  }
]);
```

---

### Seção 2: Filtragem de Disciplinas (Linhas 110-150)

**Localização**: Lines 110-150

```javascript
// Carregar dados iniciais (Torneio e Estatísticas)
useEffect(() => {
  const carregarDados = async () => {
    setIsVerifying(true);
    setError(null);
    try {
      // 1. Buscar Status Geral (Total de Usuários)
      const statsRes = await fetch(`${apiBaseUrl}/api/stats/global`);
      const statsData = await statsRes.json();
      console.log('📊 Dados iniciais de usuários:', statsData);
      if (statsData.success && typeof statsData.totalUsers === 'number') {
        setTotalUsuarios(statsData.totalUsers);
      }

      // 2. Torneio Ativo
      const tourRes = await fetch(`${apiBaseUrl}/api/torneios/ativo`);
      const tourData = await tourRes.json();

      if (tourData.ativo && tourData.torneio) {
        setTorneioAtivo(tourData.torneio);
        
        // ✅ NOVO: Verificar se o torneio é específico e filtrar disciplinas
        const disciplinasRes = await fetch(`${apiBaseUrl}/api/torneios/ativo/disciplinas`);
        const disciplinasData = await disciplinasRes.json();
        console.log('📋 Disciplinas disponíveis:', disciplinasData);

        // ✅ CORRIGIDO: Usar setDisciplinasDisponiveis em vez de reatribuir const
        let disciplinasFiltradas = [];

        if (tourData.torneio.tipo_torneio === 'especifico') {
          // Se for específico, mostrar apenas a disciplina selecionada
          const disciplinaEspecifica = tourData.torneio.disciplina_especifica;
          const disponivelMap = {
            'Matemática': disciplinasDisponiveis[0],
            'Inglês': disciplinasDisponiveis[2],
            'Programação': disciplinasDisponiveis[1]
          };
          // Filtrar apenas a disciplina específica se estiver disponível
          if (disciplinasData.disciplinas.includes(disciplinaEspecifica)) {
            const disc = disponivelMap[disciplinaEspecifica];
            disciplinasFiltradas = disc ? [disc] : [];
            console.log('🎯 Torneio específico para:', disciplinaEspecifica);
          } else {
            console.log('❌ Disciplina específica não tem blocos de questões');
            disciplinasFiltradas = [];
          }
        } else {
          // Genérico: filtrar disciplinas que têm blocos
          disciplinasFiltradas = disciplinasDisponiveis.filter(d => 
            disciplinasData.disciplinas.includes(d.nome)
          );
          console.log('🌐 Disciplinas genéricas disponíveis:', disciplinasData.disciplinas);
        }

        // Atualizar state com disciplinas filtradas
        setDisciplinasDisponiveis(disciplinasFiltradas);

        // 3. Buscar estatísticas reais de participantes do torneio ativo
        try {
          const statsRes = await fetch(`${apiBaseUrl}/api/tournaments/${tourData.torneio.id}/participant-counts`);
          const statsData = await statsRes.json();
          if (statsData.success && statsData.counts) {
            setEstatisticasParticipantes(statsData.counts);
            console.log('📊 Estatísticas de participantes carregadas:', statsData.counts);
          }
        } catch (sErr) {
          console.error('Erro ao carregar estatísticas:', sErr);
        }
      } else {
        setTorneioAtivo(null);
        setEstatisticasParticipantes({ 'Matemática': 0, 'Inglês': 0, 'Programação': 0, total: 0 });
      }
    } catch (err) {
      console.error('Erro conexão:', err);
      setError("Erro ao conectar com o servidor.");
    } finally {
      setIsVerifying(false);
    }
  };
  carregarDados();
}, [apiBaseUrl]);
```

---

### Seção 3: Verificação de Participação Simultânea (Linhas 190-210)

**Localização**: Lines 190-210

```javascript
const entrarNoTorneio = async () => {
  if (!disciplinaSelecionada || !user) {
    setShowLoginModal(true);
    return;
  }

  setLoading(true);
  setError(null);

  try {
    // ✅ NOVO: Verificar participação ativa em outro torneio
    const verificarRes = await fetch(`${apiBaseUrl}/api/tournaments/usuario/${user.id}/participacao-ativa`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const verificarData = await verificarRes.json();

    if (verificarData.ativo) {
      setLoading(false);
      setError(`❌ Você já está participando de outro torneio: "${verificarData.torneio.titulo}". Termine esse primeiro para participar deste.`);
      setDisciplinaSelecionada(null);
      return;
    }

    // ... resto do código ...
  }
}
```

---

## 📂 ARQUIVO 4: BackEnd/models/Torneio.js

### Torneio Model - Fields (Completo)

**Localização**: Complete file

```javascript
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Torneio = sequelize.define('Torneio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  inicia_em: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  termina_em: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  criado_por: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'id' },
  },
  status: {
    type: DataTypes.ENUM('rascunho', 'agendado', 'ativo', 'finalizado', 'cancelado'),
    defaultValue: 'rascunho',
  },
  // ✨ NEW: Tournament Types (Sistema de Torneios)
  tipo_torneio: {
    type: DataTypes.ENUM('generico', 'especifico'),
    defaultValue: 'generico',
    allowNull: false,
    comment: 'Tipo de torneio: generico (multidisciplinar) ou especifico (uma disciplina)',
    validate: {
      isIn: {
        args: [['generico', 'especifico']],
        msg: 'tipo_torneio deve ser generico ou especifico'
      }
    }
  },
  disciplina_especifica: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Disciplina específica quando tipo_torneio = especifico',
    validate: {
      validateDisciplinaEspecifica(value) {
        // Se tipo_torneio é específico, disciplina_especifica é obrigatória
        if (this.tipo_torneio === 'especifico' && !value) {
          throw new Error('disciplina_especifica é obrigatória para torneios específicos');
        }
        // Se tipo_torneio é genérico, disciplina_especifica deve ser NULL
        if (this.tipo_torneio === 'generico' && value) {
          throw new Error('disciplina_especifica deve ser NULL para torneios genéricos');
        }
      }
    }
  },
  criado_em: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'torneios',
  timestamps: false,
  indexes: [
    { fields: ['criado_por'] },
    { fields: ['tipo_torneio'] },  // ✨ Index para filtrar por tipo
    { fields: ['disciplina_especifica'] },  // ✨ Index para filtrar por disciplina
  ],
  hooks: {
    // ✨ Validação antes de salvar
    beforeValidate: (torneio) => {
      // Garantir que genéricos não tenham disciplina específica
      if (torneio.tipo_torneio === 'generico') {
        torneio.disciplina_especifica = null;
      }
    }
  }
});

// ✨ Métodos de Helper
Torneio.prototype.isGenerico = function() {
  return this.tipo_torneio === 'generico';
};

Torneio.prototype.isEspecifico = function() {
  return this.tipo_torneio === 'especifico';
};

Torneio.prototype.getDisciplina = function() {
  return this.isGenerico() ? 'Multidisciplinar' : this.disciplina_especifica;
};

export default Torneio;
```

---

## 🔍 RESUMO DE ALTERAÇÕES

| Arquivo | Linhas | Tipo | Descrição |
|---------|--------|------|-----------|
| `BackEnd/index.js` | 870-959 | NEW | Endpoint GET /api/torneios/ativo com serialização manual |
| `BackEnd/index.js` | 901-915 | NEW | Verificação de expiração automática |
| `BackEnd/index.js` | 920-945 | FIXED | Substituir `toJSON()` por serialização manual |
| `BackEnd/index.js` | 961-1070 | NEW | Endpoint GET /api/torneios/ativo/disciplinas |
| `BackEnd/index.js` | 1024-1028 | FIXED | Filtragem por tipo_torneio |
| `TorneoController.js` | 240-248 | NEW | Verificação de expiração do torneio |
| `TorneoController.js` | 258-267 | NEW | Validação de tipo_torneio |
| `TorneoController.js` | 270-290 | NEW | Bloqueio de participação simultânea |
| `EntrarTorneio.jsx` | 25-52 | FIXED | useState ao invés de const |
| `EntrarTorneio.jsx` | 110-150 | FIXED | Filtragem de disciplinas por tipo |
| `Torneio.js` | Completo | UPDATED | Enum tipo_torneio + validações |

---

**Total**: 4 arquivos modificados  
**Linhas**: ~350 linhas de código  
**Testes**: ✅ Todos passaram  
**Status**: ✅ Pronto para produção

