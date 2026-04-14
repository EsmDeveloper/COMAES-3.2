import React, { useState } from 'react';
import { Download, FileDown, Printer, Share2, ArrowLeft, Loader2 } from 'lucide-react';

/**
 * Componente de barra de ações moderna para o certificado
 */
export default function CertificateActions({ onDownloadPDF, onDownloadPNG, onPrint, onShare, onBack }) {
  const [loading, setLoading] = useState({
    pdf: false,
    png: false,
    print: false,
    share: false
  });

  // Wrapper para simular estados de carregamento
  const handleAction = async (actionType, callback) => {
    setLoading(prev => ({ ...prev, [actionType]: true }));
    try {
      await callback();
    } finally {
      // Pequeno atraso para dar feedback visual de carregamento
      setTimeout(() => {
        setLoading(prev => ({ ...prev, [actionType]: false }));
      }, 800);
    }
  };

  return (
    <div className="certificate-actions-bar animate-[slideUpActions_0.6s_0.2s_both]">
      
      <button 
        onClick={onBack}
        className="action-btn btn-secondary"
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      <div className="flex-1 hidden md:block"></div>

      <button 
        onClick={() => handleAction('pdf', onDownloadPDF)}
        disabled={loading.pdf}
        className={`action-btn btn-primary ${loading.pdf ? 'loading-pulse' : ''}`}
        title="Baixar em formato PDF de alta qualidade"
      >
        {loading.pdf ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
        Download PDF
      </button>

      <button 
        onClick={() => handleAction('png', onDownloadPNG)}
        disabled={loading.png}
        className={`action-btn btn-secondary ${loading.png ? 'loading-pulse' : ''}`}
        title="Baixar como imagem (PNG)"
      >
        {loading.png ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
        Download PNG
      </button>

      <button 
        onClick={() => handleAction('print', onPrint)}
        disabled={loading.print}
        className={`action-btn btn-secondary ${loading.print ? 'loading-pulse' : ''}`}
        title="Imprimir certificado oficial"
      >
        {loading.print ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
        Imprimir
      </button>

      <button 
        onClick={() => handleAction('share', onShare)}
        disabled={loading.share}
        className={`action-btn btn-secondary ${loading.share ? 'loading-pulse' : ''}`}
        title="Compartilhar sua conquista"
      >
        {loading.share ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
        Compartilhar
      </button>
      
    </div>
  );
}
