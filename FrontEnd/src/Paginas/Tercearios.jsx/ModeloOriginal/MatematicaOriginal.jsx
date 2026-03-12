import React, { useState, useEffect, useRef } from "react";
import socket from '../../../socket';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import Layout from "../../Secundarias/Layout";
import { 
  Trophy, Clock, LogOut, ChevronRight, 
  Send, Sparkles, AlertCircle, CheckCircle,
  BarChart2, Zap, Brain, BookOpen, Calculator
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TEMPO_QUESTAO = 90;
const DISCIPLINA = 'Matemática';

export default function MatematicaOriginal() {
  const navigate = useNavigate();
  const { user, token, login } = useAuth();
  const containerRef = useRef(null);
  const enunciadoRef = useRef(null);
  const avaliacaoRef = useRef(null);

  // Estados do torneio
  const [torneio, setTorneio] = useState(null);
  const [participante, setParticipante] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progresso, setProgresso] = useState(0);
  const [tempoRestante, setTempoRestante] = useState({ dias: 0, horas: 0, min: 0, seg: 0 });
  const [error, setError] = useState(null);

  // Estados locais da questão
  const [questoes, setQuestoes] = useState([]);
  const [questoesFiltradas, setQuestoesFiltradas] = useState([]);
  const [questaoIndex, setQuestaoIndex] = useState(0);
  const [questaoTime, setQuestaoTime] = useState(TEMPO_QUESTAO);
  const [resposta, setResposta] = useState("");
  const [nivelSelecionado, setNivelSelecionado] = useState("facil");
  const [executando, setExecutando] = useState(false);
  const [avaliacaoDetalhes, setAvaliacaoDetalhes] = useState(null);
  const [contagemRegressiva, setContagemRegressiva] = useState(null);

  // Inicialização e Busca de Dados
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const resAtivo = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}/api/torneios/ativo`);
        const dataAtivo = await resAtivo.json();
        
        if (dataAtivo.ativo && dataAtivo.torneio) {
          setTorneio(dataAtivo.torneio);
          const tId = dataAtivo.torneio.id;
          
          if (user?.id) {
            // Buscar ou Registrar Participante
            const resPart = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}/api/participantes/usuario/${user.id}/matematica`);
            const dataPart = await resPart.json();
            
            if (dataPart.success) {
              setParticipante(dataPart.data);
            } else {
              // Registrar se não existir
              const resReg = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}/api/participantes/registrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id_usuario: user.id, disciplina_competida: DISCIPLINA })
              });
              const dataReg = await resReg.json();
              if (dataReg.success) setParticipante(dataReg.data);
            }
          }

          // Buscar Ranking e Questões
          const [resRank, resQ] = await Promise.all([
            fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}/api/participantes/ranking/matematica`),
            fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}/torneios/${tId}/questoes/matematica`)
          ]);
          
          const dataRank = await resRank.json();
          const dataQ = await resQ.json();
          
          if (dataRank.success) setRanking(dataRank.data || []);
          if (dataQ.success) setQuestoes(dataQ.data || []);
        } else {
          setError("Não há torneio ativo no momento.");
        }
      } catch (err) {
        setError("Erro ao carregar dados do torneio.");
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, [user, token]);

  // Real-time Ranking via Socket
  useEffect(() => {
    if (!torneio) return;
    const handleRankingUpdate = (payload) => {
      if (payload?.torneio_id === torneio.id && payload?.disciplina === DISCIPLINA) {
        setRanking(payload.ranking || []);
      }
    };
    socket.on('ranking_update', handleRankingUpdate);
    return () => socket.off('ranking_update', handleRankingUpdate);
  }, [torneio]);

  // Temporizador Global do Torneio
  useEffect(() => {
    if (!torneio) return;
    const timer = setInterval(() => {
      const agora = new Date();
      const fim = new Date(torneio.termina_em);
      const inicio = new Date(torneio.inicia_em);
      const diff = fim.getTime() - agora.getTime();
      
      if (diff <= 0) {
        setTempoRestante({ dias: 0, horas: 0, min: 0, seg: 0 });
        setProgresso(0);
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTempoRestante({ dias: d, horas: h, min: m, seg: s });
        
        const total = fim.getTime() - inicio.getTime();
        setProgresso(Math.max(0, (diff / total) * 100));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [torneio]);

  // Filtragem e Navegação de Questões
  useEffect(() => {
    const filtradas = questoes.filter(q => q.dificuldade === nivelSelecionado);
    setQuestoesFiltradas(filtradas);
    setQuestaoIndex(0);
    setQuestaoTime(TEMPO_QUESTAO);
    setResposta("");
    setAvaliacaoDetalhes(null);
  }, [nivelSelecionado, questoes]);

  useEffect(() => {
    if (questoesFiltradas.length > 0) {
      const timer = setInterval(() => {
        setQuestaoTime(prev => {
          if (prev <= 0) {
            handleNextQuestao();
            return TEMPO_QUESTAO;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [questaoIndex, questoesFiltradas]);

  const handleNextQuestao = () => {
    setQuestaoIndex(prev => (prev + 1 < questoesFiltradas.length ? prev + 1 : 0));
    setQuestaoTime(TEMPO_QUESTAO);
    setResposta("");
    setAvaliacaoDetalhes(null);
    setContagemRegressiva(null);
    if (enunciadoRef.current) enunciadoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const enviarResposta = async () => {
    if (executando || !resposta.trim()) return;
    setExecutando(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}/api/avaliar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          usuario_id: user.id,
          disciplina: DISCIPLINA,
          respostas: [{
            pergunta_id: questoesFiltradas[questaoIndex].id,
            texto: questoesFiltradas[questaoIndex].descricao,
            resposta: resposta,
            nivel: nivelSelecionado
          }]
        })
      });
      const data = await res.json();
      if (data.success) {
        const feedback = data.data.feedbacks?.[0] || {};
        setAvaliacaoDetalhes(feedback);
        if (data.data.participante) setParticipante(data.data.participante);
        
        // Timer para próxima questão
        let count = 5;
        setContagemRegressiva(count);
        const interval = setInterval(() => {
          count--;
          setContagemRegressiva(count);
          if (count <= 0) {
            clearInterval(interval);
            handleNextQuestao();
          }
        }, 1000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExecutando(false);
      if (avaliacaoRef.current) avaliacaoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-500 font-bold">Iniciando Ambiente de Competição...</p>
        </div>
      </Layout>
    );
  }

  if (error || !torneio) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl text-center border border-red-100">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Torneio Indisponível</h2>
          <p className="text-gray-600 mb-8">{error || "Não há competições ativas de Matemática."}</p>
          <button onClick={() => navigate('/entrar-no-torneio')} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
            Voltar para Inscrições
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Tournament Dashboard Header */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <Calculator size={32} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight">{torneio.titulo}</h1>
                <div className="flex items-center gap-2 text-blue-100 text-sm font-medium">
                  <span className="px-2 py-0.5 bg-white/10 rounded-md">Matemática</span>
                  <span>•</span>
                  <span>Competição Oficial COMAES</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">Tempo Restante</p>
                <div className="flex gap-2 items-end">
                  <div className="text-2xl font-black tabular-nums">
                    {tempoRestante.horas.toString().padStart(2, '0')}:{tempoRestante.min.toString().padStart(2, '0')}:{tempoRestante.seg.toString().padStart(2, '0')}
                  </div>
                  {tempoRestante.dias > 0 && <span className="text-sm font-bold pb-1">{tempoRestante.dias}d</span>}
                </div>
              </div>
              <div className="h-10 w-px bg-white/20 hidden md:block"></div>
              <div className="text-center group cursor-help" title="Sua pontuação nesta disciplina">
                <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">Seus Pontos</p>
                <div className="text-2xl font-black text-amber-300 flex items-center justify-center gap-2">
                  <Zap size={20} className="fill-current" />
                  {participante?.pontuacao || 0}
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate('/entrar-no-torneio')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-bold flex items-center gap-2 transition-all border border-white/20"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
          
          <div className="h-1.5 w-full bg-gray-100 relative">
            <motion.div 
              className="absolute left-0 top-0 h-full bg-amber-400"
              initial={{ width: 0 }}
              animate={{ width: `${progresso}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar: Ranking & Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-black text-gray-800 flex items-center gap-2">
                  <Trophy size={18} className="text-amber-500" />
                  Top Classificados
                </h3>
                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase">Live</span>
              </div>
              <div className="p-2 space-y-1 max-h-[400px] overflow-y-auto">
                {ranking.length > 0 ? ranking.map((rank, i) => (
                  <div key={rank.id} className={`flex items-center justify-between p-3 rounded-2xl transition-all ${rank.usuario_id === user.id ? 'bg-blue-50 border-blue-100' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-6 text-center font-black text-xs ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-500' : 'text-gray-300'}`}>
                        {i + 1}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-white shadow-sm">
                        <img src={rank.usuario?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rank.usuario?.nome || 'U')}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <span className={`text-sm font-bold truncate max-w-[100px] ${rank.usuario_id === user.id ? 'text-blue-700' : 'text-gray-700'}`}>
                        {rank.usuario?.nome || 'Usuário'}
                      </span>
                    </div>
                    <span className="text-xs font-black text-blue-600">{rank.pontuacao} pts</span>
                  </div>
                )) : (
                  <div className="p-8 text-center text-gray-400 text-sm">Aguardando participantes...</div>
                )}
              </div>
              {participante && ranking.findIndex(r => r.usuario_id === user.id) === -1 && (
                <div className="bg-gray-50 p-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-500 italic">
                    <span>Sua Posição</span>
                    <span>Fora do Top 10</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-lg overflow-hidden relative">
              <Brain size={120} className="absolute -right-8 -bottom-8 opacity-10 rotate-12" />
              <h4 className="font-black text-lg mb-2">Dica Pro</h4>
              <p className="text-sm text-blue-100 italic leading-relaxed">
                "Problemas difíceis valem 4x mais pontos. Tente resolver pelo menos um para subir no ranking rápido!"
              </p>
            </div>
          </div>

          {/* Main Area: Exercise & Interactive UI */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Seletor de Dificuldade */}
            <div className="bg-white p-2 rounded-2xl shadow-md border border-gray-100 flex gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'facil', label: 'Básico', pts: 5, color: 'text-green-600 bg-green-50' },
                { id: 'medio', label: 'Intermédio', pts: 10, color: 'text-amber-600 bg-amber-50' },
                { id: 'dificil', label: 'Avançado', pts: 20, color: 'text-red-600 bg-red-50' },
              ].map(lvl => (
                <button
                  key={lvl.id}
                  onClick={() => setNivelSelecionado(lvl.id)}
                  className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex flex-col items-center gap-1 ${nivelSelecionado === lvl.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  {lvl.label}
                  <span className={`px-2 py-0.5 rounded-full ${nivelSelecionado === lvl.id ? 'bg-white/20' : lvl.color}`}>+{lvl.pts} pts</span>
                </button>
              ))}
            </div>

            {questoesFiltradas.length > 0 && questoesFiltradas[questaoIndex] ? (
              <motion.div 
                key={`${nivelSelecionado}-${questaoIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Card de Questão */}
                <div ref={enunciadoRef} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-6 sm:p-8 bg-gray-50/50">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                        Questão {questaoIndex + 1} de {questoesFiltradas.length}
                      </span>
                      <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-widest">
                        <Clock size={16} className={questaoTime < 20 ? 'text-red-500 animate-pulse' : ''} />
                        <span className={questaoTime < 20 ? 'text-red-600' : ''}>{Math.floor(questaoTime / 60)}:{ (questaoTime % 60).toString().padStart(2, '0')}</span>
                      </div>
                    </div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight mb-4">
                      {questoesFiltradas[questaoIndex].titulo || "Desafio de Lógica"}
                    </h2>
                    <p className="text-gray-600 text-lg leading-relaxed font-medium">
                      {questoesFiltradas[questaoIndex].descricao}
                    </p>
                  </div>

                  {/* Math Interactive Input */}
                  <div className="p-6 sm:p-8 border-t border-gray-100">
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {["+", "-", "×", "÷", "√", "=", "(", ")", "π", "²", "³"].map(sym => (
                        <button 
                          key={sym} 
                          onClick={() => setResposta(prev => prev + sym)}
                          className="w-10 h-10 bg-gray-50 hover:bg-blue-50 text-gray-700 font-bold rounded-xl border border-gray-100 transition-all active:scale-95"
                        >
                          {sym}
                        </button>
                      ))}
                    </div>
                    <textarea 
                      value={resposta}
                      onChange={(e) => setResposta(e.target.value)}
                      placeholder="Resolva o problema passo a passo para ganhar pontuação máxima pela lógica..."
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl p-6 font-mono text-gray-800 text-lg min-h-[300px] outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="bg-gray-50 px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-gray-400 text-xs font-medium flex items-center gap-2">
                       <Sparkles size={14} className="text-amber-400" />
                       Avaliado por COMAES AI Engine v2.0
                    </div>
                    <div className="flex gap-4 w-full sm:w-auto">
                      <button 
                         onClick={handleNextQuestao}
                         className="flex-1 py-4 px-6 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-all"
                      >
                        Pular
                      </button>
                      <button 
                        onClick={enviarResposta}
                        disabled={executando || !resposta.trim()}
                        className="flex-[2] py-4 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-100 transition-all border-b-4 border-blue-800 active:translate-y-1 active:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {executando ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <Send size={20} />}
                        Submeter Resolução
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Feedback Section */}
                <AnimatePresence>
                  {avaliacaoDetalhes && (
                    <motion.div 
                      ref={avaliacaoRef}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden"
                    >
                      <div className={`p-6 flex items-center justify-between ${avaliacaoDetalhes.score >= 0.8 ? 'bg-green-50' : 'bg-amber-50'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${avaliacaoDetalhes.score >= 0.8 ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                            {avaliacaoDetalhes.score >= 0.8 ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                          </div>
                          <div>
                            <h3 className="font-black text-gray-800">Resultado da Avaliação</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Feedback instantâneo da IA</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-black text-blue-600">+{avaliacaoDetalhes.pontos || 0}</p>
                          <p className="text-xs font-bold text-gray-400 uppercase">Pontos ganhos</p>
                        </div>
                      </div>
                      <div className="p-8">
                        <div className="bg-gray-50 rounded-2xl p-6 italic text-gray-600 leading-relaxed font-medium mb-6">
                           "{avaliacaoDetalhes.feedback}"
                        </div>
                        {contagemRegressiva !== null && (
                          <div className="flex items-center justify-center gap-3 py-2 bg-blue-50 rounded-xl text-blue-600 font-bold text-sm">
                            <Zap size={16} className="animate-pulse" />
                            Avançando em {contagemRegressiva} segundos...
                            <button onClick={handleNextQuestao} className="ml-4 underline hover:text-blue-800">Ir agora</button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-20 text-center">
                 <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Brain size={40} className="text-gray-300" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-800 mb-2">Sem Questões Disponíveis</h3>
                 <p className="text-gray-500 italic">No momento não existem desafios para o nível {nivelSelecionado}. Tente outro nível!</p>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </Layout>
  );
}