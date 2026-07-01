/**
 * MinhasQuestoes.jsx - Aba para Colaborador gerenciar suas questões
 * CORREÇÃO: Removendo scrollbars dos cards
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash2, AlertCircle, BookOpen, CheckCircle, XCircle, Clock, Award, ArrowLeft } from 'lucide-react';
import PageTransition from '../../components/PageTransition';
import QuestaoFormUnificado from '../../components/QuestaoFormUnificado';

// ── Constantes 
const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';

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

// ── Badge de Status
function StatusBadge({ status }) {
  const config = {
    pendente: { 
      bg: 'bg-yellow-50', 
      text: 'text-yellow-800', 
      border: 'border-yellow-200',
      icon: <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
      label: 'Aguardando' 
    },
    aprovada: { 
      bg: 'bg-green-50', 
      text: 'text-green-800', 
      border: 'border-green-200',
      icon: <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
      label: 'Aprovada' 
    },
    rejeitada: { 
      bg: 'bg-red-50', 
      text: 'text-red-800', 
      border: 'border-red-200',
      icon: <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
      label: 'Rejeitada' 
    }
  };
  
  const c = config[status] || config.pendente;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      {c.icon}
      <span className="hidden xs:inline">{c.label}</span>
    </span>
  );
}

// ── Modal de Confirmação de Deleção 
function DeleteConfirmModal({ isOpen, onClose, onConfirm, titulo }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-4 sm:p-6 max-w-sm w-full mx-auto" onClick={e => e.stopPropagation()}>
        <h3 className="text-base sm:text-lg font-semibold mb-2">Confirmar exclusão?</h3>
        <p className="text-sm sm:text-base text-slate-600 mb-2">
          Tem certeza que deseja excluir a questão "{titulo?.substring(0, 50)}..."?
        </p>
        <p className="text-red-600 text-xs sm:text-sm mb-4 sm:mb-6">Esta ação não pode ser desfeita.</p>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Deletar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componente Card de Estatística (CORRIGIDO - SEM SCROLLBAR)
function StatCard({ title, value, icon, bgColor, iconColor, subtitle }) {
  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4 lg:p-5 transition-all hover:shadow-md hover:border-slate-300 group overflow-hidden">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-[8px] xs:text-[10px] sm:text-xs font-semibold text-slate-500 mb-0.5 sm:mb-1 uppercase tracking-wider truncate">
            {title}
          </div>
          <div className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight truncate">
            {value}
          </div>
          {subtitle && (
            <div className="text-[8px] xs:text-[9px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 truncate hidden xs:block">
              {subtitle}
            </div>
          )}
        </div>
        <div className={`w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${bgColor}`}>
          <div className={`w-4 h-4 xs:w-4 xs:h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${iconColor}`}>
            {icon}
          </div>
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
      const questoesNormalizadas = Array.isArray(lista) ? lista : [];
      setQuestoes(questoesNormalizadas);
    } catch (err) {
      console.error('Erro ao carregar questões:', err);
      setError(err.message || 'Erro ao carregar questões');
      setQuestoes([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    carregarQuestoes();
  }, [carregarQuestoes]);

  const handleCreate = async (dados) => {
    setSaving(true);
    try {
      await service.criar(dados);
      await carregarQuestoes();
    } catch (err) {
      setSaving(false);
      throw err;
    }
    setSaving(false);
  };

  const handleEdit = async (id, dados) => {
    setSaving(true);
    try {
      await service.editar(id, dados);
      await carregarQuestoes();
    } catch (err) {
      setSaving(false);
      throw err;
    }
    setSaving(false);
  };

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
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 border-3 border-slate-200 border-t-[#4F6EF7] rounded-full animate-spin" />
            <p className="text-sm sm:text-base text-slate-600 font-medium">Carregando questões...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Error state
  if (error && questoes.length === 0) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[60vh] p-4 sm:p-6">
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 sm:p-8 max-w-2xl w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">Erro ao carregar questões</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">{error}</p>
            <button
              onClick={carregarQuestoes}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
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

  // Calcular estatísticas
  const total = questoes.length;
  const aprovadas = questoes.filter(q => q?.status_aprovacao === 'aprovada').length;
  const pendentes = questoes.filter(q => q?.status_aprovacao === 'pendente').length;
  const rejeitadas = questoes.filter(q => q?.status_aprovacao === 'rejeitada').length;

  return (
    <PageTransition>
      {/* CSS GLOBAL para remover scrollbars */}
      <style>{`
        /* REMOVER TODAS AS SCROLLBARS DOS CARDS */
        .stat-card,
        .stat-card *,
        .bg-white.rounded-lg,
        .bg-white.rounded-lg * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
          overflow: visible !important;
        }
        
        .stat-card::-webkit-scrollbar,
        .stat-card *::-webkit-scrollbar,
        .bg-white.rounded-lg::-webkit-scrollbar,
        .bg-white.rounded-lg *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        
        /* Forçar overflow visível em todos os cards */
        .stat-card {
          overflow: visible !important;
        }
        
        /* Apenas a tabela pode ter scroll horizontal quando necessário */
        .table-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        .table-container::-webkit-scrollbar {
          height: 4px;
        }
        
        .table-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .table-container::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        
        .table-container::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        /* Forçar todos os elementos a não terem scroll */
        .no-scroll {
          overflow: visible !important;
        }
        
        .no-scroll::-webkit-scrollbar {
          display: none !important;
        }
      `}</style>

      <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <button
            onClick={() => navigate('/colaborador/dashboard')}
            className="mb-3 sm:mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs sm:text-sm font-medium">Voltar ao Dashboard</span>
          </button>
          
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-[#4F6EF7]" />
                <h1 className="text-lg sm:text-2xl font-bold text-slate-800 truncate">Minhas Questões</h1>
              </div>
              <p className="text-slate-600 text-xs sm:text-sm">
                Gerencie suas questões e status
              </p>
            </div>
            
            {/* Botão Nova Questão */}
            <div className="flex-shrink-0">
              <button
                onClick={() => {
                  setQuestaoEdit(null);
                  setModalOpen(true);
                }}
                className="px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-base whitespace-nowrap"
                style={{ 
                  background: '#4F6EF7',
                  boxShadow: '0 2px 6px rgba(79, 110, 247, 0.25)'
                }}
              >
                <Plus className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                <span className="hidden xs:inline">Nova</span>
                <span className="hidden sm:inline">Questão</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas - SEM SCROLLBARS */}
        {questoes.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-2.5 sm:gap-3 lg:gap-4 no-scroll">
            {/* Total */}
            <StatCard 
              title="Total"
              value={total}
              subtitle={`${total} questão${total !== 1 ? 'es' : ''}`}
              icon={<BookOpen className="w-full h-full" />}
              bgColor="bg-[#EEF1FE]"
              iconColor="text-[#4F6EF7]"
            />
            
            {/* Aprovadas */}
            <StatCard 
              title="Aprovadas"
              value={aprovadas}
              subtitle={`${total > 0 ? Math.round((aprovadas/total) * 100) : 0}% do total`}
              icon={<CheckCircle className="w-full h-full" />}
              bgColor="bg-green-50"
              iconColor="text-green-600"
            />
            
            {/* Pendentes */}
            <StatCard 
              title="Pendentes"
              value={pendentes}
              subtitle={`${total > 0 ? Math.round((pendentes/total) * 100) : 0}% do total`}
              icon={<Clock className="w-full h-full" />}
              bgColor="bg-yellow-50"
              iconColor="text-yellow-600"
            />
            
            {/* Rejeitadas */}
            <StatCard 
              title="Rejeitadas"
              value={rejeitadas}
              subtitle={`${total > 0 ? Math.round((rejeitadas/total) * 100) : 0}% do total`}
              icon={<XCircle className="w-full h-full" />}
              bgColor="bg-red-50"
              iconColor="text-red-600"
            />
          </div>
        )}

        {/* Error message */}
        {error && questoes.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Lista ou vazio */}
        {questoes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 sm:p-12 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-[#EEF1FE]">
              <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-[#4F6EF7]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2">
              Nenhuma questão criada ainda
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm mb-6 max-w-md mx-auto">
              Comece criando sua primeira questão e contribua para o banco de questões da plataforma
            </p>
            <button
              onClick={() => {
                setQuestaoEdit(null);
                setModalOpen(true);
              }}
              className="px-6 py-2.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 inline-flex items-center justify-center gap-2 text-sm"
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Tabela com scroll controlado */}
            <div className="table-container">
              <table className="w-full min-w-[600px] sm:min-w-0">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-3 sm:px-6 py-2.5 sm:py-3.5 text-[10px] sm:text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Questão
                    </th>
                    <th className="text-left px-3 sm:px-6 py-2.5 sm:py-3.5 text-[10px] sm:text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Dificuldade
                    </th>
                    <th className="text-left px-3 sm:px-6 py-2.5 sm:py-3.5 text-[10px] sm:text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Pontos
                    </th>
                    <th className="text-left px-3 sm:px-6 py-2.5 sm:py-3.5 text-[10px] sm:text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right px-3 sm:px-6 py-2.5 sm:py-3.5 text-[10px] sm:text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Array.isArray(questoes) && questoes.map((q) => (
                    <tr 
                      key={q?.id || Math.random()} 
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div>
                          <p className="font-semibold text-slate-900 text-xs sm:text-sm line-clamp-1">
                            {q?.titulo || 'Sem título'}
                          </p>
                          <p className="text-[10px] sm:text-xs text-slate-500 line-clamp-1 hidden sm:block">
                            {q?.descricao || ''}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-semibold ${
                          q?.dificuldade === 'facil' ? 'bg-green-100 text-green-800' :
                          q?.dificuldade === 'medio' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {(q?.dificuldade || 'medio').charAt(0).toUpperCase() + (q?.dificuldade || 'medio').slice(1)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-1">
                          <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500" />
                          <span className="font-semibold text-slate-900 text-xs sm:text-sm">{q?.pontos || 0}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <StatusBadge status={q?.status_aprovacao || 'pendente'} />
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
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
                            <span className="text-[10px] sm:text-xs text-slate-400 italic px-2 py-1 bg-slate-50 rounded-lg">
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

        {/* Modals */}
        <QuestaoFormUnificado
          questao={questaoEdit}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setQuestaoEdit(null);
          }}
          onSave={handleSave}
          disciplinaFixa={user?.disciplina_colaborador || 'matematica'}
          saving={saving}
        />

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