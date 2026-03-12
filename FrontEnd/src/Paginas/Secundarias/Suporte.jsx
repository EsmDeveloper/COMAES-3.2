import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import { 
  MessageSquare, Send, Bot, Shield, User,
  Paperclip, Settings, HelpCircle, ThumbsUp,
  AlertCircle, CheckCircle, Clock, Zap,
  ChevronDown, Upload, FileText, Video,
  Phone, Mail, Copy, Download, Brain,
  GraduationCap, Target, Award, BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Componente de Mensagem Unificado COMAES
const Message = ({ message, sender, time, attachments, isBotTyping }) => {
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('pt-PT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getSenderConfig = () => {
    const configs = {
      user: {
        bg: 'bg-blue-50 border border-blue-100',
        icon: <User className="h-4 w-4 text-blue-600" />,
        name: 'Você',
        align: 'justify-end',
        textColor: 'text-blue-800'
      },
      bot: {
        bg: 'bg-emerald-50 border border-emerald-100',
        icon: <Brain className="h-4 w-4 text-emerald-600" />,
        name: 'COMAES Assistant',
        align: 'justify-start',
        textColor: 'text-emerald-800'
      },
      admin: {
        bg: 'bg-indigo-50 border border-indigo-100',
        icon: <GraduationCap className="h-4 w-4 text-indigo-600" />,
        name: 'Tutor COMAES',
        align: 'justify-start',
        textColor: 'text-indigo-800'
      }
    };
    return configs[sender] || configs.bot;
  };

  const config = getSenderConfig();

  // Se for mensagem de "digitando..."
  if (isBotTyping && sender === 'bot') {
    return (
      <div className="flex justify-start mb-4">
        <div className="max-w-[75%]">
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
            <div className="flex items-center space-x-2 mb-1">
              {config.icon}
              <span className="text-xs font-medium text-emerald-700">{config.name}</span>
            </div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${config.align} mb-4`}>
      <div className="max-w-[75%]">
        <div className={`rounded-lg p-3 ${config.bg}`}>
          {/* Cabeçalho da mensagem */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {config.icon}
              <span className={`text-xs font-medium ${config.textColor}`}>{config.name}</span>
            </div>
            <span className="text-xs text-gray-400">{formatTime(time)}</span>
          </div>
          
          {/* Conteúdo da mensagem */}
          <div className={`${config.textColor} whitespace-pre-wrap`}>{message}</div>
          
          {/* Anexos */}
          {attachments && attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center space-x-2">
                    <Paperclip className="h-3 w-3 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <Download className="h-4 w-4 text-gray-400 hover:text-indigo-600 cursor-pointer" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente de Quick Actions COMAES
const QuickActions = ({ onAction, mode }) => {
  const actions = [
    { 
      icon: Zap, 
      label: 'Dicas de Estudo', 
      action: 'study-tips', 
      color: 'text-yellow-600',
      available: true 
    },
    { 
      icon: BookOpen, 
      label: 'Problemas no Teste', 
      action: 'test-issues', 
      color: 'text-red-600',
      available: true 
    },
    { 
      icon: Target, 
      label: 'Dúvidas de Ranking', 
      action: 'ranking-help', 
      color: 'text-blue-600',
      available: true 
    },
    { 
      icon: Award, 
      label: 'Reportar Bug', 
      action: 'report-bug', 
      color: 'text-purple-600',
      available: mode === 'admin' 
    },
    { 
      icon: Video, 
      label: 'Videoaulas', 
      action: 'video-tutorials', 
      color: 'text-green-600',
      available: true 
    },
    { 
      icon: Copy, 
      label: 'Copiar Chat', 
      action: 'copy-chat', 
      color: 'text-gray-600',
      available: true 
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {actions
        .filter(action => action.available)
        .map((action, index) => (
          <button
            key={index}
            onClick={() => onAction(action.action)}
            className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all text-sm"
          >
            <action.icon className={`h-4 w-4 ${action.color}`} />
            <span className="text-gray-700">{action.label}</span>
          </button>
      ))}
    </div>
  );
};

// Componente de Study Tips COMAES
const StudyTips = ({ onSelectTip, visible }) => {
  const tips = [
    "Como melhorar no ranking?",
    "Estratégias para testes difíceis",
    "Gerenciamento de tempo nos testes",
    "Como revisar matérias?",
    "Dicas para programação",
    "Matemática avançada - como estudar?",
    "Preparação para testes longos",
    "Como usar o sistema de ranking?"
  ];

  if (!visible) return null;

  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Brain className="h-4 w-4 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-900">Dicas de Estudo COMAES</span>
        </div>
        <button 
          onClick={() => onSelectTip(null)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {tips.map((tip, index) => (
          <button
            key={index}
            onClick={() => onSelectTip(tip)}
            className="p-3 bg-white rounded border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-left text-sm text-gray-700 transition-colors"
          >
            {tip}
          </button>
        ))}
      </div>
    </div>
  );
};

// Componente de Report Bug COMAES
const ReportBugModal = ({ isOpen, onClose, onSubmit }) => {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [severity, setSeverity] = useState('medium');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleSubmit = () => {
    if (!category || !description.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    onSubmit({
      category,
      description,
      severity,
      attachments,
      timestamp: new Date().toISOString()
    });

    // Reset form
    setCategory('');
    setDescription('');
    setAttachments([]);
    setSeverity('medium');
    onClose();
  };

  const severityOptions = [
    { value: 'low', label: 'Baixa', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Crítica', color: 'bg-red-100 text-red-800' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Reportar Problema COMAES</h3>
                <p className="text-sm text-gray-600">Ajude-nos a melhorar a plataforma</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria do Problema *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecione uma categoria</option>
                <option value="test-error">Erro em Teste</option>
                <option value="ranking-issue">Problema no Ranking</option>
                <option value="system-bug">Bug no Sistema</option>
                <option value="performance">Problema de Performance</option>
                <option value="feature-request">Sugestão de Funcionalidade</option>
                <option value="content-error">Erro no Conteúdo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gravidade *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {severityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSeverity(option.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      severity === option.value 
                        ? `${option.color} border-2 border-current` 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição Detalhada *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o problema em detalhes. Inclua:\n1. O que estava fazendo\n2. O que deveria acontecer\n3. O que aconteceu\n4. Passos para reproduzir"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evidências (opcional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Screenshots, vídeos ou arquivos de erro</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
                >
                  Selecionar Arquivos
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.txt,.log,.mp4"
                />
              </div>

              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <Paperclip className="h-3 w-3 text-gray-500" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                      </div>
                      <button
                        onClick={() => setAttachments(prev => prev.filter(f => f.id !== file.id))}
                        className="text-gray-400 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                🚀 Enviar Relatório COMAES
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Principal COMAES Support
export default function ComaesSupportChat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Estados principais
  const [mode, setMode] = useState('bot'); // 'bot' ou 'admin'
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [showStudyTips, setShowStudyTips] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Verificar se usuário está autenticado
  useEffect(() => {
    if (!user) {
      setIsRedirecting(true);
      // Redirecionar para login após 2 segundos
      const timer = setTimeout(() => {
        navigate('/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  // Base de Conhecimento COMAES
  const comaesKnowledge = {
    // Ranking e Pontuação
    "ranking": "O ranking COMAES considera:\n🎯 Pontuação nos testes (70%)\n⏱️ Tempo médio de resposta (15%)\n📈 Consistência (10%)\n🏆 Testes avançados (5%)\n\nDica: Foque em consistência, não apenas em notas altas!",
    "pontuação": "Sua pontuação é calculada por:\n✅ Acertos: 10 pontos cada\n⚡ Velocidade: Bônus por resposta rápida\n🎯 Dificuldade: Multiplicador baseado no nível\n🔥 Streak: Bônus por acertos consecutivos",
    "melhorar ranking": "Para subir no ranking:\n1. Pratique consistentemente\n2. Revise erros passados\n3. Domine os fundamentos antes do avançado\n4. Gerencie seu tempo nos testes\n5. Participe de testes de todas as áreas",
    
    // Testes e Estudo
    "teste": "Dicas para testes:\n📚 Revise antes de começar\n⏰ Configure um temporizador\n🎯 Leia cuidadosamente cada questão\n🔍 Revise suas respostas antes de submeter\n💾 Salve o progresso se possível",
    "estudar": "Método COMAES de estudo:\n1. Diagnóstico (teste inicial)\n2. Foco nas fraquezas\n3. Prática direcionada\n4. Revisão espaçada\n5. Teste de progresso\n\nUse nosso sistema de áreas para focar em tópicos específicos!",
    "dificuldade": "Os testes COMAES têm 3 níveis:\n🟢 Básico: Fundamentos (1x pontos)\n🟡 Intermediário: Aplicação (1.5x pontos)\n🔴 Avançado: Análise crítica (2x pontos)\n\nComece pelo básico e progrida gradualmente!",
    
    // Problemas Técnicos
    "erro": "Problemas técnicos comuns:\n1. Limpe cache do navegador\n2. Atualize a página (F5)\n3. Verifique conexão com internet\n4. Tente navegador diferente\n5. Desative extensões temporariamente",
    "bug": "Encontrou um bug?\nClique em 'Reportar Bug' para nos informar detalhadamente. Inclua screenshots e passos para reproduzir!",
    
    // Sistema COMAES
    "sistema": "COMAES é um Sistema de Teste de Conhecimento Online com:\n🎯 Testes por área de conhecimento\n🏆 Ranking global e por área\n📈 Acompanhamento de progresso\n🤖 Assistente inteligente de estudo\n👥 Comunidade de aprendizado",
    
    // Padrão
    "default": "🤔 Não entendi completamente. Posso ajudar com:\n• Dúvidas sobre ranking COMAES\n• Estratégias de estudo\n• Problemas técnicos\n• Como usar a plataforma\n\nPara questões específicas, mude para modo Tutor!"
  };

  // Efeito para mensagem inicial COMAES (apenas se usuário estiver logado)
  useEffect(() => {
    if (user) {
      const initialMessage = {
        id: 1,
        message: mode === 'bot' 
          ? `🧠 **Bem-vindo ao Suporte COMAES, ${user.fullName || user.username}!**\n\nSou seu Assistente COMAES, especializado em:\n🎯 Estratégias para ranking\n📚 Métodos de estudo eficientes\n⚡ Resolução de problemas técnicos\n🏆 Dicas para maximizar sua pontuação\n\nComo posso ajudá-lo hoje?`
          : `👨‍🏫 **Olá, ${user.fullName || user.username}! Sou seu Tutor COMAES**\n\nEstou aqui para:\n🔍 Analisar problemas complexos\n🎯 Oferecer suporte personalizado\n🚀 Resolver questões urgentes\n📊 Ajudar com relatórios detalhados\n\nDescreva sua dúvida ou problema:`,
        sender: mode,
        time: new Date().toISOString(),
        attachments: []
      };
      
      setMessages([initialMessage]);
    }
  }, [mode, user]);

  // Efeito para rolagem automática
  useEffect(() => {
    scrollToBottom();
  }, [messages, isBotTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Encontrar melhor resposta COMAES
  const findComaesResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const [keyword, response] of Object.entries(comaesKnowledge)) {
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }
    
    return comaesKnowledge.default;
  };

  // Enviar mensagem
  const handleSendMessage = () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    // Mensagem do usuário
    const userMessage = {
      id: messages.length + 1,
      message: newMessage,
      sender: 'user',
      time: new Date().toISOString(),
      attachments: attachments
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setAttachments([]);

    // Resposta baseada no modo
    if (mode === 'bot') {
      setIsBotTyping(true);
      
      setTimeout(() => {
        setIsBotTyping(false);
        
        const botResponse = {
          id: messages.length + 2,
          message: findComaesResponse(newMessage),
          sender: 'bot',
          time: new Date().toISOString(),
          attachments: []
        };
        
        setMessages(prev => [...prev, botResponse]);
      }, 1500);
    } else {
      // Modo admin - simular resposta humana
      setTimeout(() => {
        const adminResponse = {
          id: messages.length + 2,
          message: "✅ **Mensagem recebida pelo Tutor COMAES**\n\nEstou analisando sua solicitação e retornarei com uma resposta detalhada em breve. Enquanto isso, você pode:\n1. Continuar estudando normalmente\n2. Revisar seus testes anteriores\n3. Explorar outras áreas de conhecimento",
          sender: 'admin',
          time: new Date().toISOString(),
          attachments: []
        };
        
        setMessages(prev => [...prev, adminResponse]);
      }, 2000);
    }
  };

  // Ações rápidas COMAES
  const handleQuickAction = (action) => {
    switch(action) {
      case 'study-tips':
        setShowStudyTips(true);
        break;
        
      case 'report-bug':
        setShowReportModal(true);
        break;
        
      case 'test-issues':
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          message: "⚠️ **Problemas Comuns em Testes**\n\nSoluções rápidas:\n1. Teste não carrega → Limpe cache\n2. Respostas não salvam → Verifique conexão\n3. Timer travado → Atualize a página\n4. Questão com erro → Reporte bug específico\n\nPrecisa de mais ajuda? Descreva seu problema!",
          sender: 'bot',
          time: new Date().toISOString(),
          attachments: []
        }]);
        break;
        
      case 'ranking-help':
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          message: "🏆 **Sistema de Ranking COMAES**\n\nSeu ranking é afetado por:\n• Notas nos testes (70%)\n• Tempo de resposta (15%)\n• Consistência (10%)\n• Dificuldade (5%)\n\nDica: Pratique diariamente para manter consistência!",
          sender: 'bot',
          time: new Date().toISOString(),
          attachments: []
        }]);
        break;
        
      case 'video-tutorials':
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          message: "🎬 **Videoaulas COMAES**\n\nDisponíveis em: academy.comaes.pt/videos\n\n📹 Como usar a plataforma\n🎯 Estratégias de estudo\n🏆 Dominando o ranking\n⚡ Dicas avançadas de teste\n\nNovas aulas toda semana!",
          sender: 'bot',
          time: new Date().toISOString(),
          attachments: []
        }]);
        break;
        
      case 'copy-chat':
        const chatText = messages.map(m => 
          `${m.sender === 'user' ? '👤 Você' : m.sender === 'bot' ? '🤖 COMAES Assistant' : '👨‍🏫 Tutor COMAES'}: ${m.message}`
        ).join('\n\n');
        navigator.clipboard.writeText(chatText);
        
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          message: "📋 **Chat copiado!**\n\nToda a conversa foi salva na área de transferência.\nVocê pode colar em qualquer documento para referência futura.",
          sender: 'bot',
          time: new Date().toISOString(),
          attachments: []
        }]);
        break;
    }
  };

  // Selecionar dica de estudo
  const handleSelectTip = (tip) => {
    if (tip) {
      setNewMessage(tip);
      setShowStudyTips(false);
    } else {
      setShowStudyTips(false);
    }
  };

  // Enviar relatório de bug COMAES
  const handleSubmitReport = (reportData) => {
    const reportMessage = `🐛 **RELATÓRIO DE BUG COMAES**\n\nCategoria: ${reportData.category}\nGravidade: ${reportData.severity}\nDescrição: ${reportData.description}\nAnexos: ${reportData.attachments.length} arquivo(s)\n\nID: COMAES-BUG-${Date.now().toString().slice(-8)}`;
    
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      message: reportMessage,
      sender: 'user',
      time: new Date().toISOString(),
      attachments: reportData.attachments
    }]);

    // Resposta de confirmação
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: prev.length + 2,
        message: `✅ **Relatório COMAES Recebido!**\n\nID: COMAES-BUG-${Date.now().toString().slice(-8)}\nStatus: Em análise pela equipe técnica\nPrazo estimado: 24-48 horas\n\nAgradecemos sua contribuição para melhorar a plataforma! 🚀`,
        sender: 'admin',
        time: new Date().toISOString(),
        attachments: []
      }]);
    }, 1000);
  };

  // Upload de arquivos
  const handleFileUpload = (files) => {
    const newAttachments = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Se usuário não está autenticado, mostrar tela de login
  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-gradient-to-r from-red-100 to-orange-100">
                <Shield className="h-12 w-12 text-red-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Acesso Restrito ao Suporte COMAES
            </h2>
            
            <p className="text-gray-700 mb-6">
              O suporte COMAES está disponível apenas para usuários autenticados.
              <br />
              Faça login ou cadastre-se para acessar todo o suporte da plataforma.
            </p>
            
            {isRedirecting ? (
              <div className="mb-6">
                <div className="inline-flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-blue-600 font-medium">Redirecionando para login...</span>
                </div>
                <p className="text-gray-500 text-sm mt-2">Você será redirecionado automaticamente em instantes</p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  Fazer Login
                </button>
                <button
                  onClick={() => navigate('/cadastro')}
                  className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-all"
                >
                  Cadastrar-se
                </button>
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">Benefícios do Suporte COMAES para usuários registrados:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Assistente 24/7 com IA</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Suporte personalizado</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Acesso a tutor especializado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Usuário autenticado - mostrar chat normal
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Cabeçalho COMAES */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Suporte COMAES
                </span>
              </h1>
              <p className="text-gray-600">Olá, {user.fullName || user.username}! Como podemos ajudar?</p>
            </div>
          </div>

          {/* Seletor de Modo COMAES */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Modo:</span>
            <div className="relative">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="appearance-none px-4 py-2 pr-8 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              >
                <option value="bot">🧠 Assistente COMAES</option>
                <option value="admin">👨‍🏫 Tutor COMAES</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Status do Modo COMAES */}
        <div className={`mb-6 p-4 rounded-lg border ${
          mode === 'bot' 
            ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200' 
            : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {mode === 'bot' ? (
                <>
                  <Brain className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-emerald-800">Modo Assistente COMAES</p>
                    <p className="text-sm text-emerald-600">IA especializada em estratégias de aprendizado</p>
                  </div>
                </>
              ) : (
                <>
                  <GraduationCap className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="font-medium text-indigo-800">Modo Tutor COMAES</p>
                    <p className="text-sm text-indigo-600">Suporte humano especializado</p>
                  </div>
                </>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {mode === 'bot' ? '⚡ Respostas instantâneas' : '👨‍🏫 Resposta em até 1 hora'}
            </div>
          </div>
        </div>

        {/* Ações Rápidas COMAES */}
        <QuickActions onAction={handleQuickAction} mode={mode} />

        {/* Dicas de Estudo COMAES */}
        <StudyTips 
          onSelectTip={handleSelectTip} 
          visible={showStudyTips} 
        />

        {/* Área do Chat COMAES */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6 overflow-hidden">
          {/* Cabeçalho do Chat COMAES */}
          <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`h-2 w-2 rounded-full animate-pulse ${
                  mode === 'bot' ? 'bg-emerald-500' : 'bg-indigo-500'
                }`}></div>
                <span className="font-medium text-gray-900">
                  {mode === 'bot' ? 'Conversa com Assistente COMAES' : 'Conversa com Tutor COMAES'}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                📝 {messages.length} mensagem{messages.length !== 1 ? 'es' : ''}
              </div>
            </div>
          </div>

          {/* Mensagens */}
          <div className="h-[500px] overflow-y-auto p-4 bg-gradient-to-b from-white to-gray-50">
            {messages.map((msg) => (
              <Message 
                key={msg.id}
                message={msg.message}
                sender={msg.sender}
                time={msg.time}
                attachments={msg.attachments}
              />
            ))}
            
            {/* Indicador de digitação do bot */}
            {isBotTyping && (
              <Message 
                message=""
                sender="bot"
                time={new Date().toISOString()}
                isBotTyping={true}
              />
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area COMAES */}
          <div className="border-t border-gray-200 p-4 bg-white">
            {/* Anexos Preview */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {attachments.map((file) => (
                  <div key={file.id} className="flex items-center space-x-2 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100">
                    <Paperclip className="h-4 w-4 text-indigo-600" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <button
                      onClick={() => setAttachments(prev => prev.filter(f => f.id !== file.id))}
                      className="text-gray-400 hover:text-red-500 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end space-x-3">
              {/* Botões de Ação COMAES */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
                  title="Anexar arquivo"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleQuickAction('study-tips')}
                  className="p-2 text-gray-500 hover:text-yellow-600 transition-colors"
                  title="Dicas de estudo"
                >
                  <BookOpen className="h-5 w-5" />
                </button>
              </div>

              {/* Input de arquivo oculto */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                onChange={(e) => handleFileUpload(Array.from(e.target.files))}
                accept="image/*,.pdf,.txt,.doc,.docx,.log"
              />

              {/* Área de Texto COMAES */}
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    mode === 'bot' 
                      ? "Digite sua dúvida sobre ranking, estudo ou problemas técnicos..." 
                      : "Descreva detalhadamente sua questão para o tutor..."
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="text-xs text-gray-500 mt-1">
                  ⏎ Enter para enviar • ⇧ Shift+Enter para nova linha
                </div>
              </div>

              {/* Botão Enviar COMAES */}
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() && attachments.length === 0}
                className={`p-3 rounded-lg ${
                  newMessage.trim() || attachments.length > 0
                    ? mode === 'bot'
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                } transition-all shadow-sm hover:shadow`}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Informações de Contato COMAES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gradient-to-br from-white to-indigo-50 p-4 rounded-lg border border-indigo-100">
            <div className="flex items-center space-x-2 mb-2">
              <Phone className="h-4 w-4 text-indigo-600" />
              <span className="font-medium text-indigo-800">Suporte COMAES</span>
            </div>
            <p className="text-gray-700">+351 234 567 890</p>
            <p className="text-gray-500 text-xs mt-1">📞 Segunda a Sexta, 9h-18h</p>
          </div>
          
          <div className="bg-gradient-to-br from-white to-emerald-50 p-4 rounded-lg border border-emerald-100">
            <div className="flex items-center space-x-2 mb-2">
              <Mail className="h-4 w-4 text-emerald-600" />
              <span className="font-medium text-emerald-800">Email Acadêmico</span>
            </div>
            <p className="text-gray-700">suporte@comaes.academy</p>
            <p className="text-gray-500 text-xs mt-1">📧 Resposta em até 24h</p>
          </div>
          
          <div className="bg-gradient-to-br from-white to-purple-50 p-4 rounded-lg border border-purple-100">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-purple-800">Central COMAES</span>
            </div>
            <p className="text-gray-700">help.comaes.academy</p>
            <p className="text-gray-500 text-xs mt-1">📚 Tutoriais e FAQ completos</p>
          </div>
        </div>

        {/* Modal de Reportar Bug COMAES */}
        <ReportBugModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleSubmitReport}
        />
      </div>
    </Layout>
  );
}