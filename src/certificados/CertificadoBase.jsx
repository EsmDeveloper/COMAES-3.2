// src/certificados/CertificadoBase.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaMedal, FaAward, FaStar } from 'react-icons/fa';
import logotipo from '../assets/logotipo.png';
import assinatura from '../assets/assinatura.png'; // Você precisará adicionar esta imagem

const certificadosConfig = {
  primeiro: {
    titulo: "CERTIFICADO DE CAMPEÃO",
    icone: <FaTrophy className="text-5xl text-yellow-500" />,
    cor: "from-yellow-400 to-yellow-600",
    borda: "border-yellow-500",
    medalha: "🥇",
    texto: "pelo excelente desempenho e conquista do primeiro lugar"
  },
  segundo: {
    titulo: "CERTIFICADO DE VICE-CAMPEÃO",
    icone: <FaMedal className="text-5xl text-gray-400" />,
    cor: "from-gray-300 to-gray-500",
    borda: "border-gray-400",
    medalha: "🥈",
    texto: "pelo notável desempenho e conquista do segundo lugar"
  },
  terceiro: {
    titulo: "CERTIFICADO DE TERCEIRO LUGAR",
    icone: <FaAward className="text-5xl text-amber-600" />,
    cor: "from-amber-500 to-amber-700",
    borda: "border-amber-600",
    medalha: "🥉",
    texto: "pelo excelente desempenho e conquista do terceiro lugar"
  }
};

export default function CertificadoBase({ 
  isOpen, 
  onClose, 
  participante, 
  disciplina, 
  posicao,
  pontuacao,
  dataEntrega,
  torneio
}) {
  if (!isOpen || !participante) return null;

  const config = certificadosConfig[
    posicao === 1 ? 'primeiro' : 
    posicao === 2 ? 'segundo' : 
    'terceiro'
  ];

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const nomeDisciplina = {
    'Matemática': 'Matemática',
    'Inglês': 'Inglês',
    'Programação': 'Programação'
  }[disciplina] || disciplina;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="relative max-w-4xl w-full"
      >
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-blue-300 transition-colors"
        >
          ✕ Fechar
        </button>

        {/* Certificado */}
        <div className={`bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl overflow-hidden border-8 ${config.borda}`}>
          {/* Faixa superior decorativa */}
          <div className={`bg-gradient-to-r ${config.cor} h-4`}></div>

          {/* Conteúdo do certificado */}
          <div className="p-8 md:p-12 relative">
            {/* Background decorativo */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="absolute top-20 left-20 text-9xl text-blue-600">“</div>
              <div className="absolute bottom-20 right-20 text-9xl text-blue-600">”</div>
            </div>

            {/* Header com logo */}
            <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-6">
              <img src={logotipo} alt="Comaes" className="h-16 object-contain" />
              <div className="text-right">
                <div className="text-3xl mb-1">{config.medalha}</div>
                <div className="text-sm text-gray-500">Certificado Oficial</div>
              </div>
            </div>

            {/* Título */}
            <div className="text-center mb-8">
              <h1 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${config.cor} bg-clip-text text-transparent mb-2`}>
                {config.titulo}
              </h1>
              <p className="text-gray-600">
                {torneio?.titulo || `Torneio de ${nomeDisciplina}`}
              </p>
            </div>

            {/* Corpo do certificado */}
            <div className="text-center mb-8">
              <p className="text-lg text-gray-700 mb-2">A Comaes certifica que</p>
              <p className="text-4xl font-bold text-blue-800 mb-2">
                {participante.usuario?.nome || participante.nome || "Participante"}
              </p>
              <p className="text-lg text-gray-700 mb-6">
                {config.texto} no <span className="font-semibold">{nomeDisciplina}</span>
              </p>

              {/* Destaque da pontuação */}
              <div className="inline-block bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-4 rounded-2xl shadow-lg">
                <div className="text-sm uppercase tracking-wider opacity-90">Pontuação Alcançada</div>
                <div className="text-4xl font-bold">{pontuacao || participante.pontuacao || 0} pts</div>
              </div>
            </div>

            {/* Detalhes adicionais */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center">
                <div className="text-xs text-gray-500">Disciplina</div>
                <div className="font-semibold">{nomeDisciplina}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Classificação</div>
                <div className="font-semibold">{posicao}º Lugar</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Casos Resolvidos</div>
                <div className="font-semibold">{participante.casos_resolvidos || 0}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Data</div>
                <div className="font-semibold">{formatarData(dataEntrega || new Date())}</div>
              </div>
            </div>

            {/* Assinatura e selo */}
            <div className="flex items-end justify-between mt-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <img src={assinatura} alt="Assinatura" className="h-12 mb-1 opacity-70" />
                <div className="font-serif text-sm">Diretor Geral</div>
                <div className="text-xs text-gray-500">Comaes</div>
              </div>
              
              <div className="text-center">
                <div className="text-6xl mb-1">{config.medalha}</div>
                <div className="text-xs text-gray-500">Selo de Autenticidade</div>
              </div>

              <div className="text-center">
                <div className="font-bold text-blue-800">CERTIFICADO VÁLIDO</div>
                <div className="text-xs text-gray-500">ID: {participante.id || `${disciplina}-${Date.now()}`}</div>
              </div>
            </div>

            {/* Rodapé */}
            <div className="mt-6 text-center text-xs text-gray-400">
              Este certificado é concedido pela Comaes - Plataforma de Competições Educativas Online
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}