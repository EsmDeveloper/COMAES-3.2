/**
 * BlocoQuestoesManager.jsx
 * Gestão de Blocos de Questões — persiste no banco via API (não localStorage).
 * Mantém a UX anterior; substitui apenas a camada de dados.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import CreateQuestaoTesteForm from './CreateQuestaoTesteForm';
import EditQuestaoTesteForm from './EditQuestaoTesteForm';
import ConfirmModal from '../components/ConfirmModal';
import BlocosService from './services/BlocosService';
import axios from 'axios';
import {
  Plus, Edit, Trash2, Search, Filter, ChevronDown, ChevronUp,
  BookOpen, Trophy, Layers, List, AlertCircle, CheckCircle,
  Lock, RefreshCw, Link2, X, Eye,
} from 'lucide-react';

// ── Constantes ────────────────────────────────────────────────────────────────
const DISCIPLINAS = [
  { id: 'matematica',  label: 'Matemática',  cor: 'blue'   },
  { id: 'programacao', label: 'Programação', cor: 'purple' },
  { id: 'ingles',      label: 'Inglês',      cor: 'teal'   },
];
const DIFICULDADES = [
  { id: 'facil',   label: 'Fácil',   cor: 'green'  },
  { id: 'medio',   label: 'Médio',   cor: 'yellow' },
  { id: 'dificil', label: 'Difícil', cor: 'red'    },
];
const COR_DISC = {
  blue:   { bg:'bg-blue-50',   border:'border-blue-200',   text:'text-blue-700',   badge:'bg-blue-100 text-blue-800'   },
  purple: { bg:'bg-purple-50', border:'border-purple-200', text:'text-purple-700', badge:'bg-purple-100 text-purple-800' },
  teal:   { bg:'bg-teal-50',   border:'border-teal-200',   text:'text-teal-700',   badge:'bg-teal-100 text-teal-800'   },
};
const COR_DIF = {
  green:  { bg:'bg-green-100',  text:'text-green-800',  dot:'bg-green-500'  },
  yellow: { bg:'bg-yellow-100', text:'text-yellow-800', dot:'bg-yellow-500' },
  red:    { bg:'bg-red-100',    text:'text-red-800',    dot:'bg-red-500'    },
};
const MAX_Q = 30;
const API_BASE = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;

// ── Modal de criação/edição de bloco ──────────────────────────────────────────
function BlocoFormModal({ bloco, onClose, onSave, loading }) {
  const [titulo, setTitulo] = useState(bloco?.titulo || '');
  const [disciplina, setDisciplina] = useState(bloco?.disciplina || 'matematica');
  const [dificuldade, setDificuldade] = useState(bloco?.dificuldade || 'facil');
  const [status, setStatus] = useState(bloco?.status || 'rascunho');
  const [descricao, setDescricao] = useState(bloco?.descricao || '');
  const [erro, setErro] = useState('');

  const handleSave = () => {
    if (!titulo.trim()) { setErro('O título é obrigatório.'); return; }
    onSave({ titulo: titulo.trim(), disciplina, dificuldade, status, descricao: descricao.trim() || null });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-800">{bloco ? 'Editar Bloco' : 'Criar Bloco de Questões'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          {erro && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{erro}</div>}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Título *</label>
            <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)}
              placeholder="Ex: Álgebra Avançada"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Descrição</label>
            <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={2}
              placeholder="Descrição opcional do bloco..."
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Disciplina *</label>
              <select value={disciplina} onChange={e => setDisciplina(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {DISCIPLINAS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Dificuldade *</label>
              <select value={dificuldade} onChange={e => setDificuldade(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {DIFICULDADES.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="rascunho">📝 Rascunho</option>
              <option value="publicado">✅ Publicado</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">Apenas blocos publicados podem ser associados a torneios.</p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} disabled={loading} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 disabled:opacity-50">Cancelar</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Salvando...' : bloco ? 'Salvar' : 'Criar Bloco'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Card de Bloco ─────────────────────────────────────────────────────────────
function BlocoCard({ bloco, torneios, assocMap, onEdit, onDelete, onAddQuestao, onRemoveQuestao, onEditQuestao, onToggleAssoc }) {
  const [expandido, setExpandido] = useState(false);
  const [showAssoc, setShowAssoc] = useState(false);

  const disc = DISCIPLINAS.find(d => d.id === bloco.disciplina);
  const dif  = DIFICULDADES.find(d => d.id === bloco.dificuldade);
  const corD = COR_DISC[disc?.cor || 'blue'];
  const corF = COR_DIF[dif?.cor || 'green'];
  const count = bloco.total_questoes ?? bloco.questoes?.length ?? 0;
  const cheio = count >= MAX_Q;
  const questoes = bloco.questoes || [];

  const torneiosAssoc = (assocMap[bloco.id] || [])
    .map(tid => torneios.find(t => String(t.id) === String(tid)))
    .filter(Boolean);

  return (
    <div className={`rounded-2xl border-2 ${corD.border} ${corD.bg} overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${corD.badge}`}>{disc?.label}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${corF.bg} ${corF.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${corF.dot}`} />{dif?.label}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${bloco.status === 'publicado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {bloco.status === 'publicado' ? '✅ Publicado' : '📝 Rascunho'}
              </span>
            </div>
            <h3 className="font-bold text-slate-800 truncate">{bloco.titulo}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              <span className={`font-semibold ${cheio ? 'text-red-600' : 'text-slate-700'}`}>{count}</span>/{MAX_Q} questões
              {torneiosAssoc.length > 0 && <span className="ml-2 text-blue-600">· {torneiosAssoc.length} torneio(s)</span>}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => setShowAssoc(v => !v)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-100" title="Associar a torneios"><Link2 className="w-4 h-4" /></button>
            <button onClick={() => onEdit(bloco)} className="p-1.5 rounded-lg text-slate-500 hover:bg-white" title="Editar"><Edit className="w-4 h-4" /></button>
            <button onClick={() => onDelete(bloco)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50" title="Excluir"><Trash2 className="w-4 h-4" /></button>
            <button onClick={() => setExpandido(v => !v)} className="p-1.5 rounded-lg text-slate-500 hover:bg-white">
              {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${cheio ? 'bg-red-400' : 'bg-blue-400'}`} style={{ width: `${Math.min((count / MAX_Q) * 100, 100)}%` }} />
        </div>
      </div>

      {/* Painel de associação */}
      {showAssoc && (
        <div className="border-t border-white/50 bg-white/70 px-4 py-3">
          <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1"><Link2 className="w-3 h-3" />Associar a torneios</p>
          {bloco.status !== 'publicado' && (
            <p className="text-xs text-amber-600 mb-2">⚠️ Publique o bloco antes de associar a torneios.</p>
          )}
          {torneios.length === 0 ? <p className="text-xs text-slate-400">Nenhum torneio disponível.</p> : (
            <div className="space-y-1">
              {torneios.map(t => {
                const assoc = (assocMap[bloco.id] || []).includes(String(t.id));
                return (
                  <label key={t.id} className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={assoc} disabled={bloco.status !== 'publicado'}
                      onChange={() => onToggleAssoc(bloco.id, String(t.id))}
                      className="w-4 h-4 rounded text-blue-600 disabled:opacity-40" />
                    <span className="text-xs text-slate-700 group-hover:text-blue-700">
                      {t.titulo}
                      <span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-medium ${t.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{t.status}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Lista de questões */}
      {expandido && (
        <div className="border-t border-white/50 bg-white/80">
          {questoes.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-slate-400">Nenhuma questão neste bloco.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {questoes.map((q, i) => (
                <div key={q.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-white/60">
                  <span className="text-xs font-bold text-slate-400 w-5 text-right flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate font-medium">{q.enunciado}</p>
                    <p className="text-xs text-slate-400">{q.pontos} pts · {q.dificuldade}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => onEditQuestao(q)} className="p-1 rounded text-blue-400 hover:bg-blue-50" title="Editar questão"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onRemoveQuestao(bloco, q)} className="p-1 rounded text-red-400 hover:bg-red-50" title="Remover do bloco"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="px-4 py-2 border-t border-slate-100">
            <button onClick={() => onAddQuestao(bloco)} disabled={cheio}
              className={`w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${cheio ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
              <Plus className="w-3.5 h-3.5" />
              {cheio ? `Limite de ${MAX_Q} questões atingido` : 'Adicionar questão'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function BlocoQuestoesManager() {
  const { token } = useAuth();

  // Estado principal
  const [blocos, setBlocos] = useState([]);
  const [torneios, setTorneios] = useState([]);
  const [assocMap, setAssocMap] = useState({}); // { blocoId: [torneioId, ...] }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtros
  const [filtroDisc, setFiltroDisc] = useState('');
  const [filtroDif, setFiltroDif] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [aba, setAba] = useState('blocos');

  // Modais de bloco
  const [showBlocoForm, setShowBlocoForm] = useState(false);
  const [blocoEditando, setBlocoEditando] = useState(null);
  const [showDeleteBloco, setShowDeleteBloco] = useState(false);
  const [blocoParaDeletar, setBlocoParaDeletar] = useState(null);

  // Modais de questão
  const [showCreateQuestao, setShowCreateQuestao] = useState(false);
  const [blocoAlvo, setBlocoAlvo] = useState(null);
  const [showEditQuestao, setShowEditQuestao] = useState(false);
  const [questaoEditando, setQuestaoEditando] = useState(null);
  const [showDeleteQuestao, setShowDeleteQuestao] = useState(false);
  const [removeTarget, setRemoveTarget] = useState({ bloco: null, questao: null });

  const showMsg = (msg, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(''), 4000); }
    else { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); }
  };

  // ── Carregar dados ────────────────────────────────────────────────────────
  const carregarBlocos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filtroDisc) params.disciplina = filtroDisc;
      if (filtroDif) params.dificuldade = filtroDif;
      if (filtroStatus) params.status = filtroStatus;
      params.limit = 100;

      const res = await BlocosService.listar(token, params);
      const lista = res.data?.blocos || [];

      // Para cada bloco, carregar questões detalhadas
      const blocosComQuestoes = await Promise.all(
        lista.map(async (bloco) => {
          try {
            const det = await BlocosService.obter(token, bloco.id);
            return det.data || bloco;
          } catch {
            return bloco;
          }
        })
      );

      setBlocos(blocosComQuestoes);

      // Reconstruir assocMap a partir dos torneios
      await carregarAssocMap(blocosComQuestoes);
    } catch (e) {
      showMsg('Erro ao carregar blocos: ' + e.message, true);
    } finally {
      setLoading(false);
    }
  }, [token, filtroDisc, filtroDif, filtroStatus]);

  const carregarAssocMap = useCallback(async (blocosList) => {
    if (!torneios.length) return;
    const mapa = {};
    for (const bloco of (blocosList || blocos)) {
      try {
        // Verificar em quais torneios este bloco está associado
        const torneiosDoBloco = torneios.filter(t =>
          t.blocos?.some(b => String(b.id) === String(bloco.id))
        );
        mapa[bloco.id] = torneiosDoBloco.map(t => String(t.id));
      } catch {
        mapa[bloco.id] = [];
      }
    }
    setAssocMap(mapa);
  }, [torneios, blocos]);

  const carregarTorneios = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/torneos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const lista = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setTorneios(lista);
    } catch (e) {
      console.error('Erro ao carregar torneios:', e);
    }
  }, [token]);

  useEffect(() => { carregarTorneios(); }, [carregarTorneios]);
  useEffect(() => { carregarBlocos(); }, [carregarBlocos]);

  // ── Handlers de Bloco ────────────────────────────────────────────────────
  const handleCriarBloco = async (dados) => {
    setSaving(true);
    try {
      await BlocosService.criar(token, dados);
      setShowBlocoForm(false);
      showMsg('Bloco criado com sucesso!');
      carregarBlocos();
    } catch (e) { showMsg(e.message, true); }
    finally { setSaving(false); }
  };

  const handleEditarBloco = async (dados) => {
    setSaving(true);
    try {
      await BlocosService.editar(token, blocoEditando.id, dados);
      setBlocoEditando(null);
      setShowBlocoForm(false);
      showMsg('Bloco atualizado!');
      carregarBlocos();
    } catch (e) { showMsg(e.message, true); }
    finally { setSaving(false); }
  };

  const handleDeletarBloco = async () => {
    if (!blocoParaDeletar) return;
    setSaving(true);
    try {
      await BlocosService.deletar(token, blocoParaDeletar.id);
      setBlocoParaDeletar(null);
      setShowDeleteBloco(false);
      showMsg('Bloco excluído.');
      carregarBlocos();
    } catch (e) { showMsg(e.message, true); }
    finally { setSaving(false); }
  };

  // ── Handlers de Associação ────────────────────────────────────────────────
  const handleToggleAssoc = async (blocoId, torneioId) => {
    const atual = assocMap[blocoId] || [];
    const jaAssociado = atual.includes(torneioId);
    try {
      if (jaAssociado) {
        await BlocosService.desassociar(token, torneioId, blocoId);
        setAssocMap(prev => ({ ...prev, [blocoId]: prev[blocoId].filter(id => id !== torneioId) }));
        showMsg('Bloco desassociado do torneio.');
      } else {
        await BlocosService.associar(token, torneioId, blocoId);
        setAssocMap(prev => ({ ...prev, [blocoId]: [...(prev[blocoId] || []), torneioId] }));
        showMsg('Bloco associado ao torneio!');
      }
    } catch (e) { showMsg(e.message, true); }
  };

  // ── Handlers de Questão ───────────────────────────────────────────────────
  const handleQuestaoAdicionada = async (questao) => {
    if (!questao?.id || !blocoAlvo) { setShowCreateQuestao(false); setBlocoAlvo(null); return; }
    try {
      await BlocosService.adicionarQuestao(token, blocoAlvo.id, questao.id);
      showMsg('Questão adicionada ao bloco!');
    } catch (e) {
      // Se já está no bloco, ignorar silenciosamente
      if (!e.message.includes('já está')) showMsg(e.message, true);
    }
    setShowCreateQuestao(false);
    setBlocoAlvo(null);
    carregarBlocos();
  };

  const handleQuestaoEditada = () => {
    setShowEditQuestao(false);
    setQuestaoEditando(null);
    showMsg('Questão atualizada!');
    carregarBlocos();
  };

  const handleRemoverQuestao = async () => {
    const { bloco, questao } = removeTarget;
    if (!bloco || !questao) return;
    setSaving(true);
    try {
      await BlocosService.removerQuestao(token, bloco.id, questao.id);
      showMsg('Questão removida do bloco.');
      carregarBlocos();
    } catch (e) { showMsg(e.message, true); }
    finally {
      setSaving(false);
      setShowDeleteQuestao(false);
      setRemoveTarget({ bloco: null, questao: null });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const blocosFiltrados = blocos.filter(b => {
    if (filtroDisc && b.disciplina !== filtroDisc) return false;
    if (filtroDif && b.dificuldade !== filtroDif) return false;
    if (filtroStatus && b.status !== filtroStatus) return false;
    return true;
  });

  const blocosPorDisc = DISCIPLINAS.map(disc => ({
    ...disc,
    blocos: blocosFiltrados.filter(b => b.disciplina === disc.id),
  })).filter(d => d.blocos.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Blocos de Questões</h2>
              <p className="text-sm text-slate-500">{blocos.length} blocos · persistidos no banco de dados</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={carregarBlocos} disabled={loading} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100" title="Recarregar">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => { setBlocoEditando(null); setShowBlocoForm(true); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg">
              <Layers className="w-4 h-4" /> Criar Bloco
            </button>
          </div>
        </div>
      </div>

      {/* Mensagens */}
      {error && <div className="bg-red-50 border border-red-200 text-red-800 px-5 py-3 rounded-xl flex items-center gap-3"><AlertCircle className="w-5 h-5 flex-shrink-0" />{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-800 px-5 py-3 rounded-xl flex items-center gap-3"><CheckCircle className="w-5 h-5 flex-shrink-0" />{success}</div>}

      {/* Abas */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[{ id: 'blocos', icon: Layers, label: 'Blocos' }, { id: 'lista', icon: List, label: 'Todas as Questões' }].map(tab => (
          <button key={tab.id} onClick={() => setAba(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${aba === tab.id ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="w-4 h-4 text-slate-400" />
          {[
            { value: filtroDisc, setter: setFiltroDisc, options: DISCIPLINAS, placeholder: 'Todas as disciplinas' },
            { value: filtroDif, setter: setFiltroDif, options: DIFICULDADES, placeholder: 'Todas as dificuldades' },
          ].map((f, i) => (
            <select key={i} value={f.value} onChange={e => f.setter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">{f.placeholder}</option>
              {f.options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          ))}
          <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todos os status</option>
            <option value="rascunho">📝 Rascunho</option>
            <option value="publicado">✅ Publicado</option>
          </select>
          {(filtroDisc || filtroDif || filtroStatus) && (
            <button onClick={() => { setFiltroDisc(''); setFiltroDif(''); setFiltroStatus(''); }}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
              <X className="w-3 h-3" /> Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Aba Blocos */}
      {aba === 'blocos' && (
        loading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-slate-500">Carregando blocos...</p>
          </div>
        ) : blocosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Nenhum bloco encontrado</p>
            <p className="text-slate-400 text-sm mt-1">Crie um bloco para começar a organizar questões.</p>
            <button onClick={() => { setBlocoEditando(null); setShowBlocoForm(true); }}
              className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
              + Criar primeiro bloco
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {blocosPorDisc.map(disc => (
              <div key={disc.id}>
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${COR_DISC[disc.cor]?.text}`}>{disc.label}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {disc.blocos.map(bloco => (
                    <BlocoCard
                      key={bloco.id}
                      bloco={bloco}
                      torneios={torneios}
                      assocMap={assocMap}
                      onEdit={b => { setBlocoEditando(b); setShowBlocoForm(true); }}
                      onDelete={b => { setBlocoParaDeletar(b); setShowDeleteBloco(true); }}
                      onAddQuestao={b => { setBlocoAlvo(b); setShowCreateQuestao(true); }}
                      onRemoveQuestao={(b, q) => { setRemoveTarget({ bloco: b, questao: q }); setShowDeleteQuestao(true); }}
                      onEditQuestao={q => { setQuestaoEditando(q); setShowEditQuestao(true); }}
                      onToggleAssoc={handleToggleAssoc}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Aba Lista de Questões */}
      {aba === 'lista' && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <p className="text-sm font-semibold text-slate-600">
              Total de questões nos blocos: <span className="text-blue-600">{blocos.reduce((acc, b) => acc + (b.total_questoes || 0), 0)}</span>
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {blocos.flatMap(b => (b.questoes || []).map(q => ({ ...q, _bloco: b }))).map(q => (
              <div key={`${q._bloco.id}-${q.id}`} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{q.enunciado}</p>
                  <p className="text-xs text-slate-400">{q._bloco.titulo} · {q.pontos} pts · {q.dificuldade}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${COR_DISC[DISCIPLINAS.find(d => d.id === q._bloco.disciplina)?.cor || 'blue']?.badge}`}>
                  {DISCIPLINAS.find(d => d.id === q._bloco.disciplina)?.label}
                </span>
              </div>
            ))}
            {blocos.flatMap(b => b.questoes || []).length === 0 && (
              <div className="p-8 text-center text-slate-400 text-sm">Nenhuma questão nos blocos ainda.</div>
            )}
          </div>
        </div>
      )}

      {/* ── Modais ─────────────────────────────────────────────────────────── */}

      {/* Criar / Editar bloco */}
      {showBlocoForm && (
        <BlocoFormModal
          bloco={blocoEditando}
          loading={saving}
          onClose={() => { setShowBlocoForm(false); setBlocoEditando(null); }}
          onSave={blocoEditando ? handleEditarBloco : handleCriarBloco}
        />
      )}

      {/* Confirmar deleção de bloco */}
      <ConfirmModal
        isOpen={showDeleteBloco}
        onClose={() => { setShowDeleteBloco(false); setBlocoParaDeletar(null); }}
        onConfirm={handleDeletarBloco}
        title="Excluir Bloco"
        message={`Tem certeza que deseja excluir o bloco "${blocoParaDeletar?.titulo}"? As questões não serão deletadas, apenas removidas do bloco.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Confirmar remoção de questão do bloco */}
      <ConfirmModal
        isOpen={showDeleteQuestao}
        onClose={() => { setShowDeleteQuestao(false); setRemoveTarget({ bloco: null, questao: null }); }}
        onConfirm={handleRemoverQuestao}
        title="Remover Questão do Bloco"
        message={`Remover "${removeTarget.questao?.enunciado?.substring(0, 60)}..." do bloco "${removeTarget.bloco?.titulo}"? A questão não será deletada.`}
        confirmText="Remover"
        cancelText="Cancelar"
        type="warning"
      />

      {/* Criar questão dentro de um bloco */}
      {showCreateQuestao && blocoAlvo && (
        <CreateQuestaoTesteForm
          categoriaFixa={blocoAlvo.disciplina}
          dificuldadeFixa={blocoAlvo.dificuldade}
          onClose={() => { setShowCreateQuestao(false); setBlocoAlvo(null); }}
          onSuccess={handleQuestaoAdicionada}
        />
      )}

      {/* Editar questão */}
      {showEditQuestao && questaoEditando && (
        <EditQuestaoTesteForm
          questao={questaoEditando}
          onClose={() => { setShowEditQuestao(false); setQuestaoEditando(null); }}
          onSuccess={handleQuestaoEditada}
        />
      )}
    </div>
  );
}
