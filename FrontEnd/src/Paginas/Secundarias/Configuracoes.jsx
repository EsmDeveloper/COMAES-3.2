/**
 * Configuracoes.jsx
 * PÃ¡gina de configuraÃ§Ãµes pessoais â€” experiÃªncia de uso da conta.
 *
 * CONTÃ‰M:  alteraÃ§Ã£o de senha, seguranÃ§a, idioma, notificaÃ§Ãµes, privacidade
 * NÃƒO CONTÃ‰M: nome, foto, biografia, escola, telefone â†’ estÃ£o no Perfil (/perfil)
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from './Layout';
import LogoutModal from '../../components/LogoutModal';
import {
  Lock, Globe, Shield, Bell,
  Check, X, LogOut, Laptop, Eye, EyeOff,
  AlertCircle, CheckCircle, ChevronRight, User,
} from 'lucide-react';
import { validatePassword } from '../../utils/validators';

const API = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`;

/* â”€â”€â”€ SecÃ§Ãµes da sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const SECTIONS = [
  { id: 'seguranca',    label: 'SeguranÃ§a',    icon: <Lock size={15} /> },
  { id: 'preferencias', label: 'Idioma', icon: <Globe size={15} /> },
  { id: 'privacidade',  label: 'Privacidade',  icon: <Shield size={15} /> },
  { id: 'notificacoes', label: 'NotificaÃ§Ãµes', icon: <Bell size={15} /> },
];

/* â”€â”€â”€ Toast â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

/* â”€â”€â”€ Toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function Toggle({ active, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={() => onChange(!active)}
      className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500
        ${active ? 'bg-blue-600' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
        ${active ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}

/* â”€â”€â”€ ToggleRow â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function ToggleRow({ label, desc, active, onChange, last }) {
  return (
    <div className={`flex items-center justify-between gap-4 py-4 ${last ? '' : 'border-b border-gray-100'}`}>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {desc && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>}
      </div>
      <Toggle active={active} onChange={onChange} />
    </div>
  );
}

/* â”€â”€â”€ SectionCard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function SectionCard({ title, desc, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
        {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
      </div>
      <div className="px-6">{children}</div>
    </div>
  );
}

/* â”€â”€â”€ NavItem â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left
        ${active ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
    >
      <span className="flex-shrink-0">{icon}</span>
      {label}
    </button>
  );
}

/* â”€â”€â”€ AlterarSenhaForm â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function AlterarSenhaForm({ token, onSuccess, onError }) {
  const [form, setForm] = useState({ senhaAtual: '', novaSenha: '', confirmar: '' });
  const [show, setShow] = useState({ atual: false, nova: false, confirmar: false });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const toggleShow = (f) => setShow(s => ({ ...s, [f]: !s[f] }));

  const validate = () => {
    const e = {};
    if (!form.senhaAtual) e.senhaAtual = 'ObrigatÃ³rio';
    if (!form.novaSenha)  e.novaSenha  = 'ObrigatÃ³rio';
    else {
      const r = validatePassword(form.novaSenha);
      if (!r.valid) e.novaSenha = r.error;
    }
    if (!form.confirmar) e.confirmar = 'ObrigatÃ³rio';
    else if (form.novaSenha !== form.confirmar) e.confirmar = 'As senhas nÃ£o coincidem';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    try {
      const res = await fetch(`${API}/auth/alterar-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ senhaAtual: form.senhaAtual, novaSenha: form.novaSenha }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Erro ao alterar senha');
      setForm({ senhaAtual: '', novaSenha: '', confirmar: '' });
      onSuccess('Senha alterada com sucesso!');
    } catch (err) {
      onError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (field) =>
    `w-full pl-4 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition
     ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`;

  const PasswordInput = ({ field, placeholder }) => (
    <div className="relative">
      <input
        type={show[field] ? 'text' : 'password'}
        value={form[field]}
        onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
        placeholder={placeholder}
        className={inputCls(field)}
      />
      <button
        type="button"
        onClick={() => toggleShow(field)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show[field] ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
      {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="py-4 flex flex-col gap-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Senha actual</label>
        <PasswordInput field="senhaAtual" placeholder="A sua senha actual" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nova senha</label>
        <PasswordInput field="novaSenha" placeholder="MÃ­nimo 8 caracteres" />
        <p className="text-xs text-gray-400 mt-1">Deve conter maiÃºsculas, minÃºsculas, nÃºmero e sÃ­mbolo.</p>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Confirmar nova senha</label>
        <PasswordInput field="confirmar" placeholder="Repita a nova senha" />
      </div>
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          <Check size={14} /> {saving ? 'A guardarâ€¦' : 'Alterar Senha'}
        </button>
        <button
          type="button"
          onClick={() => { setForm({ senhaAtual: '', novaSenha: '', confirmar: '' }); setErrors({}); }}
          className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
        >
          Limpar
        </button>
      </div>
    </form>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN COMPONENT
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function Configuracoes() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [active, setActive]   = useState('seguranca');
  const [toast, setToast]     = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(true);
  const [showLogout, setShowLogout] = useState(false);

  const [seg,   setSeg]   = useState({ twoFactor: false, loginAlerts: true });
  const [pref,  setPref]  = useState({ idioma: 'pt-BR' });
  const [priv,  setPriv]  = useState({ perfilPublico: true, mostrarRanking: true, mostrarCertificados: true, mostrarAtividade: true });
  const [notif, setNotif] = useState({ email: true, competicoes: true, certificados: true, novidades: false });

  const showToast = (type, msg) => setToast({ type, msg });

  /* â”€â”€ Redirect if not logged in â”€â”€ */
  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);

  /* â”€â”€ Load settings â”€â”€ */
  useEffect(() => {
    if (!user) return;
    fetch(`${API}/usuarios/${user.id}/configuracao`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(body => {
        if (body.success && body.data) {
          const d = body.data;
          if (d.seguranca)    setSeg(s  => ({ ...s, ...d.seguranca }));
          if (d.idioma)       setPref(p => ({ ...p, idioma: d.idioma }));
          if (d.privacidade)  setPriv(s => ({ ...s, ...d.privacidade }));
          if (d.notificacoes) setNotif(s => ({ ...s, ...d.notificacoes }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, token]);

  /* â”€â”€ Persist helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
     O backend faz merge profundo â€” sÃ³ enviar a secÃ§Ã£o alterada.
     Estrutura: { seguranca: {...} } | { tema: '...' } | etc.
  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const persist = async (patch) => {
    try {
      const res = await fetch(`${API}/usuarios/${user.id}/configuracao`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(patch), // enviar directamente â€” backend faz merge
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Erro ao guardar');
      showToast('success', 'PreferÃªncia guardada.');
    } catch (err) {
      showToast('error', err.message || 'Erro ao guardar');
    }
  };

  const toggleSave = (section, setter, key) => (val) => {
    setter(s => {
      const next = { ...s, [key]: val };
      // Enviar apenas a secÃ§Ã£o alterada â€” backend faz merge
      persist({ [section]: { [key]: val } });
      return next;
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 gap-3 text-gray-400 text-sm">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          A carregarâ€¦
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  /* â”€â”€â”€ Panels â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const panels = {

    /* â”€â”€ SeguranÃ§a â”€â”€ */
    seguranca: (
      <div className="flex flex-col gap-4">

        {/* Aviso de separaÃ§Ã£o com Perfil */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <User size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            Para alterar nome, foto, escola ou contactos, aceda ao seu{' '}
            <Link to="/perfil" className="font-semibold underline hover:text-blue-900">Perfil</Link>.
          </p>
        </div>

        {/* Alterar senha */}
        <SectionCard title="Alterar Senha" desc="Escolha uma senha forte e exclusiva para esta conta.">
          <AlterarSenhaForm
            token={token}
            onSuccess={(msg) => showToast('success', msg)}
            onError={(msg) => showToast('error', msg)}
          />
        </SectionCard>

        {/* VerificaÃ§Ã£o */}
        <SectionCard title="VerificaÃ§Ã£o" desc="Camadas adicionais de seguranÃ§a para a sua conta.">
          <ToggleRow
            label="AutenticaÃ§Ã£o em dois fatores"
            desc="Exige um cÃ³digo adicional ao fazer login."
            active={seg.twoFactor}
            onChange={toggleSave('seguranca', setSeg, 'twoFactor')}
          />
          <ToggleRow
            label="Alertas de novo acesso"
            desc="Receba um e-mail quando for detectado um novo login."
            active={seg.loginAlerts}
            onChange={toggleSave('seguranca', setSeg, 'loginAlerts')}
            last
          />
        </SectionCard>

        {/* SessÃµes */}
        <SectionCard title="SessÃµes Ativas" desc="Dispositivos com acesso activo Ã  sua conta.">
          <div className="py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                <Laptop size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">Este dispositivo</p>
                <p className="text-xs text-gray-400 mt-0.5">SessÃ£o atual</p>
              </div>
              <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full">
                Ativo
              </span>
            </div>
          </div>
          <div className="py-4 flex items-center justify-between">
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700"
            >
              <LogOut size={14} /> Terminar sessÃ£o
            </button>
            <button
              onClick={() => showToast('success', 'Outras sessÃµes encerradas.')}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Encerrar outras sessÃµes
            </button>
          </div>
        </SectionCard>
      </div>
    ),

    /* â”€â”€ PreferÃªncias â”€â”€ */
    preferencias: (
      <div className="flex flex-col gap-4">
        <SectionCard title="Idioma" desc="Escolha o idioma de apresentaÃ§Ã£o da plataforma.">
          <div className="py-4">
            <p className="text-xs font-semibold text-gray-500 mb-3">Idioma</p>
            <select
              value={pref.idioma}
              onChange={e => { const v = e.target.value; setPref(p => ({ ...p, idioma: v })); persist({ idioma: v }); }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs w-full"
            >
              <option value="pt-PT">PortuguÃªs (Angola)</option>
              <option value="pt-BR">PortuguÃªs (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es">EspaÃ±ol</option>
            </select>
          </div>
        </SectionCard>
      </div>
    ),

    /* â”€â”€ Privacidade â”€â”€ */
    privacidade: (
      <SectionCard title="Privacidade" desc="Controle o que outros utilizadores podem ver sobre si.">
        <ToggleRow
          label="Perfil pÃºblico"
          desc="Permite que outros utilizadores encontrem e visualizem o seu perfil."
          active={priv.perfilPublico}
          onChange={toggleSave('privacidade', setPriv, 'perfilPublico')}
        />
        <ToggleRow
          label="Exibir posiÃ§Ã£o no ranking"
          desc="Mostra a sua posiÃ§Ã£o no ranking pÃºblico da plataforma."
          active={priv.mostrarRanking}
          onChange={toggleSave('privacidade', setPriv, 'mostrarRanking')}
        />
        <ToggleRow
          label="Exibir certificados"
          desc="Torna os seus certificados visÃ­veis no perfil pÃºblico."
          active={priv.mostrarCertificados}
          onChange={toggleSave('privacidade', setPriv, 'mostrarCertificados')}
        />
        <ToggleRow
          label="Exibir actividade recente"
          desc="Mostra participaÃ§Ãµes e conquistas recentes no perfil."
          active={priv.mostrarAtividade}
          onChange={toggleSave('privacidade', setPriv, 'mostrarAtividade')}
          last
        />
      </SectionCard>
    ),

    /* â”€â”€ NotificaÃ§Ãµes â”€â”€ */
    notificacoes: (
      <SectionCard title="NotificaÃ§Ãµes" desc="Escolha quais alertas deseja receber.">
        <ToggleRow
          label="NotificaÃ§Ãµes por e-mail"
          desc="Receba notificaÃ§Ãµes gerais no seu e-mail."
          active={notif.email}
          onChange={toggleSave('notificacoes', setNotif, 'email')}
        />
        <ToggleRow
          label="CompetiÃ§Ãµes e torneios"
          desc="Alertas sobre torneios, resultados e convites."
          active={notif.competicoes}
          onChange={toggleSave('notificacoes', setNotif, 'competicoes')}
        />
        <ToggleRow
          label="Certificados"
          desc="Aviso quando um novo certificado estiver disponÃ­vel."
          active={notif.certificados}
          onChange={toggleSave('notificacoes', setNotif, 'certificados')}
        />
        <ToggleRow
          label="Novidades da plataforma"
          desc="ActualizaÃ§Ãµes e comunicados da COMAES."
          active={notif.novidades}
          onChange={toggleSave('notificacoes', setNotif, 'novidades')}
          last
        />
      </SectionCard>
    ),
  };

  return (
    <Layout>
      <LogoutModal
        isOpen={showLogout}
        onConfirm={() => { setShowLogout(false); logout(); navigate('/login'); }}
        onCancel={() => setShowLogout(false)}
      />

      <div className="max-w-4xl mx-auto px-4 py-8 pb-20">

        {/* Page header */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-900">ConfiguraÃ§Ãµes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie a sua seguranÃ§a, preferÃªncias e privacidade.
          </p>
        </div>

        <div className="flex gap-6 items-start">

          {/* â”€â”€ Sidebar (desktop) â”€â”€ */}
          <aside className="hidden md:flex flex-col gap-1 w-48 flex-shrink-0 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 sticky top-20">
            {SECTIONS.map(s => (
              <NavItem key={s.id} icon={s.icon} label={s.label} active={active === s.id} onClick={() => setActive(s.id)} />
            ))}

            {/* Divider + link para Perfil */}
            <div className="border-t border-gray-100 mt-2 pt-2">
              <button
                onClick={() => navigate('/perfil')}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
              >
                <User size={14} />
                <span>Ir para Perfil</span>
                <ChevronRight size={12} className="ml-auto" />
              </button>
            </div>
          </aside>

          {/* â”€â”€ Mobile section picker â”€â”€ */}
          <div className="md:hidden w-full mb-4">
            <select
              value={active}
              onChange={e => setActive(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SECTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          {/* â”€â”€ Main panel â”€â”€ */}
          <main className="flex-1 min-w-0">
            {panels[active]}
          </main>
        </div>
      </div>

      <Toast type={toast.type} msg={toast.msg} onClose={() => setToast({ type: '', msg: '' })} />
    </Layout>
  );
}
