// src/hooks/useVencedores.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Exibe o modal de vencedores apenas quando o torneio terminou
 * E pelo menos um participante tem pontuação real (> 0).
 */
export default function useVencedores(disciplina, ranking, torneio, participante) {
  const { user } = useAuth();
  const [mostrarVencedores, setMostrarVencedores]   = useState(false);
  const [vencedores, setVencedores]                 = useState([]);
  const [jaExibidoVencedores, setJaExibidoVencedores] = useState(false);

  useEffect(() => {
    const verificarVencedores = async () => {
      if (!torneio || jaExibidoVencedores) return;

      const agora = new Date();
      const fim   = new Date(torneio.termina_em);
      if (agora <= fim) return; // torneio ainda em andamento

      const vencedoresKey  = `vencedores_${disciplina}_${torneio.id}`;
      const jaExibido      = localStorage.getItem(vencedoresKey);
      if (jaExibido) return;

      // Precisa de pelo menos 3 participantes no ranking
      if (!ranking || ranking.length < 3) return;

      // Verificar se há pontuação real — pelo menos um participante com pts > 0
      const algumPontuou = ranking.some(p => parseFloat(p.pontuacao || 0) > 0);
      if (!algumPontuou) return; // torneio sem pontuação válida — não exibir modal de vencedores

      // Filtrar apenas participantes com pontuação real (> 0) para o pódio
      const rankingComPontuacao = ranking.filter(p => parseFloat(p.pontuacao || 0) > 0);
      if (rankingComPontuacao.length === 0) return;

      const top3 = rankingComPontuacao.slice(0, 3).map((p, index) => ({
        ...p,
        posicao: index + 1,
        total_participantes: ranking.length,
      }));

      setVencedores(top3);
      setMostrarVencedores(true);
      setJaExibidoVencedores(true);

      localStorage.setItem(vencedoresKey, JSON.stringify({
        exibido: true,
        timestamp: new Date().toISOString(),
      }));
    };

    verificarVencedores();
  }, [torneio, ranking, disciplina, jaExibidoVencedores]);

  return {
    mostrarVencedores,
    vencedores,
    fecharVencedores: () => setMostrarVencedores(false),
  };
}
