// components/SupportChat.jsx
// Componente unificado: botão flutuante + modal compacto + modo tela cheia
// Usado tanto no Layout (flutuante) quanto na página /suporte (tela cheia)
import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Trophy, Award, Users, BarChart3, ChevronDown, ChevronRight,
  Send, Trash2, MessageSquare, Bot, X, Maximize2
} from 'lucide-react';

//  FAQ estático 
export const FAQ_ITEMS = [
  {
    category: 'Torneios',
    icon: Trophy,
    questions: [
      {
        q: 'Como participar de um torneio?',
        a: 'Aceda a "Entrar no Torneio", escolha a disciplina e clique em "Inscrever-me". A participação é confirmada automaticamente.',
      },
      {
        q: 'Quais disciplinas estão disponíveis?',
        a: 'Matemática, Inglês e Programação. Cada torneio pode ter uma ou mais disciplinas activas.',
      },
      {
        q: 'Como criar um torneio?',
        a: 'Apenas administradores podem criar torneios. Aceda ao Painel Admin > Torneios > Novo Torneio e preencha os dados.',
      },
    ],
  },
  {
    category: 'Certificados',
    icon: Award,
    questions: [
      {
        q: 'Como obter o meu certificado?',
        a: 'Certificados são emitidos automaticamente para os 3 primeiros colocados após o encerramento do torneio. Aceda ao seu perfil para descarregar.',
      },
      {
        q: 'Posso validar um certificado?',
        a: 'Sim. Cada certificado tem um código único. Aceda a /validador/[código] para verificar a autenticidade.',
      },
    ],
  },
  {
    category: 'Perfis e Permissões',
    icon: Users,
    questions: [
      {
        q: 'Qual a diferença entre colaborador e admin?',
        a: 'Colaboradores podem criar e gerir questões. Administradores têm acesso total: criam torneios, gerem utilizadores e emitem certificados.',
      },
      {
        q: 'O que pode fazer um estudante?',
        a: 'Estudantes participam de torneios, respondem quizzes, visualizam o ranking e obtêm certificados ao terminar no pódio.',
      },
    ],
  },
  {
    category: 'Ranking',
    icon: BarChart3,
    questions: [
      {
        q: 'Como é calculado o ranking?',
        a: 'O ranking é calculado pela pontuação total obtida nas respostas. Questões difíceis valem mais pontos. É actualizado em tempo real.',
      },
    ],
  },
];

//  Hook de chat reutilizável 
export function useSupportChat() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: 'Olá! Sou o assistente virtual da COMAES. Como posso ajudar?',
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const apiBase =
    import.meta.env.VITE_API_BASE_URL ||
    `http://${window.location.hostname}:3002`;

  const buildHistory = useCallback(() => {
    return messages
      .filter((_, i) => i > 0) // skip greeting
      .slice(-6)
      .map(m => ({ role: m.role, parts: [{ text: m.text }] }));
  }, [messages]);

  const sendMessage = useCallback(async (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { role: 'user', text, ts: Date.now() }]);
    if (!textOverride) setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${apiBase}/api/support/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: text, history: buildHistory() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessages(prev => [
          ...prev,
          { role: 'model', text: data.response, ts: Date.now() },
        ]);
      } else if (res.status === 429) {
        setMessages(prev => [
          ...prev,
          {
            role: 'model',
            text: 'Muitas mensagens enviadas. Aguarde um momento antes de continuar.',
            ts: Date.now(),
            isError: true,
          },
        ]);
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: 'Serviço indisponível. Tente novamente mais tarde.',
          ts: Date.now(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, token, apiBase, buildHistory]);

  const clearChat = useCallback(() => {
    setMessages([
      { role: 'model', text: 'Chat limpo. Como posso ajudar?', ts: Date.now() },
    ]);
  }, []);

  return { messages, input, setInput, loading, sendMessage, clearChat };
}

