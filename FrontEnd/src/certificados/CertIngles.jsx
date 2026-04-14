// src/certificados/CertIngles.jsx
import React from 'react';
import CertificadoBase from './CertificadoBase';

// Configurações específicas para Inglês
const inglesConfig = {
  1: {
    titulo: "ENGLISH MASTER",
    icone: "🌍",
    frase: "Demonstrou proficiência excepcional na língua inglesa"
  },
  2: {
    titulo: "FLUENT ACHIEVER",
    icone: "🗣️",
    frase: "Apresentou notável habilidade de comunicação em inglês"
  },
  3: {
    titulo: "RISING STAR",
    icone: "⭐",
    frase: "Mostrou grande evolução e dedicação ao aprendizado"
  }
};

export default function CertIngles({ isOpen, onClose, participante, posicao, torneio }) {
  if (!participante) return null;

  const config = inglesConfig[posicao] || inglesConfig[3];
  const pontuacao = participante.pontuacao || 0;

  return (
    <CertificadoBase
      isOpen={isOpen}
      onClose={onClose}
      participante={participante}
      disciplina="Inglês"
      posicao={posicao}
      pontuacao={pontuacao}
      dataEntrega={new Date()}
      torneio={torneio}
    >
      {/* Elemento decorativo específico para Inglês */}
      <div className="absolute top-40 right-10 text-6xl opacity-10 pointer-events-none select-none">
        {config.icone}
      </div>
      
      {/* Conteúdo adicional específico para Inglês */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center">
        <p className="text-sm text-blue-800 italic">
          "{config.frase}"
        </p>
        <p className="text-xs text-gray-500 mt-1">English Proficiency Certificate</p>
      </div>
    </CertificadoBase>
  );
}