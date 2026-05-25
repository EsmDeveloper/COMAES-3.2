import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from './Layout';

// ─── CONSTANTS ────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;
const TIME_PER_QUESTION = 30;

const AREAS = {
  matematica: {
    key: 'matematica',
    title: 'Matemática',
    emoji: '📐',
    description: 'Álgebra, geometria, cálculo e raciocínio lógico',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-700',
    lightBg: 'bg-blue-50',
    border: 'border-blue-500',
    text: 'text-blue-600',
    ring: 'ring-blue-400',
  },
  programacao: {
    key: 'programacao',
    title: 'Programação',
    emoji: '💻',
    description: 'Lógica, algoritmos, linguagens e desenvolvimento',
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-700',
    lightBg: 'bg-emerald-50',
    border: 'border-emerald-500',
    text: 'text-emerald-600',
    ring: 'ring-emerald-400',
  },
  ingles: {
    key: 'ingles',
    title: 'Inglês',
    emoji: '🌍',
    description: 'Gramática, vocabulário e compreensão textual',
    color: 'violet',
    gradient: 'from-violet-500 to-violet-700',
    lightBg: 'bg-violet-50',
    border: 'border-violet-500',
    text: 'text-violet-600',
    ring: 'ring-violet-400',
  },
};

const CORRECT_MESSAGES = [
  'Excelente trabalho! 🎯',
  'Muito bem! Continue assim!',
  'Fantástico! Resposta certa!',
  'Brilhante! Estás a arrasar!',
  'Perfeito! Continua assim!',
  'Incrível! Muito bem!',
];

const WRONG_MESSAGES = [
  'Não desistas! A próxima será melhor.',
  'Continue aprendendo, tu consegues!',
  'Quase lá! Não desistas.',
  'Boa tentativa! Segue em frente.',
  'Aprende com o erro e avança!',
  'Não te preocupes, continua!',
];

const TIMEOUT_MESSAGES = [
  'O tempo esgotou! Mais rapidez na próxima.',
  'Tempo esgotado! Não desistas.',
  'Próxima vez responde mais rápido!',
];

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── CIRCULAR TIMER ───────────────────────────────────────────────

function CircularTimer({ timeLeft, total = TIME_PER_QUESTION }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const ratio = timeLeft / total;
  const offset = circumference * (1 - ratio);
  const color = ratio > 0.5 ? '#10b981' : ratio > 0.25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative flex items-center justify-center w-16 h-16">
      <svg className="absolute w-16 h-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle
          cx="32" cy="32" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
        />
      </svg>
      <span
        className="relative z-10 text-sm font-bold tabular-nums"
        style={{ color }}
      >
        {timeLeft}s
      </span>
    </div>
  );
}

// ─── AI ASSISTANT ─────────────────────────────────────────────────

