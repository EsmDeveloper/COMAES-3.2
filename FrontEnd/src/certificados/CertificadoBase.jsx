import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/vite1.png';

export default function CertificadoBase({
  isOpen,
  onClose,
  participante,
  disciplina,
  posicao,
  pontuacao,
  torneio,
  children,
}) {
  const { user, token } = useAuth();
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const certificadoRef = useRef(null);

  const monthNames = useMemo(
    () => ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
    []
  );

  const toDisplayScorePercent = (rawScore, rawPercent, scoreBase = 100) => {
    if (Number.isFinite(Number(rawPercent))) {
      return Number(rawPercent).toFixed(1);
    }

    const numericScore = Number(rawScore);
    if (!Number.isFinite(numericScore)) return '0.0';
    if (numericScore <= 100) return numericScore.toFixed(1);

    const safeBase = Number.isFinite(Number(scoreBase)) && Number(scoreBase) > 0 ? Number(scoreBase) : 100;
    return Math.min((numericScore / safeBase) * 100, 100).toFixed(1);
  };

  // Buscar dados do certificado (código, etc.)
  useEffect(() => {
    if (!isOpen || !participante || !torneio || !user) return;

    const fetchCertificate = async () => {
      const tournamentId = torneio?.id || torneio?.torneio_id || participante?.torneio_id;
      if (!token) {
        setError('Sessao expirada. Inicie sessao novamente para gerar o certificado.');
        return;
      }
      if (!tournamentId) {
        setError('Nao foi possivel identificar o torneio para gerar o certificado.');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3002`}/api/certificates/generate`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              tournamentId,
              disciplina,
              posicao,
              pontuacao,
            }),
          }
        );

        let data = null;
        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (!response.ok || !data?.success) {
          setError(data?.error || `Erro ao gerar certificado (HTTP ${response.status})`);
          return;
        }

        setCertData(data);
      } catch (err) {
        setError(err?.message || 'Erro de conexão. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [isOpen, participante, torneio, disciplina, posicao, pontuacao, token, user]);

  const handleDownloadPDF = async () => {
    const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3002`;
    const pdfPath = certData?.certificateURL;
    if (!pdfPath) {
      alert('Arquivo PDF do certificado ainda nao esta disponivel.');
      return;
    }

    try {
      const pdfUrl = pdfPath.startsWith('http') ? pdfPath : `${baseUrl}${pdfPath}`;
      const link = document.createElement('a');
      link.download = `certificado-${disciplina}-${user?.nome || 'participante'}.pdf`;
      link.href = pdfUrl;
      link.target = '_blank';
      link.click();
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      alert('Nao foi possivel baixar o certificado em PDF. Tente novamente.');
    }
  };

  const handleShare = async () => {
    const certificateCode = certData?.certificateCode || '';
    const validatorUrl = `${window.location.origin}/validador/${certificateCode}`;

    if (!certificateCode) {
      alert('Codigo de validacao indisponivel no momento.');
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
        title: 'Meu Certificado COMAES',
        text: `Conquistei ${posicao}º lugar no Torneio Academico COMAES (${disciplina}).`,
        url: validatorUrl,
        });
      } catch {
        // fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(validatorUrl);
      alert('Link de validacao copiado para a area de transferencia!');
    } catch {
      alert(`Partilha indisponivel. Copie manualmente: ${validatorUrl}`);
    }
  };

  if (!isOpen) return null;

  const posicaoExtenso = {
    1: '1º LUGAR',
    2: '2º LUGAR',
    3: '3º LUGAR',
  }[posicao] || `${posicao}º LUGAR`;

  const nomeUsuario = (user?.nome || participante?.usuario?.nome || 'Participante').toUpperCase();
  const nomeTorneio = torneio?.titulo || 'Torneio Academico COMAES 2026';
  const fallbackTotal = Number(torneio?.totalParticipantes || torneio?.total_participantes || 0);
  const totalParticipantes = Number(certData?.totalParticipants || fallbackTotal || 1);
  const posicaoNumerica = Number(posicao || participante?.posicao || certData?.position || 0);
  const percentileFallbackMap = { 1: 99.5, 2: 95, 3: 90 };
  const percentileCalc = totalParticipantes > 0 && posicaoNumerica > 0
    ? (1 - (posicaoNumerica - 1) / totalParticipantes) * 100
    : percentileFallbackMap[posicaoNumerica] || 90;
  const percentil = Number(certData?.percentile ?? percentileCalc).toFixed(1);
  const pontuacaoFinal = toDisplayScorePercent(
    certData?.scoreRaw ?? pontuacao ?? participante?.pontuacao ?? 0,
    certData?.scorePercent,
    certData?.scoreBase || 100
  );

  const now = new Date();
  const dataEmissao = `${now.getDate()} de ${monthNames[now.getMonth()]} de ${now.getFullYear()}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 no-print">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-[920px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row"
          style={{ maxHeight: '92vh' }}
        >
          <div className="w-full lg:w-[280px] bg-slate-50 p-4 md:p-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100 overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-[#1E3A8A] rounded-xl flex items-center justify-center text-white text-xl"></div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">Parabéns!</h3>
                  <p className="text-xs text-gray-500">Seu certificado está pronto</p>
                </div>
              </div>

              <div className="space-y-4 mb-8 text-sm">
                <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Posição</p>
                  <p className="text-[#1E3A8A] font-extrabold text-lg">{posicao}º LUGAR</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Pontuação</p>
                  <p className="text-gray-800 font-extrabold text-lg">{pontuacaoFinal}%</p>
                </div>
              </div>

              {children && <div className="mb-6">{children}</div>}
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDownloadPDF}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-200 active:scale-95 disabled:opacity-50"
              >
                <Download size={18} /> Baixar Certificado (PDF)
              </button>
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 py-3 rounded-xl font-bold border border-indigo-200 transition-all active:scale-95"
              >
                <Share2 size={18} /> Partilhar e Validar
              </button>
              <button
                onClick={onClose}
                className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 font-medium"
              >
                Fechar Visualização
              </button>
            </div>
          </div>

          <div className="flex-1 bg-slate-200 p-3 md:p-5 lg:p-6 flex items-center justify-center overflow-auto min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-gray-500 font-medium animate-pulse">Autenticando certificado...</p>
              </div>
            ) : error ? (
              <div className="bg-white p-8 rounded-2xl text-center max-w-sm shadow-xl">
                <div className="text-4xl mb-4">â </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Ops! Algo deu errado</h4>
                <p className="text-gray-500 text-sm mb-6">{error}</p>
                <button onClick={onClose} className="w-full bg-gray-900 text-white py-2 rounded-lg">Voltar</button>
              </div>
            ) : certData ? (
              <div ref={certificadoRef} className="w-full max-w-[620px] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="relative p-4 md:p-6 bg-white">
                  <div className="absolute inset-2 border border-[#1E3A8A]/25 rounded-xl pointer-events-none" />
                  <div className="absolute inset-0 border-[6px] border-[#1E3A8A] rounded-2xl pointer-events-none" />

                  <div className="relative z-10 text-center">
                    <img src={logo} alt="Logo COMAES" className="mx-auto mb-3 h-12 w-12 object-contain" />
                    <h1 className="text-[#1E3A8A] text-sm sm:text-lg md:text-2xl font-extrabold tracking-wide uppercase">
                      Certificado de Reconhecimento Académico
                    </h1>
                    <p className="text-[#2563EB] text-[11px] md:text-sm font-semibold tracking-[0.18em] mt-1 uppercase">
                      Plataforma COMAES
                    </p>
                  </div>

                  <div className="relative z-10 text-center mt-5 space-y-2">
                    <p className="text-slate-700 text-sm">A Plataforma COMAES certifica que, em Luanda,</p>
                    <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-[#1E3A8A] tracking-wide">{nomeUsuario}</h2>
                    <p className="text-slate-800 text-sm md:text-base">
                      Alcançou o <strong>{posicaoExtenso}</strong> no Torneio Académico COMAES 2026.
                    </p>
                    <p className="text-slate-600 text-xs md:text-sm">{nomeTorneio} - {disciplina}</p>
                  </div>

                  <div className="relative z-10 mt-5 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="rounded-lg border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 p-3 text-center">
                      <p className="text-xs uppercase text-slate-500 font-semibold">Total de Participantes</p>
                      <p className="text-xl font-bold text-[#1E3A8A]">{totalParticipantes}</p>
                    </div>
                    <div className="rounded-lg border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 p-3 text-center">
                      <p className="text-xs uppercase text-slate-500 font-semibold">Pontuação Final (%)</p>
                      <p className="text-xl font-bold text-[#1E3A8A]">{pontuacaoFinal}%</p>
                    </div>
                    <div className="rounded-lg border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 p-3 text-center">
                      <p className="text-xs uppercase text-slate-500 font-semibold">Percentil</p>
                      <p className="text-xl font-bold text-[#1E3A8A]">{percentil}%</p>
                    </div>
                  </div>

                  <div className="relative z-10 mt-5 text-center">
                    <p className="italic text-slate-700 text-sm">Emitido aos {dataEmissao}.</p>
                  </div>

                  <div className="relative z-10 mt-6 flex items-end justify-between gap-4">
                    <div className="text-xs text-slate-500">
                      Codigo de validacao:
                      <p className="font-mono text-[#1E3A8A] font-semibold">{certData.certificateCode}</p>
                    </div>
                    <div className="text-center min-w-[260px]">
                      <div className="h-px bg-slate-700 mb-2" />
                      <p className="uppercase font-bold text-[#1E3A8A] text-sm">PROF. DR. ANTÃNIO SILVA</p>
                      <p className="text-xs text-slate-600 italic">Diretor de Avaliação e Desempenho</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#1E3A8A] text-[#E5EDFF] text-center text-xs py-2 px-3">
                  Validar em {window.location.origin}/validador/{certData.certificateCode}
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

