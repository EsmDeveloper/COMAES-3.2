import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import CertificatePreview from '../preview/CertificatePreview';
import { Award, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const MeusCertificados = () => {
  const { user, token } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3002`}/api/certificates/user/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (data.success) {
          setCertificates(data.data);
          if (data.data.length > 0) {
            setSelectedCert(data.data[0]);
          }
        } else {
          setError(data.error || 'Erro ao carregar certificados');
        }
      } catch (err) {
        setError('Erro de conexÃ£o ao carregar certificados');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchCertificates();
    }
  }, [user, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Carregando seus certificados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold text-gray-900 sm:text-5xl"
          >
            Meus <span className="text-blue-600">Certificados</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto"
          >
            Acompanhe suas conquistas e valide seus certificados oficiais COMAES.
          </motion.p>
        </div>

        {error ? (
          <div className="text-center text-red-600 bg-red-50 p-4 rounded-xl max-w-2xl mx-auto">
            {error}
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <Award className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Nenhum certificado ainda</h3>
            <p className="text-gray-500 mb-6">Participe de torneios e conclua os desafios para conquistar seus primeiros certificados!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 px-2">Suas Conquistas</h3>
              {certificates.map((cert) => (
                <button
                  key={cert.id}
                  onClick={() => setSelectedCert(cert)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    selectedCert?.id === cert.id 
                      ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                      : 'bg-white hover:bg-blue-50 text-gray-700 border border-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${selectedCert?.id === cert.id ? 'bg-blue-500/30' : 'bg-blue-100'}`}>
                      <Award className={`w-6 h-6 ${selectedCert?.id === cert.id ? 'text-white' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{cert.torneio?.titulo || 'Torneio'}</h4>
                      <p className={`text-sm ${selectedCert?.id === cert.id ? 'text-blue-100' : 'text-gray-500'}`}>
                        Ãrea: {cert.disciplina}
                      </p>
                      <p className={`text-sm font-medium mt-2 ${selectedCert?.id === cert.id ? 'text-white' : 'text-gray-700'}`}>
                        {cert.ranking_position}Âº Lugar â€¢ {cert.score} pts
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="lg:col-span-2">
              {selectedCert && (
                <CertificatePreview 
                  certificateURL={selectedCert.certificate_url}
                  certificateCode={selectedCert.certificate_code}
                  userName={user.nome}
                  tournamentName={selectedCert.torneio?.titulo || 'Torneio COMAES'}
                  disciplina={selectedCert.disciplina}
                  position={selectedCert.ranking_position}
                  score={selectedCert.score}
                  isNew={false}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeusCertificados;

