import React from 'react';
import CertificadoBase from './CertificadoBase';
import { getIconForEmoji } from '../utils/iconMapper';

const config = {
  1: { frase: "Desenvolveu soluções inovadoras e código eficiente", icone: "💻" },
  2: { frase: "Resolveu problemas complexos com lógica apurada", icone: "⚡" },
  3: { frase: "Demonstrou grande potencial na arte da programação", icone: "🚀" },
};

export default function CertProgramacao({ isOpen, onClose, participante, posicao, torneio }) {
  if (!participante) return null;

  const { frase, icone } = config[posicao] || config[3];
  const pontuacao = participante.pontuacao || 0;

  return (
    <CertificadoBase
      isOpen={isOpen}
      onClose={onClose}
      participante={participante}
      disciplina="Programação"
      posicao={posicao}
      pontuacao={pontuacao}
      torneio={torneio}
    >
      <div className="bg-gray-800 text-white rounded-lg p-4 text-center font-mono">
        <div className="text-3xl mb-2 text-blue-400">
          {getIconForEmoji(icone, 32)}
        </div>
        <p className="text-green-400">function award() {`{ return "${frase}"; }`}</p>
      </div>
    </CertificadoBase>
  );
}