import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from './Layout';
import {
  Camera, CheckCircle, AlertCircle, X, Edit2, LogOut,
  Mail, Calendar, Trophy, Star, Award, Save, ChevronRight,
  LayoutDashboard, Settings,
} from 'lucide-react';
import {
  validateNome, validateEmail, validateBio, runValidations, validateFileUpload,
} from '../../utils/validators';

/* ─── Tokens ─────────────────────────────────────────────────── */
const c = {
  primary:     '#4F6EF7',
  primarySoft: '#EEF1FE',
  success:     '#10B981',
  successSoft: '#ECFDF5',
  surface:     '#FFFFFF',
  bg:          '#F7F8FC',
  border:      '#E8EAEF',
  borderFocus: '#A5B4FC',
  text:        '#0F1117',
  muted:       '#6B7280',
  subtle:      '#9CA3AF',
  red:         '#EF4444',
  redSoft:     '#FEF2F2',
  redBorder:   '#FECACA',
};

/* ─── Shared card style ──────────────────────────────────────── */
const card = {
  background: c.surface,
  borderRadius: 14,
  border: `1px solid ${c.border}`,
  boxShadow: '0 1px 3px rgba(15,17,23,0.05)',
};

/* ─── Micro components ───────────────────────────────────────── */

function Toast({ type, message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(onClose, 4000);
    return () => clearTimeout(id);
  }, [message, onClose]);
  if (!message) return null;
  const ok = type === 'success';
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 18px', borderRadius: 12,
      background: ok ? c.successSoft : c.redSoft,
      border: `1px solid ${ok ? '#A7F3D0' : c.redBorder}`,
      color: ok ? '#065F46' : '#991B1B',
      fontSize: 14, fontWeight: 500,
      boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
      maxWidth: 340,
    }}>
      {ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', padding: 0 }}>
        <X size={15} />
      </button>
    </div>
  );
}

function Avatar({ src, initials, size = 72 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: src ? 'transparent' : c.primary,
      overflow: 'hidden', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, color: '#fff',
      border: `2px solid ${c.border}`,
    }}>
      {src
        ? <img src={src} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : initials}
    </div>
  );
}

function Btn({ children, onClick, variant = 'primary', disabled, type = 'button' }) {
  const variants = {
    primary:   { background: c.primary, color: '#fff', border: 'none' },
    secondary: { background: c.surface, color: c.text, border: `1px solid ${c.border}` },
    ghost:     { background: 'transparent', color: c.muted, border: `1px solid ${c.border}` },
    danger:    { background: c.redSoft, color: c.red, border: `1px solid ${c.redBorder}` },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '8px 16px', borderRadius: 9,
        fontSize: 13, fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'opacity 0.15s',
        ...variants[variant],
      }}
    >
      {children}
    </button>
  );
}

function StatCard({ icon, label, value, accent, accentSoft }) {
  return (
    <div style={{
      flex: '1 1 120px',
      padding: '16px 18px',
      background: c.surface,
      borderRadius: 12,
      border: `1px solid ${c.border}`,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 9,
        background: accentSoft || c.primarySoft,
        color: accent || c.primary,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: c.text, lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: 12, color: c.muted, marginTop: 1 }}>{label}</div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, last }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '13px 0', gap: 16,
      borderBottom: last ? 'none' : `1px solid ${c.border}`,
    }}>
      <span style={{ fontSize: 14, color: c.muted }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 500, color: c.text, textAlign: 'right', wordBreak: 'break-all' }}>{value || '—'}</span>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────── */
