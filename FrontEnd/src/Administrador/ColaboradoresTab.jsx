/**
 * ColaboradoresTab.jsx
 *
 * Painel completo de gestão de colaboradores/professores no AdminDashboard.
 * - Visualização persistente de todos os colaboradores (pendentes, aprovados, rejeitados, suspensos)
 * - Aprovar / rejeitar / suspender
 * - Visualizar documentos enviados com preview e download
 * - Criar colaborador manualmente
 */

import { useState, useEffect } from 'react';
import adminService from './adminService';
import { useAuth } from '../context/AuthContext';
import {
  Users, CheckCircle, XCircle, AlertCircle, Search, Clock,
  Mail, GraduationCap, User, Eye, EyeOff, FileText, Image,
  Download, RefreshCw, UserPlus, Ban, ChevronDown,
  BookOpen, Code, Calculator, X,
} from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  pendente:  { label: 'Pendente',   cls: 'bg-amber-100 text-amber-800'  },
  aprovado:  { label: 'Aprovado',   cls: 'bg-green-100 text-green-800'  },
  rejeitado: { label: 'Rejeitado',  cls: 'bg-red-100 text-red-800'      },
  suspenso:  { label: 'Suspenso',   cls: 'bg-gray-200 text-gray-700'    },
};

const DISCIPLINA_ICONS = {
  matematica:  <Calculator size={14} className="text-blue-500" />,
  programacao: <Code       size={14} className="text-green-500" />,
  ingles:      <BookOpen   size={14} className="text-purple-500" />,
};

const NIVEIS_LABEL = {
  estudante_universitario: 'Estudante universitário',
  tecnico:    'Técnico',
  licenciado: 'Licenciado',
  mestre:     'Mestre',
  doutor:     'Doutor',
  professor:  'Professor',
  profissional: 'Profissional',
  outro:      'Outro',
};

const DISCIPLINAS = [
  { value: 'matematica',  label: 'Matemática' },
  { value: 'programacao', label: 'Programação' },
  { value: 'ingles',      label: 'Inglês' },
];

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatBytes(b) {
  if (!b) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(tipo) {
  if (tipo?.startsWith('image/')) return <Image size={16} className="text-blue-500" />;
  return <FileText size={16} className="text-gray-500" />;
}

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;

/* ─── Badge de status ─────────────────────────────────────────── */
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'bg-gray-100 text-gray-700' };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>{cfg.label}</span>;
}

