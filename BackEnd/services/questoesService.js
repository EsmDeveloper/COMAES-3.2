/**
 * questoesService.js
 * Serviço centralizado para gerenciar questões de todas as modalidades
 * 
 * Responsabilidades:
 * - CRUD para cada modalidade (Matemática, Inglês, Programação)
 * - Validação centralizada
 * - Busca e filtro
 * - Duplicação de questões
 * - Auditoria e logging
 */

import Questao from '../models/Questao.js';
import Torneio from '../models/Torneio.js';
import { Op } from 'sequelize';

// ─── MAPEAMENTO DE MODELOS ───────────────────────────────────────
const MODELOS = {
  matematica: Questao,
  ingles: Questao,
  programacao: Questao
};

const MODALIDADES = {
  matematica: 'Matemática',
  ingles: 'Inglês',
  programacao: 'Programação'
};

// ─── VALIDADORES ─────────────────────────────────────────────────

/**
 * Valida campos comuns a todas as questões
 */
const validarCamposComuns = (data) => {
  const erros = {};

  // Título
  if (!data.titulo || !data.titulo.trim()) {
    erros.titulo = 'Título é obrigatório';
  } else if (data.titulo.length < 5) {
    erros.titulo = 'Título deve ter pelo menos 5 caracteres';
  } else if (data.titulo.length > 255) {
    erros.titulo = 'Título não pode ter mais de 255 caracteres';
  }

  // Descrição
  if (!data.descricao || !data.descricao.trim()) {
    erros.descricao = 'Descrição é obrigatória';
  } else if (data.descricao.length < 10) {
    erros.descricao = 'Descrição deve ter pelo menos 10 caracteres';
  } else if (data.descricao.length > 5000) {
    erros.descricao = 'Descrição não pode ter mais de 5000 caracteres';
  }

  // Dificuldade
  if (!data.dificuldade) {
    erros.dificuldade = 'Dificuldade é obrigatória';
  } else if (!['facil', 'medio', 'dificil'].includes(data.dificuldade)) {
    erros.dificuldade = 'Dificuldade inválida (facil, medio, dificil)';
  }

  // Resposta Correta
  if (!data.resposta_correta || !data.resposta_correta.toString().trim()) {
    erros.resposta_correta = 'Resposta correta é obrigatória';
  }

  // Pontos
  if (data.pontos !== undefined && data.pontos !== null) {
    const pontos = parseInt(data.pontos);
    if (isNaN(pontos) || pontos < 1 || pontos > 1000) {
      erros.pontos = 'Pontos deve ser um número entre 1 e 1000';
    }
  }

  // Torneio ID
  if (!data.torneio_id) {
    erros.torneio_id = 'Torneio é obrigatório';
  } else if (isNaN(parseInt(data.torneio_id))) {
    erros.torneio_id = 'Torneio ID inválido';
  }

  return erros;
};

/**
 * Valida campos específicos de Matemática
 */
const validarMatematica = (data) => {
  const erros = validarCamposComuns(data);

  // Opções (múltipla escolha)
  if (data.opcoes) {
    if (!Array.isArray(data.opcoes) || data.opcoes.length < 2) {
      erros.opcoes = 'Deve haver pelo menos 2 opções';
    } else if (data.opcoes.length > 10) {
      erros.opcoes = 'Não pode haver mais de 10 opções';
    }

    // Validar cada opção
    data.opcoes.forEach((opcao, idx) => {
      if (!opcao || !opcao.trim()) {
        erros[`opcoes_${idx}`] = `Opção ${idx + 1} não pode estar vazia`;
      }
    });
  }

  return erros;
};

/**
 * Valida campos específicos de Inglês
 */
const validarIngles = (data) => {
  const erros = validarCamposComuns(data);

  // Opções (múltipla escolha)
  if (data.opcoes) {
    if (!Array.isArray(data.opcoes) || data.opcoes.length < 2) {
      erros.opcoes = 'Deve haver pelo menos 2 opções';
    } else if (data.opcoes.length > 10) {
      erros.opcoes = 'Não pode haver mais de 10 opções';
    }

    // Validar cada opção
    data.opcoes.forEach((opcao, idx) => {
      if (!opcao || !opcao.trim()) {
        erros[`opcoes_${idx}`] = `Opção ${idx + 1} não pode estar vazia`;
      }
    });
  }

  return erros;
};

