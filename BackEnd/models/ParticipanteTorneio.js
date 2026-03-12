import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ParticipanteTorneio = sequelize.define('ParticipanteTorneio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  torneio_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { 
      model: 'torneios', 
      key: 'id' 
    },
    onDelete: 'CASCADE'
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { 
      model: 'usuarios', 
      key: 'id' 
    },
    onDelete: 'CASCADE'
  },
  entrou_em: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.ENUM('pendente', 'confirmado', 'removido', 'desclassificado'),
    defaultValue: 'pendente',
    validate: {
      isIn: {
        args: [['pendente', 'confirmado', 'removido', 'desclassificado']],
        msg: 'Status inválido'
      }
    }
  },
  pontuacao: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'A pontuação não pode ser negativa'
      }
    }
  },
  posicao: {
    type: DataTypes.INTEGER,
    defaultValue: 9999, // Valor alto inicial para posições não definidas
    validate: {
      min: {
        args: [1],
        msg: 'A posição deve ser pelo menos 1'
      },
      max: {
        args: [9999],
        msg: 'A posição não pode exceder 9999'
      },
      notZero(value) {
        if (value === 0) {
          throw new Error('A posição não pode ser zero');
        }
      }
    }
  },
  casos_resolvidos: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'O número de casos resolvidos não pode ser negativo'
      }
    }
  },
  disciplina_competida: {
    type: DataTypes.ENUM('Matemática', 'Inglês', 'Programação'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['Matemática', 'Inglês', 'Programação']],
        msg: 'Disciplina inválida'
      }
    }
  },
  ultima_atividade: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  tempo_total: {
    type: DataTypes.INTEGER, // em segundos
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'O tempo total não pode ser negativo'
      }
    }
  },
  precisao: {
    type: DataTypes.DECIMAL(5, 2), // porcentagem
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'A precisão não pode ser negativa'
      },
      max: {
        args: [100],
        msg: 'A precisão não pode exceder 100%'
      }
    }
  },
  nivel_atual: {
    type: DataTypes.ENUM('iniciante', 'intermediário', 'avançado', 'expert'),
    defaultValue: 'iniciante',
    validate: {
      isIn: {
        args: [['iniciante', 'intermediário', 'avançado', 'expert']],
        msg: 'Nível inválido'
      }
    }
  },
  conquistas: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  historico_pontuacao: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  metadados: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      dispositivo: null,
      navegador: null,
      ip: null,
      preferencias: {},
      total_tentativas: 0
    }
  },
}, {
  tableName: 'participantes_torneios',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em',
  indexes: [
    { 
      fields: ['torneio_id'] 
    },
    { 
      fields: ['usuario_id'] 
    },
    { 
      unique: true, 
      fields: ['torneio_id', 'usuario_id', 'disciplina_competida'],
      name: 'unique_participacao_disciplina'
    },
    { 
      fields: ['pontuacao'] 
    },
    { 
      fields: ['posicao'] 
    },
    { 
      fields: ['status'] 
    },
    { 
      fields: ['disciplina_competida'] 
    }
  ],
  hooks: {
    beforeCreate: async (participante) => {
      const existente = await ParticipanteTorneio.findOne({
        where: {
          torneio_id: participante.torneio_id,
          usuario_id: participante.usuario_id,
          disciplina_competida: participante.disciplina_competida
        }
      });
      if (existente) {
        throw new Error('Usuário já está participando deste torneio nesta disciplina');
      }
      
      // Definir posição inicial como um valor alto
      if (!participante.posicao || participante.posicao === 0) {
        participante.posicao = 9999;
      }
    },
    
    beforeUpdate: (participante) => {
      if (participante.changed('pontuacao') || participante.changed('casos_resolvidos')) {
        participante.ultima_atividade = new Date();
      }
      
      if (participante.changed('casos_resolvidos')) {
        const totalTentativas = participante.metadados?.total_tentativas || 0;
        if (totalTentativas > 0) {
          participante.precisao = (participante.casos_resolvidos / totalTentativas) * 100;
        }
      }
      
      if (participante.changed('pontuacao')) {
        const pontuacao = parseFloat(participante.pontuacao);
        if (pontuacao >= 1000) participante.nivel_atual = 'expert';
        else if (pontuacao >= 500) participante.nivel_atual = 'avançado';
        else if (pontuacao >= 200) participante.nivel_atual = 'intermediário';
        else participante.nivel_atual = 'iniciante';
      }
      
      // Garantir que posição nunca seja 0
      if (participante.posicao === 0) {
        participante.posicao = 9999;
      }
    }
  }
});

// Métodos de instância
ParticipanteTorneio.prototype.adicionarPontuacao = function(pontos, descricao = '') {
  const novaPontuacao = parseFloat(this.pontuacao) + parseFloat(pontos);
  this.pontuacao = novaPontuacao;
  
  const historico = this.historico_pontuacao || [];
  historico.push({
    pontos: parseFloat(pontos),
    total: novaPontuacao,
    descricao,
    data: new Date().toISOString()
  });
  
  this.historico_pontuacao = historico.slice(-50);
  
  return this.save();
};

