import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaCrown, FaMedal, FaStar, FaUsers, FaClock, FaChartLine, FaSpinner } from "react-icons/fa";
import { IoClose, IoTrophy, IoSparkles } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { io } from "socket.io-client";
import Layout from "./Layout";
import imageTorneio from "../../assets/celebring.jpeg";

export default function EntrarTorneio() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [torneioAtivo, setTorneioAtivo] = useState(null);
  const [estatisticasParticipantes, setEstatisticasParticipantes] = useState(null);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [error, setError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [allDisciplinas] = useState([
    {
      id: "matematica",
      nome: "Matemática",
      imagem: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      cor: "from-blue-600 to-purple-600",
      nivel: "Intermediário",
      descricao: "Desafie suas habilidades matemáticas com problemas de álgebra, cálculo e lógica"
    },
    {
      id: "programacao",
      nome: "Programação",
      imagem: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      cor: "from-emerald-600 to-cyan-600",
      nivel: "Avançado",
      descricao: "Teste suas habilidades de codificação em algoritmos e estrutura de dados"
    },
    {
      id: "ingles",
      nome: "Inglês",
      imagem: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      cor: "from-rose-600 to-orange-500",
      nivel: "Todos os níveis",
      descricao: "Aprimore seu vocabulário e compreensão da língua inglesa"
    }
  ]);
  const [disciplinasDisponiveis, setDisciplinasDisponiveis] = useState(allDisciplinas);
  const [disciplinaEspecificaTorneio, setDisciplinaEspecificaTorneio] = useState(null);
  const [disciplinaUsuarioAtual, setDisciplinaUsuarioAtual] = useState(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;

  // Real-time com Socket.io
  useEffect(() => {
    const socket = io(apiBaseUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('🔌 Conectado ao Realtime COMAES');
    });

    // Atualização de participantes do torneio
    socket.on('tournament_stats_update', (data) => {
      console.log('📈 Update Realtime Participantes:', data);
      if (data.stats) setEstatisticasParticipantes(data.stats);
    });

    // Atualização de total de usuários (novos registros ou logins)
    socket.on('stats_update', (data) => {
      console.log('👥 Update Realtime Usuários:', data);
      if (typeof data.totalUsuarios === 'number') {
        setTotalUsuarios(data.totalUsuarios);
      }
    });

    // Atualização visual quando alguém loga (opcional)
    socket.on('login_update', (data) => {
      console.log('👤 Alguém entrou no sistema:', data.username);
      // Aqui poderíamos atualizar algo visual, mas o foco é o contador
    });

    return () => {
      socket.disconnect();
    };
  }, [apiBaseUrl]);

  // Verificar participação atual do usuário logado no torneio ativo (para genéricos)
  useEffect(() => {
    if (user && token && torneioAtivo && torneioAtivo.tipo_torneio === 'generico') {
      const verificarParticipacao = async () => {
        try {
          const res = await fetch(`${apiBaseUrl}/api/tournaments/usuario/${user.id}/participacao-ativa`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await res.json();
          
          if (data.ativo && data.torneio.id === torneioAtivo.id) {
            // Usuário já está participando este torneio em uma disciplina
            setDisciplinaUsuarioAtual(data.disciplina);
            console.log('👤 Usuário já participando em:', data.disciplina);
          } else {
            setDisciplinaUsuarioAtual(null);
          }
        } catch (err) {
          console.error('Erro ao verificar participação:', err);
          setDisciplinaUsuarioAtual(null);
        }
      };
      verificarParticipacao();
    } else {
      setDisciplinaUsuarioAtual(null);
    }
  }, [user, token, torneioAtivo, apiBaseUrl]);

  // Carregar dados iniciais (Torneio e Estatísticas)
  useEffect(() => {
    const carregarDados = async () => {
      setIsVerifying(true);
      setError(null);
      try {
        // 1. Buscar Status Geral (Total de Usuários)
        const statsRes = await fetch(`${apiBaseUrl}/api/stats/global`);
        const statsData = await statsRes.json();
        console.log('📊 Dados iniciais de usuários:', statsData);
        if (statsData.success && typeof statsData.totalUsers === 'number') {
          setTotalUsuarios(statsData.totalUsers);
        }

        // 2. Torneio Ativo
        const tourRes = await fetch(`${apiBaseUrl}/api/torneios/ativo`);
        const tourData = await tourRes.json();

        if (tourData.ativo && tourData.torneio) {
          setTorneioAtivo(tourData.torneio);
          
          // ✅ NOVA LÓGICA: Verificar tipo de torneio e aplicar visibilidade
          if (tourData.torneio.tipo_torneio === 'especifico') {
            // Se for específico: MOSTRAR TODAS AS 3 DISCIPLINAS
            // Apenas a selecionada estará ATIVA (clicável)
            const disciplinaEspecifica = tourData.torneio.disciplina_especifica;
            setDisciplinaEspecificaTorneio(disciplinaEspecifica);
            setDisciplinasDisponiveis(allDisciplinas);
            console.log('🎯 Torneio específico para:', disciplinaEspecifica);
          } else {
            // Genérico: Buscar disciplinas com blocos e filtrar
            try {
              const disciplinasRes = await fetch(`${apiBaseUrl}/api/torneios/ativo/disciplinas`);
              const disciplinasData = await disciplinasRes.json();
              
              const disponivelMap = {
                'Matemática': allDisciplinas[0],
                'Inglês': allDisciplinas[2],
                'Programação': allDisciplinas[1]
              };
              
              let disciplinasFiltradas = [];
              if (disciplinasData.disciplinas && Array.isArray(disciplinasData.disciplinas)) {
                disciplinasFiltradas = disciplinasData.disciplinas
                  .map(nome => disponivelMap[nome])
                  .filter(d => d !== undefined);
              }
              
              setDisciplinasDisponiveis(disciplinasFiltradas.length > 0 ? disciplinasFiltradas : allDisciplinas);
              setDisciplinaEspecificaTorneio(null);
              console.log('🌐 Disciplinas genéricas disponíveis:', disciplinasData.disciplinas);
            } catch (discErr) {
              console.error('Erro ao carregar disciplinas:', discErr);
              setDisciplinasDisponiveis(allDisciplinas);
              setDisciplinaEspecificaTorneio(null);
            }
          }

          // 3. Buscar estatísticas reais de participantes do torneio ativo
          try {
            const statsRes = await fetch(`${apiBaseUrl}/api/tournaments/${tourData.torneio.id}/participant-counts`);
            const statsData = await statsRes.json();
            if (statsData.success && statsData.counts) {
              setEstatisticasParticipantes(statsData.counts);
              console.log('📊 Estatísticas de participantes carregadas:', statsData.counts);
            }
          } catch (sErr) {
            console.error('Erro ao carregar estatísticas:', sErr);
          }
        } else {
          setTorneioAtivo(null);
          setEstatisticasParticipantes({ 'Matemática': 0, 'Inglês': 0, 'Programação': 0, total: 0 });
        }
      } catch (err) {
        console.error('Erro conexão:', err);
        setError("Erro ao conectar com o servidor.");
      } finally {
        setIsVerifying(false);
      }
    };
    carregarDados();
  }, [apiBaseUrl]);

  const abrirModal = (disciplina) => {
    if (!torneioAtivo) {
      alert("Nenhum torneio ativo no momento. Tente novamente mais tarde.");
      return;
    }
    
    // Verificar se a disciplina está disponível baseado no tipo de torneio
    if (torneioAtivo.tipo_torneio === 'especifico') {
      // Para específicos: apenas a disciplina selecionada é abrível
      if (disciplina.nome !== torneioAtivo.disciplina_especifica) {
        alert(`❌ Esta disciplina não está disponível. Este torneio é específico para ${torneioAtivo.disciplina_especifica}.`);
        return;
      }
    }
    
    setDisciplinaSelecionada(disciplina);
  };

  const entrarNoTorneio = async () => {
    if (!disciplinaSelecionada || !user) {
      setShowLoginModal(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ✅ Verificar participação ativa em outro torneio (totalmente diferente)
      const verificarRes = await fetch(`${apiBaseUrl}/api/tournaments/usuario/${user.id}/participacao-ativa`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const verificarData = await verificarRes.json();

      if (verificarData.ativo && verificarData.torneio.id !== torneioAtivo.id) {
        // Participando em OUTRO torneio diferente
        setLoading(false);
        setError(`❌ Você já está participando de outro torneio: "${verificarData.torneio.titulo}". Termine esse primeiro para participar deste.`);
        setDisciplinaSelecionada(null);
        return;
      }

      // ✅ Para TORNEIOS GENÉRICOS: Verificar participação em outra disciplina do MESMO torneio
      if (torneioAtivo.tipo_torneio === 'generico' && verificarData.ativo && verificarData.torneio.id === torneioAtivo.id) {
        // Usuário já está participando em outra disciplina deste torneio genérico
        const disciplinaAtual = verificarData.disciplina;
        if (disciplinaAtual !== disciplinaSelecionada.nome) {
          setLoading(false);
          setError(`❌ Você já está participando de ${disciplinaAtual} neste torneio. Termine essa disciplina primeiro para participar em ${disciplinaSelecionada.nome}.`);
          setDisciplinaSelecionada(null);
          return;
        }
      }

      // 1. Registrar o usuário no torneio (se ainda não estiver registrado)
      const registroResponse = await fetch(`${apiBaseUrl}/api/participantes/registrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_usuario: user.id, // ID do usuário
          disciplina_competida: disciplinaSelecionada.nome // Nome da disciplina já padronizado
        })
      });

      const registroData = await registroResponse.json();

      if (!registroData.success) {
        throw new Error(registroData.error || 'Erro ao registrar no torneio');
      }

      // 2. Redirecionar para o torneio específico
      const nomeUsuario = formatarNomeParaURL(
        user.nome || user.displayName || user.email?.split('@')[0] || "usuario"
      );

      // Definir a rota baseado na disciplina
      let rota = "";
      switch (disciplinaSelecionada.id) {
        case "matematica":
          rota = `/matematica-original/${nomeUsuario}`;
          break;
        case "programacao":
          rota = `/programacao-original/${nomeUsuario}`;
          break;
        case "ingles":
          rota = `/ingles-original/${nomeUsuario}`;
          break;
        default:
          throw new Error('Disciplina inválida');
      }

      // Preparar dados para enviar na navegação
      const userData = {
        nome: user.nome || user.displayName || user.email?.split('@')[0] || "Usuário",
        nomeURL: nomeUsuario,
        email: user.email,
        id: user.uid || user.id,
        autenticado: true,
        disciplina: disciplinaSelecionada.nome,
        disciplinaId: disciplinaSelecionada.id,
        torneio_id: torneioAtivo.id
      };

      // 3. Navegar para o torneio
      navigate(rota, {
        state: {
          user: userData,
          disciplina: disciplinaSelecionada,
          torneio: torneioAtivo
        }
      });

    } catch (error) {
      console.error('Erro ao entrar no torneio:', error);
      setError(error.message || 'Erro ao entrar no torneio. Tente novamente.');
    } finally {
      setLoading(false);
      setDisciplinaSelecionada(null);
    }
  };

  // Função para formatar nome para URL
  const formatarNomeParaURL = (nome) => {
    if (!nome) return "usuario";

    return nome
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .substring(0, 30);
  };

  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    setDisciplinaSelecionada(null);
    navigate('/login');
  };

  const handleCadastroRedirect = () => {
    setShowLoginModal(false);
    setDisciplinaSelecionada(null);
    navigate('/cadastro');
  };

  useEffect(() => {
    document.body.style.overflow = disciplinaSelecionada ? "hidden" : "auto";
  }, [disciplinaSelecionada]);

  return (
    <Layout>
      <div className="bg-gradient-to-b from-gray-50 to-white">
        {/* Header Hero - AGORA OCUPANDO 100% DA LARGURA COMO HEADER E FOOTER */}
        <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-8 overflow-hidden h-[90vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh] text-white">
          {/* Background com imagem/vídeo */}
          <div className="absolute inset-0">
            <img
              src={imageTorneio}
              alt="Torcidas e competição esportiva"
              className="w-full h-full object-cover"
            />

            {/* Overlay gradiente para contraste */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-indigo-900/80" />
            <div className="absolute inset-0 bg-black/30" />
          </div>

          {/* Elementos decorativos */}
          <div className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-purple-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          {/* Conteúdo principal */}
          <div className="relative px-4 sm:px-6 md:px-8 max-w-7xl mx-auto h-full flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4 sm:mb-6">
                <motion.div
                  className="relative"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <IoTrophy className="text-5xl sm:text-6xl md:text-8xl text-yellow-400 drop-shadow-lg" />
                  <IoSparkles className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 text-xl sm:text-2xl md:text-4xl text-yellow-300 animate-pulse" />
                </motion.div>
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-3 sm:mb-4 md:mb-6 tracking-tight drop-shadow-lg px-2"
              >
                Torneio <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 bg-clip-text text-transparent animate-gradient">Comaes</span>
              </motion.h1>

              {/* Mensagem de status do torneio - Dinâmica */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mb-4 sm:mb-6 md:mb-8 px-2"
              >
                {isVerifying ? (
                  <div className="inline-flex items-center gap-2 sm:gap-3 bg-blue-500/20 backdrop-blur-sm px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-full border border-blue-400/30">
                    <FaSpinner className="text-blue-300 text-sm sm:text-base animate-spin" />
                    <span className="text-sm sm:text-base md:text-xl text-blue-100 font-semibold">
                      Verificando torneios...
                    </span>
                  </div>
                ) : torneioAtivo ? (
                  <div className="inline-flex items-center gap-2 sm:gap-3 bg-green-500/20 backdrop-blur-sm px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-full border border-green-400/30">
                    <FaCheckCircle className="text-green-300 text-sm sm:text-base" />
                    <span className="text-sm sm:text-base md:text-xl text-green-100 font-semibold">
                      Torneio Ativo! {torneioAtivo.titulo}
                    </span>
                  </div>
                ) : error ? (
                  <div className="inline-flex items-center gap-2 sm:gap-3 bg-red-500/20 backdrop-blur-sm px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-full border border-red-400/30">
                    <IoClose className="text-red-300 text-sm sm:text-base" />
                    <span className="text-sm sm:text-base md:text-xl text-red-100 font-semibold">
                      {error}
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 sm:gap-3 bg-blue-500/10 backdrop-blur-sm px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-full border border-white/20">
                    <span className="text-sm sm:text-base md:text-xl text-blue-100 font-semibold">
                      Próximas competições em breve
                    </span>
                  </div>
                )}
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-blue-100 max-w-4xl mx-auto mb-4 sm:mb-6 md:mb-8 drop-shadow-lg px-2 sm:px-4"
              >
                Desafie seus limites, mostre seu conhecimento e conquiste seu lugar no pódio
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-10 px-2"
              >
                <div className="flex items-center gap-1 sm:gap-2 bg-white/20 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-3 rounded-full border border-white/30 shadow-lg">
                  <FaUsers className="text-blue-300 text-sm sm:text-base" />
                  <span className="text-xs sm:text-sm md:text-base font-semibold">
                    {(() => {
                      // Mostrar estritamente o total de usuários da base de dados
                      return `+${(totalUsuarios || 0).toLocaleString()}`;
                    })()} Usuários Cadastrados
                  </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 bg-white/20 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-3 rounded-full border border-white/30 shadow-lg">
                  <FaMedal className="text-yellow-300 text-sm sm:text-base" />
                  <span className="text-xs sm:text-sm md:text-base font-semibold">Prêmios em Dinheiro</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 bg-white/20 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-3 rounded-full border border-white/30 shadow-lg">
                  <FaChartLine className="text-green-300 text-sm sm:text-base" />
                  <span className="text-xs sm:text-sm md:text-base font-semibold">Ranking Atualizado</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Seta para baixo */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white/80 drop-shadow-lg cursor-pointer"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                onClick={() => {
                  window.scrollTo({
                    top: window.innerHeight * 0.85,
                    behavior: 'smooth'
                  });
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </motion.div>
          </div>
        </div>

        {/* Conteúdo Principal - DENTRO DO CONTAINER */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Grid de Disciplinas */}
          <div className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-2">
              Escolha Sua Disciplina
            </h2>
            <p className="text-sm sm:text-base text-gray-600 text-center mb-6 sm:mb-8 md:mb-10">
              Clique em uma disciplina para entrar no torneio ativo
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center sm:items-stretch gap-4 sm:gap-6 max-w-6xl mx-auto">
              {disciplinasDisponiveis.map((disc, index) => {
                // Se for torneio específico, verificar se esta disciplina é a selecionada
                const isEspecifico = disciplinaEspecificaTorneio !== null;
                const isDisciplinaEspecificaAtiva = !isEspecifico || disc.nome === disciplinaEspecificaTorneio;
                
                // Para torneios genéricos: verificar se usuário logado já está participando em outra disciplina
                let isDisciplinaDisponipelParaUsuario = true;
                if (!isEspecifico && user && disciplinaUsuarioAtual) {
                  // Usuário logado já participando em outra disciplina deste torneio genérico
                  isDisciplinaDisponipelParaUsuario = disc.nome === disciplinaUsuarioAtual;
                }
                
                const isDisciplinaAtiva = isDisciplinaEspecificaAtiva && isDisciplinaDisponipelParaUsuario;
                
                return (
                <motion.div
                  key={disc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: torneioAtivo && isDisciplinaAtiva ? 1.03 : 1, y: torneioAtivo && isDisciplinaAtiva ? -8 : 0 }}
                  className={`group cursor-pointer bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 w-full sm:w-64 md:w-72 lg:w-80 ${!torneioAtivo || !isDisciplinaAtiva ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  onClick={() => torneioAtivo && isDisciplinaAtiva && abrirModal(disc)}
                >
                  <div className="relative h-40 sm:h-44 md:h-48 lg:h-56 overflow-hidden">
                    <img
                      src={disc.imagem}
                      alt={disc.nome}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${disc.cor} opacity-70`} />
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                      <span className="text-white text-xs sm:text-sm font-semibold">{disc.nivel}</span>
                    </div>
                    {(!torneioAtivo || !isDisciplinaAtiva) && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm sm:text-base">
                          {!torneioAtivo ? 'Torneio Indisponível' : !isDisciplinaEspecificaAtiva ? 'Disciplina Indisponível' : 'Já está participando em outra'}
                        </span>
                      </div>
                    )}
                    {/* Badge para disciplina ativa em torneios específicos */}
                    {isEspecifico && isDisciplinaEspecificaAtiva && (
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-green-500 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full flex items-center gap-1">
                        <span className="text-green-100 text-xs sm:text-sm font-semibold">✓ Ativa</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 sm:p-5 md:p-6">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-1 sm:mb-2 text-center">{disc.nome}</h3>
                    <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm md:text-base text-center h-10 sm:h-12 md:h-14 line-clamp-2">{disc.descricao}</p>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <FaUsers className="text-gray-400 text-xs sm:text-sm" />
                        <span className="text-gray-700 font-medium text-xs sm:text-sm md:text-base">
                          {(() => {
                            const discNomeAPI = disc.nome === "Língua Inglesa" ? "Inglês" : disc.nome;
                            const total = estatisticasParticipantes && estatisticasParticipantes[discNomeAPI] !== undefined
                              ? estatisticasParticipantes[discNomeAPI]
                              : 0;
                            return `${total.toLocaleString()} participante${total !== 1 ? 's' : ''}`;
                          })()}
                        </span>
                      </div>
                      <button
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-white transition-shadow text-xs sm:text-sm md:text-base w-full sm:w-auto ${torneioAtivo && isDisciplinaAtiva
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg'
                            : 'bg-gray-400 cursor-not-allowed'
                          }`}
                        disabled={!torneioAtivo || !isDisciplinaAtiva}
                      >
                        {!torneioAtivo ? 'Indisponível' : isDisciplinaAtiva ? 'Ver Torneio' : 'Indisponível'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
              })}
            </div>
          </div>

          {/* MODAL de Seleção de Torneio */}
          <AnimatePresence>
            {disciplinaSelecionada && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4"
                onClick={() => !loading && setDisciplinaSelecionada(null)}
              >
                <motion.div
                  initial={{ scale: 0.85 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.85 }}
                  className="relative bg-white w-full max-w-md rounded-2xl p-5 sm:p-6 shadow-xl z-[10000]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {!loading && (
                    <button
                      onClick={() => setDisciplinaSelecionada(null)}
                      className="absolute top-2 sm:top-3 right-2 sm:right-3 text-gray-500 hover:text-gray-700 z-10"
                    >
                      <IoClose size={24} className="sm:w-7 sm:h-7" />
                    </button>
                  )}

                  <div className="relative mb-4 sm:mb-6">
                    <img
                      src={disciplinaSelecionada.imagem}
                      alt={disciplinaSelecionada.nome}
                      className="w-full h-36 sm:h-40 md:h-48 object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                      <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">
                        {disciplinaSelecionada.nome}
                      </h2>
                    </div>
                  </div>

                  {loading ? (
                    <div className="py-6 sm:py-8 flex flex-col items-center justify-center">
                      <FaSpinner className="text-3xl sm:text-4xl text-blue-600 animate-spin mb-3 sm:mb-4" />
                      <p className="text-gray-700 text-base sm:text-lg font-medium">
                        Entrando no torneio...
                      </p>
                      <p className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-2">
                        Aguarde enquanto preparamos tudo para você
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-600 text-center text-sm sm:text-base mb-4 sm:mb-6">
                        Clique no botão abaixo para entrar no torneio ativo de {disciplinaSelecionada.nome}.
                      </p>

                      {torneioAtivo && (
                        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <h3 className="font-semibold text-blue-800 mb-1 sm:mb-2 flex items-center gap-2 text-sm sm:text-base">
                            <IoTrophy className="text-yellow-500" />
                            Torneio Ativo
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-700">{torneioAtivo.titulo}</p>
                          <div className="flex items-center gap-3 sm:gap-4 mt-1 sm:mt-2 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <FaClock />
                              {new Date(torneioAtivo.inicia_em).toLocaleDateString('pt-BR')} - {new Date(torneioAtivo.termina_em).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3 sm:space-y-4">
                        {/* Botão único - ENTRAR NO TORNEIO */}
                        <button
                          onClick={entrarNoTorneio}
                          disabled={loading}
                          className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
                        >
                          <FaCheckCircle />
                          Entrar no Torneio
                        </button>

                        <p className="text-center text-xs sm:text-sm text-gray-500">
                          Você será redirecionado para a página do torneio
                        </p>

                        {error && (
                          <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-xs sm:text-sm text-center">{error}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MODAL de Login Obrigatório */}
          <AnimatePresence>
            {showLoginModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4"
                onClick={() => setShowLoginModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.85 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.85 }}
                  className="relative bg-white w-full max-w-md rounded-2xl p-5 sm:p-8 shadow-xl z-[10000]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setShowLoginModal(false)}
                    className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-500 hover:text-gray-700 z-10"
                  >
                    <IoClose size={22} className="sm:w-6 sm:h-6" />
                  </button>

                  <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-flex p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4 sm:mb-6">
                      <IoTrophy className="text-2xl sm:text-3xl text-white" />
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                      Acesso Restrito ao Torneio
                    </h2>

                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                      Para participar do torneio de {disciplinaSelecionada?.nome}, você precisa estar autenticado na plataforma COMAES.
                    </p>

                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-blue-200">
                      <h3 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">Benefícios do COMAES:</h3>
                      <ul className="text-xs sm:text-sm text-gray-700 space-y-1 text-left">
                        <li className="flex items-center gap-2">
                          <FaCheckCircle className="text-green-500 text-xs sm:text-sm" />
                          Acesso a todos os torneios
                        </li>
                        <li className="flex items-center gap-2">
                          <FaCheckCircle className="text-green-500 text-xs sm:text-sm" />
                          Acompanhamento de ranking
                        </li>
                        <li className="flex items-center gap-2">
                          <FaCheckCircle className="text-green-500 text-xs sm:text-sm" />
                          Histórico de participações
                        </li>
                        <li className="flex items-center gap-2">
                          <FaCheckCircle className="text-green-500 text-xs sm:text-sm" />
                          Conquistas e certificados
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <button
                      onClick={handleLoginRedirect}
                      className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
                    >
                      Fazer Login
                    </button>

                    <button
                      onClick={handleCadastroRedirect}
                      className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
                    >
                      Cadastrar-se
                    </button>

                    <button
                      onClick={() => setShowLoginModal(false)}
                      className="w-full py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-sm sm:text-base"
                    >
                      Cancelar
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}