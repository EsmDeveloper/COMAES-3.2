import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CertificateActions from './CertificateActions';
import './certificate.css';

/**
 * CertificateViewer: Visualizador Profissional de Certificados COMAES
 */
export default function CertificateViewer({ 
  certificateURL, 
  certificateCode, 
  userName, 
  tournamentName, 
  disciplina, 
  position, 
  score,
  onClose,
  modalMode = false
}) {
  const containerRef = useRef(null);

  // Determinar a URL completa do certificado
  const fullURL = certificateURL.startsWith('http') 
    ? certificateURL 
    : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${certificateURL}`;

  // Ação: Download PDF
  const handleDownloadPDF = () => {
    const link = document.createElement('a');
    link.href = fullURL;
    link.download = `Certificado-COMAES-${userName.replace(/\s+/g, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Ação: Download PNG (Simulação ou implementação via Canvas se possível)
  const handleDownloadPNG = () => {
    // Nota: Para extrar PNG de PDF no frontend, normalmente se usa pdf.js
    // Como demonstração, abriremos o PDF em uma nova aba com instrução de salvar como imagem,
    // ou simplesmente baixaremos o PDF informando o formato.
    alert('A funcionalidade de conversão direta para PNG (Frontend) requer a biblioteca pdf.js. Por enquanto, você será redirecionado para a versão de alta qualidade.');
    window.open(fullURL, '_blank');
  };

  // Ação: Imprimir
  const handlePrint = () => {
    const printWindow = window.open(fullURL, '_blank');
    if (printWindow) {
      printWindow.focus();
      // Alguns browsers permitem disparar o print diretamente se for PDF
      // Mas o comportamento padrão confiável é abrir e o usuário imprimir
    }
  };

  // Ação: Compartilhar
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Meu Certificado COMAES',
        text: `Acabei de conquistar o ${position}º lugar no torneio ${tournamentName} de ${disciplina}!`,
        url: `${window.location.origin}/validar-certificado/${certificateCode}`,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/validar-certificado/${certificateCode}`);
      alert('Link de validação copiado para a área de transferência!');
    }
  };

  return (
    <div className={`certificate-viewer-container ${modalMode ? 'modal-mode' : ''}`} ref={containerRef}>
      <AnimatePresence>
        {/* Título e Feedback Visual */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 mt-10 md:mt-0"
        >
          <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
            Conquista Verificada
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-4 tracking-tight">
            Parabéns, {userName.split(' ')[0]}!
          </h1>
          <p className="text-gray-500 mt-2 max-w-lg mx-auto">
            Seu esforço e dedicação no torneio <strong>{tournamentName}</strong> resultaram nesta certificação oficial.
          </p>
        </motion.div>

        {/* O Certificado */}
        <div className="certificate-wrapper shadow-2xl">
          {/* Usamos iframe para preview do PDF gerado pelo backend */}
          <iframe 
            src={`${fullURL}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} 
            className="certificate-iframe"
            title="Preview oficial do Certificado COMAES"
            loading="lazy"
          />
          
          {/* Overlay de carregamento elegante enquanto o iframe não termina */}
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center -z-10">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-4 w-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>

        {/* Barra de Ações */}
        <CertificateActions 
          onDownloadPDF={handleDownloadPDF}
          onDownloadPNG={handleDownloadPNG}
          onPrint={handlePrint}
          onShare={handleShare}
          onBack={onClose}
        />

        {/* Footer info can be added here if needed */}
        <div className="mt-12 text-center text-gray-400 text-sm pb-10">
          <p>ID do Certificado: <span className="font-mono font-bold text-gray-500">{certificateCode}</span></p>
          <p className="mt-1 italic">© 2026 COMAES - Plataforma de Competições Educativas</p>
        </div>
      </AnimatePresence>
    </div>
  );
}