/**
 * Valida campos específicos de Programação
 */
const validarProgramacao = (data) => {
  const erros = validarCamposComuns(data);

  // Linguagem
  if (!data.linguagem) {
    erros.linguagem = 'Linguagem é obrigatória';
  } else if (!['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'php', 'ruby', 'go', 'rust'].includes(data.linguagem)) {
    erros.linguagem = 'Linguagem não suportada';
  }

  // Opções (código inicial, testes, etc)
  if (data.opcoes) {
    if (typeof data.opcoes !== 'object') {
      erros.opcoes = 'Opções deve ser um objeto JSON';
    }
  }

  return erros;
};

// ─── SERVIÇO ──────────────────────────────────────────────────────

const questoesService = {
  /**
   * Criar questão de uma modalidade específica
   */
  criar: async (modalidade, dados) => {
    try {
      // Validar modalidade
      if (!MODELOS[modalidade]) {
        throw new Error(`Modalidade inválida: ${modalidade}`);
      }

      // Validar dados
      let erros = {};
      if (modalidade === 'matematica') {
        erros = validarMatematica(dados);
      } else if (modalidade === 'ingles') {
        erros = validarIngles(dados);
      } else if (modalidade === 'programacao') {
        erros = validarProgramacao(dados);
      }

      if (Object.keys(erros).length > 0) {
        throw { name: 'ValidationError', errors: erros };
      }

      // Verificar se torneio existe
      const torneio = await Torneio.findByPk(dados.torneio_id);
      if (!torneio) {
        throw new Error(`Torneio não encontrado: ${dados.torneio_id}`);
      }

      // Preparar dados
      const dadosLimpos = {
        titulo: dados.titulo.trim(),
        descricao: dados.descricao.trim(),
        dificuldade: dados.dificuldade,
        torneio_id: parseInt(dados.torneio_id),
        resposta_correta: dados.resposta_correta.toString().trim(),
        opcoes: dados.opcoes || null,
        pontos: dados.pontos || (modalidade === 'programacao' ? 15 : 10),
        midia: dados.midia || null,
        ...(modalidade === 'programacao' && { linguagem: dados.linguagem })
      };

      // Criar questão
      const Model = MODELOS[modalidade];
      const questao = await Model.create({
        ...dadosLimpos,
        disciplina: modalidade,
        tipo: modalidade === 'programacao' ? 'codigo' : 'multipla_escolha',
        explicacao: null,
        linguagem: modalidade === 'programacao' ? (dados.linguagem || 'javascript') : null,
      });

      console.log(`✅ Questão de ${MODALIDADES[modalidade]} criada: ID ${questao.id}, Torneio ${dados.torneio_id}`);

      return {
        sucesso: true,
        questao: questao.toJSON(),
        mensagem: `Questão de ${MODALIDADES[modalidade]} criada com sucesso`
      };
    } catch (error) {
      console.error(`❌ Erro ao criar questão de ${modalidade}:`, error);
      throw error;
    }
  },

  /**
   * Obter questão por ID
   */
  obter: async (modalidade, id) => {
    try {
      if (!MODELOS[modalidade]) {
        throw new Error(`Modalidade inválida: ${modalidade}`);
      }

      const Model = MODELOS[modalidade];
      const questao = await Model.findByPk(id);

      if (!questao) {
        throw new Error(`Questão não encontrada: ${id}`);
      }

      return questao.toJSON();
    } catch (error) {
      console.error(`❌ Erro ao obter questão de ${modalidade}:`, error);
      throw error;
    }
  },

  /**
   * Atualizar questão
   */
  atualizar: async (modalidade, id, dados) => {
    try {
      if (!MODELOS[modalidade]) {
        throw new Error(`Modalidade inválida: ${modalidade}`);
      }

      // Validar dados
      let erros = {};
      if (modalidade === 'matematica') {
        erros = validarMatematica(dados);
      } else if (modalidade === 'ingles') {
        erros = validarIngles(dados);
      } else if (modalidade === 'programacao') {
        erros = validarProgramacao(dados);
      }

      if (Object.keys(erros).length > 0) {
        throw { name: 'ValidationError', errors: erros };
      }

      // Verificar se questão existe
      const Model = MODELOS[modalidade];
      const questao = await Model.findByPk(id);
      if (!questao) {
        throw new Error(`Questão não encontrada: ${id}`);
      }

      // Verificar se torneio existe (se foi alterado)
      if (dados.torneio_id && dados.torneio_id !== questao.torneio_id) {
        const torneio = await Torneio.findByPk(dados.torneio_id);
        if (!torneio) {
          throw new Error(`Torneio não encontrado: ${dados.torneio_id}`);
        }
      }

      // Preparar dados
      const dadosLimpos = {
        titulo: dados.titulo.trim(),
        descricao: dados.descricao.trim(),
        dificuldade: dados.dificuldade,
        torneio_id: parseInt(dados.torneio_id || questao.torneio_id),
        resposta_correta: dados.resposta_correta.toString().trim(),
        opcoes: dados.opcoes !== undefined ? dados.opcoes : questao.opcoes,
        pontos: dados.pontos || questao.pontos,
        midia: dados.midia !== undefined ? dados.midia : questao.midia,
        ...(modalidade === 'programacao' && { linguagem: dados.linguagem || questao.linguagem })
      };

      // Atualizar
      await questao.update(dadosLimpos);

      console.log(`✅ Questão de ${MODALIDADES[modalidade]} atualizada: ID ${id}`);

      return {
        sucesso: true,
        questao: questao.toJSON(),
        mensagem: `Questão de ${MODALIDADES[modalidade]} atualizada com sucesso`
      };
    } catch (error) {
      console.error(`❌ Erro ao atualizar questão de ${modalidade}:`, error);
      throw error;
    }
  },

  /**
   * Deletar questão
   */
  deletar: async (modalidade, id) => {
    try {
      if (!MODELOS[modalidade]) {
        throw new Error(`Modalidade inválida: ${modalidade}`);
      }

      const Model = MODELOS[modalidade];
      const questao = await Model.findByPk(id);
      if (!questao) {
        throw new Error(`Questão não encontrada: ${id}`);
      }

      const torneioId = questao.torneio_id;
      await questao.destroy();

      console.log(`✅ Questão de ${MODALIDADES[modalidade]} deletada: ID ${id}`);

      return {
        sucesso: true,
        mensagem: `Questão de ${MODALIDADES[modalidade]} deletada com sucesso`,
        torneioId
      };
    } catch (error) {
      console.error(`❌ Erro ao deletar questão de ${modalidade}:`, error);
      throw error;
    }
  },

  /**
   * Listar questões de um torneio
   */
  listarPorTorneio: async (torneioId, modalidade = null, opcoes = {}) => {
    try {
      const { pagina = 1, limite = 20, busca = '', dificuldade = null } = opcoes;

      // Verificar se torneio existe
      const torneio = await Torneio.findByPk(torneioId);
      if (!torneio) {
        throw new Error(`Torneio não encontrado: ${torneioId}`);
      }

      const resultado = {};

      // Se modalidade específica, listar apenas essa
      if (modalidade) {
        if (!MODELOS[modalidade]) {
          throw new Error(`Modalidade inválida: ${modalidade}`);
        }

        const Model = MODELOS[modalidade];
        const where = { torneio_id: torneioId };

        // Filtro de busca
        if (busca) {
          where[Op.or] = [
            { titulo: { [Op.iLike]: `%${busca}%` } },
            { descricao: { [Op.iLike]: `%${busca}%` } }
          ];
        }

        // Filtro de dificuldade
        if (dificuldade) {
          where.dificuldade = dificuldade;
        }

        const offset = (pagina - 1) * limite;
        const { count, rows } = await Model.findAndCountAll({
          where,
          offset,
          limit: limite,
          order: [['criado_em', 'DESC']]
        });

        resultado[modalidade] = {
          total: count,
          pagina,
          limite,
          totalPaginas: Math.ceil(count / limite),
          questoes: rows.map(q => q.toJSON())
        };
      } else {
        // Listar todas as modalidades
        for (const [mod, Model] of Object.entries(MODELOS)) {
          const where = { torneio_id: torneioId };

          // Filtro de busca
          if (busca) {
            where[Op.or] = [
              { titulo: { [Op.iLike]: `%${busca}%` } },
              { descricao: { [Op.iLike]: `%${busca}%` } }
            ];
          }

          // Filtro de dificuldade
          if (dificuldade) {
            where.dificuldade = dificuldade;
          }

          const offset = (pagina - 1) * limite;
          const { count, rows } = await Model.findAndCountAll({
            where,
            offset,
            limit: limite,
            order: [['criado_em', 'DESC']]
          });

          resultado[mod] = {
            total: count,
            pagina,
            limite,
            totalPaginas: Math.ceil(count / limite),
            questoes: rows.map(q => q.toJSON())
          };
        }
      }

      return {
        sucesso: true,
        torneioId,
        resultado
      };
    } catch (error) {
      console.error(`❌ Erro ao listar questões:`, error);
      throw error;
    }
  },

  /**
   * Contar questões de um torneio
   */
  contarPorTorneio: async (torneioId) => {
    try {
      const contagem = {};

      for (const [mod, Model] of Object.entries(MODELOS)) {
        contagem[mod] = await Model.count({
          where: { torneio_id: torneioId }
        });
      }

      contagem.total = Object.values(contagem).reduce((a, b) => a + b, 0);

      return {
        sucesso: true,
        torneioId,
        contagem
      };
    } catch (error) {
      console.error(`❌ Erro ao contar questões:`, error);
      throw error;
    }
  },

  /**
   * Duplicar questão
   */
  duplicar: async (modalidade, id) => {
    try {
      if (!MODELOS[modalidade]) {
        throw new Error(`Modalidade inválida: ${modalidade}`);
      }

      const Model = MODELOS[modalidade];
      const questaoOriginal = await Model.findByPk(id);
      if (!questaoOriginal) {
        throw new Error(`Questão não encontrada: ${id}`);
      }

      // Preparar dados da cópia
      const dadosCopia = questaoOriginal.toJSON();
      delete dadosCopia.id;
      delete dadosCopia.criado_em;

      // Adicionar sufixo ao título
      dadosCopia.titulo = `${dadosCopia.titulo} (Cópia)`;

      // Criar cópia
      const questaoNova = await Model.create(dadosCopia);

      console.log(`✅ Questão de ${MODALIDADES[modalidade]} duplicada: ID ${id} → ID ${questaoNova.id}`);

      return {
        sucesso: true,
        questaoOriginal: questaoOriginal.toJSON(),
        questaoNova: questaoNova.toJSON(),
        mensagem: `Questão de ${MODALIDADES[modalidade]} duplicada com sucesso`
      };
    } catch (error) {
      console.error(`❌ Erro ao duplicar questão de ${modalidade}:`, error);
      throw error;
    }
  },

  /**
   * Buscar questões órfãs (sem torneio válido)
   */
  buscarOrfas: async () => {
    try {
      const orfas = {};

      for (const [mod, Model] of Object.entries(MODELOS)) {
        const questoes = await Model.findAll({
          attributes: ['id', 'titulo', 'torneio_id', 'criado_em']
        });

        const orfasModal = [];
        for (const q of questoes) {
          const torneio = await Torneio.findByPk(q.torneio_id);
          if (!torneio) {
            orfasModal.push(q.toJSON());
          }
        }

        if (orfasModal.length > 0) {
          orfas[mod] = orfasModal;
        }
      }

      return {
        sucesso: true,
        orfas,
        totalOrfas: Object.values(orfas).reduce((a, b) => a + b.length, 0)
      };
    } catch (error) {
      console.error(`❌ Erro ao buscar questões órfãs:`, error);
      throw error;
    }
  },

  /**
   * Deletar questões órfãs
   */
  deletarOrfas: async () => {
    try {
      let totalDeletadas = 0;

      for (const [mod, Model] of Object.entries(MODELOS)) {
        const questoes = await Model.findAll({
          attributes: ['id', 'torneio_id']
        });

        for (const q of questoes) {
          const torneio = await Torneio.findByPk(q.torneio_id);
          if (!torneio) {
            await q.destroy();
            totalDeletadas++;
            console.log(`🗑️ Questão órfã deletada: ${mod} ID ${q.id}`);
          }
        }
      }

      return {
        sucesso: true,
        totalDeletadas,
        mensagem: `${totalDeletadas} questões órfãs deletadas`
      };
    } catch (error) {
      console.error(`❌ Erro ao deletar questões órfãs:`, error);
      throw error;
    }
  },

  /**
   * Validar integridade de questões
   */
  validarIntegridade: async () => {
    try {
      const relatorio = {
        total: 0,
        validas: 0,
        invalidas: 0,
        problemas: []
      };

      for (const [mod, Model] of Object.entries(MODELOS)) {
        const questoes = await Model.findAll();

        for (const q of questoes) {
          relatorio.total++;

          const problemas = [];

          // Verificar torneio
          const torneio = await Torneio.findByPk(q.torneio_id);
          if (!torneio) {
            problemas.push(`Torneio não encontrado: ${q.torneio_id}`);
          }

          // Verificar campos obrigatórios
          if (!q.titulo || !q.titulo.trim()) {
            problemas.push('Título vazio');
          }
          if (!q.descricao || !q.descricao.trim()) {
            problemas.push('Descrição vazia');
          }
          if (!q.resposta_correta) {
            problemas.push('Resposta correta vazia');
          }

          if (problemas.length > 0) {
            relatorio.invalidas++;
            relatorio.problemas.push({
              modalidade: mod,
              id: q.id,
              titulo: q.titulo,
              problemas
            });
          } else {
            relatorio.validas++;
          }
        }
      }

      return {
        sucesso: true,
        relatorio
      };
    } catch (error) {
      console.error(`❌ Erro ao validar integridade:`, error);
      throw error;
    }
  },

  /**
   * Carregar questões para quiz (NOVO - Fase 3)
   * Substitui as rotas legadas: GET /perguntas/:area e GET /api/quiz/:area
   */
  carregarQuiz: async (tipo, limite = 10) => {
    try {
      console.log(`🎯 Carregando questões para quiz - Tipo: ${tipo}, Limite: ${limite}`);

      // CORREÇÃO: Buscar da tabela 'perguntas' (tabela legada onde as questões realmente estão)
      const questoes = await Questao.sequelize.query(
        `SELECT * FROM perguntas WHERE tipo = :tipo ORDER BY RAND() LIMIT :limite`,
        {
          replacements: { tipo, limite: Math.min(limite, 20) },
          type: Questao.sequelize.QueryTypes.SELECT
        }
      );

      if (questoes.length === 0) {
        console.warn(`⚠️ Nenhuma questão encontrada para tipo: ${tipo}`);
        return {
          sucesso: true,
          questoes: []
        };
      }

      // Processar questões para formato compatível com frontend
      const questoesProcessadas = questoes.map(q => {
        return {
          id: q.id,
          texto_pergunta: q.texto_pergunta,
          opcao_a: q.opcao_a,
          opcao_b: q.opcao_b,
          opcao_c: q.opcao_c,
          opcao_d: q.opcao_d,
          resposta_correta: q.resposta_correta,
          pontos: q.pontos || 10,
          tipo: q.tipo
        };
      });

      console.log(`✅ ${questoesProcessadas.length} questões carregadas para quiz`);

      return {
        sucesso: true,
        questoes: questoesProcessadas
      };
    } catch (error) {
      console.error(`❌ Erro ao carregar questões para quiz:`, error);
      throw error;
    }
  }
};

export default questoesService;
