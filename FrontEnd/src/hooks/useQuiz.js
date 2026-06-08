// src/hooks/useQuiz.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { evaluateOpenAnswer } from '../utils/evaluation';

export const useQuiz = (areaKey, options = {}) => {
  const {
    autoLoad = true,
    openAnswerThreshold = 7,
    feedbackDuration = 1500,
    defaultTimePerQuestion = 30,
    questionLimit = 10,
  } = options;

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(defaultTimePerQuestion);
  const [showFeedback, setShowFeedback] = useState(null);

  const timerRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const navigationLockRef = useRef(false);
  const isMountedRef = useRef(true);
  const questionTimeRef = useRef({});
  const abortControllerRef = useRef(null);

  const clearAllTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    timerRef.current = null;
    feedbackTimerRef.current = null;
  }, []);

  const cancelFetch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const load = useCallback(async (area) => {
    if (!area) return;
    cancelFetch();
    setLoading(true);
    setError(null);
    clearAllTimers();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`;
      const resp = await fetch(`${apiBase}/api/questoes/quiz/${area}?limit=${questionLimit}`, {
        signal: controller.signal,
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();
      if (!json.success) throw new Error(json.error ?? 'Falha ao obter questÃµes');
      if (!Array.isArray(json.data)) throw new Error('Dados invÃ¡lidos');

      const processed = json.data.map((q, i) => ({
        id: q.id ?? `${area}-${i}`,
        questao: q.questao,
        tipo: q.tipo ?? 'multiple',
        opcoes: Array.isArray(q.opcoes) ? q.opcoes : [],
        respostaCorreta: q.respostaCorreta,
        respostaAberta: q.respostaAberta,
        palavrasChave: Array.isArray(q.palavrasChave) ? q.palavrasChave : [],
        peso: typeof q.peso === 'number' ? q.peso : 1,
        dificuldade: q.dificuldade ?? 'facil',
      }));

      if (isMountedRef.current) {
        setQuestions(processed);
        setCurrentIdx(0);
        setAnswers([]);
        setQuizFinished(false);
        setTimeLeft(defaultTimePerQuestion);
        setShowFeedback(null);
        questionTimeRef.current = Object.fromEntries(processed.map(q => [q.id, defaultTimePerQuestion]));
        localStorage.removeItem(`quiz_${area}_state`);
      }
    } catch (e) {
      if (e.name !== 'AbortError' && isMountedRef.current) {
        setError(e.message ?? 'Erro desconhecido');
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
      abortControllerRef.current = null;
    }
  }, [questionLimit, cancelFetch, clearAllTimers, defaultTimePerQuestion]);

  useEffect(() => {
    if (autoLoad && areaKey) load(areaKey);
    return () => cancelFetch();
  }, [areaKey, autoLoad, load, cancelFetch]);

  // Restaurar progresso
  useEffect(() => {
    if (!areaKey || questions.length === 0) return;
    const saved = localStorage.getItem(`quiz_${areaKey}_state`);
    if (saved) {
      try {
        const { currentIdx: savedIdx, answers: savedAnswers } = JSON.parse(saved);
        if (Number.isInteger(savedIdx) && savedIdx >= 0 && savedIdx < questions.length) {
          setCurrentIdx(savedIdx);
          setAnswers(savedAnswers);
          const currentQ = questions[savedIdx];
          if (currentQ) {
            const savedTime = questionTimeRef.current[currentQ.id];
            setTimeLeft(savedTime !== undefined ? savedTime : defaultTimePerQuestion);
          }
        }
      } catch (e) { console.error(e); }
    }
  }, [areaKey, questions, defaultTimePerQuestion]);

  // Persistir progresso
  useEffect(() => {
    if (!areaKey || questions.length === 0 || quizFinished) return;
    localStorage.setItem(`quiz_${areaKey}_state`, JSON.stringify({ currentIdx, answers }));
  }, [areaKey, currentIdx, answers, questions.length, quizFinished]);

  // Timer principal
  useEffect(() => {
    if (quizFinished || loading || showFeedback || !questions.length) return;
    if (timeLeft <= 0) {
      const currentQuestion = questions[currentIdx];
      if (currentQuestion && !answers.some(a => a.questionId === currentQuestion.id)) {
        handleTimeout();
      }
      return;
    }
    timerRef.current = setTimeout(() => {
      if (isMountedRef.current) setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timeLeft, quizFinished, loading, showFeedback, questions, currentIdx, answers]);

  // goNext definido antes de handleTimeout
  const goNext = useCallback((isAuto = false) => {
    if (navigationLockRef.current || quizFinished) return;
    const currentQ = questions[currentIdx];
    if (currentQ && !isAuto && !answers.some(a => a.questionId === currentQ.id)) return;

    navigationLockRef.current = true;
    if (currentQ) questionTimeRef.current[currentQ.id] = timeLeft;

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      const nextQ = questions[currentIdx + 1];
      const savedTime = nextQ ? questionTimeRef.current[nextQ.id] : undefined;
      setTimeLeft(savedTime ?? defaultTimePerQuestion);
    } else {
      setQuizFinished(true);
      clearAllTimers();
    }
    setShowFeedback(null);
    navigationLockRef.current = false;
  }, [currentIdx, questions, quizFinished, answers, timeLeft, defaultTimePerQuestion, clearAllTimers]);

  const handleTimeout = useCallback(() => {
    const q = questions[currentIdx];
    if (!q || answers.some(a => a.questionId === q.id)) return;
    const timeoutAnswer = {
      questionId: q.id,
      tipo: q.tipo,
      correta: false,
      score: 0,
      ...(q.tipo === 'open' ? { texto: '(tempo esgotado)' } : { selecionada: undefined }),
    };
    setAnswers(prev => [...prev, timeoutAnswer]);
    setShowFeedback({ type: 'incorrect', score: 0 });
    feedbackTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setShowFeedback(null);
        goNext(true);
      }
    }, feedbackDuration);
  }, [currentIdx, questions, answers, feedbackDuration, goNext]);

  const saveAnswer = useCallback((newAnswer) => {
    setAnswers(prev => {
      const idx = prev.findIndex(a => a.questionId === newAnswer.questionId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = newAnswer;
        return updated;
      }
      return [...prev, newAnswer];
    });
  }, []);

  const handleAnswer = useCallback((selecionada, textoAberto) => {
    if (quizFinished || loading || showFeedback) return;
    const q = questions[currentIdx];
    if (!q) return;

    const alreadyAnswered = answers.some(a => a.questionId === q.id);
    let novaResposta;

    if (q.tipo === 'open') {
      const respostaTexto = (textoAberto ?? '').trim();
      const { score } = evaluateOpenAnswer(respostaTexto, q.respostaAberta ?? '', q.palavrasChave ?? []);
      const correta = score >= openAnswerThreshold;
      novaResposta = { questionId: q.id, tipo: q.tipo, texto: respostaTexto, score, correta };
    } else {
      const correta = selecionada === q.respostaCorreta;
      const score = correta ? 10 * (q.peso ?? 1) : 0;
      novaResposta = { questionId: q.id, tipo: q.tipo, selecionada, correta, score };
    }

    saveAnswer(novaResposta);
    setShowFeedback({ type: novaResposta.correta ? 'correct' : 'incorrect', score: novaResposta.score });
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);

    if (!alreadyAnswered) {
      feedbackTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setShowFeedback(null);
          goNext(true);
        }
      }, feedbackDuration);
    } else {
      feedbackTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) setShowFeedback(null);
      }, feedbackDuration);
    }
  }, [currentIdx, questions, quizFinished, loading, showFeedback, answers, saveAnswer, openAnswerThreshold, feedbackDuration, goNext]);

  const goPrev = useCallback(() => {
    if (navigationLockRef.current || quizFinished || currentIdx <= 0) return;
    navigationLockRef.current = true;
    const currentQ = questions[currentIdx];
    if (currentQ) questionTimeRef.current[currentQ.id] = timeLeft;

    setCurrentIdx(prev => prev - 1);
    const prevQ = questions[currentIdx - 1];
    const savedTime = prevQ ? questionTimeRef.current[prevQ.id] : undefined;
    setTimeLeft(savedTime ?? defaultTimePerQuestion);
    setShowFeedback(null);
    navigationLockRef.current = false;
  }, [currentIdx, questions, quizFinished, timeLeft, defaultTimePerQuestion]);

  const clearFeedback = useCallback(() => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setShowFeedback(null);
  }, []);

  const resetQuiz = useCallback(() => {
    clearAllTimers();
    cancelFetch();
    setCurrentIdx(0);
    setAnswers([]);
    setQuizFinished(false);
    setTimeLeft(defaultTimePerQuestion);
    setShowFeedback(null);
    questionTimeRef.current = {};
    if (areaKey) load(areaKey);
    else setQuestions([]);
  }, [clearAllTimers, cancelFetch, defaultTimePerQuestion, areaKey, load]);

  const totalScore = answers.reduce((acc, a) => acc + (a.score ?? 0), 0);
  const maxScore = questions.reduce((acc, q) => acc + 10 * (q.peso ?? 1), 0);
  const percent = maxScore ? Math.round((totalScore / maxScore) * 100) : 0;
  const correctCount = answers.filter(a => a.correta === true).length;
  const wrongCount = answers.filter(a => a.correta === false).length;
  const classification = percent >= 90 ? 'AvanÃ§ado' : percent >= 70 ? 'IntermediÃ¡rio' : percent >= 50 ? 'Iniciante' : 'Iniciante (continuaÃ§Ã£o)';

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearAllTimers();
      cancelFetch();
    };
  }, [clearAllTimers, cancelFetch]);

  const hasAnswered = currentIdx < questions.length ? answers.some(a => a.questionId === questions[currentIdx]?.id) : false;
  const isLastQuestion = currentIdx === questions.length - 1 && questions.length > 0;
  const progress = questions.length ? (currentIdx / questions.length) * 100 : 0;

  return {
    questions,
    currentIdx,
    currentQuestion: questions[currentIdx],
    answers,
    loading,
    error,
    quizFinished,
    timeLeft,
    totalScore,
    maxScore,
    percent,
    correctCount,
    wrongCount,
    classification,
    load,
    resetQuiz,
    handleAnswer,
    goNext,
    goPrev,
    showFeedback,
    clearFeedback,
    hasAnswered,
    isLastQuestion,
    progress,
  };
};

