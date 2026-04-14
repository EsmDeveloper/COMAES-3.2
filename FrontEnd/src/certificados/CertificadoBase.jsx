import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import CertificateViewer from '../components/certificates/CertificateViewer';
import { Loader2 } from 'lucide-react';

export default function CertificadoBase({ 
  isOpen, 
  onClose, 
  participante, 
  disciplina, 
  posicao,
  pontuacao,
  torneio
}) {
  const { user, token } = useAuth();
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && participante && torneio && user) {
      const processCertificate = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/certificates/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              userId: user.id || participante.usuario_id,
              tournamentId: torneio.id,
              disciplina: disciplina
            })
          });

          const data = await response.json();
          if (data.success) {
            setCertData(data);
          } else {
            setError(data.error || 'Erro ao gerar o certificado');
          }
        } catch (err) {
          setError('Erro de conexão com o servidor');
        } finally {
          setLoading(false);
        }
      };

      processCertificate();
    }
  }, [isOpen, participante, torneio, user, disciplina, token]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#f3f4f6] overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full h-full"
      >

        {loading ? (
          <div className="bg-white rounded-2xl p-12 flex flex-col items-center justify-center shadow-2xl">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
            <h3 className="text-2xl font-bold text-gray-800">Gerando seu Certificado...</h3>
            <p className="text-gray-500 mt-2">Por favor, aguarde enquanto validamos seus resultados e emitimos seu certificado oficial COMAES.</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 w-full max-w-2xl mx-auto shadow-xl">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">Erro ao emitir certificado: {error}</p>
                <div className="mt-4">
                  <button onClick={onClose} className="bg-red-100 text-red-800 px-4 py-2 rounded-md border border-red-200 hover:bg-red-200 transition">
                    Voltar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : certData ? (
          <CertificateViewer 
            certificateURL={certData.certificateURL}
            certificateCode={certData.certificateCode}
            userName={user?.nome || participante?.usuario?.nome || "Participante"}
            tournamentName={torneio?.titulo || "Torneio COMAES"}
            disciplina={disciplina}
            position={posicao || participante.posicao}
            score={pontuacao || participante.pontuacao}
            onClose={onClose}
          />
        ) : null}
      </motion.div>
    </div>
  );
}