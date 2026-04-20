 import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import logo from '../assets/vite1.png'; // ajuste o caminho conforme sua estrutura

const CertificateDisplay = ({
  userName,
  tournamentName,
  disciplina,
  position,
  score,
  certificateCode,
  totalParticipants = 187,        // opcional – pode vir da API
  percentile = 99.5,              // opcional
  issueDate = new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' }),
  onClose,
}) => {
  const certificateRef = useRef(null);

  // Posição por extenso
  const posicaoExtenso = {
    1: '1º LUGAR',
    2: '2º LUGAR',
    3: '3º LUGAR',
  }[position] || `${position}º LUGAR`;

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    try {
      const dataUrl = await toPng(certificateRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `certificado-${userName}-${tournamentName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      alert('Não foi possível salvar o certificado. Tente novamente.');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Meu Certificado COMAES',
        text: `Conquistei ${posicaoExtenso} no torneio ${tournamentName} (${disciplina}) com ${score} pontos!`,
        url: `${window.location.origin}/validador/${certificateCode}`,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/validador/${certificateCode}`);
      alert('Link de validação copiado para a área de transferência!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto border border-gray-100"
    >
      {/* Header com gradiente azul */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-6 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">🎓 Parabéns! Aqui está o seu Certificado</h2>
        <p className="text-blue-100">
          Você conquistou o {position}º lugar com {score} pontos em {disciplina}
        </p>
      </div>

      {/* Área do certificado (ref para download) */}
      <div className="p-8 bg-gray-50">
        <div
          ref={certificateRef}
          className="relative bg-white border-2 border-blue-200 rounded-xl shadow-lg overflow-hidden"
        >
          {/* Selo decorativo de fundo */}
          <div className="absolute top-10 right-10 text-8xl opacity-5 pointer-events-none select-none">
            🏆
          </div>

          {/* Borda dourada interna */}
          <div className="m-4 border-2 border-yellow-400/70 rounded-lg p-8 md:p-10">
            {/* Logo e título */}
            <div className="flex flex-col items-center text-center mb-6">
              <img src={logo} alt="COMAES" className="h-16 w-auto mb-3" />
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-blue-900 tracking-wide">
                CERTIFICADO DE RECONHECIMENTO ACADÉMICO
              </h1>
              <p className="text-blue-700 font-semibold text-lg mt-1">PLATAFORMA COMAES</p>
            </div>

            {/* Corpo do certificado */}
            <div className="text-center space-y-4">
              <p className="text-gray-700 text-lg">
                A Plataforma COMAES certifica que, em Luanda,
              </p>
              <p className="text-2xl md:text-3xl font-extrabold uppercase text-blue-800 tracking-wide">
                {userName}
              </p>
              <p className="text-gray-700 text-lg">
                Alcançou o <span className="font-bold text-yellow-600">{posicaoExtenso}</span> no{' '}
                <span className="font-semibold">{tournamentName}</span>.
              </p>

              {/* Detalhes adicionais */}
              <div className="bg-blue-50 rounded-lg p-4 mt-4 max-w-md mx-auto">
                <p className="text-gray-700">
                  Total de Participantes: <span className="font-bold text-blue-800">{totalParticipants}</span>
                </p>
                <p className="text-gray-700">
                  Pontuação Final: <span className="font-bold text-blue-800">{score}%</span>
                </p>
                <p className="text-gray-700">
                  Percentil: <span className="font-bold text-blue-800">{percentile}º</span> (Melhor Desempenho)
                </p>
              </div>

              <p className="text-gray-600 italic">
                Emitido aos {issueDate}.
              </p>

              {/* Assinatura */}
              <div className="mt-8 pt-4 border-t border-gray-200">
                <p className="font-serif text-gray-800">PROF. DR. ANTÓNIO SILVA</p>
                <p className="text-sm text-gray-500">Diretor de Avaliação e Desempenho</p>
              </div>

              {/* Código de validação */}
              <div className="mt-4 text-xs text-gray-400 font-mono">
                Código: {certificateCode}
              </div>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-medium transition-colors shadow-md"
          >
            <Download size={20} />
            Baixar Certificado (PNG)
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-3 px-6 rounded-xl font-medium transition-colors border border-indigo-200"
          >
            <Share2 size={20} />
            Partilhar e Validar
          </button>
        </div>

        {onClose && (
          <div className="mt-4 text-center">
            <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">
              Fechar
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CertificateDisplay;