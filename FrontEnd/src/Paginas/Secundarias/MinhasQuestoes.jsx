/**
 * MinhasQuestoes.jsx - Aba para Colaborador gerenciar suas questões
 * Corrigido e melhorado:
 * 1. Usa AuthContext para token
 * 2. URL da API via variável de ambiente
 * 3. Serviço centralizado
 * 4. Validações robustas
 * 5. Tratamento de erros melhorado
 * 6. Formulário unificado com o CreateQuestaoForm
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash2, AlertCircle, BookOpen, CheckCircle, XCircle, Save, X, Clock, Award, ArrowLeft } from 'lucide-react';
import PageTransition from '../../components/PageTransition';

// ── Constantes 
const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// ── Mapeamento de pontos por dificuldade
const PONTOS_POR_DIFICULDADE = {
  'facil': 5,
  'medio': 10,
  'dificil': 20
};

// ── Serviço de Questões do Colaborador 
class ColaboradorQuestoesService {
  constructor(token) {
    this.token = token;
    this.baseUrl = `${API_BASE}/api/colaborador/questoes`;
  }

  async request(endpoint, options = {}) {
    const url = endpoint ? `${this.baseUrl}/${endpoint}` : this.baseUrl;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensagem || data.error || `Erro ${response.status}`);
    }

    return data;
  }

  async listar() {
    const data = await this.request('');
    return data.dados?.questoes || data.questoes || [];
  }

  async criar(dados) {
    const data = await this.request('', {
      method: 'POST',
      body: JSON.stringify(dados),
    });
    return data;
  }

  async editar(id, dados) {
    const data = await this.request(id, {
      method: 'PUT',
      body: JSON.stringify(dados),
    });
    return data;
  }

  async deletar(id) {
    const data = await this.request(id, {
      method: 'DELETE',
    });
    return data;
  }
}

// ── Badge de Status - Estilo COMAES
function StatusBadge({ status }) {
  const config = {
    pendente: { 
      bg: 'bg-yellow-50', 
      text: 'text-yellow-800', 
      border: 'border-yellow-200',
      icon: <Clock className="w-3.5 h-3.5" />,
      label: 'Aguardando' 
    },
    aprovada: { 
      bg: 'bg-green-50', 
      text: 'text-green-800', 
      border: 'border-green-200',
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      label: 'Aprovada' 
    },
    rejeitada: { 
      bg: 'bg-red-50', 
      text: 'text-red-800', 
      border: 'border-red-200',
      icon: <XCircle className="w-3.5 h-3.5" />,
      label: 'Rejeitada' 
    }
  };
  
  const c = config[status] || config.pendente;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      {c.icon}
      {c.label}
    </span>
  );
}

// ── Função para obter a cor do badge de pontos
function getPontosBadgeColor(dificuldade) {
  const colors = {
    'facil': 'bg-green-100 text-green-800 border-green-300',
    'medio': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'dificil': 'bg-red-100 text-red-800 border-red-300'
  };
  return colors[dificuldade] || 'bg-gray-100 text-gray-800 border-gray-300';
}

// ── Modal de Formulário da Questão (estilo unificado)
function QuestaoForm({ questao, isOpen, onClose, onSave, disciplina, saving: externalSaving }) {
  const [formData, setFormData] = useState({
    titulo: '',
    enunciado: '',
    dificuldade: 'medio',
    pontos: 10,
    opcoes: ['', '', '', ''],
    resposta_correta: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Reset form quando abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (questao) {
        // opcoes pode vir como array de strings ou array de { texto, correta }
        const rawOpcoes = Array.isArray(questao.opcoes) ? questao.opcoes : [];
        const opcoesStrings = rawOpcoes.map(o =>
          typeof o === 'string' ? o : (o?.texto || '')
        );
        // garantir sempre 4 slots
        while (opcoesStrings.length < 4) opcoesStrings.push('');

        // resposta_correta pode ser string directa ou precisar ser derivada dos objetos
        const respostaCorreta = questao.resposta_correta ||
          (rawOpcoes.find(o => o?.correta)?.texto) || '';

        setFormData({
          titulo: questao.titulo || '',
          enunciado: questao.descricao || questao.enunciado || '',
          dificuldade: questao.dificuldade || 'medio',
          pontos: questao.pontos || 10,
          opcoes: opcoesStrings.slice(0, 4),
          resposta_correta: respostaCorreta
        });
      } else {
        setFormData({
          titulo: '',
          enunciado: '',
          dificuldade: 'medio',
          pontos: 10,
          opcoes: ['', '', '', ''],
          resposta_correta: ''
        });
      }
      setError(null);
    }
  }, [questao, isOpen]);

  // Atualizar pontos automaticamente quando mudar dificuldade
  const handleDificuldadeChange = (value) => {
    const pontos = PONTOS_POR_DIFICULDADE[value] || 10;
    setFormData(prev => ({
      ...prev,
      dificuldade: value,
      pontos: pontos
    }));
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOpcaoChange = (index, value) => {
    const novasOpcoes = [...formData.opcoes];
    novasOpcoes[index] = value;
    setFormData(prev => ({ ...prev, opcoes: novasOpcoes }));
    
    // Se a resposta correta for a opção que mudou, atualizar também
    if (formData.resposta_correta === formData.opcoes[index]) {
      setFormData(prev => ({ ...prev, resposta_correta: value }));
    }
  };

  const validateForm = () => {
    // Validar título
    if (!formData.titulo.trim()) {
      setError('Título é obrigatório');
      return false;
    }

    // Validar enunciado
    if (!formData.enunciado?.trim()) {
      setError('Enunciado é obrigatório');
      return false;
    }

    // Validar opções
    const opcoesValidas = formData.opcoes.filter(o => o.trim());
    if (opcoesValidas.length < 2) {
      setError('Preencha pelo menos 2 alternativas');
      return false;
    }

    // Validar opções duplicadas
    const uniqueOpcoes = new Set(opcoesValidas.map(o => o.trim().toLowerCase()));
    if (uniqueOpcoes.size !== opcoesValidas.length) {
      setError('Alternativas duplicadas não são permitidas');
      return false;
    }

    // Validar resposta correta
    if (!formData.resposta_correta) {
      setError('Selecione a resposta correta');
      return false;
    }

    if (!opcoesValidas.includes(formData.resposta_correta)) {
      setError('A resposta correta deve ser uma das alternativas');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const dadosParaSalvar = {
        titulo: formData.titulo,
        enunciado: formData.enunciado,         // para criarQuestao (ColaboradorController)
        descricao: formData.enunciado,         // para atualizarQuestaoColaborador (V2)
        disciplina: disciplina.toLowerCase(),
        dificuldade: formData.dificuldade,
        tipo: 'multipla_escolha',
        // converter array de strings para array de objetos { texto, correta }
        opcoes: formData.opcoes
          .filter(o => o.trim())
          .map(o => ({ texto: o.trim(), correta: o === formData.resposta_correta })),
        resposta_correta: formData.resposta_correta,
        pontos: formData.pontos
      };
      
      await onSave(dadosParaSalvar);
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao salvar questão');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header - estilo unificado com CreateQuestaoForm */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between border-b border-blue-700 z-10 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">
            {questao ? 'Editar Questão' : 'Criar Nova Questão'}
          </h2>
          <button
            onClick={onClose}
            disabled={saving || externalSaving}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Erros */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm flex gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Info disciplina */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="text-slate-600">Disciplina: </span>
            <span className="font-semibold text-blue-700 capitalize">{disciplina}</span>
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => handleFieldChange('titulo', e.target.value)}
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Ex: Qual é a capital de Portugal?"
              maxLength={200}
            />
            <p className="text-xs text-slate-500 mt-1">{formData.titulo.length}/200</p>
          </div>

          {/* Enunciado */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Enunciado <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.enunciado}
              onChange={(e) => handleFieldChange('enunciado', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              placeholder="Digite o enunciado completo da questão..."
              maxLength={1000}
            />
            <p className="text-xs text-slate-500 mt-1">{formData.enunciado.length}/1000</p>
          </div>

          {/* Dificuldade (Radio Buttons) e Pontos (Badge) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nível de Dificuldade <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dificuldade"
                    value="facil"
                    checked={formData.dificuldade === 'facil'}
                    onChange={() => handleDificuldadeChange('facil')}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-green-700">Fácil</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dificuldade"
                    value="medio"
                    checked={formData.dificuldade === 'medio'}
                    onChange={() => handleDificuldadeChange('medio')}
                    className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="text-sm font-medium text-yellow-700">Médio</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dificuldade"
                    value="dificil"
                    checked={formData.dificuldade === 'dificil'}
                    onChange={() => handleDificuldadeChange('dificil')}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-red-700">Difícil</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Pontos (Automático)
              </label>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg border-2 ${getPontosBadgeColor(formData.dificuldade)}`}>
                <span>{formData.pontos}</span>
                <span className="text-xs font-normal opacity-75">pontos</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Definido automaticamente: Fácil=5, Médio=10, Difícil=20
              </p>
            </div>
          </div>

          {/* Alternativas */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Alternativas <span className="text-red-500">*</span>
              <span className="text-xs font-normal text-slate-500 ml-2">
                ({formData.opcoes.filter(o => o.trim()).length}/4 preenchidas)
              </span>
            </label>
            <div className="space-y-3">
              {formData.opcoes.map((opcao, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <input
                    type="radio"
                    name="resposta_correta"
                    checked={formData.resposta_correta === opcao}
                    onChange={() => handleFieldChange('resposta_correta', opcao)}
                    className="w-4 h-4 cursor-pointer flex-shrink-0"
                  />
                  <span className="text-sm font-semibold text-slate-700 w-6 flex-shrink-0">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <input
                    type="text"
                    value={opcao}
                    onChange={(e) => handleOpcaoChange(idx, e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder={`Alternativa ${String.fromCharCode(65 + idx)}`}
                    maxLength={500}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <span className="text-blue-600 font-bold">●</span> Selecione o botão de rádio ao lado da alternativa correta.
            </p>
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Informação:</strong> A questão será criada como <strong>"Pendente"</strong> e precisará ser aprovada por um administrador antes de ser usada em torneios.
              </span>
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              disabled={saving || externalSaving}
              className="flex-1 px-4 py-2.5 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors font-semibold disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || externalSaving}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving || externalSaving ? 'Salvando...' : 'Salvar Questão'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Modal de Confirmação de Deleção 
function DeleteConfirmModal({ isOpen, onClose, onConfirm, titulo }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-2">Confirmar exclusão?</h3>
        <p className="text-slate-600 mb-2">
          Tem certeza que deseja excluir a questão "{titulo?.substring(0, 50)}..."?
        </p>
        <p className="text-red-600 text-sm mb-6">Esta ação não pode ser desfeita.</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Deletar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componente Principal 
export default function MinhasQuestoes() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [questoes, setQuestoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [questaoEdit, setQuestaoEdit] = useState(null);
  const [questaoParaDeletar, setQuestaoParaDeletar] = useState(null);

  // Criar instância do serviço
  const service = new ColaboradorQuestoesService(token);

  // Proteger rota
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    
    if (user.role === 'admin' || user.isAdmin) {
      navigate('/administrador', { replace: true });
      return;
    }
    
    if (user.role !== 'colaborador') {
      navigate('/painel', { replace: true });
      return;
    }
    
    if (user.status_colaborador !== 'aprovado') {
      navigate('/painel', { replace: true });
      return;
    }
  }, [user, navigate]);

  // Carregar questões
  const carregarQuestoes = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      const lista = await service.listar();
      
      // ✅ DATA SAFETY: Normalizar resposta - garantir que é array
      const questoesNormalizadas = Array.isArray(lista) ? lista : [];
      setQuestoes(questoesNormalizadas);
    } catch (err) {
      console.error('Erro ao carregar questões:', err);
      console.error('Detalhes do erro:', err.message);
      setError(err.message || 'Erro ao carregar questões');
      // ✅ DATA SAFETY: Sempre definir array vazio em caso de erro
      setQuestoes([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    carregarQuestoes();
  }, [carregarQuestoes]);

  // Criar questão
  const handleCreate = async (dados) => {
    setSaving(true);
    try {
      await service.criar(dados);
      await carregarQuestoes();
    } finally {
      setSaving(false);
    }
  };

  // Editar questão
  const handleEdit = async (id, dados) => {
    setSaving(true);
    try {
      await service.editar(id, dados);
      await carregarQuestoes();
    } finally {
      setSaving(false);
    }
  };

  // Deletar questão
  const handleDelete = async () => {
    if (!questaoParaDeletar) return;
    
    try {
      await service.deletar(questaoParaDeletar);
      await carregarQuestoes();
      setQuestaoParaDeletar(null);
    } catch (err) {
      setError('Erro ao deletar: ' + err.message);
    }
  };

  // Handle save (create ou edit)
  const handleSave = async (dados) => {
    if (questaoEdit) {
      await handleEdit(questaoEdit.id, dados);
    } else {
      await handleCreate(dados);
    }
  };

  // Loading state
  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4" style={{
              border: '3px solid #E8EAEF',
              borderTopColor: '#4F6EF7',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p className="text-slate-600 font-medium">Carregando questões...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Error state
  if (error && questoes.length === 0) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[60vh] p-6">
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 max-w-2xl w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Erro ao carregar questões</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">{error}</p>
            <button
              onClick={carregarQuestoes}
              className="px-5 py-2.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 flex items-center gap-2"
              style={{ 
                background: '#4F6EF7',
                boxShadow: '0 2px 6px rgba(79, 110, 247, 0.25)'
              }}
            >
              <AlertCircle className="w-4 h-4" />
              Tentar Novamente
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      {/* CSS para esconder scrollbars - FORÇADO */}
      <style>{`
        /* Esconder scrollbar globalmente */
        * {
          scrollbar-width: none !important; /* Firefox */
          -ms-overflow-style: none !important; /* IE e Edge */
        }
        
        *::-webkit-scrollbar {
          display: none !important; /* Chrome, Safari, Opera */
          width: 0 !important;
          height: 0 !important;
        }
        
        /* Específico para esta página */
        .minhas-questoes-container * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        
        .minhas-questoes-container *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        
        /* Mobile: Tabela vira cards */
        @media (max-width: 768px) {
          .mobile-card-view {
            display: block !important;
          }
          
          .mobile-card-view table,
          .mobile-card-view thead,
          .mobile-card-view tbody,
          .mobile-card-view tr,
          .mobile-card-view td,
          .mobile-card-view th {
            display: block !important;
          }
          
          .mobile-card-view thead {
            display: none !important;
          }
          
          .mobile-card-view tr {
            margin-bottom: 1rem;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 1rem;
            background: white;
          }
          
          .mobile-card-view td {
            padding: 0.5rem 0 !important;
            text-align: left !important;
            border: none !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
          }
          
          .mobile-card-view td:before {
            content: attr(data-label);
            font-weight: 600;
            color: #64748b;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
        }
      `}</style>

      <div className="space-y-4 sm:space-y-6 minhas-questoes-container px-4 sm:px-0">
        {/* Header Limpo e Profissional */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
          {/* Botão Voltar */}
          <button
            onClick={() => navigate('/colaborador/dashboard')}
            className="mb-3 sm:mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Voltar ao Dashboard</span>
          </button>
          
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" style={{ color: '#4F6EF7' }} />
                <h1 className="text-lg sm:text-2xl font-bold text-slate-800 truncate">Minhas Questões</h1>
              </div>
              <p className="text-slate-600 text-xs sm:text-sm">
                Gerencie suas questões e status
              </p>
            </div>
            <button
              onClick={() => {
                setQuestaoEdit(null);
                setModalOpen(true);
              }}
              className="flex-shrink-0 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-base whitespace-nowrap"
              style={{ 
                background: '#4F6EF7',
                boxShadow: '0 2px 6px rgba(79, 110, 247, 0.25)'
              }}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Nova</span>
              <span className="hidden sm:inline">Questão</span>
            </button>
          </div>
        </div>

        {/* Cards de Estatísticas - Estilo COMAES */}
        {questoes.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {/* Card Total */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4 transition-all hover:shadow-md">
              <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] sm:text-xs font-medium text-slate-500 mb-0.5 sm:mb-1 uppercase tracking-wide">
                    Total
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">
                    {questoes.length}
                  </div>
                </div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#EEF1FE' }}>
                  <BookOpen className="w-4 h-4 sm:w-4 sm:h-4" style={{ color: '#4F6EF7' }} />
                </div>
              </div>
              <div className="text-[10px] sm:text-xs text-slate-500 truncate">Questões criadas</div>
            </div>

            {/* Card Aprovadas */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4 transition-all hover:shadow-md">
              <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] sm:text-xs font-medium text-slate-500 mb-0.5 sm:mb-1 uppercase tracking-wide">
                    Aprovadas
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">
                    {questoes.filter(q => q?.status_aprovacao === 'aprovada').length}
                  </div>
                </div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-green-50">
                  <CheckCircle className="w-4 h-4 sm:w-4 sm:h-4 text-green-600" />
                </div>
              </div>
              <div className="text-[10px] sm:text-xs text-slate-500 truncate">Disponíveis</div>
            </div>

            {/* Card Pendentes */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4 transition-all hover:shadow-md">
              <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] sm:text-xs font-medium text-slate-500 mb-0.5 sm:mb-1 uppercase tracking-wide">
                    Pendentes
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">
                    {questoes.filter(q => q?.status_aprovacao === 'pendente').length}
                  </div>
                </div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-yellow-50">
                  <Clock className="w-4 h-4 sm:w-4 sm:h-4 text-yellow-600" />
                </div>
              </div>
              <div className="text-[10px] sm:text-xs text-slate-500 truncate">Aguardando</div>
            </div>

            {/* Card Rejeitadas */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4 transition-all hover:shadow-md">
              <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] sm:text-xs font-medium text-slate-500 mb-0.5 sm:mb-1 uppercase tracking-wide">
                    Rejeitadas
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">
                    {questoes.filter(q => q?.status_aprovacao === 'rejeitada').length}
                  </div>
                </div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-red-50">
                  <XCircle className="w-4 h-4 sm:w-4 sm:h-4 text-red-600" />
                </div>
              </div>
              <div className="text-[10px] sm:text-xs text-slate-500 truncate">Precisam revisão</div>
            </div>
          </div>
        )}

        {/* Error message (non-critical) */}
        {error && questoes.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Lista ou vazio */}
        {questoes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 sm:p-12 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: '#EEF1FE' }}>
              <BookOpen className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: '#4F6EF7' }} />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2">
              Nenhuma questão criada ainda
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm mb-6">
              Comece criando sua primeira questão e contribua para o banco de questões da plataforma
            </p>
            <button
              onClick={() => {
                setQuestaoEdit(null);
                setModalOpen(true);
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 inline-flex items-center justify-center gap-2 text-sm"
              style={{ 
                background: '#4F6EF7',
                boxShadow: '0 2px 6px rgba(79, 110, 247, 0.25)'
              }}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Criar Primeira Questão
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mobile-card-view">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 sm:px-6 py-3 sm:py-3.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">Questão</th>
                    <th className="text-left px-4 sm:px-6 py-3 sm:py-3.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">Dificuldade</th>
                    <th className="text-left px-4 sm:px-6 py-3 sm:py-3.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">Pontos</th>
                    <th className="text-left px-4 sm:px-6 py-3 sm:py-3.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 sm:px-6 py-3 sm:py-3.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Array.isArray(questoes) && questoes.map((q) => (
                    <tr 
                      key={q?.id || Math.random()} 
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 sm:px-6 py-3 sm:py-4" data-label="Questão">
                        <div>
                          <p className="font-semibold text-slate-900 text-xs sm:text-sm line-clamp-1">
                            {q?.titulo || 'Sem título'}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 hidden sm:block">{q?.descricao || ''}</p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4" data-label="Dificuldade">
                        <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-xs font-semibold ${
                          q?.dificuldade === 'facil' ? 'bg-green-100 text-green-800' :
                          q?.dificuldade === 'medio' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {(q?.dificuldade || 'medio').charAt(0).toUpperCase() + (q?.dificuldade || 'medio').slice(1)}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4" data-label="Pontos">
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500" />
                          <span className="font-semibold text-slate-900 text-xs sm:text-sm">{q?.pontos || 0}</span>
                          <span className="text-xs text-slate-500">pts</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4" data-label="Status">
                        <StatusBadge status={q?.status_aprovacao || 'pendente'} />
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4" data-label="Ações">
                        <div className="flex items-center justify-end gap-2">
                          {['pendente', 'rejeitada'].includes(q?.status_aprovacao) && (
                            <>
                              <button
                                onClick={() => {
                                  setQuestaoEdit(q);
                                  setModalOpen(true);
                                }}
                                className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                                title="Editar questão"
                              >
                                <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                              <button
                                onClick={() => setQuestaoParaDeletar(q.id)}
                                className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                                title="Deletar questão"
                              >
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                            </>
                          )}
                          {q.status_aprovacao === 'aprovada' && (
                            <span className="text-xs text-slate-400 italic px-2 sm:px-2.5 py-1 bg-slate-50 rounded-lg">
                              Não editável
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal do Formulário */}
        <QuestaoForm
          questao={questaoEdit}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setQuestaoEdit(null);
          }}
          onSave={handleSave}
          disciplina={user?.disciplina_colaborador || 'matematica'}
          saving={saving}
        />

        {/* Modal de Confirmação de Deleção */}
        <DeleteConfirmModal
          isOpen={!!questaoParaDeletar}
          onClose={() => setQuestaoParaDeletar(null)}
          onConfirm={handleDelete}
          titulo={questoes.find(q => q.id === questaoParaDeletar)?.titulo}
        />
      </div>
    </PageTransition>
  );
}