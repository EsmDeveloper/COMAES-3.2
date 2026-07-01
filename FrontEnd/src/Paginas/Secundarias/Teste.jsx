import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from './Layout';
import { ResultScreenEnhanced } from '../../components/components_teste/ResultScreenEnhanced';
import {
  Calculator, Code2, Languages, Trophy, Clock, Zap, Target,
  RotateCcw, ChevronLeft, CheckCircle2, XCircle, Square, ChevronDown,
  Medal, Award, Bot, Flame, Check, ArrowRight, Send, Edit3
} from 'lucide-react';

// ---------------------------------------------------------------------
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const TIME_PER_QUESTION = 60; // Aumentado para dar tempo de escrever

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
  'Excelente! Resposta bem elaborada!',
  'Muito bem! Excelente desenvolvimento!',
  'Perfeito! Resposta completa e coerente!',
  'Brilhante! Ótima argumentação!',
];
const WRONG_MSGS = [
  'Não desistas! A próxima será melhor. Revisa os conceitos.',
  'Continue aprendendo, tu consegues! Cada erro é um aprendizado.',
  'Boa tentativa! A resposta correta está na explicação abaixo.',
  'Aprende com o erro e avança! A prática leva à perfeição.',
];
const TIMEOUT_MSGS = [
  'Tempo esgotado! Treine mais para ganhar velocidade na escrita.',
  'O tempo acabou! Não desistas, a prática melhora a fluência.',
];

