// src/components/QuestionCardEnhanced.jsx
import React, { useState } from 'react';
import { CheckCircle, XCircle, Sparkles, ArrowRight, Lightbulb, AlertCircle, BookOpen } from 'lucide-react';

export const QuestionCardEnhanced = ({
  question,
  index,
  total,
  onAnswer,
  disabled,
  feedback,
  timeLeft,
  testMode = 'closed', // 'closed' = múltipla escolha | 'guided' = guiado (mostrar corretas)
}) => {
  const [textoAberto, setTextoAberto] = useState('');
  const [answered, setAnswered] = useState(false);

  // Quando feedback é recebido, marca como respondido
  React.useEffect(() => {
    if (feedback) setAnswered(true);
  }, [feedback]);

  const submitOpen = () => {
    if (!textoAberto.trim()) return;
    onAnswer(textoAberto);
    setTextoAberto('');
  };

  const isMultiple = question.tipo === 'multiple' || question.tipo === 'truefalse';
  const options = question.opcoes ?? [];
  const hasExplanation = feedback?.explanation;

  // Mapeamento de dificuldade para cores
  const difficultyColors = {
    facil: { badge: 'bg-green-50 text-green-700', dot: 'bg-green-400' },
    medio: { badge: 'bg-yellow-50 text-yellow-700', dot: 'bg-yellow-400' },
    dificil: { badge: 'bg-red-50 text-red-700', dot: 'bg-red-400' },
  };

  const difficulty = question.dificuldade || 'medio';
  const colors = difficultyColors[difficulty] || difficultyColors.medio;

  // Indicador de tempo crítico
  const isTimeCritical = timeLeft <= 5;
  const timeColor = timeLeft <= 5 ? 'text-red-600' : timeLeft <= 10 ? 'text-yellow-600' : 'text-green-600';

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Card principal com feedback visual */}
      <div className={`bg-white rounded-2xl shadow-lg p-8 relative overflow-hidden transition-all duration-300 ${
        feedback?.type === 'correct' ? 'ring-2 ring-green-400' :
        feedback?.type === 'wrong' ? 'ring-2 ring-red-400' :
        feedback?.type === 'timeout' ? 'ring-2 ring-orange-400' : ''
      }`}>

        {/* Barra de feedback topo */}
        {feedback && (
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${
            feedback.type === 'correct' ? 'bg-green-500' :
            feedback.type === 'wrong' ? 'bg-red-500' :
            'bg-orange-500'
          }`}>
            <div className={`h-full ${
              feedback.type === 'correct' ? 'bg-green-400' :
              feedback.type === 'wrong' ? 'bg-red-400' :
              'bg-orange-400'
            } animate-pulse`} />
          </div>
        )}

        {/* Header com metadados da questão */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="inline-block px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
              Questão {index + 1}/{total}
            </span>
            <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium ${colors.badge}`}>
              <span className={`inline-block w-2 h-2 rounded-full ${colors.dot} mr-1.5`} />
              {difficulty === 'facil' ? '⭐ Fácil' : difficulty === 'dificil' ? ' Difícil' : '⭐⭐ Médio'}
            </span>
          </div>
          
          <div className={`text-sm font-bold ${timeColor}`}>
            {timeLeft}s
            {isTimeCritical && <span className="inline-block ml-2 animate-pulse">⚠️</span>}
          </div>
        </div>

        {/* Enunciado da questão com melhor tipografia */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 leading-relaxed">
            {question.enunciado || question.questao}
          </h2>
          {question.contexto && (
            <p className="text-gray-600 mt-3 text-base italic">
              {question.contexto}
            </p>
          )}
        </div>

        {/* Opções ou campo aberto */}
        <div className={`transition-opacity duration-300 ${disabled ? 'opacity-60' : 'opacity-100'}`}>
          {isMultiple ? (
            <div className="space-y-3">
              {options.map((opt, i) => {
                const isSelected = question.respostaSelecionada === opt;
                const isCorrectOption = opt.trim().toLowerCase() === (question.resposta_correta || '').trim().toLowerCase();
                const showCorrectStatus = feedback && !disabled;
                const isCorrect = question.respostaSelecionada?.trim().toLowerCase() === (question.resposta_correta || '').trim().toLowerCase();

                // No modo 'guided', mostrar a resposta correta sempre
                const isCorrectInGuidedMode = testMode === 'guided' && isCorrectOption && !answered;

                return (
                  <button
                    key={i}
                    disabled={disabled}
                    onClick={() => onAnswer(opt)}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-start gap-4
                      ${
                        showCorrectStatus && isCorrectOption
                          ? 'border-green-500 bg-green-50'
                          : showCorrectStatus && isSelected && !isCorrect
                          ? 'border-red-500 bg-red-50'
                          : isCorrectInGuidedMode
                          ? 'border-green-400 bg-green-50 ring-2 ring-green-200'
                          : disabled
                          ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-50 border-gray-300 text-gray-800 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                      }`}
                    style={{
                      animation: disabled && feedback ? `slideIn 0.3s ease-out ${i * 0.1}s` : 'none'
                    }}
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold flex-shrink-0 mt-0.5
                      ${
                        showCorrectStatus && isCorrectOption
                          ? 'bg-green-500 text-white'
                          : showCorrectStatus && isSelected && !isCorrect
                          ? 'bg-red-500 text-white'
                          : isCorrectInGuidedMode
                          ? 'bg-green-400 text-white border-2 border-green-500'
                          : 'bg-white text-slate-700 border-2 border-gray-300'
                      }`}>
                      {showCorrectStatus && isCorrectOption ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : showCorrectStatus && isSelected && !isCorrect ? (
                        <XCircle className="w-5 h-5" />
                      ) : isCorrectInGuidedMode ? (
                        <span className="text-xs">✓</span>
                      ) : (
                        String.fromCharCode(65 + i)
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-base md:text-lg font-medium leading-relaxed">
                        {opt}
                      </span>
                      {/* Indicador de resposta correta no modo guiado */}
                      {isCorrectInGuidedMode && (
                        <span className="inline-block mt-1 text-xs text-green-600 font-semibold bg-green-100 px-2 py-1 rounded">
                          💡 Resposta Correta
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            // Resposta aberta
            <div className="flex flex-col gap-4">
              <textarea
                className={`w-full p-4 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all text-base md:text-lg
                  ${disabled ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'border-gray-300 focus:border-indigo-400'}`}
                rows={5}
                placeholder="Escreva sua resposta aqui..."
                value={textoAberto}
                onChange={(e) => setTextoAberto(e.target.value)}
                disabled={disabled}
              />
              <button
                className={`self-end px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl flex items-center gap-2 font-semibold hover:opacity-90 transition
                  ${!textoAberto.trim() || disabled ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-lg'}`}
                onClick={submitOpen}
                disabled={!textoAberto.trim() || disabled}
              >
                <Sparkles className="h-5 w-5" /> Enviar Resposta
              </button>
            </div>
          )}
        </div>

        {/* Explicação após resposta com design melhorado */}
        {hasExplanation && (
          <div className={`mt-8 pt-6 border-t-2 rounded-xl p-5 animate-slideDown
            ${feedback.type === 'correct' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-orange-50 border-orange-200'}`}>
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 mt-0.5
                ${feedback.type === 'correct' ? 'text-green-600' : 'text-orange-600'}`}>
                {feedback.type === 'correct' ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <Lightbulb className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-lg mb-2
                  ${feedback.type === 'correct' ? 'text-green-800' : 'text-orange-800'}`}>
                  {feedback.type === 'correct' ? '✅ Resposta Correta!' : '💡 Explicação'}
                </h3>
                <p className={`text-base leading-relaxed
                  ${feedback.type === 'correct' ? 'text-green-700' : 'text-orange-700'}`}>
                  {feedback.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dica opcional */}
        {question.dica && !feedback && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition">
              <Lightbulb className="w-4 h-4" />
              Mostrar dica
            </button>
          </div>
        )}
      </div>

      {/* Espaçamento para animações */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default React.memo(QuestionCardEnhanced);
