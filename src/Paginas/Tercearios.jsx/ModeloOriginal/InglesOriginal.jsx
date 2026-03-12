import React, { useState, useEffect, useRef } from "react";
import socket from '../../../socket';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { FaSignOutAlt } from "react-icons/fa";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const TEMPO_QUESTAO = 120;
const DISCIPLINA = 'Inglês';

const usefulPhrases = [
  "In my opinion,", "Firstly,", "Secondly,", "Furthermore,", 
  "However,", "Therefore,", "In conclusion,", "For example,",
  "On the other hand,", "As a result,", "Moreover,", "Additionally,",
  "To summarize,", "It is important to", "One advantage is",
  "Another aspect is", "This means that", "In addition to",
  "Despite this,", "Consequently,"
];

export default function InglesOriginal() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const avaliacaoRef = useRef(null);
  const containerRef = useRef(null);
  const socketRef = useRef(null);
  const enunciadoRef = useRef(null);

  // Estados do torneio
  const [torneio, setTorneio] = useState(null);
  const [participante, setParticipante] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progresso, setProgresso] = useState(0);
  const [tempoRestante, setTempoRestante] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
  const [dentroDoPeriodo, setDentroDoPeriodo] = useState(false);
  const [error, setError] = useState(null);

  // Estados locais
  const [questoes, setQuestoes] = useState([]);
  const [questoesFiltradas, setQuestoesFiltradas] = useState([]);
  const [questaoIndex, setQuestaoIndex] = useState(0);
  const [questaoTime, setQuestaoTime] = useState(TEMPO_QUESTAO);
  const [resposta, setResposta] = useState("");
  const [nivelSelecionado, setNivelSelecionado] = useState("facil");
  const [resultado, setResultado] = useState("");
  const [pontuacao, setPontuacao] = useState(null);
  const [avaliacaoDetalhes, setAvaliacaoDetalhes] = useState(null);
  const [mostrarRanking, setMostrarRanking] = useState(false);
  const [mostrarDados, setMostrarDados] = useState(false);
  const [autoAvancarTimer, setAutoAvancarTimer] = useState(null);
  const [questoesTotais, setQuestoesTotais] = useState(0);
  const [contagemRegressiva, setContagemRegressiva] = useState(5);
  const [executando, setExecutando] = useState(false);

  // Função para calcular tempo restante baseado no banco de dados
  const calcularTempoRestante = (torneioData) => {
    if (!torneioData?.termina_em) {
      return { dias: 0, horas: 0, minutos: 0, segundos: 0 };
    }
    
    const agora = new Date();
    const fim = new Date(torneioData.termina_em);
    
    const diferencaMs = fim.getTime() - agora.getTime();
    
    if (diferencaMs <= 0) {
      return { dias: 0, horas: 0, minutos: 0, segundos: 0 };
    }
    
    const dias = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencaMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferencaMs % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferencaMs % (1000 * 60)) / 1000);
    
    return { dias, horas, minutos, segundos };
  };

  // Função para calcular progresso baseado no tempo
  const calcularProgressoTemporal = (torneioData) => {
    if (!torneioData?.inicia_em || !torneioData?.termina_em) return 100;
    
    const agora = new Date();
    const inicio = new Date(torneioData.inicia_em);
    const fim = new Date(torneioData.termina_em);
    
    if (agora < inicio) {
      setDentroDoPeriodo(false);
      return 100;
    } else if (agora > fim) {
      setDentroDoPeriodo(false);
      return 0;
    } else {
      setDentroDoPeriodo(true);
    }
    
    const duracaoTotal = fim.getTime() - inicio.getTime();
    const tempoRestanteMs = fim.getTime() - agora.getTime();
    const progressoPercentual = (tempoRestanteMs / duracaoTotal) * 100;
    
    return Math.min(100, Math.max(0, progressoPercentual));
  };

  // Atualizar timer do torneio
  useEffect(() => {
    if (!torneio) return;
    
    const atualizarTimer = () => {
      const tempo = calcularTempoRestante(torneio);
      setTempoRestante(tempo);
      
      const progresso = calcularProgressoTemporal(torneio);
      setProgresso(progresso);
    };
    
    atualizarTimer();
    const intervalId = setInterval(atualizarTimer, 1000);
    
    return () => clearInterval(intervalId);
  }, [torneio]);

  // Filtrar questões por dificuldade - CORRIGIDO: scroll após mudar nível
  useEffect(() => {
    if (questoes.length > 0) {
      const filtradas = questoes.filter(q => q.dificuldade === nivelSelecionado);
      setQuestoesFiltradas(filtradas);
      if (filtradas.length > 0) {
        setQuestaoIndex(0);
        setQuestaoTime(TEMPO_QUESTAO);
        // Scroll para o enunciado após mudar de nível
        setTimeout(() => {
          if (enunciadoRef.current) {
            enunciadoRef.current.scrollIntoView({ 
              behavior: 'smooth',
              block: 'center'
            });
          }
        }, 200);
      }
    }
  }, [nivelSelecionado, questoes]);

  // Atualizar total de questões
  useEffect(() => {
    if (questoes.length > 0) {
      setQuestoesTotais(questoes.length);
    }
  }, [questoes]);
  // Limpar timer de auto-avanço
  useEffect(() => {
    return () => {
      if (autoAvancarTimer) {
        clearTimeout(autoAvancarTimer);
      }
    };
  }, [autoAvancarTimer]);

  // SCROLL AUTOMÁTICO QUANDO A QUESTÃO MUDA (próxima questão)
  useEffect(() => {
    if (questoesFiltradas.length > 0 && enunciadoRef.current) {
      setTimeout(() => {
        enunciadoRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }, 200);
    }
  }, [questaoIndex]);

  // SCROLL AUTOMÁTICO NO CARREGAMENTO INICIAL
  useEffect(() => {
    if (questoesFiltradas.length > 0 && enunciadoRef.current) {
      setTimeout(() => {
        enunciadoRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }, 500);
    }
  }, [questoesFiltradas]);

  // VERIFICAR TORNEIO ATIVO

  // VERIFICAR TORNEIO ATIVO
  useEffect(() => {
    const verificarTorneioAtivo = async () => {
      try {
        console.log('🔍 Verificando torneio ativo para Inglês...');
        const response = await fetch('http://localhost:3000/api/torneios/ativo');
        const data = await response.json();
        
        if (data.ativo && data.torneio) {
          setTorneio(data.torneio);
          
          const tempo = calcularTempoRestante(data.torneio);
          setTempoRestante(tempo);
          
          const progresso = calcularProgressoTemporal(data.torneio);
          setProgresso(progresso);
          
          if (user?.id) {
            await buscarDadosUsuario(data.torneio.id, user.id);
          }
          
          await buscarRanking(data.torneio.id);
          await buscarQuestoes(data.torneio.id);
          
        } else {
          setError(data.message || "Nenhum torneio ativo no momento.");
        }
      } catch (err) {
        console.error('❌ Erro ao verificar torneio ativo:', err);
        setError("Erro ao conectar com o servidor. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    verificarTorneioAtivo();
  }, [user]);

  // Conectar Socket.IO para atualizações em tempo real do ranking (usa singleton)
  useEffect(() => {
    if (!torneio) return;

    socketRef.current = socket;

    const handleRankingUpdate = (payload) => {
      console.debug('Ingles recebido ranking_update', payload);
      try {
        if (payload?.torneio_id === torneio.id && payload?.disciplina === 'Inglês') {
          setRanking(payload.ranking || []);
        }
      } catch (e) {
        console.warn('Erro ao processar evento ranking_update (Inglês)', e);
      }
    };

    socketRef.current.on('ranking_update', handleRankingUpdate);

    return () => {
      try { if (socketRef.current) socketRef.current.off('ranking_update', handleRankingUpdate); } catch (e) {}
    };
  }, [torneio]);

  // Buscar dados do usuário
  const buscarDadosUsuario = async (torneioId, userId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/participantes/usuario/${userId}/ingles`
      );
      const data = await response.json();
      
      if (data.success && data.data) {
        setParticipante(data.data);
      } else if (response.status === 404) {
        await registrarParticipante(userId);
      }
    } catch (err) {
      console.error('❌ Erro ao buscar dados do usuário:', err);
    }
  };

  // Registrar participante
  const registrarParticipante = async (userId) => {
    try {
      const response = await fetch('http://localhost:3000/api/participantes/registrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          id_usuario: userId,
          disciplina_competida: DISCIPLINA
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setParticipante(data.data);
      }
    } catch (err) {
      console.error('❌ Erro ao registrar participante:', err);
    }
  };

  // Buscar ranking
  const buscarRanking = async (torneioId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/participantes/ranking/ingles`
      );
      const data = await response.json();
      
      if (data.success) {
        setRanking(data.data || []);
      }
    } catch (err) {
      console.error('❌ Erro ao buscar ranking:', err);
    }
  };

  // Buscar questões do banco de dados
  const buscarQuestoes = async (torneioId) => {
    try {
      const response = await fetch(`http://localhost:3000/torneios/${torneioId}/questoes/ingles`);
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        setQuestoes(data.data);
        const filtradas = data.data.filter(q => q.dificuldade === 'facil');
        setQuestoesFiltradas(filtradas);
        setNivelSelecionado('facil');
        setQuestoesTotais(data.data.length);
      } else {
        setQuestoes([]);
        setQuestoesFiltradas([]);
      }
    } catch (err) {
      console.error('Erro ao carregar questões:', err);
      setQuestoes([]);
      setQuestoesFiltradas([]);
    }
  };

  // Atualizar pontuação - CORREÇÃO: Sempre incrementa casos resolvidos, mesmo com 0 pontos
  const atualizarPontuacao = async (pontosAdicionados, casosAdicionados = 1) => {
    if (!participante?.usuario_id || !user?.id) return null;
    
    try {
      console.log('📈 Atualizando pontuação no banco:', { 
        usuario_id: user.id, 
        disciplina: DISCIPLINA,
        pontos: pontosAdicionados,
        casos: casosAdicionados 
      });
      
      const response = await fetch('http://localhost:3000/api/participantes/atualizar-pontuacao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          usuario_id: user.id,
          disciplina_competida: DISCIPLINA,
          pontuacao_adicionada: pontosAdicionados,
          casos_adicionados: casosAdicionados
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        console.log('✅ Pontuação atualizada no banco:', data.data);
        setParticipante(data.data);
        
        if (torneio?.id) {
          await buscarRanking(torneio.id);
        }
        
        return data.data;
      } else {
        console.error('❌ Erro na resposta da API:', data);
        return null;
      }
    } catch (err) {
      console.error('❌ Erro ao atualizar pontuação:', err);
      return null;
    }
  };

  // Temporizador da questão
  useEffect(() => {
    if (questoesFiltradas.length === 0) return;
    
    const interval = setInterval(() => {
      setQuestaoTime((prev) => {
        if (prev <= 0) {
          handleNextQuestao();
          return TEMPO_QUESTAO;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [questaoIndex, questoesFiltradas]);

  const formatTime = () => {
    const { dias, horas, minutos, segundos } = tempoRestante;
    if (dias > 0) {
      return `${dias}d ${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    }
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  };

  const formatSeconds = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleResposta = (value) => setResposta((prev) => prev + value + " ");

  const handleNextQuestao = () => {
    setResposta("");
    setResultado("");
    setPontuacao(null);
    setContagemRegressiva(5);
    setExecutando(false);
    if (autoAvancarTimer) {
      clearTimeout(autoAvancarTimer);
      setAutoAvancarTimer(null);
    }
    
    if (questoesFiltradas.length > 0) {
      setQuestaoIndex((prev) => (prev + 1 < questoesFiltradas.length ? prev + 1 : 0));
      setQuestaoTime(TEMPO_QUESTAO);
    }
  };

  const scrollToAvaliacao = () => {
    if (avaliacaoRef.current) {
      setTimeout(() => {
        avaliacaoRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
        
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  const iniciarContagemRegressiva = () => {
    let contador = 5;
    setContagemRegressiva(contador);
    
    const interval = setInterval(() => {
      contador -= 1;
      setContagemRegressiva(contador);
      
      if (contador <= 0) {
        clearInterval(interval);
        handleNextQuestao();
      }
    }, 1000);
    
    return interval;
  };

  const executarResposta = async () => {
    if (executando) return;
    setExecutando(true);

    const payload = {
      usuario_id: user?.id || participante?.usuario_id,
      disciplina: DISCIPLINA,
      respostas: [{
        pergunta_id: questoesFiltradas[questaoIndex]?.id || (questaoIndex + 1),
        texto: questoesFiltradas[questaoIndex]?.descricao || questoesFiltradas[questaoIndex]?.enunciado || '',
        resposta: resposta,
        nivel: nivelSelecionado
      }]
    };

    try {
      const resp = await fetch('http://localhost:3000/api/avaliar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
        body: JSON.stringify(payload)
      });

      const data = await resp.json();
      if (!data.success) {
        setResultado('Erro ao avaliar: ' + (data.error || 'Resposta inválida'));
        setPontuacao(0);
        setAvaliacaoDetalhes(null);
      } else {
        const detalhes = data.data.feedbacks || [];
        const total = Number(data.data.totalPontos || 0);
        setAvaliacaoDetalhes(detalhes[0] ? detalhes[0] : detalhes);
        setPontuacao(total);
        setResultado(detalhes[0]?.feedback || 'Avaliação concluída');
        if (data.data.participante) setParticipante(data.data.participante);
      }
    } catch (err) {
      console.error('Erro ao chamar /api/avaliar', err);
      setResultado('Erro de comunicação com o servidor');
      setPontuacao(0);
      setAvaliacaoDetalhes(null);
    } finally {
      setExecutando(false);
      scrollToAvaliacao();
      if (autoAvancarTimer) clearTimeout(autoAvancarTimer);
      const contagemInterval = iniciarContagemRegressiva();
      const timer = setTimeout(() => { clearInterval(contagemInterval); handleNextQuestao(); }, 6000);
      setAutoAvancarTimer(timer);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando torneio de Inglês...</p>
        </div>
      </div>
    );
  }

  if (error || !torneio) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Torneio Indisponível</h2>
          <p className="text-gray-600 mb-6">
            {error || "Não há torneio de Inglês ativo no momento."}
          </p>
          <button 
            onClick={() => navigate("/entrar-no-torneio")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ok, Entendi!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* HEADER */}
      <div className="bg-blue-600 text-white shadow-md">
        <div className="flex items-center justify-between p-4">

          <button 
            onClick={() => navigate("/entrar-no-torneio")} 
            className="flex items-center gap-1 border border-white px-2 py-1 text-[10px] sm:px-3 sm:py-1.5 sm:text-xs md:px-4 md:py-2 md:text-sm rounded hover:bg-white hover:text-blue-600 transition"
          >
            <FaSignOutAlt className="text-xs sm:text-sm md:text-base" />
            Sair do Torneio
          </button>

          <div className="flex flex-col items-center" translate="no">
            <p className="text-xs md:text-xs lg:text-sm">Tempo restante do torneio</p>
            <h2 className="text-lg md:text-base lg:text-xl font-bold">{formatTime()}</h2>
            <p className="text-xs opacity-75">
              {progresso.toFixed(1)}% restante
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white text-blue-600 font-bold px-2 py-1 text-[10px] sm:px-3 sm:py-1.5 sm:text-xs md:px-4 md:py-2 md:text-sm rounded-full flex items-center gap-1 shadow-md">
              English Tournament
            </div>
          </div>
        </div>

        <div className="w-full h-3 bg-white/30">
          <div 
            className="h-3 transition-all duration-1000 bg-gradient-to-r bg-green-100"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR ESQUERDA - RANKING */}
        <div className="hidden lg:block w-80 bg-white text-gray-800 shadow-lg p-3 overflow-y-auto" translate="no">
          <h2 className="text-xl font-bold mb-4 text-center border-b border-gray-300 pb-1">Student Ranking</h2>
          <table className="w-full table-auto text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="w-1/6 px-2 py-2 text-left">Pos</th>
                <th className="px-2 py-2 text-left">Name</th>
                <th className="w-1/6 px-2 py-2 text-left">Pts</th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {ranking.length > 0 ? (
                ranking.map((participanteRank) => (
                  <tr key={participanteRank.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-2 py-2 font-semibold">
                      {participanteRank.posicao === 1 ? '🥇' : 
                       participanteRank.posicao === 2 ? '🥈' : 
                       participanteRank.posicao === 3 ? '🥉' : 
                       participanteRank.posicao}
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        {participanteRank.usuario?.imagem ? (
                          <img 
                            src={participanteRank.usuario.imagem} 
                            alt={participanteRank.usuario.nome}
                            className="w-7 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                            {participanteRank.usuario?.nome?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                          </div>
                        )}
                        <span className="truncate">{participanteRank.usuario?.nome || 'Usuário'}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-blue-600 font-semibold">{participanteRank.pontuacao || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-2 py-4 text-center text-gray-500">
                    Nenhum participante ainda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ÁREA DE EXERCÍCIO */}
        <div 
          ref={containerRef}
          className="flex-1 flex flex-col items-center p-4 overflow-auto space-y-4" 
          translate="no"
          style={{ scrollBehavior: 'smooth' }}
        >
          {/* HEADER */}
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-md p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-lg md:text-xl lg:text-2xl font-normal text-gray-800 text-center">
              {torneio?.titulo || 'English Writing Tournament'}
            </h1>
            
            {/* BOTÕES DE NÍVEL */}
            <div className="flex gap-2 flex-wrap justify-center">
              {[
                { nivel: "facil", label: "Easy", pts: 5 },
                { nivel: "medio", label: "Medium", pts: 10 },
                { nivel: "dificil", label: "Hard", pts: 20 }
              ].map((item) => (
                <button 
                  key={item.nivel} 
                  onClick={() => setNivelSelecionado(item.nivel)}
                  className={`px-3 py-1.5 text-xs md:text-sm rounded-full font-semibold transition-all ${
                    nivelSelecionado === item.nivel
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {item.label} • {item.pts} pts
                  <span className="ml-1 text-xs">
                    ({questoes.filter(q => q.dificuldade === item.nivel).length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* MENSAGEM SE NÃO HÁ QUESTÕES */}
          {questoesFiltradas.length === 0 ? (
            <div className="w-full max-w-4xl bg-yellow-50 border border-yellow-200 rounded-xl shadow p-6 text-center">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Nenhuma questão disponível</h3>
              <p className="text-yellow-700">
                Não há questões de {nivelSelecionado === 'facil' ? 'fácil' : nivelSelecionado === 'medio' ? 'médio' : 'difícil'} 
                disponíveis no momento.
              </p>
              <p className="text-sm text-yellow-600 mt-2">
                Selecione outro nível de dificuldade.
              </p>
            </div>
          ) : (
            <>
              {/* ENUNCIADO - COM REF PARA SCROLL */}
              <div 
                ref={enunciadoRef}
                className="w-full max-w-4xl bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-600 rounded-xl shadow p-4"
              >
                <p className="text-sm md:text-base font-medium text-gray-800">
                  {questoesFiltradas[questaoIndex]?.descricao || questoesFiltradas[questaoIndex]?.enunciado}
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  <span>Questão {questaoIndex + 1} de {questoesFiltradas.length}</span>
                  <span className="ml-4 capitalize font-semibold">
                    Dificuldade: {questoesFiltradas[questaoIndex]?.dificuldade || 'N/A'}
                  </span>
                  <span className="ml-4 font-semibold text-blue-600">
                    Pontos: {questoesFiltradas[questaoIndex]?.pontos || 'N/A'}
                  </span>
                  <span className="ml-4">
                    Word Count: {resposta.trim().split(/\s+/).filter(w => w.length > 0).length}
                  </span>
                </div>
              </div>

              {/* EDITOR */}
              <div className="w-full max-w-4xl bg-white rounded-xl shadow-md p-4 space-y-3">
                {/* FRASES ÚTEIS */}
                <div className="flex gap-1 md:gap-2 flex-wrap justify-center border-b pb-3 overflow-x-auto">
                  {usefulPhrases.map((phrase) => (
                    <button 
                      key={phrase} 
                      onClick={() => handleResposta(phrase)}
                      className="px-2 py-1 text-xs md:text-sm bg-gray-100 hover:bg-blue-100 text-gray-800 rounded-md transition"
                    >
                      {phrase}
                    </button>
                  ))}
                </div>

                {/* TEXTAREA */}
                <textarea 
                  value={resposta} 
                  onChange={(e) => setResposta(e.target.value)}
                  className="w-full h-80 resize-none p-3 text-sm md:text-base bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your essay here. Grammar, spelling, structure and coherence will be evaluated..."
                  spellCheck="true" 
                />
              </div>

              {/* TEMPORIZADOR */}
              <div className="w-full max-w-4xl bg-white rounded-xl shadow-md p-4">
                <div className="flex justify-between items-center mb-2 text-sm md:text-base font-semibold text-gray-700">
                  <span>Time remaining for this question</span>
                  <span className="px-2 py-0.5 rounded bg-gray-100">{formatSeconds(questaoTime)}</span>
                </div>
                <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${questaoTime < 10 ? "bg-red-500" : "bg-blue-600"}`}
                    style={{ width: `${(questaoTime / TEMPO_QUESTAO) * 100}%` }} 
                  />
                </div>
              </div>

              {/* BOTÕES DE CONTROLE */}
              <div className="flex gap-3 w-full max-w-4xl">
                <button 
                  onClick={handleNextQuestao}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all"
                >
                  Próxima Questão
                </button>
                <button 
                  onClick={executarResposta}
                  disabled={executando}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                    executando
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm md:text-base">
                    {executando ? "Processando..." : "Submit Essay"}
                  </span>
                </button>
              </div>
            </>
          )}

          {/* BOTÕES MOBILE */}
          <div className="flex flex-col sm:flex-row w-full max-w-5xl justify-between gap-3 mt-4 lg:hidden">
            <button 
              onClick={() => setMostrarRanking(true)} 
              className="flex-1 bg-gray-800 hover:bg-gray-900 text-white px-4 py-3 rounded-lg shadow-md text-sm transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Ver Ranking
            </button>
            <button 
              onClick={() => setMostrarDados(true)} 
              className="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Ver seus Dados
            </button>
          </div>

          {/* REF para scroll automático */}
          <div ref={avaliacaoRef} className="h-1 w-full"></div>

          {/* RESULTADO / AVALIAÇÃO */}
          {resultado && (
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-600">
              <h3 className="text-gray-700 font-semibold mb-2">Your Essay Evaluation</h3>
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">{avaliacaoDetalhes ? (avaliacaoDetalhes.score >= 0.9 ? '✅' : avaliacaoDetalhes.score >= 0.6 ? '⚠️' : '❌') : 'ℹ️'}</span>
                <p className="text-gray-800">{resultado}</p>
              </div>
              {pontuacao !== null && (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-700">Score:</span>
                  <span className={`font-bold px-2 py-1 rounded ${
                    pontuacao >= 15 ? "bg-green-200 text-green-800" :
                    pontuacao >= 8 ? "bg-yellow-200 text-yellow-800" :
                    "bg-red-200 text-red-800"
                  }`}>
                    {pontuacao} pts
                  </span>
                  {avaliacaoDetalhes?.evidencias && (
                    <div className="ml-4 text-sm text-gray-500">Evidências: <span className="font-medium">{avaliacaoDetalhes.evidencias}</span></div>
                  )}
                  <span className="text-sm text-gray-500 ml-auto">
                    Pontuação adicionada ao seu ranking
                  </span>
                  {autoAvancarTimer && contagemRegressiva > 0 && (
                    <span className="text-xs text-blue-600 animate-pulse">
                      (Próxima questão em {contagemRegressiva}s...)
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SIDEBAR DIREITA - INFO USUÁRIO */}
        <div className="hidden lg:flex w-64 bg-white text-gray-800 shadow-lg p-4 overflow-y-auto flex-col items-center space-y-3">
          <div className="flex flex-col items-center mb-3">
            {participante?.usuario?.imagem ? (
              <img 
                src={participante.usuario.imagem} 
                alt={participante.usuario.nome}
                className="w-20 h-20 rounded-full object-cover border-2 border-blue-400 mb-2"
              />
            ) : (
              <div className="w-20 h-20 rounded-full mb-2 border-2 border-blue-400 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold">
                {participante?.usuario?.nome?.split(' ').map(n => n[0]).join('').substring(0, 2) || user?.nome?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
              </div>
            )}
            <h3 className="text-lg font-bold mt-2">{participante?.usuario?.nome || user?.nome || "Usuário"}</h3>
            <p className="text-sm text-gray-500">Participante do Torneio</p>
          </div>

          {participante ? (
            <div className="w-full flex flex-col gap-2 items-center">
              {/* PONTUAÇÃO */}
              <div className="bg-white rounded-3xl border border-blue-200 p-2 flex flex-col items-center gap-1 w-40">
                <div className="w-14 h-14">
                  <CircularProgressbar 
                    value={participante.pontuacao || 0} 
                    maxValue={10000} 
                    text={`${participante.pontuacao || 0}`} 
                    styles={buildStyles({ 
                      textSize: '16px', 
                      textColor: '#333', 
                      pathColor: "#3b82f6", 
                      trailColor: '#e5e5e5' 
                    })} 
                  />
                </div>
                <span className="text-xs font-semibold text-center">Pontuação</span>
              </div>
              
              {/* POSIÇÃO */}
              <div className="bg-white rounded-3xl border border-blue-200 p-2 flex flex-col items-center gap-1 w-40">
                <div className="w-14 h-14">
                  <CircularProgressbar 
                    value={participante.posicao || 0} 
                    maxValue={100} 
                    text={`#${participante.posicao || 0}`} 
                    styles={buildStyles({ 
                      textSize: '16px', 
                      textColor: '#333', 
                      pathColor: "#3b82f6", 
                      trailColor: '#e5e5e5' 
                    })} 
                  />
                </div>
                <span className="text-xs font-semibold text-center">Posição</span>
              </div>
              
              {/* CASOS RESOLVIDOS */}
              <div className="bg-white rounded-3xl border border-blue-200 p-2 flex flex-col items-center gap-1 w-40">
                <div className="w-14 h-14">
                  <CircularProgressbar 
                    value={participante.casos_resolvidos || 0} 
                    maxValue={questoesTotais || 100} 
                    text={`${participante.casos_resolvidos || 0}/${questoesTotais || 100}`} 
                    styles={buildStyles({ 
                      textSize: '12px', 
                      textColor: '#333', 
                      pathColor: "#3b82f6", 
                      trailColor: '#e5e5e5' 
                    })} 
                  />
                </div>
                <span className="text-xs font-semibold text-center">Casos Resolvidos</span>
              </div>
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-gray-600 mb-3">Você ainda não está participando deste torneio</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Entrar no Torneio
              </button>
            </div>
          )}
        </div>
      </div>

      {/* OVERLAY SIDEBAR ESQUERDA (RANKING MOBILE) */}
      {mostrarRanking && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div 
            className="absolute inset-0 bg-black/60 transition-opacity duration-300" 
            onClick={() => setMostrarRanking(false)}
          />
          <div className="relative w-80 bg-white text-gray-800 p-4 overflow-y-auto transform transition-transform duration-300 ease-out translate-x-0">
            <button 
              onClick={() => setMostrarRanking(false)} 
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl transition-colors"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4 text-center border-b border-gray-300 pb-1">Student Ranking</h2>
            <table className="w-full table-auto text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="w-1/6 px-2 py-2 text-left">Pos</th>
                  <th className="px-2 py-2 text-left">Name</th>
                  <th className="w-1/6 px-2 py-2 text-left">Pts</th>
                </tr>
              </thead>
              <tbody className="text-gray-800">
                {ranking.length > 0 ? (
                  ranking.map((participanteRank) => (
                    <tr key={participanteRank.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-2 py-2 font-semibold">
                        {participanteRank.posicao === 1 ? '🥇' : 
                         participanteRank.posicao === 2 ? '🥈' : 
                         participanteRank.posicao === 3 ? '🥉' : 
                         participanteRank.posicao}
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          {participanteRank.usuario?.imagem ? (
                            <img 
                              src={participanteRank.usuario.imagem} 
                              alt={participanteRank.usuario.nome}
                              className="w-7 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-7 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                              {participanteRank.usuario?.nome?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                            </div>
                          )}
                          <span className="truncate">{participanteRank.usuario?.nome || 'Usuário'}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-blue-600 font-semibold">{participanteRank.pontuacao || 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-2 py-4 text-center text-gray-500">
                      Nenhum participante ainda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OVERLAY SIDEBAR DIREITA (DADOS USUÁRIO MOBILE) */}
      {mostrarDados && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          <div 
            className="absolute inset-0 bg-black/60 transition-opacity duration-300" 
            onClick={() => setMostrarDados(false)}
          />
          <div className="relative w-72 bg-white text-gray-800 p-4 overflow-y-auto transform transition-transform duration-300 ease-out translate-x-0">
            <button 
              onClick={() => setMostrarDados(false)} 
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl transition-colors"
            >
              ✕
            </button>
            <div className="flex flex-col items-center mb-3">
              {participante?.usuario?.imagem ? (
                <img 
                  src={participante.usuario.imagem} 
                  alt={participante.usuario.nome}
                  className="w-20 h-20 rounded-full object-cover border-2 border-blue-400 mb-2"
                />
              ) : (
                <div className="w-20 h-20 rounded-full mb-2 border-2 border-blue-400 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold">
                  {participante?.usuario?.nome?.split(' ').map(n => n[0]).join('').substring(0, 2) || user?.nome?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                </div>
              )}
              <h3 className="text-lg font-bold mt-2">{participante?.usuario?.nome || user?.nome || "Usuário"}</h3>
            </div>
            
            {participante ? (
              <div className="w-full flex flex-col mt-4 gap-4 items-center">
                {/* PONTUAÇÃO */}
                <div className="bg-white rounded-3xl border border-blue-200 p-2 flex flex-col items-center gap-1 w-40">
                  <div className="w-14 h-14">
                    <CircularProgressbar 
                      value={participante.pontuacao || 0} 
                      maxValue={10000} 
                      text={`${participante.pontuacao || 0}`} 
                      styles={buildStyles({ 
                        textSize: '16px', 
                        textColor: '#333', 
                        pathColor: "#3b82f6", 
                        trailColor: '#e5e5e5' 
                      })} 
                    />
                  </div>
                  <span className="text-xs font-semibold text-center">Pontuação</span>
                </div>
                
                {/* POSIÇÃO */}
                <div className="bg-white rounded-3xl border border-blue-200 p-2 flex flex-col items-center gap-1 w-40">
                  <div className="w-14 h-14">
                    <CircularProgressbar 
                      value={participante.posicao || 0} 
                      maxValue={100} 
                      text={`#${participante.posicao || 0}`} 
                      styles={buildStyles({ 
                        textSize: '16px', 
                        textColor: '#333', 
                        pathColor: "#3b82f6", 
                        trailColor: '#e5e5e5' 
                      })} 
                    />
                  </div>
                  <span className="text-xs font-semibold text-center">Posição</span>
                </div>
                
                {/* CASOS RESOLVIDOS */}
                <div className="bg-white rounded-3xl border border-blue-200 p-2 flex flex-col items-center gap-1 w-40">
                  <div className="w-14 h-14">
                    <CircularProgressbar 
                      value={participante.casos_resolvidos || 0} 
                      maxValue={questoesTotais || 100} 
                      text={`${participante.casos_resolvidos || 0}/${questoesTotais || 100}`} 
                      styles={buildStyles({ 
                        textSize: '12px', 
                        textColor: '#333', 
                        pathColor: "#3b82f6", 
                        trailColor: '#e5e5e5' 
                      })} 
                    />
                  </div>
                  <span className="text-xs font-semibold text-center">Casos Resolvidos</span>
                </div>
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="text-gray-600">Você ainda não está participando</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}