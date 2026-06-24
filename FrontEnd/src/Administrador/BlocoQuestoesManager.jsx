/**
 * BlocoQuestoesManager.jsx
 * Gest�o de Blocos de Quest��es � Fus�o das melhores pr�ticas:
 * - Persist�ncia via API (banco de dados)
 * - Suporte a m�ltiplos contextos (torneio/teste)
 * - UI rica com auditoria, progresso e associa���es
 * - Performance otimizada
 */
import React, { useState, useEffect, useCallback, useReducer } from 'react';
import { useAuth } from '../context/AuthContext';
import CreateQuestaoForm from './CreateQuestaoForm';
import EditQuestaoForm from './EditQuestaoForm';
import QuestaoFormUnificado from '../components/QuestaoFormUnificado';
import CreateQuestaoTesteForm from './CreateQuestaoTesteForm';
import EditQuestaoTesteForm from './EditQuestaoTesteForm';
import ConfirmModal from '../components/ConfirmModal';
import BlocosService from './services/BlocosService';
import axios from 'axios';
import {
  Plus, Edit, Trash2, Search, Filter, ChevronDown, ChevronUp,
  BookOpen, Trophy, Layers, List, AlertCircle, CheckCircle,
  Lock, RefreshCw, Link2, X, Eye, Unlink,
} from 'lucide-react';

// �� Constantes ����������������������������������������������������������������
const DISCIPLINAS = [
  { id: 'matematica',  label: 'Matem�tica',  cor: 'blue'   },
  { id: 'programacao', label: 'Programa��o', cor: 'indigo' },
  { id: 'ingles',      label: 'Ingl�s',      cor: 'cyan'   },
];

const DIFICULDADES = [
  { id: 'facil',   label: 'F�cil',   cor: 'blue'  },
  { id: 'medio',   label: 'M�dio',   cor: 'indigo' },
  { id: 'dificil', label: 'Dif�cil', cor: 'cyan'    },
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

// �� Reducer para gerenciar estado complexo �����������������������������������
const initialState = {
  blocos: [],
  questoes: [],
  torneios: [],
  assocMap: {},
  loading: false,
  error: '',
  success: '',
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, success: '' };
    case 'SET_SUCCESS':
      return { ...state, success: action.payload, error: '' };
    case 'SET_BLOCOS':
      return { ...state, blocos: action.payload };
    case 'SET_QUESTOES':
      return { ...state, questoes: action.payload };
    case 'SET_TORNEIOS':
      return { ...state, torneios: action.payload };
    case 'SET_ASSOC_MAP':
      return { ...state, assocMap: action.payload };
    case 'UPDATE_BLOCO':
      return {
        ...state,
        blocos: state.blocos.map(b => b.id === action.payload.id ? action.payload : b)
      };
    case 'DELETE_BLOCO':
      return {
        ...state,
        blocos: state.blocos.filter(b => b.id !== action.payload)
      };
    case 'ADD_BLOCO':
      return {
        ...state,
        blocos: [...state.blocos, action.payload]
      };
    case 'CLEAR_MESSAGES':
      return { ...state, error: '', success: '' };
    default:
      return state;
  }
}

