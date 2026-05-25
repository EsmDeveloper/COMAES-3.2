import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from './Layout';
import LogoutModal from '../../components/LogoutModal';
import {
  User, Mail, Phone, Lock, Globe, Shield, Bell,
  Monitor, Moon, Sun, ChevronRight, Check, X,
  LogOut, Smartphone, Eye, EyeOff, AlertCircle,
  CheckCircle, Laptop, Clock,
} from 'lucide-react';
import {
  validateEmail, validatePhone, validatePassword, validatePasswordConfirm,
} from '../../utils/validators';

/* ─── Tokens ─────────────────────────────────────────────────── */
const c = {
  primary:     '#4F6EF7',
  primaryHover:'#3B5BDB',
  primarySoft: '#EEF1FE',
  surface:     '#FFFFFF',
  bg:          '#F7F8FC',
  border:      '#E8EAEF',
  borderFocus: '#A5B4FC',
  text:        '#0F1117',
  muted:       '#6B7280',
  subtle:      '#9CA3AF',
  success:     '#10B981',
  successSoft: '#ECFDF5',
  red:         '#EF4444',
  redSoft:     '#FEF2F2',
  redBorder:   '#FECACA',
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

function Toggle({ active, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!active)}
      aria-checked={active}
      role="switch"
      style={{
        width: 40, height: 22, borderRadius: 999,
        border: 'none', padding: 2, cursor: disabled ? 'default' : 'pointer',
        background: active ? c.primary : c.border,
        position: 'relative', transition: 'background 0.2s',
        flexShrink: 0, opacity: disabled ? 0.5 : 1,
      }}
    >
      <span style={{
        display: 'block', width: 18, height: 18, borderRadius: '50%',
        background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
        transform: active ? 'translateX(18px)' : 'translateX(0)',
        transition: 'transform 0.2s',
      }} />
    </button>
  );
}

/* Inline editable row — shows value + "Alterar" link; expands to input on click */
function EditableRow({ label, value, type = 'text', placeholder, onSave, hint, sensitive }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  const open_ = () => { setDraft(''); setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); };
  const close = () => { setOpen(false); setDraft(''); };

  const save = async () => {
    if (!draft.trim()) { close(); return; }
    setSaving(true);
    await onSave(draft.trim());
    setSaving(false);
    close();
  };

  const displayValue = sensitive
    ? (value ? '••••••••' : '—')
    : (value || '—');

  return (
    <div style={{ padding: '16px 0', borderBottom: `1px solid ${c.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 13, color: c.muted, margin: 0, marginBottom: 2 }}>{label}</p>
          {!open && (
            <p style={{ fontSize: 14, fontWeight: 500, color: c.text, margin: 0, wordBreak: 'break-all' }}>
              {displayValue}
            </p>
          )}
        </div>
        {!open && (
          <button onClick={open_} style={{
            fontSize: 13, fontWeight: 600, color: c.primary,
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px 8px', borderRadius: 6, flexShrink: 0,
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = c.primarySoft}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            Alterar
          </button>
        )}
      </div>

      {open && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {hint && <p style={{ fontSize: 12, color: c.muted, margin: 0 }}>{hint}</p>}
          <div style={{ position: 'relative' }}>
            <input
              ref={inputRef}
              type={sensitive && !show ? 'password' : type}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') close(); }}
              placeholder={placeholder || `Novo ${label.toLowerCase()}`}
              style={{
                width: '100%', padding: '10px 14px',
                paddingRight: sensitive ? 44 : 14,
                borderRadius: 10, border: `1px solid ${c.borderFocus}`,
                background: c.surface, color: c.text, fontSize: 14,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            {sensitive && (
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: c.muted, display: 'flex',
                }}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={save}
              disabled={saving || !draft.trim()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 8,
                background: c.primary, color: '#fff',
                border: 'none', fontSize: 13, fontWeight: 600,
                cursor: saving || !draft.trim() ? 'not-allowed' : 'pointer',
                opacity: saving || !draft.trim() ? 0.6 : 1,
              }}
            >
              <Check size={14} /> {saving ? 'Salvando…' : 'Salvar'}
            </button>
            <button
              onClick={close}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8,
                background: 'none', color: c.muted,
                border: `1px solid ${c.border}`, fontSize: 13, fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* Toggle row with label + description */
function ToggleRow({ label, description, active, onChange }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      gap: 16, padding: '14px 0', borderBottom: `1px solid ${c.border}`,
    }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: c.text, margin: 0 }}>{label}</p>
        {description && <p style={{ fontSize: 13, color: c.muted, margin: '2px 0 0', lineHeight: 1.5 }}>{description}</p>}
      </div>
      <Toggle active={active} onChange={onChange} />
    </div>
  );
}

/* Section wrapper */
function Section({ title, description, children }) {
  return (
    <div style={{
      background: c.surface, borderRadius: 14,
      border: `1px solid ${c.border}`,
      boxShadow: '0 1px 3px rgba(15,17,23,0.05)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${c.border}` }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: 0 }}>{title}</h2>
        {description && <p style={{ fontSize: 13, color: c.muted, margin: '3px 0 0' }}>{description}</p>}
      </div>
      <div style={{ padding: '0 24px' }}>
        {children}
      </div>
    </div>
  );
}

