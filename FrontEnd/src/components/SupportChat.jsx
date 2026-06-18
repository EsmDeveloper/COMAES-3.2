// components/SupportChat.jsx
// Componente unificado: botÃ£o flutuante + modal compacto + modo tela cheia
// Usado tanto no Layout (flutuante) quanto na pÃ¡gina /suporte (tela cheia)
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

// â”€â”€ FAQ estÃ¡tico â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const FAQ_ITEMS = [
  {
    category: 'Torneios',
    icon: 'ðŸ†',
    questions: [
      {
        q: 'Como participar de um torneio?',
        a: 'Aceda a "Entrar no Torneio", escolha a disciplina e clique em "Inscrever-me". A participaÃ§Ã£o Ã© confirmada automaticamente.',
      },
      {
        q: 'Quais disciplinas estÃ£o disponÃ­veis?',
        a: 'MatemÃ¡tica, InglÃªs e ProgramaÃ§Ã£o. Cada torneio pode ter uma ou mais disciplinas activas.',
      },
      {
        q: 'Como criar um torneio?',
        a: 'Apenas administradores podem criar torneios. Aceda ao Painel Admin > Torneios > Novo Torneio e preencha os dados.',
      },
    ],
  },
  {
    category: 'Certificados',
    icon: 'ðŸŽ“',
    questions: [
      {
        q: 'Como obter o meu certificado?',
        a: 'Certificados sÃ£o emitidos automaticamente para os 3 primeiros colocados apÃ³s o encerramento do torneio. Aceda ao seu perfil para descarregar.',
      },
      {
        q: 'Posso validar um certificado?',
        a: 'Sim. Cada certificado tem um cÃ³digo Ãºnico. Aceda a /validador/[cÃ³digo] para verificar a autenticidade.',
      },
    ],
  },
  {
    category: 'Perfis e PermissÃµes',
    icon: 'ðŸ‘¤',
    questions: [
      {
        q: 'Qual a diferenÃ§a entre colaborador e admin?',
        a: 'Colaboradores podem criar e gerir questÃµes. Administradores tÃªm acesso total: criam torneios, gerem utilizadores e emitem certificados.',
      },
      {
        q: 'O que pode fazer um estudante?',
        a: 'Estudantes participam de torneios, respondem quizzes, visualizam o ranking e obtÃªm certificados ao terminar no pÃ³dio.',
      },
    ],
  },
  {
    category: 'Ranking',
    icon: 'ðŸ“Š',
    questions: [
      {
        q: 'Como Ã© calculado o ranking?',
        a: 'O ranking Ã© calculado pela pontuaÃ§Ã£o total obtida nas respostas. QuestÃµes difÃ­ceis valem mais pontos. Ã‰ actualizado em tempo real.',
      },
    ],
  },
];

// â”€â”€ Hook de chat reutilizÃ¡vel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function useSupportChat() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: 'OlÃ¡! Sou o assistente virtual da COMAES. Como posso ajudar?',
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
          text: 'ServiÃ§o indisponÃ­vel. Tente novamente mais tarde.',
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

// â”€â”€ Painel de FAQ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function FaqPanel({ onAskAssistant, compact = false }) {
  const [expandedFaq, setExpandedFaq] = useState(null);

  return (
    <div className={`overflow-y-auto ${compact ? 'p-3 space-y-2' : 'p-4 space-y-3'}`}>
      {FAQ_ITEMS.map((cat, ci) => (
        <div key={ci} className="rounded-xl border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 flex items-center gap-2">
            <span className={compact ? 'text-base' : 'text-lg'}>{cat.icon}</span>
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
                  <span className="text-blue-500 mt-0.5 flex-shrink-0 text-xs">
                    {isExpanded ? 'â–¼' : 'â–¶'}
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
                            className="mt-2 text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline"
                          >
                            Perguntar ao assistente â†’
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
      ))}
    </div>
  );
}

