import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from './Layout';
import { QuestionCardEnhanced } from '../../components/components_teste/QuestionCardEnhanced';
import { ResultScreenEnhanced } from '../../components/components_teste/ResultScreenEnhanced';
import { Calculator, Code2, Languages, Trophy, Clock, Zap, Target, RotateCcw, ChevronLeft, CheckCircle2, XCircle, Square, ChevronDown } from 'lucide-react';

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const API_BASE = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3002`;
const TIME_PER_QUESTION = 30;

const AREAS = {
  matematica: {
    key: 'matematica',
    title: 'MatemÃ¡tica',
    Icon: Calculator,
    color: 'blue',
    btnGradient: 'from-blue-600 to-indigo-600',
    badge: 'bg-blue-100 text-blue-700',
    description: 'Ãlgebra, geometria, cÃ¡lculo e raciocÃ­nio lÃ³gico',
  },
  programacao: {
    key: 'programacao',
    title: 'ProgramaÃ§Ã£o',
    Icon: Code2,
    color: 'indigo',
    btnGradient: 'from-indigo-600 to-blue-600',
    badge: 'bg-indigo-100 text-indigo-700',
    description: 'LÃ³gica, algoritmos, linguagens e desenvolvimento',
  },
  ingles: {
    key: 'ingles',
    title: 'InglÃªs',
    Icon: Languages,
    color: 'slate',
    btnGradient: 'from-slate-600 to-blue-600',
    badge: 'bg-slate-100 text-slate-700',
    description: 'GramÃ¡tica, vocabulÃ¡rio e compreensÃ£o textual',
  },
};

const CORRECT_MSGS = [
  'Excelente! Resposta certa!',
  'Muito bem! Continue assim!',
  'Perfeito! EstÃ¡s a arrasar!',
  'Brilhante! Continua!',
];
const WRONG_MSGS = [
  'NÃ£o desistas! A prÃ³xima serÃ¡ melhor.',
  'Continue aprendendo, tu consegues!',
  'Boa tentativa! Segue em frente.',
  'Aprende com o erro e avanÃ§a!',
];
const TIMEOUT_MSGS = [
  'Tempo esgotado! Mais rapidez na prÃ³xima.',
  'O tempo acabou! NÃ£o desistas.',
];

const NIVEIS = [
  { key: '', label: 'Todos os nÃ­veis', color: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' },
  { key: 'facil', label: 'FÃ¡cil', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  { key: 'medio', label: 'MÃ©dio', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  { key: 'dificil', label: 'DifÃ­cil', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
];

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// â”€â”€â”€ Circular Timer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Progress Bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Medal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Medal({ pct }) {
  if (pct >= 90) return <span className="text-5xl">ðŸ¥‡</span>;
  if (pct >= 70) return <span className="text-5xl">ðŸ¥ˆ</span>;
  if (pct >= 50) return <span className="text-5xl">ðŸ¥‰</span>;
  return <span className="text-5xl">ðŸŽ“</span>;
}

function motivationalMsg(pct) {
  if (pct >= 90) return 'Desempenho excepcional! Ã‰s um verdadeiro campeÃ£o COMAES!';
  if (pct >= 70) return 'Muito bom resultado! Continua a estudar e chegarÃ¡s ao topo!';
  if (pct >= 50) return 'Bom esforÃ§o! Com mais prÃ¡tica vais melhorar muito!';
  return 'NÃ£o desistas! Cada tentativa Ã© um passo para a excelÃªncia!';
}

// â”€â”€â”€ Score Popup (feedback visual de pontuaÃ§Ã£o) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ScorePopup({ points, visible }) {
  if (!visible || !points) return null;
  return (
    <div className="absolute top-0 right-0 -translate-y-full animate-bounce pointer-events-none z-10">
      <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
        +{points} pts
      </span>
    </div>
  );
}

// â”€â”€â”€ Nivel Selector â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function NivelSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const current = NIVEIS.find(n => n.key === value) || NIVEIS[0];
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${current.color} border-current/20`}
      >
        <span className={`w-2 h-2 rounded-full ${current.dot}`} />
        {current.label}
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-20 min-w-[140px] overflow-hidden">
          {NIVEIS.map(n => (
            <button
              key={n.key}
              onClick={() => { onChange(n.key); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors ${value === n.key ? 'bg-slate-50' : ''}`}
            >
              <span className={`w-2 h-2 rounded-full ${n.dot}`} />
              {n.label}
              {value === n.key && <span className="ml-auto text-blue-600">âœ“</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ Stop Confirm Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function StopConfirmModal({ isOpen, onConfirm, onCancel, score, answered }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Square className="w-7 h-7 text-orange-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Parar o Quiz?</h3>
          <p className="text-sm text-slate-500">
            Respondeste a <strong>{answered}</strong> questÃ£o{answered !== 1 ? 's' : ''} e acumulaste <strong>{score} pontos</strong>.
            O resultado serÃ¡ calculado com base nas questÃµes respondidas.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 text-sm"
          >
            Continuar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 text-sm"
          >
            Parar e Ver Resultado
          </button>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function Teste() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // phase: 'select' | 'quiz' | 'result'
  const [phase, setPhase] = useState('select');
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedNivel, setSelectedNivel] = useState(''); // '' = all levels
  const [selectedTestMode, setSelectedTestMode] = useState('closed'); // 'closed' = mÃºltipla escolha | 'guided' = guiado
  const [areaCounts, setAreaCounts] = useState({ matematica: null, programacao: null, ingles: null });
  const [bestPerformances, setBestPerformances] = useState({ matematica: null, programacao: null, ingles: null });

  // quiz state
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [questoesRespondidas, setQuestoesRespondidas] = useState(new Set()); // Track answered questions to prevent double scoring
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizError, setQuizError] = useState(null);
  const [stoppedEarly, setStoppedEarly] = useState(false); // flag for early stop
  const [showStopModal, setShowStopModal] = useState(false);

  // feedback
  const [feedback, setFeedback] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [lastEarned, setLastEarned] = useState(0);   // points earned on last answer
  const [showScorePopup, setShowScorePopup] = useState(false);

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
  const scorePopupTimerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Load area counts and best performances
  useEffect(() => {
    if (!user) return;
    
    // Load question counts
    Object.keys(AREAS).forEach(async (area) => {
      try {
        const res = await fetch(`${API_BASE}/api/questoes/quiz/${area}?limit=20`);
        const json = await res.json();
        if (json.success) setAreaCounts(prev => ({ ...prev, [area]: json.data?.length || 0 }));
      } catch {
        setAreaCounts(prev => ({ ...prev, [area]: 0 }));
      }
    });

    // Load best performances
    const loadBestPerformances = async () => {
      try {
        const token = localStorage.getItem('comaes_token');
        const res = await fetch(`${API_BASE}/api/usuarios/me/melhores-desempenhos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success) {
          setBestPerformances(json.data);
        }
      } catch (err) {
        console.error('Erro ao carregar melhores desempenhos:', err);
      }
    };
    loadBestPerformances();
  }, [user]);

  // Timer helpers â€” separated to avoid cancelling feedback timer
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
    if (scorePopupTimerRef.current) clearTimeout(scorePopupTimerRef.current);
  }, [clearMainTimer, clearFeedbackTimer]);

  const saveTestResult = useCallback(async () => {
    if (!selectedArea || questions.length === 0) return;
    
    const totalQ = questions.length;
    const correctCount = answers.filter(a => a.correct).length;
    const pct = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;

    try {
      const token = localStorage.getItem('comaes_token');
      const res = await fetch(`${API_BASE}/api/resultados`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          area: selectedArea,
          percentual: pct,
          pontos: score,
          total_questoes: totalQ,
          acertos: correctCount,
        }),
      });
      const json = await res.json();
      if (json.success && json.melhores_desempenhos) {
        // Update best performances with the new data
        setBestPerformances(json.melhores_desempenhos);
      }
    } catch (err) {
      console.error('Erro ao salvar resultado:', err);
    }
  }, [selectedArea, questions.length, answers, score]);

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
        // Test finished â€” save result
        saveTestResult();
        setPhase('result');
        return prev;
      }
      return next;
    });
  }, [questions.length, clearMainTimer, clearFeedbackTimer, saveTestResult]);

  const handleTimeout = useCallback(() => {
    if (answered || questoesRespondidas.has(currentIdx)) return;
    
    // Mark this question as answered to prevent double scoring
    setQuestoesRespondidas(prev => new Set([...prev, currentIdx]));
    
    clearMainTimer();
    setAnswered(true);
    setSelectedOption(null);
    const msg = pickRandom(TIMEOUT_MSGS);
    setFeedback({ type: 'timeout', msg });
    setAssistantMsg(msg);
    setStreak(0);
    setAnswers(prev => [...prev, { idx: currentIdx, selected: null, correct: false, points: 0 }]);
    
    // Auto-advance to next question
    feedbackTimerRef.current = setTimeout(() => advanceQuestion(), 2500);
  }, [answered, questoesRespondidas, currentIdx, clearMainTimer, advanceQuestion]);

  // Countdown â€” only clears main timer, never feedback timer
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
  const startQuiz = async (areaKey, nivelKey = selectedNivel, testMode = selectedTestMode) => {
    setSelectedArea(areaKey);
    setLoadingQuiz(true);
    setQuizError(null);
    setQuestions([]);
    setCurrentIdx(0);
    setAnswers([]);
    setQuestoesRespondidas(new Set()); // Reset tracking of answered questions
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setXp(0);
    setTimeLeft(TIME_PER_QUESTION);
    setFeedback(null);
    setSelectedOption(null);
    setAnswered(false);
    setAssistantMsg('');
    setStoppedEarly(false);
    setLastEarned(0);
    setShowScorePopup(false);
    setPhase('quiz');
    try {
      const nivelParam = nivelKey ? `&dificuldade=${nivelKey}` : '';
      const res = await fetch(`${API_BASE}/api/questoes/quiz/${areaKey}?limit=10${nivelParam}`);
      const json = await res.json();
      if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
        const nivelLabel = nivelKey ? ` no nÃ­vel "${NIVEIS.find(n => n.key === nivelKey)?.label}"` : '';
        setQuizError(`Nenhuma questÃ£o disponÃ­vel para esta Ã¡rea${nivelLabel}. Tenta outro nÃ­vel ou aguarda o administrador criar questÃµes.`);
        setLoadingQuiz(false);
        return;
      }
      
      // Mapear dados da API para formato esperado pelo frontend
      const questoesMapeadas = json.data.map(q => ({
        id: q.id,
        enunciado: q.enunciado || q.texto_pergunta || '',
        resposta_correta: q.resposta_correta || q.respostaCorreta || '',
        pontos: q.pontos || 10,
        dificuldade: q.dificuldade || 'medio',
        tipo: q.tipo || 'multiple',
        dica: q.dica || '',
        explicacao: q.explicacao || '',
        // Usar opcoes como array se existir, senão tentar construir a partir de opcao_a, opcao_b, etc
        opcoes: Array.isArray(q.opcoes) ? q.opcoes : [q.opcao_a, q.opcao_b, q.opcao_c, q.opcao_d].filter(Boolean)
      }));
      
      setQuestions(questoesMapeadas);
    } catch {
      setQuizError('Erro ao carregar questÃµes. Verifica a ligaÃ§Ã£o ao servidor.');
    } finally {
      setLoadingQuiz(false);
    }
  };

  // Stop quiz early â€” show confirm modal
  const handleStopQuiz = () => {
    setShowStopModal(true);
  };

  // Confirm stop â€” save partial result and go to result screen
  const confirmStopQuiz = useCallback(() => {
    clearAllTimers();
    setShowStopModal(false);
    setStoppedEarly(true);
    saveTestResult();
    setPhase('result');
  }, [clearAllTimers, saveTestResult]);

  // Handle answer
  const handleAnswer = useCallback((optionText) => {
    // Prevent multiple answers for the same question
    if (answered || feedback || questoesRespondidas.has(currentIdx)) return;
    
    // Mark this question as answered to prevent double scoring
    setQuestoesRespondidas(prev => new Set([...prev, currentIdx]));
    
    clearMainTimer();
    setAnswered(true);
    setSelectedOption(optionText);

    const q = questions[currentIdx];
    const isCorrect = optionText.trim().toLowerCase() === q.resposta_correta.trim().toLowerCase();
    
    // Only add points if this question hasn't been answered before
    const alreadyAnswered = questoesRespondidas.has(currentIdx);
    
    if (!alreadyAnswered) {
      const timeBonus = Math.max(0, timeLeft - 5);
      const earned = isCorrect ? (q.pontos || 10) + Math.floor(timeBonus / 3) : 0;
      const earnedXp = isCorrect ? 15 + Math.floor(timeBonus / 5) : 2;
      const newStreak = isCorrect ? streak + 1 : 0;

      setScore(prev => prev + earned);
      setXp(prev => prev + earnedXp);
      setStreak(newStreak);
      setBestStreak(prev => Math.max(prev, newStreak));
      setAnswers(prev => [...prev, { idx: currentIdx, selected: optionText, correct: isCorrect, points: earned }]);

      // Show score popup for correct answers
      if (isCorrect && earned > 0) {
        setLastEarned(earned);
        setShowScorePopup(true);
        if (scorePopupTimerRef.current) clearTimeout(scorePopupTimerRef.current);
        scorePopupTimerRef.current = setTimeout(() => setShowScorePopup(false), 2000);
      }
    } else {
      // Still track the answer but without points (shouldn't happen with our guard above)
      setAnswers(prev => [...prev, { idx: currentIdx, selected: optionText, correct: isCorrect, points: 0 }]);
    }

    const msg = isCorrect ? pickRandom(CORRECT_MSGS) : pickRandom(WRONG_MSGS);
    // Adicionar explicaÃ§Ã£o da resposta correta
    const feedbackObj = { 
      type: isCorrect ? 'correct' : 'wrong', 
      msg,
      explanation: q.explicacao || (isCorrect ? 'ParabÃ©ns! Esta Ã© a resposta correta.' : `A resposta correta Ã©: ${q.resposta_correta}`)
    };
    setFeedback(feedbackObj);
    setAssistantMsg(msg);

    // Auto-advance to next question after feedback
    clearFeedbackTimer();
    feedbackTimerRef.current = setTimeout(() => advanceQuestion(), 2500);
  }, [answered, feedback, questoesRespondidas, questions, currentIdx, timeLeft, streak, clearMainTimer, clearFeedbackTimer, advanceQuestion]);

  // â”€â”€â”€ Not logged in â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Area Selection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (phase === 'select') {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto w-full px-6 py-8">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-3">
              Testa o teu Conhecimento
            </h1>
            <p className="text-base text-gray-600 max-w-xl mx-auto">
              OlÃ¡, <span className="font-semibold text-blue-600">{user.nome || user.name || 'Competidor'}</span>!
              Escolhe uma Ã¡rea e mostra o que sabes.
            </p>
          </div>

          {/* Difficulty selector */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="text-sm font-semibold text-slate-600">NÃ­vel de dificuldade:</span>
            <div className="flex gap-2">
              {NIVEIS.map(n => (
                <button
                  key={n.key}
                  onClick={() => setSelectedNivel(n.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                    selectedNivel === n.key
                      ? `${n.color} border-current shadow-sm scale-105`
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${n.dot}`} />
                  {n.label}
                </button>
              ))}
            </div>
          </div>

          {/* Test Mode selector */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="text-sm font-semibold text-slate-600">Modo de teste:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTestMode('closed')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                  selectedTestMode === 'closed'
                    ? 'bg-blue-100 text-blue-700 border-blue-400 shadow-sm scale-105'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                âœ… Respostas Fechadas
              </button>
              <button
                onClick={() => setSelectedTestMode('guided')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                  selectedTestMode === 'guided'
                    ? 'bg-green-100 text-green-700 border-green-400 shadow-sm scale-105'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                ðŸ’¡ Modo Guiado
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {Object.values(AREAS).map((area) => {
              const count = areaCounts[area.key];
              const bestPct = bestPerformances[area.key];
              const { Icon } = area;
              const nivelLabel = NIVEIS.find(n => n.key === selectedNivel)?.label;
              return (
                <div
                  key={area.key}
                  onClick={() => startQuiz(area.key, selectedNivel)}
                  className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl"
                >
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${area.badge}`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 mb-2">{area.title}</h3>
                  <p className="text-sm text-gray-600 mb-5 leading-relaxed">{area.description}</p>

                  {/* Best performance badge */}
                  {bestPct !== null ? (
                    <div className="mb-4">
                      <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 rounded-full px-3 py-1.5 text-xs font-semibold">
                        ðŸ† Melhor: {bestPct}%
                      </span>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 rounded-full px-3 py-1.5 text-xs font-semibold">
                        âœ¨ NÃ£o iniciado
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs text-gray-400">
                      {count === null ? 'A carregar...' : count === 0 ? 'Sem questÃµes' : `${count} questÃµes`}
                    </span>
                    <span className="text-xs text-gray-400">30s / questÃ£o</span>
                  </div>

                  <button className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${area.btnGradient} text-white font-semibold text-sm hover:opacity-90 transition`}>
                    {selectedNivel ? `Iniciar Â· ${nivelLabel} â†’` : 'Iniciar â†’'}
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
                { Icon: Clock,  label: '30s por questÃ£o',    color: 'text-blue-600',    bg: 'bg-blue-50' },
                { Icon: Zap,    label: 'BÃ³nus por rapidez',  color: 'text-yellow-600',  bg: 'bg-yellow-50' },
                { Icon: Target, label: 'SequÃªncia de acertos', color: 'text-red-500',   bg: 'bg-red-50' },
                { Icon: Trophy, label: 'XP e pontuaÃ§Ã£o',     color: 'text-indigo-600',  bg: 'bg-indigo-50' },
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

  // â”€â”€â”€ Quiz â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
              <p className="text-slate-700 font-semibold">A carregar questÃµes...</p>
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
              <h2 className="text-xl font-bold text-slate-800 mb-3">Sem questÃµes disponÃ­veis</h2>
              <p className="text-sm text-gray-600 mb-6">{quizError}</p>
              <button onClick={() => setPhase('select')}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition text-sm">
                â† Voltar
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

            {/* Stop confirm modal */}
            <StopConfirmModal
              isOpen={showStopModal}
              onConfirm={confirmStopQuiz}
              onCancel={() => setShowStopModal(false)}
              score={score}
              answered={answers.length}
            />

            {/* Top bar */}
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => { clearAllTimers(); setPhase('select'); }}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-slate-800 font-medium transition"
              >
                <ChevronLeft className="w-4 h-4" /> Sair
              </button>
              <div className="flex items-center gap-2">
                {/* Difficulty selector in-quiz */}
                <NivelSelector value={selectedNivel} onChange={(v) => startQuiz(selectedArea, v)} />
                {streak > 1 && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">
                    ðŸ”¥ {streak}x
                  </span>
                )}
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">
                  âš¡ {xp} XP
                </span>
                {/* Score with popup */}
                <div className="relative">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                    ðŸ† {score} pts
                  </span>
                  <ScorePopup points={lastEarned} visible={showScorePopup} />
                </div>
                {/* Stop button */}
                <button
                  onClick={handleStopQuiz}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold hover:bg-orange-200 transition"
                  title="Parar quiz e ver resultado"
                >
                  <Square className="w-3 h-3" /> Parar
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">
                  QuestÃ£o <span className="font-bold text-slate-800">{currentIdx + 1}</span> de <span className="font-bold text-slate-800">{totalQ}</span>
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${area.badge}`}>
                  {area.title}
                </span>
              </div>
              {/* Progress: currentIdx+1 / totalQ so it reaches 100% on last question */}
              <ProgressBar current={currentIdx + 1} total={totalQ} />
            </div>

            {/* Question card enhanced */}
            <div className="mb-6">
              <QuestionCardEnhanced
                question={{
                  enunciado: q.enunciado,
                  questao: q.questao,
                  contexto: q.contexto,
                  tipo: q.tipo,
                  opcoes: opcoes,
                  resposta_correta: q.resposta_correta,
                  dificuldade: q.dificuldade || 'medio',
                  dica: q.dica,
                  respostaSelecionada: selectedOption,
                  explicacao: q.explicacao || (feedback?.explanation ? feedback.explanation : null),
                }}
                index={currentIdx}
                total={totalQ}
                onAnswer={handleAnswer}
                disabled={answered}
                feedback={feedback}
                timeLeft={timeLeft}
                testMode={selectedTestMode}
              />
            </div>

            {/* Assistant bubble */}
            {assistantMsg && answered && (
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-base">ðŸ¤–</div>
                <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-tl-none px-4 py-2.5 text-sm text-slate-700 font-medium max-w-xs">
                  {assistantMsg}
                </div>
              </div>
            )}

            {/* Show correct answer when wrong */}
            {answered && answers.find(a => a.idx === currentIdx) && !answers.find(a => a.idx === currentIdx)?.correct && (
              <div className="rounded-xl bg-green-50 border-2 border-green-300 p-4 mb-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-700 mb-1">Resposta correta:</p>
                    <p className="text-base font-bold text-green-800 mb-2">{q.resposta_correta}</p>
                    {q.explicacao && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">ExplicaÃ§Ã£o:</p>
                        <p className="text-sm text-green-700 leading-relaxed">{q.explicacao}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Show explanation when correct */}
            {answered && answers.find(a => a.idx === currentIdx)?.correct && q.explicacao && (
              <div className="rounded-xl bg-blue-50 border-2 border-blue-300 p-4 mb-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">InformaÃ§Ã£o complementar:</p>
                    <p className="text-sm text-blue-700 leading-relaxed">{q.explicacao}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Points earned display */}
            {answered && answers.find(a => a.idx === currentIdx)?.points > 0 && (
              <div className="rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">ðŸŽ¯</span>
                    <div>
                      <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">Pontos ganhos</p>
                      <p className="text-2xl font-bold text-yellow-800">{answers.find(a => a.idx === currentIdx)?.points} pts</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-yellow-600 font-semibold">BÃ³nus por tempo:</p>
                    <p className="text-lg text-yellow-700 font-bold">+{Math.max(0, timeLeft - 5)}s</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 mb-6 flex-wrap">
              <button
                onClick={() => {
                  if (currentIdx > 0) {
                    clearFeedbackTimer();
                    clearMainTimer();
                    setCurrentIdx(currentIdx - 1);
                    setFeedback(null);
                    setSelectedOption(null);
                    setAnswered(false);
                    setTimeLeft(TIME_PER_QUESTION);
                  }
                }}
                disabled={currentIdx === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border-2 border-gray-300 text-slate-700 font-semibold hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
              
              <button
                onClick={handleStopQuiz}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border-2 border-orange-400 text-orange-600 font-semibold hover:bg-orange-50 transition text-sm"
              >
                <Square className="w-4 h-4" /> Parar Quiz
              </button>
              
              <button
                onClick={() => {
                  if (currentIdx < totalQ - 1) {
                    clearFeedbackTimer();
                    clearMainTimer();
                    setCurrentIdx(currentIdx + 1);
                    setFeedback(null);
                    setSelectedOption(null);
                    setAnswered(false);
                    setTimeLeft(TIME_PER_QUESTION);
                  } else if (answered) {
                    clearAllTimers();
                    saveTestResult();
                    setPhase('result');
                  }
                }}
                disabled={currentIdx === totalQ - 1 && !answered}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm ml-auto"
              >
                {currentIdx === totalQ - 1 && answered ? (
                  <>âœ“ Terminar</>
                ) : (
                  <>PrÃ³xima <ChevronLeft className="w-4 h-4 rotate-180" /></>
                )}
              </button>
            </div>

            {/* Progress map */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-4 mb-4">
              <p className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">Progresso das questÃµes</p>
              <div className="flex flex-wrap gap-2">
                {questions.map((_, idx) => {
                  const answerObj = answers.find(a => a.idx === idx);
                  const isCurrent = idx === currentIdx;
                  const isAnswered = answerObj !== undefined;
                  const isCorrect = answerObj?.correct;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (idx !== currentIdx) {
                          clearFeedbackTimer();
                          clearMainTimer();
                          setCurrentIdx(idx);
                          setFeedback(null);
                          setSelectedOption(null);
                          setAnswered(false);
                          setTimeLeft(TIME_PER_QUESTION);
                        }
                      }}
                      className={`w-9 h-9 rounded-lg font-bold text-xs transition-all ${
                        isCurrent
                          ? 'ring-2 ring-blue-500 bg-blue-100 text-blue-700'
                          : isAnswered
                          ? isCorrect
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      }`}
                      title={
                        isCurrent ? 'QuestÃ£o atual' :
                        isAnswered ? (isCorrect ? 'Respondida (Correto)' : 'Respondida (Errado)') :
                        'NÃ£o respondida'
                      }
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Pontos</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-700 mt-1">{score}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Acertos</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-700 mt-1">{correctCount}/{totalQ}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                <p className="text-xs text-yellow-600 font-semibold uppercase tracking-wide">SequÃªncia</p>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-700 mt-1">{streak}ðŸ”¥</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide">XP</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-700 mt-1">+{xp}</p>
              </div>
            </div>

            {/* Next button */}
            {answered && (
              <div className="flex justify-end">
                <button
                  onClick={() => { clearFeedbackTimer(); advanceQuestion(); }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition shadow-md"
                >
                  {currentIdx >= totalQ - 1 ? 'Ver Resultado ðŸ†' : 'PrÃ³xima â†’'}
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
                <div className="text-xs text-gray-500 mt-0.5">Melhor sequÃªncia</div>
              </div>
            </div>

          </div>
        </div>
      </Layout>
    );
  }

  // â”€â”€â”€ Result â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (phase === 'result') {
    const area = AREAS[selectedArea] || AREAS.matematica;
    const totalQ = questions.length;
    const answeredCount = answers.length;
    const correctCount = answers.filter(a => a.correct).length;
    const wrongCount = answers.filter(a => !a.correct).length;
    const baseDenominator = stoppedEarly ? answeredCount : totalQ;
    const pct = baseDenominator > 0 ? Math.round((correctCount / baseDenominator) * 100) : 0;
    const mins = Math.floor(totalTime / 60);
    const secs = totalTime % 60;

    return (
      <Layout>
        <ResultScreenEnhanced
          totalScore={score}
          maxScore={totalQ * 10}
          percent={pct}
          correct={correctCount}
          wrong={wrongCount}
          totalQuestions={stoppedEarly ? answeredCount : totalQ}
          timeSpent={totalTime}
          streak={bestStreak}
          xpEarned={xp}
          area={selectedArea}
          onRestart={() => startQuiz(selectedArea, selectedNivel)}
          onNewArea={() => setPhase('select')}
        />
      </Layout>
    );
  }

  return null;
}