/* Pill selector */
function PillGroup({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '14px 0', borderBottom: `1px solid ${c.border}` }}>
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
              cursor: 'pointer',
              border: `1px solid ${active ? c.primary : c.border}`,
              background: active ? c.primarySoft : c.surface,
              color: active ? c.primary : c.muted,
              transition: 'all 0.15s',
            }}
          >
            {opt.icon && opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* Sidebar nav item */
function NavItem({ icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '9px 14px',
        background: active ? c.primarySoft : 'transparent',
        border: 'none', borderRadius: 8,
        color: active ? c.primary : c.muted,
        fontSize: 14, fontWeight: active ? 600 : 400,
        cursor: 'pointer', textAlign: 'left',
        transition: 'background 0.15s, color 0.15s',
      }}
    >
      <span style={{ flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge && (
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '2px 7px',
          borderRadius: 999, background: c.red, color: '#fff',
        }}>{badge}</span>
      )}
    </button>
  );
}

/* ─── Sections config ────────────────────────────────────────── */
const SECTIONS = [
  { id: 'conta',        label: 'Conta',         icon: <User size={15} /> },
  { id: 'seguranca',    label: 'Segurança',      icon: <Lock size={15} /> },
  { id: 'preferencias', label: 'Preferências',   icon: <Globe size={15} /> },
  { id: 'privacidade',  label: 'Privacidade',    icon: <Shield size={15} /> },
  { id: 'notificacoes', label: 'Notificações',   icon: <Bell size={15} /> },
];

