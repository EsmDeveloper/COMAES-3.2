// src/components/ResultScreenEnhanced.jsx
import React, { useState } from 'react';
import {
  Trophy,
  Star,
  CheckCircle,
  XCircle,
  Target,
  RefreshCw,
  ArrowRight,
  Lightbulb,
  BookOpen,
  TrendingUp,
  Clock,
  Zap,
  AlertCircle,
} from 'lucide-react';

const STUDY_SUGGESTIONS = {
  matematica: [
    { topic: 'Álgebra Básica', icon: '🔢', link: '#algebra' },
    { topic: 'Geometria', icon: '📐', link: '#geometria' },
    { topic: 'Cálculo', icon: '∫', link: '#calculo' },
    { topic: 'Probabilidade', icon: '🎲', link: '#probabilidade' },
  ],
  programacao: [
    { topic: 'Estruturas de Dados', icon: '📊', link: '#estruturas' },
    { topic: 'Algoritmos', icon: '⚙️', link: '#algoritmos' },
    { topic: 'Programação OOP', icon: '', link: '#oop' },
    { topic: 'Web Development', icon: '🌐', link: '#web' },
  ],
  ingles: [
    { topic: 'Gramática Essencial', icon: '✏️', link: '#gramatica' },
    { topic: 'Vocabulário', icon: '📚', link: '#vocabulario' },
    { topic: 'Compreensão de Leitura', icon: '', link: '#reading' },
    { topic: 'Pronuncia', icon: '🎤', link: '#pronuncia' },
  ],
};

