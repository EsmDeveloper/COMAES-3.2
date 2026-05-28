/**
 * BlocoQuestoesManager.jsx
 * Sistema modular de blocos de questões para o painel administrativo.
 *
 * Organiza questões em blocos por disciplina × dificuldade.
 * Os formulários e endpoints existentes são reutilizados sem alteração.
 * Os blocos são persistidos em localStorage (sem necessidade de nova tabela no BD).
 *
 * Props:
 *   contexto: 'torneio' | 'teste'
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import CreateQuestaoForm from './CreateQuestaoForm';
import EditQuestaoForm from './EditQuestaoForm';
import CreateQuestaoTesteForm from './CreateQuestaoTesteForm';
import EditQuestaoTesteForm from './EditQuestaoTesteForm';
import ConfirmModal from '../components/ConfirmModal';
import axios from 'axios';
import {
  Plus, Edit, Trash2, Search, Filter, ChevronDown, ChevronUp,
  BookOpen, Trophy, Eye, EyeOff, Layers, List, AlertCircle,
  CheckCircle, Lock, RefreshCw, Link2, X,
} from 'lucide-react';

// ── Constantes ────────────────────────────────────────────────────────────────

const DISCIPLINAS = [
  { id: 'matematica',  label: 'Matemática',  cor: 'blue'   },
  { id: 'programacao', label: 'Programação', cor: 'purple' },
  { id: 'ingles',      label: 'Inglês',      cor: 'teal'   },
];

const DIFICULDADES = [
  { id: 'facil',  label: 'Fácil',  cor: 'green'  },
  { id: 'medio',  label: 'Médio',  cor: 'yellow' },
  { id: 'dificil',label: 'Difícil',cor: 'red'    },
];

const COR_DISCIPLINA = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-800'   },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-800' },
  teal:   { bg: 'bg-teal-50',   border: 'border-teal-200',   text: 'text-teal-700',   badge: 'bg-teal-100 text-teal-800'   },
};

const COR_DIFICULDADE = {
  green:  { bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500'  },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  red:    { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-500'    },
};

const MAX_QUESTOES_POR_BLOCO = 30;

// ── Helpers de localStorage ───────────────────────────────────────────────────

const STORAGE_KEY_BLOCOS = (ctx) => `comaes_blocos_${ctx}`;
const STORAGE_KEY_ASSOC  = (ctx) => `comaes_assoc_${ctx}`;

function carregarBlocosLS(contexto) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BLOCOS(contexto));
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function salvarBlocosLS(contexto, blocos) {
  try {
    localStorage.setItem(STORAGE_KEY_BLOCOS(contexto), JSON.stringify(blocos));
  } catch { /* ignore */ }
}

function carregarAssocLS(contexto) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ASSOC(contexto));
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function salvarAssocLS(contexto, assoc) {
  try {
    localStorage.setItem(STORAGE_KEY_ASSOC(contexto), JSON.stringify(assoc));
  } catch { /* ignore */ }
}

// ── Gerar blocos padrão ───────────────────────────────────────────────────────

function gerarBlocoesPadrao(contexto) {
  const blocos = [];
  let id = 1;
  for (const disc of DISCIPLINAS) {
    for (const dif of DIFICULDADES) {
      blocos.push({
        id: `padrao_${disc.id}_${dif.id}`,
        titulo: `${disc.label} — ${dif.label}`,
        disciplina: disc.id,
        dificuldade: dif.id,
        contexto,
        padrao: true,
        questaoIds: [],
        criadoEm: new Date().toISOString(),
      });
      id++;
    }
  }
  return blocos;
}

// ── Sub-componente: Card de Bloco ─────────────────────────────────────────────

