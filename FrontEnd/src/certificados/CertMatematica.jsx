// src/certificados/CertMatematica.jsx
import React from 'react';
import CertificadoBase from './CertificadoBase';

// Configurações específicas para Matemática
const matematicaConfig = {
  1: {
    titulo: "MESTRE DA MATEMÁTICA",
    icone: "🧮",
    frase: "Resolveu os problemas mais complexos com maestria"
  },
  2: {
    titulo: "EXPLORADOR MATEMÁTICO",
    icone: "📐",
    frase: "Demonstrou excelente raciocínio lógico e precisão"
  },
  3: {
    titulo: "PROMESSA MATEMÁTICA",
    icone: "🔢",
    frase: "Mostrou grande potencial e dedicação aos números"
  }
};

export default function CertMatematica({ isOpen, onClose, participante, posicao, torneio }) {
  if (!participante) return null;

  const config = matematicaConfig[posicao] || matematicaConfig[3];
  const pontuacao = participante.pontuacao || 0;

  return (
    <CertificadoBase
      isOpen={isOpen}
      onClose={onClose}
      participante={participante}
      disciplina="Matemática"
      posicao={posicao}
      pontuacao={pontuacao}
      dataEntrega={new Date()}
      torneio={torneio}
    >
      {/* Elemento decorativo específico para Matemática */}
      <div className="absolute top-40 right-10 text-6xl opacity-10 pointer-events-none select-none">
        {config.icone}
      </div>
      
      {/* Conteúdo adicional específico para Matemática */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center">
        <p className="text-sm text-blue-800">
          <span className="font-bold">"{config.frase}"</span>
        </p>
      </div>
    </CertificadoBase>
  );
}