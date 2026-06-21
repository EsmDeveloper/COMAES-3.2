import React from 'react';
import CertificadoBase from './CertificadoBase';
import { getIconForEmoji } from '../utils/iconMapper';

const config = {
  1: { frase: "Demonstrou proficiência excepcional na língua inglesa", icone: "🌍" },
  2: { frase: "Apresentou notável habilidade de comunicação em inglês", icone: "🗣️" },
  3: { frase: "Mostrou grande evolução e dedicação ao aprendizado", icone: "⭐" },
};

export default function CertIngles({ isOpen, onClose, participante, posicao, torneio }) {
  if (!participante) return null;

  const { frase, icone } = config[posicao] || config[3];
  const pontuacao = participante.pontuacao || 0;

  return (
    <CertificadoBase
      isOpen={isOpen}
      onClose={onClose}
      participante={participante}
      disciplina="Inglês"
      posicao={posicao}
      pontuacao={pontuacao}
      torneio={torneio}
    >
      <div className="bg-blue-100/50 rounded-lg p-4 text-center">
        <div className="text-4xl mb-2">
          {getIconForEmoji(icone, 40)}
        </div>
        <p className="text-blue-800 font-medium italic">"{frase}"</p>
        <p className="text-xs text-gray-500 mt-1">English Proficiency Certificate</p>
      </div>
    </CertificadoBase>
  );
}