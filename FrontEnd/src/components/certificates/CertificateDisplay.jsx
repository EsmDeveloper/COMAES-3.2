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
  totalParticipants = 187,
  percentile = 99.5,
  issueDate = new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' }),
  onClose,
}) => {
  const certificateRef = useRef(null);

  // Download como PNG
  const handleDownload = async () => {
    if (!certificateRef.current) return;
    try {
      const dataUrl = await toPng(certificateRef.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `Certificado-COMAES-${userName.replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      alert('Tente novamente.');
    }
  };

  const handleShare = () => {
    const validatorUrl = `${window.location.origin}/validador/${certificateCode}`;
    if (navigator.share) {
      navigator.share({
        title: 'Meu Certificado COMAES',
        text: `Conquistei o ${position}º lugar no torneio ${tournamentName}!`,
        url: validatorUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(validatorUrl);
      alert('Link copiado!');
    }
  };

  const watermarkText = Array(20).fill('COMAES').join(' ');

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-5xl mx-auto p-4 animate-in fade-in duration-700">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,700&display=swap');
        
        .certificate-container {
          font-family: 'Playfair Display', Georgia, serif;
          background: #ffffff;
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
          position: relative;
          width: 100%;
          aspect-ratio: 1.415 / 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          color: #1a1a1a;
        }

        .cert-watermark {
          position: absolute;
          inset: 0;
          overflow: hidden;
          display: flex;
          flex-wrap: wrap;
          align-content: flex-start;
          padding: 8px;
          z-index: 0;
          pointer-events: none;
          color: #2055a8;
          opacity: 0.06;
          font-weight: 600;
          font-size: clamp(8px, 1.2vw, 12px);
          letter-spacing: 0.2em;
          line-height: 2.5;
        }

        .cert-outer-border {
          position: absolute;
          inset: 0;
          border: clamp(2px, 0.4vw, 5px) solid #1a3a6b;
          z-index: 5;
        }

        .cert-inner-border {
          position: absolute;
          inset: clamp(6px, 1vw, 15px);
          border: clamp(1px, 0.15vw, 2px) solid #1a3a6b;
          z-index: 5;
        }

        .cert-corner {
          position: absolute;
          width: clamp(30px, 6vw, 80px);
          height: clamp(30px, 6vw, 80px);
          z-index: 6;
        }

        .cert-corner-tl { top: 0; left: 0; }
        .cert-corner-tr { top: 0; right: 0; }
        .cert-corner-bl { bottom: 0; left: 0; }
        .cert-corner-br { bottom: 0; right: 0; }

        .cert-corner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: #3a7dd9;
        }

        .cert-corner-tl::before { clip-path: polygon(0 0, 100% 0, 100% 24%, 24% 24%, 24% 100%, 0 100%); }
        .cert-corner-tr::before { clip-path: polygon(0 0, 100% 0, 100% 100%, 76% 100%, 76% 24%, 0 24%); }
        .cert-corner-bl::before { clip-path: polygon(0 0, 24% 0, 24% 76%, 100% 76%, 100% 100%, 0 100%); }
        .cert-corner-br::before { clip-path: polygon(76% 0, 100% 0, 100% 100%, 0 100%, 0 76%, 76% 76%); }

        .cert-layout {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: clamp(10px, 2vw, 25px) clamp(30px, 6vw, 80px) 0;
        }

        .cert-top { display: flex; flex-direction: column; align-items: center; text-align: center; }
        .cert-dots { color: #a0b4cc; letter-spacing: 0.3em; font-size: clamp(6px, 1vw, 10px); margin-bottom: 0.5em; }
        
        .cert-seal {
          width: clamp(50px, 8vw, 100px);
          height: clamp(50px, 8vw, 100px);
          background: white;
          border-radius: 50%;
          border: 2px solid #1a3a6b;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.8em;
          box-shadow: 0 5px 15px rgba(26,58,107,0.1);
          font-size: clamp(25px, 4vw, 50px);
        }

        .cert-title {
          font-size: clamp(14px, 2.5vw, 32px);
          font-weight: 800;
          color: #1a3a6b;
          text-transform: uppercase;
          line-height: 1.2;
        }

        .cert-subtitle {
          font-size: clamp(10px, 1.4vw, 18px);
          font-weight: 600;
          color: #1a3a6b;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-top: 0.2em;
        }

        .cert-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 1vw 0;
        }

        .cert-intro { font-size: clamp(10px, 1.5vw, 18px); color: #444; }
        .cert-user { 
          font-size: clamp(20px, 4.5vw, 52px); 
          font-weight: 800; 
          color: #1a3a6b; 
          text-transform: uppercase;
          margin: 0.2em 0;
        }
        .cert-achiev { font-size: clamp(10px, 1.6vw, 20px); color: #333; }
        
        .cert-divider { 
          width: 60%; 
          height: 1px; 
          background: #1a3a6b; 
          margin: 1.2em 0; 
          opacity: 0.8;
        }

        .cert-stats { font-size: clamp(9px, 1.3vw, 16px); line-height: 1.6; }
        .cert-date { font-size: clamp(9px, 1.3vw, 16px); font-style: italic; margin-top: 1em; color: #555; }

        .cert-bottom {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-bottom: clamp(10px, 2vw, 30px);
        }

        .cert-qr {
          width: clamp(60px, 9vw, 110px);
          height: clamp(60px, 9vw, 110px);
          border: 1px solid #1a3a6b;
          padding: 4px;
          background: white;
        }

        .cert-sign { text-align: center; width: 40%; }
        .cert-sign-line { height: 1.5px; background: #333; margin-bottom: 0.5em; }
        .cert-sign-name { font-size: clamp(10px, 1.4vw, 18px); font-weight: 700; color: #1a3a6b; text-transform: uppercase; }
        .cert-sign-title { font-size: clamp(8px, 1.1vw, 14px); color: #666; font-style: italic; }

        .cert-footer {
          background: #1a3a6b;
          width: 100%;
          padding: 0.8em 0;
          text-align: center;
          color: #ccdcf5;
          font-size: clamp(7px, 1vw, 12px);
          font-family: 'Inter', sans-serif;
        }
      `}</style>

      {/* Botões Superiores */}
      <div className="flex justify-between w-full no-print">
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 font-medium">
          ← Voltar
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold text-sm"
          >
            <Share2 size={16} /> Compartilhar
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold text-sm shadow-md"
          >
            <Download size={16} /> Baixar PNG
          </button>
        </div>
      </div>

      {/* Certificado */}
      <div ref={certificateRef} className="certificate-container">
        <div className="cert-watermark">
          {Array(300).fill('COMAES ').join(' ')}
        </div>
        
        <div className="cert-outer-border"></div>
        <div className="cert-inner-border"></div>
        <div className="cert-corner cert-corner-tl"></div>
        <div className="cert-corner cert-corner-tr"></div>
        <div className="cert-corner cert-corner-bl"></div>
        <div className="cert-corner cert-corner-br"></div>

        <div className="cert-layout">
          <div className="cert-top">
            <div className="cert-dots">................................................................................................</div>
            <div className="cert-seal">🦉</div>
            <h1 className="cert-title">Certificado de Reconhecimento Académico</h1>
            <p className="cert-subtitle">Plataforma COMAES</p>
          </div>

          <div className="cert-body">
            <p className="cert-intro">A Plataforma COMAES certifica que, em Luanda,</p>
            <h2 className="cert-user">{userName}</h2>
            <p className="cert-achiev">
              Alcançou o <strong>{position}º LUGAR</strong> no {tournamentName}.
            </p>
            
            <div className="cert-divider"></div>
            
            <div className="cert-stats">
              <p>Total de Participantes: <strong>{totalParticipants}</strong></p>
              <p>Pontuação Final: <strong>{score}%</strong></p>
              <p>Percentil: <strong>{percentile}º</strong> (Melhor Desempenho)</p>
            </div>
            
            <p className="cert-date">Emitido aos {issueDate}.</p>
          </div>

          <div className="cert-bottom">
            <div className="cert-qr flex items-center justify-center font-mono text-[8px] text-gray-400">
              QR CODE VERIFICATION
            </div>
            
            <div className="cert-sign">
              <div className="cert-sign-line"></div>
              <p className="cert-sign-name">PROF. DR. ANTÓNIO SILVA</p>
              <p className="cert-sign-title">Diretor de Avaliação e Desempenho</p>
            </div>
          </div>
        </div>

        <div className="cert-footer">
          Código de Verificação: <span className="font-bold">{certificateCode}</span> | Validar em: <span className="italic">plataformacomaes.com/validar</span>
        </div>
      </div>
      
      <p className="text-gray-400 text-xs text-center mt-2 max-w-md italic no-print">
        Este certificado físico possui os mesmos critérios de validade da versão digital, 
        podendo ser verificado a qualquer momento através do código oficial.
      </p>
    </div>
  );
};

export default CertificateDisplay;