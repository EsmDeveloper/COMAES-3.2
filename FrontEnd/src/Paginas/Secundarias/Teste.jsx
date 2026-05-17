// src/pages/Teste.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import {
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  SkipForward,
  AlertCircle,
  WifiOff,
  Trophy,
  Zap,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuiz } from '../../hooks/useQuiz';
import { QuestionCard } from '../../components/components_teste/questioncard';
import { ResultScreen } from '../../components/components_teste/resultscreen';
import { TutorMessage } from '../../components/components_teste/tutormessage';
import { LoadingScreen } from '../../components/components_teste/loadingscreen';

/* --------------------------------------------------------------- */
/* Configuração das áreas (design aprimorado)                     */
/* --------------------------------------------------------------- */
const areas = {
  matematica: {
    title: 'Matemática',
    icon: '🧮',
    gradient: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-50 to-indigo-50',
    accent: '#3B82F6',
    description: 'Álgebra, geometria, estatística e raciocínio lógico.',
    badge: '🔢 10 questões',
  },
  programacao: {
    title: 'Programação',
    icon: '💻',
    gradient: 'from-emerald-500 to-emerald-600',
    bgGradient: 'from-emerald-50 to-teal-50',
    accent: '#10B981',
    description: 'Lógica, algoritmos, JS, Python e estruturas de dados.',
    badge: '🐍 10 questões',
  },
  ingles: {
    title: 'Inglês',
    icon: '🇬🇧',
    gradient: 'from-violet-500 to-violet-600',
    bgGradient: 'from-violet-50 to-purple-50',
    accent: '#8B5CF6',
    description: 'Vocabulário, gramática, interpretação de textos.',
    badge: '📖 10 questões',
  },
};

