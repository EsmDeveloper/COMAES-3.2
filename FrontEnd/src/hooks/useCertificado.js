// src/hooks/useCertificado.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function useCertificado(disciplina, participante, ranking) {
  const { user } = useAuth();
  const [mostrarCertificado, setMostrarCertificado] = useState(false);
  const [certificadoData, setCertificadoData] = useState(null);
  const [jaExibido, setJaExibido] = useState(false);
  const [torneioAtivo, setTorneioAtivo] = useState(null);

  // Verificar se o torneio terminou e o usuário está no pódio
  useEffect(() => {
    const verificarCertificado = async () => {
      if (!participante || !user || jaExibido) return;

      try {
        // Buscar status do torneio
        const response = await fetch('http://localhost:3000/api/torneios/ativo');
        const data = await response.json();

        if (data.ativo && data.torneio) {
          setTorneioAtivo(data.torneio);
          const agora = new Date();
          const fim = new Date(data.torneio.termina_em);

          // Se o torneio terminou
          if (agora > fim) {
            // Verificar posição do usuário no ranking
            const posicaoUsuario = ranking.findIndex(r => r.usuario_id === user.id) + 1;

            // Se está entre os 3 primeiros
            if (posicaoUsuario >= 1 && posicaoUsuario <= 3 && !jaExibido) {
              // Verificar se já recebeu certificado (pode ser armazenado no localStorage)
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
                
                // Marcar como já exibido
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

  // Função para verificar disponibilidade explicitamente
  const verificarDisponibilidade = () => {
    if (!torneioAtivo) {
      setMensagemStatus('Informações do torneio não carregadas.');
      return false;
    }

    const agora = new Date();
    const fim = new Date(torneioAtivo.termina_em);

    if (agora < fim) {
      setMensagemStatus('O torneio ainda não terminou. Aguarde o encerramento para obter seu certificado.');
      return false;
    }

    const posicaoUsuario = ranking.findIndex(r => r.usuario_id === user?.id) + 1;
    if (posicaoUsuario === 0) {
      setMensagemStatus('Você não participou deste torneio ou ainda não possui pontuação.');
      return false;
    }

    setMensagemStatus('Certificado disponível! Preparando download...');
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
      // Se não estiver disponível, a mensagem já foi setada
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