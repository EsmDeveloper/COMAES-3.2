import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Componente RankingTab - Componente de aba individual com estatísticas
 * 
 * @param {Object} props
 * @param {string} props.title - Título da aba
 * @param {boolean} props.active - Se a aba está ativa
 * @param {Function} props.onClick - Função de clique
 * @param {number} props.totalParticipants - Total de participantes
 * @param {number} props.averageScore - Pontuação média
 * @param {number} [props.trend=0] - Tendência (-1: baixa, 0: neutra, 1: alta)
 * @param {string} [props.description] - Descrição adicional
 */
const RankingTab = ({
  title,
  active,
  onClick,
  totalParticipants,
  averageScore,
  trend = 0,
  description
}) => {
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-400';

  return (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-3 text-left rounded-lg transition-all ${
        active
          ? 'bg-white border-2 border-blue-500 shadow-sm'
          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className={`font-semibold ${active ? 'text-blue-600' : 'text-gray-700'}`}>
          {title}
        </h4>
        <div className="flex items-center gap-1">
          <TrendIcon size={14} className={trendColor} />
          {trend !== 0 && (
            <span className={`text-xs ${trendColor}`}>
              {trend > 0 ? '+ ' : '- '}
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Participantes:</span>
          <span className="font-medium text-gray-900">{totalParticipants.toLocaleString('pt-BR')}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Pontuação média:</span>
          <span className="font-medium text-gray-900">{averageScore.toLocaleString('pt-BR')} pts</span>
        </div>
      </div>

      {description && (
        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
          {description}
        </p>
      )}
    </button>
  );
};

export default RankingTab;