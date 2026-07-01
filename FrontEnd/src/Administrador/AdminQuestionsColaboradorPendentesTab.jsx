/**
 * AdminQuestionsColaboradorPendentesTab.jsx - FASE 3
 * 
 * Admin interface for reviewing and approving/rejecting questões created by colaboradores
 * Similar structure to AdminBlocosColaboradoresPendentesTab but for questions
 */

import { useState, useEffect } from 'react';
import {
  Loader, Check, X, Eye, AlertCircle, CheckCircle, Clock, Search
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'pendente':
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
          <Clock size={14} /> Pendente
        </span>
      );
    case 'aprovada':
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          <CheckCircle size={14} /> Aprovada
        </span>
      );
    case 'rejeitada':
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
          <AlertCircle size={14} /> Rejeitada
        </span>
      );
    default:
      return null;
  }
};

const ApprovalModal = ({ questao, onApprove, onCancel, carregando }) => {
  const [observacoes, setObservacoes] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-96 overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Aprovar Questão</h3>
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-2">{questao.titulo}</p>
            <p className="text-xs text-blue-800 mb-2">Tipo: <span className="capitalize">{questao.tipo}</span></p>
            <p className="text-xs text-blue-700">Por: <span className="font-semibold">{questao.autor?.name}</span></p>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Observações (Opcional)</label>
            <textarea
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              placeholder="Digite suas observações..."
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onApprove(questao.id, observacoes)}
              disabled={carregando}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2"
            >
              {carregando ? <Loader size={18} className="animate-spin" /> : <Check size={18} />}
              Aprovar
            </button>
            <button
              onClick={onCancel}
              disabled={carregando}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RejectionModal = ({ questao, onReject, onCancel, carregando }) => {
  const [motivo, setMotivo] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-96 overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Rejeitar Questão</h3>
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-red-900 mb-2">{questao.titulo}</p>
            <p className="text-xs text-red-800">Por: <span className="font-semibold">{questao.autor?.name}</span></p>
          </div>
          {erro && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-800 rounded text-sm">{erro}</div>}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Motivo da Rejeição <span className="text-red-600">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={e => { setMotivo(e.target.value); setErro(null); }}
              placeholder="Explique por que esta questão está sendo rejeitada..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Observações (Opcional)</label>
            <textarea
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              placeholder="Deixe sugestões..."
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (!motivo.trim()) { setErro('Motivo é obrigatório'); return; }
                onReject(questao.id, motivo, observacoes);
              }}
              disabled={carregando}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2"
            >
              {carregando ? <Loader size={18} className="animate-spin" /> : <X size={18} />}
              Rejeitar
            </button>
            <button
              onClick={onCancel}
              disabled={carregando}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailsModal = ({ questao, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-96 overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Detalhes da Questão</h3>
          <div className="space-y-4">
            <div><p className="text-sm font-medium text-slate-700">Título</p><p className="text-slate-900">{questao.titulo}</p></div>
            <div><p className="text-sm font-medium text-slate-700">Descrição</p><p className="text-slate-900 whitespace-pre-wrap">{questao.descricao}</p></div>
            <div><p className="text-sm font-medium text-slate-700">Tipo</p><p className="text-slate-900 capitalize">{questao.tipo}</p></div>
            <div><p className="text-sm font-medium text-slate-700">Dificuldade</p><p className="text-slate-900 capitalize">{questao.dificuldade}</p></div>
            <div><p className="text-sm font-medium text-slate-700">Pontos</p><p className="text-slate-900">{questao.pontos}</p></div>
            <div><p className="text-sm font-medium text-slate-700">Colaborador</p><p className="text-slate-900">{questao.autor?.name}</p></div>
            {questao.motivo_rejeicao && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-900 mb-1">Motivo da Rejeição</p>
                <p className="text-sm text-red-800">{questao.motivo_rejeicao}</p>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-6 rounded-lg">
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminQuestionsColaboradorPendentesTab = ({ token }) => {
  const [questoes, setQuestoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [stats, setStats] = useState({ pendentes: 0, aprovadas: 0, rejeitadas: 0 });

  const [filtroStatus, setFiltroStatus] = useState('pendente');
  const [filtroDisciplina, setFiltroDisciplina] = useState('');
  const [filtroDificuldade, setFiltroDificuldade] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const LIMITE = 20;

  const [modalAprovacao, setModalAprovacao] = useState(null);
  const [modalRejeicao, setModalRejeicao] = useState(null);
  const [modalDetalhes, setModalDetalhes] = useState(null);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    fetchQuestoes();
  }, [filtroStatus, filtroDisciplina, filtroDificuldade, filtroTipo, busca, pagina]);

  const fetchQuestoes = async () => {
    try {
      setCarregando(true);
      setErro(null);

      const params = new URLSearchParams({ pagina, limite: LIMITE, status: filtroStatus });
      if (filtroDisciplina) params.append('disciplina', filtroDisciplina);
      if (filtroDificuldade) params.append('dificuldade', filtroDificuldade);
      if (filtroTipo) params.append('tipo', filtroTipo);
      if (busca) params.append('busca', busca);

      const response = await fetch(
        `${API_BASE}/api/admin/questoes-colaborador-pendentes?${params}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Falha ao carregar questões');

      const data = await response.json();
      setQuestoes(data.dados?.questoes || []);
      setStats(data.dados?.estatisticas || {});
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleApprove = async (questaoId, observacoes) => {
    try {
      setProcessando(true);
      const response = await fetch(`${API_BASE}/api/admin/questoes/${questaoId}/aprovar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ observacoes: observacoes || undefined })
      });
      if (!response.ok) throw new Error('Falha ao aprovar');
      setModalAprovacao(null);
      fetchQuestoes();
    } catch (err) {
      setErro(err.message);
    } finally {
      setProcessando(false);
    }
  };

  const handleReject = async (questaoId, motivo, observacoes) => {
    try {
      setProcessando(true);
      const response = await fetch(`${API_BASE}/api/admin/questoes/${questaoId}/rejeitar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo_rejeicao: motivo, observacoes: observacoes || undefined })
      });
      if (!response.ok) throw new Error('Falha ao rejeitar');
      setModalRejeicao(null);
      fetchQuestoes();
    } catch (err) {
      setErro(err.message);
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Questões de Colaboradores - Revisão</h2>
        <p className="text-gray-600">Revise e aprove/rejeite questões criadas por colaboradores</p>
      </div>

      {erro && <div className="p-4 bg-red-100 border border-red-400 text-red-800 rounded-lg">{erro}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-800 text-sm font-medium">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.pendentes || 0}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-green-800 text-sm font-medium">Aprovadas</p>
          <p className="text-2xl font-bold text-green-900">{stats.aprovadas || 0}</p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-800 text-sm font-medium">Rejeitadas</p>
          <p className="text-2xl font-bold text-red-900">{stats.rejeitadas || 0}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <select value={filtroStatus} onChange={e => { setFiltroStatus(e.target.value); setPagina(1); }} className="px-4 py-2 border border-gray-300 rounded-lg">
          <option value="todos">Todos os Status</option>
          <option value="pendente">Pendente</option>
          <option value="aprovada">Aprovada</option>
          <option value="rejeitada">Rejeitada</option>
        </select>

        <select value={filtroDisciplina} onChange={e => { setFiltroDisciplina(e.target.value); setPagina(1); }} className="px-4 py-2 border border-gray-300 rounded-lg">
          <option value="">Todas as Disciplinas</option>
          <option value="matematica">Matemática</option>
          <option value="ingles">Inglês</option>
          <option value="programacao">Programação</option>
        </select>

        <select value={filtroDificuldade} onChange={e => { setFiltroDificuldade(e.target.value); setPagina(1); }} className="px-4 py-2 border border-gray-300 rounded-lg">
          <option value="">Todas as Dificuldades</option>
          <option value="facil">Fácil</option>
          <option value="medio">Médio</option>
          <option value="dificil">Difícil</option>
        </select>

        <select value={filtroTipo} onChange={e => { setFiltroTipo(e.target.value); setPagina(1); }} className="px-4 py-2 border border-gray-300 rounded-lg">
          <option value="">Todos os Tipos</option>
          <option value="multipla_escolha">Múltipla Escolha</option>
          <option value="texto">Texto</option>
          <option value="codigo">Código</option>
        </select>

        <div className="flex-1 min-w-64 relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título..."
            value={busca}
            onChange={e => { setBusca(e.target.value); setPagina(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {carregando ? (
        <div className="text-center py-12"><Loader className="animate-spin mx-auto" size={32} /></div>
      ) : questoes.length === 0 ? (
        <div className="text-center py-12 text-gray-600">Nenhuma questão encontrada</div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Título</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Tipo</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Dificuldade</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Status</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-slate-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {questoes.map((q, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm text-gray-800">{q.titulo}</td>
                  <td className="px-6 py-4 text-sm capitalize">{q.tipo.replace('_', ' ')}</td>
                  <td className="px-6 py-4 text-sm capitalize">{q.dificuldade}</td>
                  <td className="px-6 py-4 text-sm"><StatusBadge status={q.status_aprovacao} /></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setModalDetalhes(q)} className="p-2 text-blue-600 hover:bg-blue-100 rounded"><Eye size={18} /></button>
                      {q.status_aprovacao === 'pendente' && (
                        <>
                          <button onClick={() => setModalAprovacao(q)} className="p-2 text-green-600 hover:bg-green-100 rounded"><Check size={18} /></button>
                          <button onClick={() => setModalRejeicao(q)} className="p-2 text-red-600 hover:bg-red-100 rounded"><X size={18} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAprovacao && <ApprovalModal questao={modalAprovacao} onApprove={handleApprove} onCancel={() => setModalAprovacao(null)} carregando={processando} />}
      {modalRejeicao && <RejectionModal questao={modalRejeicao} onReject={handleReject} onCancel={() => setModalRejeicao(null)} carregando={processando} />}
      {modalDetalhes && <DetailsModal questao={modalDetalhes} onClose={() => setModalDetalhes(null)} />}
    </div>
  );
};

export default AdminQuestionsColaboradorPendentesTab;

