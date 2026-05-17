import React, { useState } from 'react';
import { Award, Loader2, Lock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Botão que verifica se o usuário está apto ao certificado
 */
export default function CertificateCheckButton({ onClick, isLoading }) {
  const [feedback, setFeedback] = useState(null);

  const handleAction = async () => {
    try {
      await onClick();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAction}
        disabled={isLoading}
        className={`group relative flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-[colors,transform,box-shadow] duration-normal ease-out-fluid will-change-transform-opacity shadow-xl overflow-hidden
          ${isLoading 
            ? 'bg-gray-200 text-gray-400 cursor-wait' 
            : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 hover:shadow-purple-500/25'
          }`}
      >
        {/* Efeito de brilho no hover */}
        <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-[-20deg] -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>

        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
        ) : (
          <Award className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        )}
        
        <span className="relative z-10">
          Verificar meu Certificado
        </span>

        {/* Indicador de status visual sutil */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20">
          <Award size={40} />
        </div>
      </motion.button>
      
      <p className="text-xs text-gray-500 italic">
        * Disponível após o encerramento oficial do torneio
      </p>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(250%) skewX(-20deg); }
        }
      `}} />
    </div>
  );
}
