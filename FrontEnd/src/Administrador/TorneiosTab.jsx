import React, { useState, useEffect } from "react";
import { 
  Trophy, Trash2, Eye, Search, 
  AlertTriangle, CheckCircle, X, Loader2,
  Calendar, Clock
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function TorneiosTab() {
  const { token } = useAuth();
  const [torneios, setTorneios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados dos Modais
  const [modalDelete, setModalDelete] = useState({ open: false, id: null, title: "" });
  const [modalView, setModalView] = useState({ open: false, data: null });
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;

  // Carregar lista inicial
  const fetchTorneios = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/torneos`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      // A rota admin retorna array direto
      setTorneios(Array.isArray(data) ? data : (data.tournaments || []));
    } catch (err) {
      showToast("Erro ao carregar torneios", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTorneios(); }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  // Lógica de Exclusão Corrigida
  const confirmDelete = async () => {
    if (!modalDelete.id) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/torneos/${modalDelete.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        // Atualização imediata da interface
        setTorneios(prev => prev.filter(t => t.id !== modalDelete.id));
        showToast("Torneio excluído com sucesso!");
        setModalDelete({ open: false, id: null, title: "" });
      } else {
        throw new Error("Erro na exclusão");
      }
    } catch (err) {
      showToast("Não foi possível excluir o torneio.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredTorneios = torneios.filter((t) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
      t.titulo?.toLowerCase().includes(query) ||
      t.disciplina?.toLowerCase().includes(query)
    );
  });

  const ModalOverlay = ({ children, onClose }) => (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-h-[90vh] flex flex-col"
        style={{ maxWidth: children.props.maxWidth || '500px' }}
      >
        {children}
      </div>
    </div>
  );

  return (
    <div className="p-2 sm:p-4">
      {/* Toolbar superior minimalista */}
      <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" placeholder="Buscar torneios..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela Responsiva */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Torneio</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Disciplina</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  Carregando torneios...
                </td>
              </tr>
            ) : filteredTorneios.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  Nenhum torneio encontrado.
                </td>
              </tr>
            ) : (
              filteredTorneios.map(t => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{t.titulo}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {new Date(t.inicia_em).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{t.disciplina}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      t.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setModalView({ open: true, data: t })}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => setModalDelete({ open: true, id: t.id, title: t.titulo })}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EXCLUSÃO (Corrigido e Proporcional) */}
      {modalDelete.open && (
        <ModalOverlay onClose={() => !isProcessing && setModalDelete({ open: false })}>
          <div maxWidth="450px" className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Excluir Torneio?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Você está prestes a excluir <strong>{modalDelete.title}</strong>. 
              Esta ação não pode ser desfeita e removerá todos os rankings associados.
            </p>
            <div className="flex gap-3 mt-4">
              <button 
                disabled={isProcessing}
                onClick={() => setModalDelete({ open: false })}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button 
                disabled={isProcessing}
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : "Sim, Excluir"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* MODAL DE VISUALIZAÇÃO (Conteúdo Organizado) */}
      {modalView.open && (
        <ModalOverlay onClose={() => setModalView({ open: false })}>
          <div maxWidth="650px" className="flex flex-col h-full">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Trophy size={18} className="text-blue-600" /> Detalhes do Torneio
              </h3>
              <button onClick={() => setModalView({ open: false })} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <span className="text-[10px] uppercase font-black text-blue-500 block mb-1">Título</span>
                  <p className="font-bold text-gray-800">{modalView.data?.titulo}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                  <span className="text-[10px] uppercase font-black text-purple-500 block mb-1">Disciplina</span>
                  <p className="font-bold text-gray-800">{modalView.data?.disciplina}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-black text-gray-400 block mb-2">Descrição</span>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {modalView.data?.descricao || "Sem descrição disponível."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-500"><Calendar size={16}/></div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Início</span>
                    <span className="text-xs font-bold">{modalView.data?.inicia_em ? new Date(modalView.data.inicia_em).toLocaleDateString() : "-"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-500"><Clock size={16}/></div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Fim</span>
                    <span className="text-xs font-bold">{modalView.data?.termina_em ? new Date(modalView.data.termina_em).toLocaleDateString() : "-"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-right">
              <button 
                onClick={() => setModalView({ open: false })}
                className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all"
              >
                Fechar Janela
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* TOAST FEEDBACK */}
      {toast.show && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-[200] ${
            toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'
          }`}
        >
          {toast.type === 'error' ? <AlertTriangle size={18}/> : <CheckCircle size={18} className="text-green-400"/>}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
