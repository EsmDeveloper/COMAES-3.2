import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, Plus, Clock, AlertCircle, CheckCircle, LogOut, Menu, X, Settings, UserCircle, Layers, Trash2, ChevronDown, ChevronUp, Edit, RefreshCw, Send, Bell } from 'lucide-react';
import NotificacoesModal from '../Paginas/Secundarias/Notificacoes';
import useNotificacoesRealtime from '../hooks/useNotificacoesRealtime';
import './ColaboradorDashboard.css';

// ============================================
// COMPONENTE: Card de Estatística
// ============================================
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className={`bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border-l-4 ${color}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-600 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
      </div>
      <Icon className="w-10 h-10 text-slate-400" />
    </div>
  </div>
);

// ============================================
// COMPONENTE: Aba Padrão (Content)
// ============================================
const TabContent = ({ children }) => (
  <div className="animate-fade-in">
    {children}
  </div>
);

// ============================================
// COMPONENTE: Aba Criar Blocos
// ============================================
// ━━ Constantes (mesmo estilo do Admin) 
const DISCIPLINAS = [
  { id: 'matematica',  label: 'Matemática',  cor: 'blue'   },
  { id: 'programacao', label: 'Programação', cor: 'indigo' },
  { id: 'ingles',      label: 'Inglês',      cor: 'cyan'   },
];

const DIFICULDADES = [
  { id: 'facil',   label: 'Fácil',   cor: 'blue'  },
  { id: 'medio',   label: 'Médio',   cor: 'indigo' },
  { id: 'dificil', label: 'Difícil', cor: 'cyan'    },
];

const COR_DISCIPLINA = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-800'   },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-800' },
  cyan:   { bg: 'bg-cyan-50',   border: 'border-cyan-200',   text: 'text-cyan-700',   badge: 'bg-cyan-100 text-cyan-800'   },
};

const COR_DIFICULDADE = {
  blue:   { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-500'   },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-500' },
  cyan:   { bg: 'bg-cyan-100',   text: 'text-cyan-800',   dot: 'bg-cyan-500'   },
};

const MAX_QUESTOES_POR_BLOCO = 30;

const CriarBlocosTab = ({ token, apiBase }) => {
  const navigate = useNavigate();
  const [blocos, setBlocos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submittingBlocoId, setSubmittingBlocoId] = useState(null);
  const [expandedBlocoId, setExpandedBlocoId] = useState(null);
  const [editingBloco, setEditingBloco] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddQuestaoModal, setShowAddQuestaoModal] = useState(false);
  const [selectedBlocoForQuestoes, setSelectedBlocoForQuestoes] = useState(null);
  const [questoesDisponiveis, setQuestoesDisponiveis] = useState([]);
  const [carregandoQuestoes, setCarregandoQuestoes] = useState(false);
  const [questoesPorBloco, setQuestoesPorBloco] = useState({}); // { blocoId: [questões] }
  const [carregandoQuestoesBlocos, setCarregandoQuestoesBlocos] = useState({});
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    disciplina: '',
    dificuldade: 'facil'
  });
  const [editFormData, setEditFormData] = useState({
    titulo: '',
    descricao: '',
    disciplina: '',
    dificuldade: 'facil'
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [questaoEditando, setQuestaoEditando] = useState(null);
  const [showEditQuestao, setShowEditQuestao] = useState(false);

  const carregarBlocos = useCallback(async () => {
    console.log('[LOAD] Carregando blocos...');
    setLoading(true);
    try {
      // Debug: Decodificar token para verificar payload
      if (token) {
        const parts = token.split('.');
        if (parts.length === 3) {
          try {
            const decoded = JSON.parse(atob(parts[1]));
            console.log('[DEBUG] Token payload:', decoded);
            console.log('   - role:', decoded.role);
            console.log('   - status_colaborador:', decoded.status_colaborador);
            console.log('   - disciplina_colaborador:', decoded.disciplina_colaborador);
          } catch (e) {
            console.warn('[WARN] Não conseguiu decodificar token');
          }
        }
      }

      const response = await fetch(`${apiBase}/api/colaborador/blocos`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[ERROR] Erro ${response.status}:`, errorData.mensagem || errorData.error || 'Erro desconhecido');
        throw new Error(`Erro ${response.status}`);
      }
      
      const data = await response.json();
      const blocosList = data.dados?.blocos || [];
      
      console.log(`[SUCCESS] ${blocosList.length} blocos carregados`);
      setBlocos(blocosList);
    } catch (error) {
      console.error('[ERROR] Erro ao carregar blocos:', error);
      setBlocos([]);
      showMessage('Erro ao carregar blocos', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, apiBase]);

  useEffect(() => {
    console.log('[SUCCESS] Componente CriarBlocosTab montado');
    // Carregar blocos quando o componente é montado
    carregarBlocos();
  }, [carregarBlocos]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo || !formData.disciplina) {
      showMessage('Preencha todos os campos obrigatórios', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/colaborador/blocos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          titulo: formData.titulo,
          descricao: formData.descricao,
          disciplina: formData.disciplina,
          dificuldade: formData.dificuldade
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar bloco');
      }

      showMessage('Bloco criado com sucesso!', 'success');
      setFormData({ titulo: '', descricao: '', disciplina: '', dificuldade: 'facil' });
      // Recarregar blocos após criar com um pequeno delay
      setTimeout(() => carregarBlocos(), 500);
    } catch (error) {
      console.error('Erro:', error);
      showMessage('Erro ao criar bloco: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blocoId) => {
    if (!window.confirm('Tem certeza que deseja excluir este bloco?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/colaborador/blocos/${blocoId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao deletar');
      }

      showMessage('Bloco excluído com sucesso', 'success');
      setTimeout(() => carregarBlocos(), 500);
    } catch (error) {
      console.error('Erro:', error);
      showMessage('Erro ao excluir bloco: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (bloco) => {
    setEditingBloco(bloco);
    setEditFormData({
      titulo: bloco.titulo,
      descricao: bloco.descricao || '',
      disciplina: bloco.disciplina,
      dificuldade: bloco.dificuldade
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editFormData.titulo.trim()) {
      showMessage('O título é obrigatório', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/colaborador/blocos/${editingBloco.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          titulo: editFormData.titulo.trim(),
          descricao: editFormData.descricao.trim() || null,
          disciplina: editFormData.disciplina,
          dificuldade: editFormData.dificuldade
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar');
      }

      showMessage('Bloco atualizado com sucesso', 'success');
      setShowEditModal(false);
      setEditingBloco(null);
      setTimeout(() => carregarBlocos(), 500);
    } catch (error) {
      console.error('Erro:', error);
      showMessage('Erro ao atualizar bloco: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBloco = async (blocoId) => {
    const bloco = blocos.find(b => b.id === blocoId);
    if (!bloco) return;

    const questoesCount = bloco.total_questoes || 0;
    if (questoesCount < 5) {
      showMessage(`Este bloco precisa de pelo menos 5 questões (atualmente tem ${questoesCount})`, 'error');
      return;
    }

    if (!window.confirm('Enviar este bloco para aprovação do administrador?')) return;

    setSubmittingBlocoId(blocoId);
    try {
      const response = await fetch(`${apiBase}/api/colaborador/blocos/${blocoId}/submeter`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao enviar bloco');
      }

      showMessage('Bloco enviado para aprovação! Um administrador irá revisar em breve.', 'success');
      setTimeout(() => carregarBlocos(), 500);
    } catch (error) {
      console.error('Erro:', error);
      showMessage('Erro ao enviar bloco: ' + error.message, 'error');
    } finally {
      setSubmittingBlocoId(null);
    }
  };

  const carregarQuestoesDoBlocoExpandido = async (blocoId) => {
    console.log(`[LOAD] Carregando questões do bloco ${blocoId}...`);
    setCarregandoQuestoesBlocos(prev => ({ ...prev, [blocoId]: true }));
    
    try {
      const response = await fetch(`${apiBase}/api/questoes/bloco/${blocoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        console.warn(`⚠️ Endpoint /questoes/bloco/${blocoId} não respondeu, tentando alternativa...`);
        // Fallback: carregar todas as questões e filtrar
        const allResponse = await fetch(`${apiBase}/api/questoes/colaborador/minhas`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!allResponse.ok) {
          throw new Error('Erro ao carregar questões');
        }
        
        const data = await allResponse.json();
        const todasQuestoes = data.dados?.questoes || data.questoes || [];
        const questoesBloco = todasQuestoes.filter(q => q.bloco_id === blocoId);
        
        setQuestoesPorBloco(prev => ({
          ...prev,
          [blocoId]: questoesBloco
        }));
        console.log(`[SUCCESS] ${questoesBloco.length} questões filtradas para bloco ${blocoId}`);
        return;
      }

      const data = await response.json();
      const questoes = data.dados?.questoes || data.questoes || [];
      setQuestoesPorBloco(prev => ({
        ...prev,
        [blocoId]: questoes
      }));
      console.log(`[SUCCESS] ${questoes.length} questões carregadas para bloco ${blocoId}`);
    } catch (error) {
      console.error('Erro ao carregar questões do bloco:', error);
      setQuestoesPorBloco(prev => ({
        ...prev,
        [blocoId]: []
      }));
    } finally {
      setCarregandoQuestoesBlocos(prev => ({ ...prev, [blocoId]: false }));
    }
  };

  const handleOpenAddQuestaoModal = async (bloco) => {
    setSelectedBlocoForQuestoes(bloco);
    setCarregandoQuestoes(true);
    setShowAddQuestaoModal(true);
    
    try {
      const response = await fetch(`${apiBase}/api/questoes/colaborador/minhas`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar questões');
      }

      const data = await response.json();
      const questoes = data.dados?.questoes || data.questoes || [];
      setQuestoesDisponiveis(questoes);
      console.log(`[SUCCESS] ${questoes.length} questões carregadas`);
    } catch (error) {
      console.error('Erro ao carregar questões:', error);
      showMessage('Erro ao carregar questões: ' + error.message, 'error');
      setQuestoesDisponiveis([]);
    } finally {
      setCarregandoQuestoes(false);
    }
  };

  const handleAdicionarQuestaoAoBloco = async (questaoId) => {
    if (!selectedBlocoForQuestoes) return;

    setCarregandoQuestoes(true);
    try {
      const url = `${apiBase}/api/colaborador/blocos/${selectedBlocoForQuestoes.id}/questoes/${questaoId}`;
      console.log(`[INFO] Enviando para: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log(`[DEBUG] Status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`[ERROR] Erro da API:`, errorData);
        throw new Error(errorData.message || errorData.erros?.detalhes || 'Erro ao adicionar questão');
      }

      const data = await response.json();
      console.log(`[SUCCESS] Resposta:`, data);

      showMessage('Questão adicionada ao bloco com sucesso!', 'success');
      
      // Remover questão da lista de disponíveis
      setQuestoesDisponiveis(prev => prev.filter(q => q.id !== questaoId));
      
      // Recarregar blocos
      setTimeout(() => carregarBlocos(), 500);
    } catch (error) {
      console.error('Erro:', error);
      showMessage('Erro ao adicionar questão: ' + error.message, 'error');
    } finally {
      setCarregandoQuestoes(false);
    }
  };

  return (
    <TabContent>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Criar Novo Bloco
            </h3>

            {message.text && (
              <div className={`p-3 rounded-lg mb-4 text-sm ${
                message.type === 'error' 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Algebra Básica"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição do bloco..."
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Disciplina *
                </label>
                <select
                  value={formData.disciplina}
                  onChange={(e) => setFormData({ ...formData, disciplina: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={loading}
                >
                  <option value="">Selecione uma disciplina</option>
                  {DISCIPLINAS.map(d => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Dificuldade
                </label>
                <select
                  value={formData.dificuldade}
                  onChange={(e) => setFormData({ ...formData, dificuldade: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={loading}
                >
                  {DIFICULDADES.map(d => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Criando...' : 'Criar Bloco'}
              </button>
            </form>
          </div>
        </div>

        {/* Lista de Blocos - Estilo Admin */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Meus Blocos</h3>
                <p className="text-xs text-slate-500 mt-0.5">Crie e organize seus blocos de questões</p>
              </div>
              <button
                onClick={() => carregarBlocos()}
                disabled={loading}
                className="px-3 py-1.5 text-sm bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                {loading ? 'Recarregando...' : 'Recarregar'}
              </button>
            </div>

            {loading && blocos.length === 0 ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
                <p className="text-slate-500">Carregando blocos...</p>
              </div>
            ) : blocos.length === 0 ? (
              <div className="text-center py-12">
                <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Nenhum bloco criado ainda</p>
                <p className="text-slate-400 text-sm">Crie seu primeiro bloco usando o formulário ao lado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {blocos.map(bloco => {
                  const disc = DISCIPLINAS.find(d => d.id === bloco.disciplina);
                  const dif = DIFICULDADES.find(d => d.id === bloco.dificuldade);
                  const corDisc = COR_DISCIPLINA[disc?.cor || 'blue'];
                  const corDif = COR_DIFICULDADE[dif?.cor || 'green'];

                  return (
                    <div 
                      key={bloco.id} 
                      className={`rounded-2xl border-2 ${corDisc.border} ${corDisc.bg} overflow-hidden transition-all duration-200 hover:shadow-md`}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {/* Badges */}
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${corDisc.badge}`}>
                                {disc?.label}
                              </span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${corDif.bg} ${corDif.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${corDif.dot}`} />
                                {dif?.label}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                bloco.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                                bloco.status === 'aprovado' ? 'bg-green-100 text-green-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {bloco.status === 'pendente' ? '⏳ Pendente' :
                                 bloco.status === 'aprovado' ? '[SUCCESS] Aprovado' :
                                 '[ERROR] Rejeitado'}
                              </span>
                            </div>

                            {/* Título */}
                            <h3 className="font-bold text-slate-800 truncate mb-1">{bloco.titulo}</h3>

                            {/* Descrição */}
                            {bloco.descricao && (
                              <p className="text-xs text-slate-500 mb-2 line-clamp-1">{bloco.descricao}</p>
                            )}

                            {/* Questões */}
                            <p className="text-xs text-slate-500">
                              <span className="font-semibold text-slate-700">{bloco.total_questoes || 0}</span>
                              /{MAX_QUESTOES_POR_BLOCO} questões
                            </p>
                          </div>

                          {/* Botões de ação */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleEditClick(bloco)}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-white transition-colors"
                              title="Editar bloco"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const isExpanding = expandedBlocoId !== bloco.id;
                                setExpandedBlocoId(isExpanding ? bloco.id : null);
                                // Carregar questões se estiver expandindo e ainda não foram carregadas
                                if (isExpanding && !questoesPorBloco[bloco.id]) {
                                  carregarQuestoesDoBlocoExpandido(bloco.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-white transition-colors"
                              title={expandedBlocoId === bloco.id ? 'Recolher' : 'Expandir'}
                            >
                              {expandedBlocoId === bloco.id ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleSubmitBloco(bloco.id)}
                              disabled={loading || submittingBlocoId === bloco.id || (bloco.total_questoes || 0) < 5}
                              className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title={(bloco.total_questoes || 0) < 5 ? `Mínimo 5 questões (tem ${bloco.total_questoes || 0})` : 'Enviar para aprovação'}
                            >
                              {submittingBlocoId === bloco.id ? (
                                <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-500 rounded-full animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(bloco.id)}
                              disabled={loading}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50"
                              title="Excluir bloco"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Barra de progresso */}
                        <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300 bg-blue-400"
                            style={{ width: `${Math.min((bloco.total_questoes || 0) / MAX_QUESTOES_POR_BLOCO * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Painel expandido */}
                      {expandedBlocoId === bloco.id && (
                        <div className="border-t border-white/50 bg-white/80">
                          {/* Listando questões */}
                          {carregandoQuestoesBlocos[bloco.id] ? (
                            <div className="px-4 py-6 text-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2" />
                              <p className="text-sm text-slate-500">Carregando questões...</p>
                            </div>
                          ) : questoesPorBloco[bloco.id] && questoesPorBloco[bloco.id].length > 0 ? (
                            <div className="px-4 py-4 space-y-2">
                              {questoesPorBloco[bloco.id].map((questao, idx) => (
                                <div key={questao.id} className="flex items-start gap-2 p-2 bg-white rounded-lg border border-slate-100 hover:shadow-md transition-shadow">
                                  <span className="text-xs font-bold text-slate-400 min-w-fit">{idx + 1}.</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-slate-700 line-clamp-2">{questao.titulo}</p>
                                    <p className="text-xs text-slate-500 line-clamp-1">{questao.descricao}</p>
                                  </div>
                                  {/* [SUCCESS] NOVO: Botões de Editar e Remover */}
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                      onClick={() => {
                                        setQuestaoEditando(questao);
                                        setShowEditQuestao(true);
                                      }}
                                      className="p-1 rounded text-blue-400 hover:bg-blue-50 transition-colors"
                                      title="Editar questão"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={async () => {
                                        // Remover questão do bloco - chamar API
                                        try {
                                          const response = await fetch(`${apiBase}/api/colaborador/blocos/${bloco.id}/questoes/${questao.id}`, {
                                            method: 'DELETE',
                                            headers: { Authorization: `Bearer ${token}` }
                                          });

                                          if (!response.ok) {
                                            const errorData = await response.json();
                                            throw new Error(errorData.message || 'Erro ao remover questão');
                                          }

                                          // Remover da lista local
                                          setQuestoesPorBloco(prev => ({
                                            ...prev,
                                            [bloco.id]: prev[bloco.id].filter(q => q.id !== questao.id)
                                          }));
                                          
                                          // Recarregar blocos para atualizar contadores
                                          setTimeout(() => carregarBlocos(), 300);
                                          showMessage('Questão removida do bloco com sucesso', 'success');
                                        } catch (error) {
                                          console.error('Erro:', error);
                                          showMessage('Erro ao remover questão: ' + error.message, 'error');
                                        }
                                      }}
                                      className="p-1 rounded text-red-400 hover:bg-red-50 transition-colors"
                                      title="Remover do bloco"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="px-4 py-6 text-center">
                              <p className="text-sm text-slate-400">Nenhuma questão neste bloco.</p>
                              <p className="text-xs text-slate-400 mt-2">Adicione pelo menos 5 questões para enviar para aprovação</p>
                            </div>
                          )}

                          {/* Botão adicionar questão */}
                          <div className="px-4 py-3 border-t border-slate-100">
                            <button
                              onClick={() => handleOpenAddQuestaoModal(bloco)}
                              disabled={loading || carregandoQuestoes}
                              className="w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50"
                            >
                              <Plus className="w-4 h-4" />
                              Adicionar Questão
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Edição de Bloco */}
      {showEditModal && editingBloco && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-800">Editar Bloco</h2>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Título do bloco *</label>
                <input
                  type="text"
                  value={editFormData.titulo}
                  onChange={e => setEditFormData({ ...editFormData, titulo: e.target.value })}
                  placeholder="Ex: Álgebra Avançada"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Descrição</label>
                <textarea
                  value={editFormData.descricao}
                  onChange={e => setEditFormData({ ...editFormData, descricao: e.target.value })}
                  rows={2}
                  placeholder="Descrição opcional do bloco..."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Disciplina *</label>
                  <select
                    value={editFormData.disciplina}
                    onChange={e => setEditFormData({ ...editFormData, disciplina: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DISCIPLINAS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Dificuldade *</label>
                  <select
                    value={editFormData.dificuldade}
                    onChange={e => setEditFormData({ ...editFormData, dificuldade: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DIFICULDADES.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={loading}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={loading}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Seleção de Questões */}
      {showAddQuestaoModal && selectedBlocoForQuestoes && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Adicionar Questões ao Bloco</h2>
                <p className="text-xs text-slate-500 mt-1">{selectedBlocoForQuestoes.titulo}</p>
              </div>
              <button 
                onClick={() => setShowAddQuestaoModal(false)} 
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {carregandoQuestoes ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
                  <p className="text-slate-500">Carregando questões...</p>
                </div>
              ) : questoesDisponiveis.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500">Nenhuma questão disponível</p>
                  <p className="text-slate-400 text-sm mt-2">Crie questões primeiro para adicioná-las ao bloco</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {questoesDisponiveis.map((questao, index) => (
                    <div 
                      key={questao.id} 
                      className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-400">{index + 1}.</span>
                          <p className="text-sm font-medium text-slate-800 truncate">{questao.titulo || questao.enunciado}</p>
                          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 whitespace-nowrap">
                            {questao.dificuldade?.charAt(0).toUpperCase() + questao.dificuldade?.slice(1)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{questao.enunciado || questao.descricao}</p>
                      </div>
                      <button
                        onClick={() => handleAdicionarQuestaoAoBloco(questao.id)}
                        disabled={carregandoQuestoes}
                        className="ml-3 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 flex-shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setShowAddQuestaoModal(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Questão */}
      {showEditQuestao && questaoEditando && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Editar Questão</h2>
                <p className="text-xs text-slate-500 mt-1">Modifique os detalhes da questão</p>
              </div>
              <button 
                onClick={() => {
                  setShowEditQuestao(false);
                  setQuestaoEditando(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Título</label>
                <input
                  type="text"
                  value={questaoEditando.titulo || ''}
                  readOnly
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Descrição/Enunciado</label>
                <textarea
                  value={questaoEditando.descricao || questaoEditando.enunciado || ''}
                  readOnly
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Dificuldade</label>
                  <input
                    type="text"
                    value={questaoEditando.dificuldade || 'N/A'}
                    readOnly
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Disciplina</label>
                  <input
                    type="text"
                    value={questaoEditando.disciplina || 'N/A'}
                    readOnly
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => {
                  setShowEditQuestao(false);
                  setQuestaoEditando(null);
                }}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </TabContent>
  );
};

// ============================================
// COMPONENTE PRINCIPAL: ColaboradorDashboard
// ============================================
const ColaboradorDashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [questoes, setQuestoes] = useState([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loadingQuestoes, setLoadingQuestoes] = useState(true);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3002`;

  useEffect(() => {
    if (token) {
      fetchQuestoes();
      // Carregar contagem de notificações ao montar
      fetchUnreadNotificationsCount();
      // Polling a cada 30 segundos para atualizar contagem
      const interval = setInterval(() => {
        fetchUnreadNotificationsCount();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  // Hook para notificações em tempo real
  useNotificacoesRealtime({
    userId: user?.id,
    onNovaNotificacao: (notificacao) => {
      // Recarregar contagem correta ao invés de somar
      console.log('[NOTIFY] Nova notificação recebida:', notificacao);
      fetchUnreadNotificationsCount();
    },
    enabled: !!user?.id
  });

  const fetchUnreadNotificationsCount = async () => {
    if (!user || !user.id) return;
    
    try {
      const token_value = localStorage.getItem('comaes_token');
      if (!token_value) return;

      const response = await fetch(`${API_BASE}/api/notificacoes/usuario/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token_value}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) return;

      const data = await response.json();
      if (data.success && data.data) {
        const unreadCount = data.data.filter((n) => !n.lido).length;
        setUnreadNotificationsCount(unreadCount);
      }
    } catch (error) {
      console.error('Erro ao carregar contagem de notificações:', error);
    }
  };

  const fetchQuestoes = async () => {
    if (!token) {
      setLoadingQuestoes(false);
      return;
    }
    setLoadingQuestoes(true);
    try {
      const response = await fetch(`${API_BASE}/api/questoes/colaborador/minhas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        console.warn(`API retornou status ${response.status}, usando dados padrão`);
        setQuestoes([]);
        return;
      }
      const data = await response.json();
      const questoesList = data.questoes || data.dados?.questoes || [];
      setQuestoes(questoesList);
    } catch (error) {
      console.error('Erro ao buscar questões:', error.message);
      // Usar dados padrão em caso de erro
      setQuestoes([]);
    } finally {
      setLoadingQuestoes(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.name || user?.nome || 'Colaborador';
  const disciplinaField = user?.disciplina_colaborador || 'Não informado';
  const userEmail = user?.email || 'Email não disponível';
  
  const getDisciplinaDisplay = (disc) => {
    const disciplinaMap = {
      'matematica': 'Matemática',
      'ingles': 'Inglês',
      'programacao': 'Programação'
    };
    return disciplinaMap[disc] || disc;
  };
  
  const disciplinaDisplay = getDisciplinaDisplay(disciplinaField);
  const initials = displayName.split(' ').slice(0, 2).map(p => p.charAt(0).toUpperCase()).join('') || 'C';

  const questoesPendentes = questoes.filter(q => q.status_aprovacao === 'pendente');
  const questoesAprovadas = questoes.filter(q => q.status_aprovacao === 'aprovada');
  const questoesRejeitadas = questoes.filter(q => q.status_aprovacao === 'rejeitada');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FileText, hidden: false },
    { id: 'minhas-questoes', label: 'Minhas Questões', icon: FileText, hidden: false },
    { id: 'criar-blocos', label: 'Criar Blocos', icon: Layers, hidden: false },
    { id: 'perfil', label: 'Meu Perfil', icon: UserCircle, hidden: false },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, hidden: true }
  ];

  const handleMenuClick = (item) => {
    if (item.id === 'dashboard' || item.id === 'criar-blocos') {
      setActiveTab(item.id);
      setMobileSidebarOpen(false);
    } else if (item.id === 'minhas-questoes') {
      navigate('/colaborador/questoes');
    } else if (item.id === 'perfil') {
      navigate('/perfil');
    } else if (item.id === 'configuracoes') {
      navigate('/configuracoes');
    }
  };

  const renderAvatarButton = (compact = false) => (
    <div className="relative">
      <button
        type="button"
        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
        className={`w-full flex items-center gap-3 rounded-xl text-gray-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all duration-200 ${
          compact ? 'p-1.5' : 'p-2'
        }`}
      >
        <div className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0`}>
          {initials}
        </div>
        {!compact && (
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold truncate text-gray-800">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          </div>
        )}
      </button>

      {profileMenuOpen && (
        <div className={`absolute ${compact ? 'right-0 top-12' : 'left-0 bottom-16'} z-50 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-xl`}>
          <button
            type="button"
            onClick={() => { setProfileMenuOpen(false); navigate('/perfil'); }}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <UserCircle className="w-4 h-4" />
            Meu perfil
          </button>
          <button
            type="button"
            onClick={() => { setProfileMenuOpen(false); handleLogout(); }}
            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-72 bg-white shadow-xl border-r border-slate-200 flex-col h-screen overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex-shrink-0 bg-white">
          <h1 className="text-xl font-bold text-gray-800">Colaborador</h1>
          <p className="text-xs text-slate-500 mt-1">{disciplinaDisplay}</p>
        </div>

        <nav className="flex-1 overflow-y-auto bg-slate-50 p-4">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 mb-3">Menu</h3>
            <div className="space-y-2">
              {menuItems.map(item => (
                !item.hidden && (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item)}
                    className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 flex items-center gap-3 ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white shadow-lg font-semibold'
                        : 'text-slate-700 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                )
              ))}
            </div>
          </div>
        </nav>

        <div className="border-t border-slate-200 p-6 flex-shrink-0 bg-white">
          {renderAvatarButton()}
        </div>
      </div>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h1 className="text-xl font-bold text-gray-800">Colaborador</h1>
                <p className="text-xs text-slate-500 mt-1">{disciplinaDisplay}</p>
              </div>
              <button 
                onClick={() => setMobileSidebarOpen(false)} 
                className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto bg-slate-50 p-4">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 mb-3">Menu</h3>
                <div className="space-y-2">
                  {menuItems.map(item => (
                    !item.hidden && (
                      <button
                        key={item.id}
                        onClick={() => handleMenuClick(item)}
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 flex items-center gap-3 ${
                          activeTab === item.id
                            ? 'bg-blue-600 text-white shadow-lg font-semibold'
                            : 'text-slate-700 hover:bg-white hover:shadow-md'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    )
                  ))}
                </div>
              </div>
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-lg border-b border-slate-200 flex-shrink-0">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                className="md:hidden w-12 h-12 flex items-center justify-center rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200" 
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden md:block">
                <h2 className="text-2xl font-bold text-slate-800">
                  {activeTab === 'dashboard' && 'Painel do Colaborador'}
                  {activeTab === 'criar-blocos' && 'Gerenciar Blocos de Questões'}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {activeTab === 'dashboard' && 'Gerencie suas questões e conteúdo'}
                  {activeTab === 'criar-blocos' && 'Crie e organize seus blocos de questões'}
                </p>
              </div>
            </div>

            {/* Ícone de Notificações - Abre Modal */}
            <button
              onClick={() => setShowNotificationsModal(true)}
              className="relative w-10 h-10 flex items-center justify-center rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              title="Notificações"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center h-5 w-5 text-xs font-bold leading-none text-white transform translate-x-1 -translate-y-1 bg-red-500 rounded-full animate-pulse">
                  {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-7xl mx-auto w-full px-6 py-8">
            {activeTab === 'dashboard' && (
              <TabContent>
                {loadingQuestoes ? (
                  <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Carregando estatísticas...</p>
                    <p className="text-slate-400 text-sm mt-2">Tentando conectar a {API_BASE}</p>
                    <button
                      onClick={fetchQuestoes}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                    >
                      Tentar novamente
                    </button>
                  </div>
                ) : (
                  <>
                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    title="Questões Aprovadas"
                    value={questoesAprovadas.length}
                    icon={CheckCircle}
                    color="border-green-500"
                  />
                  <StatCard
                    title="Em Revisão"
                    value={questoesPendentes.length}
                    icon={Clock}
                    color="border-yellow-500"
                  />
                  <StatCard
                    title="Rejeitadas"
                    value={questoesRejeitadas.length}
                    icon={AlertCircle}
                    color="border-red-500"
                  />
                  <StatCard
                    title="Total"
                    value={questoes.length}
                    icon={FileText}
                    color="border-blue-500"
                  />
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Ações Rápidas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => navigate('/colaborador/questoes')}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Criar Questão
                    </button>
                    <button
                      onClick={() => setActiveTab('criar-blocos')}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <Layers className="w-5 h-5" />
                      Criar Blocos
                    </button>
                  </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Discipline Info */}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Informações da Disciplina</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                        <span className="text-slate-600 font-medium">Disciplina</span>
                        <span className="text-slate-800 font-semibold">{disciplinaDisplay}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                        <span className="text-slate-600 font-medium">Email</span>
                        <span className="text-slate-800 font-semibold text-sm">{userEmail}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                        <span className="text-slate-600 font-medium">Total Submetidas</span>
                        <span className="text-slate-800 font-semibold">{questoes.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Taxa de Aprovação</span>
                        <span className="text-slate-800 font-semibold">
                          {questoes.length > 0 
                            ? `${Math.round((questoesAprovadas.length / questoes.length) * 100)}%`
                            : 'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Dicas Importantes</h3>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                        <p className="text-slate-700 text-sm">Revise cuidadosamente cada questão antes de submeter</p>
                      </div>
                      <div className="flex gap-3">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                        <p className="text-slate-700 text-sm">Certifique-se de que a resposta correta está nas opções</p>
                      </div>
                      <div className="flex gap-3">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                        <p className="text-slate-700 text-sm">Adicione uma explicação para melhorar a aprovação</p>
                      </div>
                      <div className="flex gap-3">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                        <p className="text-slate-700 text-sm">Organize suas questões em blocos por dificuldade</p>
                      </div>
                    </div>
                  </div>
                </div>
                  </>
                )}
              </TabContent>
            )}

            {activeTab === 'criar-blocos' && (
              <CriarBlocosTab token={token} apiBase={API_BASE} />
            )}
          </div>
        </div>
      </div>

      {/* Modal de Notificações - Reutilizado */}
      <NotificacoesModal 
        isOpen={showNotificationsModal} 
        onClose={() => setShowNotificationsModal(false)}
        onNotificationRead={() => {
          // Atualizar contagem quando notificação é lida
          fetchUnreadNotificationsCount();
        }}
        onAllRead={() => {
          // Zerar contagem quando todas são lidas
          setUnreadNotificationsCount(0);
        }}
        key={showNotificationsModal ? 'open' : 'closed'}
      />
    </div>
  );
};

export default ColaboradorDashboard;

