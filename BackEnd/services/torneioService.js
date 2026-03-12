// services/torneioService.js
import axios from 'axios';

const API_URL = 'http://localhost:3000';

const torneioService = {
  // Verificar se há torneio ativo para uma disciplina
  verificarTorneioAtivo: async (disciplina) => {
    try {
      const response = await axios.get(`${API_URL}/torneios`);
      
      // Converter disciplina para corresponder no título
      const disciplinaMap = {
        'Inglês': 'inglês',
        'Matemática': 'matemática',
        'Programação': 'programação'
      };
      
      const termoBusca = disciplinaMap[disciplina] || disciplina.toLowerCase();
      
      // Filtrar torneios ativos que contenham o termo da disciplina no título
      const torneiosAtivos = response.data.data.filter(t => {
        const tituloLower = t.titulo.toLowerCase();
        const statusOk = t.status === 'ativo' || t.status === 'agendado';
        const dataAtual = new Date();
        const iniciaEm = new Date(t.inicia_em);
        const terminaEm = new Date(t.termina_em);
        const dentroDoPeriodo = dataAtual >= iniciaEm && dataAtual <= terminaEm;
        
        return statusOk && dentroDoPeriodo && tituloLower.includes(termoBusca);
      });
      
      if (torneiosAtivos.length === 0) {
        // Verificar se há torneios agendados para o futuro
        const torneiosFuturos = response.data.data.filter(t => {
          const tituloLower = t.titulo.toLowerCase();
          const dataAtual = new Date();
          const iniciaEm = new Date(t.inicia_em);
          return t.status === 'agendado' && iniciaEm > dataAtual && tituloLower.includes(termoBusca);
        });
        
        if (torneiosFuturos.length > 0) {
          return {
            torneio: torneiosFuturos[0],
            status: 'agendado',
            mensagem: 'Torneio agendado para começar em breve'
          };
        }
        
        return null;
      }
      
      return {
        torneio: torneiosAtivos[0],
        status: 'ativo',
        mensagem: 'Torneio ativo e disponível'
      };
    } catch (error) {
      console.error('Erro ao verificar torneio ativo:', error);
      return null;
    }
  },

  // Calcular tempo restante do torneio
  calcularTempoRestante: (iniciaEm, terminaEm) => {
    const agora = new Date().getTime();
    const inicio = new Date(iniciaEm).getTime();
    const termino = new Date(terminaEm).getTime();
    
    // Se torneio ainda não começou
    if (agora < inicio) {
      return {
        segundos: Math.floor((inicio - agora) / 1000),
        status: 'agendado',
        progresso: 0
      };
    }
    
    // Se torneio em andamento
    if (agora >= inicio && agora <= termino) {
      const tempoTotal = termino - inicio;
      const tempoDecorrido = agora - inicio;
      const tempoRestante = termino - agora;
      
      return {
        segundos: Math.max(0, Math.floor(tempoRestante / 1000)),
        status: 'ativo',
        progresso: Math.min(100, Math.max(0, (tempoDecorrido / tempoTotal) * 100))
      };
    }
    
    // Se torneio terminou
    return {
      segundos: 0,
      status: 'finalizado',
      progresso: 100
    };
  },

  // Obter questões do torneio por disciplina
  obterQuestoes: async (torneioId, disciplina) => {
    try {
      const endpoint = {
        'Matemática': `questoes/matematica`,
        'Inglês': `questoes/ingles`,
        'Programação': `questoes/programacao`
      }[disciplina];
      
      if (!endpoint) return [];
      
      const response = await axios.get(`${API_URL}/torneios/${torneioId}/${endpoint}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Erro ao obter questões:', error);
      return [];
    }
  },

  // Submeter resposta e atualizar pontuação
  submeterResposta: async (torneioId, usuarioId, respostaData) => {
    try {
      const response = await axios.post(`${API_URL}/torneios/${torneioId}/submit`, {
        usuario_id: usuarioId,
        respostas: respostaData
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao submeter resposta:', error);
      throw error;
    }
  },

  // Inscrever no torneio
  inscreverNoTorneio: async (torneioId, usuarioId, disciplina) => {
    try {
      const response = await axios.post(`${API_URL}/torneios/inscrever`, {
        torneio_id: torneioId,
        usuario_id: usuarioId,
        disciplina_competida: disciplina
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao inscrever no torneio:', error);
      throw error;
    }
  },

  // Obter ranking por disciplina
  obterRanking: async (torneioId, disciplina) => {
    try {
      const response = await axios.get(`${API_URL}/torneios/${torneioId}/participantes`, {
        params: { disciplina }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter ranking:', error);
      return [];
    }
  },

  // Obter minha participação
  obterMinhaParticipacao: async (torneioId, usuarioId, disciplina) => {
    try {
      const response = await axios.get(`${API_URL}/torneios/${torneioId}/minha-participacao`, {
        params: { usuario_id: usuarioId, disciplina }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter minha participação:', error);
      return null;
    }
  },

  // Atualizar pontos do participante
  atualizarPontos: async (participanteId, pontos, descricao) => {
    try {
      const response = await axios.patch(`${API_URL}/participantes/${participanteId}/pontos`, {
        pontos,
        descricao
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar pontos:', error);
      throw error;
    }
  }
};

export default torneioService;