// src/components/TutorMessage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Brain, Sparkles, Zap, Lightbulb, AlertCircle, ThumbsUp, Clock, TrendingUp } from 'lucide-react';

// ============================================================
// Banco de mensagens personalizadas por personalidade
// ============================================================
const messageTemplates = {
  enthusiastic: {
    idle: [
      "✨ Olá! Sou sua assistente IA. Vamos arrasar nesse teste?",
      "🚀 Preparado? Estou aqui para te apoiar! Vamos nessa!",
      "🎯 Foco total! Você consegue, acredito em você!"
    ],
    correct: [
      "🎉 Uhuuul! Acertou! Show de bola!",
      "🔥 Mandou bem demais! Continue assim!",
      "⭐ Perfeito! Você está dominando o assunto!"
    ],
    incorrect: [
      "😅 Quase! Vamos revisar esse tópico juntos.",
      "🧐 Errou? Sem problemas! É assim que se aprende.",
      "💪 Não desanime! A próxima você acerta!"
    ],
    timeout: [
      "⏰ Tempo esgotado! Na próxima, tente responder mais rápido.",
      "⌛ O tempo voou! Treine agilidade com exercícios."
    ],
    finished: [
      "🏆 Parabéns por completar o teste! Veja seu resultado abaixo.",
      "🎬 Fim da jornada! Que tal revisar as questões que errou?"
    ]
  },
  serious: {
    idle: [
      "Inicie o teste quando estiver preparado.",
      "Mantenha o foco. Cada questão tem 30 segundos."
    ],
    correct: ["Correto. Continue assim.", "Resposta certa. Prossiga."],
    incorrect: [
      "Incorreto. Reveja o conteúdo.", 
      "Resposta errada. Estude mais esse tópico."
    ],
    timeout: ["Tempo limite atingido. Resposta considerada incorreta."],
    finished: ["Teste concluído. Analise seu desempenho."]
  },
  motivational: {
    idle: [
      "💪 Você é capaz! Vamos mostrar seu potencial.",
      "🌟 Cada acerto te deixa mais perto do sucesso!"
    ],
    correct: [
      "Isso aí! Mais um passo rumo à maestria.",
      "Você está melhorando a cada questão! Acredite."
    ],
    incorrect: [
      "Errar faz parte. A lição fica mais forte agora.",
      "Não foi dessa vez, mas a persistência vence."
    ],
    timeout: [
      "O tempo é um desafio. Treine com cronômetro para ganhar agilidade."
    ],
    finished: [
      "Você completou mais uma etapa. O importante é evoluir sempre!"
    ]
  }
};

