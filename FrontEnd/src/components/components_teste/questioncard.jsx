// src/components/QuestionCard.tsx
import React, { useState } from 'react';
import { CheckCircle, XCircle, Sparkles, ArrowRight } from 'lucide-react';


export const QuestionCard = ({
  question,
  index,
  total,
  onAnswer,
  disabled,
  feedback,
}) => {
  const [textoAberto, setTextoAberto] = useState('');

  const submitOpen = () => {
    if (!textoAberto.trim()) return;
    onAnswer(null, textoAberto);
    setTextoAberto('');
  };

  const isMultiple = question.tipo === 'multiple' || question.tipo === 'truefalse';
  const options = question.opcoes ?? [];

  return (
    <div className="bg-white rounded-xl shadow-md p-7 relative overflow-hidden">
      {/* barra de feedback */}
      {feedback && (
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            feedback.type === 'correct' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          <div
            className={`h-full ${
              feedback.type === 'correct' ? 'bg-green-400' : 'bg-red-400'
            } animate-pulse`}
          ></div>
        </div>
      )}

      {/* cabeçalho */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-600 font-medium">
          Questão {index + 1} de {total}
        </span>
        {feedback && (
          <span className="text-sm font-bold text-gray-700">
            {feedback.type === 'correct' ? '✅ Correto' : '❌ Errado'} –{' '}
            {feedback.score}/10
          </span>
        )}
      </div>

      {/* enunciado */}
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        {question.questao}
      </h2>

      {/* opções ou campo aberto */}
      {isMultiple ? (
        <div className="space-y-3">
          {options.map((opt, i) => (
            <button
              key={i}
              disabled={disabled}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3
                ${
                  disabled
                    ? 'bg-gray-50 border-gray-200 text-gray-500 opacity-60 cursor-not-allowed'
                    : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 cursor-pointer'
                }`}
              onClick={() => onAnswer(i)}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-bold
                  ${
                    disabled
                      ? 'bg-white text-gray-600 border-2 border-gray-200'
                      : 'bg-white text-gray-600 border-2 border-gray-200'
                  }`}
              >
                {String.fromCharCode(65 + i)}
              </div>
              <span className="flex-1">{opt}</span>
            </button>
          ))}
        </div>
      ) : (
        // ==== RESPOSTA ABERTA ====
        <div className="flex flex-col gap-3">
          <textarea
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
            rows={4}
            placeholder="Escreva sua resposta aqui..."
            value={textoAberto}
            onChange={(e) => setTextoAberto(e.target.value)}
            disabled={disabled}
          />
          <button
            className={`self-end px-5 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2
                ${!textoAberto.trim() || disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            onClick={submitOpen}
            disabled={!textoAberto.trim() || disabled}
          >
            <Sparkles className="h-4 w-4" /> Enviar
          </button>
        </div>
      )}
    </div>
  );
};