export default function Perfil() {
  const { user, token, login, logout } = useAuth();
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm]         = useState({ name: '', email: '', bio: '' });
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState({ type: '', message: '' });
  const [stats, setStats]       = useState({ torneios: 0, pontos: 0, premios: 0 });

  const apiBase = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;

  useEffect(() => {
    if (user) setForm({ name: user.fullName || user.name || '', email: user.email || '', bio: user.biografia || user.bio || '' });
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${apiBase}/usuarios/${user.id}/participacoes`)
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          const p = res.data;
          setStats({
            torneios: p.length,
            pontos:   p.reduce((a, x) => a + Number(x.pontuacao || 0), 0),
            premios:  p.filter(x => x.posicao && x.posicao <= 3).length,
          });
        }
      })
      .catch(() => {});
  }, [user?.id, apiBase]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const result = validateFileUpload(f, { maxSizeMB: 5, allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] });
    if (!result.valid) {
      setToast({ type: 'error', message: result.error });
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onSave = async () => {
    if (!user) return;

    // Frontend validation before hitting the API
    const { valid, errors: errs } = runValidations({
      name:  () => validateNome(form.name),
      email: () => validateEmail(form.email),
      bio:   () => validateBio(form.bio),
    });
    if (!valid) {
      const first = Object.values(errs)[0];
      setToast({ type: 'error', message: first });
      return;
    }

    setSaving(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res  = await fetch(`${apiBase}/usuarios/${user.id}`, {
        method: 'PUT', headers,
        body: JSON.stringify({ nome: form.name, email: form.email, biografia: form.bio }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Erro ao atualizar perfil.');
      if (body.data && login) login(body.data, token);

      if (file) {
        const fd = new FormData();
        fd.append('avatar', file);
        const upRes  = await fetch(`${apiBase}/usuarios/${user.id}/avatar`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        });
        const upBody = await upRes.json();
        if (!upRes.ok) throw new Error(upBody.error || 'Falha ao enviar avatar.');
        if (upBody.data && login) login(upBody.data, token);
      }

      setToast({ type: 'success', message: 'Perfil atualizado com sucesso.' });
      setEditMode(false);
      setFile(null);
      setPreview(null);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Erro ao salvar.' });
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setFile(null);
    setPreview(null);
    if (user) setForm({ name: user.fullName || user.name || '', email: user.email || '', bio: user.biografia || user.bio || '' });
  };

  const inputStyle = {
    padding: '10px 14px', borderRadius: 9,
    border: `1px solid ${c.borderFocus}`,
    background: c.surface, color: c.text,
    fontSize: 14, outline: 'none',
    width: '100%', boxSizing: 'border-box',
  };

  /* ── Unauthenticated ── */
  if (!user) {
    return (
      <Layout>
        <div style={{ maxWidth: 420, margin: '80px auto', padding: '0 20px' }}>
          <div style={{ ...card, padding: 40, textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 13, background: c.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: c.primary }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: c.text, marginBottom: 8 }}>Acesso restrito</h2>
            <p style={{ fontSize: 14, color: c.muted, marginBottom: 24, lineHeight: 1.6 }}>Faça login para visualizar e editar seu perfil.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Btn onClick={() => navigate('/login')}>Entrar</Btn>
              <Btn variant="secondary" onClick={() => navigate('/cadastro')}>Cadastrar</Btn>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const avatarSrc = preview || user.avatar || null;
  const initials  = (user.fullName || user.name || user.username || 'U')[0]?.toUpperCase();
  const joinDate  = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : null;

  return (
    <Layout>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 72px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Identity card ── */}
        <div style={{ ...card, padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>

            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Avatar src={avatarSrc} initials={initials} size={72} />
              {editMode && (
                <label style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 24, height: 24, borderRadius: '50%',
                  background: c.primary, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', border: '2px solid #fff',
                }}>
                  <Camera size={12} />
                  <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            {/* Identity */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: 19, fontWeight: 700, color: c.text, margin: 0, lineHeight: 1.3 }}>
                {user.fullName || user.name || user.username || 'Usuário'}
              </h1>
              <p style={{ fontSize: 13, color: c.muted, margin: '3px 0 0' }}>
                @{user.username || '—'}
              </p>

              {/* Bio — view mode */}
              {!editMode && (user.biografia || user.bio) && (
                <p style={{ fontSize: 14, color: c.text, margin: '10px 0 0', lineHeight: 1.65, maxWidth: 460 }}>
                  {user.biografia || user.bio}
                </p>
              )}

              {/* Meta chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 10 }}>
                {user.email && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: c.muted }}>
                    <Mail size={13} /> {user.email}
                  </span>
                )}
                {joinDate && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: c.muted }}>
                    <Calendar size={13} /> Desde {joinDate}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', alignSelf: 'flex-start' }}>
              {!editMode ? (
                <>
                  <Btn variant="secondary" onClick={() => setEditMode(true)}>
                    <Edit2 size={13} /> Editar
                  </Btn>
                  <Btn variant="ghost" onClick={() => { logout(); navigate('/login'); }}>
                    <LogOut size={13} /> Sair
                  </Btn>
                </>
              ) : (
                <>
                  <Btn onClick={onSave} disabled={saving}>
                    <Save size={13} /> {saving ? 'Salvando…' : 'Salvar'}
                  </Btn>
                  <Btn variant="ghost" onClick={cancelEdit} disabled={saving}>
                    <X size={13} /> Cancelar
                  </Btn>
                </>
              )}
            </div>
          </div>

          {/* Edit form — inline, expands below */}
          {editMode && (
            <div style={{ marginTop: 22, paddingTop: 22, borderTop: `1px solid ${c.border}`, display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: c.muted, display: 'block', marginBottom: 6 }}>Nome completo</label>
                  <input style={inputStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Seu nome" />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: c.muted, display: 'block', marginBottom: 6 }}>E-mail</label>
                  <input style={inputStyle} type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: c.muted, display: 'block', marginBottom: 6 }}>Biografia</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                  value={form.bio}
                  onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Conte um pouco sobre você…"
                  maxLength={200}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Stats row ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <StatCard
            icon={<Trophy size={16} />}
            label="Torneios"
            value={stats.torneios}
            accent="#D97706"
            accentSoft="#FFFBEB"
          />
          <StatCard
            icon={<Star size={16} />}
            label="Pontos"
            value={stats.pontos.toLocaleString('pt-BR')}
            accent={c.primary}
            accentSoft={c.primarySoft}
          />
          <StatCard
            icon={<Award size={16} />}
            label="Pódios"
            value={stats.premios}
            accent="#10B981"
            accentSoft="#ECFDF5"
          />
        </div>

        {/* ── Account details ── */}
        <div style={{ ...card, padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: c.text, margin: 0 }}>Detalhes da conta</h2>
              <p style={{ fontSize: 13, color: c.muted, margin: '3px 0 0' }}>Informações vinculadas ao seu perfil.</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link
                to="/configuracoes"
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: c.muted, textDecoration: 'none', fontWeight: 500 }}
              >
                <Settings size={13} /> Configurações
              </Link>
              <span style={{ color: c.border }}>·</span>
              <button
                onClick={() => navigate('/painel')}
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: c.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
              >
                Dashboard <ChevronRight size={13} />
              </button>
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <InfoRow label="Nome"         value={form.name} />
            <InfoRow label="Username"     value={`@${user.username || '—'}`} />
            <InfoRow label="E-mail"       value={user.email} />
            <InfoRow label="Nível"        value={user.nivel ? `Nível ${user.nivel}` : null} />
            <InfoRow label="Último login" value={user.lastLogin ? new Date(user.lastLogin).toLocaleString('pt-BR') : null} last />
          </div>
        </div>

      </div>

      <Toast type={toast.type} message={toast.message} onClose={() => setToast({ type: '', message: '' })} />
    </Layout>
  );
}