/* ─── Modal de detalhes ───────────────────────────────────────── */
function ModalDetalhes({ colaborador, onClose, onAprovar, onRejeitar, onSuspender, loadingId, svc }) {
  const [docs, setDocs]         = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  const carregarDocs = async () => {
    if (showDocs) { setShowDocs(false); return; }
    setLoadingDocs(true);
    try {
      const res = await svc.colaboradores.getDocumentos(colaborador.id);
      setDocs(res.data || []);
    } catch { setDocs([]); }
    finally { setLoadingDocs(false); setShowDocs(true); }
  };

  const c = colaborador;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-2xl">
          <h3 className="font-bold text-gray-800 text-lg">Perfil do Colaborador</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Avatar + Nome */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl overflow-hidden flex-shrink-0">
              {c.imagem ? <img src={c.imagem} alt={c.nome} className="w-full h-full object-cover" /> : (c.nome?.[0] || 'C')}
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-base">{c.nome}</h4>
              <p className="text-gray-500 text-sm">{c.username ? `@${c.username}` : c.email}</p>
              <StatusBadge status={c.status_colaborador || 'pendente'} />
            </div>
          </div>

          {/* Dados pessoais */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['E-mail',      c.email],
              ['Telefone',    c.telefone || '—'],
              ['Nascimento',  formatDate(c.nascimento)],
              ['Sexo',        c.sexo || '—'],
              ['Escola',      c.escola || '—'],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-gray-400 text-xs mb-0.5">{label}</p>
                <p className="font-medium text-gray-800 truncate">{val}</p>
              </div>
            ))}
          </div>

          {/* Dados académicos */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2 text-sm">
            <p className="font-semibold text-blue-800 text-xs uppercase tracking-wide mb-1">Dados Académicos</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-gray-400 text-xs">Área pretendida</p>
                <div className="flex items-center gap-1 font-medium capitalize text-gray-800">
                  {DISCIPLINA_ICONS[c.area_especialidade || c.disciplina_colaborador]}
                  {c.area_especialidade || c.disciplina_colaborador || '—'}
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Nível académico</p>
                <p className="font-medium text-gray-800">{NIVEIS_LABEL[c.nivel_academico] || c.nivel_academico || '—'}</p>
              </div>
            </div>
          </div>

          {/* Biografia */}
          {c.biografia && (
            <div>
              <p className="text-gray-400 text-xs mb-1">Biografia profissional</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl border border-gray-200 p-3 leading-relaxed whitespace-pre-line">
                {c.biografia}
              </p>
            </div>
          )}

          {/* Documentos */}
          <div>
            <button onClick={carregarDocs}
              className="flex items-center gap-2 text-sm text-blue-600 font-semibold hover:underline">
              {loadingDocs
                ? <><RefreshCw size={14} className="animate-spin" /> Carregando documentos...</>
                : showDocs
                ? <><EyeOff size={14} /> Ocultar documentos</>
                : <><Eye size={14} /> Ver documentos enviados</>}
            </button>

            {showDocs && (
              docs.length === 0
                ? <p className="text-xs text-gray-400 mt-2">Nenhum documento enviado.</p>
                : (
                  <ul className="mt-2 space-y-2">
                    {docs.map((doc, i) => (
                      <li key={i} className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                        {fileIcon(doc.tipo)}
                        <span className="flex-1 truncate font-medium">{doc.nome_original}</span>
                        <span className="text-gray-400 flex-shrink-0">{formatBytes(doc.tamanho)}</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-400 flex-shrink-0">{formatDate(doc.data_upload)}</span>
                        <a href={`${API_BASE}${doc.caminho}`} target="_blank" rel="noreferrer" title="Abrir"
                          className="text-blue-500 hover:text-blue-700 flex-shrink-0">
                          <Eye size={14} />
                        </a>
                        <a href={`${API_BASE}${doc.caminho}`} download={doc.nome_original} title="Download"
                          className="text-gray-400 hover:text-gray-700 flex-shrink-0">
                          <Download size={14} />
                        </a>
                      </li>
                    ))}
                  </ul>
                )
            )}
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
            <div><span className="font-medium">Registo:</span> {formatDate(c.createdAt)}</div>
            <div><span className="font-medium">Última actividade:</span> {formatDate(c.updatedAt)}</div>
          </div>

          {/* Ações */}
          {(c.status_colaborador === 'pendente' || c.status_colaborador === 'aprovado') && (
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              {c.status_colaborador === 'pendente' && (
                <button onClick={() => onAprovar(c)}
                  disabled={loadingId === c.id}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-1">
                  <CheckCircle size={15} /> Aprovar
                </button>
              )}
              {c.status_colaborador === 'pendente' && (
                <button onClick={() => onRejeitar(c)}
                  disabled={loadingId === c.id}
                  className="flex-1 py-2.5 border border-red-300 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50 transition disabled:opacity-50 flex items-center justify-center gap-1">
                  <XCircle size={15} /> Rejeitar
                </button>
              )}
              {c.status_colaborador === 'aprovado' && (
                <button onClick={() => onSuspender(c)}
                  disabled={loadingId === c.id}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center gap-1">
                  <Ban size={15} /> Suspender
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Modal de aprovação (escolher disciplina) ────────────────── */
function ModalAprovar({ colaborador, onConfirm, onCancel, loading }) {
  const [disciplina, setDisciplina] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        <h3 className="font-bold text-gray-800 text-lg mb-1">Aprovar Colaborador</h3>
        <p className="text-gray-500 text-sm mb-4">
          Selecione a disciplina para <strong>{colaborador.nome}</strong>.
        </p>
        <div className="relative border border-gray-300 rounded-xl mb-4">
          <select
            value={disciplina}
            onChange={e => setDisciplina(e.target.value)}
            className="w-full px-3 py-3 bg-transparent outline-none text-sm appearance-none pr-8"
          >
            <option value="">Escolher disciplina</option>
            {DISCIPLINAS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={() => onConfirm(disciplina)}
            disabled={!disciplina || loading}
            className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1">
            {loading ? <><RefreshCw size={14} className="animate-spin" /> A processar...</> : <><CheckCircle size={14} /> Aprovar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal de rejeição ───────────────────────────────────────── */
function ModalRejeitar({ colaborador, onConfirm, onCancel, loading }) {
  const [motivo, setMotivo] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        <h3 className="font-bold text-gray-800 text-lg mb-1">Rejeitar Candidatura</h3>
        <p className="text-gray-500 text-sm mb-3">
          Tem a certeza que pretende rejeitar <strong>{colaborador.nome}</strong>?
        </p>
        <textarea
          value={motivo} onChange={e => setMotivo(e.target.value)} rows={3}
          placeholder="Motivo da rejeição (opcional)"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
        />
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={() => onConfirm(motivo)}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1">
            {loading ? <><RefreshCw size={14} className="animate-spin" /> A processar...</> : <><XCircle size={14} /> Rejeitar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Componente principal ────────────────────────────────────── */
export default function ColaboradoresTab() {
  const { token } = useAuth();
  const svc = adminService(token);

  const [lista, setLista]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [busca, setBusca]         = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [feedback, setFeedback]   = useState(null);
  const [detalhes, setDetalhes]   = useState(null);
  const [modalAprovar, setModalAprovar] = useState(null);
  const [modalRejeitar, setModalRejeitar] = useState(null);

  const toast = (tipo, msg) => {
    setFeedback({ tipo, msg });
    setTimeout(() => setFeedback(null), 3500);
  };

  const carregar = async () => {
    try {
      setLoading(true);
      const res = await svc.colaboradores.listarColaboradores();
      setLista(res.data || []);
    } catch {
      toast('error', 'Erro ao carregar colaboradores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  /* ── filtro ── */
  const filtrado = lista.filter(c => {
    const status = c.status_colaborador || 'pendente';
    if (filtroStatus !== 'todos' && status !== filtroStatus) return false;
    if (!busca.trim()) return true;
    const q = busca.toLowerCase();
    return (
      c.nome?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.username?.toLowerCase().includes(q) ||
      c.disciplina_colaborador?.toLowerCase().includes(q)
    );
  });

  /* ── stats ── */
  const stats = {
    total:    lista.length,
    pendente: lista.filter(c => (c.status_colaborador || 'pendente') === 'pendente').length,
    aprovado: lista.filter(c => c.status_colaborador === 'aprovado').length,
    rejeitado: lista.filter(c => c.status_colaborador === 'rejeitado').length,
    suspenso: lista.filter(c => c.status_colaborador === 'suspenso').length,
  };

  /* ── handlers ── */
  const handleAprovar = async (disciplina) => {
    const c = modalAprovar;
    if (!disciplina) return;
    try {
      setLoadingId(c.id);
      await svc.colaboradores.aprovarColaborador(c.id, disciplina);
      toast('success', `${c.nome} aprovado com sucesso!`);
      setModalAprovar(null);
      setDetalhes(null);
      await carregar();
    } catch {
      toast('error', 'Erro ao aprovar colaborador.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleRejeitar = async (motivo) => {
    const c = modalRejeitar;
    try {
      setLoadingId(c.id);
      await svc.colaboradores.rejeitarColaborador(c.id, { motivo });
      toast('success', `Candidatura de ${c.nome} rejeitada.`);
      setModalRejeitar(null);
      setDetalhes(null);
      await carregar();
    } catch {
      toast('error', 'Erro ao rejeitar colaborador.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleSuspender = async (c) => {
    if (!confirm(`Suspender a conta de ${c.nome}?`)) return;
    try {
      setLoadingId(c.id);
      await svc.colaboradores.suspenderColaborador(c.id);
      toast('success', `${c.nome} suspenso.`);
      setDetalhes(null);
      await carregar();
    } catch {
      toast('error', 'Erro ao suspender colaborador.');
    } finally {
      setLoadingId(null);
    }
  };

  /* ── render ── */
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200">

      {/* Feedback */}
      {feedback && (
        <div className={`mx-6 mt-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${
          feedback.tipo === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {feedback.tipo === 'success'
            ? <CheckCircle size={14} className="flex-shrink-0" />
            : <AlertCircle size={14} className="flex-shrink-0" />}
          {feedback.msg}
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200">
        <div className="flex flex-wrap items-start gap-4 justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Users size={20} /> Gestão de Colaboradores
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              Supervisão pedagógica permanente — {stats.total} colaborador{stats.total !== 1 ? 'es' : ''} registado{stats.total !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" placeholder="Pesquisar..." value={busca}
                onChange={e => setBusca(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 w-52"
              />
            </div>
            <button onClick={carregar} disabled={loading}
              className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { key: 'todos',    label: 'Todos',    val: stats.total,    cls: 'bg-slate-100 text-slate-700' },
            { key: 'pendente', label: 'Pendentes', val: stats.pendente, cls: 'bg-amber-100 text-amber-800' },
            { key: 'aprovado', label: 'Aprovados', val: stats.aprovado, cls: 'bg-green-100 text-green-800' },
            { key: 'rejeitado',label: 'Rejeitados',val: stats.rejeitado,cls: 'bg-red-100 text-red-700' },
            { key: 'suspenso', label: 'Suspensos', val: stats.suspenso, cls: 'bg-gray-100 text-gray-700' },
          ].map(s => (
            <button key={s.key}
              onClick={() => setFiltroStatus(s.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${s.cls} ${
                filtroStatus === s.key ? 'ring-2 ring-offset-1 ring-blue-500' : 'opacity-80 hover:opacity-100'
              }`}>
              {s.label} ({s.val})
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        {loading ? (
          <div className="py-16 text-center">
            <RefreshCw size={28} className="animate-spin text-blue-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">A carregar colaboradores...</p>
          </div>
        ) : filtrado.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhum colaborador encontrado</p>
            <p className="text-gray-400 text-sm mt-1">
              {busca ? 'Tente outra pesquisa.' : 'Ainda não há colaboradores nesta categoria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase">Colaborador</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase hidden md:table-cell">Área</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase hidden lg:table-cell">Nível</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase hidden md:table-cell">Registo</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-400 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtrado.map(c => {
                  const status = c.status_colaborador || 'pendente';
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      {/* Nome + email */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0 overflow-hidden">
                            {c.imagem
                              ? <img src={c.imagem} alt={c.nome} className="w-full h-full object-cover" />
                              : (c.nome?.[0] || 'C')}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate">{c.nome}</p>
                            <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                              <Mail size={10} /> {c.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Área */}
                      <td className="py-3 px-3 hidden md:table-cell">
                        <div className="flex items-center gap-1 capitalize text-gray-700">
                          {DISCIPLINA_ICONS[c.disciplina_colaborador || c.area_especialidade]}
                          {c.disciplina_colaborador || c.area_especialidade || '—'}
                        </div>
                      </td>
                      {/* Nível */}
                      <td className="py-3 px-3 hidden lg:table-cell text-gray-600 text-xs">
                        {NIVEIS_LABEL[c.nivel_academico] || '—'}
                      </td>
                      {/* Status */}
                      <td className="py-3 px-3">
                        <StatusBadge status={status} />
                      </td>
                      {/* Data */}
                      <td className="py-3 px-3 hidden md:table-cell text-gray-500 text-xs">
                        {formatDate(c.createdAt)}
                      </td>
                      {/* Ações */}
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setDetalhes(c)} title="Ver detalhes"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                            <Eye size={15} />
                          </button>
                          {status === 'pendente' && (
                            <>
                              <button onClick={() => setModalAprovar(c)} disabled={loadingId === c.id}
                                title="Aprovar"
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-40">
                                <CheckCircle size={15} />
                              </button>
                              <button onClick={() => setModalRejeitar(c)} disabled={loadingId === c.id}
                                title="Rejeitar"
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-40">
                                <XCircle size={15} />
                              </button>
                            </>
                          )}
                          {status === 'aprovado' && (
                            <button onClick={() => handleSuspender(c)} disabled={loadingId === c.id}
                              title="Suspender"
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-40">
                              <Ban size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 px-3 py-3 border-t border-gray-100">
              {filtrado.length} de {lista.length} colaborador{lista.length !== 1 ? 'es' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Modais */}
      {detalhes && (
        <ModalDetalhes
          colaborador={detalhes}
          onClose={() => setDetalhes(null)}
          onAprovar={(c) => { setDetalhes(null); setModalAprovar(c); }}
          onRejeitar={(c) => { setDetalhes(null); setModalRejeitar(c); }}
          onSuspender={handleSuspender}
          loadingId={loadingId}
          svc={svc}
        />
      )}
      {modalAprovar && (
        <ModalAprovar
          colaborador={modalAprovar}
          onConfirm={handleAprovar}
          onCancel={() => setModalAprovar(null)}
          loading={loadingId === modalAprovar.id}
        />
      )}
      {modalRejeitar && (
        <ModalRejeitar
          colaborador={modalRejeitar}
          onConfirm={handleRejeitar}
          onCancel={() => setModalRejeitar(null)}
          loading={loadingId === modalRejeitar.id}
        />
      )}
    </div>
  );
}
