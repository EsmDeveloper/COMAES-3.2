import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from './Layout';
import {
  MessageSquare, Send, ChevronDown, ChevronUp,
  CheckCircle, AlertCircle, X, Paperclip,
  Mail, HelpCircle, Bug, Upload,
} from 'lucide-react';
import { validateSubject, validateMessage, runValidations, validateFileUpload } from '../../utils/validators';

/* ─── Tokens (same as Configuracoes / Perfil) ────────────────── */
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
  amber:       '#D97706',
  amberSoft:   '#FFFBEB',
};

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
    const id = setTimeout(onClose, 4500);
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

function Section({ title, description, children }) {
  return (
    <div style={{ ...card, overflow: 'hidden' }}>
      <div style={{ padding: '18px 24px', borderBottom: `1px solid ${c.border}` }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: 0 }}>{title}</h2>
        {description && <p style={{ fontSize: 13, color: c.muted, margin: '3px 0 0' }}>{description}</p>}
      </div>
      <div style={{ padding: '0 24px' }}>{children}</div>
    </div>
  );
}

/* Accordion FAQ item */
function FaqItem({ question, answer, last }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: last ? 'none' : `1px solid ${c.border}` }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', gap: 12,
          padding: '15px 0', background: 'none', border: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 500, color: c.text }}>{question}</span>
        <span style={{ color: c.subtle, flexShrink: 0 }}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      {open && (
        <p style={{ fontSize: 14, color: c.muted, lineHeight: 1.7, margin: '0 0 16px', paddingRight: 24 }}>
          {answer}
        </p>
      )}
    </div>
  );
}

