import React from 'react';
import { Download, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

const CertificatePreview = ({ certificateURL, certificateCode, userName, tournamentName, disciplina, position, score, isNew }) => {
  const fullURL = certificateURL.startsWith('http') 
    ? certificateURL 
    : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${certificateURL}`;

  const handleDownload = () => {
    // Open in new tab which will download or display the PDF depending on browser
    window.open(fullURL, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Meu Certificado COMAES',
        text: `Concluí o torneio ${tournamentName} com sucesso na área de ${disciplina}!`,
        url: `${window.location.origin}/validador/${certificateCode}`,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/validador/${certificateCode}`);
      alert('Link copiado para a área de transferência!');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto border border-gray-100"
    >
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">
          {isNew ? 'Parabéns! Aqui está o seu Certificado' : 'Seu Certificado'}
        </h2>
        <p className="text-blue-100">
          Você conquistou o {position}º lugar com {score} pontos
        </p>
      </div>
      
      <div className="p-8">
        <div className="aspect-[1.414/1] w-full bg-gray-100 rounded-lg overflow-hidden relative shadow-inner border border-gray-200">
          <iframe 
            src={`${fullURL}#toolbar=0&navpanes=0&scrollbar=0`} 
            className="w-full h-full"
            title="Preview do Certificado"
          />
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-medium transition-colors shadow-md hover:shadow-lg"
          >
            <Download size={20} />
            Baixar Certificado PDF
          </button>
          
          <button 
            onClick={handleShare}
            className="flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-3 px-6 rounded-xl font-medium transition-colors border border-indigo-200"
          >
            <Share2 size={20} />
            Partilhar e Mostrar
          </button>
        </div>

        <div className="mt-6 flex justify-center text-sm text-gray-500">
          Código de Validação: <span className="font-mono font-medium text-gray-700 ml-2">{certificateCode}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default CertificatePreview;