// �� Modal de cria��o/edi��o de bloco ������������������������������������������
function BlocoFormModal({ bloco, contexto, onClose, onSave, loading }) {
  const [titulo, setTitulo] = useState(bloco?.titulo || '');
  const [disciplina, setDisciplina] = useState(bloco?.disciplina || 'matematica');
  const [dificuldade, setDificuldade] = useState(bloco?.dificuldade || 'facil');
  const [status, setStatus] = useState(bloco?.status || 'rascunho');
  const [descricao, setDescricao] = useState(bloco?.descricao || '');
  const [erro, setErro] = useState('');

  const handleSave = () => {
    if (!titulo.trim()) {
      setErro('O t�tulo � obrigat�rio.');
      return;
    }
    onSave({
      titulo: titulo.trim(),
      disciplina,
      dificuldade,
      status,
      descricao: descricao.trim() || null,
      contexto
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-800">
            {bloco ? 'Editar Bloco' : 'Criar Bloco de Quest��es'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {erro}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">T�tulo do bloco *</label>
            <input
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ex: �lgebra Avan�ada"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Descri��o</label>
            <textarea
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              rows={2}
              placeholder="Descri��o opcional do bloco..."
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="rascunho"> Rascunho</option>
              <option value="publicado">� Publicado</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">Apenas blocos publicados podem ser associados a torneios.</p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvando...' : bloco ? 'Salvar' : 'Criar Bloco'}
          </button>
        </div>
      </div>
    </div>
  );
}

// �� Card de Bloco (vers�o melhorada) ������������������������������������������
function BlocoCard({
  bloco,
  questoes,
  torneios,
  assocMap,
  onAddQuestao,
  onEditQuestao,
  onRemoverQuestao,
  onEditBloco,
  onDeleteBloco,
  onToggleAssoc,
  contexto,
  token,
  apiBase,
}) {
  const [expandido, setExpandido] = useState(false);
  const [showAssoc, setShowAssoc] = useState(false);
  const [questoesDoBloco, setQuestoesDoBloco] = useState([]);
  const [carregandoQuestoes, setCarregandoQuestoes] = useState(false);

  // � NOVO: Se o bloco j� vem com quest�es do backend, carregar automaticamente
  useEffect(() => {
    if (bloco?.questoes && Array.isArray(bloco.questoes) && bloco.questoes.length > 0 && questoesDoBloco.length === 0) {
      console.log(` Quest��es j� carregadas no bloco ${bloco.id}:`, bloco.questoes);
      setQuestoesDoBloco(bloco.questoes);
    }
  }, [bloco?.id, bloco?.questoes, questoesDoBloco.length]);

  const disc = DISCIPLINAS.find(d => d.id === bloco.disciplina);
  const dif = DIFICULDADES.find(d => d.id === bloco.dificuldade);
  const corDisc = COR_DISCIPLINA[disc?.cor || 'blue'];
  const corDif = COR_DIFICULDADE[dif?.cor || 'green'];

  const count = bloco.total_questoes ?? questoesDoBloco.length;
  const cheio = count >= MAX_QUESTOES_POR_BLOCO;

  // � Carregar quest�es quando expandir o bloco
  const handleToggleExpand = async () => {
    if (!expandido && questoesDoBloco.length === 0 && bloco.total_questoes > 0) {
      // � Se j� v�m do bloco (novo formato), n�o precisa refazer a requisi��o
      if (bloco?.questoes && Array.isArray(bloco.questoes)) {
        console.log(`� Quest��es j� est�o no bloco ${bloco.id}, usando do estado`);
        setQuestoesDoBloco(bloco.questoes);
      } else {
        // Fallback: carregar quest�es do backend (compatibilidade com blocos antigos)
        setCarregandoQuestoes(true);
        try {
          const response = await fetch(`${apiBase}/api/blocos/${bloco.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            console.log(` Resposta bruta da API para bloco ${bloco.id}:`, data);
            
            // � SUPORTAR M�LTIPLOS FORMATOS:
            const questoesCarregadas = 
              data.data?.questoes ||           
              data.questoes ||                  
              data.dados?.questoes ||           
              [];
            
            console.log(`� Quest��es do bloco ${bloco.id} (${questoesCarregadas.length} encontradas):`, questoesCarregadas);
            setQuestoesDoBloco(questoesCarregadas);
          }
        } catch (error) {
          console.error(`� Erro ao carregar quest�es do bloco:`, error);
        } finally {
          setCarregandoQuestoes(false);
        }
      }
    }
    setExpandido(!expandido);
  };

  const torneiosAssociados = (assocMap[bloco.id] || [])
    .map(tid => torneios.find(t => String(t.id) === String(tid)))
    .filter(Boolean);

  return (
    <div className={`rounded-2xl border-2 ${corDisc.border} ${corDisc.bg} overflow-hidden transition-all duration-200`}>
      {/* Cabe�alho do bloco */}
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
                  <Lock className="w-3 h-3" /> Padr�o
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${(bloco.status === 'publicado' || bloco.status === 'aprovado') ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {(bloco.status === 'publicado' || bloco.status === 'aprovado') ? '? Publicado' : '?? Rascunho'}
              </span>
            </div>
            <h3 className="font-bold text-slate-800 truncate">{bloco.titulo}</h3>
            {bloco.descricao && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{bloco.descricao}</p>
            )}
            <p className="text-xs text-slate-500 mt-0.5">
              <span className={`font-semibold ${cheio ? 'text-red-600' : 'text-slate-700'}`}>{count}</span>
              /{MAX_QUESTOES_POR_BLOCO} quest�es
              {contexto === 'torneio' && torneiosAssociados.length > 0 && (
                <span className="ml-2 text-blue-600">
                  � {torneiosAssociados.length} torneio{torneiosAssociados.length > 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>

          {/* A���es do bloco */}
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
              onClick={handleToggleExpand}
              disabled={carregandoQuestoes}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-white transition-colors disabled:opacity-50"
              title={expandido ? 'Recolher' : 'Expandir'}
            >
              {carregandoQuestoes ? (
                <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
              ) : expandido ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
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

      {/* Painel de associa��o de torneios */}
      {showAssoc && contexto === 'torneio' && (
        <div className="border-t border-white/50 bg-white/70 px-4 py-3">
          <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
            <Link2 className="w-3 h-3" /> Associar a torneios ativos
          </p>
          {(bloco.status !== 'publicado' && bloco.status !== 'aprovado') && (
            <p className="text-xs text-amber-600 mb-2">� Publique o bloco antes de associar a torneios.</p>
          )}
          {torneios.length === 0 ? (
            <p className="text-xs text-slate-400">Nenhum torneio dispon�vel.</p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {torneios.map(t => {
                const assoc = (assocMap[bloco.id] || []).includes(String(t.id));
                return (
                  <label key={t.id} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={assoc}
                      disabled={bloco.status !== 'publicado' && bloco.status !== 'aprovado'}
                      onChange={() => onToggleAssoc(bloco.id, String(t.id))}
                      className="w-4 h-4 rounded text-blue-600 disabled:opacity-40"
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

      {/* Lista de quest�es expandida */}
      {expandido && (
        <div className="border-t border-white/50 bg-white/80">
          {carregandoQuestoes ? (
            <div className="px-4 py-6 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-blue-700 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Carregando quest�es...</p>
            </div>
          ) : questoesDoBloco.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-slate-400">Nenhuma quest�o neste bloco.</p>
              {!cheio && (
                <button
                  onClick={() => onAddQuestao(bloco)}
                  className="mt-2 text-xs text-blue-600 hover:underline flex items-center gap-1 mx-auto"
                >
                  <Plus className="w-3 h-3" /> Adicionar quest�o
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {questoesDoBloco.map((q, i) => (
                <div key={q.id || i} className="px-4 py-2.5 flex items-center gap-3 hover:bg-white/60 transition-colors">
                  <span className="text-xs font-bold text-slate-400 w-5 text-right flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate font-medium">
                      {q.titulo || q.enunciado}
                    </p>
                    <p className="text-xs text-slate-400">
                      {q.pontos} pts
                      {q.tipo && ` � ${q.tipo}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onEditQuestao(q, bloco)}
                      className="p-1 rounded text-blue-400 hover:bg-blue-50 transition-colors"
                      title="Editar quest�o"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onRemoverQuestao(q, bloco)}
                      className="p-1 rounded text-red-400 hover:bg-red-50 transition-colors"
                      title="Remover do bloco"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bot�o adicionar quest�o */}
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
              {cheio ? `Limite de ${MAX_QUESTOES_POR_BLOCO} quest�es atingido` : 'Adicionar quest�o'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// �� Componente principal ������������������������������������������������������
export default function BlocoQuestoesManager({ contexto = 'torneio' }) {
  const { token } = useAuth();
  const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

  const [state, dispatch] = useReducer(appReducer, initialState);
  const [aba, setAba] = useState('blocos');
  const [filtroDisc, setFiltroDisc] = useState('');
  const [filtroDif, setFiltroDif] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [searchAuditoria, setSearchAuditoria] = useState('');

  // Estados de modais
  const [showBlocoForm, setShowBlocoForm] = useState(false);
  const [blocoEditando, setBlocoEditando] = useState(null);
  const [showDeleteBloco, setShowDeleteBloco] = useState(false);
  const [blocoParaDeletar, setBlocoParaDeletar] = useState(null);

  const [showCreateQuestao, setShowCreateQuestao] = useState(false);
  const [blocoAlvo, setBlocoAlvo] = useState(null);
  const [showEditQuestao, setShowEditQuestao] = useState(false);
  const [questaoEditando, setQuestaoEditando] = useState(null);
  const [showRemoverQuestao, setShowRemoverQuestao] = useState(false);
  const [removerTarget, setRemoverTarget] = useState({ questao: null, bloco: null });

  const [saving, setSaving] = useState(false);

  const showMsg = (msg, isError = false) => {
    if (isError) {
      dispatch({ type: 'SET_ERROR', payload: msg });
      setTimeout(() => dispatch({ type: 'SET_ERROR', payload: '' }), 4000);
    } else {
      dispatch({ type: 'SET_SUCCESS', payload: msg });
      setTimeout(() => dispatch({ type: 'SET_SUCCESS', payload: '' }), 3000);
    }
  };

  // �� Carregar dados do backend �����������������������������������������������
  const carregarQuestoes = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      let lista = [];
      if (contexto === 'torneio') {
        const res = await axios.get(`${apiBase}/api/questoes`, {
          params: { status_aprovacao: 'aprovada' }, // � FILTRO: Apenas quest�es aprovadas
          headers: { Authorization: `Bearer ${token}` },
        });
        lista = res.data.dados?.questoes || [];
      } else {
        const res = await axios.get(`${apiBase}/api/teste-conhecimento/questoes`, {
          params: { status_aprovacao: 'aprovada' }, // � FILTRO: Apenas quest�es aprovadas
          headers: { Authorization: `Bearer ${token}` },
        });
        lista = res.data.data || [];
      }
      dispatch({ type: 'SET_QUESTOES', payload: lista });
      return lista;
    } catch (err) {
      showMsg('Erro ao carregar quest�es.');
      console.error(err);
      return [];
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [contexto, token, apiBase]);

  const carregarBlocos = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Tentar carregar do backend primeiro
      if (BlocosService && token) {
        const params = {};
        if (filtroDisc) params.disciplina = filtroDisc;
        if (filtroDif) params.dificuldade = filtroDif;
        if (filtroStatus) params.status = filtroStatus;
        if (contexto) params.contexto = contexto;
        params.limit = 100;

        console.log('[MEDAL] Carregando blocos com filtros:', params);
        
        try {
          const res = await BlocosService.listar(token, params);
          console.log('[MEDAL] Resposta do backend:', res);
          
          // � Acessar blocos corretamente da resposta
          // O backend pode retornar em v�rios formatos:
          // 1. { blocos: Array, total, page, ... } - direto
          // 2. { data: { blocos: Array } } - aninhado em data
          // 3. { dados: [...] } - direto como array em dados
          // 4. { data: [...] } - direto como array em data
          const blocosBackend = res?.blocos || res?.data?.blocos || res?.dados || res?.data || [];
          console.log(`[MEDAL] Blocos extra�dos:`, blocosBackend);
          
          // Se ainda n�o � um array, tenta verificar se � array diretamente
          const blocoArray = Array.isArray(blocosBackend) ? blocosBackend : [];
          
          if (blocoArray.length > 0) {
            dispatch({ type: 'SET_BLOCOS', payload: blocoArray });
            
            // Log para debug
            console.log('[MEDAL] Estrutura dos blocos carregados:');
            blocoArray.forEach((b, idx) => {
              console.log(`  Bloco ${idx}: id=${b.id}, titulo=${b.titulo}, questoes=${b.questoes?.length || 0}, total_questoes=${b.total_questoes}`);
            });
            
            // Carregar quest�es para cada bloco (evitar N+1)
            const questoesMap = new Map();
            for (const bloco of blocoArray) {
              if (bloco.questoes && bloco.questoes.length > 0) {
                bloco.questoes.forEach(q => questoesMap.set(q.id, q));
              }
            }
            const questoesUnicas = Array.from(questoesMap.values());
            if (questoesUnicas.length > 0) {
              dispatch({ type: 'SET_QUESTOES', payload: questoesUnicas });
            }
            console.log(`� Blocos carregados com sucesso do backend:`, blocoArray.length, `com ${questoesUnicas.length} quest�es �nicas`);
            return;
          } else {
            console.log(`� Backend retornou vazio, usando padr�o`);
          }
        } catch (backendErr) {
          console.error(`� Erro ao chamar backend:`, backendErr.message);
          throw backendErr;
        }
      }
      
      // Sem fallback - mostrar lista vazia quando n�o h� blocos
      dispatch({ type: 'SET_BLOCOS', payload: [] });
    } catch (err) {
      console.error('Erro ao carregar blocos:', err);
      dispatch({ type: 'SET_BLOCOS', payload: [] });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [token, filtroDisc, filtroDif, filtroStatus, contexto, carregarQuestoes]);

  const carregarTorneios = useCallback(async () => {
    if (contexto !== 'torneio') return;
    try {
      const res = await axios.get(`${apiBase}/api/admin/torneos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const lista = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      dispatch({ type: 'SET_TORNEIOS', payload: lista });
      
      // Construir mapa de associa���es
      const mapa = {};
      lista.forEach(torneio => {
        if (torneio.blocos) {
          torneio.blocos.forEach(bloco => {
            const blocoId = bloco.id || bloco;
            if (!mapa[blocoId]) mapa[blocoId] = [];
            mapa[blocoId].push(String(torneio.id));
          });
        }
      });
      dispatch({ type: 'SET_ASSOC_MAP', payload: mapa });
    } catch (err) {
      console.error('Erro ao carregar torneios:', err);
    }
  }, [contexto, token, apiBase]);

  // Efeitos iniciais
  useEffect(() => {
    carregarBlocos();
    carregarTorneios();
  }, [carregarBlocos, carregarTorneios]);

  // �� Handlers de Bloco ����������������������������������������������������
  const gerarBlocoesPadrao = (ctx) => {
    const blocos = [];
    let id = 1;
    for (const disc of DISCIPLINAS) {
      for (const dif of DIFICULDADES) {
        blocos.push({
          id: `padrao_${disc.id}_${dif.id}`,
          titulo: `${disc.label} � ${dif.label}`,
          disciplina: disc.id,
          dificuldade: dif.id,
          contexto: ctx,
          padrao: true,
          status: 'publicado',
          questoes: [],
          questaoIds: [],
          criadoEm: new Date().toISOString(),
        });
      }
    }
    return blocos;
  };

  const handleCriarBloco = async (dados) => {
    setSaving(true);
    try {
      if (BlocosService && token) {
        await BlocosService.criar(token, dados);
        showMsg('Bloco criado com sucesso!');
        await carregarBlocos();
      } else {
        // Fallback local
        const novoBloco = {
          id: `bloco_${Date.now()}`,
          ...dados,
          padrao: false,
          questoes: [],
          questaoIds: [],
          criadoEm: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_BLOCO', payload: novoBloco });
        showMsg('Bloco criado localmente!');
      }
      setShowBlocoForm(false);
    } catch (err) {
      showMsg(err.message || 'Erro ao criar bloco');
    } finally {
      setSaving(false);
    }
  };

  const handleEditarBloco = async (dados) => {
    setSaving(true);
    try {
      if (BlocosService && token && blocoEditando && !blocoEditando.padrao) {
        await BlocosService.editar(token, blocoEditando.id, dados);
        showMsg('Bloco atualizado!');
        await carregarBlocos();
      } else if (!blocoEditando?.padrao) {
        // Fallback local
        const atualizado = { ...blocoEditando, ...dados };
        dispatch({ type: 'UPDATE_BLOCO', payload: atualizado });
        showMsg('Bloco atualizado localmente!');
      }
      setBlocoEditando(null);
      setShowBlocoForm(false);
    } catch (err) {
      showMsg(err.message || 'Erro ao editar bloco');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletarBloco = async () => {
    if (!blocoParaDeletar) return;
    setSaving(true);
    try {
      if (BlocosService && token && !blocoParaDeletar.padrao) {
        await BlocosService.deletar(token, blocoParaDeletar.id);
        showMsg('Bloco exclu�do.');
        await carregarBlocos();
      } else if (!blocoParaDeletar.padrao) {
        dispatch({ type: 'DELETE_BLOCO', payload: blocoParaDeletar.id });
        showMsg('Bloco exclu�do localmente.');
      }
      setBlocoParaDeletar(null);
      setShowDeleteBloco(false);
    } catch (err) {
      showMsg(err.message || 'Erro ao excluir bloco');
    } finally {
      setSaving(false);
    }
  };

  // �� Handlers de Associa��o ������������������������������������������������
  const handleToggleAssoc = async (blocoId, torneioId) => {
    const atual = state.assocMap[blocoId] || [];
    const jaAssociado = atual.includes(torneioId);
    
    try {
      if (BlocosService && token) {
        if (jaAssociado) {
          await BlocosService.desassociar(token, torneioId, blocoId);
          showMsg('Bloco desassociado do torneio.');
        } else {
          await BlocosService.associar(token, torneioId, blocoId);
          showMsg('Bloco associado ao torneio!');
        }
        
        // Atualizar mapa local
        const novoMap = { ...state.assocMap };
        if (jaAssociado) {
          novoMap[blocoId] = novoMap[blocoId].filter(id => id !== torneioId);
          if (novoMap[blocoId].length === 0) delete novoMap[blocoId];
        } else {
          novoMap[blocoId] = [...(novoMap[blocoId] || []), torneioId];
        }
        dispatch({ type: 'SET_ASSOC_MAP', payload: novoMap });
      }
    } catch (err) {
      showMsg(err.message || 'Erro ao alterar associa��o');
    }
  };

  // �� Handlers de Quest�o ���������������������������������������������������
  const handleQuestaoAdicionada = async (questao, bloco) => {
    if (!questao?.id || !bloco) {
      setShowCreateQuestao(false);
      setBlocoAlvo(null);
      return;
    }
    
    setSaving(true);
    try {
      if (BlocosService && token && !bloco.padrao) {
        await BlocosService.adicionarQuestao(token, bloco.id, questao.id);
        showMsg('Quest�o adicionada ao bloco!');
        await carregarBlocos();
      } else {
        // Fallback local
        const blocosAtualizados = state.blocos.map(b =>
          b.id === bloco.id && !b.questaoIds?.includes(questao.id)
            ? { ...b, questaoIds: [...(b.questaoIds || []), questao.id], questoes: [...(b.questoes || []), questao] }
            : b
        );
        dispatch({ type: 'SET_BLOCOS', payload: blocosAtualizados });
        showMsg('Quest�o adicionada localmente!');
      }
    } catch (err) {
      if (!err.message?.includes('j� est�')) {
        showMsg(err.message || 'Erro ao adicionar quest�o');
      }
    } finally {
      setSaving(false);
      setShowCreateQuestao(false);
      setBlocoAlvo(null);
    }
  };

  const handleQuestaoEditada = async () => {
    setShowEditQuestao(false);
    setQuestaoEditando(null);
    showMsg('Questão atualizada! Os blocos foram re-sincronizados.');
    await carregarBlocos();
  };

  const handleSalvarNovaQuestaoBloco = async (payload) => {
    const response = await fetch(`${apiBase}/api/questoes`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.mensagem || data.message || 'Erro ao criar questão');
    await handleQuestaoAdicionada(data.dados || data, blocoAlvo);
  };

  const handleSalvarEdicaoQuestao = async (payload) => {
    if (!questaoEditando) return;
    const response = await fetch(`${apiBase}/api/questoes/${questaoEditando.id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.mensagem || data.message || 'Erro ao editar questão');
    await handleQuestaoEditada();
  };

  const handleRemoverQuestao = async () => {
    const { questao, bloco } = removerTarget;
    if (!questao || !bloco) return;
    
    setSaving(true);
    try {
      if (BlocosService && token && !bloco.padrao) {
        await BlocosService.removerQuestao(token, bloco.id, questao.id);
        showMsg('Quest�o removida do bloco.');
        await carregarBlocos();
      } else if (!bloco.padrao) {
        // Fallback local
        const blocosAtualizados = state.blocos.map(b =>
          b.id === bloco.id
            ? { ...b, questaoIds: (b.questaoIds || []).filter(id => id !== questao.id), questoes: (b.questoes || []).filter(q => q.id !== questao.id) }
            : b
        );
        dispatch({ type: 'SET_BLOCOS', payload: blocosAtualizados });
        showMsg('Quest�o removida localmente.');
      }
    } catch (err) {
      showMsg(err.message || 'Erro ao remover quest�o');
    } finally {
      setSaving(false);
      setShowRemoverQuestao(false);
      setRemoverTarget({ questao: null, bloco: null });
    }
  };

  // �� Filtros e renderiza��o ������������������������������������������������
  const blocosFiltrados = state.blocos.filter(b => {
    if (filtroDisc && b.disciplina !== filtroDisc) return false;
    if (filtroDif && b.dificuldade !== filtroDif) return false;
    if (filtroStatus && b.status !== filtroStatus) return false;
    return true;
  });

  const blocosPorDisc = DISCIPLINAS.map(disc => ({
    ...disc,
    blocos: blocosFiltrados.filter(b => b.disciplina === disc.id),
  })).filter(d => d.blocos.length > 0);

  const questoesAuditoria = state.questoes.filter(q => {
    const texto = (q.titulo || q.enunciado || '').toLowerCase();
    return !searchAuditoria || texto.includes(searchAuditoria.toLowerCase());
  });

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
                {isTorneio ? 'Quest��es dos Torneios' : 'Teste de Conhecimento'}
              </h2>
              <p className="text-sm text-slate-500">
                {state.blocos.length} blocos � {state.blocos.reduce((total, b) => total + (b.questoes?.length || b.total_questoes || 0), 0)} quest�es
                {BlocosService && ' � Persistido no banco de dados'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { carregarBlocos(); carregarTorneios(); }}
              disabled={state.loading}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
              title="Recarregar"
            >
              <RefreshCw className={`w-5 h-5 ${state.loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => { setBlocoEditando(null); setShowBlocoForm(true); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white shadow-lg transition-all hover:scale-105 ${
                isTorneio
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                  : 'bg-gradient-to-r from-indigo-500 to-cyan-600 hover:from-indigo-600 hover:to-cyan-700'
              }`}
            >
              <Layers className="w-4 h-4" /> Criar Bloco de Quest�es
            </button>
          </div>
        </div>
      </div>

      {/* Mensagens */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-5 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {state.error}
        </div>
      )}
      {state.success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-5 py-3 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0" /> {state.success}
        </div>
      )}

      {/* Abas removidas - Os bot��es principais acima j� fazem esse trabalho */}

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filtroDisc}
            onChange={e => setFiltroDisc(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas as disciplinas</option>
            {DISCIPLINAS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
          <select
            value={filtroDif}
            onChange={e => setFiltroDif(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas as dificuldades</option>
            {DIFICULDADES.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
          <select
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os status</option>
            <option value="rascunho"> Rascunho</option>
            <option value="publicado"> Publicado</option>
          </select>
          {(filtroDisc || filtroDif || filtroStatus) && (
            <button
              onClick={() => { setFiltroDisc(''); setFiltroDif(''); setFiltroStatus(''); }}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* ABA BLOCOS */}
      {aba === 'blocos' && (
        <>
          {state.loading ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
              <p className="text-slate-500">Carregando blocos...</p>
            </div>
          ) : blocosPorDisc.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Nenhum bloco encontrado</p>
              <p className="text-slate-400 text-sm mt-1">Crie um bloco para come�ar a organizar quest�es.</p>
              <button
                onClick={() => { setBlocoEditando(null); setShowBlocoForm(true); }}
                className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
              >
                + Criar primeiro bloco
              </button>
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
                        questoes={state.questoes}
                        torneios={state.torneios}
                        assocMap={state.assocMap}
                        contexto={contexto}
                        token={token}
                        apiBase={apiBase}
                        onAddQuestao={(b) => { setBlocoAlvo(b); setShowCreateQuestao(true); }}
                        onEditQuestao={(q) => { setQuestaoEditando(q); setShowEditQuestao(true); }}
                        onRemoverQuestao={(q, b) => { setRemoverTarget({ questao: q, bloco: b }); setShowRemoverQuestao(true); }}
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
              <input
                type="text"
                placeholder="Buscar por t�tulo ou enunciado..."
                value={searchAuditoria}
                onChange={e => setSearchAuditoria(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            {state.loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
                <p className="text-slate-500">Carregando...</p>
              </div>
            ) : questoesAuditoria.length === 0 ? (
              <div className="p-8 text-center">
                <List className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Nenhuma quest�o encontrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase">Quest�o</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase">{isTorneio ? 'Disciplina' : 'Categoria'}</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase">Dificuldade</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase">Pts</th>
                      <th className="px-5 py-3 text-right text-xs font-bold text-slate-600 uppercase">A���es</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {questoesAuditoria.map(q => {
                      const disc = DISCIPLINAS.find(d => d.id === (q.disciplina || q.categoria));
                      const dif = DIFICULDADES.find(d => d.id === q.dificuldade);
                      const corDif = COR_DIFICULDADE[dif?.cor || 'green'];
                      const blocoOrigem = state.blocos.find(b => b.questaoIds?.includes(q.id) || b.questoes?.some(bq => bq.id === q.id));
                      return (
                        <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3 text-sm text-slate-700">
                            <div className="max-w-xs truncate font-medium" title={q.titulo || q.enunciado}>
                              {q.titulo || q.enunciado}
                            </div>
                            {blocoOrigem && (
                              <span className="text-xs text-slate-400 inline-block mt-1">
                                Bloco: {blocoOrigem.titulo}
                              </span>
                            )}
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
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => { setQuestaoEditando(q); setShowEditQuestao(true); }}
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                title="Editar quest�o"
                              >
                                <Edit className="w-3.5 h-3.5" />
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
          loading={saving}
          onClose={() => { setShowBlocoForm(false); setBlocoEditando(null); }}
          onSave={blocoEditando ? handleEditarBloco : handleCriarBloco}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteBloco && !!blocoParaDeletar}
        onClose={() => { setShowDeleteBloco(false); setBlocoParaDeletar(null); }}
        onConfirm={handleDeletarBloco}
        title="Excluir Bloco"
        message={`Excluir o bloco "${blocoParaDeletar?.titulo}"? As quest�es n�o ser�o apagadas, apenas removidas do bloco.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />

      {showCreateQuestao && blocoAlvo && contexto === 'torneio' && (
        <QuestaoFormUnificado
          questao={null}
          isOpen={showCreateQuestao && blocoAlvo && contexto === 'torneio'}
          onClose={() => { setShowCreateQuestao(false); setBlocoAlvo(null); }}
          onSave={handleSalvarNovaQuestaoBloco}
          disciplinaFixa={blocoAlvo?.disciplina}
          titulo="Criar Questão para o Bloco"
        />
      )}
      {showCreateQuestao && blocoAlvo && contexto === 'teste' && (
        <CreateQuestaoTesteForm
          categoriaFixa={blocoAlvo.disciplina}
          dificuldadeFixa={blocoAlvo.dificuldade}
          onClose={() => { setShowCreateQuestao(false); setBlocoAlvo(null); }}
          onSuccess={(questao) => handleQuestaoAdicionada(questao, blocoAlvo)}
        />
      )}

      {showEditQuestao && questaoEditando && contexto === 'torneio' && (
        <QuestaoFormUnificado
          questao={questaoEditando}
          isOpen={showEditQuestao && questaoEditando && contexto === 'torneio'}
          onClose={() => { setShowEditQuestao(false); setQuestaoEditando(null); }}
          onSave={handleSalvarEdicaoQuestao}
          disciplinaFixa={questaoEditando?.disciplina}
          titulo="Editar Questão"
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
        isOpen={showRemoverQuestao && !!removerTarget.questao}
        onClose={() => { setShowRemoverQuestao(false); setRemoverTarget({ questao: null, bloco: null }); }}
        onConfirm={handleRemoverQuestao}
        title="Remover Quest�o do Bloco"
        message={`Remover "${(removerTarget.questao?.titulo || removerTarget.questao?.enunciado || '').substring(0, 60)}..." do bloco "${removerTarget.bloco?.titulo}"? A quest�o n�o ser� deletada.`}
        confirmText="Remover"
        cancelText="Cancelar"
        type="warning"
      />
    </div>
  );
}

