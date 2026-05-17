// src/components/ResultScreen.tsx
import React from 'react';
import {
  Trophy,
  Star,
  CheckCircle,
  XCircle,
  Target,
  RefreshCw,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';

export const ResultScreen = ({
  totalScore,
  maxScore,
  percent,
  correct,
  wrong,
  totalQuestions,
  classification,
  onRestart,
  onNewArea,
}) => {
  const icons = {
    Excelente: '🏆',
    'Muito Bem': '🌟',
    'Bom Trabalho': '👍',
    'Continue Tentando': '💡',
  };
  const title = percent >= 90
    ? 'Excelente!'
    : percent >= 70
    ? 'Muito Bem!'
    : percent >= 50
    ? 'Bom Trabalho!'
    : 'Continue Tentando!';

  const message = percent >= 90
    ? 'Você é um gênio! 🎉'
    : percent >= 70
    ? 'Você está no caminho certo! 🚀'
    : percent >= 50
    ? 'Bom esforço, continue praticando! 💪'
    : 'A prática leva à perfeição. 📚';

  return (
    <div className="bg-white rounded-2xl shadow-xl p-10 max-w-2xl mx-auto text-center">
      <div className="text-7xl mb-4">{icons[title.split(' ')[0]] ?? '✨'}</div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-lg text-gray-700 mb-8">{message}</p>

      {/* Grid de métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Metric
          icon={<Star className="h-6 w-6 text-yellow-600" />}
          value={totalScore}
          label="Pontos"
        />
        <Metric
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          value={correct}
          label="Acertos"
        />
        <Metric
          icon={<XCircle className="h-6 w-6 text-red-600" />}
          value={wrong}
          label="Erros"
        />
        <Metric
          icon={<Target className="h-6 w-6 text-indigo-600" />}
          value={totalQuestions}
          label="Total"
        />
      </div>

      {/* Botões de ação */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRestart}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl flex items-center gap-2 hover:opacity-90 transition"
        >
          <RefreshCw className="h-5 w-5" /> Refazer Teste
        </button>
        <button
          onClick={onNewArea}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl flex items-center gap-2 hover:bg-gray-200 transition"
        >
          <ArrowRight className="h-5 w-5 rotate-180" /> Nova Área
        </button>
      </div>

      <div className="mt-10 pt-6 border-t text-sm text-gray-600 flex items-center gap-2 justify-center">
        <Lightbulb className="h-4 w-4" />
        Classificação: <span className="font-medium">{classification}</span>
      </div>
    </div>
  );
};

const Metric = ({ icon, value, label }) => (
  <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center border border-gray-200">
    {icon}
    <div className="text-2xl font-bold text-gray-800">{value}</div>
    <div className="text-gray-600 text-sm">{label}</div>
  </div>
);
