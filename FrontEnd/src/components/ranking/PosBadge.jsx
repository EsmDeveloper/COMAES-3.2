import React from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';

/**
 * Componente PosBadge para exibir badges de posição (ouro, prata, bronze)
 * 
 * @param {Object} props
 * @param {number} props.position - Posição no ranking (1, 2, 3, etc.)
 * @param {string} [props.className] - Classes CSS adicionais
 */
const PosBadge = ({ position, className = '' }) => {
  if (position === 1) {
    return (
      <div className={`w-8 h-8 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center flex-shrink-0 ${className}`}>
        <Crown size={16} className="text-amber-600" />
      </div>
    );
  }

  if (position === 2) {
    return (
      <div className={`w-8 h-8 rounded-full bg-slate-50 border-2 border-slate-200 flex items-center justify-center flex-shrink-0 ${className}`}>
        <Medal size={16} className="text-slate-600" />
      </div>
    );
  }

  if (position === 3) {
    return (
      <div className={`w-8 h-8 rounded-full bg-orange-50 border-2 border-orange-200 flex items-center justify-center flex-shrink-0 ${className}`}>
        <Trophy size={16} className="text-orange-600" />
      </div>
    );
  }

  return (
    <div className={`w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 ${className}`}>
      <span className="text-xs font-semibold text-gray-500">#{position}</span>
    </div>
  );
};

export default PosBadge;