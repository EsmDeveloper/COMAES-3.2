import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from './Layout';
import NivelBadge from '../../components/NivelBadge';
import useNivel from '../../hooks/useNivel';
import StreakBadge from '../../components/StreakBadge';
import useStreak from '../../hooks/useStreak';
import LogoutModal from '../../components/LogoutModal';
import {
  Camera, CheckCircle, AlertCircle, X, Edit2, LogOut,
  Mail, Calendar, Trophy, Star, Award, Save, ChevronRight,
  GraduationCap, Phone, User, BookOpen, Clock, Target,
  Shield, Users, BarChart3, FileText, Settings, ArrowLeft,
  BookMarked, CheckSquare, Code,
} from 'lucide-react';
import { validateNome, validateEmail, validateBio, validateFileUpload } from '../../utils/validators';

const API = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`;

/* ─── Toast ────────────────────────────────────────────────────── */
function Toast({ type, msg, onClose }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [msg, onClose]);
  if (!msg) return null;
  const ok = type === 'success';
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm
      ${ok ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-700'}`}>
      {ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      <span className="flex-1">{msg}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100"><X size={14} /></button>
    </div>
  );
}

/* ─── StatCard ─────────────────────────────────────────────────── */
function StatCard({ icon, label, value, colorClass = 'bg-blue-50 text-blue-600' }) {
  return (
    <div className="flex-1 min-w-[130px] bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        {icon}
      </div>
      <div>
        <div className="text-xl font-bold text-gray-900 leading-tight">{value}</div>
        <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

/* ─── SectionTitle ─────────────────────────────────────────────── */
function SectionTitle({ children }) {
  return <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">{children}</h2>;
}

/* ─── Tab button ────────────────────────────────────────────────── */
function Tab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all -mb-px
        ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
    >
      {children}
    </button>
  );
}

/* ─── Avatar ────────────────────────────────────────────────────── */
function AvatarBlock({ src, initials, size = 88, editMode, onFile }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div
        className="rounded-full overflow-hidden border-4 border-white shadow-md flex items-center justify-center bg-blue-600 text-white font-bold"
        style={{ width: size, height: size, fontSize: size * 0.35 }}
      >
        {src
          ? <img src={src} alt="avatar" className="w-full h-full object-cover" />
          : initials}
      </div>
      {editMode && (
        <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center cursor-pointer border-2 border-white shadow">
          <Camera size={13} />
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>
      )}
    </div>
  );
}

/* ─── InfoRow ────────────────────────────────────────────────────── */
function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-400 font-medium">{label}</div>
        <div className="text-sm text-gray-800 font-medium mt-0.5 break-words">{value}</div>
      </div>
    </div>
  );
}

/* ─── MedalIcon ──────────────────────────────────────────────────── */
function MedalIcon({ pos }) {
  if (pos === 1) return <span>🥇</span>;
  if (pos === 2) return <span>🥈</span>;
  if (pos === 3) return <span>🥉</span>;
  return <span className="text-gray-400 text-xs font-semibold">{pos}º</span>;
}

