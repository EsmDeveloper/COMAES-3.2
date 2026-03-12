// src/hooks/useTorneio.js (VERSÃO CORRIGIDA)
import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:3000';

export const useTorneio = (disciplina, userId) => {
  const [torneio, setTorneio] = useState(null);
  const [participante, setParticipante] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progresso, setProgresso] = useState(0);
  const [tempoRestante, setTempoRestante] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
  const [dentroDoPeriodo, setDentroDoPeriodo] = useState(false);
  const [error, setError] = useState(null);

  // Contador de progresso
  const iniciarContadorProgresso = useCallback((torneioData) => {
    if (!torneioData?.inicia_em || !torneioData?.termina_em) return null;
    
    const calcularProgresso = () => {
      const inicio = new Date(torneioData.inicia_em).getTime();
      const fim = new Date(torneioData.termina_em).getTime();
      const agora = new Date().getTime();
      
      const estaDentroDoPeriodo = agora >= inicio && agora <= fim;
      setDentroDoPeriodo(estaDentroDoPeriodo);
      
      if (!estaDentroDoPeriodo) {
        setProgresso(agora > fim ? 100 : 0);
        setTempoRestante({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
        return;
      }
      
      const totalDuracao = fim - inicio;
      const tempoDecorrido = agora - inicio;
      const progressoPercentual = Math.min(100, Math.max(0, (tempoDecorrido / totalDuracao) * 100));
      setProgresso(progressoPercentual);

      const tempoRestanteMs = fim - agora;
      if (tempoRestanteMs > 0) {
        const dias = Math.floor(tempoRestanteMs / (1000 * 60 * 60 * 24));
        const horas = Math.floor((tempoRestanteMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((tempoRestanteMs % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((tempoRestanteMs % (1000 * 60)) / 1000);
        setTempoRestante({ dias, horas, minutos, segundos });
      }
    };

    calcularProgresso();
    return setInterval(calcularProgresso, 1000);
  }, []);

  // Verificar torneio ativo - USANDO A ROTA CORRETA
  const verificarTorneioAtivo = useCallback(async () => {
    try {
      console.log('🔍 Verificando torneio ativo via API...');
      const response = await fetch(`${API_BASE}/api/torneios/ativo`);
      const data = await response.json();
      
      console.log('📊 Resposta da API torneios/ativo:', data);
      
      if (data.ativo && data.torneio) {
        console.log('✅ Torneio ativo encontrado:', data.torneio.titulo);
        setTorneio(data.torneio);
        return data.torneio;
      } else {
        console.log('⚠️ Nenhum torneio ativo encontrado');
        setTorneio(null);
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao verificar torneio:', error);
      setError('Erro ao conectar com o servidor');
      return null;
    }
  }, []);

  // Buscar ranking por disciplina - USANDO A ROTA CORRETA
  const buscarRanking = useCallback(async (torneioId) => {
    if (!torneioId || !disciplina) {
      console.log('⚠️ Sem torneio ou disciplina para buscar ranking');
      return [];
    }
    
    try {
      const disciplinaFormatada = disciplina.toLowerCase();
      console.log('📊 Buscando ranking para:', disciplinaFormatada);
      
      const response = await fetch(`${API_BASE}/api/participantes/ranking/${disciplinaFormatada}`);
      const data = await response.json();
      
      console.log('📈 Ranking recebido:', data.data?.length || 0, 'participantes');
      
      if (data.success) {
        setRanking(data.data || []);
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('❌ Erro ao buscar ranking:', error);
      return [];
    }
  }, [disciplina]);

  // Buscar dados do usuário por disciplina - USANDO A ROTA CORRETA
  const buscarDadosUsuario = useCallback(async (torneioId) => {
    if (!userId || !torneioId || !disciplina) {
      console.log('⚠️ Dados insuficientes para buscar usuário');
      return null;
    }
    
    try {
      const disciplinaFormatada = disciplina.toLowerCase();
      console.log('👤 Buscando dados do usuário:', { userId, disciplina: disciplinaFormatada });
      
      const response = await fetch(`${API_BASE}/api/participantes/usuario/${userId}/${disciplinaFormatada}`);
      
      if (response.status === 404) {
        console.log('⚠️ Usuário não encontrado como participante');
        return null;
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        console.log('✅ Dados do participante encontrados:', data.data);
        setParticipante(data.data);
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar dados do usuário:', error);
      return null;
    }
  }, [userId, disciplina]);

  // Atualizar pontuação - USANDO A ROTA CORRETA
  const atualizarPontuacao = useCallback(async (pontosAdicionados, casosAdicionados = 1) => {
    if (!participante?.usuario_id || !disciplina) {
      console.log('⚠️ Dados insuficientes para atualizar pontuação');
      return null;
    }
    
    try {
      console.log('📈 Atualizando pontuação:', { 
        usuario_id: participante.usuario_id, 
        disciplina, 
        pontos: pontosAdicionados 
      });
      
      const response = await fetch(`${API_BASE}/api/participantes/atualizar-pontuacao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: participante.usuario_id,
          disciplina_competida: disciplina.charAt(0).toUpperCase() + disciplina.slice(1),
          pontuacao_adicionada: pontosAdicionados,
          casos_adicionados: casosAdicionados
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        console.log('✅ Pontuação atualizada com sucesso');
        setParticipante(data.data);
        
        // Atualizar ranking
        if (torneio?.id) {
          await buscarRanking(torneio.id);
        }
        
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('❌ Erro ao atualizar pontuação:', error);
      return null;
    }
  }, [participante, disciplina, torneio?.id, buscarRanking]);

  // Registrar participante - USANDO A ROTA CORRETA
  const registrarParticipante = useCallback(async () => {
    if (!userId || !disciplina || !torneio?.id) {
      console.log('⚠️ Dados insuficientes para registrar participante');
      return null;
    }
    
    try {
      console.log('👤 Registrando participante:', { userId, disciplina, torneioId: torneio.id });
      
      const response = await fetch(`${API_BASE}/api/participantes/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: userId,
          disciplina_competida: disciplina
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Participante registrado com sucesso:', data.data);
        setParticipante(data.data);
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('❌ Erro ao registrar participante:', error);
      return null;
    }
  }, [userId, disciplina, torneio?.id]);

  useEffect(() => {
    let interval;
    let isMounted = true;

    const init = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      console.log('🔄 Inicializando hook useTorneio para disciplina:', disciplina);
      
      // 1. Buscar torneio ativo
      const torneioAtual = await verificarTorneioAtivo();
      
      if (torneioAtual && isMounted) {
        console.log('🎯 Torneio encontrado, iniciando contador...');
        
        // 2. Iniciar contador de progresso
        interval = iniciarContadorProgresso(torneioAtual);
        
        // 3. Buscar dados do usuário
        await buscarDadosUsuario(torneioAtual.id);
        
        // 4. Se não tiver participante e tiver userId, tentar registrar
        if (!participante && userId && torneioAtual) {
          console.log('👤 Usuário não encontrado, tentando registrar...');
          await registrarParticipante();
        }
        
        // 5. Buscar ranking
        await buscarRanking(torneioAtual.id);
        
        console.log('✅ Hook useTorneio inicializado com sucesso');
      } else if (isMounted) {
        console.log('⚠️ Nenhum torneio ativo encontrado');
        setTorneio(null);
      }
      
      if (isMounted) setLoading(false);
    };

    init();
    
    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [userId, disciplina, verificarTorneioAtivo, iniciarContadorProgresso, buscarDadosUsuario, registrarParticipante, buscarRanking, participante]);

  return {
    torneio, 
    participante, 
    ranking, 
    loading, 
    progresso, 
    tempoRestante, 
    dentroDoPeriodo, 
    error,
    atualizarPontuacao,
    registrarParticipante,
    buscarRanking,
    buscarDadosUsuario
  };
};