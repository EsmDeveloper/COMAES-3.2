import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from './Layout';
import { Calculator, Code2, Languages, Trophy, Clock, Zap, Target, RotateCcw, ChevronLeft, CheckCircle2, XCircle } from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;
const TIME_PER_QUESTION = 30;

const AREAS = {
  matematica: {
    key: 'matematica',
    title: 'Matemática',
    Icon: Calculator,
    color: 'blue',
    btnGradient: 'from-blue-600 to-indigo-600',
    badge: 'bg-blue-100 text-blue-700',
    description: 'Álgebra, geometria, cálculo e raciocínio lógico',
  },
  programacao: {
    key: 'programacao',
    title: 'Programação',
    Icon: Code2,
    color: 'indigo',
    btnGradient: 'from-indigo-600 to-blue-600',
    badge: 'bg-indigo-100 text-indigo-700',
    description: 'Lógica, algoritmos, linguagens e desenvolvimento',
  },
  ingles: {
    key: 'ingles',
    title: 'Inglês',
    Icon: Languages,
    color: 'slate',
    btnGradient: 'from-slate-600 to-blue-600',
    badge: 'bg-slate-100 text-slate-700',
    description: 'Gramática, vocabulário e compreensão textual',
  },
};

const CORRECT_MSGS = [
  'Excelente! Resposta certa!',
  'Muito bem! Continue assim!',
  'Perfeito! Estás a arrasar!',
  'Brilhante! Continua!',
];
const WRONG_MSGS = [
  'Não desistas! A próxima será melhor.',
  'Continue aprendendo, tu consegues!',
  'Boa tentativa! Segue em frente.',
  'Aprende com o erro e avança!',
];
const TIMEOUT_MSGS = [
  'Tempo esgotado! Mais rapidez na próxima.',
  'O tempo acabou! Não desistas.',
];

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── Circular Timer ───────────────────────────────────────────────

