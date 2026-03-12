import React, { useState, useEffect, useRef } from "react";
import socket from '../../../socket';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import Layout from "../../Secundarias/Layout";
import { 
  Trophy, Clock, LogOut, BookOpen, Type, 
  Send, Sparkles, AlertCircle, CheckCircle,
  Languages, Zap, FileText, ChevronRight, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TEMPO_QUESTAO = 120; // 2 minutos para redação curta
const DISCIPLINA = 'Inglês';

const usefulPhrases = [
  "In my opinion,", "Firstly,", "Secondly,", "Furthermore,", 
  "However,", "Therefore,", "In conclusion,", "For example,",
  "On the other hand,", "As a result,", "Moreover,", "Additionally,"
];

export default function InglesOriginal() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
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

  // Estados locais
  const [questoes, setQuestoes] = useState([]);
  const [questoesFiltradas, setQuestoesFiltradas] = useState([]);
  const [questaoIndex, setQuestaoIndex] = useState(0);
  const [questaoTime, setQuestaoTime] = useState(TEMPO_QUESTAO);
  const [resposta, setResposta] = useState("");
  const [nivelSelecionado, setNivelSelecionado] = useState("facil");
  const [executando, setExecutando] = useState(false);
  const [avaliacaoDetalhes, setAvaliacaoDetalhes] = useState(null);
  const [contagemRegressiva, setContagemRegressiva] = useState(null);

  // Carregamento de dados
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const resAtivo = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}/api/torneios/ativo`);
        const dataAtivo = await resAtivo.json();
        
        if (dataAtivo.ativo && dataAtivo.torneio) {
          setTorneio(dataAtivo.torneio);
          const tId = dataAtivo.torneio.id;
          
          if (user?.id) {
            const resPart = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}/api/participantes/usuario/${user.id}/ingles`);
            const dataPart = await resPart.json();
            
            if (dataPart.success) {
              setParticipante(dataPart.data);
            } else {
              const resReg = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}/api/participantes/registrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id_usuario: user.id, disciplina_competida: DISCIPLINA })
              });
              const dataReg = await resReg.json();
              if (dataReg.success) setParticipante(dataReg.data);
            }
          }

          const [resRank, resQ] = await Promise.all([
            fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}/api/participantes/ranking/ingles`),
            fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}/torneios/${tId}/questoes/ingles`)
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

  // Socket
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

  // Timers
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

  const insertPhrase = (phrase) => {
    setResposta(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + phrase + ' ');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-600 border-t-transparent mb-4"></div>
          <p className="text-gray-500 font-bold">Aperfeiçoando seu vocabulário...</p>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tournament Unavailable</h2>
          <p className="text-gray-600 mb-8">{error || "No active English tournaments at the moment."}</p>
          <button onClick={() => navigate('/entrar-no-torneio')} className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all">
            Back to Entry Page
          </button>
        </div>
      </Layout>
    );
  }

  const wordCount = resposta.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Tournament Dashboard Header */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-rose-600 to-orange-600 p-6 text-white flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <Languages size={32} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight">{torneio.titulo}</h1>
                <div className="flex items-center gap-2 text-rose-100 text-sm font-medium">
                  <span className="px-2 py-0.5 bg-white/10 rounded-md">English Writing</span>
                  <span>•</span>
                  <span>International Standard AI Assessment</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-xs font-bold text-rose-200 uppercase tracking-widest mb-1">Time Remaining</p>
                <div className="flex gap-2 items-end">
                  <div className="text-2xl font-black tabular-nums">
                    {tempoRestante.horas.toString().padStart(2, '0')}:{tempoRestante.min.toString().padStart(2, '0')}:{tempoRestante.seg.toString().padStart(2, '0')}
                  </div>
                  {tempoRestante.dias > 0 && <span className="text-sm font-bold pb-1">{tempoRestante.dias}d</span>}
                </div>
              </div>
              <div className="h-10 w-px bg-white/20 hidden md:block"></div>
              <div className="text-center">
                <p className="text-xs font-bold text-rose-200 uppercase tracking-widest mb-1">Your Score</p>
                <div className="text-2xl font-black text-amber-300 flex items-center justify-center gap-2">
                  <Zap size={20} className="fill-current" />
                  {participante?.pontuacao || 0}
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate('/entrar-no-torneio')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-bold flex items-center gap-2 transition-all border border-white/20 text-sm"
            >
              <LogOut size={18} />
              Exit
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
          
          {/* Sidebar: Ranking & Writing Stats */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-black text-gray-800 flex items-center gap-2">
                  <Trophy size={18} className="text-amber-500" />
                  Hall of Fame
                </h3>
              </div>
              <div className="p-2 space-y-1">
                {ranking.length > 0 ? ranking.slice(0, 8).map((rank, i) => (
                  <div key={rank.id} className={`flex items-center justify-between p-3 rounded-2xl transition-all ${rank.usuario_id === user?.id ? 'bg-rose-50 border border-rose-100 shadow-sm' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="w-5 text-center font-black text-[10px] text-gray-300">{i+1}</span>
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                        <img src={rank.usuario?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rank.usuario?.nome || 'U')}`} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-bold text-gray-700 truncate">{rank.usuario?.nome || 'Student'}</span>
                    </div>
                    <span className="text-xs font-black text-rose-600">{rank.pontuacao}</span>
                  </div>
                )) : (
                  <div className="p-8 text-center text-gray-400 text-xs">Waiting for writers...</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 space-y-4">
              <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest">Writing Statistics</h4>
              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <p className="text-xs font-bold text-gray-500">Tasks Completed</p>
                    <p className="text-xl font-black text-gray-800">{participante?.casos_resolvidos || 0}</p>
                 </div>
                 <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: `${((participante?.casos_resolvidos || 0) / (questoes.length || 1)) * 100}%` }}></div>
                 </div>
              </div>
              <div className="pt-4 border-t border-gray-50">
                 <div className="p-4 bg-orange-50 rounded-2xl flex items-center gap-3">
                    <MessageSquare size={18} className="text-orange-600" />
                    <p className="text-[10px] font-bold text-orange-800 leading-tight">Your grammar score is improving!</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Main Area: Writing Prompt & Editor */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Seletor de Dificuldade */}
            <div className="bg-white p-2 rounded-2xl shadow-md border border-gray-100 flex gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'facil', label: 'Iniciante', pts: 5, color: 'text-green-600 bg-green-50' },
                { id: 'medio', label: 'Intermediário', pts: 10, color: 'text-amber-600 bg-amber-50' },
                { id: 'dificil', label: 'Avançado', pts: 20, color: 'text-red-600 bg-red-50' },
              ].map(lvl => (
                <button
                  key={lvl.id}
                  onClick={() => setNivelSelecionado(lvl.id)}
                  className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex flex-col items-center gap-1 ${nivelSelecionado === lvl.id ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
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
                {/* Editor / Questão */}
                <div ref={enunciadoRef} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-8 pb-4">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                         <span className="w-8 h-8 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center font-black text-xs">{questaoIndex + 1}</span>
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Writing Task</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl text-gray-500 font-black text-sm tabular-nums border border-gray-100">
                        <Clock size={16} className={questaoTime < 30 ? 'text-red-500 animate-pulse' : ''} />
                        {Math.floor(questaoTime / 60)}:{ (questaoTime % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900 leading-tight mb-4">
                      {questoesFiltradas[questaoIndex].titulo || "Short Essay Challenge"}
                    </h2>
                    <p className="text-gray-600 text-lg leading-relaxed font-medium bg-rose-50/30 p-6 rounded-2xl border border-rose-100/50 italic">
                      "{questoesFiltradas[questaoIndex].descricao}"
                    </p>
                  </div>

                  {/* Writing Interface */}
                  <div className="px-8 py-4">
                    <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
                      {usefulPhrases.map(phrase => (
                        <button 
                          key={phrase} 
                          onClick={() => insertPhrase(phrase)}
                          className="whitespace-nowrap px-3 py-1.5 bg-gray-50 hover:bg-rose-50 text-gray-600 hover:text-rose-700 font-bold rounded-lg border border-gray-100 text-[10px] transition-all"
                        >
                          {phrase}
                        </button>
                      ))}
                    </div>
                    <div className="relative group">
                       <textarea 
                        value={resposta}
                        onChange={(e) => setResposta(e.target.value)}
                        placeholder="Type your response here. Aim for clarity and proper grammar..."
                        className="w-full bg-white border-2 border-gray-100 rounded-3xl p-8 text-gray-800 text-lg min-h-[400px] outline-none focus:border-rose-500 transition-all shadow-inner font-serif"
                      />
                      <div className={`absolute bottom-6 right-8 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest pointer-events-none transition-all ${wordCount < 20 ? 'text-gray-400' : 'bg-green-100 text-green-700'}`}>
                        {wordCount} Words
                      </div>
                    </div>
                  </div>

                  <div className="bg-white px-8 py-8 flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                       <CheckCircle size={14} className="text-gray-300" />
                       Draft Saved Automatically
                    </div>
                    <div className="flex gap-4 w-full sm:w-auto">
                      <button 
                         onClick={handleNextQuestao}
                         className="flex-1 py-4 px-6 text-gray-500 font-black hover:text-gray-800 transition-all text-sm uppercase tracking-widest"
                      >
                        Skip Task
                      </button>
                      <button 
                        onClick={enviarResposta}
                        disabled={executando || wordCount < 3}
                        className="flex-[2] py-4 px-12 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-2xl font-black shadow-xl shadow-rose-100 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
                      >
                        {executando ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <Send size={20} className="group-hover:translate-x-1 transition-transform" />}
                        Submit Essay
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Evaluation */}
                <AnimatePresence>
                  {avaliacaoDetalhes && (
                    <motion.div 
                      ref={avaliacaoRef}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-3xl shadow-xl border border-rose-100 overflow-hidden"
                    >
                      <div className="p-1 w-full bg-gradient-to-r from-rose-500 via-orange-500 to-rose-400"></div>
                      <div className="p-8">
                        <div className="flex items-center justify-between mb-8">
                           <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-rose-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                                 <FileText size={24} />
                              </div>
                              <div>
                                 <h3 className="text-xl font-black text-gray-800">Assigned Score</h3>
                                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">English Proficiency Index</p>
                              </div>
                           </div>
                           <div className="bg-gray-50 px-6 py-4 rounded-3xl border border-gray-100">
                              <p className="text-3xl font-black text-rose-600 flex items-baseline gap-2">
                                +{avaliacaoDetalhes.pontos || 0}
                                <span className="text-[10px] text-gray-400 uppercase">Points</span>
                              </p>
                           </div>
                        </div>

                        <div className="relative">
                           <Sparkles size={24} className="absolute -top-3 -left-3 text-amber-400 opacity-60" />
                           <div className="bg-stone-50 rounded-3xl p-8 border border-stone-100 text-stone-800 font-medium leading-relaxed italic text-lg shadow-inner">
                              "{avaliacaoDetalhes.feedback}"
                           </div>
                        </div>

                        {contagemRegressiva !== null && (
                          <div className="mt-8 flex items-center justify-center gap-4">
                             <div className="h-1 flex-1 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div 
                                  className="h-full bg-rose-500"
                                  initial={{ width: "0%" }}
                                  animate={{ width: "100%" }}
                                  transition={{ duration: 5 }}
                                />
                             </div>
                             <span className="text-xs font-black text-gray-400 tracking-tighter uppercase whitespace-nowrap">Next Task in {contagemRegressiva}s</span>
                             <button onClick={handleNextQuestao} className="p-2 bg-gray-50 hover:bg-rose-50 text-rose-600 rounded-xl transition-all">
                                <ChevronRight size={20} />
                             </button>
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
                    <BookOpen size={40} className="text-gray-300" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-800 mb-2">Sem Enunciados</h3>
                 <p className="text-gray-500 italic">No momento não existem temas de redação para o nível {nivelSelecionado}. Tente outra dificuldade!</p>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </Layout>
  );
}