function AIAssistant({ message, visible }) {
  if (!visible || !message) return null;
  return (
    <div className="flex items-end gap-3 animate-fade-in">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
        <span className="text-lg">🤖</span>
      </div>
      <div className="relative bg-white border border-indigo-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-md max-w-xs">
        <p className="text-sm text-gray-700 font-medium">{message}</p>
        <div className="absolute -bottom-2 left-0 w-3 h-3 bg-white border-b border-l border-indigo-100 rotate-45 translate-x-2" />
      </div>
    </div>
  );
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────

function ProgressBar({ current, total, color }) {
  const pct = total > 0 ? ((current) / total) * 100 : 0;
  const gradients = {
    blue: 'from-blue-400 to-blue-600',
    emerald: 'from-emerald-400 to-emerald-600',
    violet: 'from-violet-400 to-violet-600',
  };
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
      <div
        className={`h-2.5 rounded-full bg-gradient-to-r ${gradients[color] || gradients.blue} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── MEDAL ────────────────────────────────────────────────────────

function Medal({ pct }) {
  if (pct >= 90) return <div className="text-6xl">🥇</div>;
  if (pct >= 70) return <div className="text-6xl">🥈</div>;
  if (pct >= 50) return <div className="text-6xl">🥉</div>;
  return <div className="text-6xl">🎓</div>;
}

function motivationalMessage(pct) {
  if (pct >= 90) return 'Desempenho excepcional! És um verdadeiro campeão COMAES!';
  if (pct >= 70) return 'Muito bom resultado! Continua a estudar e chegarás ao topo!';
  if (pct >= 50) return 'Bom esforço! Com mais prática vais melhorar muito!';
  return 'Não desistas! Cada tentativa é um passo para a excelência!';
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────

export default function Teste() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Phase: 'select' | 'quiz' | 'result'
  const [phase, setPhase] = useState('select');
  const [selectedArea, setSelectedArea] = useState(null);

  // Questions data per area (counts for cards)
  const [areaCounts, setAreaCounts] = useState({ matematica: null, programacao: null, ingles: null });

  // Quiz state
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]); // { idx, selected, correct, points }
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizError, setQuizError] = useState(null);

  // Feedback
  const [feedback, setFeedback] = useState(null); // { type: 'correct'|'wrong'|'timeout', msg }
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);

  // Gamification
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  // AI assistant
  const [assistantMsg, setAssistantMsg] = useState('');
  const [assistantVisible, setAssistantVisible] = useState(false);

  const timerRef = useRef(null);
  const feedbackTimerRef = useRef(null); // separate — never cleared by the main timer effect
  const startTimeRef = useRef(null);

  // ── Load area counts on mount ──
  useEffect(() => {
    if (!user) return;
    ['matematica', 'programacao', 'ingles'].forEach(async (area) => {
      try {
        const res = await fetch(`${API_BASE}/api/questoes/quiz/${area}?limit=20`);
        const json = await res.json();
        if (json.success) {
          setAreaCounts(prev => ({ ...prev, [area]: json.total }));
        }
      } catch {
        setAreaCounts(prev => ({ ...prev, [area]: 0 }));
      }
    });
  }, [user]);

  // ── Timer ──
  const clearMainTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const clearFeedbackTimer = useCallback(() => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = null;
  }, []);

  const clearTimers = useCallback(() => {
    clearMainTimer();
    clearFeedbackTimer();
  }, [clearMainTimer, clearFeedbackTimer]);

  const advanceQuestion = useCallback(() => {
    clearFeedbackTimer();
    clearMainTimer();
    setFeedback(null);
    setSelectedOption(null);
    setAnswered(false);
    setTimeLeft(TIME_PER_QUESTION);
    setCurrentIdx(prev => {
      const next = prev + 1;
      if (next >= questions.length) {
        setPhase('result');
        return prev;
      }
      return next;
    });
  }, [questions.length, clearMainTimer, clearFeedbackTimer]);

  const handleTimeout = useCallback(() => {
    if (answered) return;
    clearMainTimer();
    setAnswered(true);
    setSelectedOption(null);
    const msg = pickRandom(TIMEOUT_MESSAGES);
    setFeedback({ type: 'timeout', msg });
    setAssistantMsg(msg);
    setAssistantVisible(true);
    setStreak(0);
    setAnswers(prev => [...prev, { idx: currentIdx, selected: null, correct: false, points: 0 }]);
    // auto-advance after 2.5s — feedback timer is independent of main timer
    feedbackTimerRef.current = setTimeout(() => {
      setAssistantVisible(false);
      advanceQuestion();
    }, 2500);
  }, [answered, currentIdx, clearMainTimer, advanceQuestion]);

  // Main countdown — only clears the interval timer, never the feedback timer
  useEffect(() => {
    if (phase !== 'quiz' || answered || loadingQuiz) return;
    clearMainTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearMainTimer();
  }, [phase, currentIdx, answered, loadingQuiz]); // eslint-disable-line

  // Track total time
  useEffect(() => {
    if (phase === 'quiz') {
      startTimeRef.current = Date.now();
    }
    if (phase === 'result' && startTimeRef.current) {
      setTotalTime(Math.round((Date.now() - startTimeRef.current) / 1000));
    }
  }, [phase]);

  // ── Start quiz ──
  const startQuiz = async (areaKey) => {
    setSelectedArea(areaKey);
    setLoadingQuiz(true);
    setQuizError(null);
    setQuestions([]);
    setCurrentIdx(0);
    setAnswers([]);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setXp(0);
    setTimeLeft(TIME_PER_QUESTION);
    setFeedback(null);
    setSelectedOption(null);
    setAnswered(false);
    setAssistantVisible(false);
    setPhase('quiz');

    try {
      const res = await fetch(`${API_BASE}/api/questoes/quiz/${areaKey}?limit=10`);
      const json = await res.json();
      if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
        setQuizError('Nenhuma questão disponível para esta área. O administrador ainda não criou questões.');
        setLoadingQuiz(false);
        return;
      }
      setQuestions(json.data);
    } catch (err) {
      setQuizError('Erro ao carregar questões. Verifica a ligação ao servidor.');
    } finally {
      setLoadingQuiz(false);
    }
  };

  // ── Answer ──
  const handleAnswer = useCallback((optionText) => {
    if (answered || feedback) return;
    clearMainTimer(); // stop countdown — do NOT clear feedbackTimerRef here
    setAnswered(true);
    setSelectedOption(optionText);

    const q = questions[currentIdx];
    const isCorrect = optionText.trim().toLowerCase() === q.resposta_correta.trim().toLowerCase();
    const timeBonus = Math.max(0, timeLeft - 5);
    const basePoints = q.pontos || 10;
    const earned = isCorrect ? basePoints + Math.floor(timeBonus / 3) : 0;
    const earnedXp = isCorrect ? 15 + Math.floor(timeBonus / 5) : 2;

    const newStreak = isCorrect ? streak + 1 : 0;
    const newBest = Math.max(bestStreak, newStreak);

    setScore(prev => prev + earned);
    setXp(prev => prev + earnedXp);
    setStreak(newStreak);
    setBestStreak(newBest);
    setAnswers(prev => [...prev, { idx: currentIdx, selected: optionText, correct: isCorrect, points: earned }]);

    const msg = isCorrect ? pickRandom(CORRECT_MESSAGES) : pickRandom(WRONG_MESSAGES);
    setFeedback({ type: isCorrect ? 'correct' : 'wrong', msg });
    setAssistantMsg(msg);
    setAssistantVisible(true);

    // Auto-advance after 2.5s — independent of main timer
    clearFeedbackTimer();
    feedbackTimerRef.current = setTimeout(() => {
      setAssistantVisible(false);
      advanceQuestion();
    }, 2500);
  }, [answered, feedback, questions, currentIdx, timeLeft, streak, bestStreak, clearMainTimer, clearFeedbackTimer, advanceQuestion]);

  // ── Cleanup on unmount ──
  useEffect(() => () => clearTimers(), [clearTimers]);

  // ─── RENDER: Not logged in ───────────────────────────────────────
  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-900 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Acesso Restrito</h2>
            <p className="text-gray-600 mb-6">Faz login para acederes ao Teste de Conhecimento COMAES.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              >
                Fazer Login
              </button>
              <button
                onClick={() => navigate('/cadastro')}
                className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors"
              >
                Cadastrar
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ─── RENDER: Area Selection ──────────────────────────────────────
  if (phase === 'select') {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 md:p-8">
          <div className="max-w-5xl mx-auto">

            {/* Header */}
            <div className="text-center mb-10 pt-4">
              <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm px-4 py-1.5 rounded-full mb-4 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Teste ao Vivo · COMAES
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
                Testa o teu Conhecimento
              </h1>
              <p className="text-indigo-200 text-lg max-w-xl mx-auto">
                Olá, <span className="font-semibold text-white">{user.nome || user.name || 'Competidor'}</span>! Escolhe uma área e mostra o que sabes.
              </p>
            </div>

            {/* Area Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {Object.values(AREAS).map((area) => {
                const count = areaCounts[area.key];
                return (
                  <button
                    key={area.key}
                    onClick={() => startQuiz(area.key)}
                    className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl backdrop-blur-sm"
                  >
                    {/* Glow */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${area.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                    <div className="relative z-10">
                      <div className="text-5xl mb-4">{area.emoji}</div>
                      <h3 className="text-xl font-bold text-white mb-2">{area.title}</h3>
                      <p className="text-white/60 text-sm mb-5 leading-relaxed">{area.description}</p>

                      <div className="flex items-center justify-between mb-5">
                        <span className="text-white/50 text-xs">
                          {count === null ? 'A carregar...' : count === 0 ? 'Sem questões' : `${count} questões`}
                        </span>
                        <span className="text-white/50 text-xs">30s / questão</span>
                      </div>

                      <div className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${area.gradient} text-white font-semibold text-sm text-center group-hover:shadow-lg transition-shadow`}>
                        Iniciar →
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* How it works */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-white font-bold text-center mb-6 text-lg">Como funciona</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                  { icon: '⏱️', label: '30s por questão' },
                  { icon: '⚡', label: 'Bónus por rapidez' },
                  { icon: '🔥', label: 'Sequência de acertos' },
                  { icon: '🏆', label: 'XP e pontuação' },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-2">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-white/60 text-xs">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ─── RENDER: Quiz ────────────────────────────────────────────────
  if (phase === 'quiz') {
    const area = AREAS[selectedArea] || AREAS.matematica;
    const q = questions[currentIdx];
    const totalQ = questions.length;
    const correctCount = answers.filter(a => a.correct).length;

    // Loading state
    if (loadingQuiz) {
      return (
        <Layout>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white text-lg font-medium">A carregar questões...</p>
              <p className="text-indigo-300 text-sm mt-1">{area.title}</p>
            </div>
          </div>
        </Layout>
      );
    }

    // Error state
    if (quizError) {
      return (
        <Layout>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Sem questões disponíveis</h2>
              <p className="text-gray-600 mb-6 text-sm">{quizError}</p>
              <button
                onClick={() => setPhase('select')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              >
                ← Voltar
              </button>
            </div>
          </div>
        </Layout>
      );
    }

    if (!q) return null;

    const opcoes = Array.isArray(q.opcoes) ? q.opcoes : [];
    const answerForCurrent = answers.find(a => a.idx === currentIdx);

    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-3 md:p-6">
          <div className="max-w-3xl mx-auto">

            {/* Top bar */}
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => { clearTimers(); setPhase('select'); }}
                className="text-white/60 hover:text-white text-sm flex items-center gap-1.5 transition-colors"
              >
                ← Sair
              </button>
              <div className="flex items-center gap-3">
                {/* Streak */}
                {streak > 1 && (
                  <div className="flex items-center gap-1 bg-orange-500/20 text-orange-300 text-xs font-bold px-3 py-1.5 rounded-full border border-orange-500/30">
                    🔥 {streak}x
                  </div>
                )}
                {/* XP */}
                <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-300 text-xs font-bold px-3 py-1.5 rounded-full border border-yellow-500/30">
                  ⚡ {xp} XP
                </div>
                {/* Score */}
                <div className="flex items-center gap-1 bg-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">
                  🏆 {score} pts
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/70 text-sm font-medium">
                  Questão <span className="text-white font-bold">{currentIdx + 1}</span> de <span className="text-white font-bold">{totalQ}</span>
                </span>
                <span className="text-white/50 text-xs">{area.emoji} {area.title}</span>
              </div>
              <ProgressBar current={currentIdx} total={totalQ} color={area.color} />
            </div>

            {/* Question card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 mb-5 backdrop-blur-sm">

              {/* Timer + question header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                  <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${area.lightBg} ${area.text}`}>
                    {area.title} · {q.dificuldade || 'médio'}
                  </span>
                  <h2 className="text-white text-lg md:text-xl font-semibold leading-relaxed">
                    {q.enunciado}
                  </h2>
                </div>
                <div className="flex-shrink-0">
                  <CircularTimer timeLeft={timeLeft} total={TIME_PER_QUESTION} />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {opcoes.map((opt, i) => {
                  const label = String.fromCharCode(65 + i);
                  let cls = 'w-full text-left flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ';

                  if (!answered) {
                    cls += 'border-white/10 bg-white/5 text-white hover:border-white/40 hover:bg-white/10 cursor-pointer';
                  } else {
                    const isCorrectOpt = opt.trim().toLowerCase() === q.resposta_correta.trim().toLowerCase();
                    const isSelected = opt === selectedOption;

                    if (isCorrectOpt) {
                      cls += 'border-emerald-400 bg-emerald-500/20 text-emerald-200';
                    } else if (isSelected && !isCorrectOpt) {
                      cls += 'border-red-400 bg-red-500/20 text-red-200';
                    } else {
                      cls += 'border-white/5 bg-white/3 text-white/30 cursor-default';
                    }
                  }

                  return (
                    <button
                      key={i}
                      className={cls}
                      onClick={() => handleAnswer(opt)}
                      disabled={answered}
                    >
                      <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border ${
                        !answered
                          ? 'border-white/20 text-white/60'
                          : opt.trim().toLowerCase() === q.resposta_correta.trim().toLowerCase()
                            ? 'border-emerald-400 text-emerald-300 bg-emerald-500/30'
                            : opt === selectedOption
                              ? 'border-red-400 text-red-300 bg-red-500/30'
                              : 'border-white/10 text-white/20'
                      }`}>
                        {label}
                      </span>
                      <span className="flex-1 text-sm md:text-base">{opt}</span>
                      {answered && opt.trim().toLowerCase() === q.resposta_correta.trim().toLowerCase() && (
                        <span className="text-emerald-400 text-lg">✓</span>
                      )}
                      {answered && opt === selectedOption && opt.trim().toLowerCase() !== q.resposta_correta.trim().toLowerCase() && (
                        <span className="text-red-400 text-lg">✗</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback banner */}
            {feedback && (
              <div className={`rounded-xl px-5 py-3 mb-4 text-sm font-semibold flex items-center justify-between gap-2 ${
                feedback.type === 'correct'
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                  : feedback.type === 'timeout'
                    ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-300'
                    : 'bg-red-500/20 border border-red-500/40 text-red-300'
              }`}>
                <div className="flex items-center gap-2">
                  <span>{feedback.type === 'correct' ? '✓' : feedback.type === 'timeout' ? '⏱' : '✗'}</span>
                  <span>{feedback.msg}</span>
                </div>
              </div>
            )}

            {/* AI Assistant */}
            <AIAssistant message={assistantMsg} visible={assistantVisible} />

            {/* Next button — always visible after answering */}
            {answered && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    clearFeedbackTimer();
                    setAssistantVisible(false);
                    advanceQuestion();
                  }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r ${area.gradient} hover:opacity-90 active:scale-95 transition-all shadow-lg`}
                >
                  {currentIdx >= totalQ - 1 ? 'Ver Resultado 🏆' : 'Próxima →'}
                </button>
              </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-emerald-400 font-bold text-lg">{correctCount}</div>
                <div className="text-white/40 text-xs">Acertos</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-red-400 font-bold text-lg">{answers.filter(a => !a.correct).length}</div>
                <div className="text-white/40 text-xs">Erros</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-orange-400 font-bold text-lg">{bestStreak}</div>
                <div className="text-white/40 text-xs">Melhor sequência</div>
              </div>
            </div>

          </div>
        </div>
      </Layout>
    );
  }

  // ─── RENDER: Result ──────────────────────────────────────────────
  if (phase === 'result') {
    const area = AREAS[selectedArea] || AREAS.matematica;
    const totalQ = questions.length;
    const correctCount = answers.filter(a => a.correct).length;
    const wrongCount = answers.filter(a => !a.correct).length;
    const pct = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;
    const mins = Math.floor(totalTime / 60);
    const secs = totalTime % 60;
    const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

    const performanceLabel =
      pct >= 90 ? 'Excelente' :
      pct >= 70 ? 'Muito Bom' :
      pct >= 50 ? 'Bom' : 'A Melhorar';

    const performanceColor =
      pct >= 90 ? 'text-emerald-400' :
      pct >= 70 ? 'text-blue-400' :
      pct >= 50 ? 'text-yellow-400' : 'text-red-400';

    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 md:p-8">
          <div className="max-w-2xl mx-auto">

            {/* Medal + title */}
            <div className="text-center mb-8 pt-4">
              <Medal pct={pct} />
              <h1 className="text-3xl font-extrabold text-white mt-4 mb-2">Teste Concluído!</h1>
              <p className="text-indigo-200">{area.emoji} {area.title}</p>
            </div>

            {/* Score highlight */}
            <div className={`bg-gradient-to-r ${area.gradient} rounded-2xl p-6 text-center mb-6 shadow-2xl`}>
              <div className="text-6xl font-extrabold text-white mb-1">{pct}%</div>
              <div className={`text-white/80 font-semibold text-lg`}>{performanceLabel}</div>
              <div className="text-white/60 text-sm mt-1">{score} pontos · {xp} XP</div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { icon: '✅', label: 'Acertos', value: correctCount, color: 'text-emerald-400' },
                { icon: '❌', label: 'Erros', value: wrongCount, color: 'text-red-400' },
                { icon: '🔥', label: 'Melhor sequência', value: bestStreak, color: 'text-orange-400' },
                { icon: '⏱️', label: 'Tempo total', value: timeStr, color: 'text-blue-400' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className={`font-bold text-xl ${stat.color}`}>{stat.value}</div>
                  <div className="text-white/40 text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Progress bar visual */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
              <div className="flex justify-between text-sm text-white/60 mb-2">
                <span>Desempenho</span>
                <span className={`font-bold ${performanceColor}`}>{pct}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full bg-gradient-to-r ${area.gradient} transition-all duration-1000`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Per-question review */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
              <h3 className="text-white font-semibold mb-4 text-sm">Revisão das questões</h3>
              <div className="flex flex-wrap gap-2">
                {questions.map((_, i) => {
                  const ans = answers.find(a => a.idx === i);
                  return (
                    <div
                      key={i}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${
                        !ans ? 'bg-white/10 text-white/30' :
                        ans.correct ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' :
                        'bg-red-500/30 text-red-300 border border-red-500/50'
                      }`}
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Motivational message */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🤖</span>
              </div>
              <p className="text-white/80 text-sm leading-relaxed pt-1">{motivationalMessage(pct)}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => startQuiz(selectedArea)}
                className={`flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${area.gradient} hover:opacity-90 transition-opacity`}
              >
                ↺ Repetir Teste
              </button>
              <button
                onClick={() => setPhase('select')}
                className="flex-1 py-3 rounded-xl font-semibold text-white bg-white/10 border border-white/20 hover:bg-white/15 transition-colors"
              >
                ← Escolher Área
              </button>
            </div>

          </div>
        </div>
      </Layout>
    );
  }

  return null;
}