/* Contact channel row */
function ChannelRow({ icon, label, value, action, last }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      gap: 16, padding: '14px 0',
      borderBottom: last ? 'none' : `1px solid ${c.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: c.primarySoft, color: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, color: c.text, margin: 0 }}>{label}</p>
          {value && <p style={{ fontSize: 13, color: c.muted, margin: '2px 0 0' }}>{value}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ─── FAQ data ───────────────────────────────────────────────── */
const FAQ = [
  {
    question: 'Como funciona o sistema de ranking?',
    answer: 'O ranking é calculado com base na pontuação acumulada nos torneios. Cada torneio atribui pontos conforme a posição final. Quanto melhor sua colocação, mais pontos você recebe.',
  },
  {
    question: 'Como participar de um torneio?',
    answer: 'Acesse a seção "Entrar no Torneio" no menu principal. Escolha um torneio disponível, leia as regras e clique em participar. Você será notificado quando o torneio iniciar.',
  },
  {
    question: 'Minha pontuação não foi atualizada. O que fazer?',
    answer: 'A atualização pode levar alguns minutos após o encerramento do torneio. Se após 30 minutos ainda não tiver sido atualizada, use o formulário de contato abaixo para reportar o problema.',
  },
  {
    question: 'Como obter meu certificado?',
    answer: 'Certificados são emitidos automaticamente após a conclusão de torneios elegíveis. Acesse seu perfil e vá até a seção de certificados para visualizar e baixar.',
  },
  {
    question: 'Posso alterar meu nome de usuário?',
    answer: 'Sim. Acesse Configurações > Conta e clique em "Alterar" ao lado do campo de username. A alteração é imediata.',
  },
  {
    question: 'Como redefinir minha senha?',
    answer: 'Na tela de login, clique em "Esqueci minha senha". Você receberá um e-mail com as instruções para criar uma nova senha.',
  },
];

/* ─── Main ───────────────────────────────────────────────────── */
export default function Suporte() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef  = useRef(null);

  const [toast, setToast]       = useState({ type: '', message: '' });
  const [sending, setSending]   = useState(false);

  /* Contact form */
  const [contact, setContact] = useState({ assunto: '', mensagem: '' });

  /* Bug report form */
  const [bug, setBug]         = useState({ categoria: '', descricao: '', gravidade: 'media' });
  const [bugFiles, setBugFiles] = useState([]);
  const [activeForm, setActiveForm] = useState(null); // 'contact' | 'bug' | null

  const showToast = (type, msg) => setToast({ type, message: msg });

  /* ── Submit contact ── */
  const submitContact = async (e) => {
    e.preventDefault();
    const { valid, errors: errs } = runValidations({
      assunto:  () => validateSubject(contact.assunto),
      mensagem: () => validateMessage(contact.mensagem),
    });
    if (!valid) {
      showToast('error', Object.values(errs)[0]);
      return;
    }
    setSending(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;
      const token   = localStorage.getItem('comaes_token');
      const res = await fetch(`${apiBase}/suporte/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ assunto: contact.assunto, mensagem: contact.mensagem, tipo: 'contato' }),
      });
      if (!res.ok) throw new Error();
      showToast('success', 'Mensagem enviada. Responderemos em até 48 horas.');
      setContact({ assunto: '', mensagem: '' });
      setActiveForm(null);
    } catch {
      showToast('error', 'Não foi possível enviar. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  /* ── Submit bug ── */
  const submitBug = async (e) => {
    e.preventDefault();
    if (!bug.categoria) {
      showToast('error', 'Selecione uma categoria para o problema.');
      return;
    }
    const msgResult = validateMessage(bug.descricao);
    if (!msgResult.valid) {
      showToast('error', msgResult.error);
      return;
    }
    setSending(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;
      const token   = localStorage.getItem('comaes_token');
      const res = await fetch(`${apiBase}/suporte/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ ...bug, tipo: 'bug', anexos: bugFiles.map(f => f.name) }),
      });
      if (!res.ok) throw new Error();
      showToast('success', 'Relatório enviado. Nossa equipe irá analisar em breve.');
      setBug({ categoria: '', descricao: '', gravidade: 'media' });
      setBugFiles([]);
      setActiveForm(null);
    } catch {
      showToast('error', 'Não foi possível enviar. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  const handleFiles = (e) => {
    const newFiles = Array.from(e.target.files || []);
    const validFiles = [];
    for (const f of newFiles) {
      const result = validateFileUpload(f, { maxSizeMB: 5, allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain'] }); // Adicione mais tipos se necessário
      if (!result.valid) {
        showToast('error', `Erro no arquivo ${f.name}: ${result.error}`);
      } else {
        validFiles.push({ name: f.name, size: f.size, type: f.type });
      }
    }
    setBugFiles(prev => [...prev, ...validFiles]);
  };

  const inputStyle = {
    padding: '10px 14px', borderRadius: 9,
    border: `1px solid ${c.borderFocus}`,
    background: c.surface, color: c.text,
    fontSize: 14, outline: 'none',
    width: '100%', boxSizing: 'border-box',
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
  };

  /* ── Unauthenticated ── */
  if (!user) {
    return (
      <Layout>
        <div style={{ maxWidth: 420, margin: '80px auto', padding: '0 20px' }}>
          <div style={{ ...card, padding: 40, textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 13, background: c.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: c.primary }}>
              <HelpCircle size={22} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: c.text, marginBottom: 8 }}>Acesso restrito</h2>
            <p style={{ fontSize: 14, color: c.muted, marginBottom: 24, lineHeight: 1.6 }}>
              Faça login para acessar o suporte e enviar mensagens à equipe.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/login')}
                style={{ padding: '9px 20px', borderRadius: 9, background: c.primary, color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Entrar
              </button>
              <button
                onClick={() => navigate('/cadastro')}
                style={{ padding: '9px 20px', borderRadius: 9, background: c.surface, color: c.text, border: `1px solid ${c.border}`, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Cadastrar
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 72px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Page header ── */}
        <div style={{ marginBottom: 8 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: c.text, margin: 0 }}>Suporte</h1>
          <p style={{ fontSize: 14, color: c.muted, margin: '4px 0 0' }}>
            Encontre respostas ou entre em contato com nossa equipe.
          </p>
        </div>

        {/* ── FAQ ── */}
        <Section title="Perguntas frequentes" description="Respostas para as dúvidas mais comuns.">
          {FAQ.map((item, i) => (
            <FaqItem
              key={i}
              question={item.question}
              answer={item.answer}
              last={i === FAQ.length - 1}
            />
          ))}
        </Section>

        {/* ── Contact channels ── */}
        <Section title="Canais de atendimento" description="Escolha como prefere entrar em contato.">
          <ChannelRow
            icon={<MessageSquare size={15} />}
            label="Enviar mensagem"
            value="Resposta em até 48 horas"
            action={
              <button
                onClick={() => setActiveForm(activeForm === 'contact' ? null : 'contact')}
                style={{
                  fontSize: 13, fontWeight: 600, color: c.primary,
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '4px 8px', borderRadius: 6,
                }}
              >
                {activeForm === 'contact' ? 'Fechar' : 'Abrir'}
              </button>
            }
          />

          {/* Contact form — inline expand */}
          {activeForm === 'contact' && (
            <form onSubmit={submitContact} style={{ paddingBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: c.muted, display: 'block', marginBottom: 6 }}>Assunto</label>
                <input
                  style={inputStyle}
                  value={contact.assunto}
                  onChange={e => setContact(p => ({ ...p, assunto: e.target.value }))}
                  placeholder="Descreva brevemente o assunto"
                  maxLength={120}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: c.muted, display: 'block', marginBottom: 6 }}>Mensagem</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                  value={contact.mensagem}
                  onChange={e => setContact(p => ({ ...p, mensagem: e.target.value }))}
                  placeholder="Descreva sua dúvida ou solicitação em detalhes…"
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="submit"
                  disabled={sending}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '9px 18px', borderRadius: 9,
                    background: c.primary, color: '#fff',
                    border: 'none', fontSize: 13, fontWeight: 600,
                    cursor: sending ? 'not-allowed' : 'pointer',
                    opacity: sending ? 0.7 : 1,
                  }}
                >
                  <Send size={13} /> {sending ? 'Enviando…' : 'Enviar mensagem'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveForm(null)}
                  style={{ padding: '9px 14px', borderRadius: 9, background: 'none', color: c.muted, border: `1px solid ${c.border}`, fontSize: 13, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <ChannelRow
            icon={<Mail size={15} />}
            label="E-mail"
            value="suporte@comaes.pt"
            action={
              <a
                href="mailto:suporte@comaes.pt"
                style={{ fontSize: 13, fontWeight: 600, color: c.primary, textDecoration: 'none' }}
              >
                Enviar
              </a>
            }
          />

          <ChannelRow
            icon={<Bug size={15} />}
            label="Reportar problema"
            value="Bugs, erros ou comportamentos inesperados"
            last={activeForm !== 'bug'}
            action={
              <button
                onClick={() => setActiveForm(activeForm === 'bug' ? null : 'bug')}
                style={{
                  fontSize: 13, fontWeight: 600, color: c.primary,
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '4px 8px', borderRadius: 6,
                }}
              >
                {activeForm === 'bug' ? 'Fechar' : 'Reportar'}
              </button>
            }
          />

          {/* Bug report form — inline expand */}
          {activeForm === 'bug' && (
            <form onSubmit={submitBug} style={{ paddingBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: c.muted, display: 'block', marginBottom: 6 }}>Categoria *</label>
                  <select
                    style={selectStyle}
                    value={bug.categoria}
                    onChange={e => setBug(p => ({ ...p, categoria: e.target.value }))}
                  >
                    <option value="">Selecione…</option>
                    <option value="teste">Erro em teste</option>
                    <option value="ranking">Problema no ranking</option>
                    <option value="sistema">Bug no sistema</option>
                    <option value="performance">Performance</option>
                    <option value="conteudo">Erro no conteúdo</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: c.muted, display: 'block', marginBottom: 6 }}>Gravidade</label>
                  <select
                    style={selectStyle}
                    value={bug.gravidade}
                    onChange={e => setBug(p => ({ ...p, gravidade: e.target.value }))}
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: c.muted, display: 'block', marginBottom: 6 }}>Descrição *</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                  value={bug.descricao}
                  onChange={e => setBug(p => ({ ...p, descricao: e.target.value }))}
                  placeholder="Descreva o problema: o que aconteceu, o que deveria acontecer e como reproduzir…"
                />
              </div>

              {/* File attachment */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: c.muted, display: 'block', marginBottom: 6 }}>
                  Evidências <span style={{ fontWeight: 400 }}>(opcional)</span>
                </label>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '8px 14px', borderRadius: 9,
                    background: c.bg, color: c.muted,
                    border: `1px solid ${c.border}`, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  <Upload size={13} /> Anexar arquivo
                </button>
                <input ref={fileRef} type="file" multiple accept="image/*,.pdf,.txt,.log" onChange={handleFiles} style={{ display: 'none' }} />
                {bugFiles.length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {bugFiles.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: c.muted }}>
                        <Paperclip size={12} />
                        <span style={{ flex: 1 }}>{f.name}</span>
                        <button
                          type="button"
                          onClick={() => setBugFiles(p => p.filter((_, j) => j !== i))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.subtle, display: 'flex', padding: 0 }}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="submit"
                  disabled={sending}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '9px 18px', borderRadius: 9,
                    background: c.primary, color: '#fff',
                    border: 'none', fontSize: 13, fontWeight: 600,
                    cursor: sending ? 'not-allowed' : 'pointer',
                    opacity: sending ? 0.7 : 1,
                  }}
                >
                  <Send size={13} /> {sending ? 'Enviando…' : 'Enviar relatório'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveForm(null)}
                  style={{ padding: '9px 14px', borderRadius: 9, background: 'none', color: c.muted, border: `1px solid ${c.border}`, fontSize: 13, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </Section>

        {/* ── Status note ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 18px', borderRadius: 12,
          background: c.successSoft, border: `1px solid #A7F3D0`,
          fontSize: 13, color: '#065F46',
        }}>
          <CheckCircle size={15} style={{ flexShrink: 0 }} />
          <span>Todos os sistemas operando normalmente. Tempo médio de resposta: 24–48 horas.</span>
        </div>

      </div>

      <Toast type={toast.type} message={toast.message} onClose={() => setToast({ type: '', message: '' })} />
    </Layout>
  );
}