// â”€â”€ Painel de Chat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
                ðŸ¤–
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

        {/* Indicador de digitaÃ§Ã£o */}
        {loading && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs mr-2 flex-shrink-0 select-none">
              ðŸ¤–
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
            placeholder="Escreva a sua dÃºvida..."
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[10px] text-gray-400">
            Enter para enviar Â· Shift+Enter para nova linha
          </p>
          <button
            onClick={clearChat}
            className="text-[10px] text-gray-400 hover:text-red-500 transition-colors"
          >
            Limpar chat
          </button>
        </div>
      </div>
    </>
  );
}

// â”€â”€ Componente flutuante (usado no Layout) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function SupportChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('faq');
  const inputRef = useRef(null);
  const chat = useSupportChat();

  // Ao montar E a cada mudanÃ§a de rota: verificar se voltou da pÃ¡gina /suporte
  // useEffect com location.pathname garante que dispara quando navigate(-1) resolve
  useEffect(() => {
    const reopen = sessionStorage.getItem('support_reopen_modal');
    if (reopen) {
      sessionStorage.removeItem('support_reopen_modal');
      const tab = sessionStorage.getItem('support_active_tab') || 'faq';
      sessionStorage.removeItem('support_active_tab');
      setActiveTab(tab);
      // Pequeno delay para garantir que o componente estÃ¡ totalmente montado
      setTimeout(() => setIsOpen(true), 80);
    }
  });

  // Focar input ao mudar para aba chat
  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, activeTab]);

  const handleClose = () => setIsOpen(false);

  const handleFaqAsk = (question) => {
    setActiveTab('chat');
    chat.setInput(question);
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  // Expandir: guarda estado e navega para /suporte
  const handleExpand = () => {
    sessionStorage.setItem('support_active_tab', activeTab);
    // navegar via window para nÃ£o precisar do hook useNavigate aqui
    window.location.href = '/suporte';
  };

  if (!user) return null;

  return (
    <>
      {/* â”€â”€ BotÃ£o flutuante â”€â”€ */}
      <motion.button
        onClick={() => isOpen ? handleClose() : setIsOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[45] w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl flex items-center justify-center"
        aria-label={isOpen ? 'Fechar assistente' : 'Abrir assistente de suporte'}
        title="Assistente COMAES"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-xl font-bold"
            >
              âœ•
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-2xl"
            >
              ðŸ¤–
            </motion.span>
          )}
        </AnimatePresence>
        {!isOpen && (
          <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
        )}
      </motion.button>

      {/* â”€â”€ Modal compacto â”€â”€ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed right-6 z-[42] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
            style={{
              bottom: '88px',
              width: '360px',
              maxWidth: 'calc(100vw - 24px)',
              maxHeight: 'calc(100vh - 160px)',
              minHeight: '320px',
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-base flex-shrink-0 select-none">
                ðŸ¤–
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm leading-tight">Assistente COMAES</p>
                <p className="text-blue-100 text-[11px]">Online Â· Responde em segundos</p>
              </div>
              <div className="flex items-center gap-1.5">
                {/* BotÃ£o expandir â†’ abre pÃ¡gina /suporte */}
                <button
                  onClick={handleExpand}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/25 text-white/80 hover:text-white transition-all flex items-center justify-center"
                  title="Expandir para pÃ¡gina completa"
                  aria-label="Abrir suporte em tela cheia"
                >
                  {/* Ã­cone expand */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={handleClose}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/25 text-white/80 hover:text-white transition-all flex items-center justify-center text-sm font-bold"
                  aria-label="Fechar"
                >
                  âœ•
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 flex-shrink-0">
              {['faq', 'chat'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'faq' ? 'ðŸ“‹ FAQ' : 'ðŸ’¬ Chat IA'}
                </button>
              ))}
            </div>

            {activeTab === 'faq' ? (
              <div className="flex-1 overflow-y-auto">
                <FaqPanel onAskAssistant={handleFaqAsk} compact />
                <p className="text-center text-[10px] text-gray-400 py-3">
                  NÃ£o encontrou?{' '}
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
}

