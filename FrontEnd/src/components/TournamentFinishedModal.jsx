import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaMedal, FaTimes, FaDownload, FaCalendarTimes, FaUsers, FaChartBar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatarData = (data) =>
  new Date(data).toLocaleDateString('pt-PT', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const medalEmoji = (pos) => ({ 1: '🏅', 2: '🏅', 3: '🏅' }[pos] ?? null);

// ---------------------------------------------------------------------------
// Lógica de cenário â calculada a partir dos dados do backend
// ---------------------------------------------------------------------------
//
// Cenários (por prioridade):
//  ENTROU_DEPOIS        â entrou depois do torneio terminar
//  TORNEIO_VAZIO        â torneio sem participantes confirmados
//  SEM_PONTUACAO_GERAL  â todos os participantes tÃªm 0 pts / 0 respostas
//  PARTICIPANTE_INATIVO â este user tem 0 pts e 0 respostas (mas outros pontuaram)
//  VENCEDOR             â posição 1, 2 ou 3 com pontuação > 0
//  CLASSIFICADO         â posição >= 4 com pontuação > 0
//  SEM_POSICAO          â participou mas posição não pôde ser determinada
//
const detectarCenario = (p) => {
  if (!p) return 'SEM_POSICAO';
  if (p.entrou_depois_do_fim)  return 'ENTROU_DEPOIS';
  if (p.torneio_vazio)         return 'TORNEIO_VAZIO';
  if (p.sem_pontuacao_valida)  return 'SEM_PONTUACAO_GERAL';

  const pontuacao    = parseFloat(p.pontuacao || 0);
  const casosResolvidos = parseInt(p.casos_resolvidos || 0, 10);
  const posicao      = p.posicao;
  const posicaoValida = posicao !== null && posicao !== undefined && posicao >= 1;

  // Participante sem nenhuma atividade real
  if (pontuacao === 0 && casosResolvidos === 0) return 'PARTICIPANTE_INATIVO';

  if (!posicaoValida) return 'SEM_POSICAO';
  if (posicao <= 3)   return 'VENCEDOR';
  return 'CLASSIFICADO';
};

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export default function TournamentFinishedModal({
  isOpen,
  onClose,
  tournament,
  userParticipation,
  onCertificateGenerated,
}) {
  const [showModal, setShowModal]                     = useState(isOpen);
  const [isGeneratingCertificate, setIsGenerating]    = useState(false);
  const [top3Winners, setTop3Winners]                 = useState([]);
  const [loadingWinners, setLoadingWinners]           = useState(false);
  const navigate = useNavigate();
  const { token } = useAuth();

  const cenario = detectarCenario(userParticipation);

  const apiBase =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    '';

  useEffect(() => {
    setShowModal(isOpen);
    if (isOpen && cenario === 'CLASSIFICADO') fetchTop3Winners();
  }, [isOpen]);

  const fetchTop3Winners = async () => {
    if (!tournament || !userParticipation?.disciplina_competida) return;
    setLoadingWinners(true);
    try {
      const res = await fetch(
        `${apiBase}/torneios/${tournament.id}/top3/${userParticipation.disciplina_competida}`
      );
      if (res.ok) setTop3Winners((await res.json()).data || []);
    } catch (err) {
      console.error('Erro ao buscar vencedores:', err);
    } finally {
      setLoadingWinners(false);
    }
  };

  const handleViewRanking = () => {
    navigate(`/ranking/${tournament?.id}`);
    onClose();
  };

  const handleViewCertificate = async () => {
    if (!userParticipation) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`${apiBase}/api/certificates/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ tournamentId: tournament.id, disciplina: userParticipation.disciplina_competida }),
      });
      if (res.ok) {
        const data = await res.json();
        const pdfUrl = data?.certificateURL?.startsWith('http')
          ? data.certificateURL : `${apiBase}${data.certificateURL}`;
        if (!pdfUrl) { alert('PDF não retornado pelo servidor.'); return; }
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `certificado-${userParticipation.disciplina_competida}-${userParticipation.usuario?.nome || 'participante'}.pdf`;
        link.target = '_blank';
        link.click();
        if (onCertificateGenerated) onCertificateGenerated(data);
      } else {
        let errData = null;
        try { errData = await res.json(); } catch { /* ignore */ }
        alert(errData?.error || `Erro ao gerar certificado (HTTP ${res.status})`);
      }
    } catch (err) {
      alert(err?.message || 'Falha de conexão ao gerar certificado.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!showModal || !tournament) return null;

  // ââ Render helpers ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

  // 1. VENCEDOR â posição 1-3 com pontuação real
  const renderVencedor = () => (
    <div className="bg-gradient-to-br from-white to-yellow-50 rounded-2xl shadow-2xl overflow-hidden border-2 border-yellow-500 max-h-[86vh] overflow-y-auto">
      <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-5 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <span className="absolute top-3 left-3 text-5xl"></span>
          <span className="absolute top-3 right-3 text-5xl">🏅</span>
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-4xl">â¨</span>
        </div>
        <div className="text-4xl mb-2 relative z-10">{medalEmoji(userParticipation.posicao)}</div>
        <h1 className="text-2xl md:text-3xl font-bold mb-1 relative z-10">
          {userParticipation.posicao === 1 && 'VOCÃ Ã CAMPEÃO!'}
          {userParticipation.posicao === 2 && 'VICE-CAMPEÃO!'}
          {userParticipation.posicao === 3 && 'TOP 3 â MEDALHISTA!'}
        </h1>
        <p className="text-yellow-100 text-sm mb-1">{tournament.titulo}</p>
        <p className="text-xs text-yellow-200">Finalizado em {formatarData(tournament.termina_em || new Date())}</p>
      </div>
      <div className="p-5">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-4 border border-yellow-300 text-center space-y-2">
          <p className="text-gray-700 text-lg">
            <span className="font-bold">Sua posição:</span>
            <span className="text-2xl font-bold text-orange-600 ml-2">{userParticipation.posicao}º lugar</span>
          </p>
          <p className="text-gray-700 text-lg">
            <span className="font-bold">Pontuação final:</span>
            <span className="text-xl font-bold text-green-600 ml-2">{userParticipation.pontuacao} pontos</span>
          </p>
          <p className="text-gray-700">
            <span className="font-bold">Disciplina:</span>
            <span className="font-bold text-purple-600 ml-2">{userParticipation.disciplina_competida}</span>
          </p>
        </div>
        <div className="flex justify-center">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-10 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
          >
            <FaTimes /> Sair
          </motion.button>
        </div>
        <p className="mt-4 text-center text-gray-600 font-semibold">Compartilhe seu sucesso! 🏅</p>
      </div>
    </div>
  );

  // 2. CLASSIFICADO â posição >= 4 com pontuação real
  const renderClassificado = () => (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl overflow-hidden border-2 border-blue-600 max-h-[86vh] overflow-y-auto">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-5 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <span className="absolute top-4 left-4 text-6xl"></span>
          <span className="absolute top-4 right-4 text-6xl"></span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-1 relative z-10">TORNEIO FINALIZADO</h1>
        <p className="text-blue-100 text-sm mb-1">{tournament.titulo}</p>
        <p className="text-xs text-blue-200">Finalizado em {formatarData(tournament.termina_em || new Date())}</p>
      </div>
      <div className="p-5">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-200 text-center space-y-2">
          <h3 className="text-lg font-bold text-gray-800">Obrigado por Participar!</h3>
          <p className="text-gray-700 text-lg">
            <span className="font-semibold">Sua posição final:</span>
            <span className="text-2xl font-bold text-blue-600 ml-2 block">{userParticipation.posicao}º lugar</span>
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Pontos conquistados:</span>
            <span className="text-xl font-bold text-green-600 ml-2">{userParticipation.pontuacao}</span>
          </p>
          {userParticipation.total_participantes > 0 && (
            <p className="text-sm text-gray-500">
              de {userParticipation.total_participantes} participante{userParticipation.total_participantes !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-4 border border-yellow-300">
          <h3 className="text-lg font-bold text-center text-gray-800 mb-3"> Nossos Vencedores </h3>
          {loadingWinners ? (
            <div className="text-center py-6">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              <p className="text-gray-600 mt-2 text-sm">Carregando vencedores...</p>
            </div>
          ) : top3Winners.length > 0 ? (
            <div className="space-y-2">
              {top3Winners.map((winner, idx) => (
                <motion.div key={idx}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-lg p-3 border-l-4 flex items-center gap-3"
                  style={{ borderColor: ['#FFD700', '#C0C0C0', '#CD7F32'][idx] }}
                >
                  <span className="text-3xl">{['🏅', '🏅', '🏅'][idx]}</span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{winner.nome}</p>
                    <p className="text-sm text-gray-600">{winner.pontuacao} pontos</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                    idx === 0 ? 'bg-yellow-200 text-yellow-800' :
                    idx === 1 ? 'bg-gray-200 text-gray-800' : 'bg-orange-200 text-orange-800'
                  }`}>
                    {idx === 0 ? 'CAMPEÃO' : `${idx + 1}º LUGAR`}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 text-sm">Vencedores não disponíveis</p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleViewRanking}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
          >
            <FaTrophy /> Ver Ranking Completo
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-gray-500 hover:to-gray-600 transition-all shadow-lg"
          >
            <FaTimes /> Voltar ao Menu
          </motion.button>
        </div>
        <div className="mt-4 text-center">
          <p className="text-gray-700 font-semibold mb-1">Não desista! </p>
          <p className="text-gray-600 text-sm">Participe de outros torneios para melhorar e competir pelos primeiros lugares!</p>
        </div>
      </div>
    </div>
  );

  // 3. SEM_PONTUACAO_GERAL â ninguém pontuou, torneio sem vencedores reais
  const renderSemPontuacaoGeral = () => (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl overflow-hidden border-2 border-slate-400 max-h-[86vh] overflow-y-auto">
      <div className="bg-gradient-to-r from-slate-600 to-slate-800 text-white p-5 text-center">
        <div className="text-4xl mb-2">🏅</div>
        <h1 className="text-xl md:text-2xl font-bold mb-1">TORNEIO ENCERRADO</h1>
        <p className="text-slate-200 text-sm mb-1">{tournament.titulo}</p>
        <p className="text-xs text-slate-300">Encerrado em {formatarData(tournament.termina_em || new Date())}</p>
      </div>
      <div className="p-5 space-y-4">
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-center">
          <FaChartBar className="text-amber-500 text-3xl mx-auto mb-2" />
          <h3 className="font-bold text-gray-800 mb-2">Nenhuma pontuação válida registrada</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Este torneio encerrou sem que nenhum participante completasse desafios válidos.
            Não há vencedores oficiais a declarar nesta edição.
          </p>
        </div>
        {userParticipation?.posicao && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <p className="text-gray-600 text-sm">
              VocÃª estava na posição <span className="font-bold text-slate-700">{userParticipation.posicao}º</span> com{' '}
              <span className="font-bold">0 pontos</span> â igual a todos os demais participantes.
            </p>
          </div>
        )}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-blue-800 text-sm font-medium">
            Fique atento aos próximos torneios e participe ativamente para garantir sua classificação!
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleViewRanking}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-slate-700 hover:to-slate-800 transition-all shadow-lg"
          >
            <FaTrophy /> Ver Ranking
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-gray-500 hover:to-gray-600 transition-all shadow-lg"
          >
            <FaTimes /> Fechar
          </motion.button>
        </div>
      </div>
    </div>
  );

  // 4. PARTICIPANTE_INATIVO â este user não pontuou, mas outros pontuaram
  const renderParticipanteInativo = () => (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl overflow-hidden border-2 border-blue-400 max-h-[86vh] overflow-y-auto">
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-5 text-center">
        <div className="text-4xl mb-2"></div>
        <h1 className="text-xl md:text-2xl font-bold mb-1">TORNEIO FINALIZADO</h1>
        <p className="text-blue-100 text-sm mb-1">{tournament.titulo}</p>
        <p className="text-xs text-blue-200">Encerrado em {formatarData(tournament.termina_em || new Date())}</p>
      </div>
      <div className="p-5 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <h3 className="font-bold text-gray-800 mb-2">VocÃª participou, mas não pontuou</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            VocÃª se inscreveu neste torneio, mas não enviou respostas válidas durante o período de competição.
            Por isso, não há classificação competitiva a exibir para esta participação.
          </p>
        </div>
        {userParticipation?.total_participantes > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center text-sm text-gray-500">
            {userParticipation.total_participantes} participante{userParticipation.total_participantes !== 1 ? 's' : ''} competiram neste torneio.
          </div>
        )}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-amber-800 text-sm font-medium">
             Dica: No próximo torneio, responda os desafios dentro do prazo para garantir sua pontuação e classificação!
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleViewRanking}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
          >
            <FaTrophy /> Ver Ranking
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-gray-500 hover:to-gray-600 transition-all shadow-lg"
          >
            <FaTimes /> Fechar
          </motion.button>
        </div>
      </div>
    </div>
  );

  // 5. ENTROU_DEPOIS â inscreveu-se após o encerramento
  const renderEntrouDepois = () => (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-400 max-h-[86vh] overflow-y-auto">
      <div className="bg-gradient-to-r from-gray-600 to-gray-800 text-white p-5 text-center">
        <div className="text-4xl mb-2">â°</div>
        <h1 className="text-2xl font-bold mb-1">TORNEIO JÃ ENCERRADO</h1>
        <p className="text-gray-200 text-sm mb-1">{tournament.titulo}</p>
        <p className="text-xs text-gray-300">Encerrado em {formatarData(tournament.termina_em || new Date())}</p>
      </div>
      <div className="p-5 space-y-4">
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-center">
          <FaCalendarTimes className="text-amber-500 text-3xl mx-auto mb-2" />
          <h3 className="font-bold text-gray-800 mb-2">VocÃª chegou depois do encerramento</h3>
          <p className="text-gray-600 text-sm">
            Este torneio já havia terminado quando vocÃª se inscreveu. Não há posição competitiva
            nem dados de desempenho a exibir para esta participação.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-blue-800 font-semibold text-sm">
            Fique atento aos próximos torneios para competir desde o início e garantir sua classificação!
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
        >
          <FaTimes /> Fechar
        </motion.button>
      </div>
    </div>
  );

  // 6. TORNEIO_VAZIO â sem participantes confirmados
  const renderTorneioVazio = () => (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-300 max-h-[86vh] overflow-y-auto">
      <div className="bg-gradient-to-r from-gray-500 to-gray-700 text-white p-5 text-center">
        <div className="text-4xl mb-2"></div>
        <h1 className="text-2xl font-bold mb-1">TORNEIO FINALIZADO</h1>
        <p className="text-gray-200 text-sm mb-1">{tournament.titulo}</p>
        <p className="text-xs text-gray-300">Encerrado em {formatarData(tournament.termina_em || new Date())}</p>
      </div>
      <div className="p-5 space-y-4">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <FaUsers className="text-gray-400 text-3xl mx-auto mb-2" />
          <h3 className="font-bold text-gray-700 mb-2">Nenhum participante competiu</h3>
          <p className="text-gray-500 text-sm">
            Este torneio encerrou sem participantes confirmados. Não há ranking nem classificação a exibir.
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
        >
          <FaTimes /> Fechar
        </motion.button>
      </div>
    </div>
  );

  // 7. SEM_POSICAO â fallback genérico
  const renderSemPosicao = () => (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl overflow-hidden border-2 border-blue-400 max-h-[86vh] overflow-y-auto">
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-5 text-center">
        <div className="text-4xl mb-2"></div>
        <h1 className="text-2xl font-bold mb-1">TORNEIO FINALIZADO</h1>
        <p className="text-blue-100 text-sm mb-1">{tournament.titulo}</p>
        <p className="text-xs text-blue-200">Encerrado em {formatarData(tournament.termina_em || new Date())}</p>
      </div>
      <div className="p-5 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-gray-700 font-semibold mb-1">Obrigado por participar!</p>
          <p className="text-gray-500 text-sm">
            A sua classificação final está a ser processada. Consulte o ranking completo para ver os resultados.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleViewRanking}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
          >
            <FaTrophy /> Ver Ranking
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-gray-500 hover:to-gray-600 transition-all shadow-lg"
          >
            <FaTimes /> Fechar
          </motion.button>
        </div>
      </div>
    </div>
  );

  // ââ Render principal ââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  return (
    <AnimatePresence>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative max-w-xl w-full"
          >
            <button
              onClick={onClose}
              className="absolute -top-10 right-0 text-white hover:text-blue-300 transition-colors flex items-center gap-2 z-10 text-sm"
            >
              <FaTimes /> Fechar
            </button>

            {cenario === 'VENCEDOR'            && renderVencedor()}
            {cenario === 'CLASSIFICADO'        && renderClassificado()}
            {cenario === 'SEM_PONTUACAO_GERAL' && renderSemPontuacaoGeral()}
            {cenario === 'PARTICIPANTE_INATIVO' && renderParticipanteInativo()}
            {cenario === 'ENTROU_DEPOIS'       && renderEntrouDepois()}
            {cenario === 'TORNEIO_VAZIO'       && renderTorneioVazio()}
            {cenario === 'SEM_POSICAO'         && renderSemPosicao()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

