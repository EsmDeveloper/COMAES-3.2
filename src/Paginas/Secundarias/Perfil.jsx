import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from './Layout';
import {
  User, Mail, Calendar, Book, Edit, Shield, CheckCircle,
  Lock, LogOut, Camera, Sparkles, Save, X, AlertCircle,
  Settings, BarChart2, Bell, ChevronRight
} from 'lucide-react';

/* ─── Design tokens ──────────────────────────────────────────── */
const t = {
  primary:     '#4F6EF7',
  primarySoft: '#EEF1FE',
  success:     '#10B981',
  successSoft: '#ECFDF5',
  red:         '#EF4444',
  redSoft:     '#FEF2F2',
  amber:       '#F59E0B',
  amberSoft:   '#FFFBEB',
  purple:      '#8B5CF6',
  purpleSoft:  '#F5F3FF',
  surface:     '#FFFFFF',
  bg:          '#F7F8FC',
  border:      '#E8EAEF',
  text:        '#0F1117',
  muted:       '#6B7280',
  subtle:      '#9CA3AF',
};

const card = {
  background: t.surface,
  borderRadius: 20,
  border: `1px solid ${t.border}`,
  boxShadow: '0 2px 12px rgba(15,17,23,0.05)',
};

/* ─── Tab config ─────────────────────────────────────────────── */
const TABS = [
  { id: 'info',     label: 'Informações',  icon: User      },
  { id: 'account',  label: 'Conta',        icon: Shield    },
  { id: 'stats',    label: 'Estatísticas', icon: BarChart2 },
  { id: 'security', label: 'Segurança',    icon: Lock      },
];

/* ─── Reusable small components ──────────────────────────────── */
function FormField({ label, type = 'text', value, onChange, multiline = false }) {
  const base = {
    width: '100%', padding: '11px 14px',
    border: `1.5px solid ${t.border}`, borderRadius: 12,
    fontSize: 14, color: t.text, background: t.surface,
    outline: 'none', transition: 'border-color 0.2s',
    boxSizing: 'border-box', fontFamily: 'inherit',
  };
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: t.muted, marginBottom: 6 }}>
        {label}
      </label>
      {multiline ? (
        <textarea value={value} onChange={onChange} rows={3}
          style={{ ...base, resize: 'vertical', lineHeight: 1.6 }}
          onFocus={e => e.target.style.borderColor = t.primary}
          onBlur={e  => e.target.style.borderColor = t.border} />
      ) : (
        <input type={type} value={value} onChange={onChange} style={base}
          onFocus={e => e.target.style.borderColor = t.primary}
          onBlur={e  => e.target.style.borderColor = t.border} />
      )}
    </div>
  );
}

function StatusAlert({ status, message }) {
  if (!status || !message) return null;
  const ok = status === 'success';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 16px', borderRadius: 12,
      background: ok ? t.successSoft : t.redSoft,
      border: `1px solid ${ok ? '#A7F3D0' : '#FECACA'}`,
      fontSize: 13, fontWeight: 600,
      color: ok ? '#065F46' : '#7F1D1D',
    }}>
      {ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      {message}
    </div>
  );
}

function DataRow({ label, value }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 0', borderBottom: `1px solid ${t.border}`,
    }}>
      <span style={{ fontSize: 13, color: t.muted }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{value}</span>
    </div>
  );
}