// ============================================================
// Componente principal
// ============================================================
export const TutorMessage = ({
  step = 'idle',
  feedback = null,
  timeLeft = 30,
  personality = 'enthusiastic',
  correctCount = 0,
  totalQuestions = 10,
  showThinking = true,
  onMessageComplete = null,
}) => {
  const [message, setMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [expression, setExpression] = useState('🤖');

  // Seleciona mensagem aleatória do banco
  const getRandomMessage = (category) => {
    const templates = messageTemplates[personality]?.[category];
    if (!templates || templates.length === 0) return '';
    return templates[Math.floor(Math.random() * templates.length)];
  };

  // Gera mensagem contextual com base no estado atual
  const generateMessage = () => {
    let baseMsg = '';
    let newExpression = '🤖';

    switch (step) {
      case 'idle':
        baseMsg = getRandomMessage('idle');
        newExpression = '😊';
        break;
      case 'answering':
        baseMsg = showThinking ? '🤔 Analisando sua resposta...' : 'Processando...';
        newExpression = '🤔';
        break;
      case 'correct':
        baseMsg = getRandomMessage('correct');
        if (feedback?.score === 10) baseMsg += ' 🎯 Pontuação máxima!';
        newExpression = '🎉';
        break;
      case 'incorrect':
        baseMsg = getRandomMessage('incorrect');
        newExpression = '😅';
        break;
      case 'timeout':
        baseMsg = getRandomMessage('timeout');
        newExpression = '⏰';
        break;
      case 'next':
        baseMsg = `⏩ Vamos para a próxima! ${getRandomMessage('idle')}`;
        newExpression = '😊';
        break;
      case 'finished':
        const percent = totalQuestions ? (correctCount / totalQuestions) * 100 : 0;
        if (percent >= 70) baseMsg = `🏅 Excelente! ${getRandomMessage('finished')}`;
        else if (percent >= 50) baseMsg = `👍 Bom trabalho! ${getRandomMessage('finished')}`;
        else baseMsg = `📚 Continue praticando! ${getRandomMessage('finished')}`;
        newExpression = correctCount > totalQuestions / 2 ? '🎉' : '😊';
        break;
      default:
        baseMsg = getRandomMessage('idle');
    }

    // Adiciona feedback específico se existir (para correção/erro)
    if (feedback && step !== 'correct' && step !== 'incorrect') {
      if (feedback.type === 'correct') baseMsg += ` ✅ Correta! (+${feedback.score} pts)`;
      else baseMsg += ` ❌ Incorreta. O importante é aprender.`;
    }

    // Se timeLeft baixo e ainda não respondeu, dar alerta
    if (step === 'idle' && timeLeft <= 5) {
      baseMsg = `⚠️ Atenção: faltam ${timeLeft} segundos! Responda logo.`;
      newExpression = '⏰';
    }

    // Dica ocasional baseada em acertos/erros (apenas idle)
    if (step === 'idle' && Math.random() < 0.3 && correctCount > 0 && totalQuestions) {
      const accuracy = correctCount / (correctCount + (totalQuestions - correctCount));
      if (accuracy < 0.5) {
        baseMsg += ' 💡 Dica: revise os conceitos básicos da matéria.';
      } else if (accuracy > 0.8) {
        baseMsg += ' 🚀 Você está indo muito bem! Continue assim.';
      }
    }

    setExpression(newExpression);
    return baseMsg;
  };

  // Simula um pequeno delay de "pensamento" para parecer IA
  useEffect(() => {
    if (step === 'answering' && showThinking) {
      setIsThinking(true);
      setMessage('🤔...');
      const timer = setTimeout(() => {
        setIsThinking(false);
        const newMsg = generateMessage();
        setMessage(newMsg);
        if (onMessageComplete) onMessageComplete();
      }, 600);
      return () => clearTimeout(timer);
    } else {
      const newMsg = generateMessage();
      setMessage(newMsg);
      if (onMessageComplete) onMessageComplete();
    }
  }, [step, feedback, timeLeft, correctCount, personality, showThinking]);

  // Ícone dinâmico baseado na expressão
  const getIcon = () => {
    switch (expression) {
      case '😊': return <Sparkles className="h-6 w-6 text-yellow-500" />;
      case '🎉': return <ThumbsUp className="h-6 w-6 text-green-500" />;
      case '😅': return <AlertCircle className="h-6 w-6 text-orange-500" />;
      case '🤔': return <Brain className="h-6 w-6 text-purple-500 animate-pulse" />;
      case '⏰': return <Clock className="h-6 w-6 text-red-500" />;
      default: return <Brain className="h-6 w-6 text-indigo-600" />;
    }
  };

  // Barra de progresso do tutor (nível de entusiasmo baseado em acertos)
  const tutorProgress = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 shadow-md border border-indigo-100 transition-all duration-300">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white shadow flex items-center justify-center">
          {getIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-indigo-800">Assistente IA</span>
            <span className="text-xs text-gray-400">{expression}</span>
          </div>
          <p className="text-gray-800 text-sm md:text-base leading-relaxed">
            {message}
            {isThinking && <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse ml-1" />}
          </p>
          
          {/* Barra de progresso do tutor (nível de encorajamento) */}
          {step !== 'finished' && totalQuestions > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Nível de incentivo</span>
                <span>{Math.round(tutorProgress)}%</span>
              </div>
              <div className="w-full bg-indigo-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500"
                  style={{ width: `${tutorProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        {/* Badge de personalidade (opcional) */}
        <div className="hidden sm:block text-xs bg-white/70 rounded-full px-2 py-0.5 text-indigo-600">
          {personality === 'enthusiastic' && '🤗 Entusiasta'}
          {personality === 'serious' && '📘 Sério'}
          {personality === 'motivational' && '🔥 Motivador'}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Componente wrapper com memorização para evitar rerenders
// ============================================================
export default React.memo(TutorMessage);