function CircularTimer({ timeLeft, total = TIME_PER_QUESTION }) {
  const radius = 26;
  const circ = 2 * Math.PI * radius;
  const ratio = timeLeft / total;
  const offset = circ * (1 - ratio);
  const stroke = timeLeft < 5 ? '#ef4444' : timeLeft < 10 ? '#eab308' : '#16a34a';

  return (
    <div className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
      <svg className="absolute w-14 h-14 sm:w-16 sm:h-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle
          cx="32" cy="32" r={radius}
          fill="none" stroke={stroke} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
        />
      </svg>
      <span className="relative z-10 text-xs sm:text-sm font-bold tabular-nums" style={{ color: stroke }}>
        {timeLeft}s
      </span>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────

function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
      <div
        className="h-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Medal ────────────────────────────────────────────────────────

function Medal({ pct }) {
  if (pct >= 90) return <span className="text-5xl">🥇</span>;
  if (pct >= 70) return <span className="text-5xl">🥈</span>;
  if (pct >= 50) return <span className="text-5xl">🥉</span>;
  return <span className="text-5xl">🎓</span>;
}

function motivationalMsg(pct) {
  if (pct >= 90) return 'Desempenho excepcional! És um verdadeiro campeão COMAES!';
  if (pct >= 70) return 'Muito bom resultado! Continua a estudar e chegarás ao topo!';
  if (pct >= 50) return 'Bom esforço! Com mais prática vais melhorar muito!';
  return 'Não desistas! Cada tentativa é um passo para a excelência!';
}

// ─── Main Component ───────────────────────────────────────────────

export default function Teste() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // phase: 'select' | 'quiz' | 'result'
  const [phase, setPhase] = useState('select');
  const [selectedArea, setSelectedArea] = useState(null);
  const [areaCounts, setAreaCounts] = useState({ matematica: null, programacao: null, ingles: null });

  // quiz state
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizError, setQuizError] = useState(null);

  // feedback
  const [feedback, setFeedback] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);

  // gamification
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  // assistant
  const [assistantMsg, setAssistantMsg] = useState('');

  const timerRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Load area counts
  useEffect(() => {
    if (!user) return;
    Object.keys(AREAS).forEach(async (area) => {
      try {
        const res = await fetch(`${API_BASE}/api/questoes/quiz/${area}?limit=20`);
        const json = await res.json();
        if (json.success) setAreaCounts(prev => ({ ...prev, [area]: json.total }));
      } catch {
        setAreaCounts(prev => ({ ...prev, [area]: 0 }));
      }
    });
  }, [user]);

  // Timer helpers — separated to avoid cancelling feedback timer
  const clearMainTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const clearFeedbackTimer = useCallback(() => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = null;
  }, []);

  const clearAllTimers = useCallback(() => {
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
      if (next >= questions.length) { setPhase('result'); return prev; }
      return next;
    });
  }, [questions.length, clearMainTimer, clearFeedbackTimer]);

  const handleTimeout = useCallback(() => {
    if (answered) return;
    clearMainTimer();
    setAnswered(true);
    setSelectedOption(null);
    const msg = pickRandom(TIMEOUT_MSGS);
    setFeedback({ type: 'timeout', msg });
    setAssistantMsg(msg);
    setStreak(0);
    setAnswers(prev => [...prev, { idx: currentIdx, selected: null, correct: false, points: 0 }]);
    feedbackTimerRef.current = setTimeout(() => advanceQuestion(), 2500);
  }, [answered, currentIdx, clearMainTimer, advanceQuestion]);

  // Countdown — only clears main timer, never feedback timer
  useEffect(() => {
    if (phase !== 'quiz' || answered || loadingQuiz) return;
    clearMainTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); timerRef.current = null; handleTimeout(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearMainTimer();
  }, [phase, currentIdx, answered, loadingQuiz]); // eslint-disable-line

  // Track total time
  useEffect(() => {
    if (phase === 'quiz') startTimeRef.current = Date.now();
    if (phase === 'result' && startTimeRef.current)
      setTotalTime(Math.round((Date.now() - startTimeRef.current) / 1000));
  }, [phase]);

  useEffect(() => () => clearAllTimers(), [clearAllTimers]);

  // Start quiz
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
    setAssistantMsg('');
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
    } catch {
      setQuizError('Erro ao carregar questões. Verifica a ligação ao servidor.');
    } finally {
      setLoadingQuiz(false);
    }
  };

  // Handle answer
  const handleAnswer = useCallback((optionText) => {
    if (answered || feedback) return;
    clearMainTimer();
    setAnswered(true);
    setSelectedOption(optionText);

    const q = questions[currentIdx];
    const isCorrect = optionText.trim().toLowerCase() === q.resposta_correta.trim().toLowerCase();
    const timeBonus = Math.max(0, timeLeft - 5);
    const earned = isCorrect ? (q.pontos || 10) + Math.floor(timeBonus / 3) : 0;
    const earnedXp = isCorrect ? 15 + Math.floor(timeBonus / 5) : 2;
    const newStreak = isCorrect ? streak + 1 : 0;

    setScore(prev => prev + earned);
    setXp(prev => prev + earnedXp);
    setStreak(newStreak);
    setBestStreak(prev => Math.max(prev, newStreak));
    setAnswers(prev => [...prev, { idx: currentIdx, selected: optionText, correct: isCorrect, points: earned }]);

    const msg = isCorrect ? pickRandom(CORRECT_MSGS) : pickRandom(WRONG_MSGS);
    setFeedback({ type: isCorrect ? 'correct' : 'wrong', msg });
    setAssistantMsg(msg);

    clearFeedbackTimer();
    feedbackTimerRef.current = setTimeout(() => advanceQuestion(), 2500);
  }, [answered, feedback, questions, currentIdx, timeLeft, streak, clearMainTimer, clearFeedbackTimer, advanceQuestion]);

  // ─── Not logged in ────────────────────────────────────────────────
  if (!user) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto w-full px-6 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Acesso Restrito</h2>
            <p className="text-gray-600 text-base mb-6">Faz login para acederes ao Teste de Conhecimento COMAES.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/login')}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition text-sm">
                Fazer Login
              </button>
              <button onClick={() => navigate('/cadastro')}
                className="px-6 py-2.5 bg-white text-blue-600 border border-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition text-sm">
                Cadastrar
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ─── Area Selection ───────────────────────────────────────────────
  if (phase === 'select') {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto w-full px-6 py-8">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-3">
              Testa o teu Conhecimento
            </h1>
            <p className="text-base text-gray-600 max-w-xl mx-auto">
              Olá, <span className="font-semibold text-blue-600">{user.nome || user.name || 'Competidor'}</span>!
              Escolhe uma área e mostra o que sabes.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {Object.values(AREAS).map((area) => {
              const count = areaCounts[area.key];
              const { Icon } = area;
              return (
                <div
                  key={area.key}
                  onClick={() => startQuiz(area.key)}
                  className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl"
                >
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${area.badge}`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 mb-2">{area.title}</h3>
                  <p className="text-sm text-gray-600 mb-5 leading-relaxed">{area.description}</p>

                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs text-gray-400">
                      {count === null ? 'A carregar...' : count === 0 ? 'Sem questões' : `${count} questões`}
                    </span>
                    <span className="text-xs text-gray-400">30s / questão</span>
                  </div>

                  <button className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${area.btnGradient} text-white font-semibold text-sm hover:opacity-90 transition`}>
                    Iniciar →
                  </button>
                </div>
              );
            })}
          </div>

          {/* How it works */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-slate-800 text-center mb-6">Como funciona</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { Icon: Clock,  label: '30s por questão',    color: 'text-blue-600',    bg: 'bg-blue-50' },
                { Icon: Zap,    label: 'Bónus por rapidez',  color: 'text-yellow-600',  bg: 'bg-yellow-50' },
                { Icon: Target, label: 'Sequência de acertos', color: 'text-red-500',   bg: 'bg-red-50' },
                { Icon: Trophy, label: 'XP e pontuação',     color: 'text-indigo-600',  bg: 'bg-indigo-50' },
              ].map(({ Icon, label, color, bg }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </Layout>
    );
  }

  // ─── Quiz ─────────────────────────────────────────────────────────
  if (phase === 'quiz') {
    const area = AREAS[selectedArea] || AREAS.matematica;
    const { Icon } = area;
    const q = questions[currentIdx];
    const totalQ = questions.length;
    const correctCount = answers.filter(a => a.correct).length;

    // Loading
    if (loadingQuiz) {
      return (
        <Layout>
          <div className="max-w-7xl mx-auto w-full px-6 py-16 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-700 font-semibold">A carregar questões...</p>
              <p className="text-sm text-gray-400 mt-1">{area.title}</p>
            </div>
          </div>
        </Layout>
      );
    }

    // Error
    if (quizError) {
      return (
        <Layout>
          <div className="max-w-7xl mx-auto w-full px-6 py-16 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md w-full text-center">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-7 h-7 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-3">Sem questões disponíveis</h2>
              <p className="text-sm text-gray-600 mb-6">{quizError}</p>
              <button onClick={() => setPhase('select')}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition text-sm">
                ← Voltar
              </button>
            </div>
          </div>
        </Layout>
      );
    }

    if (!q) return null;

    const opcoes = Array.isArray(q.opcoes) ? q.opcoes : [];

    return (
      <Layout>
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
          <div className="max-w-2xl mx-auto">

            {/* Top bar */}
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => { clearAllTimers(); setPhase('select'); }}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-slate-800 font-medium transition"
              >
                <ChevronLeft className="w-4 h-4" /> Sair
              </button>
              <div className="flex items-center gap-2">
                {streak > 1 && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">
                    🔥 {streak}x
                  </span>
                )}
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">
                  ⚡ {xp} XP
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                  🏆 {score} pts
                </span>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">
                  Questão <span className="font-bold text-slate-800">{currentIdx + 1}</span> de <span className="font-bold text-slate-800">{totalQ}</span>
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${area.badge}`}>
                  {area.title}
                </span>
              </div>
              {/* Progress: currentIdx+1 / totalQ so it reaches 100% on last question */}
              <ProgressBar current={currentIdx + 1} total={totalQ} />
            </div>

            {/* Question card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-4">

              {/* Timer + question */}
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-1">
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${area.badge}`}>
                    {area.title} · {q.dificuldade || 'médio'}
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed">
                    {q.enunciado}
                  </h2>
                </div>
                <CircularTimer timeLeft={timeLeft} total={TIME_PER_QUESTION} />
              </div>

              {/* Options */}
              <div className="flex flex-col gap-3">
                {opcoes.map((opt, i) => {
                  const label = String.fromCharCode(65 + i);
                  const isCorrectOpt = opt.trim().toLowerCase() === q.resposta_correta.trim().toLowerCase();
                  const isSelected = opt === selectedOption;

                  let cls = 'w-full text-left flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ';
                  if (!answered) {
                    cls += 'bg-gray-100 border-gray-300 text-slate-700 hover:bg-blue-50 hover:border-blue-400 cursor-pointer';
                  } else if (isCorrectOpt) {
                    cls += 'bg-green-50 border-green-400 text-green-700';
                  } else if (isSelected) {
                    cls += 'bg-red-50 border-red-400 text-red-700';
                  } else {
                    cls += 'bg-gray-50 border-gray-200 text-gray-400 cursor-default';
                  }

                  return (
                    <button key={i} className={cls} onClick={() => handleAnswer(opt)} disabled={answered}>
                      <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border ${
                        !answered ? 'border-gray-300 text-gray-500 bg-white'
                          : isCorrectOpt ? 'border-green-400 text-green-600 bg-green-100'
                          : isSelected ? 'border-red-400 text-red-600 bg-red-100'
                          : 'border-gray-200 text-gray-300 bg-white'
                      }`}>
                        {label}
                      </span>
                      <span className="flex-1 text-sm sm:text-base">{opt}</span>
                      {answered && isCorrectOpt && <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />}
                      {answered && isSelected && !isCorrectOpt && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`rounded-xl p-4 mb-4 flex items-start gap-3 border ${
                feedback.type === 'correct'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : feedback.type === 'timeout'
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                    : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {feedback.type === 'correct'
                  ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  : <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                <span className="text-sm font-semibold">{feedback.msg}</span>
              </div>
            )}

            {/* Assistant bubble */}
            {assistantMsg && answered && (
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-base">🤖</div>
                <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-tl-none px-4 py-2.5 text-sm text-slate-700 font-medium max-w-xs">
                  {assistantMsg}
                </div>
              </div>
            )}

            {/* Next button */}
            {answered && (
              <div className="flex justify-end">
                <button
                  onClick={() => { clearFeedbackTimer(); advanceQuestion(); }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition shadow-md"
                >
                  {currentIdx >= totalQ - 1 ? 'Ver Resultado 🏆' : 'Próxima →'}
                </button>
              </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 text-center">
                <div className="text-lg font-bold text-green-600">{correctCount}</div>
                <div className="text-xs text-gray-500 mt-0.5">Acertos</div>
              </div>
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 text-center">
                <div className="text-lg font-bold text-red-500">{answers.filter(a => !a.correct).length}</div>
                <div className="text-xs text-gray-500 mt-0.5">Erros</div>
              </div>
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 text-center">
                <div className="text-lg font-bold text-yellow-600">{bestStreak}</div>
                <div className="text-xs text-gray-500 mt-0.5">Melhor sequência</div>
              </div>
            </div>

          </div>
        </div>
      </Layout>
    );
  }

  // ─── Result ───────────────────────────────────────────────────────
  if (phase === 'result') {
    const area = AREAS[selectedArea] || AREAS.matematica;
    const totalQ = questions.length;
    const correctCount = answers.filter(a => a.correct).length;
    const wrongCount = answers.filter(a => !a.correct).length;
    const pct = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;
    const mins = Math.floor(totalTime / 60);
    const secs = totalTime % 60;
    const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

    return (
      <Layout>
        <div className="max-w-7xl mx-auto w-full px-6 py-8">
          <div className="max-w-2xl mx-auto">

            {/* Header */}
            <div className="text-center mb-8 animate-fade-in">
              <Medal pct={pct} />
              <h1 className="text-4xl font-extrabold text-slate-800 mt-4 mb-1">Teste Concluído!</h1>
              <p className="text-base text-gray-500">{area.title}</p>
            </div>

            {/* Score highlight */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 text-center mb-6 animate-fade-in">
              <div className="text-5xl font-extrabold text-blue-600 mb-1">{pct}%</div>
              <p className="text-sm text-gray-500 mb-4">{score} pontos · {xp} XP</p>
              <ProgressBar current={pct} total={100} />
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-in">
              {[
                { label: 'Acertos',          value: correctCount, color: 'text-green-600',  bg: 'bg-green-50',  icon: '✅' },
                { label: 'Erros',            value: wrongCount,   color: 'text-red-500',    bg: 'bg-red-50',    icon: '❌' },
                { label: 'Melhor sequência', value: bestStreak,   color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '🔥' },
                { label: 'Tempo total',      value: timeStr,      color: 'text-blue-600',   bg: 'bg-blue-50',   icon: '⏱️' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-xl shadow-md border border-gray-200 p-4 text-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${stat.bg}`}>
                    <span className="text-lg">{stat.icon}</span>
                  </div>
                  <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Question review */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6 animate-fade-in">
              <h3 className="text-base font-bold text-slate-800 mb-4">Revisão das questões</h3>
              <div className="flex flex-wrap gap-2">
                {questions.map((_, i) => {
                  const ans = answers.find(a => a.idx === i);
                  return (
                    <div key={i} className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold border ${
                      !ans ? 'bg-gray-100 text-gray-400 border-gray-200'
                        : ans.correct ? 'bg-green-50 text-green-600 border-green-300'
                        : 'bg-red-50 text-red-500 border-red-300'
                    }`}>
                      {i + 1}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Assistant motivational */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-5 mb-6 flex items-start gap-3 animate-fade-in">
              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-lg">🤖</div>
              <p className="text-sm text-slate-700 font-medium leading-relaxed pt-1">{motivationalMsg(pct)}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 animate-fade-in">
              <button
                onClick={() => startQuiz(selectedArea)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-md text-sm"
              >
                <RotateCcw className="w-4 h-4" /> Tentar novamente
              </button>
              <button
                onClick={() => setPhase('select')}
                className="flex-1 py-3 bg-white text-blue-600 border border-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition text-sm"
              >
                ← Voltar para áreas
              </button>
            </div>

          </div>
        </div>
      </Layout>
    );
  }

  return null;
}