const NIVEIS = [
  { key: '', label: 'Todos os níveis', color: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' },
  { key: 'facil', label: 'Fácil', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  { key: 'medio', label: 'Médio', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  { key: 'dificil', label: 'Difícil', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
];

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ---------------------------------------------------------------------
function CircularTimer({ timeLeft, total = TIME_PER_QUESTION }) {
  const radius = 26;
  const circ = 2 * Math.PI * radius;
  const ratio = timeLeft / total;
  const offset = circ * (1 - ratio);
  const stroke = timeLeft < 10 ? '#ef4444' : timeLeft < 20 ? '#eab308' : '#16a34a';

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

// ---------------------------------------------------------------------
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

// ---------------------------------------------------------------------
function MedalIcon({ pct }) {
  if (pct >= 90) return <Trophy className="w-12 h-12 text-yellow-500" />;
  if (pct >= 70) return <Medal className="w-12 h-12 text-gray-400" />;
  if (pct >= 50) return <Award className="w-12 h-12 text-amber-600" />;
  return <Award className="w-12 h-12 text-blue-500" />;
}

function motivationalMsg(pct) {
  if (pct >= 90) return 'Desempenho excepcional! És um verdadeiro campeão COMAES!';
  if (pct >= 70) return 'Muito bom resultado! Continua a estudar e chegarás ao topo!';
  if (pct >= 50) return 'Bom esforço! Com mais prática vais melhorar muito!';
  return 'Não desistas! Cada tentativa é um passo para a excelência!';
}

// ---------------------------------------------------------------------
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

// ---------------------------------------------------------------------
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
              {value === n.key && <Check className="w-3 h-3 ml-auto text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
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
            Respondeste a <strong>{answered}</strong> questão{answered !== 1 ? 's' : ''} e acumulaste <strong>{score} pontos</strong>.
            O resultado será calculado com base nas questões respondidas.
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

// ================================================================
// 🔥 NOVO COMPONENTE: QuestionCardDissertativa
// ================================================================
function QuestionCardDissertativa({ 
  question, 
  index, 
  total, 
  onAnswer, 
  disabled, 
  feedback, 
  timeLeft,
  userAnswer = '',
  onAnswerChange
}) {
  const [localAnswer, setLocalAnswer] = useState(userAnswer || '');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (userAnswer !== undefined) {
      setLocalAnswer(userAnswer);
      updateCounts(userAnswer);
    }
  }, [userAnswer]);

  const updateCounts = (text) => {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
    setCharCount(text.length);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setLocalAnswer(value);
    updateCounts(value);
    if (onAnswerChange) {
      onAnswerChange(value);
    }
  };

  const handleSubmit = () => {
    if (localAnswer.trim().length > 0 && !disabled) {
      onAnswer(localAnswer);
    }
  };

  const isCorrect = feedback?.type === 'correct';
  const isWrong = feedback?.type === 'wrong';
  const isTimeout = feedback?.type === 'timeout';

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header da Questão */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-500">
              Questão {index + 1} de {total}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              question.dificuldade === 'facil' ? 'bg-green-100 text-green-700' :
              question.dificuldade === 'medio' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {question.dificuldade || 'Médio'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">{question.pontos || 10} pts</span>
            <CircularTimer timeLeft={timeLeft} total={TIME_PER_QUESTION} />
          </div>
        </div>
      </div>

      {/* Enunciado */}
      <div className="px-6 py-5">
        <h3 className="text-xl font-bold text-gray-800 mb-3">{question.enunciado}</h3>
        {question.contexto && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">{question.contexto}</p>
          </div>
        )}
        
        {/* Dica (se disponível) */}
        {question.dica && !feedback && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-amber-700 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span className="font-medium">Dica:</span> {question.dica}
            </p>
          </div>
        )}

        {/* Área do Textarea */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Sua Resposta
            </span>
          </label>
          
          <textarea
            value={localAnswer}
            onChange={handleChange}
            rows={8}
            className={`w-full px-4 py-3 border-2 rounded-xl transition-all resize-y min-h-[180px] font-sans text-base ${
              disabled 
                ? 'bg-gray-100 border-gray-200 cursor-not-allowed' 
                : isCorrect 
                  ? 'border-green-500 bg-green-50' 
                  : isWrong 
                    ? 'border-red-500 bg-red-50' 
                    : isTimeout 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
            }`}
            placeholder="Elabore sua resposta aqui de forma clara e organizada..."
            disabled={disabled}
          />
          
          {/* Contador de palavras e caracteres */}
          {!disabled && (
            <div className="flex justify-between items-center mt-2 text-sm">
              <div className="flex gap-4">
                <span className={`font-medium ${wordCount > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                  {wordCount} palavra{wordCount !== 1 ? 's' : ''}
                </span>
                <span className={`font-medium ${charCount > 0 ? 'text-gray-600' : 'text-gray-400'}`}>
                  {charCount} caractere{charCount !== 1 ? 's' : ''}
                </span>
              </div>
              {wordCount > 0 && wordCount < 10 && (
                <span className="text-amber-600 font-medium">⚠️ Resposta muito curta</span>
              )}
              {wordCount >= 50 && (
                <span className="text-green-600 font-medium">✅ Bom desenvolvimento!</span>
              )}
            </div>
          )}
        </div>

        {/* Botão Enviar */}
        {!disabled && (
          <button
            onClick={handleSubmit}
            disabled={localAnswer.trim().length === 0}
            className={`mt-5 w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${
              localAnswer.trim().length > 0
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
            Enviar Resposta
          </button>
        )}

        {/* Feedback */}
        {feedback && (
          <div className={`mt-5 p-4 rounded-xl border-2 ${
            isCorrect ? 'bg-green-50 border-green-300' :
            isWrong ? 'bg-red-50 border-red-300' :
            'bg-orange-50 border-orange-300'
          }`}>
            <div className="flex items-start gap-3">
              {isCorrect && <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />}
              {isWrong && <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />}
              {isTimeout && <Clock className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />}
              <div className="flex-1">
                <p className={`font-semibold ${
                  isCorrect ? 'text-green-700' :
                  isWrong ? 'text-red-700' :
                  'text-orange-700'
                }`}>
                  {feedback.msg}
                </p>
                {feedback.explanation && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Explicação:</p>
                    <p className="text-sm text-gray-700 mt-1 leading-relaxed">{feedback.explanation}</p>
                    {isWrong && question.resposta_correta && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs font-semibold text-blue-700">Resposta esperada:</p>
                        <p className="text-sm text-blue-800 font-medium mt-0.5">{question.resposta_correta}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ================================================================
// COMPONENTE PRINCIPAL
// ================================================================
export default function Teste() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [phase, setPhase] = useState('select');
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedNivel, setSelectedNivel] = useState('');
  const [selectedTestMode, setSelectedTestMode] = useState('closed');
  const [areaCounts, setAreaCounts] = useState({ matematica: null, programacao: null, ingles: null });
  const [bestPerformances, setBestPerformances] = useState({ matematica: null, programacao: null, ingles: null });

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [questoesRespondidas, setQuestoesRespondidas] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizError, setQuizError] = useState(null);
  const [stoppedEarly, setStoppedEarly] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);

  const [feedback, setFeedback] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [lastEarned, setLastEarned] = useState(0);
  const [showScorePopup, setShowScorePopup] = useState(false);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  const [assistantMsg, setAssistantMsg] = useState('');
  const [userAnswer, setUserAnswer] = useState(''); // 🔥 PARA TEXTAREA

  const timerRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const scorePopupTimerRef = useRef(null);
  const startTimeRef = useRef(null);

  // 🔥 FLAG PARA FORÇAR DISSERTATIVA - Mude para false para desativar
  const FORCAR_DISSERTATIVA = true;

  // -----------------------------------------------------------------
  // Efeitos
  // -----------------------------------------------------------------
  useEffect(() => {
    if (!user) return;

    Object.keys(AREAS).forEach(async (area) => {
      try {
        const res = await fetch(`${API_BASE}/api/questoes/quiz/${area}?limit=20`);
        const json = await res.json();
        if (json.success) setAreaCounts(prev => ({ ...prev, [area]: json.data?.length || 0 }));
      } catch {
        setAreaCounts(prev => ({ ...prev, [area]: 0 }));
      }
    });

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
    setUserAnswer(''); // 🔥 LIMPAR RESPOSTA DO TEXTAREA
    setTimeLeft(TIME_PER_QUESTION);
    setCurrentIdx(prev => {
      const next = prev + 1;
      if (next >= questions.length) {
        saveTestResult();
        setPhase('result');
        return prev;
      }
      return next;
    });
  }, [questions.length, clearMainTimer, clearFeedbackTimer, saveTestResult]);

  const handleTimeout = useCallback(() => {
    if (answered || questoesRespondidas.has(currentIdx)) return;

    setQuestoesRespondidas(prev => new Set([...prev, currentIdx]));

    clearMainTimer();
    setAnswered(true);
    setSelectedOption(null);
    const msg = pickRandom(TIMEOUT_MSGS);
    setFeedback({ type: 'timeout', msg });
    setAssistantMsg(msg);
    setStreak(0);
    setAnswers(prev => [...prev, { idx: currentIdx, selected: null, correct: false, points: 0 }]);

    feedbackTimerRef.current = setTimeout(() => advanceQuestion(), 3000);
  }, [answered, questoesRespondidas, currentIdx, clearMainTimer, advanceQuestion]);

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
  }, [phase, currentIdx, answered, loadingQuiz]);

  useEffect(() => {
    if (phase === 'quiz') startTimeRef.current = Date.now();
    if (phase === 'result' && startTimeRef.current)
      setTotalTime(Math.round((Date.now() - startTimeRef.current) / 1000));
  }, [phase]);

  useEffect(() => () => clearAllTimers(), [clearAllTimers]);

  // -----------------------------------------------------------------
  // Funções principais
  // -----------------------------------------------------------------
  const startQuiz = async (areaKey, nivelKey = selectedNivel, testMode = selectedTestMode) => {
    setSelectedArea(areaKey);
    setLoadingQuiz(true);
    setQuizError(null);
    setQuestions([]);
    setCurrentIdx(0);
    setAnswers([]);
    setQuestoesRespondidas(new Set());
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
    setUserAnswer('');
    setSelectedTestMode(testMode);

    try {
      const nivelParam = nivelKey ? `&dificuldade=${nivelKey}` : '';
      const url = `${API_BASE}/api/questoes/quiz/${areaKey}?limit=10${nivelParam}`;
      console.log('[Teste] Carregando quiz:', { url, areaKey, nivelKey });
      
      const res = await fetch(url);
      const json = await res.json();
      
      console.log('[Teste] Resposta da API:', json);
      
      if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
        const nivelLabel = nivelKey ? ` no nível "${NIVEIS.find(n => n.key === nivelKey)?.label}"` : '';
        setQuizError(`Nenhuma questão disponível para esta área${nivelLabel}. Tenta outro nível ou aguarda o administrador criar questões.`);
        setLoadingQuiz(false);
        setPhase('quiz');
        return;
      }

      // 🔥 MAPEAMENTO DAS QUESTÕES - FORÇANDO DISSERTATIVA
      const questoesMapeadas = json.data.map(q => {
        // 🔥 FORÇAR TIPO DISSERTATIVA SE FLAG ESTIVER ATIVA
        const tipo = FORCAR_DISSERTATIVA ? 'dissertativa' : (q.tipo || 'multiple');
        const isDissertativa = ['dissertativa', 'text', 'essay', 'discursiva'].includes(tipo);
        
        let opcoes = [];
        if (!isDissertativa) {
          opcoes = q.opcoes;
          if (typeof opcoes === 'string') {
            try { opcoes = JSON.parse(opcoes); } catch (e) { opcoes = []; }
          }
          if (!Array.isArray(opcoes)) {
            opcoes = [q.opcao_a, q.opcao_b, q.opcao_c, q.opcao_d].filter(Boolean);
          }
        }
        
        return {
          id: q.id,
          enunciado: q.enunciado || q.texto_pergunta || 'Questão sem enunciado',
          contexto: q.contexto || q.texto_contexto || '',
          resposta_correta: (q.resposta_correta || q.respostaCorreta || '').toString().trim(),
          pontos: q.pontos || 10,
          dificuldade: q.dificuldade || 'medio',
          tipo: tipo, // 🔥 TIPO FORÇADO PARA DISSERTATIVA
          dica: q.dica || (tipo === 'dissertativa' ? 'Elabore uma resposta completa e bem estruturada.' : ''),
          explicacao: q.explicacao || '',
          opcoes: opcoes
        };
      });

      console.log('[🔥 FORÇADO] Questões com tipo:', questoesMapeadas.map(q => q.tipo));
      setQuestions(questoesMapeadas);
      setPhase('quiz');
    } catch (err) {
      console.error('[Teste] Erro ao carregar questões:', err);
      setQuizError('Erro ao carregar questões. Verifica a ligação ao servidor.');
      setPhase('quiz');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleStopQuiz = () => {
    setShowStopModal(true);
  };

  const confirmStopQuiz = useCallback(() => {
    clearAllTimers();
    setShowStopModal(false);
    setStoppedEarly(true);
    saveTestResult();
    setPhase('result');
  }, [clearAllTimers, saveTestResult]);

  // 🔥 HANDLE ANSWER MODIFICADO PARA ACEITAR STRING DO TEXTAREA
  const handleAnswer = useCallback((resposta) => {
    if (answered || feedback || questoesRespondidas.has(currentIdx)) return;
    
    if (!resposta || resposta.trim().length === 0) {
      return;
    }

    setQuestoesRespondidas(prev => new Set([...prev, currentIdx]));

    clearMainTimer();
    setAnswered(true);
    setSelectedOption(resposta);

    const q = questions[currentIdx];
    
    // 🔥 COMPARAÇÃO DIRETA - Pode ser ajustada para comparação mais inteligente
    const isCorrect = resposta.trim().toLowerCase() === q.resposta_correta.trim().toLowerCase();

    const timeBonus = Math.max(0, timeLeft - 10);
    const earned = isCorrect ? (q.pontos || 10) + Math.floor(timeBonus / 4) : 0;
    const earnedXp = isCorrect ? 15 + Math.floor(timeBonus / 6) : 2;
    const newStreak = isCorrect ? streak + 1 : 0;

    setScore(prev => prev + earned);
    setXp(prev => prev + earnedXp);
    setStreak(newStreak);
    setBestStreak(prev => Math.max(prev, newStreak));
    setAnswers(prev => [...prev, { 
      idx: currentIdx, 
      selected: resposta, 
      correct: isCorrect, 
      points: earned 
    }]);

    const msg = isCorrect ? pickRandom(CORRECT_MSGS) : pickRandom(WRONG_MSGS);
    setFeedback({
      type: isCorrect ? 'correct' : 'wrong',
      msg,
      explanation: q.explicacao || (isCorrect ? 'Ótima resposta! Demonstrou bom conhecimento.' : `Resposta esperada: ${q.resposta_correta}`)
    });
    setAssistantMsg(msg);

    if (isCorrect && earned > 0) {
      setLastEarned(earned);
      setShowScorePopup(true);
      if (scorePopupTimerRef.current) clearTimeout(scorePopupTimerRef.current);
      scorePopupTimerRef.current = setTimeout(() => setShowScorePopup(false), 2000);
    }

    clearFeedbackTimer();
    feedbackTimerRef.current = setTimeout(() => advanceQuestion(), 3500);
  }, [answered, feedback, questoesRespondidas, questions, currentIdx, timeLeft, streak, clearMainTimer, clearFeedbackTimer, advanceQuestion]);

  // -----------------------------------------------------------------
  // Renderização - SELECT
  // -----------------------------------------------------------------
  if (phase === 'select') {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto w-full px-6 py-8">

          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-3">
              Testa o teu Conhecimento
            </h1>
            <p className="text-base text-gray-600 max-w-xl mx-auto">
              Olá, <span className="font-semibold text-blue-600">{user.nome || user.name || 'Competidor'}</span>!
              Escolhe uma área e mostra o que sabes com respostas dissertativas.
            </p>
            {FORCAR_DISSERTATIVA && (
              <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-purple-100 border border-purple-300 rounded-full">
                <span className="text-purple-700 text-sm font-semibold">📝 Modo Dissertativo Ativo</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="text-sm font-semibold text-slate-600">Nível de dificuldade:</span>
            <div className="flex gap-2 flex-wrap justify-center">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {Object.values(AREAS).map((area) => {
              const count = areaCounts[area.key];
              const bestPct = bestPerformances[area.key];
              const { Icon } = area;
              const nivelLabel = NIVEIS.find(n => n.key === selectedNivel)?.label;
              return (
                <div
                  key={area.key}
                  onClick={() => startQuiz(area.key, selectedNivel, selectedTestMode)}
                  className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${area.badge}`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 mb-2">{area.title}</h3>
                  <p className="text-sm text-gray-600 mb-5 leading-relaxed">{area.description}</p>

                  {bestPct !== null ? (
                    <div className="mb-4">
                      <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 rounded-full px-3 py-1.5 text-xs font-semibold">
                        <Trophy className="w-3 h-3" /> Melhor: {bestPct}%
                      </span>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 rounded-full px-3 py-1.5 text-xs font-semibold">
                        <Award className="w-3 h-3" /> Não iniciado
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs text-gray-400">
                      {count === null ? 'A carregar...' : count === 0 ? 'Sem questões' : `${count} questões`}
                    </span>
                    <span className="text-xs text-gray-400">60s / questão</span>
                  </div>

                  <button className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${area.btnGradient} text-white font-semibold text-sm hover:opacity-90 transition`}>
                    {selectedNivel ? `Iniciar · ${nivelLabel} →` : 'Iniciar →'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-slate-800 text-center mb-6">Como funciona o Modo Dissertativo</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              {[
                { Icon: Edit3, label: 'Resposta Livre', color: 'text-blue-600', bg: 'bg-blue-50' },
                { Icon: Clock, label: '60s por questão', color: 'text-green-600', bg: 'bg-green-50' },
                { Icon: Target, label: 'Correção inteligente', color: 'text-purple-600', bg: 'bg-purple-50' },
                { Icon: Zap, label: 'Bónus por tempo', color: 'text-yellow-600', bg: 'bg-yellow-50' },
                { Icon: Trophy, label: 'XP e pontuação', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { Icon: Send, label: 'Envio manual', color: 'text-red-600', bg: 'bg-red-50' },
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

  // -----------------------------------------------------------------
  // Renderização - QUIZ
  // -----------------------------------------------------------------
  if (phase === 'quiz') {
    const area = AREAS[selectedArea] || AREAS.matematica;
    const { Icon } = area;
    const q = questions[currentIdx];
    const totalQ = questions.length;
    const correctCount = answers.filter(a => a.correct).length;

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

    if (!q || questions.length === 0) {
      return (
        <Layout>
          <div className="max-w-7xl mx-auto w-full px-6 py-16 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-700 font-semibold">A preparar quiz...</p>
              <p className="text-sm text-gray-400 mt-1">{area.title}</p>
            </div>
          </div>
        </Layout>
      );
    }

    return (
      <Layout>
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
          <div className="max-w-3xl mx-auto">

            <StopConfirmModal
              isOpen={showStopModal}
              onConfirm={confirmStopQuiz}
              onCancel={() => setShowStopModal(false)}
              score={score}
              answered={answers.length}
            />

            {/* Top Bar */}
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => { clearAllTimers(); setPhase('select'); }}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-slate-800 font-medium transition"
              >
                <ChevronLeft className="w-4 h-4" /> Sair
              </button>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <NivelSelector value={selectedNivel} onChange={(v) => startQuiz(selectedArea, v)} />
                {streak > 1 && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
                    <Flame className="w-3 h-3" /> {streak}x
                  </span>
                )}
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> {xp} XP
                </span>
                <div className="relative">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                    <Trophy className="w-3 h-3" /> {score} pts
                  </span>
                  <ScorePopup points={lastEarned} visible={showScorePopup} />
                </div>
                <button
                  onClick={handleStopQuiz}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold hover:bg-orange-200 transition"
                >
                  <Square className="w-3 h-3" /> Parar
                </button>
              </div>
            </div>

            {/* Progresso */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">
                  Questão <span className="font-bold text-slate-800">{currentIdx + 1}</span> de <span className="font-bold text-slate-800">{totalQ}</span>
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${area.badge}`}>
                  {area.title}
                </span>
              </div>
              <ProgressBar current={currentIdx + 1} total={totalQ} />
            </div>

            {/* 🔥 QUESTÃO DISSERTATIVA - SEMPRE TEXTAREA */}
            <div className="mb-6">
              <QuestionCardDissertativa
                question={q}
                index={currentIdx}
                total={totalQ}
                onAnswer={handleAnswer}
                disabled={answered}
                feedback={feedback}
                timeLeft={timeLeft}
                userAnswer={userAnswer}
                onAnswerChange={setUserAnswer}
              />
            </div>

            {/* Assistant Message */}
            {assistantMsg && answered && (
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-slate-600" />
                </div>
                <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-tl-none px-4 py-2.5 text-sm text-slate-700 font-medium max-w-xs">
                  {assistantMsg}
                </div>
              </div>
            )}

            {/* Navegação entre questões */}
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
                    setUserAnswer('');
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
                    setUserAnswer('');
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
                  <>✓ Terminar</>
                ) : (
                  <>Próxima <ChevronLeft className="w-4 h-4 rotate-180" /></>
                )}
              </button>
            </div>

            {/* Grid de Progresso das Questões */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-4 mb-4">
              <p className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">Progresso das questões</p>
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
                          setUserAnswer('');
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
                        isCurrent ? 'Questão atual' :
                        isAnswered ? (isCorrect ? 'Respondida (Correto)' : 'Respondida (Errado)') :
                        'Não respondida'
                      }
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
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
                <p className="text-xs text-yellow-600 font-semibold uppercase tracking-wide">Sequência</p>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-700 mt-1 flex items-center gap-1">{streak}<Flame className="w-5 h-5" /></p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide">XP</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-700 mt-1">+{xp}</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // -----------------------------------------------------------------
  // Renderização - RESULTADO
  // -----------------------------------------------------------------
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

// ---------------------------------------------------------------------
// Componente Lightbulb (para a dica)
// ---------------------------------------------------------------------
function Lightbulb(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9.663 17h4.674M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}