export const ResultScreenEnhanced = ({
  totalScore,
  maxScore,
  percent,
  correct,
  wrong,
  totalQuestions,
  timeSpent,
  streak,
  xpEarned,
  area = 'matematica',
  onRestart,
  onNewArea,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Classificação de desempenho
  let title, icon, classification, message, color, bgColor;
  
  if (percent >= 90) {
    title = 'Excelente! 🏆';
    icon = '🥇';
    classification = 'Desempenho Excepcional';
    message = 'Você está entre os melhores! Parabéns pelo domínio total da matéria.';
    color = 'text-yellow-600';
    bgColor = 'bg-yellow-50';
  } else if (percent >= 75) {
    title = 'Muito Bem! 🌟';
    icon = '🥈';
    classification = 'Desempenho Muito Bom';
    message = 'Ótimo resultado! Você tem uma base sólida. Alguns pontos ainda merecem revisão.';
    color = 'text-blue-600';
    bgColor = 'bg-blue-50';
  } else if (percent >= 60) {
    title = 'Bom Trabalho! 👍';
    icon = '🥉';
    classification = 'Desempenho Bom';
    message = 'Você está no caminho certo! Continue estudando e melhorará rapidamente.';
    color = 'text-green-600';
    bgColor = 'bg-green-50';
  } else if (percent >= 50) {
    title = 'Continue Tentando 💪';
    icon = '🎓';
    classification = 'Desempenho Regular';
    message = 'Você acertou mais da metade! Com mais prática, sua pontuação vai subir muito.';
    color = 'text-orange-600';
    bgColor = 'bg-orange-50';
  } else {
    title = 'Não Desista! 🚀';
    icon = '📚';
    classification = 'Desempenho Iniciante';
    message = 'Este é apenas o começo! A prática constante leva ao sucesso. Revise os conceitos e tente novamente.';
    color = 'text-red-600';
    bgColor = 'bg-red-50';
  }

  // Cálculo de métricas
  const avgTimePerQuestion = totalQuestions > 0 ? Math.round(timeSpent / totalQuestions) : 0;
  const accuracy = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
  const improvement = percent >= 75 ? '+15%' : percent >= 50 ? '+5%' : '+2%';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Header de Resultado */}
        <div className={`rounded-3xl shadow-2xl p-12 text-center mb-8 ${bgColor} border-2 ${color}`}>
          <div className="text-8xl mb-4 animate-bounce">{icon}</div>
          <h1 className={`text-4xl md:text-5xl font-extrabold mb-3 ${color}`}>
            {title}
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
            {message}
          </p>
        </div>

        {/* Grid de Métricas Principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            icon={<Star className="h-8 w-8 text-yellow-500" />}
            value={totalScore}
            label="Pontos"
            highlight={totalScore > 80}
          />
          <MetricCard
            icon={<CheckCircle className="h-8 w-8 text-green-500" />}
            value={correct}
            label="Acertos"
            highlight={correct >= totalQuestions * 0.75}
          />
          <MetricCard
            icon={<XCircle className="h-8 w-8 text-red-500" />}
            value={wrong}
            label="Erros"
            highlight={wrong === 0}
          />
          <MetricCard
            icon={<Target className="h-8 w-8 text-indigo-500" />}
            value={`${percent}%`}
            label="Acurácia"
            highlight={percent >= 75}
          />
        </div>

        {/* Estatísticas Secundárias */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Tempo */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tempo Total</p>
                <p className="text-2xl font-bold text-slate-800">{timeSpent}s</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">~{avgTimePerQuestion}s por questão</p>
          </div>

          {/* XP Ganho */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">XP Ganho</p>
                <p className="text-2xl font-bold text-slate-800">{xpEarned}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">+{xpEarned} experiência</p>
          </div>

          {/* Sequência */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Melhor Sequência</p>
                <p className="text-2xl font-bold text-slate-800">{streak}x 🔥</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Acertos consecutivos</p>
          </div>
        </div>

        {/* Análise Detalhada */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            Análise do Desempenho
          </h2>

          <div className="space-y-6">
            {/* Barra de acurácia */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Taxa de Acurácia</span>
                <span className="text-sm font-bold text-indigo-600">{accuracy}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    accuracy >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    accuracy >= 75 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                    accuracy >= 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    'bg-gradient-to-r from-red-500 to-pink-500'
                  }`}
                  style={{ width: `${accuracy}%` }}
                />
              </div>
            </div>

            {/* Comparação com expectativa */}
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <div>
                <p className="text-sm font-semibold text-indigo-900">Progresso Estimado</p>
                <p className="text-xs text-indigo-700 mt-1">Com base neste desempenho</p>
              </div>
              <span className="text-2xl font-bold text-indigo-600">{improvement}</span>
            </div>
          </div>
        </div>

        {/* Sugestões de Estudo */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-8 border border-indigo-200 mb-8">
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="w-full flex items-center justify-between mb-0 group"
          >
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-yellow-500" />
              {percent < 75 ? 'Áreas para Melhorar' : 'Próximos Passos'}
            </h2>
            <div className={`transform transition-transform ${showSuggestions ? 'rotate-180' : ''}`}>
              <ArrowRight className="h-5 w-5 text-indigo-600" />
            </div>
          </button>

          {showSuggestions && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 animate-slideDown">
              {STUDY_SUGGESTIONS[area]?.map((suggestion, idx) => (
                <a
                  key={idx}
                  href={suggestion.link}
                  className="p-4 bg-white rounded-xl hover:shadow-md transition-all border border-indigo-100 hover:border-indigo-300 text-center group"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                    {suggestion.icon}
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{suggestion.topic}</p>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRestart}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all font-bold text-lg"
          >
            <RefreshCw className="h-5 w-5" /> Refazer Teste
          </button>
          <button
            onClick={onNewArea}
            className="px-8 py-4 bg-white text-indigo-600 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-all font-bold text-lg border-2 border-indigo-600"
          >
            <ArrowRight className="h-5 w-5" /> Escolher Outra Área
          </button>
        </div>

        {/* Footer Motivacional */}
        <div className="mt-10 text-center">
          <p className="text-gray-600 text-sm">
            {percent >= 90 && '🎉 Parabéns! Você é uma referência nesta matéria!'}
            {percent >= 75 && percent < 90 && '🌟 Continue praticando, você está próximo da excelência!'}
            {percent >= 50 && percent < 75 && '💪 A consistência é a chave do sucesso. Tente novamente!'}
            {percent < 50 && '📚 Cada erro é uma oportunidade de aprendizado. Volte e tente de novo!'}
          </p>
        </div>
      </div>

      <style>{`
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

function MetricCard({ icon, value, label, highlight = false }) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 text-center border-2 transition-all ${
      highlight ? 'border-green-400 shadow-green-200' : 'border-gray-200'
    }`}>
      <div className="flex justify-center mb-3">
        {icon}
      </div>
      <div className="text-3xl font-bold text-slate-800 mb-1">{value}</div>
      <div className="text-sm text-gray-600 font-medium">{label}</div>
    </div>
  );
}

export default React.memo(ResultScreenEnhanced);
