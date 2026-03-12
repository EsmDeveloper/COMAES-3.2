import React, { useState, useEffect, useRef } from "react";
import socket from '../../../socket';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import Layout from "../../Secundarias/Layout";
import { 
  Trophy, Clock, LogOut, Code, Play, 
  Send, Sparkles, AlertCircle, CheckCircle,
  Terminal, Zap, Cpu, FileCode, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TEMPO_QUESTAO = 90;
const DISCIPLINA = 'Programação';

export default function ProgramacaoOriginal() {
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

  // Estados locais da questão
  const [questoes, setQuestoes] = useState([]);
  const [questoesFiltradas, setQuestoesFiltradas] = useState([]);
  const [questaoIndex, setQuestaoIndex] = useState(0);
  const [questaoTime, setQuestaoTime] = useState(TEMPO_QUESTAO);
  const [codigo, setCodigo] = useState("");
  const [saida, setSaida] = useState("");
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
            const resPart = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}/api/participantes/usuario/${user.id}/programacao`);
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
            fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}/api/participantes/ranking/programacao`),
            fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}/torneios/${tId}/questoes/programacao`)
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

  // Real-time Ranking
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

  // Timer Global
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

  // Filtragem
  useEffect(() => {
    const filtradas = questoes.filter(q => q.dificuldade === nivelSelecionado);
    setQuestoesFiltradas(filtradas);
    setQuestaoIndex(0);
    setQuestaoTime(TEMPO_QUESTAO);
    setCodigo(filtradas[0]?.opcoes?.codigoInicial || filtradas[0]?.opcoes?.template || "// Escreva seu código em JavaScript aqui...");
    setAvaliacaoDetalhes(null);
    setSaida("");
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
    const nextIdx = (questaoIndex + 1 < questoesFiltradas.length ? questaoIndex + 1 : 0);
    setQuestaoIndex(nextIdx);
    setQuestaoTime(TEMPO_QUESTAO);
    setCodigo(questoesFiltradas[nextIdx]?.opcoes?.codigoInicial || questoesFiltradas[nextIdx]?.opcoes?.template || "// Escreva seu código aqui...");
    setAvaliacaoDetalhes(null);
    setSaida("");
    setContagemRegressiva(null);
    if (enunciadoRef.current) enunciadoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const enviarCodigo = async () => {
    if (executando || !codigo.trim()) return;
    setExecutando(true);
    setSaida("🚀 Executando testes no COMAES Sandbox...");
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
            resposta: codigo,
            nivel: nivelSelecionado
          }]
        })
      });
      const data = await res.json();
      if (data.success) {
        const feedback = data.data.feedbacks?.[0] || {};
        setAvaliacaoDetalhes(feedback);
        setSaida(feedback.evidencias || feedback.output || "Código executado com sucesso.");
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
      } else {
        setSaida("❌ Erro na execução: " + (data.error || "Console indisponível"));
      }
    } catch (err) {
      setSaida("❌ Falha crítica de conexão com o Sandbox.");
    } finally {
      setExecutando(false);
      if (avaliacaoRef.current) avaliacaoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const resetarCodigo = () => {
    setCodigo(questoesFiltradas[questaoIndex]?.opcoes?.codigoInicial || questoesFiltradas[questaoIndex]?.opcoes?.template || "// Escreva seu código aqui...");
    setSaida("");
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mb-4"></div>
          <p className="text-gray-500 font-bold">Iniciando Sandbox de Programação...</p>
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
          <p className="text-gray-600 mb-8">{error || "Não há competições ativas de Programação."}</p>
          <button onClick={() => navigate('/entrar-no-torneio')} className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all">
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
          <div className="bg-gradient-to-r from-purple-700 to-indigo-800 p-6 text-white flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <Code size={32} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight">{torneio.titulo}</h1>
                <div className="flex items-center gap-2 text-purple-100 text-sm font-medium">
                  <span className="px-2 py-0.5 bg-white/10 rounded-md">Programação</span>
                  <span>•</span>
                  <span>Sandbox JavaScript Ativo</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-xs font-bold text-purple-200 uppercase tracking-widest mb-1">Tempo Restante</p>
                <div className="flex gap-2 items-end">
                  <div className="text-2xl font-black tabular-nums">
                    {tempoRestante.horas.toString().padStart(2, '0')}:{tempoRestante.min.toString().padStart(2, '0')}:{tempoRestante.seg.toString().padStart(2, '0')}
                  </div>
                  {tempoRestante.dias > 0 && <span className="text-sm font-bold pb-1">{tempoRestante.dias}d</span>}
                </div>
              </div>
              <div className="h-10 w-px bg-white/20 hidden md:block"></div>
              <div className="text-center group cursor-help" title="Sua pontuação nesta disciplina">
                <p className="text-xs font-bold text-purple-200 uppercase tracking-widest mb-1">Seus Pontos</p>
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
          
          {/* Sidebar: Ranking & Stats */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-black text-gray-800 flex items-center gap-2">
                  <Trophy size={18} className="text-amber-500" />
                  Code Ranking
                </h3>
                <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-bold uppercase">Live</span>
              </div>
              <div className="p-2 space-y-1 max-h-[400px] overflow-y-auto">
                {ranking.length > 0 ? ranking.map((rank, i) => (
                  <div key={rank.id} className={`flex items-center justify-between p-3 rounded-2xl transition-all ${rank.usuario_id === user.id ? 'bg-purple-50 border-purple-100' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-2 whitespace-nowrap overflow-hidden">
                      <span className={`w-6 text-center font-black text-xs ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-500' : 'text-gray-300'}`}>
                        {i + 1}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        <img src={rank.usuario?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rank.usuario?.nome || 'U')}`} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <span className={`text-sm font-bold truncate ${rank.usuario_id === user.id ? 'text-purple-700' : 'text-gray-700'}`}>
                        {rank.usuario?.nome || 'Dev'}
                      </span>
                    </div>
                    <span className="text-xs font-black text-purple-600 flex-shrink-0 ml-2">{rank.pontuacao}</span>
                  </div>
                )) : (
                  <div className="p-8 text-center text-gray-400 text-sm">Aguardando devs...</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 space-y-4">
              <h4 className="font-black text-sm text-gray-800 uppercase tracking-widest">Sua Performance</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl text-center">
                  <p className="text-2xl font-black text-purple-600">{participante?.casos_resolvidos || 0}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Resolvidas</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl text-center">
                  <p className="text-2xl font-black text-indigo-600">{questoes.length}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Totais</p>
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-2xl flex items-center gap-3">
                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-purple-600">
                    <Cpu size={20} />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-purple-900">Nível Atual</p>
                    <p className="text-sm font-black text-purple-600">{user.level || 1}</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Main Area: IDE & Editor */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Seletor de Dificuldade */}
            <div className="bg-white p-2 rounded-2xl shadow-md border border-gray-100 flex gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'facil', label: 'Iniciante', pts: 10, color: 'text-green-600 bg-green-50' },
                { id: 'medio', label: 'Intermediário', pts: 25, color: 'text-amber-600 bg-amber-50' },
                { id: 'dificil', label: 'Especialista', pts: 50, color: 'text-red-600 bg-red-50' },
              ].map(lvl => (
                <button
                  key={lvl.id}
                  onClick={() => setNivelSelecionado(lvl.id)}
                  className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex flex-col items-center gap-1 ${nivelSelecionado === lvl.id ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
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
                {/* Enunciado */}
                <div ref={enunciadoRef} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-6 sm:p-8 bg-gray-50/50">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                          Questão {questaoIndex + 1}
                        </span>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                          JavaScript
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 font-bold text-xs">
                        <Clock size={16} className={questaoTime < 20 ? 'text-red-500 animate-pulse' : ''} />
                        <span className={questaoTime < 20 ? 'text-red-600' : ''}>{Math.floor(questaoTime / 60)}:{ (questaoTime % 60).toString().padStart(2, '0')}</span>
                      </div>
                    </div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight mb-4 font-mono">
                      {questoesFiltradas[questaoIndex].titulo || "Algoritmo Desafiador"}
                    </h2>
                    <p className="text-gray-600 text-base leading-relaxed font-medium">
                      {questoesFiltradas[questaoIndex].descricao}
                    </p>
                  </div>

                  {/* IDE Interface */}
                  <div className="grid grid-cols-1 md:grid-cols-3 bg-gray-900 min-h-[500px]">
                    {/* Editor */}
                    <div className="md:col-span-2 border-r border-gray-800 flex flex-col">
                      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileCode size={14} className="text-indigo-400" />
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">solution.js</span>
                        </div>
                        <button onClick={resetarCodigo} className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-400 transition-colors" title="Resetar Código">
                          <RotateCcw size={14} />
                        </button>
                      </div>
                      <textarea 
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        className="flex-1 w-full bg-transparent text-gray-100 font-mono text-sm p-6 outline-none resize-none leading-relaxed"
                        spellCheck="false"
                      />
                    </div>
                    
                    {/* Console/Output */}
                    <div className="bg-black/50 flex flex-col">
                      <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
                        <Terminal size={14} className="text-green-400" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Output Console</span>
                      </div>
                      <div className="p-4 font-mono text-xs text-green-500 overflow-y-auto max-h-[460px]">
                        {saida || "> Aguardando execução..."}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                       <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 text-xs font-bold text-gray-500">
                          Template: <span className="text-purple-600">ES6+</span>
                       </div>
                    </div>
                    <div className="flex gap-4 w-full sm:w-auto">
                      <button 
                         onClick={handleNextQuestao}
                         className="flex-1 py-4 px-6 text-gray-400 font-bold hover:text-gray-600 transition-all text-sm uppercase tracking-widest"
                      >
                        Pular Questão
                      </button>
                      <button 
                        onClick={enviarCodigo}
                        disabled={executando || !codigo.trim()}
                        className="flex-[2] py-4 px-10 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black shadow-xl shadow-purple-100 transition-all border-b-4 border-purple-900 active:translate-y-1 active:border-b-0 disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        {executando ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <Play size={20} />}
                        Executar Solução
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Feedback */}
                <AnimatePresence>
                  {avaliacaoDetalhes && (
                    <motion.div 
                      ref={avaliacaoRef}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl shadow-xl border-t-8 border-purple-600 overflow-hidden"
                    >
                      <div className="p-8">
                        <div className="flex items-center gap-6 mb-8">
                           <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-lg ${avaliacaoDetalhes.score >= 0.8 ? 'bg-green-500' : 'bg-amber-500'}`}>
                              {avaliacaoDetalhes.score >= 0.8 ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
                           </div>
                           <div>
                              <h3 className="text-2xl font-black text-gray-800">Cálculo de Desempenho</h3>
                              <p className="text-gray-500 font-medium">{avaliacaoDetalhes.score >= 0.8 ? 'Excelente lógica aplicada!' : 'Sua lógica está correta, mas pode ser otimizada.'}</p>
                           </div>
                           <div className="ml-auto text-right">
                              <p className="text-4xl font-black text-purple-600">+{avaliacaoDetalhes.pontos || 0}</p>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">XP Earned</p>
                           </div>
                        </div>
                        
                        <div className="bg-gray-900 rounded-3xl p-6 text-indigo-100 font-mono text-sm leading-relaxed mb-6 border border-gray-800">
                           <span className="text-gray-500 font-bold">// AI_FEEDBACK_LOG:</span><br/>
                           {avaliacaoDetalhes.feedback}
                        </div>

                        {contagemRegressiva !== null && (
                          <div className="inline-flex items-center gap-3 px-6 py-3 bg-purple-50 rounded-2xl text-purple-600 font-bold text-sm">
                            <Sparkles size={16} className="text-amber-500" />
                            Próxima tarefa em {contagemRegressiva}...
                            <button onClick={handleNextQuestao} className="ml-4 hover:underline">Pular Espera</button>
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
                    <Terminal size={40} className="text-gray-300" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-800 mb-2">Ambiente Vazio</h3>
                 <p className="text-gray-500 italic">No momento não existem desafios para o nível {nivelSelecionado}. Selecione outra dificuldade!</p>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </Layout>
  );
}