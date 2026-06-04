/**
 * MinhasQuestoes.jsx
 * Página do Colaborador para gerenciar suas questões
 * Acesso restrito a usuários com role = 'colaborador'
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import questoesService from '../../services/questoesService';
import {
  Search, Plus, Edit, Trash2, Lock, X, Check, AlertCircle,
  BookOpen, ChevronDown, ChevronUp
} from 'lucide-react';
import PageTransition from '../../components/PageTransition';

// Badge de status de aprovação
function StatusBadge({ status }) {
  const styles = {
    pendente: 'bg-yellow-100 text-yellow-800',
    aprovada: 'bg-green-100 text-green-800',
    rejeitada: 'bg-red-100 text-red-800',
  };
  const labels = {
    pendente: 'Pendente',
    aprovada: 'Aprovada',
    rejeitada: 'Rejeitada',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.pendente}`}>
      {labels[status] || status}
    </span>
  );
}

// Modal de criação/edição de questão
function QuestaoModal({ questao, isOpen, onClose, onSave, disciplinaColaborador }) {
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    tipo: 'multipla_escolha',
    dificuldade: 'medio',
    resposta_correta: '',
    opcoes: ['', '', '', ''],
    explicacao: '',
    pontos: 10,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  
  // Verificar se está editando uma questão já aprovada
  const isEdit = !!questao?.id;
  const isQuestaoAprovada = questao?.status_aprovacao === 'aprovada';

  useEffect(() => {
    if (questao) {
      setForm({
        titulo: questao.titulo || '',
        descricao: questao.descricao || '',
        tipo: questao.tipo || 'multipla_escolha',
        dificuldade: questao.dificuldade || 'medio',
        resposta_correta: questao.resposta_correta || '',
        opcoes: Array.isArray(questao.opcoes) ? questao.opcoes : ['', '', '', ''],
        explicacao: questao.explicacao || '',
        pontos: questao.pontos || 10,
      });
    } else {
      setForm({
        titulo: '',
        descricao: '',
        tipo: 'multipla_escolha',
        dificuldade: 'medio',
        resposta_correta: '',
        opcoes: ['', '', '', ''],
        explicacao: '',
        pontos: 10,
      });
    }
    setErrors({});
  }, [questao, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleOpcaoChange = (index, value) => {
    const novasOpcoes = [...form.opcoes];
    novasOpcoes[index] = value;
    setForm(prev => ({ ...prev, opcoes: novasOpcoes }));
  };

  const validar = () => {
    const errs = {};
    if (!form.titulo?.trim()) errs.titulo = 'Título é obrigatório';
    if (!form.descricao?.trim()) errs.descricao = 'Descrição é obrigatória';
    if (!form.resposta_correta) errs.resposta_correta = 'Selecione a resposta correta';
    
    // Validar que pelo menos 2 alternativas têm conteúdo
    const opcoesPreenchidas = form.opcoes.filter(o => o.trim());
    if (opcoesPreenchidas.length < 2) {
      errs.opcoes = 'Preencha pelo menos 2 alternativas';
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    setSaving(true);
    try {
      // Filtrar opções vazias
      const opcoesValidas = form.opcoes.filter(o => o.trim());
      const dados = {
        ...form,
        opcoes: opcoesValidas,
        // Disciplina é automaticamente herdada do perfil do colaborador no backend
      };
      await onSave(dados);
      onClose();
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  // isEdit já calculado no topo do componente (linha ~51)
  // const isEdit = !!questao; — removido: duplicado

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-slate-800">
            {isEdit ? 'Editar Questão' : 'Nova Questão'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Disciplina (apenas visual) */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-sm text-slate-500">Disciplina: </span>
            <span className="text-sm font-semibold text-slate-700 capitalize">{disciplinaColaborador}</span>
          </div>

          {/* Aviso para questão aprovada sendo editada */}
          {isEdit && isQuestaoAprovada && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Atenção: Questão já aprovada</p>
                <p className="mt-1">
                  Ao editar esta questão, ela voltará para status <strong>"pendente"</strong> e precisará ser aprovada novamente por um administrador.
                </p>
              </div>
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Título da Questão <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                errors.titulo ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 focus:ring-blue-500'
              }`}
              placeholder="Ex: Qual o resultado de 2 + 2?"
            />
            {errors.titulo && <p className="text-xs text-red-600 mt-1">{errors.titulo}</p>}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Descrição/Enunciado <span className="text-red-500">*</span>
            </label>
            <textarea
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              rows={3}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                errors.descricao ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 focus:ring-blue-500'
              }`}
              placeholder="Digite o enunciado completo da questão..."
            />
            {errors.descricao && <p className="text-xs text-red-600 mt-1">{errors.descricao}</p>}
          </div>

          {/* Dificuldade e Pontos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Dificuldade</label>
              <select
                name="dificuldade"
                value={form.dificuldade}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="facil">Fácil</option>
                <option value="medio">Médio</option>
                <option value="dificil">Difícil</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Pontos</label>
              <input
                type="number"
                name="pontos"
                value={form.pontos}
                onChange={handleChange}
                min={1}
                max={100}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Alternativas */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Alternativas <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {form.opcoes.map((opcao, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="resposta_correta"
                    checked={form.resposta_correta === opcao}
                    onChange={() => setForm(prev => ({ ...prev, resposta_correta: opcao }))}
                    disabled={!opcao.trim()}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="text-sm font-medium text-slate-500 w-6">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <input
                    type="text"
                    value={opcao}
                    onChange={(e) => handleOpcaoChange(idx, e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Alternativa ${String.fromCharCode(65 + idx)}`}
                  />
                  {form.resposta_correta === opcao && opcao.trim() && (
                    <span className="text-green-600 text-xs font-semibold">✓ Correta</span>
                  )}
                </div>
              ))}
            </div>
            {errors.opcoes && <p className="text-xs text-red-600 mt-1">{errors.opcoes}</p>}
            {errors.resposta_correta && <p className="text-xs text-red-600 mt-1">{errors.resposta_correta}</p>}
          </div>

          {/* Explicação */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Explicação (opcional)</label>
            <textarea
              name="explicacao"
              value={form.explicacao}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Explique por que a resposta está correta..."
            />
          </div>

          {/* Mensagem de erro submit */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {errors.submit}
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>Salvando...</>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {isEdit ? 'Salvar Alterações' : 'Criar Questão'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componente principal
export default function MinhasQuestoes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [questoes, setQuestoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busca, setBusca] = useState('');
  const [filtroDificuldade, setFiltroDificuldade] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [questaoSelecionada, setQuestaoSelecionada] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Verificar se usuário é colaborador aprovado — redirecionar pelo papel
  useEffect(() => {
    if (!user) { navigate('/login', { replace: true }); return; }
    if (user.role === 'admin' || user.isAdmin) { navigate('/administrador', { replace: true }); return; }
    if (user.role !== 'colaborador' || user.status_colaborador !== 'aprovado') {
      navigate('/painel', { replace: true });
    }
  }, [user, navigate]);

  // Carregar questões
  const carregarQuestoes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (busca) params.busca = busca;
      if (filtroDificuldade) params.dificuldade = filtroDificuldade;
      
      const response = await questoesService.listar(params);
      setQuestoes(response.dados?.questoes || response.questoes || []);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao carregar questões:', err);
    } finally {
      setLoading(false);
    }
  }, [busca, filtroDificuldade]);

  useEffect(() => {
    carregarQuestoes();
  }, [carregarQuestoes]);

  // Criar/Editar questão
  const handleSave = async (dados) => {
    try {
      if (questaoSelecionada) {
        await questoesService.atualizar(questaoSelecionada.id, dados);
      } else {
        await questoesService.criar(dados);
      }
      await carregarQuestoes();
    } catch (err) {
      throw err;
    }
  };

  // Deletar questão
  const handleDelete = async (id) => {
    try {
      await questoesService.deletar(id);
      setDeleteConfirm(null);
      await carregarQuestoes();
    } catch (err) {
      alert(err.message);
    }
  };

  // Abrir modal de edição
  const openEdit = (questao) => {
    setQuestaoSelecionada(questao);
    setModalOpen(true);
  };

  // Abrir modal de criação
  const openCreate = () => {
    setQuestaoSelecionada(null);
    setModalOpen(true);
  };

  // Verifica se questão é de origem seed (não editável)
  const isSeed = (questao) => questao.origem === 'seed';

  // Filtrar questões pela busca (client-side adicional)
  const questoesFiltradas = questoes.filter(q => {
    if (!busca) return true;
    const buscaLower = busca.toLowerCase();
    return (
      q.titulo?.toLowerCase().includes(buscaLower) ||
      q.descricao?.toLowerCase().includes(buscaLower)
    );
  });

  // Mostrar loading ou erro
  if (loading && questoes.length === 0) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando suas questões...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-md">
            <div className="flex items-center gap-2 font-semibold mb-2">
              <AlertCircle className="w-5 h-5" />
              Erro ao carregar questões
            </div>
            <p className="text-sm">{error}</p>
            <button
              onClick={carregarQuestoes}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8">
          <div className="container mx-auto px-4">
            <button
              onClick={() => navigate('/colaborador/dashboard')}
              className="flex items-center gap-2 text-blue-100 hover:text-white text-sm font-medium mb-4 transition-colors"
            >
              ← Voltar ao Painel
            </button>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Minhas Questões</h1>
            </div>
            <p className="text-blue-100">
              Gerencie suas questões de {user?.disciplina_colaborador || 'sua disciplina'}
            </p>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="container mx-auto px-4 py-6">
          {/* Barra de ferramentas */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
              {/* Busca */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por título ou descrição..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filtro dificuldade */}
              <select
                value={filtroDificuldade}
                onChange={(e) => setFiltroDificuldade(e.target.value)}
                className="px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as dificuldades</option>
                <option value="facil">Fácil</option>
                <option value="medio">Médio</option>
                <option value="dificil">Difícil</option>
              </select>

              {/* Botão criar */}
              <button
                onClick={openCreate}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center"
              >
                <Plus className="w-5 h-5" />
                Nova Questão
              </button>
            </div>
          </div>

          {/* Lista de questões */}
          {questoesFiltradas.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Nenhuma questão encontrada</h3>
              <p className="text-slate-500 mb-6">
                {busca || filtroDificuldade
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece criando sua primeira questão!'}
              </p>
              {!busca && !filtroDificuldade && (
                <button
                  onClick={openCreate}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Criar Primeira Questão
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Título</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Dificuldade</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Pontos</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                      <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {questoesFiltradas.map((questao) => (
                      <tr key={questao.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {isSeed(questao) && (
                              <Lock className="w-4 h-4 text-slate-400" title="Questão seed - apenas visualização" />
                            )}
                            <div>
                              <p className="font-medium text-slate-800 line-clamp-1">{questao.titulo}</p>
                              <p className="text-sm text-slate-500 line-clamp-1">{questao.descricao}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            questao.dificuldade === 'facil' ? 'bg-green-100 text-green-700' :
                            questao.dificuldade === 'medio' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {questao.dificuldade === 'facil' ? 'Fácil' :
                             questao.dificuldade === 'medio' ? 'Médio' : 'Difícil'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{questao.pontos}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={questao.status_aprovacao} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {isSeed(questao) ? (
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                Seed
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => openEdit(questao)}
                                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(questao.id)}
                                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
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

          {/* Info adicional */}
          <div className="mt-6 text-center text-sm text-slate-500">
            Total: {questoesFiltradas.length} questão{questoesFiltradas.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Modal de questão */}
        <QuestaoModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setQuestaoSelecionada(null);
          }}
          onSave={handleSave}
          disciplinaColaborador={user?.disciplina_colaborador}
          questao={questaoSelecionada}
        />

        {/* Modal de confirmação de exclusão */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Confirmar Exclusão</h3>
                <p className="text-slate-600 text-sm mb-6">
                  Tem certeza que deseja excluir esta questão? Esta ação não pode ser desfeita.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
