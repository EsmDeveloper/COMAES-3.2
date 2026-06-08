/**
 * ColaboradorBlocosTab.jsx
 * Gestão de Blocos de Questões para Colaboradores
 * - Criar blocos na sua disciplina
 * - Editar blocos pendentes
 * - Adicionar/remover questões dos blocos
 * - Submeter para aprovação do admin
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Plus, Edit, Trash2, Search, Filter, ChevronDown, ChevronUp,
  BookOpen, Layers, AlertCircle, CheckCircle, X, Send, Loader,
} from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;
const MAX_Q = 30;

const DIFICULDADES = [
  { id: 'facil', label: 'Fácil', cor: 'green' },
  { id: 'medio', label: 'Médio', cor: 'yellow' },
  { id: 'dificil', label: 'Difícil', cor: 'red' },
];

const COR_DIF = {
  green: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  red: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
};

// ── Modal de criação/edição de bloco ──────────────────────────────────────────
function BlocoFormModal({ bloco, onClose, onSave, loading, disciplina }) {
  const [titulo, setTitulo] = useState(bloco?.titulo || '');
  const [dificuldade, setDificuldade] = useState(bloco?.dificuldade || 'facil');
  const [descricao, setDescricao] = useState(bloco?.descricao || '');
  const [erro, setErro] = useState('');

  const handleSave = () => {
    if (!titulo.trim()) {
      setErro('O título é obrigatório.');
      return;
    }
    onSave({
      titulo: titulo.trim(),
      dificuldade,
      descricao: descricao.trim() || null,
      disciplina_id: disciplina?.id,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-800">
            {bloco ? 'Editar Bloco' : 'Criar Bloco de Questões'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {erro}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Título *</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Funções Avançadas em Python"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={2}
              placeholder="Descrição opcional do bloco..."
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Dificuldade *</label>
            <select
              value={dificuldade}
              onChange={(e) => setDificuldade(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DIFICULDADES.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <strong>Disciplina:</strong> {disciplina?.name || 'Não definida'}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Este bloco será enviado para aprovação do administrador.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Salvando...' : bloco ? 'Salvar' : 'Criar Bloco'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Card de Bloco ─────────────────────────────────────────────────────────────
function BlocoCard({ bloco, onEdit, onDelete, onAddQuestao, onRemoveQuestao, onSubmit }) {
  const [expandido, setExpandido] = useState(false);

  const dif = DIFICULDADES.find((d) => d.id === bloco.dificuldade);
  const corF = COR_DIF[dif?.cor || 'green'];
  const count = bloco.total_questoes ?? bloco.questoes?.length ?? 0;
  const cheio = count >= MAX_Q;
  const questoes = bloco.questoes || [];
  const podeEditar = bloco.status === 'pendente';

  return (
    <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${corF.bg} ${corF.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${corF.dot}`} />
                {dif?.label}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                bloco.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                bloco.status === 'aprovado' ? 'bg-green-100 text-green-700' :
                'bg-red-100 text-red-700'
              }`}>
                {bloco.status === 'pendente' ? '⏳ Pendente' :
                 bloco.status === 'aprovado' ? '✅ Aprovado' :
                 '❌ Rejeitado'}
              </span>
            </div>
            <h3 className="font-bold text-slate-800 truncate">{bloco.titulo}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              <span className={`font-semibold ${cheio ? 'text-red-600' : 'text-slate-700'}`}>
                {count}
              </span>
              /{MAX_Q} questões
            </p>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {podeEditar && (
              <>
                <button
                  onClick={() => onEdit(bloco)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-white"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(bloco)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            {bloco.status === 'pendente' && count > 0 && (
              <button
                onClick={() => onSubmit(bloco)}
                className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-100"
                title="Enviar para aprovação"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setExpandido((v) => !v)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-white"
            >
              {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${cheio ? 'bg-red-400' : 'bg-blue-400'}`}
            style={{ width: `${Math.min((count / MAX_Q) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Lista de questões */}
      {expandido && (
        <div className="border-t border-blue-200 bg-white/80">
          {questoes.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-slate-400">Nenhuma questão neste bloco.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {questoes.map((q, i) => (
                <div key={q.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-blue-50">
                  <span className="text-xs font-bold text-slate-400 w-5 text-right flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate font-medium">{q.titulo || q.enunciado}</p>
                    <p className="text-xs text-slate-400">{q.dificuldade}</p>
                  </div>
                  {podeEditar && (
                    <button
                      onClick={() => onRemoveQuestao(bloco, q)}
                      className="p-1 rounded text-red-400 hover:bg-red-50"
                      title="Remover do bloco"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {podeEditar && (
            <div className="px-4 py-2 border-t border-slate-100">
              <button
                onClick={() => onAddQuestao(bloco)}
                disabled={cheio}
                className={`w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                  cheio
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                {cheio ? `Limite de ${MAX_Q} questões atingido` : 'Adicionar questão'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function ColaboradorBlocosTab({ token }) {
  const { user } = useAuth();

  // Estado
  const [blocos, setBlocos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtros
  const [filtroStatus, setFiltroStatus] = useState('pendente');

  // Modais
  const [showBlocoForm, setShowBlocoForm] = useState(false);
  const [blocoEditando, setBlocoEditando] = useState(null);
  const [showDeleteBloco, setShowDeleteBloco] = useState(false);
  const [blocoParaDeletar, setBlocoParaDeletar] = useState(null);

  const disciplina = user?.disciplina_colaborador || user?.disciplina;
  const disciplinaId = user?.disciplina_id;

  const showMsg = (msg, isError = false) => {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(''), 4000);
    } else {
      setSuccess(msg);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // ── Carregar blocos do colaborador ────────────────────────────────────────
  const carregarBlocos = useCallback(async () => {
    if (!token || !disciplinaId) return;

    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `${API_BASE}/colaborador/blocos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          params: {
            disciplina_id: disciplinaId,
          },
        }
      );

      const lista = response.data?.blocos || [];
      setBlocos(lista);
    } catch (e) {
      showMsg('Erro ao carregar blocos: ' + (e.response?.data?.mensagem || e.response?.data?.message || e.message), true);
    } finally {
      setLoading(false);
    }
  }, [token, disciplinaId]);

  useEffect(() => {
    carregarBlocos();
  }, [carregarBlocos]);

  // ── Handlers de Bloco ────────────────────────────────────────────────────
  const handleCriarBloco = async (dados) => {
    if (!token || !disciplinaId) return;

    setSaving(true);
    try {
      await axios.post(
        `${API_BASE}/colaborador/blocos`,
        {
          ...dados,
          disciplina_id: disciplinaId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setShowBlocoForm(false);
      showMsg('Bloco criado com sucesso!');
      carregarBlocos();
    } catch (e) {
      showMsg(e.response?.data?.mensagem || e.response?.data?.message || e.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handleEditarBloco = async (dados) => {
    if (!token || !blocoEditando) return;

    setSaving(true);
    try {
      await axios.put(
        `${API_BASE}/colaborador/blocos/${blocoEditando.id}`,
        dados,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setBlocoEditando(null);
      setShowBlocoForm(false);
      showMsg('Bloco atualizado!');
      carregarBlocos();
    } catch (e) {
      showMsg(e.response?.data?.mensagem || e.response?.data?.message || e.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletarBloco = async () => {
    if (!token || !blocoParaDeletar) return;

    setSaving(true);
    try {
      await axios.delete(
        `${API_BASE}/colaborador/blocos/${blocoParaDeletar.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBlocoParaDeletar(null);
      setShowDeleteBloco(false);
      showMsg('Bloco excluído.');
      carregarBlocos();
    } catch (e) {
      showMsg(e.response?.data?.mensagem || e.response?.data?.message || e.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmeterBloco = async (bloco) => {
    if (!token) return;

    setSaving(true);
    try {
      await axios.post(
        `${API_BASE}/colaborador/blocos/${bloco.id}/submeter`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showMsg('Bloco enviado para aprovação!');
      carregarBlocos();
    } catch (e) {
      showMsg(e.response?.data?.mensagem || e.response?.data?.message || e.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoverQuestao = async (bloco, questao) => {
    if (!token) return;

    setSaving(true);
    try {
      await axios.delete(
        `${API_BASE}/colaborador/blocos/${bloco.id}/questoes/${questao.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showMsg('Questão removida do bloco.');
      carregarBlocos();
    } catch (e) {
      showMsg(e.response?.data?.mensagem || e.response?.data?.message || e.message, true);
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const blocosFiltrados = blocos.filter((b) => {
    if (filtroStatus && b.status !== filtroStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Layers className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Meus Blocos de Questões</h2>
              <p className="text-sm text-slate-500">{blocos.length} blocos criados</p>
            </div>
          </div>
          <button
            onClick={() => {
              setBlocoEditando(null);
              setShowBlocoForm(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
          >
            <Layers className="w-4 h-4" /> Criar Bloco
          </button>
        </div>
      </div>

      {/* Mensagens */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-5 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-5 py-3 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Filtro de Status */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os status</option>
            <option value="pendente">⏳ Pendentes</option>
            <option value="aprovado">✅ Aprovados</option>
            <option value="rejeitado">❌ Rejeitados</option>
          </select>
        </div>
      </div>

      {/* Lista de Blocos */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-slate-500">Carregando blocos...</p>
        </div>
      ) : blocosFiltrados.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">
            {filtroStatus ? 'Nenhum bloco encontrado' : 'Você não criou nenhum bloco ainda'}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Crie seu primeiro bloco de questões para começar.
          </p>
          <button
            onClick={() => {
              setBlocoEditando(null);
              setShowBlocoForm(true);
            }}
            className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
          >
            + Criar Bloco
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {blocosFiltrados.map((bloco) => (
            <BlocoCard
              key={bloco.id}
              bloco={bloco}
              onEdit={(b) => {
                setBlocoEditando(b);
                setShowBlocoForm(true);
              }}
              onDelete={(b) => {
                setBlocoParaDeletar(b);
                setShowDeleteBloco(true);
              }}
              onAddQuestao={() => {
                // Implementado em próxima fase
                showMsg('Funcionalidade em desenvolvimento', true);
              }}
              onRemoveQuestao={handleRemoverQuestao}
              onSubmit={handleSubmeterBloco}
            />
          ))}
        </div>
      )}

      {/* Modal de Criar/Editar Bloco */}
      {showBlocoForm && (
        <BlocoFormModal
          bloco={blocoEditando}
          loading={saving}
          onClose={() => {
            setShowBlocoForm(false);
            setBlocoEditando(null);
          }}
          onSave={blocoEditando ? handleEditarBloco : handleCriarBloco}
          disciplina={{ id: disciplinaId, name: disciplina }}
        />
      )}

      {/* Modal de Confirmação - Deletar */}
      {showDeleteBloco && blocoParaDeletar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir bloco?</h3>
            <p className="text-sm text-slate-600 mb-6">
              Tem certeza que deseja excluir o bloco "<strong>{blocoParaDeletar.titulo}</strong>"?
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteBloco(false);
                  setBlocoParaDeletar(null);
                }}
                disabled={saving}
                className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletarBloco}
                disabled={saving}
                className="flex-1 py-2 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? 'Deletando...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