function StatCard({ label, value, accent, soft }) {
  return (
    <div style={{
      background: soft, borderRadius: 14, padding: '20px',
      border: `1px solid ${accent}20`, textAlign: 'center',
    }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: accent, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: t.muted }}>{label}</div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function Profile() {
  const { user, logout, token, login } = useAuth();
  const navigate = useNavigate();

  const [isRedirecting, setIsRedirecting]   = useState(false);
  const [activeTab, setActiveTab]           = useState('info');
  const [isEditing, setIsEditing]           = useState(false);
  const [editData, setEditData]             = useState({
    name:  user?.fullName  || 'Usuário COMAES',
    email: user?.email     || 'usuario@comaes.com',
    bio:   user?.biografia || '',
  });
  const [selectedFile, setSelectedFile]     = useState(null);
  const [previewUrl, setPreviewUrl]         = useState(null);
  const [isSaving, setIsSaving]             = useState(false);
  const [isUploading, setIsUploading]       = useState(false);
  const [profileStatus, setProfileStatus]   = useState(null);
  const [profileMessage, setProfileMessage] = useState('');
  const [avatarStatus, setAvatarStatus]     = useState(null);

  React.useEffect(() => {
    if (!user) {
      setIsRedirecting(true);
      const timer = setTimeout(() => navigate('/login'), 2000);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  React.useEffect(() => {
    if (!user || isEditing) return;
    setEditData(prev => ({
      ...prev,
      name:  user.fullName  || prev.name,
      email: user.email     || prev.email,
      bio:   user.biografia || prev.bio,
    }));
  }, [user, isEditing]);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setSelectedFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleToggleEdit = () => {
    setProfileStatus(null); setProfileMessage('');
    setAvatarStatus(null); setSelectedFile(null); setPreviewUrl(null);
    setIsEditing(p => !p);
  };

  const handleSave = async () => {
    if (!user) return;
    setProfileStatus(null); setProfileMessage(''); setIsSaving(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`http://localhost:3000/usuarios/${user.id}`, {
        method: 'PUT', headers,
        body: JSON.stringify({ nome: editData.name, email: editData.email, biografia: editData.bio }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Não foi possível atualizar o perfil.');
      login(body.data, token);
      setProfileStatus('success');
      setProfileMessage('Informações atualizadas com sucesso!');
      if (selectedFile) await handleUpload();
      else setTimeout(() => { setIsEditing(false); setProfileStatus(null); }, 2000);
    } catch (err) {
      setProfileStatus('error');
      setProfileMessage(err.message || 'Erro ao atualizar o perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true); setAvatarStatus(null);
    try {
      const fd = new FormData();
      fd.append('avatar', selectedFile);
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`http://localhost:3000/usuarios/${user.id}/avatar`, { method: 'POST', headers, body: fd });
      const body = await res.json();
      if (!res.ok) { setAvatarStatus('error'); }
      else {
        setAvatarStatus('success');
        login(body.data, token);
        setSelectedFile(null); setPreviewUrl(null);
        setTimeout(() => { setIsEditing(false); setAvatarStatus(null); setProfileStatus(null); }, 2000);
      }
    } catch { setAvatarStatus('error'); }
    finally { setIsUploading(false); }
  };

  const isProcessing = isSaving || isUploading;
  const avatarSrc    = previewUrl || user?.avatar || null;
  const initials     = (user?.fullName || user?.username || 'U').charAt(0).toUpperCase();

  /* ── Unauthenticated ── */
  if (!user) {
    return (
      <Layout>
        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
        <div style={{ maxWidth: 520, margin: '60px auto', padding: '0 24px' }}>
          <div style={{ ...card, padding: 32, textAlign: 'center', background: 'linear-gradient(135deg,#FEF2F2 0%,#FFF7ED 100%)', border: `1px solid #FECACA` }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#FEE2E2', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={32} color={t.red} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: t.text, marginBottom: 10 }}>Acesso Restrito ao Perfil</h2>
            <p style={{ fontSize: 15, color: t.muted, lineHeight: 1.65, marginBottom: 28 }}>
              Seu perfil COMAES está disponível apenas para usuários autenticados.
            </p>
            {isRedirecting ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${t.border}`, borderTopColor: t.primary, animation: 'spin 0.8s linear infinite' }} />
                <span style={{ color: t.primary, fontSize: 14 }}>Redirecionando…</span>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button onClick={() => navigate('/login')} style={{ padding: '12px 28px', background: t.primary, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Fazer Login</button>
                <button onClick={() => navigate('/cadastro')} style={{ padding: '12px 28px', background: 'transparent', color: t.primary, border: `1.5px solid ${t.primary}`, borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Cadastrar-se</button>
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  /* ── Tab content renderer ── */
  const renderTab = () => {
    switch (activeTab) {

      case 'info':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: t.text }}>Informações Pessoais</h3>
                <p style={{ fontSize: 13, color: t.muted, marginTop: 2 }}>Atualize os seus dados de perfil</p>
              </div>
              {!isEditing && (
                <button onClick={handleToggleEdit} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '9px 18px', background: t.primarySoft, color: t.primary,
                  border: 'none', borderRadius: 11, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>
                  <Edit size={13} /> Editar
                </button>
              )}
            </div>

            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <FormField label="Nome completo" value={editData.name}  onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} />
                <FormField label="Email" type="email" value={editData.email} onChange={e => setEditData(p => ({ ...p, email: e.target.value }))} />
                <FormField label="Biografia" value={editData.bio} multiline onChange={e => setEditData(p => ({ ...p, bio: e.target.value }))} />

                {selectedFile && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: t.primarySoft, fontSize: 13, color: t.primary, fontWeight: 500 }}>
                    <Camera size={14} /> {selectedFile.name}
                  </div>
                )}

                <StatusAlert status={profileStatus} message={profileMessage} />
                <StatusAlert status={avatarStatus}  message={avatarStatus === 'success' ? 'Imagem enviada!' : avatarStatus === 'error' ? 'Erro ao enviar imagem.' : ''} />

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={handleSave} disabled={isProcessing} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '11px 22px', background: t.primary, color: '#fff',
                    border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    opacity: isProcessing ? 0.7 : 1,
                  }}>
                    {isProcessing
                      ? <><div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} /> Salvando…</>
                      : <><Save size={14} /> Salvar alterações</>}
                  </button>
                  <button onClick={handleToggleEdit} style={{ padding: '11px 22px', background: t.bg, border: `1.5px solid ${t.border}`, borderRadius: 12, fontSize: 14, fontWeight: 600, color: t.muted, cursor: 'pointer' }}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <DataRow label="Nome completo" value={editData.name} />
                <DataRow label="Email"         value={user.email || editData.email} />
                <DataRow label="Biografia"     value={editData.bio || '—'} />
                <DataRow label="Nível"         value={`Nível ${user.level || 1}`} />
                <DataRow label="Membro desde"  value={
                  user.registrationDate
                    ? new Date(user.registrationDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
                    : '—'
                } />
              </div>
            )}
          </div>
        );

      case 'account':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: t.text }}>Dados da Conta</h3>
              <p style={{ fontSize: 13, color: t.muted, marginTop: 2 }}>Informações da sua conta COMAES</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 14 }}>
              <StatCard label="ID do Usuário"   value={user.id ? `#${user.id.toString().slice(-6)}` : '—'} accent={t.primary} soft={t.primarySoft} />
              <StatCard label="Tipo de Conta"   value={user.role === 'admin' ? 'Admin' : 'Estudante'}      accent={t.purple}  soft={t.purpleSoft} />
              <StatCard label="Pontos Totais"   value={user.points || 0}                                    accent={t.amber}   soft={t.amberSoft} />
            </div>

            <div>
              <DataRow label="Username"         value={user.username || '—'} />
              <DataRow label="Data de Cadastro" value={user.registrationDate ? new Date(user.registrationDate).toLocaleDateString('pt-BR') : '—'} />
              <DataRow label="Status"           value="✅ Conta ativa" />
              <DataRow label="Plano"            value="Gratuito" />
            </div>

            <div style={{ padding: '20px 22px', borderRadius: 16, background: t.redSoft, border: `1px solid #FECACA` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 3 }}>Terminar Sessão</h4>
                  <p style={{ fontSize: 12, color: t.muted }}>Será redirecionado para a página de login</p>
                </div>
                <button onClick={() => { logout(); navigate('/login'); }} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '10px 20px', background: t.red, color: '#fff',
                  border: 'none', borderRadius: 11, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>
                  <LogOut size={13} /> Terminar Sessão
                </button>
              </div>
            </div>
          </div>
        );

      case 'stats':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: t.text }}>Estatísticas</h3>
              <p style={{ fontSize: 13, color: t.muted, marginTop: 2 }}>O seu desempenho na plataforma</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px,1fr))', gap: 14 }}>
              <StatCard label="Torneios"  value={user.tournamentsPlayed || 0} accent={t.primary} soft={t.primarySoft} />
              <StatCard label="Vitórias"  value={user.tournamentsWon   || 0} accent={t.success} soft={t.successSoft} />
              <StatCard label="Pontos"    value={user.points           || 0} accent={t.amber}   soft={t.amberSoft} />
              <StatCard label="Prêmios"   value={user.prizesWon        || 0} accent={t.purple}  soft={t.purpleSoft} />
            </div>
            <div style={{ padding: '24px', borderRadius: 16, background: t.bg, border: `1px solid ${t.border}`, textAlign: 'center' }}>
              <BarChart2 size={32} style={{ color: t.border, margin: '0 auto 10px' }} />
              <p style={{ fontSize: 14, color: t.muted }}>Gráficos detalhados disponíveis no Dashboard</p>
              <button onClick={() => navigate('/dashboard')} style={{
                marginTop: 12, padding: '9px 20px', background: t.primarySoft,
                color: t.primary, border: 'none', borderRadius: 10,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                Ver Dashboard →
              </button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: t.text }}>Segurança</h3>
              <p style={{ fontSize: 13, color: t.muted, marginTop: 2 }}>Gerencie a segurança da sua conta</p>
            </div>
            {[
              { label: 'Alterar palavra-passe',    desc: 'Recomendamos mudar regularmente',             icon: Lock,   accent: t.primary },
              { label: 'Verificação em 2 etapas',  desc: 'Adicione uma camada extra de segurança',      icon: Shield, accent: t.success },
              { label: 'Notificações de login',    desc: 'Receba alertas de novos acessos',              icon: Bell,   accent: t.amber  },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 18px', borderRadius: 14, background: t.bg,
                  border: `1px solid ${t.border}`, cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#EDEEF5'}
                onMouseLeave={e => e.currentTarget.style.background = t.bg}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${item.accent}18`, color: item.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{item.desc}</div>
                    </div>
                  </div>
                  <ChevronRight size={16} color={t.subtle} />
                </div>
              );
            })}
          </div>
        );

      default: return null;
    }
  };

  /* ── Authenticated layout ── */
  return (
    <Layout>
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .anim { animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '268px 1fr', gap: 22, alignItems: 'start' }}>

          {/* ══ SIDEBAR ══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>

            {/* Identity card */}
            <div className="anim" style={{ ...card, padding: 0, overflow: 'hidden', animationDelay: '0ms' }}>
              {/* Cover */}
              <div style={{
                height: 76,
                background: `linear-gradient(135deg, ${t.primary} 0%, #6B8BF5 100%)`,
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ position: 'absolute', bottom: -30, left: -10, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              </div>

              <div style={{ padding: '0 20px 22px', marginTop: -36 }}>
                {/* Avatar + camera */}
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Avatar" style={{
                      width: 72, height: 72, borderRadius: '50%', objectFit: 'cover',
                      border: `3px solid ${t.surface}`,
                      boxShadow: `0 0 0 3px ${t.primary}30`,
                    }} />
                  ) : (
                    <div style={{
                      width: 72, height: 72, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${t.primary} 0%, ${t.purple} 100%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 24, fontWeight: 800,
                      border: `3px solid ${t.surface}`,
                      boxShadow: `0 0 0 3px ${t.primary}30`,
                    }}>
                      {initials}
                    </div>
                  )}
                  <label style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: 24, height: 24, borderRadius: '50%',
                    background: t.primary, color: '#fff', border: `2px solid ${t.surface}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}>
                    <Camera size={10} />
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                  </label>
                </div>

                <div style={{ fontSize: 16, fontWeight: 800, color: t.text, marginBottom: 2 }}>{editData.name}</div>
                <div style={{ fontSize: 12, color: t.muted, marginBottom: 12 }}>{user.email}</div>

                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '3px 10px', borderRadius: 999,
                  background: user.role === 'admin' ? t.amberSoft : t.primarySoft,
                  color:      user.role === 'admin' ? '#92400E'   : t.primary,
                  fontSize: 11, fontWeight: 700,
                }}>
                  {user.role === 'admin' ? '⚡ Admin' : '🎓 Estudante'}
                </span>

                {/* Mini stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
                  {[
                    { label: 'Pontos', value: user.points || 0, color: t.amber  },
                    { label: 'Nível',  value: user.level  || 1, color: t.purple },
                  ].map(s => (
                    <div key={s.label} style={{
                      background: t.bg, borderRadius: 10, padding: '10px 8px',
                      textAlign: 'center', border: `1px solid ${t.border}`,
                    }}>
                      <div style={{ fontSize: 17, fontWeight: 800, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: t.muted, marginTop: 1 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="anim" style={{ ...card, padding: '8px', animationDelay: '60ms' }}>
              {TABS.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '11px 13px', borderRadius: 12,
                    background: active ? t.primarySoft : 'transparent',
                    border: 'none', cursor: 'pointer',
                    color: active ? t.primary : t.muted,
                    marginBottom: 2, transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = t.bg; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Icon size={15} />
                      <span style={{ fontSize: 13, fontWeight: active ? 700 : 500 }}>{tab.label}</span>
                    </div>
                    {active && <ChevronRight size={13} />}
                  </button>
                );
              })}
            </div>

          </div>

          {/* ══ MAIN CONTENT ══ */}
          <div className="anim" style={{ ...card, padding: 28, animationDelay: '80ms', minHeight: 440 }}>
            {renderTab()}
          </div>

        </div>
      </div>
    </Layout>
  );
}