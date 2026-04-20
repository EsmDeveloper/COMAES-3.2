import React from 'react';
import CertificadoBase from './CertificadoBase';

const config = {
  1: { frase: "Resolveu os problemas mais complexos com maestria", icone: "🧮" },
  2: { frase: "Demonstrou excelente raciocínio lógico e precisão", icone: "📐" },
  3: { frase: "Mostrou grande potencial e dedicação aos números", icone: "🔢" },
};

export default function CertMatematica({ isOpen, onClose, participante, posicao, torneio }) {
  if (!participante) return null;

  const { frase, icone } = config[posicao] || config[3];
  const pontuacao = participante.pontuacao || 0;

  return (
    <CertificadoBase
      isOpen={isOpen}
      onClose={onClose}
      participante={participante}
      disciplina="Matemática"
      posicao={posicao}
      pontuacao={pontuacao}
      torneio={torneio}
    >
      <div className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-200">
        <div className="text-4xl mb-2">{icone}</div>
        <p className="text-yellow-800 font-semibold">“{frase}”</p>
      </div>
    </CertificadoBase>
  );
}