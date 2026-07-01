// Suporte.jsx - página de suporte em tela cheia
// Reutiliza FaqPanel, ChatPanel e useSupportChat do SupportChat.jsx (sem duplicação)
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from './Layout';
import {
  MessageSquare, Send, CheckCircle, AlertCircle, X,
  Paperclip, Mail, HelpCircle, Bug, Upload, Bot, ChevronDown
} from 'lucide-react';
import { validateSubject, validateMessage, runValidations, validateFileUpload } from '../../utils/validators';
import { FaqPanel, ChatPanel, useSupportChat } from '../../components/SupportChat';

/* Design tokens */
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

const card = {
  background: c.surface,
  borderRadius: 14,
  border: `1px solid ${c.border}`,
  boxShadow: '0 1px 3px rgba(15,17,23,0.05)',
};

/* Toast */
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

/* Section wrapper */
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

/* Channel row */
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

/* Main */
export default function Suporte() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef  = useRef(null);

  // Tab activa na página: 'faq' | 'chat' | 'contact'
  // Se veio do modal com uma tab guardada, restaurar
  const [pageTab, setPageTab] = useState(() => {
    const saved = sessionStorage.getItem('support_active_tab');
    if (saved) { sessionStorage.removeItem('support_active_tab'); return saved; }
    return 'faq';
  });

  const [toast, setToast]     = useState({ type: '', message: '' });
  const [sending, setSending] = useState(false);

  // Formulário de contacto
  const [contact, setContact] = useState({ assunto: '', mensagem: '' });

  // Formulário de bug
  const [bug, setBug]         = useState({ categoria: '', descricao: '', gravidade: 'media' });
  const [bugFiles, setBugFiles] = useState([]);
  const [activeForm, setActiveForm] = useState(null); // 'contact' | 'bug'

  // Chat IA – reutiliza o mesmo hook do componente flutuante
  const chat = useSupportChat();
  const chatInputRef = useRef(null);

  const showToast = (type, msg) => setToast({ type, message: msg });

  // Reduzir: guarda estado, navega para o painel do utilizador (onde o Layout com SupportChat está montado)
  // Usa /painel como destino padrão – o SupportChat está disponível em qualquer rota com Layout
  const handleReduce = (targetTab) => {
    const tab = targetTab || (pageTab === 'contact' ? 'faq' : pageTab);
    sessionStorage.setItem('support_reopen_modal', '1');
    sessionStorage.setItem('support_active_tab', tab);
    navigate('/painel'); // painel do estudante tem Layout com SupportChat
  };

  // Quando o utilizador clica "Perguntar ao assistente" no FAQ
  const handleFaqAsk = (question) => {
    setPageTab('chat');
    chat.setInput(question);
    setTimeout(() => chatInputRef.current?.focus(), 200);
  };

  /* Submit contacto */
  const submitContact = async (e) => {
    e.preventDefault();
    const { valid, errors: errs } = runValidations({
      assunto:  () => validateSubject(contact.assunto),
      mensagem: () => validateMessage(contact.mensagem),
    });
    if (!valid) { showToast('error', Object.values(errs)[0]); return; }
    setSending(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
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

  /* Submit bug */
  const submitBug = async (e) => {
    e.preventDefault();
    if (!bug.categoria) { showToast('error', 'Selecione uma categoria.'); return; }
    const msgResult = validateMessage(bug.descricao);
    if (!msgResult.valid) { showToast('error', msgResult.error); return; }
    setSending(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
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
      const result = validateFileUpload(f, {
        maxSizeMB: 5,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain'],
      });
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

  /* Não autenticado */
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
              <button onClick={() => navigate('/login')} style={{ padding: '9px 20px', borderRadius: 9, background: c.primary, color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Entrar
              </button>
              <button onClick={() => navigate('/cadastro')} style={{ padding: '9px 20px', borderRadius: 9, background: c.surface, color: c.text, border: `1px solid ${c.border}`, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
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
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 16px 72px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Cabeçalho */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: c.text, margin: 0 }}>Suporte</h1>
            <p style={{ fontSize: 14, color: c.muted, margin: '4px 0 0' }}>
              Encontre respostas ou converse com o nosso assistente de IA.
            </p>
          </div>
          {/* Botão Reduzir – volta ao modal flutuante */}
          <button
            onClick={handleReduce}
            title="Reduzir para modal"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 10, flexShrink: 0,
              background: c.primarySoft, color: c.primary,
              border: `1px solid #C7D2FE`, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#DDE4FD'; }}
            onMouseLeave={e => { e.currentTarget.style.background = c.primarySoft; }}
          >
            <ChevronDown className="w-4 h-4" />
            Reduzir para modal
          </button>
        </div>

        {/* Tabs principais */}
        <div style={{ display: 'flex', gap: 4, background: '#F1F3F9', borderRadius: 12, padding: 4 }}>
          {[
            { id: 'faq',     label: 'Perguntas Frequentes', icon: HelpCircle },
            { id: 'chat',    label: 'Assistente IA', icon: Bot },
            { id: 'contact', label: 'Contacto & Bugs', icon: Mail },
          ].map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setPageTab(tab.id)}
                style={{
                  flex: 1, padding: '9px 12px', borderRadius: 9, border: 'none',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: pageTab === tab.id ? c.surface : 'transparent',
                  color: pageTab === tab.id ? c.primary : c.muted,
                  boxShadow: pageTab === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <IconComponent size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab: FAQ */}
        {pageTab === 'faq' && (
          <div style={{ ...card, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${c.border}` }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: 0 }}>Perguntas Frequentes</h2>
              <p style={{ fontSize: 13, color: c.muted, margin: '3px 0 0' }}>Respostas para as dúvidas mais comuns.</p>
            </div>
            {/* Reutiliza FaqPanel do SupportChat.jsx */}
            <FaqPanel onAskAssistant={handleFaqAsk} compact={false} />
            <div style={{ padding: '12px 20px', borderTop: `1px solid ${c.border}`, textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: c.muted, margin: 0 }}>
                Não encontrou o que procura?{' '}
                <button
                  onClick={() => setPageTab('chat')}
                  style={{ color: c.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, textDecoration: 'underline' }}
                >
                  Pergunte ao assistente de IA
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Tab: Chat IA */}
        {pageTab === 'chat' && (
          <div style={{ ...card, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 520 }}>
            {/* Header do chat */}
            <div style={{
              background: 'linear-gradient(to right, #2563EB, #4F46E5)',
              padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: 0 }}>Assistente COMAES</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '2px 0 0' }}>
                  Powered by Gemini · Responde apenas sobre a plataforma
                </p>
              </div>
              {/* Botão reduzir dentro do chat também */}
              <button
                onClick={() => handleReduce('chat')}
                title="Reduzir para modal"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 8, flexShrink: 0,
                  background: 'rgba(255,255,255,0.15)', color: '#fff',
                  border: '1px solid rgba(255,255,255,0.25)', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <ChevronDown className="w-4 h-4" />
                Reduzir
              </button>
            </div>

            {/* Aviso de escopo */}
            <div style={{
              background: '#FFFBEB', borderBottom: `1px solid #FDE68A`,
              padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
            }}>
              <HelpCircle className="w-4 h-4" style={{ color: '#92400E' }} />
              <p style={{ fontSize: 12, color: '#92400E', margin: 0 }}>
                O assistente responde apenas sobre torneios, certificados, ranking, perfis e funcionalidades da COMAES.
              </p>
            </div>

            {/* Reutiliza ChatPanel do SupportChat.jsx */}
            <ChatPanel chat={chat} compact={false} inputRef={chatInputRef} />
          </div>
        )}

        {/* Tab: Contacto & Bugs - primeira parte */}
        {pageTab === 'contact' && (
          <>
            {/* Canais de atendimento */}
            <div style={{ ...card, overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', borderBottom: `1px solid ${c.border}` }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: 0 }}>Canais de atendimento</h2>
                <p style={{ fontSize: 13, color: c.muted, margin: '3px 0 0' }}>Escolha como prefere entrar em contacto.</p>
              </div>
              <div style={{ padding: '0 24px' }}>
                <ChannelRow
                  icon={<MessageSquare size={15} />}
                  label="Enviar mensagem"
                  value="Resposta em até 48 horas"
                  action={
                    <button
                      onClick={() => setActiveForm(activeForm === 'contact' ? null : 'contact')}
                      style={{ fontSize: 13, fontWeight: 600, color: c.primary, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}
                    >
                      {activeForm === 'contact' ? 'Fechar' : 'Abrir'}
                    </button>
                  }
                />

                {activeForm === 'contact' && (
                  <form onSubmit={submitContact} style={{ paddingBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: c.muted, display: 'block', marginBottom: 6 }}>Assunto</label>
                      <input style={inputStyle} value={contact.assunto} onChange={e => setContact(p => ({ ...p, assunto: e.target.value }))} placeholder="Descreva brevemente o assunto" maxLength={120} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: c.muted, display: 'block', marginBottom: 6 }}>Mensagem</label>
                      <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} value={contact.mensagem} onChange={e => setContact(p => ({ ...p, mensagem: e.target.value }))} placeholder="Descreva a sua dúvida ou solicitação em detalhes..." />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="submit" disabled={sending} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 9, background: c.primary, color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1 }}>
                        <Send size={13} /> {sending ? 'Enviando...' : 'Enviar mensagem'}
                      </button>
                      <button type="button" onClick={() => setActiveForm(null)} style={{ padding: '9px 14px', borderRadius: 9, background: 'none', color: c.muted, border: `1px solid ${c.border}`, fontSize: 13, cursor: 'pointer' }}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}

                <ChannelRow
                  icon={<Mail size={15} />}
                  label="E-mail"
                  value="suporte@comaes.pt"
                  action={<a href="mailto:suporte@comaes.pt" style={{ fontSize: 13, fontWeight: 600, color: c.primary, textDecoration: 'none' }}>Enviar</a>}
                />

                <ChannelRow
                  icon={<Bug size={15} />}
                  label="Reportar problema"
                  value="Bugs, erros ou comportamentos inesperados"
                  last={activeForm !== 'bug'}
                  action={
                    <button
                      onClick={() => setActiveForm(activeForm === 'bug' ? null : 'bug')}
                      style={{ fontSize: 13, fontWeight: 600, color: c.primary, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}
                    >
                      {activeForm === 'bug' ? 'Fechar' : 'Reportar'}
                    </button>
                  }
                />

                {activeForm === 'bug' && (
                  <form onSubmit={submitBug} style={{ paddingBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: c.muted, display: 'block', marginBottom: 6 }}>Categoria *</label>
                        <select style={{ ...inputStyle, cursor: 'pointer' }} value={bug.categoria} onChange={e => setBug(p => ({ ...p, categoria: e.target.value }))}>
                          <option value="">Selecione...</option>
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
                        <select style={{ ...inputStyle, cursor: 'pointer' }} value={bug.gravidade} onChange={e => setBug(p => ({ ...p, gravidade: e.target.value }))}>
                          <option value="baixa">Baixa</option>
                          <option value="media">Média</option>
                          <option value="alta">Alta</option>
                          <option value="critica">Crítica</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: c.muted, display: 'block', marginBottom: 6 }}>Descrição *</label>
                      <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} value={bug.descricao} onChange={e => setBug(p => ({ ...p, descricao: e.target.value }))} placeholder="Descreva o problema: o que aconteceu, o que deveria acontecer e como reproduzir..." />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: c.muted, display: 'block', marginBottom: 6 }}>Evidências <span style={{ fontWeight: 400 }}>(opcional)</span></label>
                      <button type="button" onClick={() => fileRef.current?.click()} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 9, background: c.bg, color: c.muted, border: `1px solid ${c.border}`, fontSize: 13, cursor: 'pointer' }}>
                        <Upload size={13} /> Anexar arquivo
                      </button>
                      <input ref={fileRef} type="file" multiple accept="image/*,.pdf,.txt,.log" onChange={handleFiles} style={{ display: 'none' }} />
                      {bugFiles.length > 0 && (
                        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {bugFiles.map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: c.muted }}>
                              <Paperclip size={12} />
                              <span style={{ flex: 1 }}>{f.name}</span>
                              <button type="button" onClick={() => setBugFiles(p => p.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.subtle, display: 'flex', padding: 0 }}>
                                <X size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="submit" disabled={sending} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 9, background: c.primary, color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1 }}>
                        <Send size={13} /> {sending ? 'Enviando...' : 'Enviar relatório'}
                      </button>
                      <button type="button" onClick={() => setActiveForm(null)} style={{ padding: '9px 14px', borderRadius: 9, background: 'none', color: c.muted, border: `1px solid ${c.border}`, fontSize: 13, cursor: 'pointer' }}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderRadius: 12, background: '#ECFDF5', border: '1px solid #A7F3D0', fontSize: 13, color: '#065F46' }}>
              <CheckCircle size={15} style={{ flexShrink: 0 }} />
              <span>Todos os sistemas operando normalmente. Tempo médio de resposta: 24–48 horas.</span>
            </div>
          </>
        )}
      </div>

      <Toast type={toast.type} message={toast.message} onClose={() => setToast({ type: '', message: '' })} />
    </Layout>
  );
}
