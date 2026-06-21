// src/components/ModalVencedores.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaMedal, FaAward, FaTimes, FaCrown } from 'react-icons/fa';
import logotipo from '../assets/logotipo.png';

export default function ModalVencedores({ isOpen, onClose, vencedores, disciplina, torneio }) {
  const [showModal, setShowModal] = useState(isOpen);

  useEffect(() => {
    setShowModal(isOpen);
  }, [isOpen]);

  if (!showModal || !vencedores || vencedores.length === 0) return null;

  const medalhas = {
    1: { icone: <FaCrown className="text-yellow-500" />, cor: 'from-yellow-400 to-yellow-600', bg: 'bg-yellow-100', texto: 'text-yellow-800', label: '1º Lugar' },
    2: { icone: <FaMedal className="text-gray-400" />, cor: 'from-gray-300 to-gray-500', bg: 'bg-gray-100', texto: 'text-gray-800', label: '2º Lugar' },
    3: { icone: <FaAward className="text-amber-600" />, cor: 'from-amber-500 to-amber-700', bg: 'bg-amber-100', texto: 'text-amber-800', label: '3º Lugar' }
  };

  const getDisciplinaNome = (disc) => {
    const nomes = {
      'Matemática': 'Matemática',
      'Inglês': 'Inglês',
      'Programação': 'Programação'
    };
    return nomes[disc] || disc;
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative max-w-3xl w-full"
          >
            {/* Botão fechar */}
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 text-white hover:text-blue-300 transition-colors flex items-center gap-2"
            >
              <FaTimes /> Fechar
            </button>

            {/* Modal */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl overflow-hidden border-4 border-blue-600">
              {/* Cabeçalho */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 text-center">
                <div className="flex justify-center mb-4">
                  <img src={logotipo} alt="Comaes" className="h-12 object-contain bg-white rounded-lg p-1" />
                </div>
                <h2 className="text-3xl font-bold mb-2">[TROPHY] TORNEIO FINALIZADO [TROPHY]</h2>
                <p className="text-blue-100">{torneio?.titulo || `Torneio de ${getDisciplinaNome(disciplina)}`}</p>
                <p className="text-sm text-blue-200 mt-2">
                  Finalizado em {formatarData(torneio?.termina_em || new Date())}
                </p>
              </div>

              {/* Conteúdo */}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
                  [CELEBRATE] VENCEDORES DO TORNEIO [CELEBRATE]
                </h3>

                {/* Pódio */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* 2º Lugar (aparece à esquerda) */}
                  {vencedores[1] && (
                    <motion.div
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className={`${medalhas[2].bg} rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300 border-2 border-gray-300 relative`}
                    >
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        2º Lugar
                      </div>
                      <div className="text-5xl mb-3">{medalhas[2].medalha}</div>
                      {vencedores[1].usuario?.imagem ? (
                        <img 
                          src={vencedores[1].usuario.imagem} 
                          alt={vencedores[1].usuario.nome}
                          className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-gray-300 object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-gray-300">
                          {vencedores[1].usuario?.nome?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                        </div>
                      )}
                      <h4 className="text-xl font-bold text-gray-800 mb-1">
                        {vencedores[1].usuario?.nome || 'Participante'}
                      </h4>
                      <p className="text-gray-600 text-sm mb-2">Vice-Campeão</p>
                      <div className="bg-gray-200 rounded-lg p-2">
                        <p className="text-gray-800 font-semibold">{vencedores[1].pontuacao} pts</p>
                        <p className="text-xs text-gray-600">{vencedores[1].casos_resolvidos || 0} casos</p>
                      </div>
                    </motion.div>
                  )}

                  {/* 1º Lugar (centro, maior) */}
                  {vencedores[0] && (
                    <motion.div
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className={`${medalhas[1].bg} rounded-xl p-6 text-center transform scale-105 hover:scale-110 transition-all duration-300 border-2 border-yellow-500 relative shadow-xl`}
                    >
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                        [TROPHY] CAMPEÃO [TROPHY]
                      </div>
                      <div className="text-6xl mb-3">{medalhas[1].medalha}</div>
                      {vencedores[0].usuario?.imagem ? (
                        <img 
                          src={vencedores[0].usuario.imagem} 
                          alt={vencedores[0].usuario.nome}
                          className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-yellow-500 object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full mx-auto mb-3 bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-yellow-500">
                          {vencedores[0].usuario?.nome?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                        </div>
                      )}
                      <h4 className="text-2xl font-bold text-gray-800 mb-1">
                        {vencedores[0].usuario?.nome || 'Participante'}
                      </h4>
                      <p className="text-gray-600 text-sm mb-2">Campeão</p>
                      <div className="bg-yellow-200 rounded-lg p-2">
                        <p className="text-yellow-800 font-bold text-lg">{vencedores[0].pontuacao} pts</p>
                        <p className="text-xs text-yellow-700">{vencedores[0].casos_resolvidos || 0} casos resolvidos</p>
                      </div>
                    </motion.div>
                  )}

                  {/* 3º Lugar (aparece à direita) */}
                  {vencedores[2] && (
                    <motion.div
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className={`${medalhas[3].bg} rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300 border-2 border-amber-500 relative`}
                    >
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        3º Lugar
                      </div>
                      <div className="text-5xl mb-3">{medalhas[3].medalha}</div>
                      {vencedores[2].usuario?.imagem ? (
                        <img 
                          src={vencedores[2].usuario.imagem} 
                          alt={vencedores[2].usuario.nome}
                          className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-amber-500 object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white text-2xl font-bold border-4 border-amber-500">
                          {vencedores[2].usuario?.nome?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                        </div>
                      )}
                      <h4 className="text-xl font-bold text-gray-800 mb-1">
                        {vencedores[2].usuario?.nome || 'Participante'}
                      </h4>
                      <p className="text-gray-600 text-sm mb-2">Terceiro Lugar</p>
                      <div className="bg-amber-200 rounded-lg p-2">
                        <p className="text-amber-800 font-semibold">{vencedores[2].pontuacao} pts</p>
                        <p className="text-xs text-amber-700">{vencedores[2].casos_resolvidos || 0} casos</p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Mensagem de agradecimento */}
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <p className="text-blue-800 mb-2">
                    <span className="font-bold">Parabéns aos vencedores! [CELEBRATE]</span>
                  </p>
                  <p className="text-sm text-blue-600">
                    Agradecemos a todos os participantes pelo empenho e dedicação.
                    Continuem treinando para os próximos torneios!
                  </p>
                </div>

                {/* Estatísticas do torneio */}
                <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-gray-100 p-2 rounded">
                    <span className="text-gray-600">Total Participantes</span>
                    <p className="font-bold text-gray-800">{vencedores.length > 0 ? vencedores[0].total_participantes || 'N/A' : 'N/A'}</p>
                  </div>
                  <div className="bg-gray-100 p-2 rounded">
                    <span className="text-gray-600">Disciplina</span>
                    <p className="font-bold text-gray-800">{getDisciplinaNome(disciplina)}</p>
                  </div>
                  <div className="bg-gray-100 p-2 rounded">
                    <span className="text-gray-600">Status</span>
                    <p className="font-bold text-green-600">Finalizado</p>
                  </div>
                </div>

                {/* Botão de ação */}
                <div className="mt-8 text-center">
                  <button
                    onClick={onClose}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}