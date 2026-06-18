/**
 * ColaboradoresTab.jsx
 *
 * Painel completo de gestÃ£o de colaboradores/professores no AdminDashboard.
 * - VisualizaÃ§Ã£o persistente de todos os colaboradores (pendentes, aprovados, rejeitados, suspensos)
 * - Aprovar / rejeitar / suspender
 * - Visualizar documentos enviados com preview e download
 * - Criar colaborador manualmente
 * - AtualizaÃ§Ã£o em tempo real via Socket.IO (sem polling)
 */

import { useState, useEffect } from 'react';
import adminService from './adminService';
import { useAuth } from '../context/AuthContext';
import useSocketColaboradores from '../hooks/useSocketColaboradores';
import {
  Users, CheckCircle, XCircle, AlertCircle, Search, Clock,
  Mail, GraduationCap, User, Eye, EyeOff, FileText, Image,
  Download, RefreshCw, UserPlus, Ban, ChevronDown,
  BookOpen, Code, Calculator, X,
} from 'lucide-react';

/* â”€â”€â”€ helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const STATUS_CONFIG = {
  pendente:  { label: 'Pendente',   cls: 'bg-blue-100 text-blue-800'  },
  aprovado:  { label: 'Aprovado',   cls: 'bg-blue-200 text-blue-900'  },
  rejeitado: { label: 'Rejeitado',  cls: 'bg-blue-300 text-blue-900'      },
  suspenso:  { label: 'Suspenso',   cls: 'bg-slate-200 text-slate-700'    },
};

const DISCIPLINA_ICONS = {
  matematica:  <Calculator size={14} className="text-blue-500" />,
  programacao: <Code       size={14} className="text-green-500" />,
  ingles:      <BookOpen   size={14} className="text-purple-500" />,
  // Adicionar mais disciplinas comuns
  fisico:      <BookOpen   size={14} className="text-red-500" />,
  quimica:     <BookOpen   size={14} className="text-orange-500" />,
  biologia:    <BookOpen   size={14} className="text-green-600" />,
  historia:    <BookOpen   size={14} className="text-yellow-600" />,
  geografia:   <BookOpen   size={14} className="text-blue-600" />,
};

const NIVEIS_LABEL = {
  estudante_universitario: 'Estudante universitÃ¡rio',
  tecnico:    'TÃ©cnico',
  licenciado: 'Licenciado',
  mestre:     'Mestre',
  doutor:     'Doutor',
  professor:  'Professor',
  profissional: 'Profissional',
  outro:      'Outro',
};

const DISCIPLINAS = [
  { value: 'matematica',  label: 'MatemÃ¡tica' },
  { value: 'programacao', label: 'ProgramaÃ§Ã£o' },
  { value: 'ingles',      label: 'InglÃªs' },
];

function formatDate(d) {
  if (!d) return 'â€”';
  return new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatBytes(b) {
  if (!b) return 'â€”';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(tipo) {
  if (tipo?.startsWith('image/')) return <Image size={16} className="text-blue-500" />;
  return <FileText size={16} className="text-gray-500" />;
}

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3002`;

/* â”€â”€â”€ Badge de status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'bg-gray-100 text-gray-700' };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>{cfg.label}</span>;
}

/* â”€â”€â”€ Modal de detalhes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function ModalDetalhes({ colaborador, onClose, onAprovar, onRejeitar, onSuspender, loadingId, svc }) {
  const [docs, setDocs]         = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  
  const [questoes, setQuestoes]         = useState([]);
  const [loadingQuestoes, setLoadingQuestoes] = useState(false);
  const [showQuestoes, setShowQuestoes] = useState(false);

  const carregarDocs = async () => {
    if (showDocs) { setShowDocs(false); return; }
    setLoadingDocs(true);
    try {
      const res = await svc.colaboradores.getDocumentos(colaborador.id);
      // Backend retorna { success: true, data: [...] }
      // axios jÃ¡ desembrulha em .data, entÃ£o res Ã© { success: true, data: [...] }
      console.log('ðŸ“„ [ModalDetalhes] carregarDocs - Resposta API:', res);
      
      let docs = res.data || [];
      
      // Garantir que docs Ã© sempre um array
      if (typeof docs === 'string') {
        console.warn('âš ï¸ Documentos vÃªm como string, fazendo parse...');
        try {
          docs = JSON.parse(docs);
        } catch {
          docs = [];
        }
      }
      
      // Se nÃ£o for array, retornar vazio
      if (!Array.isArray(docs)) {
        console.warn('âš ï¸ Documentos nÃ£o Ã© array:', typeof docs, docs);
        docs = [];
      }
      
      console.log('âœ… Documentos apÃ³s tratamento:', docs);
      setDocs(docs);
      
    } catch (err) { 
      console.error('âŒ [ModalDetalhes] Erro ao carregar documentos:', err);
      console.error('âŒ [ModalDetalhes] Status:', err.response?.status);
      console.error('âŒ [ModalDetalhes] Mensagem:', err.response?.data?.message);
      console.error('âŒ [ModalDetalhes] Detalhes completos:', err.response?.data);
      setDocs([]); 
    }
    finally { setLoadingDocs(false); setShowDocs(true); }
  };

  const carregarQuestoes = async () => {
    if (showQuestoes) { setShowQuestoes(false); return; }
    setLoadingQuestoes(true);
    try {
      const res = await svc.colaboradores.getQuestoes(colaborador.id, { limite: 100 });
      setQuestoes(res.dados?.questoes || []);
    } catch (err) { 
      console.error('Erro ao carregar questÃµes:', err);
      setQuestoes([]); 
    }
    finally { setLoadingQuestoes(false); setShowQuestoes(true); }
  };

  const c = colaborador;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 flex items-center justify-between rounded-t-2xl">
          <h3 className="font-bold text-gray-800 text-base md:text-lg">Perfil do Colaborador</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex-shrink-0">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-4 md:space-y-5">
          {/* Avatar + Nome */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg md:text-xl overflow-hidden flex-shrink-0">
              {c.imagem ? <img src={c.imagem} alt={c.nome} className="w-full h-full object-cover" /> : (c.nome?.[0] || 'C')}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-800 text-sm md:text-base truncate">{c.nome}</h4>
              <p className="text-gray-500 text-xs md:text-sm truncate">{c.username ? `@${c.username}` : c.email}</p>
              <StatusBadge status={c.status_colaborador || 'pendente'} />
            </div>
          </div>

          {/* Dados pessoais */}
          <div className="grid grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm">
            {[
              ['E-mail',      c.email],
              ['Telefone',    c.telefone || 'â€”'],
              ['GÃ©nero',      c.sexo || 'â€”'],
              ['Nascimento',  formatDate(c.nascimento)],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-gray-400 text-xs mb-0.5">{label}</p>
                <p className="font-medium text-gray-800 truncate text-xs md:text-sm">{val}</p>
              </div>
            ))}
          </div>

          {/* Dados acadÃ©micos */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 md:p-4 space-y-2 text-xs md:text-sm">
            <p className="font-semibold text-blue-800 text-xs uppercase tracking-wide mb-1">Dados AcadÃ©micos</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-gray-400 text-xs">Ãrea de atuaÃ§Ã£o</p>
                <div className="flex items-center gap-1 font-medium capitalize text-gray-800 text-xs md:text-sm">
                  {DISCIPLINA_ICONS[c.disciplina_colaborador] && (
                    DISCIPLINA_ICONS[c.disciplina_colaborador]
                  )}
                  <span>{(c.disciplina_colaborador || 'â€”').replace('_', ' ')}</span>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs">NÃ­vel acadÃ©mico</p>
                <p className="font-medium text-gray-800">{NIVEIS_LABEL[c.nivel_academico] || c.nivel_academico || 'â€”'}</p>
              </div>
            </div>
          </div>

          {/* Biografia */}
          {c.biografia && (
            <div>
              <p className="text-gray-400 text-xs mb-1">Biografia profissional</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl border border-gray-200 p-3 leading-relaxed whitespace-pre-line">
                {c.biografia}
              </p>
            </div>
          )}

          {/* Documentos */}
          <div>
            <button onClick={carregarDocs}
              className="flex items-center gap-2 text-sm text-blue-600 font-semibold hover:underline">
              {loadingDocs
                ? <><RefreshCw size={14} className="animate-spin" /> Carregando documentos...</>
                : showDocs
                ? <><EyeOff size={14} /> Ocultar documentos</>
                : <><Eye size={14} /> Ver documentos enviados</>}
            </button>

            {showDocs && (
              !Array.isArray(docs) || docs.length === 0
                ? <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                    ðŸ“„ Nenhum documento foi enviado por este colaborador.
                  </div>
                : (
                  <ul className="mt-2 space-y-2">
                    {Array.isArray(docs) && docs.map((doc, i) => (
                      <li key={i} className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                        {fileIcon(doc.tipo)}
                        <span className="flex-1 truncate font-medium">{doc.nome_original}</span>
                        <span className="text-gray-400 flex-shrink-0">{formatBytes(doc.tamanho)}</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-400 flex-shrink-0">{formatDate(doc.data_upload)}</span>
                        <a href={`${API_BASE}${doc.caminho}`} target="_blank" rel="noreferrer" title="Abrir"
                          className="text-blue-500 hover:text-blue-700 flex-shrink-0">
                          <Eye size={14} />
                        </a>
                        <a href={`${API_BASE}${doc.caminho}`} download={doc.nome_original} title="Download"
                          className="text-gray-400 hover:text-gray-700 flex-shrink-0">
                          <Download size={14} />
                        </a>
                      </li>
                    ))}
                  </ul>
                )
            )}
          </div>

          {/* QuestÃµes Criadas */}
          <div>
            <button onClick={carregarQuestoes}
              className="flex items-center gap-2 text-sm text-blue-600 font-semibold hover:underline">
              {loadingQuestoes
                ? <><RefreshCw size={14} className="animate-spin" /> Carregando questÃµes...</>
                : showQuestoes
                ? <><EyeOff size={14} /> Ocultar questÃµes</>
                : <><Eye size={14} /> Ver questÃµes criadas</>}
            </button>

            {showQuestoes && (
              questoes.length === 0
                ? <p className="text-xs text-gray-400 mt-2">Nenhuma questÃ£o criada.</p>
                : (
                  <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                    {questoes.map((q, i) => (
                      <div key={i} className="px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-medium text-gray-800 flex-1 truncate">{q.enunciado}</p>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${
                            q.status_aprovacao === 'aprovada' ? 'bg-green-100 text-green-700' :
                            q.status_aprovacao === 'rejeitada' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {q.status_aprovacao === 'aprovada' ? 'Aprovada' :
                             q.status_aprovacao === 'rejeitada' ? 'Rejeitada' : 'Pendente'}
                          </span>
                        </div>
                        <div className="flex gap-3 text-gray-500">
                          {q.tipo && <span>ðŸ“ {q.tipo}</span>}
                          {q.dificuldade && <span>ðŸ“Š {q.dificuldade}</span>}
                          {q.bloco?.titulo && <span>ðŸ“¦ {q.bloco.titulo}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )
            )}
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
            <div><span className="font-medium">Registo:</span> {formatDate(c.createdAt)}</div>
            <div><span className="font-medium">Ãšltima actividade:</span> {formatDate(c.updatedAt)}</div>
          </div>

          {/* AÃ§Ãµes */}
          {(c.status_colaborador === 'pendente' || c.status_colaborador === 'aprovado') && (
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              {c.status_colaborador === 'pendente' && (
                <button onClick={() => onAprovar(c)}
                  disabled={loadingId === c.id}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-1">
                  <CheckCircle size={15} /> Aprovar
                </button>
              )}
              {c.status_colaborador === 'pendente' && (
                <button onClick={() => onRejeitar(c)}
                  disabled={loadingId === c.id}
                  className="flex-1 py-2.5 border border-red-300 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50 transition disabled:opacity-50 flex items-center justify-center gap-1">
                  <XCircle size={15} /> Rejeitar
                </button>
              )}
              {c.status_colaborador === 'aprovado' && (
                <button onClick={() => onSuspender(c)}
                  disabled={loadingId === c.id}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center gap-1">
                  <Ban size={15} /> Suspender
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* â”€â”€â”€ Modal de aprovaÃ§Ã£o (confirmaÃ§Ã£o simples) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function ModalAprovar({ colaborador, onConfirm, onCancel, loading }) {
  // DEBUG: Log exatamente o que estamos recebendo
  console.log('ðŸ” [ModalAprovar] Colaborador recebido:');
  console.log('   ID:', colaborador?.id);
  console.log('   Nome:', colaborador?.nome);
  console.log('   Raw disciplina_colaborador:', JSON.stringify(colaborador?.disciplina_colaborador));
  console.log('   Tipo:', typeof colaborador?.disciplina_colaborador);
  console.log('   Length:', colaborador?.disciplina_colaborador?.length);
  
  // Tentar mÃºltiplas formas de extrair disciplina
  let disciplina = '';
  
  if (colaborador?.disciplina_colaborador) {
    const raw = colaborador.disciplina_colaborador;
    
    // Se for string, fazer trim
    if (typeof raw === 'string') {
      disciplina = raw.trim();
    } else {
      // Se for objeto ou array, converter para string
      disciplina = String(raw).trim();
    }
  }
  
  console.log('   Disciplina apÃ³s processamento:', disciplina);
  console.log('   tem Disciplina?', disciplina.length > 0);
  
  const temDisciplina = disciplina.length > 0;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto p-4 md:p-6">
        <h3 className="font-bold text-gray-800 text-base md:text-lg mb-1">Confirmar AprovaÃ§Ã£o</h3>
        <p className="text-gray-500 text-xs md:text-sm mb-4">
          Tem a certeza que pretende aprovar <strong>{colaborador.nome}</strong>?
        </p>
        
        {/* Disciplina Box */}
        <div className={`border rounded-lg p-3 mb-4 text-xs md:text-sm ${
          temDisciplina
            ? 'bg-blue-50 border-blue-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <p className={temDisciplina ? 'text-gray-700' : 'text-red-700'}>
            <span className="font-semibold">Disciplina:</span> {' '}
            <span className="capitalize">
              {temDisciplina 
                ? disciplina.replace('_', ' ') 
                : 'âš ï¸ NÃ£o preenchida no cadastro'}
            </span>
          </p>
          {!temDisciplina && (
            <p className="text-red-600 text-xs mt-2">
              O colaborador precisa preencher a disciplina antes de ser aprovado.
            </p>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-2">
          <button onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl font-medium text-xs md:text-sm hover:bg-gray-50 order-2 md:order-1">
            Cancelar
          </button>
          <button onClick={() => onConfirm()}
            disabled={loading || !temDisciplina}
            className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-xs md:text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 order-1 md:order-2">
            {loading ? <><RefreshCw size={14} className="animate-spin" /> A processar...</> : <><CheckCircle size={14} /> Aprovar</>}
          </button>
        </div>
        
        {!temDisciplina && (
          <p className="text-xs text-red-600 mt-3 text-center">
            ðŸ’¡ Rejeite ou contacte o colaborador para preencher o cadastro.
          </p>
        )}
      </div>
    </div>
  );
}

/* â”€â”€â”€ Modal de rejeiÃ§Ã£o â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function ModalRejeitar({ colaborador, onConfirm, onCancel, loading }) {
  const [motivo, setMotivo] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto p-4 md:p-6" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-gray-800 text-base md:text-lg mb-1">Rejeitar Candidatura</h3>
        <p className="text-gray-500 text-xs md:text-sm mb-3">
          Tem a certeza que pretende rejeitar <strong>{colaborador.nome}</strong>?
        </p>
        <textarea
          value={motivo} onChange={e => setMotivo(e.target.value)} rows={3}
          placeholder="Motivo da rejeiÃ§Ã£o (opcional)"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-xs md:text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
        />
        <div className="flex flex-col md:flex-row gap-2">
          <button onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl font-medium text-xs md:text-sm hover:bg-gray-50 order-2 md:order-1">
            Cancelar
          </button>
          <button onClick={() => onConfirm(motivo)}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-xs md:text-sm hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1 order-1 md:order-2">
            {loading ? <><RefreshCw size={14} className="animate-spin" /> A processar...</> : <><XCircle size={14} /> Rejeitar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* â”€â”€â”€ Modal de suspensÃ£o â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function ModalSuspender({ colaborador, onConfirm, onCancel, loading }) {
  const [motivo, setMotivo] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto p-4 md:p-6" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-gray-800 text-base md:text-lg mb-1">Suspender Colaborador</h3>
        <p className="text-gray-500 text-xs md:text-sm mb-3">
          Tem a certeza que pretende suspender <strong>{colaborador.nome}</strong>? Esta aÃ§Ã£o notificarÃ¡ o colaborador.
        </p>
        
        {/* Warning Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-xs md:text-sm">
          <p className="text-amber-800">
            <span className="font-semibold">âš ï¸ AtenÃ§Ã£o:</span> O colaborador serÃ¡ notificado imediatamente desta suspensÃ£o e nÃ£o poderÃ¡ mais criar questÃµes ou participar em torneios.
          </p>
        </div>
        
        <textarea
          value={motivo} onChange={e => setMotivo(e.target.value)} rows={3}
          placeholder="Motivo da suspensÃ£o (opcional)"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-xs md:text-sm outline-none focus:ring-2 focus:ring-amber-500 resize-none mb-4"
        />
        <div className="flex flex-col md:flex-row gap-2">
          <button onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl font-medium text-xs md:text-sm hover:bg-gray-50 order-2 md:order-1">
            Cancelar
          </button>
          <button onClick={() => onConfirm()}
            disabled={loading}
            className="flex-1 py-2.5 bg-amber-600 text-white rounded-xl font-semibold text-xs md:text-sm hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-1 order-1 md:order-2">
            {loading ? <><RefreshCw size={14} className="animate-spin" /> A processar...</> : <><Ban size={14} /> Suspender</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* â”€â”€â”€ Componente principal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function ColaboradoresTab() {
  const { token } = useAuth();
  const svc = adminService(token);

  const [lista, setLista]                   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [loadingId, setLoadingId]           = useState(null);
  const [busca, setBusca]                   = useState('');
  const [filtroStatus, setFiltroStatus]     = useState('todos');
  const [feedback, setFeedback]             = useState(null);
  const [detalhes, setDetalhes]             = useState(null);
  const [modalAprovar, setModalAprovar]     = useState(null);
  const [modalRejeitar, setModalRejeitar]   = useState(null);
  const [modalSuspender, setModalSuspender] = useState(null);

  // âœ… Socket.IO para atualizaÃ§Ãµes em tempo real
  useSocketColaboradores({
    onNovoColaborador: (data) => {
      console.log('âœ… Novo colaborador recebido via Socket:', data);
      toast('success', `ðŸ“¢ Novo colaborador: ${data.nome}`);
      // Recarregar lista automaticamente
      carregar();
    },
    onAprovado: (data) => {
      console.log('âœ… Colaborador aprovado via Socket:', data);
      toast('success', `âœ… ${data.nome} foi aprovado`);
      carregar();
    },
    onRejeitado: (data) => {
      console.log('âŒ Colaborador rejeitado via Socket:', data);
      toast('info', `âŒ ${data.nome} foi rejeitado`);
      carregar();
    },
    onSuspenso: (data) => {
      console.log('ðŸš« Colaborador suspenso via Socket:', data);
      toast('info', `ðŸš« ${data.nome} foi suspenso`);
      carregar();
    },
    onAtualizacao: (data) => {
      console.log('ðŸ”„ AtualizaÃ§Ã£o de colaboradores via Socket');
      carregar();
    },
    enabled: true
  });

  const toast = (tipo, msg) => {
    setFeedback({ tipo, msg });
    setTimeout(() => setFeedback(null), 3500);
  };

  const carregar = async () => {
    try {
      setLoading(true);
      const res = await svc.colaboradores.listarColaboradores();
      setLista(res.data || []);
    } catch {
      toast('error', 'Erro ao carregar colaboradores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  /* â”€â”€ filtro â”€â”€ */
  const filtrado = lista.filter(c => {
    const status = c.status_colaborador || 'pendente';
    if (filtroStatus !== 'todos' && status !== filtroStatus) return false;
    if (!busca.trim()) return true;
    const q = busca.toLowerCase();
    return (
      c.nome?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.username?.toLowerCase().includes(q) ||
      c.disciplina_colaborador?.toLowerCase().includes(q)
    );
  });

  /* â”€â”€ stats â”€â”€ */
  const stats = {
    total:    lista.length,
    pendente: lista.filter(c => (c.status_colaborador || 'pendente') === 'pendente').length,
    aprovado: lista.filter(c => c.status_colaborador === 'aprovado').length,
    rejeitado: lista.filter(c => c.status_colaborador === 'rejeitado').length,
    suspenso: lista.filter(c => c.status_colaborador === 'suspenso').length,
  };

  /* â”€â”€ handlers â”€â”€ */
  const handleAprovar = async () => {
    const c = modalAprovar;
    
    // DEBUG: Log exatamente o que estÃ¡ no objeto
    console.log('ðŸ” [handleAprovar] Iniciado:');
    console.log('   Colaborador ID:', c?.id);
    console.log('   Nome:', c?.nome);
    console.log('   disciplina_colaborador raw:', JSON.stringify(c?.disciplina_colaborador));
    
    let disciplina = '';
    if (c?.disciplina_colaborador) {
      const raw = c.disciplina_colaborador;
      if (typeof raw === 'string') {
        disciplina = raw.trim();
      } else {
        disciplina = String(raw).trim();
      }
    }
    
    console.log('   Disciplina apÃ³s trim:', disciplina);
    console.log('   Comprimento:', disciplina.length);
    console.log('   isEmpty?', !disciplina || disciplina === '');
    
    if (!disciplina) {
      toast('error', 'O colaborador nÃ£o preencheu a disciplina no cadastro. Contacte-o ou rejeite a solicitaÃ§Ã£o.');
      return;
    }
    
    try {
      setLoadingId(c.id);
      console.log('âœ… Aprovando colaborador:', c.id, 'com disciplina:', disciplina);
      await svc.colaboradores.aprovarColaborador(c.id, disciplina);
      toast('success', `${c.nome} aprovado com sucesso!`);
      setModalAprovar(null);
      setDetalhes(null);
      await carregar();
    } catch (err) {
      console.error('âŒ Erro ao aprovar:', err);
      const mensagemErro = err.response?.data?.message || err.response?.data?.fieldErrors?.disciplina_colaborador || 'Erro ao aprovar colaborador.';
      toast('error', mensagemErro);
    } finally {
      setLoadingId(null);
      // Resetar o filtro para 'aprovado' SEMPRE, mesmo em caso de erro
      setTimeout(() => {
        console.log('ðŸ”„ [finally setTimeout] Resetando filtro para aprovado');
        setFiltroStatus('aprovado');
      }, 100);
    }
  };

  const handleRejeitar = async (motivo) => {
    const c = modalRejeitar;
    try {
      setLoadingId(c.id);
      await svc.colaboradores.rejeitarColaborador(c.id, { motivo });
      toast('success', `Candidatura de ${c.nome} rejeitada.`);
      setModalRejeitar(null);
      setDetalhes(null);
      await carregar();
    } catch {
      toast('error', 'Erro ao rejeitar colaborador.');
    } finally {
      setLoadingId(null);
      // Resetar o filtro para 'rejeitado' SEMPRE, mesmo em caso de erro
      setTimeout(() => {
        console.log('ðŸ”„ [finally setTimeout] Resetando filtro para rejeitado');
        setFiltroStatus('rejeitado');
      }, 100);
    }
  };

  const handleSuspender = async () => {
    const c = modalSuspender;
    try {
      setLoadingId(c.id);
      await svc.colaboradores.suspenderColaborador(c.id);
      toast('success', `${c.nome} suspenso com sucesso!`);
      setModalSuspender(null);
      setDetalhes(null);
      await carregar();
    } catch (err) {
      console.error('âŒ Erro ao suspender:', err);
      toast('error', 'Erro ao suspender colaborador.');
    } finally {
      setLoadingId(null);
      // Resetar o filtro para 'suspenso' SEMPRE, mesmo em caso de erro
      setTimeout(() => {
        setFiltroStatus('suspenso');
      }, 100);
    }
  };

  /* â”€â”€ render â”€â”€ */
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200">

      {/* Feedback */}
      {feedback && (
        <div className={`mx-6 mt-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${
          feedback.tipo === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {feedback.tipo === 'success'
            ? <CheckCircle size={14} className="flex-shrink-0" />
            : <AlertCircle size={14} className="flex-shrink-0" />}
          {feedback.msg}
        </div>
      )}

      {/* Header */}
      <div className="px-4 md:px-6 py-4 md:py-5 border-b border-slate-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
              <Users size={18} className="md:w-5 md:h-5" /> GestÃ£o de Colaboradores
            </h2>
            <p className="text-slate-500 text-xs md:text-sm mt-0.5">
              SupervisÃ£o pedagÃ³gica permanente â€” {stats.total} colaborador{stats.total !== 1 ? 'es' : ''} registado{stats.total !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" placeholder="Pesquisar..." value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full md:w-52 pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button onClick={carregar} disabled={loading}
              className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition flex-shrink-0">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Stats strip - Scrollable on mobile */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {[
            { key: 'todos',    label: 'Todos',    val: stats.total,    cls: 'bg-slate-100 text-slate-700' },
            { key: 'pendente', label: 'Pendentes', val: stats.pendente, cls: 'bg-blue-100 text-blue-800' },
            { key: 'aprovado', label: 'Aprovados', val: stats.aprovado, cls: 'bg-blue-200 text-blue-900' },
            { key: 'rejeitado',label: 'Rejeitados',val: stats.rejeitado,cls: 'bg-blue-300 text-blue-900' },
            { key: 'suspenso', label: 'Suspensos', val: stats.suspenso, cls: 'bg-slate-100 text-slate-700' },
          ].map(s => (
            <button key={s.key}
              onClick={() => setFiltroStatus(s.key)}
              className={`px-2.5 py-1.5 md:px-3 rounded-full text-xs font-semibold transition whitespace-nowrap flex-shrink-0 ${s.cls} ${
                filtroStatus === s.key ? 'ring-2 ring-offset-1 ring-blue-500' : 'opacity-80 hover:opacity-100'
              }`}>
              {s.label} ({s.val})
            </button>
          ))}
        </div>
      </div>

      {/* ConteÃºdo */}
      <div className="p-3 md:p-4">
        {loading ? (
          <div className="py-16 text-center">
            <RefreshCw size={28} className="animate-spin text-blue-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">A carregar colaboradores...</p>
          </div>
        ) : filtrado.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhum colaborador encontrado</p>
            <p className="text-gray-400 text-sm mt-1">
              {busca ? 'Tente outra pesquisa.' : 'Ainda nÃ£o hÃ¡ colaboradores nesta categoria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-3 md:mx-0">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 md:py-3 px-3 text-xs font-semibold text-gray-400 uppercase">Colaborador</th>
                  <th className="text-left py-2 md:py-3 px-3 text-xs font-semibold text-gray-400 uppercase hidden md:table-cell">Ãrea</th>
                  <th className="text-left py-2 md:py-3 px-3 text-xs font-semibold text-gray-400 uppercase hidden lg:table-cell">NÃ­vel</th>
                  <th className="text-left py-2 md:py-3 px-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                  <th className="text-left py-2 md:py-3 px-3 text-xs font-semibold text-gray-400 uppercase hidden md:table-cell">Registo</th>
                  <th className="text-right py-2 md:py-3 px-3 text-xs font-semibold text-gray-400 uppercase">AÃ§Ãµes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtrado.map(c => {
                  const status = c.status_colaborador || 'pendente';
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      {/* Nome + email */}
                      <td className="py-2 md:py-3 px-3">
                        <div className="flex items-center gap-2 md:gap-3 min-w-0">
                          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs md:text-sm flex-shrink-0 overflow-hidden">
                            {c.imagem
                              ? <img src={c.imagem} alt={c.nome} className="w-full h-full object-cover" />
                              : (c.nome?.[0] || 'C')}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-800 text-xs md:text-sm truncate">{c.nome}</p>
                            <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                              <Mail size={10} className="flex-shrink-0" /> {c.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Ãrea */}
                      <td className="py-2 md:py-3 px-3 hidden md:table-cell">
                        <div className="flex items-center gap-1 capitalize text-gray-700 text-xs md:text-sm">
                          {DISCIPLINA_ICONS[c.disciplina_colaborador] && (
                            DISCIPLINA_ICONS[c.disciplina_colaborador]
                          )}
                          <span>{(c.disciplina_colaborador || 'â€”').replace('_', ' ')}</span>
                        </div>
                      </td>
                      {/* NÃ­vel */}
                      <td className="py-2 md:py-3 px-3 hidden lg:table-cell text-gray-600 text-xs">
                        {NIVEIS_LABEL[c.nivel_academico] || 'â€”'}
                      </td>
                      {/* Status */}
                      <td className="py-2 md:py-3 px-3">
                        <StatusBadge status={status} />
                      </td>
                      {/* Data */}
                      <td className="py-2 md:py-3 px-3 hidden md:table-cell text-gray-500 text-xs">
                        {formatDate(c.createdAt)}
                      </td>
                      {/* AÃ§Ãµes */}
                      <td className="py-2 md:py-3 px-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setDetalhes(c)} title="Ver detalhes"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition flex-shrink-0">
                            <Eye size={14} className="md:w-4 md:h-4" />
                          </button>
                          {status === 'pendente' && (
                            <>
                              <button onClick={() => setModalAprovar(c)} disabled={loadingId === c.id}
                                title="Aprovar"
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-40 flex-shrink-0">
                                <CheckCircle size={14} className="md:w-4 md:h-4" />
                              </button>
                              <button onClick={() => setModalRejeitar(c)} disabled={loadingId === c.id}
                                title="Rejeitar"
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-40 flex-shrink-0">
                                <XCircle size={14} className="md:w-4 md:h-4" />
                              </button>
                            </>
                          )}
                          {status === 'aprovado' && (
                            <button onClick={() => setModalSuspender(c)} disabled={loadingId === c.id}
                              title="Suspender"
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-40 flex-shrink-0">
                              <Ban size={14} className="md:w-4 md:h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 px-3 py-3 border-t border-gray-100 md:mx-0 mx-3">
              {filtrado.length} de {lista.length} colaborador{lista.length !== 1 ? 'es' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Modais */}
      {detalhes && (
        <ModalDetalhes
          colaborador={detalhes}
          onClose={() => setDetalhes(null)}
          onAprovar={(c) => { setDetalhes(null); setModalAprovar(c); }}
          onRejeitar={(c) => { setDetalhes(null); setModalRejeitar(c); }}
          onSuspender={(c) => { setDetalhes(null); setModalSuspender(c); }}
          loadingId={loadingId}
          svc={svc}
        />
      )}
      {modalAprovar && (
        <ModalAprovar
          colaborador={modalAprovar}
          onConfirm={handleAprovar}
          onCancel={() => setModalAprovar(null)}
          loading={loadingId === modalAprovar.id}
        />
      )}
      {modalRejeitar && (
        <ModalRejeitar
          colaborador={modalRejeitar}
          onConfirm={handleRejeitar}
          onCancel={() => setModalRejeitar(null)}
          loading={loadingId === modalRejeitar.id}
        />
      )}
      {modalSuspender && (
        <ModalSuspender
          colaborador={modalSuspender}
          onConfirm={handleSuspender}
          onCancel={() => setModalSuspender(null)}
          loading={loadingId === modalSuspender.id}
        />
      )}
    </div>
  );
}

