// src/certificados/CertificadoDownload.jsx
import React from 'react';
import { toPng } from 'html-to-image';

export default function CertificadoDownload({ certificadoRef, filename }) {
  const downloadCertificado = async () => {
    if (certificadoRef.current) {
      try {
        const dataUrl = await toPng(certificadoRef.current, {
          quality: 0.95,
          pixelRatio: 2,
          backgroundColor: '#ffffff'
        });
        
        const link = document.createElement('a');
        link.download = filename || 'certificado-comaes.png';
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Erro ao baixar certificado:', error);
      }
    }
  };

  return (
    <button
      onClick={downloadCertificado}
      className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
    >
      📥 Baixar Certificado
    </button>
  );
}