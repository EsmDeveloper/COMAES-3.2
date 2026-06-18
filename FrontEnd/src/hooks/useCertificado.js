// src/hooks/useCertificado.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function useCertificado(disciplina, participante, ranking) {
  const { user } = useAuth();
  const [mostrarCertificado, setMostrarCertificado] = useState(false);
  const [certificadoData, setCertificadoData] = useState(null);
  const [jaExibido, setJaExibido] = useState(false);
  const [torneioAtivo, setTorneioAtivo] = useState(null);

  // Verificar se o torneio terminou e o usuÃ¡rio estÃ¡ no pÃ³dio
  useEffect(() => {
    const verificarCertificado = async () => {
      if (!participante || !user || jaExibido) return;

      try {
        // Buscar status do torneio
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3002`}/api/torneios/ativo`);
        const data = await response.json();

        if (data.ativo && data.torneio) {
          setTorneioAtivo(data.torneio);
          const agora = new Date();
          const fim = new Date(data.torneio.termina_em);

          // Se o torneio terminou
          if (agora > fim) {
            // Verificar posiÃ§Ã£o do usuÃ¡rio no ranking
            const posicaoUsuario = ranking.findIndex(r => r.usuario_id === user.id) + 1;

            // Se estÃ¡ entre os 3 primeiros E tem pontuaÃ§Ã£o real
            if (posicaoUsuario >= 1 && posicaoUsuario <= 3 && !jaExibido) {
              // Verificar se o usuÃ¡rio realmente pontuou
              const meuDado = ranking.find(r => r.usuario_id === user.id);
              const pontuacaoReal = parseFloat(meuDado?.pontuacao || 0) > 0;
              if (!pontuacaoReal) return; // sem pontuaÃ§Ã£o â€” nÃ£o gerar certificado automÃ¡tico
              // Verificar se jÃ¡ recebeu certificado (pode ser armazenado no localStorage)
              const certificadoKey = `certificado_${disciplina}_${user.id}_${data.torneio.id}`;
              const certificadoRecebido = localStorage.getItem(certificadoKey);

              if (!certificadoRecebido) {
                setCertificadoData({
                  posicao: posicaoUsuario,
                  participante: {
                    ...participante,
                    usuario: {
                      nome: user.nome,
                      imagem: user.imagem
                    }
                  },
                  torneio: data.torneio
                });
                setMostrarCertificado(true);
                setJaExibido(true);
                
                // Marcar como jÃ¡ exibido
                localStorage.setItem(certificadoKey, 'true');
              }
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar certificado:', error);
      }
    };

    verificarCertificado();
  }, [participante, user, ranking, disciplina, jaExibido]);

  const fecharCertificado = () => {
    setMostrarCertificado(false);
  };

  const [mensagemStatus, setMensagemStatus] = useState('');

  // FunÃ§Ã£o para verificar disponibilidade explicitamente
  const verificarDisponibilidade = () => {
    if (!torneioAtivo) {
      setMensagemStatus('InformaÃ§Ãµes do torneio nÃ£o carregadas.');
      return false;
    }

    const agora = new Date();
    const fim = new Date(torneioAtivo.termina_em);

    if (agora < fim) {
      setMensagemStatus('O torneio ainda nÃ£o terminou. Aguarde o encerramento para obter seu certificado.');
      return false;
    }

    const posicaoUsuario = ranking.findIndex(r => r.usuario_id === user?.id) + 1;
    if (posicaoUsuario === 0) {
      setMensagemStatus('VocÃª nÃ£o participou deste torneio ou ainda nÃ£o possui pontuaÃ§Ã£o.');
      return false;
    }

    // Verificar se o usuÃ¡rio tem pontuaÃ§Ã£o real
    const meuDado = ranking.find(r => r.usuario_id === user?.id);
    const pontuacaoReal = parseFloat(meuDado?.pontuacao || 0) > 0;
    if (!pontuacaoReal) {
      setMensagemStatus('Certificado disponÃ­vel apenas para participantes com pontuaÃ§Ã£o vÃ¡lida.');
      return false;
    }

    setMensagemStatus('Certificado disponÃ­vel! Preparando download...');
    return true;
  };

  const abrirCertificado = () => {
    if (verificarDisponibilidade()) {
      const posicaoUsuario = ranking.findIndex(r => r.usuario_id === user.id) + 1;
      setCertificadoData({
        posicao: posicaoUsuario,
        participante: {
          ...participante,
          usuario: {
            nome: user.nome,
            imagem: user.imagem
          }
        },
        torneio: torneioAtivo
      });
      setMostrarCertificado(true);
    } else {
      // Se nÃ£o estiver disponÃ­vel, a mensagem jÃ¡ foi setada
      alert(mensagemStatus);
    }
  };

  return {
    mostrarCertificado,
    certificadoData,
    mensagemStatus,
    fecharCertificado,
    abrirCertificado,
    verificarDisponibilidade
  };
}