/* --------------------------------------------------------------- */
/* Componente Principal                                           */
/* --------------------------------------------------------------- */
export default function Teste() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Estados locais
  const [selectedArea, setSelectedArea] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [skipConfirmOpen, setSkipConfirmOpen] = useState(false);
  const questionCardRef = useRef(null);

  // Hook customizado do quiz (configurações robustas)
  const quiz = useQuiz(selectedArea, {
    autoLoad: true,
    feedbackDuration: 1800,
    defaultTimePerQuestion: 30,
    openAnswerThreshold: 7,
  });

  /* ----------------------------------------------------------- */
  /* Redirecionamento se não autenticado (imediato)             */
  /* ----------------------------------------------------------- */
  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true });
  }, [user, loading, navigate]);

  /* ----------------------------------------------------------- */
  /* Monitoramento de conexão (offline)                         */
  /* ----------------------------------------------------------- */
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /* ----------------------------------------------------------- */
  /* Confirmação de saída (evita perda de progresso)            */
  /* ----------------------------------------------------------- */
  useEffect(() => {
    if (!quiz.quizFinished && selectedArea && !quiz.loading && quiz.questions.length > 0) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = 'Seu progresso será perdido. Tem certeza?';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [quiz.quizFinished, selectedArea, quiz.loading, quiz.questions.length]);

  /* ----------------------------------------------------------- */
  /* Estado do tutor (mais granular)                            */
  /* ----------------------------------------------------------- */
  const [tutorStep, setTutorStep] = useState('idle');
  useEffect(() => {
    if (quiz.quizFinished) setTutorStep('finished');
    else if (quiz.showFeedback) setTutorStep(quiz.showFeedback.type === 'correct' ? 'correct' : 'incorrect');
    else if (quiz.timeLeft === 0 && !quiz.showFeedback) setTutorStep('timeout');
    else setTutorStep('idle');
  }, [quiz.quizFinished, quiz.showFeedback, quiz.timeLeft]);

  /* ----------------------------------------------------------- */
  /* Handlers                                                    */
  /* ----------------------------------------------------------- */
  const handleAreaSelect = useCallback((areaKey) => {
    setSelectedArea(areaKey);
  }, []);

  const handleSkipQuestion = useCallback(() => {
    if (quiz.showFeedback) return;
    const currentQ = quiz.currentQuestion;
    if (currentQ && !quiz.answers.some(a => a.questionId === currentQ.id)) {
      quiz.handleAnswer(undefined, '');
      setSkipConfirmOpen(false);
    }
  }, [quiz]);

  const handleNewArea = useCallback(() => {
    quiz.resetQuiz();
    setSelectedArea(null);
  }, [quiz]);

  const handleRetrySameArea = useCallback(() => {
    quiz.load(selectedArea);
  }, [quiz, selectedArea]);

  /* ----------------------------------------------------------- */
  /* Keyboard shortcuts (← → S)                                 */
  /* ----------------------------------------------------------- */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' && !quiz.showFeedback && !quiz.quizFinished && quiz.currentQuestion) {
        e.preventDefault();
        const hasAnswer = quiz.answers.some(a => a.questionId === quiz.currentQuestion?.id);
        if (hasAnswer) quiz.goNext();
      }
      if (e.key === 'ArrowLeft' && !quiz.quizFinished && quiz.currentIdx > 0) {
        e.preventDefault();
        quiz.goPrev();
      }
      if (e.key === 's' && !quiz.showFeedback && !quiz.quizFinished && quiz.currentQuestion) {
        e.preventDefault();
        const hasAnswer = quiz.answers.some(a => a.questionId === quiz.currentQuestion?.id);
        if (!hasAnswer) handleSkipQuestion();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quiz, handleSkipQuestion]);

  /* ----------------------------------------------------------- */
  /* Renderizações condicionais (design refinado)               */
  /* ----------------------------------------------------------- */
  if (loading) {
    return (
      <Layout>
        <LoadingScreen areaTitle="Carregando usuário..." gradient="from-slate-300 to-slate-400" />
      </Layout>
    );
  }

  if (!user) return null; // já redireciona

  // ---------- TELA DE SELEÇÃO DE ÁREA (design moderno) ----------
  if (!selectedArea) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
                <Zap className="h-8 w-8 text-indigo-600" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
                Teste seus conhecimentos
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Escolha uma área e desafie-se com 10 questões dinâmicas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.entries(areas).map(([key, area]) => (
                <div
                  key={key}
                  onClick={() => handleAreaSelect(key)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAreaSelect(key)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Iniciar teste de ${area.title}`}
                  className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${area.gradient}`} />
                  <div className="p-6 text-center">
                    <div className="text-6xl mb-4 transition-transform duration-300 group-hover:scale-110">
                      {area.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{area.title}</h3>
                    <p className="text-gray-500 text-sm mb-4">{area.description}</p>
                    <div className="flex justify-center gap-3 text-xs text-gray-400 mb-6">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 30s/questão</span>
                      <span className="flex items-center gap-1"><Trophy className="h-3 w-3" /> até 100 pts</span>
                    </div>
                    <button
                      className={`w-full py-2.5 bg-gradient-to-r ${area.gradient} text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-md group-hover:shadow-lg flex items-center justify-center gap-2`}
                    >
                      Começar <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12 text-gray-500 text-sm">
              Olá, <span className="font-semibold text-gray-700">{user.fullName || user.username}</span>! Boa sorte 🍀
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const areaInfo = areas[selectedArea];
  const currentQ = quiz.currentQuestion;

  // ---------- OFFLINE ----------
  if (!isOnline) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md animate-fadeInUp">
            <WifiOff className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Sem conexão</h2>
            <p className="text-gray-600 mb-6">Verifique sua internet e tente novamente.</p>
            <button
              onClick={() => quiz.load(selectedArea)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // ---------- LOADING (skeleton aprimorado) ----------
  if (quiz.loading) {
    return (
      <Layout>
        <LoadingScreen areaTitle={areaInfo.title} gradient={areaInfo.gradient} />
      </Layout>
    );
  }

  // ---------- ERRO (design amigável) ----------
  if (quiz.error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center animate-fadeInUp">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Ops! Algo deu errado</h2>
            <p className="text-gray-600 mb-6">{quiz.error}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={handleRetrySameArea} className="px-5 py-2 bg-indigo-600 text-white rounded-xl flex items-center gap-2 hover:bg-indigo-700">
                <RefreshCw className="h-4 w-4" /> Tentar novamente
              </button>
              <button onClick={handleNewArea} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">
                ← Mudar área
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ---------- QUIZ FINALIZADO (ResultScreen aprimorado) ----------
  if (quiz.quizFinished) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-6 flex items-center justify-center">
          <ResultScreen
            totalScore={quiz.totalScore}
            maxScore={quiz.maxScore}
            percent={quiz.percent}
            correct={quiz.correctCount}
            wrong={quiz.wrongCount}
            totalQuestions={quiz.questions.length}
            classification={quiz.classification}
            onRestart={handleRetrySameArea}
            onNewArea={handleNewArea}
          />
        </div>
      </Layout>
    );
  }

  // ---------- QUESTÃO ATIVA (design com animações e acessibilidade) ----------
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Tutor com animação */}
          <TutorMessage
            step={tutorStep}
            feedback={quiz.showFeedback}
            timeLeft={quiz.timeLeft}
          />

          {/* Barra de progresso moderna */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm mb-6 border border-white/30">
            <div className="flex flex-wrap justify-between items-center gap-2 text-sm text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs">{areaInfo.title}</span>
                <span>Questão {quiz.currentIdx + 1} / {quiz.questions.length}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1 font-mono ${quiz.timeLeft <= 5 ? 'text-red-600 animate-pulse' : ''}`}>
                  <Clock className="h-4 w-4" />
                  <span className="font-bold">{quiz.timeLeft}s</span>
                </div>
                <div className="hidden md:flex text-xs text-gray-400 gap-2">
                  <span>←/→ navegar</span>
                  <span>|</span>
                  <span>S pular</span>
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
                style={{ width: `${(quiz.currentIdx / quiz.questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Pergunta com animação de entrada */}
          <div key={quiz.currentIdx} className="animate-fadeInUp">
            {currentQ && (
              <QuestionCard
                ref={questionCardRef}
                question={currentQ}
                index={quiz.currentIdx}
                total={quiz.questions.length}
                onAnswer={quiz.handleAnswer}
                disabled={quiz.showFeedback !== null}
                feedback={quiz.showFeedback}
                autoFocus={true}
              />
            )}
          </div>

          {/* Botões de navegação com micro-interações */}
          <div className="flex flex-wrap justify-between gap-3 mt-8">
            <button
              onClick={quiz.goPrev}
              disabled={quiz.currentIdx === 0 || quiz.showFeedback !== null}
              className={`px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all duration-200 ${
                quiz.currentIdx !== 0 && quiz.showFeedback === null
                  ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-md transform hover:-translate-y-0.5'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ArrowLeft className="h-5 w-5" /> Voltar
            </button>

            <div className="flex gap-3">
              {!quiz.answers.some(a => a.questionId === currentQ?.id) && (
                <button
                  onClick={() => setSkipConfirmOpen(true)}
                  disabled={quiz.showFeedback !== null}
                  className="px-4 py-2.5 bg-amber-50 text-amber-700 rounded-xl flex items-center gap-2 hover:bg-amber-100 transition-all hover:scale-105 active:scale-95"
                  title="Pular questão (não pontua)"
                >
                  <SkipForward className="h-4 w-4" /> Pular
                </button>
              )}

              <button
                onClick={quiz.goNext}
                disabled={quiz.showFeedback !== null}
                className={`px-6 py-2.5 rounded-xl flex items-center gap-2 font-semibold transition-all duration-200 ${
                  quiz.showFeedback === null
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {quiz.currentIdx === quiz.questions.length - 1 ? 'Finalizar' : 'Próxima'}
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Modal de confirmação para pular */}
          {skipConfirmOpen && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl transform transition-all">
                <h3 className="text-xl font-bold mb-2">Pular questão?</h3>
                <p className="text-gray-600 mb-6">Você não receberá pontos por esta questão. Deseja continuar?</p>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setSkipConfirmOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    Cancelar
                  </button>
                  <button onClick={handleSkipQuestion} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition">
                    Sim, pular
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

/* Adicione estas animações globais no seu CSS (ex: index.css) */
/* 
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeInUp { animation: fadeInUp 0.3s ease-out; }

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fadeIn { animation: fadeIn 0.2s ease-out; }
*/