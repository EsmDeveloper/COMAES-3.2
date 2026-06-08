import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Plus, Edit2, Trash2, Eye, Send } from 'lucide-react';

const ColaboradorDashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [questoes, setQuestoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('minhas-questoes');
  const [showNewQuestaoModal, setShowNewQuestaoModal] = useState(false);
  
  // Estados do formulário de nova questão
  const [formData, setFormData] = useState({
    titulo: '',
    enunciado: '',
    disciplina: '',
    dificuldade: '',
    opcoes: '',
    resposta_correta: '',
    explicacao: '',
    pontos: 10,
    tipo: 'multipla_escolha'
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    fetchQuestoes();
  }, []);

  const fetchQuestoes = async () => {
    try {
      setLoading(true);
      // Buscar questões do colaborador do endpoint específico
      const apiBase = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`;
      const response = await fetch(`${apiBase}/api/colaborador/questoes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      // Extrair questões do response (pode ser data.questoes ou data.dados.questoes)
      const questoesList = data.questoes || data.dados?.questoes || [];
      setQuestoes(questoesList);
    } catch (error) {
      console.error('Erro ao buscar questões:', error);
      setQuestoes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSubmitError('');
  };

  const handleSubmitQuestao = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');
    setSubmitLoading(true);

    try {
      // Validações
      if (!formData.titulo.trim()) {
        throw new Error('Título da questão é obrigatório');
      }
      if (!formData.enunciado.trim()) {
        throw new Error('Enunciado da questão é obrigatório');
      }
      if (!formData.disciplina) {
        throw new Error('Disciplina é obrigatória');
      }
      if (!formData.dificuldade) {
        throw new Error('Dificuldade é obrigatória');
      }
      if (!formData.opcoes.trim()) {
        throw new Error('Opções de resposta são obrigatórias');
      }
      if (!formData.resposta_correta.trim()) {
        throw new Error('Resposta correta é obrigatória');
      }

      // Processar opções
      const opcoes = formData.opcoes.split('|').map(o => o.trim()).filter(o => o);
      if (opcoes.length < 2) {
        throw new Error('Mínimo de 2 opções de resposta');
      }

      // Verificar se resposta correta está nas opções
      if (!opcoes.includes(formData.resposta_correta.trim())) {
        throw new Error('Resposta correta deve estar entre as opções');
      }

      const apiBase = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`;
      
      const response = await fetch(`${apiBase}/api/colaborador/questoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          titulo: formData.titulo.trim(),
          enunciado: formData.enunciado.trim(),
          descricao: formData.enunciado.trim(), // Alguns endpoints usam descricao
          disciplina: formData.disciplina,
          dificuldade: formData.dificuldade,
          tipo: formData.tipo,
          opcoes: opcoes,
          resposta_correta: formData.resposta_correta.trim(),
          explicacao: formData.explicacao.trim() || null,
          pontos: parseInt(formData.pontos) || 10
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || data.message || 'Erro ao criar questão');
      }

      // Sucesso
      setSubmitSuccess('✅ Questão criada com sucesso! Aguarde a revisão do administrador.');
      
      // Resetar formulário
      setFormData({
        titulo: '',
        enunciado: '',
        disciplina: '',
        dificuldade: '',
        opcoes: '',
        resposta_correta: '',
        explicacao: '',
        pontos: 10,
        tipo: 'multipla_escolha'
      });

      // Recarregar questões
      await fetchQuestoes();

      // Limpar mensagem após 3 segundos
      setTimeout(() => {
        setSubmitSuccess('');
        setActiveTab('minhas-questoes');
      }, 3000);
    } catch (error) {
      setSubmitError(error.message);
      console.error('Erro ao submeter questão:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.name || user?.nome || 'Colaborador';
  const disciplina = user?.disciplina_colaborador || 'Não informado';

  const questoesPendentes = questoes.filter(q => q.status_aprovacao === 'pendente');
  const questoesAprovadas = questoes.filter(q => q.status_aprovacao === 'aprovada');

  return (
    <div className="colaborador-dashboard">
      {/* Header */}
      <header className="colaborador-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="header-title">🎓 Painel do Colaborador</h1>
            <p className="header-subtitle">Bem-vindo, {displayName}</p>
          </div>
          <div className="header-right">
            <button onClick={handleLogout} className="logout-button">
              <LogOut size={20} />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="colaborador-main">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-info">
            <div className="profile-avatar">{displayName.charAt(0).toUpperCase()}</div>
            <div className="profile-details">
              <h2>{displayName}</h2>
              <p>Email: {user?.email}</p>
              <p>Disciplina: {disciplina}</p>
              <p className="profile-status">✅ Colaborador Aprovado</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3 className="stat-number">{questoesAprovadas.length}</h3>
            <p className="stat-label">Questões Aprovadas</p>
          </div>
          <div className="stat-card warning">
            <h3 className="stat-number">{questoesPendentes.length}</h3>
            <p className="stat-label">Questões em Revisão</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-number">{questoes.length}</h3>
            <p className="stat-label">Total de Questões</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <div className="tabs-header">
            <button
              className={`tab-button ${activeTab === 'minhas-questoes' ? 'active' : ''}`}
              onClick={() => setActiveTab('minhas-questoes')}
            >
              📋 Minhas Questões
            </button>
            <button
              className={`tab-button ${activeTab === 'submeter' ? 'active' : ''}`}
              onClick={() => setActiveTab('submeter')}
            >
              ➕ Submeter Questão
            </button>
            <button
              className={`tab-button ${activeTab === 'dados' ? 'active' : ''}`}
              onClick={() => setActiveTab('dados')}
            >
              ⚙️ Meus Dados
            </button>
          </div>

          {/* Tab Content */}
          <div className="tabs-content">
            {/* Minhas Questões */}
            {activeTab === 'minhas-questoes' && (
              <div className="tab-pane">
                <h3 className="tab-title">Minhas Questões</h3>
                
                {loading ? (
                  <div className="loading">Carregando...</div>
                ) : questoes.length === 0 ? (
                  <div className="empty-state">
                    <p>Você ainda não submeteu nenhuma questão</p>
                    <button 
                      className="primary-button"
                      onClick={() => setActiveTab('submeter')}
                    >
                      Submeter Primeira Questão
                    </button>
                  </div>
                ) : (
                  <div className="questoes-list">
                      <div className="questoes-section">
                        <h4 className="section-title">✅ Questões Aprovadas ({questoesAprovadas.length})</h4>
                        <div className="questoes-cards">
                          {questoesAprovadas.map(questao => (
                            <div key={questao.id} className="questao-card approved">
                              <div className="questao-header">
                                <span className="questao-status">✅ Aprovada</span>
                              </div>
                              <p className="questao-text">{questao.enunciado?.substring(0, 100) || questao.descricao?.substring(0, 100)}...</p>
                              <div className="questao-meta">
                                <span>{questao.disciplina}</span>
                                <span>{questao.dificuldade}</span>
                              </div>
                              <div className="questao-actions">
                                <button className="btn-icon" title="Visualizar">
                                  <Eye size={16} />
                                </button>
                                <button className="btn-icon" title="Editar">
                                  <Edit2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    {questoesPendentes.length > 0 && (
                      <div className="questoes-section">
                        <h4 className="section-title">⏳ Questões em Revisão ({questoesPendentes.length})</h4>
                        <div className="questoes-cards">
                          {questoesPendentes.map(questao => (
                            <div key={questao.id} className="questao-card pending">
                              <div className="questao-header">
                                <span className="questao-status">⏳ Pendente</span>
                              </div>
                              <p className="questao-text">{questao.enunciado?.substring(0, 100) || questao.descricao?.substring(0, 100)}...</p>
                              <div className="questao-meta">
                                <span>{questao.disciplina}</span>
                                <span>{questao.dificuldade}</span>
                              </div>
                              <div className="questao-actions">
                                <button className="btn-icon" title="Visualizar">
                                  <Eye size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Submeter Questão */}
            {activeTab === 'submeter' && (
              <div className="tab-pane">
                <h3 className="tab-title">Submeter Nova Questão</h3>
                
                {submitSuccess && (
                  <div className="success-message">
                    {submitSuccess}
                  </div>
                )}
                
                {submitError && (
                  <div className="error-message">
                    ❌ {submitError}
                  </div>
                )}

                <div className="form-container">
                  <form className="questao-form" onSubmit={handleSubmitQuestao}>
                    <div className="form-group">
                      <label>Título da Questão *</label>
                      <input 
                        type="text"
                        name="titulo"
                        value={formData.titulo}
                        onChange={handleInputChange}
                        placeholder="Ex: Resolva a equação..."
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Enunciado da Questão *</label>
                      <textarea 
                        name="enunciado"
                        rows="5"
                        value={formData.enunciado}
                        onChange={handleInputChange}
                        placeholder="Digite a questão completa..."
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Disciplina *</label>
                        <select 
                          name="disciplina"
                          value={formData.disciplina}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Selecionar...</option>
                          <option value="matematica">Matemática</option>
                          <option value="ingles">Inglês</option>
                          <option value="programacao">Programação</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Dificuldade *</label>
                        <select 
                          name="dificuldade"
                          value={formData.dificuldade}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Selecionar...</option>
                          <option value="facil">Fácil</option>
                          <option value="medio">Médio</option>
                          <option value="dificil">Difícil</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Pontos</label>
                        <input 
                          type="number"
                          name="pontos"
                          value={formData.pontos}
                          onChange={handleInputChange}
                          min="1"
                          max="100"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Opções de Resposta (separadas por |) *</label>
                      <textarea 
                        name="opcoes"
                        rows="3"
                        value={formData.opcoes}
                        onChange={handleInputChange}
                        placeholder="Opção 1 | Opção 2 | Opção 3 | Opção 4"
                        required
                      />
                      <small>Digite cada opção separada por | (pipe)</small>
                    </div>

                    <div className="form-group">
                      <label>Resposta Correta *</label>
                      <input 
                        type="text"
                        name="resposta_correta"
                        value={formData.resposta_correta}
                        onChange={handleInputChange}
                        placeholder="Digite a opção correta exatamente como aparece acima"
                        required
                      />
                      <small>Deve ser idêntica a uma das opções acima</small>
                    </div>

                    <div className="form-group">
                      <label>Explicação (Opcional)</label>
                      <textarea 
                        name="explicacao"
                        rows="3"
                        value={formData.explicacao}
                        onChange={handleInputChange}
                        placeholder="Explique por que esta é a resposta correta..."
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="primary-button"
                      disabled={submitLoading}
                    >
                      <Send size={18} />
                      {submitLoading ? 'Enviando...' : 'Submeter Questão'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Meus Dados */}
            {activeTab === 'dados' && (
              <div className="tab-pane">
                <h3 className="tab-title">Meus Dados</h3>
                <div className="dados-container">
                  <div className="dado-row">
                    <span className="dado-label">Nome:</span>
                    <span className="dado-value">{displayName}</span>
                  </div>
                  <div className="dado-row">
                    <span className="dado-label">Email:</span>
                    <span className="dado-value">{user?.email}</span>
                  </div>
                  <div className="dado-row">
                    <span className="dado-label">Disciplina:</span>
                    <span className="dado-value">{disciplina}</span>
                  </div>
                  <div className="dado-row">
                    <span className="dado-label">Nível Acadêmico:</span>
                    <span className="dado-value">{user?.nivel_academico || 'Não informado'}</span>
                  </div>
                  <div className="dado-row">
                    <span className="dado-label">Status:</span>
                    <span className="dado-value status">✅ Aprovado</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ColaboradorDashboard;
