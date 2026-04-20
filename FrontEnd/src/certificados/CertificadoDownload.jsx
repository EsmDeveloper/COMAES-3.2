import React, { useState } from 'react';
import * as htmlToImage from 'html-to-image';
import { Download, Loader2 } from 'lucide-react';

export default function CertificadoDownload({ certificadoRef, filename }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!certificadoRef?.current) return;

    setDownloading(true);
    try {
      const dataUrl = await htmlToImage.toPng(certificadoRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = filename || 'certificado-comaes.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      alert('Não foi possível salvar o certificado. Tente novamente.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
    >
      {downloading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Salvando...</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          <span>Baixar certificado</span>
        </>
      )}
    </button>
  );
}