function BlocoCard({
  bloco, questoes, torneios, assocMap,
  onAddQuestao, onEditQuestao, onDeleteQuestao,
  onEditBloco, onDeleteBloco, onToggleAssoc,
  contexto,
}) {
  const [expandido, setExpandido] = useState(false);
  const [showAssoc, setShowAssoc] = useState(false);

  const disc = DISCIPLINAS.find(d => d.id === bloco.disciplina);
  const dif  = DIFICULDADES.find(d => d.id === bloco.dificuldade);
  const corDisc = COR_DISCIPLINA[disc?.cor || 'blue'];
  const corDif  = COR_DIFICULDADE[dif?.cor  || 'green'];

  const questoesDoBloco = questoes.filter(q => bloco.questaoIds.includes(q.id));
  const count = questoesDoBloco.length;
  const cheio = count >= MAX_QUESTOES_POR_BLOCO;

  const torneiosAssociados = (assocMap[bloco.id] || [])
    .map(tid => torneios.find(t => String(t.id) === String(tid)))
    .filter(Boolean);

  return (
    <div className={`rounded-2xl border-2 ${corDisc.border} ${corDisc.bg} overflow-hidden transition-all duration-200`}>
      {/* Cabeçalho do bloco */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${corDisc.badge}`}>
                {disc?.label}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${corDif.bg} ${corDif.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${corDif.dot}`} />
                {dif?.label}
              </span>
              {bloco.padrao && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Padrão
                </span>
              )}
            </div>
            <h3 className={`font-bold text-slate-800 truncate`}>{bloco.titulo}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              <span className={`font-semibold ${cheio ? 'text-red-600' : 'text-slate-700'}`}>{count}</span>
              /{MAX_QUESTOES_POR_BLOCO} questões
              {contexto === 'torneio' && torneiosAssociados.length > 0 && (
                <span className="ml-2 text-blue-600">
                  · {torneiosAssociados.length} torneio{torneiosAssociados.length > 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>

          {/* Ações do bloco */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {contexto === 'torneio' && (
              <button
                onClick={() => setShowAssoc(v => !v)}
                className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-100 transition-colors"
                title="Associar a torneios"
              >
                <Link2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onEditBloco(bloco)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-white transition-colors"
              title="Editar bloco"
            >
              <Edit className="w-4 h-4" />
            </button>
            {!bloco.padrao && (
              <button
                onClick={() => onDeleteBloco(bloco)}
                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                title="Excluir bloco"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setExpandido(v => !v)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-white transition-colors"
              title={expandido ? 'Recolher' : 'Expandir'}
            >
              {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${cheio ? 'bg-red-400' : 'bg-blue-400'}`}
            style={{ width: `${Math.min((count / MAX_QUESTOES_POR_BLOCO) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Painel de associação de torneios */}
      {showAssoc && contexto === 'torneio' && (
        <div className="border-t border-white/50 bg-white/70 px-4 py-3">
          <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
            <Link2 className="w-3 h-3" /> Associar a torneios ativos
          </p>
          {torneios.length === 0 ? (
            <p className="text-xs text-slate-400">Nenhum torneio disponível.</p>
          ) : (
            <div className="space-y-1">
              {torneios.map(t => {
                const assoc = (assocMap[bloco.id] || []).includes(String(t.id));
                return (
                  <label key={t.id} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={assoc}
                      onChange={() => onToggleAssoc(bloco.id, String(t.id))}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span className="text-xs text-slate-700 group-hover:text-blue-700 transition-colors">
                      {t.titulo}
                      <span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                        t.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}>{t.status}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Lista de questões expandida */}
      {expandido && (
        <div className="border-t border-white/50 bg-white/80">
          {questoesDoBloco.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-slate-400">Nenhuma questão neste bloco.</p>
              {!cheio && (
                <button
                  onClick={() => onAddQuestao(bloco)}
                  className="mt-2 text-xs text-blue-600 hover:underline flex items-center gap-1 mx-auto"
                >
                  <Plus className="w-3 h-3" /> Adicionar questão
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {questoesDoBloco.map((q, i) => (
                <div key={q.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-white/60 transition-colors">
                  <span className="text-xs font-bold text-slate-400 w-5 text-right flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate font-medium">
                      {q.titulo || q.enunciado}
                    </p>
                    <p className="text-xs text-slate-400">
                      {q.pontos} pts
                      {q.tipo && ` · ${q.tipo}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onEditQuestao(q, bloco)}
                      className="p-1 rounded text-blue-400 hover:bg-blue-50 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteQuestao(q, bloco)}
                      className="p-1 rounded text-red-400 hover:bg-red-50 transition-colors"
                      title="Remover do bloco"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botão adicionar questão */}
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
              {cheio ? `Limite de ${MAX_QUESTOES_POR_BLOCO} questões atingido` : 'Adicionar questão'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Modal de criação/edição de bloco ──────────────────────────────────────────

function BlocoFormModal({ bloco, contexto, onClose, onSave }) {
  const [titulo, setTitulo] = useState(bloco?.titulo || '');
  const [disciplina, setDisciplina] = useState(bloco?.disciplina || 'matematica');
  const [dificuldade, setDificuldade] = useState(bloco?.dificuldade || 'facil');
  const [erro, setErro] = useState('');

  const handleSave = () => {
    if (!titulo.trim()) { setErro('O título é obrigatório.'); return; }
    onSave({ titulo: titulo.trim(), disciplina, dificuldade });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-800">
            {bloco ? 'Editar Bloco' : 'Criar Bloco de Questões'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {erro}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Título do bloco *</label>
            <input
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ex: Álgebra Avançada"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Disciplina *</label>
              <select
                value={disciplina}
                onChange={e => setDisciplina(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DISCIPLINAS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Dificuldade *</label>
              <select
                value={dificuldade}
                onChange={e => setDificuldade(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DIFICULDADES.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
            {bloco ? 'Salvar' : 'Criar Bloco'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function BlocoQuestoesManager({ contexto = 'torneio' }) {
  const { token } = useAuth();
  const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;

  const [aba, setAba] = useState('blocos');
  const [blocos, setBlocos] = useState([]);
  const [questoes, setQuestoes] = useState([]);
  const [torneios, setTorneios] = useState([]);
  const [assocMap, setAssocMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [filtroDisc, setFiltroDisc] = useState('');
  const [filtroDif, setFiltroDif] = useState('');
  const [searchAuditoria, setSearchAuditoria] = useState('');

  const [showBlocoForm, setShowBlocoForm] = useState(false);
  const [blocoEditando, setBlocoEditando] = useState(null);
  const [showDeleteBloco, setShowDeleteBloco] = useState(false);
  const [blocoParaDeletar, setBlocoParaDeletar] = useState(null);

  const [showCreateQuestao, setShowCreateQuestao] = useState(false);
  const [blocoAlvo, setBlocoAlvo] = useState(null);
  const [showEditQuestao, setShowEditQuestao] = useState(false);
  const [questaoEditando, setQuestaoEditando] = useState(null);
  const [showDeleteQuestao, setShowDeleteQuestao] = useState(false);
  const [questaoParaDeletar, setQuestaoParaDeletar] = useState(null);
  const [blocoQuestaoParaDeletar, setBlocoQuestaoParaDeletar] = useState(null);

  // Inicialização
  useEffect(() => {
    const salvos = carregarBlocosLS(contexto);
    let blocosIniciais;
    if (salvos && salvos.length > 0) {
      blocosIniciais = salvos;
      setBlocos(salvos);
    } else {
      blocosIniciais = gerarBlocoesPadrao(contexto);
      setBlocos(blocosIniciais);
      salvarBlocosLS(contexto, blocosIniciais);
    }
    setAssocMap(carregarAssocLS(contexto));
    // Passa os blocos iniciais para que a sincronização use a versão correcta
    carregarQuestoes(blocosIniciais);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contexto]);

  const carregarQuestoes = useCallback(async (blocosParaSync) => {
    setLoading(true);
    setError('');
    try {
      let lista = [];
      if (contexto === 'torneio') {
        const res = await axios.get(`${apiBase}/api/questoes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        lista = res.data.dados?.questoes || [];
      } else {
        const res = await axios.get(`${apiBase}/api/teste-conhecimento/questoes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        lista = res.data.data || [];
      }
      setQuestoes(lista);
      // Sincronizar blocos com o estado actual das questões
      // Usa blocosParaSync se fornecido (logo após init), senão usa o state actual
      setBlocos(prev => {
        const alvo = blocosParaSync || prev;
        const campo = contexto === 'torneio' ? 'disciplina' : 'categoria';
        let alterado = false;
        const novos = alvo.map(bloco => {
          if (!bloco.padrao) return bloco;
          const correctas = lista
            .filter(q => q[campo] === bloco.disciplina && q.dificuldade === bloco.dificuldade)
            .slice(0, MAX_QUESTOES_POR_BLOCO)
            .map(q => q.id);
          const igual =
            correctas.length === bloco.questaoIds.length &&
            correctas.every(id => bloco.questaoIds.includes(id));
          if (!igual) { alterado = true; return { ...bloco, questaoIds: correctas }; }
          return bloco;
        });
        if (alterado) {
          salvarBlocosLS(contexto, novos);
          return novos;
        }
        return alvo;
      });
    } catch (err) {
      setError('Erro ao carregar questões.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [contexto, token, apiBase]);

  useEffect(() => {
    if (contexto !== 'torneio') return;
    const carregar = async () => {
      try {
        const res = await axios.get(`${apiBase}/api/admin/torneos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const lista = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setTorneios(lista);
      } catch (err) {
        console.error('Erro ao carregar torneios:', err);
      }
    };
    carregar();
  }, [contexto, token, apiBase]);

  useEffect(() => { carregarQuestoes(); }, [carregarQuestoes]);

  const persistirBlocos = (novosBlocos) => {
    setBlocos(novosBlocos);
    salvarBlocosLS(contexto, novosBlocos);
  };

  const persistirAssoc = (novoAssoc) => {
    setAssocMap(novoAssoc);
    salvarAssocLS(contexto, novoAssoc);
  };

  const showMsg = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleCriarBloco = (dados) => {
    const novo = {
      id: `bloco_${Date.now()}`,
      titulo: dados.titulo,
      disciplina: dados.disciplina,
      dificuldade: dados.dificuldade,
      contexto,
      padrao: false,
      questaoIds: [],
      criadoEm: new Date().toISOString(),
    };
    persistirBlocos([...blocos, novo]);
    setShowBlocoForm(false);
    showMsg('Bloco criado com sucesso!');
  };

  const handleEditarBloco = (dados) => {
    const atualizados = blocos.map(b =>
      b.id === blocoEditando.id
        ? { ...b, titulo: dados.titulo, disciplina: dados.disciplina, dificuldade: dados.dificuldade }
        : b
    );
    persistirBlocos(atualizados);
    setBlocoEditando(null);
    setShowBlocoForm(false);
    showMsg('Bloco atualizado!');
  };

  const handleDeletarBloco = () => {
    if (!blocoParaDeletar || blocoParaDeletar.padrao) return;
    persistirBlocos(blocos.filter(b => b.id !== blocoParaDeletar.id));
    setBlocoParaDeletar(null);
    setShowDeleteBloco(false);
    showMsg('Bloco excluído.');
  };

  const handleToggleAssoc = (blocoId, torneioId) => {
    const atual = assocMap[blocoId] || [];
    const novaLista = atual.includes(torneioId)
      ? atual.filter(id => id !== torneioId)
      : [...atual, torneioId];
    persistirAssoc({ ...assocMap, [blocoId]: novaLista });
  };

  const handleQuestaoAdicionada = (questao, bloco) => {
    if (!questao?.id || !bloco) { carregarQuestoes(); setShowCreateQuestao(false); setBlocoAlvo(null); return; }
    const qId = questao.id;
    const atualizados = blocos.map(b =>
      b.id === bloco.id && !b.questaoIds.includes(qId)
        ? { ...b, questaoIds: [...b.questaoIds, qId] }
        : b
    );
    persistirBlocos(atualizados);
    setShowCreateQuestao(false);
    setBlocoAlvo(null);
    carregarQuestoes();
    showMsg('Questão adicionada ao bloco!');
  };

  const handleQuestaoEditada = () => {
    setShowEditQuestao(false);
    setQuestaoEditando(null);
    // Recarregar e re-sincronizar — se a dificuldade mudou, a questão muda de bloco
    carregarQuestoes();
    showMsg('Questão actualizada! Os blocos foram re-sincronizados.');
  };

  const handleRemoverQuestaoDoBloco = async () => {
    if (!questaoParaDeletar) return;
    try {
      if (contexto === 'torneio') {
        await axios.delete(`${apiBase}/api/questoes/${questaoParaDeletar.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.delete(`${apiBase}/api/teste-conhecimento/questoes/${questaoParaDeletar.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      if (blocoQuestaoParaDeletar) {
        const atualizados = blocos.map(b =>
          b.id === blocoQuestaoParaDeletar.id
            ? { ...b, questaoIds: b.questaoIds.filter(id => id !== questaoParaDeletar.id) }
            : b
        );
        persistirBlocos(atualizados);
      }
      carregarQuestoes();
      showMsg('Questão removida.');
    } catch (err) {
      setError('Erro ao remover questão.');
    } finally {
      setShowDeleteQuestao(false);
      setQuestaoParaDeletar(null);
      setBlocoQuestaoParaDeletar(null);
    }
  };

  // Filtros
  const blocosFiltrados = blocos.filter(b => {
    if (filtroDisc && b.disciplina !== filtroDisc) return false;
    if (filtroDif  && b.dificuldade !== filtroDif)  return false;
    return true;
  });

  const blocosPorDisc = DISCIPLINAS.map(disc => ({
    ...disc,
    blocos: blocosFiltrados.filter(b => b.disciplina === disc.id),
  })).filter(d => d.blocos.length > 0);

  const questoesAuditoria = questoes.filter(q => {
    const texto = (q.titulo || q.enunciado || '').toLowerCase();
    return !searchAuditoria || texto.includes(searchAuditoria.toLowerCase());
  });

  const questaoToBlocoMap = {};
  blocos.forEach(b => { b.questaoIds.forEach(qid => { questaoToBlocoMap[qid] = b; }); });

  const isTorneio = contexto === 'torneio';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            {isTorneio ? <Trophy className="w-8 h-8 text-blue-600" /> : <BookOpen className="w-8 h-8 text-purple-600" />}
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {isTorneio ? 'Questões dos Torneios' : 'Teste de Conhecimento'}
              </h2>
              <p className="text-sm text-slate-500">{blocos.length} blocos · {questoes.length} questões</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={carregarQuestoes} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors" title="Recarregar">
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => { setBlocoEditando(null); setShowBlocoForm(true); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white shadow-lg transition-all hover:scale-105 ${
                isTorneio
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700'
              }`}
            >
              <Layers className="w-4 h-4" /> Criar Bloco de Questões
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-5 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-5 py-3 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0" /> {success}
        </div>
      )}

      {/* Abas */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { id: 'blocos', icon: Layers, label: 'Blocos de Questões' },
          { id: 'auditoria', icon: List, label: 'Visualizar Todas as Questões' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setAba(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              aba === tab.id ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* ABA BLOCOS */}
      {aba === 'blocos' && (
        <>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <Filter className="w-4 h-4 text-slate-400" />
              <select value={filtroDisc} onChange={e => setFiltroDisc(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Todas as disciplinas</option>
                {DISCIPLINAS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
              <select value={filtroDif} onChange={e => setFiltroDif(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Todas as dificuldades</option>
                {DIFICULDADES.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
              {(filtroDisc || filtroDif) && (
                <button onClick={() => { setFiltroDisc(''); setFiltroDif(''); }}
                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                  <X className="w-3 h-3" /> Limpar
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
              <p className="text-slate-500">Carregando questões...</p>
            </div>
          ) : blocosPorDisc.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Nenhum bloco encontrado</p>
            </div>
          ) : (
            blocosPorDisc.map(disc => {
              const corDisc = COR_DISCIPLINA[disc.cor];
              return (
                <div key={disc.id} className="space-y-3">
                  <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${corDisc.bg} ${corDisc.border} border`}>
                    <span className={`text-base font-bold ${corDisc.text}`}>{disc.label}</span>
                    <span className="text-xs text-slate-400">{disc.blocos.length} bloco{disc.blocos.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {disc.blocos.map(bloco => (
                      <BlocoCard
                        key={bloco.id}
                        bloco={bloco}
                        questoes={questoes}
                        torneios={torneios}
                        assocMap={assocMap}
                        contexto={contexto}
                        onAddQuestao={(b) => { setBlocoAlvo(b); setShowCreateQuestao(true); }}
                        onEditQuestao={(q) => { setQuestaoEditando(q); setShowEditQuestao(true); }}
                        onDeleteQuestao={(q, b) => { setQuestaoParaDeletar(q); setBlocoQuestaoParaDeletar(b); setShowDeleteQuestao(true); }}
                        onEditBloco={(b) => { setBlocoEditando(b); setShowBlocoForm(true); }}
                        onDeleteBloco={(b) => { setBlocoParaDeletar(b); setShowDeleteBloco(true); }}
                        onToggleAssoc={handleToggleAssoc}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </>
      )}

      {/* ABA AUDITORIA */}
      {aba === 'auditoria' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Buscar por título ou enunciado..."
                value={searchAuditoria} onChange={e => setSearchAuditoria(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
                <p className="text-slate-500">Carregando...</p>
              </div>
            ) : questoesAuditoria.length === 0 ? (
              <div className="p-8 text-center">
                <List className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Nenhuma questão encontrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase">Questão</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase">{isTorneio ? 'Disciplina' : 'Categoria'}</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase">Dificuldade</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase">Pts</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase">Bloco</th>
                      <th className="px-5 py-3 text-right text-xs font-bold text-slate-600 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {questoesAuditoria.map(q => {
                      const blocoOrigem = questaoToBlocoMap[q.id];
                      const disc = DISCIPLINAS.find(d => d.id === (q.disciplina || q.categoria));
                      const dif  = DIFICULDADES.find(d => d.id === q.dificuldade);
                      const corDif = COR_DIFICULDADE[dif?.cor || 'green'];
                      return (
                        <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3 text-sm text-slate-700">
                            <div className="max-w-xs truncate font-medium" title={q.titulo || q.enunciado}>
                              {q.titulo || q.enunciado}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-sm">
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              {disc?.label || q.disciplina || q.categoria}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-sm">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${corDif.bg} ${corDif.text}`}>
                              {dif?.label || q.dificuldade}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-sm font-semibold text-slate-700">{q.pontos}</td>
                          <td className="px-5 py-3 text-sm">
                            {blocoOrigem
                              ? <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{blocoOrigem.titulo}</span>
                              : <span className="text-xs text-slate-400 italic">Sem bloco</span>
                            }
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => { setQuestaoEditando(q); setShowEditQuestao(true); }}
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Editar">
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => { setQuestaoParaDeletar(q); setBlocoQuestaoParaDeletar(blocoOrigem || null); setShowDeleteQuestao(true); }}
                                className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Excluir">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modais */}
      {showBlocoForm && (
        <BlocoFormModal
          bloco={blocoEditando}
          contexto={contexto}
          onClose={() => { setShowBlocoForm(false); setBlocoEditando(null); }}
          onSave={blocoEditando ? handleEditarBloco : handleCriarBloco}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteBloco && !!blocoParaDeletar}
        onClose={() => { setShowDeleteBloco(false); setBlocoParaDeletar(null); }}
        onConfirm={handleDeletarBloco}
        title="Excluir Bloco"
        message={`Excluir o bloco "${blocoParaDeletar?.titulo}"? As questões não serão apagadas.`}
        confirmText="Excluir" cancelText="Cancelar" type="danger"
      />

      {showCreateQuestao && blocoAlvo && contexto === 'torneio' && (
        <CreateQuestaoForm
          torneioId=""
          onClose={() => { setShowCreateQuestao(false); setBlocoAlvo(null); }}
          onSuccess={(questao) => handleQuestaoAdicionada(questao, blocoAlvo)}
        />
      )}
      {showCreateQuestao && blocoAlvo && contexto === 'teste' && (
        <CreateQuestaoTesteForm
          onClose={() => { setShowCreateQuestao(false); setBlocoAlvo(null); }}
          onSuccess={(questao) => handleQuestaoAdicionada(questao, blocoAlvo)}
        />
      )}
      {showEditQuestao && questaoEditando && contexto === 'torneio' && (
        <EditQuestaoForm
          questao={questaoEditando}
          onClose={() => { setShowEditQuestao(false); setQuestaoEditando(null); }}
          onSuccess={handleQuestaoEditada}
        />
      )}
      {showEditQuestao && questaoEditando && contexto === 'teste' && (
        <EditQuestaoTesteForm
          questao={questaoEditando}
          onClose={() => { setShowEditQuestao(false); setQuestaoEditando(null); }}
          onSuccess={handleQuestaoEditada}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteQuestao && !!questaoParaDeletar}
        onClose={() => { setShowDeleteQuestao(false); setQuestaoParaDeletar(null); setBlocoQuestaoParaDeletar(null); }}
        onConfirm={handleRemoverQuestaoDoBloco}
        title="Excluir Questão"
        message={`Excluir a questão "${(questaoParaDeletar?.titulo || questaoParaDeletar?.enunciado || '').substring(0, 60)}..."?`}
        confirmText="Excluir" cancelText="Cancelar" type="danger"
      />
    </div>
  );
}
