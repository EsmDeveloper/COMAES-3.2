// src/certificados/CertProgramacao.jsx
import React from 'react';
import CertificadoBase from './CertificadoBase';

// Configurações específicas para Programação
const programacaoConfig = {
  1: {
    titulo: "CODE MASTER",
    icone: "💻",
    frase: "Desenvolveu soluções inovadoras e código eficiente"
  },
  2: {
    titulo: "ALGORITHM EXPERT",
    icone: "⚡",
    frase: "Resolveu problemas complexos com lógica apurada"
  },
  3: {
    titulo: "CODING PRODIGY",
    icone: "🚀",
    frase: "Demonstrou grande potencial na arte da programação"
  }
};

export default function CertProgramacao({ isOpen, onClose, participante, posicao, torneio }) {
  if (!participante) return null;

  const config = programacaoConfig[posicao] || programacaoConfig[3];
  const pontuacao = participante.pontuacao || 0;

  return (
    <CertificadoBase
      isOpen={isOpen}
      onClose={onClose}
      participante={participante}
      disciplina="Programação"
      posicao={posicao}
      pontuacao={pontuacao}
      dataEntrega={new Date()}
      torneio={torneio}
    >
      {/* Elemento decorativo específico para Programação */}
      <div className="absolute top-40 right-10 text-6xl opacity-10 pointer-events-none select-none">
        {config.icone}
      </div>
      
      {/* Conteúdo adicional específico para Programação */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center font-mono">
        <p className="text-sm text-blue-800">
          <span className="font-bold">function</span> awardWinner() {'{'}
          <br />&nbsp;&nbsp;return "{config.frase}";
          <br />{'}'}
        </p>
      </div>
    </CertificadoBase>
  );
}