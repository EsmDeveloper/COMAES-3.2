import { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Search, ChevronDown, Layers, X, Package, CheckCircle, AlertCircle } from 'lucide-react';
import BlocoQuestoesManager from './BlocoQuestoesManager';
import CreateQuestaoTesteForm from './CreateQuestaoTesteForm';

const QuestoesTestesTab = () => {
  const [questoesIndividuais, setQuestoesIndividuais] = useState([]);
  const [blocos, setBlocos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('blocos'); // ✅ MUDA: 'blocos' é agora a aba principal
  
  // Estados para modais de ações
  const [modalAgruparAberto, setModalAgruparAberto] = useState(false);
  const [questaoSelecionada, setQuestaoSelecionada] = useState(null);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalDeletarAberto, setModalDeletarAberto] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetchQuestoesIndividuais();
    fetchBlocos();
    
    // ✅ Listener para quando questão é adicionada da aba colaboradores
    const handleQuestaoAdicionada = () => {
      console.log('🔄 Recarregando questões individuais...');
      fetchQuestoesIndividuais();
    };
    
    window.addEventListener('questaoAdicionadaTeste', handleQuestaoAdicionada);
    return () => window.removeEventListener('questaoAdicionadaTeste', handleQuestaoAdicionada);
  }, []);

  const fetchQuestoesIndividuais = async () => {
    try {
      const token = localStorage.getItem('comaes_token');
      const apiBase = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`;
      
      // ✅ Buscar questões de teste conhecimento (todas as ativas)
      const response = await fetch(`${apiBase}/api/teste-conhecimento/questoes?ativo=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      // A resposta pode ser { success: true, data: [...] } ou { success: true, dados: [...] }
      const questoes = data.data || data.dados || [];
      
      // Log para debug das questões
      console.log('📌 Questões carregadas:', questoes.map(q => ({
        id: q.id,
        enunciado: q.enunciado?.substring(0, 30),
        autor_nome: q.autor_nome,
        autor_id: q.autor_id,
        criado_por: q.criado_por
      })));
      
      setQuestoesIndividuais(questoes);
    } catch (error) {
      console.error('Erro ao buscar questões:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlocos = async () => {
    try {
      const token = localStorage.getItem('comaes_token');
      const apiBase = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`;
      
      console.log('🔍 Buscando blocos para testes...');
      
      // Tentar endpoint SEM filtro de status primeiro
      let response = await fetch(`${apiBase}/api/blocos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        console.warn('⚠️ Endpoint /api/blocos falhou, tentando com status=publicado');
        response = await fetch(`${apiBase}/api/blocos?status=publicado`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const blocosData = data.dados || data.data || [];
      
      console.log('✅ Blocos encontrados:', blocosData.length);
      blocosData.forEach(b => {
        console.log(`  - ${b.titulo} (${b.questoes?.length || 0} questões)`);
      });
      
      setBlocos(blocosData);
    } catch (error) {
      console.error('❌ Erro ao buscar blocos:', error);
      console.error('📊 Detalhes do erro:', error.message);
      setBlocos([]);
    }
  };

  // ✅ Agrupar em Bloco
  const handleAgruparEmBloco = async (blocoId) => {
    if (!questaoSelecionada || !blocoId) return;
    
    setSalvando(true);
    try {
      const token = localStorage.getItem('comaes_token');
      const apiBase = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`;
      
      const response = await fetch(`${apiBase}/api/blocos/${blocoId}/questoes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          questao_id: questaoSelecionada.id
        })
      });

      if (response.ok) {
        showFeedback('success', `✅ Questão adicionada ao bloco!`);
        setModalAgruparAberto(false);
        setQuestaoSelecionada(null);
        setTimeout(() => {
          fetchQuestoesIndividuais();
          fetchBlocos();
        }, 1500);
      } else {
        const errorData = await response.json();
        showFeedback('error', `❌ Erro: ${errorData?.mensagem || 'Erro ao agrupar'}`);
      }
    } catch (error) {
      showFeedback('error', `❌ Erro: ${error.message}`);
    } finally {
      setSalvando(false);
    }
  };

  // ✅ Editar Questão
  const handleEditarQuestao = (questao) => {
    setQuestaoSelecionada(questao);
    setModalEditarAberto(true);
  };

  // ✅ Salvar Edição da Questão
  const handleSalvarEdicaoQuestao = async (dadosEditados) => {
    if (!questaoSelecionada) return;
    
    setSalvando(true);
    try {
      const token = localStorage.getItem('comaes_token');
      const apiBase = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`;
      
      const response = await fetch(`${apiBase}/api/teste-conhecimento/questoes/${questaoSelecionada.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosEditados)
      });

      if (response.ok) {
        showFeedback('success', `✅ Questão atualizada!`);
        setModalEditarAberto(false);
        setQuestaoSelecionada(null);
        setTimeout(() => {
          fetchQuestoesIndividuais();
        }, 1500);
      } else {
        const errorData = await response.json();
        showFeedback('error', `❌ Erro: ${errorData?.mensagem || 'Erro ao editar'}`);
      }
    } catch (error) {
      showFeedback('error', `❌ Erro: ${error.message}`);
    } finally {
      setSalvando(false);
    }
  };

  // ✅ Deletar Questão
  const handleDeletarQuestao = async () => {
    if (!questaoSelecionada) return;
    
    setSalvando(true);
    try {
      const token = localStorage.getItem('comaes_token');
      const apiBase = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`;
      
      const response = await fetch(`${apiBase}/api/teste-conhecimento/questoes/${questaoSelecionada.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        showFeedback('success', `✅ Questão deletada!`);
        setModalDeletarAberto(false);
        setQuestaoSelecionada(null);
        setTimeout(() => {
          fetchQuestoesIndividuais();
        }, 1500);
      } else {
        showFeedback('error', '❌ Erro ao deletar questão');
      }
    } catch (error) {
      showFeedback('error', `❌ Erro: ${error.message}`);
    } finally {
      setSalvando(false);
    }
  };

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleCreateQuestaoSuccess = async (novaQuestao) => {
    setQuestoesIndividuais(prev => [...prev, novaQuestao]);
    setShowCreateForm(false);
  };

  const filteredQuestoes = questoesIndividuais.filter(q =>
    q.enunciado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (showCreateForm) {
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showCreateForm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feedback */}
      {feedback && (
        <div className={`px-4 py-3 rounded-xl text-sm flex items-center gap-2 border ${
          feedback.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.msg}</span>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            Questões dos Testes
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie questões individuais e blocos para seus testes de conhecimento
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Pesquisar questões ou blocos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* SUB-ABAS UNIFICADAS */}
      <div className="flex gap-3 border-b border-gray-200">
        <button
          onClick={() => setAbaAtiva('blocos')}
          className={`px-6 py-3 font-semibold flex items-center gap-2 transition-colors border-b-2 ${
            abaAtiva === 'blocos'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          <Package className="w-5 h-5" />
          Gerenciar Blocos
        </button>
        <button
          onClick={() => setAbaAtiva('individuais')}
          className={`px-6 py-3 font-semibold flex items-center gap-2 transition-colors border-b-2 ${
            abaAtiva === 'individuais'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          Visualizar Todas
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <div>
          {/* ABA 1: GERENCIAR BLOCOS (PRINCIPAL) */}
          {abaAtiva === 'blocos' && (
            <div>
              <BlocoQuestoesManager contexto="teste" />
            </div>
          )}

          {/* ABA 2: VISUALIZAR TODAS AS QUESTÕES INDIVIDUAIS */}
          {abaAtiva === 'individuais' && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-300 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                  <BookOpen className="w-7 h-7" />
                  Visualizar Todas as Questões
                </h2>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Nova Questão
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Questões individuais criadas localmente + questões dos colaboradores direcionadas para esta aba. Você pode usá-las diretamente em testes ou agrupá-las em blocos.
              </p>

              {/* Tabela de Questões Individuais */}
              <div className="overflow-x-auto bg-white rounded-lg border border-blue-200">
                {filteredQuestoes.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-semibold">Nenhuma questão criada</p>
                    <p className="text-sm text-gray-500 mt-2">Clique em "Nova Questão" ou acesse "Questões dos Colaboradores" para enviar questões</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-blue-100 border-b-2 border-blue-300">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-900">Enunciado</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-900">Categoria</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-900">Dificuldade</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-900">Origem</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-blue-900">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-100">
                      {filteredQuestoes.map(questao => (
                        <tr key={questao.id} className="hover:bg-blue-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs truncate">{questao.enunciado}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                              {questao.categoria}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              questao.dificuldade === 'facil' ? 'bg-green-100 text-green-700' :
                              questao.dificuldade === 'medio' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {questao.dificuldade?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {questao.autor_nome ? (
                              <span className="px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-700">
                                👤 {questao.autor_nome}
                              </span>
                            ) : questao.criado_por ? (
                              <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-700">
                                ✍️ {questao.criado_por}
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700">
                                ⚙️ Sistema
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  setQuestaoSelecionada(questao);
                                  setModalAgruparAberto(true);
                                }}
                                className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors" 
                                title="Agrupar em Bloco"
                              >
                                <Layers className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleEditarQuestao(questao)}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors" 
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  setQuestaoSelecionada(questao);
                                  setModalDeletarAberto(true);
                                }}
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors" 
                                title="Deletar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                <div className="bg-blue-100 rounded p-3">
                  <p className="text-xs font-semibold text-blue-700">Total Individuais</p>
                  <p className="text-2xl font-bold text-blue-900">{questoesIndividuais.length}</p>
                </div>
                <div className="bg-blue-200 rounded p-3">
                  <p className="text-xs font-semibold text-blue-800">Do Banco de Colaboradores</p>
                  <p className="text-2xl font-bold text-blue-900">{questoesIndividuais.filter(q => q.autor_nome).length}</p>
                </div>
                <div className="bg-blue-300 rounded p-3">
                  <p className="text-xs font-semibold text-blue-900">Criadas Localmente</p>
                  <p className="text-2xl font-bold text-blue-900">{questoesIndividuais.filter(q => !q.autor_nome).length}</p>
                </div>
              </div>
            </div>
          )}
        </div>

      {/* MODAL: Agrupar em Bloco */}
      {modalAgruparAberto && questaoSelecionada && (
        <div className="fixed inset-0 top-0 left-0 w-full h-screen bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-green-600" />
                Agrupar em Bloco
              </h2>
              <button
                onClick={() => {
                  setModalAgruparAberto(false);
                  setQuestaoSelecionada(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
              <p className="text-sm text-gray-700">
                <strong>Questão:</strong> {questaoSelecionada.enunciado}
              </p>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Selecione um bloco para agrupar esta questão:
            </p>

            {blocos.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-semibold">Nenhum bloco disponível</p>
                <p className="text-xs text-gray-500 mt-1">Crie um bloco primeiro na aba "Gerenciar Blocos"</p>
              </div>
            ) : (
              <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
                {blocos.map(bloco => (
                  <button
                    key={bloco.id}
                    onClick={() => handleAgruparEmBloco(bloco.id)}
                    disabled={salvando}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors disabled:opacity-50"
                  >
                    <p className="font-semibold text-gray-900">{bloco.titulo}</p>
                    <p className="text-xs text-gray-500">
                      {bloco.questoes?.length || 0} questões · {bloco.categoria?.toUpperCase() || 'Sem categoria'}
                    </p>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setModalAgruparAberto(false);
                setQuestaoSelecionada(null);
              }}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Editar Questão */}
      {modalEditarAberto && questaoSelecionada && (
        <div className="fixed inset-0 top-0 left-0 w-full h-screen bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                Editar Questão
              </h2>
              <button
                onClick={() => {
                  setModalEditarAberto(false);
                  setQuestaoSelecionada(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Enunciado */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Enunciado</label>
                <textarea
                  defaultValue={questaoSelecionada.enunciado}
                  onChange={(e) => {
                    questaoSelecionada.enunciado = e.target.value;
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria</label>
                <select
                  defaultValue={questaoSelecionada.categoria}
                  onChange={(e) => {
                    questaoSelecionada.categoria = e.target.value;
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>MATEMATICA</option>
                  <option>PORTUGUES</option>
                  <option>HISTORIA</option>
                  <option>GEOGRAFIA</option>
                  <option>CIENCIAS</option>
                  <option>INGLES</option>
                </select>
              </div>

              {/* Dificuldade */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dificuldade</label>
                <select
                  defaultValue={questaoSelecionada.dificuldade}
                  onChange={(e) => {
                    questaoSelecionada.dificuldade = e.target.value;
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="facil">Fácil</option>
                  <option value="medio">Médio</option>
                  <option value="dificil">Difícil</option>
                </select>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setModalEditarAberto(false);
                    setQuestaoSelecionada(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    handleSalvarEdicaoQuestao({
                      enunciado: questaoSelecionada.enunciado,
                      categoria: questaoSelecionada.categoria,
                      dificuldade: questaoSelecionada.dificuldade
                    });
                  }}
                  disabled={salvando}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Deletar Questão */}
      {modalDeletarAberto && questaoSelecionada && (
        <div className="fixed inset-0 top-0 left-0 w-full h-screen bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Confirmar Deleção
            </h2>

            <p className="text-gray-600 mb-6">
              Tem certeza que deseja deletar a questão <strong>"{questaoSelecionada.enunciado.substring(0, 50)}..."</strong>? Esta ação não pode ser desfeita.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setModalDeletarAberto(false);
                  setQuestaoSelecionada(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletarQuestao}
                disabled={salvando}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {salvando ? 'Deletando...' : 'Deletar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Criar Questão de Teste */}
      {showCreateForm && (
        <div className="fixed inset-0 top-0 left-0 w-full h-screen bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full shadow-xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Criar Questão de Teste</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              <CreateQuestaoTesteForm
                onClose={() => setShowCreateForm(false)}
                onSuccess={handleCreateQuestaoSuccess}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestoesTestesTab;