/* ═══════════════════════════════════════════════════════════════
   PERFIL DO ADMINISTRADOR
═══════════════════════════════════════════════════════════════ */
function AdminPerfilLayout({ user, token, onLogout, navigate }) {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

  useEffect(() => {
    if (!token) return;
    setLoadingStats(true);
    Promise.all([
      fetch(`${API}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => null),
      fetch(`${API}/api/admin/atividades-recentes`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => null),
    ]).then(([statsRes, activityRes]) => {
      if (statsRes?.success !== false) setStats(statsRes);
      if (activityRes?.success !== false) setRecentActivity(activityRes?.data || activityRes || []);
    }).finally(() => setLoadingStats(false));
  }, [token]);

  const initials = (user.nome || user.name || 'A').charAt(0).toUpperCase();
  const avatarSrc = user.avatar || user.imagem || null;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-5">

        {/* Hero card */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center gap-5 flex-wrap">
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center font-bold text-2xl overflow-hidden flex-shrink-0 border-4 border-white/20">
              {avatarSrc
                ? <img src={avatarSrc} alt={user.nome} className="w-full h-full object-cover" />
                : initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold">{user.nome || user.name || 'Administrador'}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-500/30 border border-blue-400/40 rounded-full text-xs font-semibold text-blue-200">
                  <Shield size={11} /> Administrador
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-0.5">{user.email}</p>
              <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                <Calendar size={11} /> Conta criada em {joinDate}
              </p>
            </div>
            <div className="flex gap-2 self-start">
              <button
                onClick={() => navigate('/administrador')}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition"
              >
                <BarChart3 size={14} /> Painel Admin
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-2 border border-white/20 text-gray-300 hover:bg-white/10 rounded-xl text-sm transition"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats administrativas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              icon: <Users size={16} />,
              label: 'Utilizadores',
              value: loadingStats ? '…' : (stats?.totalUsuarios ?? '—'),
              color: 'bg-blue-50 text-blue-600',
            },
            {
              icon: <Trophy size={16} />,
              label: 'Torneios',
              value: loadingStats ? '…' : (stats?.totalTorneios ?? '—'),
              color: 'bg-amber-50 text-amber-600',
            },
            {
              icon: <FileText size={16} />,
              label: 'Questões',
              value: loadingStats ? '…' : (stats?.totalQuestoes ?? '—'),
              color: 'bg-purple-50 text-purple-600',
            },
            {
              icon: <GraduationCap size={16} />,
              label: 'Colaboradores',
              value: loadingStats ? '…' : (stats?.totalColaboradores ?? '—'),
              color: 'bg-green-50 text-green-600',
            },
          ].map(s => (
            <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} colorClass={s.color} />
          ))}
        </div>

        {/* Detalhes da conta */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <SectionTitle>Informações da Conta Administrativa</SectionTitle>
          <div className="divide-y divide-gray-100">
            <InfoRow icon={<User size={14} />}     label="Nome"             value={user.nome || user.name} />
            <InfoRow icon={<Mail size={14} />}     label="E-mail"           value={user.email} />
            <InfoRow icon={<Shield size={14} />}   label="Papel"            value="Administrador do sistema" />
            <InfoRow icon={<Calendar size={14} />} label="Membro desde"     value={joinDate} />
            <InfoRow icon={<Clock size={14} />}    label="Último acesso"    value={user.updatedAt ? new Date(user.updatedAt).toLocaleString('pt-PT') : '—'} />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Para editar o seu perfil ou alterar a senha, aceda às{' '}
              <Link to="/configuracoes" className="text-blue-600 hover:underline font-medium">Configurações</Link>.
            </p>
          </div>
        </div>

        {/* Atividade recente */}
        {recentActivity.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <SectionTitle>Actividade Recente do Sistema</SectionTitle>
            <div className="space-y-2">
              {recentActivity.slice(0, 5).map((act, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BarChart3 size={12} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">{act.descricao || act.mensagem || JSON.stringify(act)}</p>
                    {act.data && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(act.data).toLocaleString('pt-PT')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PERFIL DO COLABORADOR
═══════════════════════════════════════════════════════════════ */
function ColaboradorPerfilLayout({ user, token, onSave, saving, editMode, setEditMode, form, setForm, formErrors, cancelEdit, handleFile, preview, onLogout, navigate, toast, setToast, showLogout, setShowLogout, logout, inputCls, avatarSrc, initials, joinDate }) {
  const [questoes, setQuestoes]     = useState([]);
  const [loadingQ, setLoadingQ]     = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoadingQ(true);
    fetch(`${API}/api/colaborador/questoes`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(res => setQuestoes(res.data || res.questoes || []))
      .catch(() => {})
      .finally(() => setLoadingQ(false));
  }, [token]);

  const totalQuestoes  = questoes.length;
  const aprovadas      = questoes.filter(q => q.status_aprovacao === 'aprovada').length;
  const taxaAprovacao  = totalQuestoes > 0 ? Math.round((aprovadas / totalQuestoes) * 100) : 0;
  const pendentes      = questoes.filter(q => !q.status_aprovacao || q.status_aprovacao === 'pendente').length;

  const DISCIPLINA_LABELS = { matematica: 'Matemática', programacao: 'Programação', ingles: 'Inglês' };
  const NIVEIS_LABELS = {
    estudante_universitario: 'Estudante universitário', tecnico: 'Técnico', licenciado: 'Licenciado',
    mestre: 'Mestre', doutor: 'Doutor', professor: 'Professor', profissional: 'Profissional', outro: 'Outro',
  };

  const statusBadgeCls = {
    pendente:  'bg-amber-100 text-amber-800',
    aprovado:  'bg-green-100 text-green-800',
    rejeitado: 'bg-red-100 text-red-700',
  };

  return (
    <>
      <LogoutModal
        isOpen={showLogout}
        onConfirm={() => { setShowLogout(false); logout(); navigate('/login'); }}
        onCancel={() => setShowLogout(false)}
      />

      {/* Simple header with back button */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate('/colaborador/dashboard')}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm font-medium"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-5">

        {/* Hero card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="flex items-start gap-5 flex-wrap">
            <AvatarBlock src={avatarSrc} initials={initials} size={88} editMode={editMode} onFile={handleFile} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">
                  {user.nome || user.name || 'Colaborador'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-teal-100 text-teal-800 rounded-full text-xs font-semibold">
                  <GraduationCap size={11} /> Colaborador
                </span>
                {user.status_colaborador && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadgeCls[user.status_colaborador] || 'bg-gray-100 text-gray-600'}`}>
                    {user.status_colaborador === 'aprovado' ? 'Aprovado' : user.status_colaborador === 'pendente' ? 'Pendente' : 'Suspenso'}
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-sm mt-0.5">@{user.username || user.email?.split('@')[0]}</p>
              {user.disciplina_colaborador && (
                <p className="text-sm text-teal-600 font-medium mt-1 flex items-center gap-1">
                  <Code size={13} /> {DISCIPLINA_LABELS[user.disciplina_colaborador] || user.disciplina_colaborador}
                </p>
              )}
              {(user.biografia || user.bio) && !editMode && (
                <p className="text-sm text-gray-600 mt-2 leading-relaxed max-w-lg">{user.biografia || user.bio}</p>
              )}
            </div>

            <div className="flex gap-2 self-start">
              {!editMode ? (
                <>
                  <button onClick={() => setEditMode(true)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
                    <Edit2 size={13} /> Editar
                  </button>
                  <button onClick={() => setShowLogout(true)}
                    className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-500 rounded-xl text-sm hover:bg-gray-50 transition">
                    <LogOut size={13} />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={onSave} disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                    <Save size={13} /> {saving ? 'A guardar…' : 'Guardar'}
                  </button>
                  <button onClick={cancelEdit} disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-500 rounded-xl text-sm hover:bg-gray-50 transition">
                    <X size={13} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Formulário de edição */}
          {editMode && (
            <div className="mt-5 pt-5 border-t border-gray-100 grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nome completo *</label>
                  <input className={inputCls('nome')} value={form.nome}
                    onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} />
                  {formErrors.nome && <p className="text-xs text-red-500 mt-1">{formErrors.nome}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">E-mail</label>
                  <input className={inputCls('email')} type="email" value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                  {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Biografia profissional <span className="font-normal text-gray-400">({form.biografia.length}/300)</span>
                </label>
                <textarea className={`${inputCls('biografia')} resize-none`} rows={3}
                  value={form.biografia} maxLength={300}
                  onChange={e => setForm(p => ({ ...p, biografia: e.target.value }))}
                  placeholder="Descreva a sua experiência…" />
                {formErrors.biografia && <p className="text-xs text-red-500 mt-1">{formErrors.biografia}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Stats pedagógicas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard icon={<BookMarked size={16} />} label="Questões criadas"  value={totalQuestoes}            colorClass="bg-teal-50 text-teal-600" />
          <StatCard icon={<CheckSquare size={16} />} label="Taxa de aprovação" value={`${taxaAprovacao}%`}     colorClass="bg-green-50 text-green-600" />
          <StatCard icon={<Clock size={16} />}       label="Pendentes"        value={pendentes}                colorClass="bg-amber-50 text-amber-600" />
        </div>

        {/* Dados académicos + identidade */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <SectionTitle>Dados Académicos e Profissionais</SectionTitle>
          <div className="divide-y divide-gray-100">
            <InfoRow icon={<User size={14} />}         label="Nome completo"      value={user.nome || user.name} />
            <InfoRow icon={<Mail size={14} />}         label="E-mail"             value={user.email} />
            <InfoRow icon={<GraduationCap size={14} />} label="Área de especialidade"
              value={DISCIPLINA_LABELS[user.disciplina_colaborador] || user.disciplina_colaborador} />
            <InfoRow icon={<BookOpen size={14} />}     label="Nível académico"
              value={NIVEIS_LABELS[user.nivel_academico] || user.nivel_academico} />
            <InfoRow icon={<Calendar size={14} />}     label="Colaborador desde"  value={joinDate} />
            <InfoRow icon={<Shield size={14} />}       label="Estado da conta"
              value={user.status_colaborador === 'aprovado' ? 'Aprovado pelo administrador' : user.status_colaborador} />
          </div>
        </div>



      </div>
      <Toast type={toast.type} msg={toast.msg} onClose={() => setToast({ type: '', msg: '' })} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function Perfil() {  const { user, token, login, logout } = useAuth();
  const navigate = useNavigate();

  /* ── Tabs: perfil | historico | certificados ── */
  const [activeTab, setActiveTab] = useState('perfil');

  /* ── Edit form ── */
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', biografia: '', escola: '', telefone: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  /* ── Data ── */
  const [participacoes, setParticipacoes] = useState([]);
  const [certificados, setCertificados] = useState([]);
  const [statsLoad, setStatsLoad] = useState(false);

  /* ── Toast ── */
  const [toast, setToast] = useState({ type: '', msg: '' });
  const showToast = (type, msg) => setToast({ type, msg });

  /* ── Modal logout ── */
  const [showLogout, setShowLogout] = useState(false);

  /* ── Nível do utilizador ── */
  const { nivel, xpTotal, progresso } = useNivel();

  /* ── Streak do utilizador ── */
  const { streak, maximo, ativa, mensagem: streakMsg } = useStreak();

  /* ── Populate form when user loads ── */
  useEffect(() => {
    if (user) {
      setForm({
        nome:      user.nome || user.name || user.fullName || '',
        email:     user.email || '',
        biografia: user.biografia || user.bio || '',
        escola:    user.escola || '',
        telefone:  user.telefone || user.phone || '',
      });
    }
  }, [user]);

  /* ── Load participações ── */
  useEffect(() => {
    if (!user?.id) return;
    setStatsLoad(true);
    fetch(`${API}/usuarios/${user.id}/participacoes`)
      .then(r => r.json())
      .then(res => { if (res.success) setParticipacoes(res.data || []); })
      .catch(() => {})
      .finally(() => setStatsLoad(false));
  }, [user?.id]);

  /* ── Load certificados on tab ── */
  useEffect(() => {
    if (!user?.id || activeTab !== 'certificados') return;
    fetch(`${API}/api/certificados/meus-certificados/${user.id}`)
      .then(r => r.json())
      .then(res => { if (res.success) setCertificados(res.data || []); })
      .catch(() => {});
  }, [user?.id, activeTab]);

  /* ── Cleanup preview URL ── */
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  /* ── Computed stats ── */
  const totalTorneios = participacoes.length;
  const totalPontos   = participacoes.reduce((a, p) => a + Number(p.pontuacao || 0), 0);
  const totalPodios   = participacoes.filter(p => p.posicao && p.posicao <= 3).length;
  const mediaAcertos  = participacoes.length
    ? Math.round(participacoes.reduce((a, p) => a + Number(p.pontuacao || 0), 0) / participacoes.length)
    : 0;

  /* ── Handlers ── */
  const handleFile = useCallback((e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = validateFileUpload(f, { maxSizeMB: 5, allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] });
    if (!r.valid) { showToast('error', r.error); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.nome.trim()) errs.nome = 'Nome obrigatório';
    else if (form.nome.trim().length < 2) errs.nome = 'Nome muito curto';
    if (form.email && !/^[^@]+@[^@]+\.[^@]{2,}$/.test(form.email)) errs.email = 'Email inválido';
    if (form.biografia && form.biografia.length > 300) errs.biografia = 'Máximo 300 caracteres';
    return errs;
  };

  const onSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    setSaving(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res  = await fetch(`${API}/usuarios/${user.id}`, {
        method: 'PUT', headers,
        body: JSON.stringify({
          nome: form.nome,
          email: form.email,
          biografia: form.biografia,
          escola: form.escola,
          telefone: form.telefone,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Erro ao guardar perfil');
      if (body.data && login) login(body.data, token);

      if (file) {
        const fd = new FormData();
        fd.append('avatar', file);
        const up = await fetch(`${API}/usuarios/${user.id}/avatar`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        });
        const upB = await up.json();
        if (!up.ok) throw new Error(upB.error || 'Erro ao enviar foto');
        if (upB.data && login) login(upB.data, token);
      }

      showToast('success', 'Perfil actualizado com sucesso!');
      setEditMode(false);
      setFile(null);
      setPreview(null);
    } catch (err) {
      showToast('error', err.message || 'Erro ao guardar');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setFile(null);
    setPreview(null);
    setFormErrors({});
    if (user) setForm({
      nome:      user.nome || user.name || user.fullName || '',
      email:     user.email || '',
      biografia: user.biografia || user.bio || '',
      escola:    user.escola || '',
      telefone:  user.telefone || user.phone || '',
    });
  };

  /* ── Unauthenticated ── */
  if (!user) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-20 px-5">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5 text-blue-600">
              <User size={24} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Acesso restrito</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">Faça login para ver o seu perfil.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/login')} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">Entrar</button>
              <button onClick={() => navigate('/cadastro')} className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">Cadastrar</button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ─── Perfil do ADMINISTRADOR ─────────────────────────────────────────────
  const isAdmin = user.isAdmin === true || user.isAdmin === 1 || user.role === 'admin';

  // Calcular valores comuns (usados tanto no perfil de colaborador como de estudante)
  const avatarSrc = preview || user.avatar || user.imagem || null;
  const initials  = (user.nome || user.name || user.username || 'U').charAt(0).toUpperCase();
  const joinDate  = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
    : null;
  const inputCls = (field) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition
     ${formErrors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`;

  if (isAdmin) {
    return <AdminPerfilLayout user={user} token={token} onLogout={() => { logout(); navigate('/login'); }} navigate={navigate} />;
  }

  // ─── Perfil do COLABORADOR ───────────────────────────────────────────────
  if (user.role === 'colaborador') {
    return <ColaboradorPerfilLayout user={user} token={token} onSave={onSave} saving={saving} editMode={editMode} setEditMode={setEditMode} form={form} setForm={setForm} formErrors={formErrors} cancelEdit={cancelEdit} handleFile={handleFile} preview={preview} onLogout={() => { setShowLogout(true); }} navigate={navigate} toast={toast} setToast={setToast} showLogout={showLogout} setShowLogout={setShowLogout} logout={logout} inputCls={inputCls} avatarSrc={avatarSrc} initials={initials} joinDate={joinDate} />;
  }

  // ─── Perfil do ESTUDANTE (padrão) ─────────────────────────────────────────
  return (
    <Layout>
      <LogoutModal
        isOpen={showLogout}
        onConfirm={() => { setShowLogout(false); logout(); navigate('/login'); }}
        onCancel={() => setShowLogout(false)}
      />

      <div className="max-w-3xl mx-auto px-4 py-8 pb-20 flex flex-col gap-5">

        {/* ───────── HERO CARD ───────── */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="flex items-start gap-5 flex-wrap">

            <AvatarBlock src={avatarSrc} initials={initials} size={90} editMode={editMode} onFile={handleFile} />

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                {user.nome || user.name || user.fullName || 'Utilizador'}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">@{user.username || user.email?.split('@')[0] || '—'}</p>

              {/* Badge de nível inline */}
              {nivel && (
                <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                  <NivelBadge nivelObj={nivel} xpTotal={xpTotal} compact />
                  {streak > 0 && (
                    <StreakBadge streak={streak} ativa={ativa} compact />
                  )}
                </div>
              )}

              {!editMode && (user.biografia || user.bio) && (
                <p className="text-sm text-gray-600 mt-2 leading-relaxed max-w-lg">
                  {user.biografia || user.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-3 mt-3">
                {user.email && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Mail size={12} /> {user.email}
                  </span>
                )}
                {(user.escola) && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <GraduationCap size={12} /> {user.escola}
                  </span>
                )}
                {joinDate && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar size={12} /> Desde {joinDate}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap self-start">
              {!editMode ? (
                <>
                  <button onClick={() => setEditMode(true)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
                    <Edit2 size={13} /> Editar Perfil
                  </button>
                  <button onClick={() => setShowLogout(true)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                    <LogOut size={13} /> Sair
                  </button>
                </>
              ) : (
                <>
                  <button onClick={onSave} disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                    <Save size={13} /> {saving ? 'A guardar…' : 'Guardar'}
                  </button>
                  <button onClick={cancelEdit} disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                    <X size={13} /> Cancelar
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── Edit form ── */}
          {editMode && (
            <div className="mt-5 pt-5 border-t border-gray-100 grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nome completo *</label>
                  <input className={inputCls('nome')} value={form.nome}
                    onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="O seu nome" />
                  {formErrors.nome && <p className="text-xs text-red-500 mt-1">{formErrors.nome}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">E-mail</label>
                  <input className={inputCls('email')} type="email" value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                  {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Telefone</label>
                  <input className={inputCls('telefone')} value={form.telefone}
                    onChange={e => setForm(p => ({ ...p, telefone: e.target.value }))} placeholder="9XXXXXXXX" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Instituição de Ensino</label>
                  <input className={inputCls('escola')} value={form.escola}
                    onChange={e => setForm(p => ({ ...p, escola: e.target.value }))} placeholder="Nome da sua escola" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Biografia <span className="font-normal text-gray-400">({form.biografia.length}/300)</span>
                </label>
                <textarea className={`${inputCls('biografia')} resize-none`} rows={3}
                  value={form.biografia} maxLength={300}
                  onChange={e => setForm(p => ({ ...p, biografia: e.target.value }))}
                  placeholder="Apresente-se brevemente…" />
                {formErrors.biografia && <p className="text-xs text-red-500 mt-1">{formErrors.biografia}</p>}
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                Para alterar a sua senha ou preferências, aceda a{' '}
                <Link to="/configuracoes" className="text-blue-600 hover:underline font-medium">Configurações</Link>.
              </p>
            </div>
          )}
        </div>

        {/* ───────── STATS ROW ───────── */}
        <div className="flex flex-wrap gap-3">
          <StatCard icon={<Trophy size={16} />} label="Torneios" value={totalTorneios}
            colorClass="bg-yellow-50 text-yellow-600" />
          <StatCard icon={<Star size={16} />} label="Pontos totais" value={totalPontos.toLocaleString('pt-PT')}
            colorClass="bg-blue-50 text-blue-600" />
          <StatCard icon={<Award size={16} />} label="Pódios" value={totalPodios}
            colorClass="bg-green-50 text-green-600" />
          <StatCard icon={<Target size={16} />} label="Média de pts" value={mediaAcertos}
            colorClass="bg-purple-50 text-purple-600" />
        </div>

        {/* ───────── IDENTITY DETAILS + TABS ───────── */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200">

          {/* Tab bar */}
          <div className="flex border-b border-gray-200 px-2">
            <Tab active={activeTab === 'perfil'}        onClick={() => setActiveTab('perfil')}>Identidade</Tab>
            <Tab active={activeTab === 'historico'}     onClick={() => setActiveTab('historico')}>Histórico</Tab>
            <Tab active={activeTab === 'certificados'}  onClick={() => setActiveTab('certificados')}>Certificados</Tab>
          </div>

          {/* ── Tab: Identidade ── */}
          {activeTab === 'perfil' && (
            <div className="p-6">
              <SectionTitle>Informações de Identidade</SectionTitle>

              {/* ── Card de Nível COMAES ── */}
              {nivel && (
                <div className="mb-5">
                  <NivelBadge nivelObj={nivel} xpTotal={xpTotal} full />
                </div>
              )}

              {/* ── Card de Streak COMAES ── */}
              {(streak > 0 || !ativa) && (
                <div className="mb-5">
                  <StreakBadge streak={streak} maximo={maximo} ativa={ativa} mensagem={streakMsg} card />
                </div>
              )}

              <div className="divide-y divide-gray-100">
                <InfoRow icon={<User size={14} />}          label="Nome completo"    value={user.nome || user.name || user.fullName} />
                <InfoRow icon={<Mail size={14} />}          label="E-mail"           value={user.email} />
                <InfoRow icon={<Phone size={14} />}         label="Telefone"         value={user.telefone || user.phone} />
                <InfoRow icon={<GraduationCap size={14} />} label="Instituição"      value={user.escola} />
                <InfoRow icon={<BookOpen size={14} />}      label="Sexo"             value={user.sexo} />
                <InfoRow icon={<Calendar size={14} />}      label="Nascimento"
                  value={user.nascimento ? new Date(user.nascimento).toLocaleDateString('pt-PT') : null} />
                <InfoRow icon={<Clock size={14} />}         label="Membro desde"     value={joinDate} />
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Preferências de conta em{' '}
                  <Link to="/configuracoes" className="text-blue-600 hover:underline font-medium">Configurações</Link>
                </p>
                <button onClick={() => navigate('/painel')}
                  className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
                  Dashboard <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ── Tab: Histórico ── */}
          {activeTab === 'historico' && (
            <div className="p-6">
              <SectionTitle>Histórico de Torneios</SectionTitle>
              {statsLoad ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : participacoes.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy size={36} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">Ainda não participou em nenhum torneio.</p>
                  <button onClick={() => navigate('/entrar-no-torneio')}
                    className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                    Participar agora
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Torneio</th>
                        <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Disciplina</th>
                        <th className="text-center text-xs font-semibold text-gray-500 pb-3 pr-4">Posição</th>
                        <th className="text-right text-xs font-semibold text-gray-500 pb-3">Pontos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {participacoes.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50 transition">
                          <td className="py-3 pr-4 font-medium text-gray-800 max-w-[200px] truncate">
                            {p.torneio?.titulo || `Torneio #${p.torneio_id}`}
                          </td>
                          <td className="py-3 pr-4 capitalize text-gray-600">
                            {p.disciplina_competida || '—'}
                          </td>
                          <td className="py-3 pr-4 text-center">
                            {p.posicao ? <MedalIcon pos={p.posicao} /> : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="py-3 text-right font-semibold text-blue-600">
                            {Number(p.pontuacao || 0).toLocaleString('pt-PT')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Certificados ── */}
          {activeTab === 'certificados' && (
            <div className="p-6">
              <SectionTitle>Meus Certificados</SectionTitle>
              {certificados.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">🏆</div>
                  <h3 className="font-semibold text-gray-800 mb-1">Nenhum certificado ainda</h3>
                  <p className="text-sm text-gray-500">Conquiste o pódio em torneios para ganhar certificados!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {certificados.map((cert) => {
                    const medals = {
                      1: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-800', icon: '🥇' },
                      2: { bg: 'bg-gray-50',   border: 'border-gray-300',   text: 'text-gray-700',   icon: '🥈' },
                      3: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-800', icon: '🥉' },
                    };
                    const m = medals[cert.posicao] || { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: '🏆' };
                    return (
                      <div key={cert.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 ${m.bg} ${m.border}`}>
                        <div className="text-3xl flex-shrink-0">{m.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm ${m.text}`}>
                            {cert.torneio?.titulo || 'Torneio'}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-white ${m.text}`}>
                              {cert.disciplina}
                            </span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-white ${m.text}`}>
                              {cert.posicao}º lugar
                            </span>
                            <span className={`text-xs ${m.text}`}>{cert.pontuacao} pts</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Código: {cert.codigo_certificado} · {new Date(cert.data_geracao).toLocaleDateString('pt-PT')}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <button
                            onClick={() => window.open(`${API}/api/certificados/download/${cert.codigo_certificado}`, '_blank')}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition">
                            Download
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(cert.codigo_certificado);
                              showToast('success', 'Código copiado!');
                            }}
                            className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-white transition">
                            Copiar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      <Toast type={toast.type} msg={toast.msg} onClose={() => setToast({ type: '', msg: '' })} />
    </Layout>
  );
}