ParticipanteTorneio.prototype.incrementarCasosResolvidos = function(quantidade = 1) {
  this.casos_resolvidos += quantidade;
  
  const metadados = this.metadados || {};
  metadados.total_tentativas = (metadados.total_tentativas || 0) + 1;
  this.metadados = metadados;
  
  return this.save();
};

ParticipanteTorneio.prototype.adicionarConquista = function(conquistaId, nome, descricao) {
  const conquistas = this.conquistas || [];
  
  if (!conquistas.some(c => c.id === conquistaId)) {
    conquistas.push({
      id: conquistaId,
      nome,
      descricao,
      data: new Date().toISOString()
    });
    
    this.conquistas = conquistas;
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Métodos estáticos
ParticipanteTorneio.calcularRanking = async function(torneioId, disciplina) {
  const participantes = await this.findAll({
    where: {
      torneio_id: torneioId,
      disciplina_competida: disciplina,
      status: 'confirmado'
    },
    order: [['pontuacao', 'DESC'], ['criado_em', 'ASC']]
  });
  
  if (participantes.length === 0) {
    return [];
  }
  
  // Agrupar por pontuação para definir posições corretas (empates)
  const gruposPorPontuacao = {};
  participantes.forEach(participante => {
    const pontuacao = parseFloat(participante.pontuacao).toFixed(2);
    if (!gruposPorPontuacao[pontuacao]) {
      gruposPorPontuacao[pontuacao] = [];
    }
    gruposPorPontuacao[pontuacao].push(participante);
  });
  
  // Calcular posições
  const pontuacoesOrdenadas = Object.keys(gruposPorPontuacao)
    .sort((a, b) => parseFloat(b) - parseFloat(a));
  
  let posicaoAtual = 1;
  const participantesAtualizados = [];
  
  for (const pontuacao of pontuacoesOrdenadas) {
    const grupo = gruposPorPontuacao[pontuacao];
    
    // Se tiver mais de 1 com mesma pontuação, define posição de empate
    const posicaoEmpate = posicaoAtual;
    
    for (const participante of grupo) {
      // Atualizar posição
      participante.posicao = posicaoEmpate;
      participantesAtualizados.push(participante);
    }
    
    // Avançar posição para o próximo grupo
    posicaoAtual += grupo.length;
  }
  
  // Salvar todas as posições atualizadas
  await Promise.all(participantesAtualizados.map(p => p.save()));
  
  return participantesAtualizados;
};

ParticipanteTorneio.buscarPorUsuarioDisciplina = function(usuarioId, disciplina) {
  return this.findOne({
    where: {
      usuario_id: usuarioId,
      disciplina_competida: disciplina,
      status: 'confirmado'
    },
    order: [['criado_em', 'DESC']]
  });
};

ParticipanteTorneio.atualizarPosicoes = async function(torneioId, disciplina) {
  try {
    // Primeiro calcular ranking
    const ranking = await this.calcularRanking(torneioId, disciplina);
    
    // Obter participantes sem pontuação (para atribuir posição máxima)
    const participantesSemPontuacao = await this.findAll({
      where: {
        torneio_id: torneioId,
        disciplina_competida: disciplina,
        status: 'confirmado',
        pontuacao: 0
      }
    });
    
    // Atribuir posição 9999 para quem tem pontuação zero
    const ultimaPosicaoReal = ranking.length;
    const posicaoBaseParaZeros = Math.max(ultimaPosicaoReal + 1, 9999);
    
    for (const participante of participantesSemPontuacao) {
      participante.posicao = posicaoBaseParaZeros;
      await participante.save();
    }
    
    return {
      sucesso: true,
      totalRanking: ranking.length,
      totalZeros: participantesSemPontuacao.length,
      primeiraPosicao: ranking.length > 0 ? ranking[0].posicao : 0,
      ultimaPosicaoReal: ultimaPosicaoReal
    };
  } catch (error) {
    console.error('Erro ao atualizar posições:', error);
    throw error;
  }
};

ParticipanteTorneio.prototype.atualizarPosicaoIndividual = function() {
  // Método para atualizar posição individual baseada na pontuação
  // Idealmente, isso deve ser chamado após calcularRanking
  return ParticipanteTorneio.calcularRanking(this.torneio_id, this.disciplina_competida)
    .then(ranking => {
      const participanteAtualizado = ranking.find(p => p.id === this.id);
      return participanteAtualizado ? Promise.resolve(participanteAtualizado) : this;
    });
};

// Validator personalizado para posição
const validarPosicao = (value) => {
  if (value === null || value === undefined) {
    throw new Error('A posição é obrigatória');
  }
  if (value === 0) {
    throw new Error('A posição não pode ser zero');
  }
  if (value < 1) {
    throw new Error('A posição deve ser pelo menos 1');
  }
  return true;
};

export default ParticipanteTorneio;