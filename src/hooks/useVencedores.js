// src/hooks/useVencedores.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function useVencedores(disciplina, ranking, torneio, participante) {
  const { user } = useAuth();
  const [mostrarVencedores, setMostrarVencedores] = useState(false);
  const [vencedores, setVencedores] = useState([]);
  const [jaExibidoVencedores, setJaExibidoVencedores] = useState(false);

  useEffect(() => {
    const verificarVencedores = async () => {
      if (!torneio || jaExibidoVencedores) return;

      try {
        const agora = new Date();
        const fim = new Date(torneio.termina_em);

        // Se o torneio terminou
        if (agora > fim) {
          // Verificar se já exibiu o modal de vencedores para este torneio
          const vencedoresKey = `vencedores_${disciplina}_${torneio.id}`;
          const vencedoresExibido = localStorage.getItem(vencedoresKey);

          if (!vencedoresExibido && ranking.length >= 3) {
            // Pegar os 3 primeiros colocados
            const top3 = ranking.slice(0, 3).map((p, index) => ({
              ...p,
              posicao: index + 1
            }));

            // Adicionar total de participantes
            const vencedoresComTotal = top3.map(v => ({
              ...v,
              total_participantes: ranking.length
            }));

            setVencedores(vencedoresComTotal);
            setMostrarVencedores(true);
            setJaExibidoVencedores(true);
            
            // Marcar como já exibido (expira em 7 dias)
            localStorage.setItem(vencedoresKey, JSON.stringify({
              exibido: true,
              timestamp: new Date().toISOString()
            }));
          }
        }
      } catch (error) {
        console.error('Erro ao verificar vencedores:', error);
      }
    };

    verificarVencedores();
  }, [torneio, ranking, disciplina, jaExibidoVencedores]);

  const fecharVencedores = () => {
    setMostrarVencedores(false);
  };

  return {
    mostrarVencedores,
    vencedores,
    fecharVencedores
  };
}