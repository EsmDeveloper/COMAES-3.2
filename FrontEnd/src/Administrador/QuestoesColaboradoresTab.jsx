import { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Search, ChevronDown, CheckCircle, Send, MoreVertical, Copy, FileText, Trophy, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import adminService from './adminService';
import { useAuth } from '../context/AuthContext';

const QuestoesColaboradoresTab = () => {
  const { token } = useAuth();
  const svc = adminService(token);
  
  const [questoes, setQuestoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedQuestoes, setExpandedQuestoes] = useState({});
  const [feedback, setFeedback] = useState(null);
  
  // Estados para modais
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalTorneioOpen, setModalTorneioOpen] = useState(false);
  const [modalTesteOpen, setModalTesteOpen] = useState(false);
  const [modalAutorOpen, setModalAutorOpen] = useState(false);
  const [selectedQuestao, setSelectedQuestao] = useState(null);

  useEffect(() => {
    fetchQuestoes();
    // Não fazer polling automático para evitar pisca
    // O usuário pode clicar no botão "Atualizar" manualmente
  }, []);

  // Desabilitar scroll quando modal está aberto
  useEffect(() => {
    const isModalOpen = modalEditOpen || modalTorneioOpen || modalTesteOpen || modalAutorOpen;
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [modalEditOpen, modalTorneioOpen, modalTesteOpen, modalAutorOpen]);

  const fetchQuestoes = async () => {
    try {
      setLoading(true);
      setFeedback(null); // ✅ Limpar feedback anterior
      
      const apiBase = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`;
      const token_val = localStorage.getItem('comaes_token');
      
      if (!token_val) {
        console.warn('⚠️ Nenhum token encontrado em localStorage');
        setFeedback({ type: 'error', msg: 'Autenticação necessária' });
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${apiBase}/api/questoes?status_aprovacao=aprovada&limit=100`, {
        headers: { 
          'Authorization': `Bearer ${token_val}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error(`❌ Erro ${response.status}: ${response.statusText}`);
        const error = await response.json().catch(() => ({}));
        console.error('Resposta de erro:', error);
        setFeedback({ type: 'error', msg: `Erro ${response.status}: Falha ao carregar questões` });
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      const questoesData = data?.dados?.questoes || [];
      setQuestoes(questoesData);
      console.log('✅ Questões aprovadas carregadas:', questoesData.length);
      
      if (questoesData.length === 0) {
        console.log('⚠️ Nenhuma questão aprovada encontrada');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar questões aprovadas:', error);
      setFeedback({ type: 'error', msg: `Erro ao carregar: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id) => {
    setExpandedQuestoes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleEditarQuestao = async (questao) => {
    try {
      console.log('✏️ Editando questão:', questao.id);
      setSelectedQuestao(questao);
      setModalEditOpen(true);
    } catch (err) {
      showFeedback('error', 'Erro ao editar questão');
    }
  };

  const handleVerAutor = async (questao) => {
    try {
      console.log('👤 Visualizando autor:', questao.autor_id);
      setSelectedQuestao(questao);
      setModalAutorOpen(true);
    } catch (err) {
      showFeedback('error', 'Erro ao visualizar autor');
    }
  };

  const handleAddTorneio = (questao) => {
    console.log('🏆 Enviando questão para Torneio:', questao.id);
    setSelectedQuestao(questao);
    setModalTorneioOpen(true);
  };

  const handleAddTeste = (questao) => {
    console.log('📚 Enviando questão para Teste:', questao.id);
    setSelectedQuestao(questao);
    setModalTesteOpen(true);
  };

  const confirmarEnviarTorneio = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`;
      const token_val = localStorage.getItem('comaes_token');

      // ✅ Salvar questão como questão individual de torneio (sem bloco inicialmente)
      // Isso cria uma questão no modelo Questao com bloco_id = null
      const response = await fetch(`${apiBase}/api/questoes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token_val}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          titulo: selectedQuestao.titulo,
          descricao: selectedQuestao.descricao,
          disciplina: selectedQuestao.disciplina,
          dificuldade: selectedQuestao.dificuldade,
          tipo: selectedQuestao.tipo || 'multipla_escolha',
          opcoes: selectedQuestao.opcoes,
          resposta_correta: selectedQuestao.resposta_correta,
          explicacao: selectedQuestao.explicacao,
          pontos: selectedQuestao.pontos || 10,
          autor_id: selectedQuestao.autor_id,
          // Importante: não definir bloco_id para que apareça em "Questões Individuais"
          bloco_id: null
        })
      });

      if (response.ok) {
        const novaQuestao = await response.json();
        showFeedback('success', `✅ Questão "${selectedQuestao.titulo}" enviada para Questões Individuais de Torneios!`);
        setModalTorneioOpen(false);
        
        // Aguardar um pouco e depois podemos disparar um evento para atualizar a aba
        setTimeout(() => {
          console.log('✅ Questão adicionada a questões individuais de torneios');
          // O admin verá na aba Torneios
          window.dispatchEvent(new CustomEvent('questaoAdicionadaTorneio', { detail: novaQuestao }));
        }, 1500);
      } else {
        const errorData = await response.json();
        showFeedback('error', `❌ Erro: ${errorData?.mensagem || 'Erro ao enviar para torneios'}`);
      }
    } catch (error) {
      console.error('Erro ao enviar para torneios:', error);
      showFeedback('error', `❌ Erro: ${error.message}`);
    }
  };

  const confirmarEnviarTeste = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`;
      const token_val = localStorage.getItem('comaes_token');

      // ✅ Salvar questão como QuestaoTesteConhecimento (independente)
      const response = await fetch(`${apiBase}/api/teste-conhecimento/questoes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token_val}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enunciado: selectedQuestao.titulo,
          opcoes: selectedQuestao.opcoes || [],
          resposta_correta: selectedQuestao.resposta_correta,
          dificuldade: selectedQuestao.dificuldade || 'medio',
          categoria: selectedQuestao.disciplina || 'cultura_geral',
          pontos: selectedQuestao.pontos || 10,
          ativo: true,
          // Metadata para rastreamento
          origem: 'colaborador',
          autor_id: selectedQuestao.autor_id
        })
      });

      if (response.ok) {
        const novaQuestao = await response.json();
        showFeedback('success', `✅ Questão "${selectedQuestao.titulo}" enviada para Questões Individuais de Testes!`);
        setModalTesteOpen(false);
        
        // Aguardar um pouco e depois podemos disparar um evento para atualizar a aba
        setTimeout(() => {
          console.log('✅ Questão adicionada a questões individuais de testes');
          // O admin verá na aba Testes
          window.dispatchEvent(new CustomEvent('questaoAdicionadaTeste', { detail: novaQuestao }));
        }, 1500);
      } else {
        const errorData = await response.json();
        showFeedback('error', `❌ Erro: ${errorData?.mensagem || 'Erro ao enviar para testes'}`);
      }
    } catch (error) {
      console.error('Erro ao enviar para testes:', error);
      showFeedback('error', `❌ Erro: ${error.message}`);
    }
  };

  const handleEditar = (questao) => {
    handleEditarQuestao(questao);
  };

  const handleAutor = (questao) => {
    handleVerAutor(questao);
  };

  const filteredQuestoes = questoes.filter(questao =>
    questao.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    questao.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    questao.autor_nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            : feedback.type === 'info'
            ? 'bg-blue-50 border-blue-200 text-blue-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {feedback.type === 'success' && <CheckCircle size={16} className="flex-shrink-0" />}
          {feedback.type === 'info' && <BookOpen size={16} className="flex-shrink-0" />}
          {feedback.type === 'error' && <AlertCircle size={16} className="flex-shrink-0" />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-green-500" />
            Questões dos Colaboradores
          </h1>
          <p className="text-gray-600 mt-2">
            Banco validado de questões pedagógicas aprovadas — prontas para Torneios e Testes
          </p>
        </div>
        <button
          onClick={fetchQuestoes}
          disabled={loading}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 font-medium"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Pesquisar por título, descrição ou autor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Questões List */}
      <div className="space-y-4">
        {filteredQuestoes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">Nenhuma questão de colaborador aprovada encontrada</p>
          </div>
        ) : (
          filteredQuestoes.map(questao => (
            <div key={questao.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Header da Questão */}
              <button
                onClick={() => toggleExpanded(questao.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 text-left">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{questao.titulo}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1">{questao.descricao}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right mr-4">
                    <div className="flex gap-2 flex-wrap justify-end">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                        {questao.disciplina?.toUpperCase() || 'N/A'}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        questao.dificuldade === 'facil' ? 'bg-green-100 text-green-700' :
                        questao.dificuldade === 'medio' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {questao.dificuldade?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedQuestoes[questao.id] ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Detalhes Expandidos */}
              {expandedQuestoes[questao.id] && (
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Informações da Questão</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-gray-600">ID</p>
                          <p className="font-medium text-gray-900">{questao.id}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Tipo</p>
                          <p className="font-medium text-gray-900">{questao.tipo || 'multipla_escolha'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Pontos</p>
                          <p className="font-medium text-gray-900">{questao.pontos || 10}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Informações do Colaborador</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-gray-600">Autor</p>
                          <p className="font-medium text-gray-900">{questao.autor_nome || 'Sem informação'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Status</p>
                          <p className="font-medium text-green-600">✓ Aprovada</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Data de Criação</p>
                          <p className="font-medium text-gray-900">
                            {new Date(questao.created_at || questao.createdAt).toLocaleDateString('pt-PT')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Descrição</h4>
                    <p className="text-gray-700 text-sm">{questao.descricao}</p>
                  </div>

                  {questao.resposta_correta && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Resposta Correta</h4>
                      <p className="text-gray-700 text-sm bg-white p-2 rounded border border-gray-200">
                        {questao.resposta_correta}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-gray-200 flex-wrap">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEditar(questao);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      Editar
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddTorneio(questao);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                    >
                      🏆 Enviar a Torneio
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddTeste(questao);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      📚 Enviar a Teste
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAutor(questao);
                      }}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Users className="w-4 h-4" />
                      Ver Autor
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-600 font-semibold">Total Aprovadas</p>
          <p className="text-3xl font-bold text-green-900">{filteredQuestoes.length}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-600 font-semibold">Disciplinas</p>
          <p className="text-3xl font-bold text-blue-900">
            {new Set(filteredQuestoes.map(q => q.disciplina)).size}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-purple-600 font-semibold">Colaboradores</p>
          <p className="text-3xl font-bold text-purple-900">
            {new Set(filteredQuestoes.map(q => q.autor_id)).size}
          </p>
        </div>
      </div>

      {/* Guia de Fluxo */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          Como adicionar questões aos Torneios ou Testes?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-purple-600" />
              Para Torneios:
            </h4>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Clique em "Adicionar a Torneio" abaixo</li>
              <li>Selecione ou crie um Bloco de Questões</li>
              <li>Associe o bloco a um Torneio</li>
              <li>O bloco ficará disponível no quiz do torneio</li>
            </ol>
          </div>
          <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Para Testes:
            </h4>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Clique em "Adicionar a Teste" abaixo</li>
              <li>Escolha uma categoria de teste</li>
              <li>Configure dificuldade e tempo</li>
              <li>A questão ficará disponível nos testes</li>
            </ol>
          </div>
        </div>
      </div>

      {/* MODAL: Editar Questão */}
      {modalEditOpen && selectedQuestao && (
        <div className="fixed inset-0 top-0 left-0 w-full h-screen bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Editar Questão</h2>
            <p className="text-gray-600 mb-4">
              Questão ID: <span className="font-semibold">{selectedQuestao.id}</span>
            </p>
            <p className="text-gray-700 mb-6">
              <strong>Título:</strong> {selectedQuestao.titulo}
            </p>
            <p className="text-sm text-gray-600 mb-6">
              A funcionalidade de edição avançada está em desenvolvimento. Use a aba <strong>"Revisão de Questões"</strong> para editar questões.
            </p>
            <button
              onClick={() => setModalEditOpen(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Adicionar a Torneio */}
      {modalTorneioOpen && selectedQuestao && (
        <div className="fixed inset-0 top-0 left-0 w-full h-screen bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Enviar a Torneio
            </h2>
            <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Questão:</strong> {selectedQuestao.titulo}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Criada por:</strong> {selectedQuestao.autor_nome || 'Desconhecido'}
              </p>
            </div>
            <p className="text-gray-600 mb-6">
              Esta questão será adicionada à lista de questões individuais na aba <strong>"Questões de Torneios"</strong>. 
              Você poderá agrupá-la em um bloco (mínimo 5, máximo 30 questões) para vincular a torneios.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setModalTorneioOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setModalTorneioOpen(false);
                  showFeedback('success', `Questão "${selectedQuestao.titulo}" adicionada aos Torneios`);
                  // Aqui você pode adicionar lógica para enviar para o backend
                }}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Adicionar a Teste */}
      {modalTesteOpen && selectedQuestao && (
        <div className="fixed inset-0 top-0 left-0 w-full h-screen bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              Enviar a Teste
            </h2>
            <div className="bg-purple-50 p-4 rounded-lg mb-6 border border-purple-200">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Questão:</strong> {selectedQuestao.enunciado || selectedQuestao.titulo}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Criada por:</strong> {selectedQuestao.autor_nome || 'Desconhecido'}
              </p>
            </div>
            <p className="text-gray-600 mb-6">
              Esta questão será adicionada à lista de questões individuais na aba <strong>"Questões dos Testes"</strong>. 
              Você poderá agrupá-la em um bloco com outras questões se necessário.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setModalTesteOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setModalTesteOpen(false);
                  showFeedback('success', `Questão adicionada aos Testes`);
                  // Aqui você pode adicionar lógica para enviar para o backend
                }}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Ver Autor */}
      {modalAutorOpen && selectedQuestao && (
        <div className="fixed inset-0 top-0 left-0 w-full h-screen bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Informações do Colaborador
            </h2>
            <div className="space-y-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Nome do Colaborador</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedQuestao.autor_nome || 'Sem informação'}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Questão</p>
                <p className="text-gray-900">{selectedQuestao.titulo}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Disciplina</p>
                <p className="text-gray-900">{selectedQuestao.disciplina?.toUpperCase()}</p>
              </div>
            </div>
            <button
              onClick={() => setModalAutorOpen(false)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestoesColaboradoresTab;