//  Painel de FAQ 
export function FaqPanel({ onAskAssistant, compact = false }) {
  const [expandedFaq, setExpandedFaq] = useState(null);

  return (
    <div className={`overflow-y-auto ${compact ? 'p-3 space-y-2' : 'p-4 space-y-3'}`}>
      {FAQ_ITEMS.map((cat, ci) => {
        const IconComponent = cat.icon;
        return (
          <div key={ci} className="rounded-xl border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 flex items-center gap-2">
              <IconComponent className={compact ? 'w-5 h-5' : 'w-6 h-6'} />
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                {cat.category}
              </span>
            </div>
            {cat.questions.map((item, qi) => {
              const key = `${ci}-${qi}`;
              const isExpanded = expandedFaq === key;
              return (
                <div key={qi} className="border-t border-gray-50">
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : key)}
                    className="w-full text-left px-3 py-2.5 flex items-start gap-2 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-blue-500 mt-0.5 flex-shrink-0">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </span>
                    <span className={`font-medium text-gray-800 ${compact ? 'text-xs' : 'text-sm'}`}>
                      {item.q}
                    </span>
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 pt-1 bg-blue-50/40">
                          <p className={`text-gray-600 leading-relaxed ${compact ? 'text-xs' : 'text-sm'}`}>
                            {item.a}
                          </p>
                          {onAskAssistant && (
                            <button
                              onClick={() => onAskAssistant(item.q)}
                              className="mt-2 text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                            >
                              Perguntar ao assistente <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

//  Painel de Chat 
export function ChatPanel({ chat, compact = false, inputRef: externalInputRef }) {
  const { messages, input, setInput, loading, sendMessage, clearChat } = chat;
  const internalRef = useRef(null);
  const inputRef = externalInputRef || internalRef;
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5 select-none">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div
              className={`max-w-[78%] px-3 py-2 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                compact ? 'text-xs' : 'text-sm'
              } ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : msg.isError
                  ? 'bg-red-50 text-red-700 border border-red-100 rounded-bl-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Indicador de digitação */}
        {loading && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs mr-2 flex-shrink-0 select-none">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-gray-100 px-3 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 p-3 flex-shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escreva a sua dúvida..."
            rows={1}
            maxLength={500}
            disabled={loading}
            className={`flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:opacity-50 bg-gray-50 max-h-24 overflow-y-auto ${
              compact ? 'text-xs' : 'text-sm'
            }`}
            style={{ lineHeight: '1.5' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors flex-shrink-0"
            aria-label="Enviar"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[10px] text-gray-400">
            Enter para enviar · Shift+Enter para nova linha
          </p>
          <button
            onClick={clearChat}
            className="text-[10px] text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Limpar chat
          </button>
        </div>
      </div>
    </>
  );
}

//  Componente flutuante (usado no Layout) 
export default function SupportChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('faq');
  const inputRef = useRef(null);
  const chat = useSupportChat();

  const handleClose = () => setIsOpen(false);

  const handleFaqAsk = (question) => {
    setActiveTab('chat');
    chat.setInput(question);
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  const handleExpand = () => {
    sessionStorage.setItem('support_active_tab', activeTab);
    window.location.href = '/suporte';
  };

  // Verificar papel ANTES de qualquer hook condicional
  const isAdmin = user?.isAdmin === true || user?.isAdmin === 1 || user?.role === 'admin';
  const isColaborador = user?.role === 'colaborador';
  const shouldRender = user && !isAdmin && !isColaborador;

  // Criar botão nativo no body (sempre executado, mesmo se não renderizar)
  useEffect(() => {
    if (!shouldRender) return;

    // Remover botão antigo se existir
    const oldButton = document.getElementById('comaes-support-button');
    if (oldButton) oldButton.remove();

    // Criar novo botão
    const button = document.createElement('button');
    button.id = 'comaes-support-button';
    button.title = 'Assistente COMAES';
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
        <line x1="8" y1="16" x2="8" y2="16" />
        <line x1="16" y1="16" x2="16" y2="16" />
      </svg>
    `;
    
    // Estilos inline
    Object.assign(button.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      background: 'red', // TEMPORÁRIO: Fundo vermelho para debug visual
      color: 'white',
      border: '3px solid yellow', // TEMPORÁRIO: Borda amarela para debug
      cursor: 'pointer',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '2147483647',
      transition: 'transform 0.2s, box-shadow 0.2s',
      padding: '0'
    });

    // Eventos
    button.onmouseenter = () => {
      button.style.transform = 'scale(1.1)';
      button.style.boxShadow = '0 15px 30px -5px rgba(0, 0, 0, 0.4)';
    };
    button.onmouseleave = () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.3)';
    };
    button.onclick = () => setIsOpen(prev => !prev);

    // Adicionar ao body
    document.body.appendChild(button);

    console.log('🤖 Botão nativo criado no body');
    
    // Debug: verificar posição real do botão
    setTimeout(() => {
      const rect = button.getBoundingClientRect();
      const computed = window.getComputedStyle(button);
      console.log('📍 Posição do botão:', {
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
        visibility: computed.visibility,
        display: computed.display,
        zIndex: computed.zIndex,
        position: computed.position,
        isVisible: rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth
      });
      
      // Se o botão estiver fora da tela, ajustar
      if (rect.right < 0 || rect.left > window.innerWidth || rect.bottom < 0 || rect.top > window.innerHeight) {
        console.warn('⚠️ BOTÃO FORA DA VIEWPORT! Ajustando...');
        button.style.bottom = '24px';
        button.style.right = '24px';
        button.style.left = 'auto';
        button.style.top = 'auto';
      }
    }, 100);

    // Cleanup: remover ao desmontar
    return () => {
      const btn = document.getElementById('comaes-support-button');
      if (btn) btn.remove();
    };
  }, [shouldRender]);

  // Atualizar ícone do botão quando isOpen mudar
  useEffect(() => {
    if (!shouldRender) return;
    
    const button = document.getElementById('comaes-support-button');
    if (button) {
      button.innerHTML = isOpen 
        ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>`
        : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></svg>`;
    }
  }, [isOpen, shouldRender]);

  // Retornar null APÓS todos os hooks
  if (!shouldRender) {
    return null;
  }

      {/*  Modal compacto  */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            style={{
              position: 'fixed',
              right: '24px',
              bottom: '88px',
              zIndex: 2147483646,
              width: '360px',
              maxWidth: 'calc(100vw - 48px)',
              maxHeight: 'calc(100vh - 160px)',
              minHeight: '320px'
            }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          >
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
            style={{
              position: 'fixed',
              right: '24px',
              bottom: '88px',
              zIndex: 99998,
              width: '360px',
              maxWidth: 'calc(100vw - 24px)',
              maxHeight: 'calc(100vh - 160px)',
              minHeight: '320px',
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-base flex-shrink-0 select-none">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm leading-tight">Assistente COMAES</p>
                <p className="text-blue-100 text-[11px]">Online · Responde em segundos</p>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Botão expandir → abre página /suporte */}
                <button
                  onClick={handleExpand}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/25 text-white/80 hover:text-white transition-all flex items-center justify-center"
                  title="Expandir para página completa"
                  aria-label="Abrir suporte em tela cheia"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClose}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/25 text-white/80 hover:text-white transition-all flex items-center justify-center"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 flex-shrink-0">
              {[
                { key: 'faq', label: 'FAQ', icon: MessageSquare },
                { key: 'chat', label: 'Chat IA', icon: Bot }
              ].map(tab => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      activeTab === tab.key
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {activeTab === 'faq' ? (
              <div className="flex-1 overflow-y-auto">
                <FaqPanel onAskAssistant={handleFaqAsk} compact />
                <p className="text-center text-[10px] text-gray-400 py-3">
                  Não encontrou?{' '}
                  <button onClick={() => setActiveTab('chat')} className="text-blue-500 underline font-medium">
                    Pergunte ao assistente
                  </button>
                </p>
              </div>
            ) : (
              <ChatPanel chat={chat} compact inputRef={inputRef} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return ReactDOM.createPortal(content, document.body);
}