/* ─── Main ───────────────────────────────────────────────────── */
export default function Configuracoes() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [active, setActive]   = useState('conta');
  const [toast, setToast]     = useState({ type: '', message: '' });
  const [fetching, setFetching] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  /* Settings state */
  const [conta, setConta]     = useState({ email: '', telefone: '' });
  const [seg, setSeg]         = useState({ twoFactor: false, loginAlerts: true });
  const [pref, setPref]       = useState({ tema: 'light', idioma: 'pt-BR' });
  const [priv, setPriv]       = useState({ perfilPublico: true, mostrarRanking: true, mostrarCertificados: true, mostrarAtividade: true });
  const [notif, setNotif]     = useState({ email: true, competicoes: true, certificados: true, novidades: false });

  const apiBase = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;

  const showToast = (type, message) => setToast({ type, message });
  const clearToast = () => setToast({ type: '', message: '' });

  /* Redirect */
  useEffect(() => {
    if (!user) { setTimeout(() => navigate('/login'), 1200); }
  }, [user, navigate]);

  /* Load */
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const res  = await fetch(`${apiBase}/usuarios/${user.id}/configuracao`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await res.json();
        if (res.ok && body.data) {
          const d = body.data;
          setConta({ email: user.email || d.conta?.email || '', telefone: d.conta?.telefone || '' });
          if (d.seguranca)    setSeg(s  => ({ ...s, ...d.seguranca }));
          if (d.preferencias) setPref(s => ({ ...s, ...d.preferencias }));
          if (d.privacidade)  setPriv(s => ({ ...s, ...d.privacidade }));
          if (d.notificacoes) setNotif(s => ({ ...s, ...d.notificacoes }));
        } else {
          setConta({ email: user.email || '', telefone: '' });
        }
      } catch { /* silent */ }
      finally { setFetching(false); }
    };
    load();
  }, [user, token, apiBase]);

  /* Persist helper */
  const persist = async (patch) => {
    try {
      const res = await fetch(`${apiBase}/usuarios/${user.id}/configuracao`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(patch),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Erro ao salvar.');
      showToast('success', 'Alteração salva.');
    } catch (err) {
      showToast('error', err.message || 'Erro ao salvar.');
    }
  };

  /* Field savers — validate before persisting */
  const saveEmail = async (v) => {
    const r = validateEmail(v);
    if (!r.valid) { showToast('error', r.error); return; }
    setConta(s => ({ ...s, email: v }));
    await persist({ conta: { ...conta, email: v } });
  };

  const saveTelefone = async (v) => {
    const r = validatePhone(v);
    if (!r.valid) { showToast('error', r.error); return; }
    setConta(s => ({ ...s, telefone: v }));
    await persist({ conta: { ...conta, telefone: v } });
  };

  const saveSenha = async (v) => {
    const r = validatePassword(v);
    if (!r.valid) { showToast('error', r.error); return; }
    await persist({ conta: { novaSenha: v } });
  };

  const saveToggle = (section, setter, key) => async (val) => {
    setter(s => { const next = { ...s, [key]: val }; persist({ [section]: next }); return next; });
  };

  const savePref = (key) => async (val) => {
    setPref(s => { const next = { ...s, [key]: val }; persist({ preferencias: next }); return next; });
  };

  /* ── Loading ── */
  if (fetching) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 12, color: c.muted, fontSize: 14 }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${c.border}`, borderTopColor: c.primary, animation: 'spin 0.7s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          Carregando…
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: c.muted, fontSize: 14 }}>
          Redirecionando…
        </div>
      </Layout>
    );
  }

  /* ── Panels ── */
  const panels = {

    /* ── Conta ── */
    conta: (
      <Section title="Conta" description="Gerencie seu e-mail, telefone e acesso.">
        <EditableRow
          label="E-mail"
          value={conta.email}
          type="email"
          placeholder="novo@email.com"
          hint="Você receberá um e-mail de confirmação."
          onSave={saveEmail}
        />
        <EditableRow
          label="Telefone"
          value={conta.telefone}
          type="tel"
          placeholder="+55 (11) 99999-9999"
          onSave={saveTelefone}
        />
        <div style={{ padding: '20px 0' }}>
          <button
            onClick={() => setShowLogoutModal(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '9px 16px', borderRadius: 9,
              background: c.redSoft, color: c.red,
              border: `1px solid ${c.redBorder}`,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <LogOut size={14} /> Encerrar sessão
          </button>
        </div>
      </Section>
    ),

    /* ── Segurança ── */
    seguranca: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Section title="Senha" description="Mantenha sua conta protegida com uma senha forte.">
          <EditableRow
            label="Senha"
            value="definida"
            sensitive
            placeholder="Nova senha (mín. 8 caracteres)"
            hint="Use letras, números e símbolos para maior segurança."
            onSave={saveSenha}
          />
        </Section>

        <Section title="Verificação" description="Camadas adicionais de proteção para sua conta.">
          <ToggleRow
            label="Autenticação em dois fatores"
            description="Exige um código extra ao fazer login."
            active={seg.twoFactor}
            onChange={saveToggle('seguranca', setSeg, 'twoFactor')}
          />
          <ToggleRow
            label="Alertas de login"
            description="Receba um e-mail quando um novo acesso for detectado."
            active={seg.loginAlerts}
            onChange={saveToggle('seguranca', setSeg, 'loginAlerts')}
          />
        </Section>

        <Section title="Sessões ativas" description="Dispositivos com acesso à sua conta.">
          <div style={{ padding: '14px 0', borderBottom: `1px solid ${c.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: c.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.primary, flexShrink: 0 }}>
                <Laptop size={16} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: c.text, margin: 0 }}>Este dispositivo</p>
                <p style={{ fontSize: 12, color: c.muted, margin: '2px 0 0' }}>Sessão atual</p>
              </div>
              <span style={{ fontSize: 12, color: c.success, fontWeight: 600, background: c.successSoft, padding: '3px 9px', borderRadius: 999 }}>
                Ativo
              </span>
            </div>
          </div>
          <div style={{ padding: '16px 0' }}>
            <button
              onClick={() => showToast('success', 'Todas as outras sessões foram encerradas.')}
              style={{
                fontSize: 13, fontWeight: 600, color: c.red,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              Encerrar todas as outras sessões
            </button>
          </div>
        </Section>
      </div>
    ),

    /* ── Preferências ── */
    preferencias: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Section title="Aparência" description="Personalize como a plataforma é exibida.">
          <div style={{ padding: '14px 0', borderBottom: `1px solid ${c.border}` }}>
            <p style={{ fontSize: 13, color: c.muted, margin: '0 0 10px' }}>Tema</p>
            <PillGroup
              value={pref.tema}
              onChange={savePref('tema')}
              options={[
                { value: 'light',  label: 'Claro',   icon: <Sun size={13} /> },
                { value: 'dark',   label: 'Escuro',  icon: <Moon size={13} /> },
                { value: 'system', label: 'Sistema', icon: <Monitor size={13} /> },
              ]}
            />
          </div>
          <div style={{ padding: '14px 0' }}>
            <p style={{ fontSize: 13, color: c.muted, margin: '0 0 10px' }}>Idioma</p>
            <select
              value={pref.idioma}
              onChange={e => savePref('idioma')(e.target.value)}
              style={{
                padding: '9px 14px', borderRadius: 9,
                border: `1px solid ${c.border}`, background: c.surface,
                color: c.text, fontSize: 14, outline: 'none',
                cursor: 'pointer', maxWidth: 240, width: '100%',
              }}
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es">Español</option>
            </select>
          </div>
        </Section>
      </div>
    ),

    /* ── Privacidade ── */
    privacidade: (
      <Section title="Privacidade" description="Controle o que outros usuários podem ver sobre você.">
        <ToggleRow
          label="Perfil público"
          description="Permite que outros usuários encontrem e visualizem seu perfil."
          active={priv.perfilPublico}
          onChange={saveToggle('privacidade', setPriv, 'perfilPublico')}
        />
        <ToggleRow
          label="Exibir ranking"
          description="Mostra sua posição no ranking público."
          active={priv.mostrarRanking}
          onChange={saveToggle('privacidade', setPriv, 'mostrarRanking')}
        />
        <ToggleRow
          label="Exibir certificados"
          description="Torna seus certificados visíveis no perfil."
          active={priv.mostrarCertificados}
          onChange={saveToggle('privacidade', setPriv, 'mostrarCertificados')}
        />
        <ToggleRow
          label="Exibir atividade recente"
          description="Mostra suas participações e conquistas recentes."
          active={priv.mostrarAtividade}
          onChange={saveToggle('privacidade', setPriv, 'mostrarAtividade')}
        />
      </Section>
    ),

    /* ── Notificações ── */
    notificacoes: (
      <Section title="Notificações" description="Escolha quais alertas você deseja receber.">
        <ToggleRow
          label="E-mail"
          description="Notificações gerais enviadas por e-mail."
          active={notif.email}
          onChange={saveToggle('notificacoes', setNotif, 'email')}
        />
        <ToggleRow
          label="Competições"
          description="Alertas sobre torneios, resultados e convites."
          active={notif.competicoes}
          onChange={saveToggle('notificacoes', setNotif, 'competicoes')}
        />
        <ToggleRow
          label="Certificados"
          description="Aviso quando um novo certificado estiver disponível."
          active={notif.certificados}
          onChange={saveToggle('notificacoes', setNotif, 'certificados')}
        />
        <ToggleRow
          label="Novidades do sistema"
          description="Atualizações, melhorias e comunicados da plataforma."
          active={notif.novidades}
          onChange={saveToggle('notificacoes', setNotif, 'novidades')}
        />
      </Section>
    ),
  };

  return (
    <Layout>
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={() => { setShowLogoutModal(false); logout(); navigate('/login'); }}
        onCancel={() => setShowLogoutModal(false)}
      />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Page title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: c.text, margin: 0 }}>Configurações</h1>
          <p style={{ fontSize: 14, color: c.muted, margin: '4px 0 0' }}>
            Gerencie sua conta, segurança e preferências.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

          {/* ── Sidebar ── */}
          <aside style={{
            width: 192, flexShrink: 0,
            background: c.surface, borderRadius: 14,
            border: `1px solid ${c.border}`,
            boxShadow: '0 1px 3px rgba(15,17,23,0.05)',
            padding: 8,
            position: 'sticky', top: 80,
          }} className="cfg-sidebar">
            {SECTIONS.map(s => (
              <NavItem
                key={s.id}
                icon={s.icon}
                label={s.label}
                active={active === s.id}
                onClick={() => setActive(s.id)}
              />
            ))}
          </aside>

          {/* ── Content ── */}
          <main style={{ flex: 1, minWidth: 0 }}>
            {/* Mobile section picker */}
            <div className="cfg-mobile-select" style={{ display: 'none', marginBottom: 16 }}>
              <select
                value={active}
                onChange={e => setActive(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 10,
                  border: `1px solid ${c.border}`, background: c.surface,
                  color: c.text, fontSize: 14, outline: 'none',
                }}
              >
                {SECTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            {panels[active]}
          </main>
        </div>
      </div>

      <Toast type={toast.type} message={toast.message} onClose={clearToast} />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 600px) {
          .cfg-sidebar       { display: none !important; }
          .cfg-mobile-select { display: block !important; }
        }
      `}</style>
    </Layout>
  );
}
