/**
 * CertificadosTab.jsx
 * Gerenciamento administrativo de certificados
 * Permite visualizar, filtrar e gerenciar todos os certificados emitidos
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Award,
  Search,
  Download,
  Eye,
  Filter,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trophy,
  Calendar,
  User,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
  gerado: {
    label: 'Gerado',
    className: 'bg-blue-100 text-blue-700',
    icon: FileText,
    description: 'Certificado gerado'
  },
  validado: {
    label: 'Validado',
    className: 'bg-green-100 text-green-700',
    icon: CheckCircle,
    description: 'Certificado validado'
  },
  cancelado: {
    label: 'Cancelado',
    className: 'bg-red-100 text-red-700',
    icon: XCircle,
    description: 'Certificado cancelado'
  },
};

const MEDAL_CONFIG = {
  1: { 
    label: 'Ouro', 
    icon: Trophy,
    color: 'text-yellow-600', 
    bg: 'bg-yellow-50',
    position: '1º Lugar'
  },
  2: { 
    label: 'Prata', 
    icon: Award,
    color: 'text-gray-600', 
    bg: 'bg-gray-50',
    position: '2º Lugar'
  },
  3: { 
    label: 'Bronze', 
    icon: Award,
    color: 'text-orange-600', 
    bg: 'bg-orange-50',
    position: '3º Lugar'
  },
};

export default function CertificadosTab() {
  const { token } = useAuth();
  
  // Função helper para renderizar ícones
  const renderIcon = (iconComponent, size = 16) => {
    if (typeof iconComponent === 'function' || typeof iconComponent === 'object') {
      const IconComponent = iconComponent;
      return <IconComponent size={size} className="flex-shrink-0" />;
    }
    return <span>{iconComponent}</span>;
  };

  // Estado de dados
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtros
  const [filterDisciplina, setFilterDisciplina] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPosicao, setFilterPosicao] = useState('');

  // Estado de processamento
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const apiBase = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3002`;

  // ============================================
  // CARREGAR CERTIFICADOS
  // ============================================
  const fetchCertificados = useCallback(async () => {
    try {
      setLoading(true);
      console.log('[CertificadosTab] Carregando certificados...');

      const response = await fetch(`${apiBase}/api/certificados/admin/todos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar certificados');
      }

      const data = await response.json();
      console.log('[CertificadosTab] Certificados carregados:', data?.data?.length || 0);

      setCertificados(data.data || []);
    } catch (err) {
      console.error('[CertificadosTab] Erro ao carregar certificados:', err);
      showToast('Erro ao carregar certificados', 'error');
      setCertificados([]);
    } finally {
      setLoading(false);
    }
  }, [token, apiBase]);

  useEffect(() => {
    if (token) {
      fetchCertificados();
    }
  }, [token, fetchCertificados]);

  // ============================================
  // NOTIFICAááES
  // ============================================
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  }, []);

  // ============================================
  // FILTRAR CERTIFICADOS
  // ============================================
  const filteredCertificados = certificados.filter(cert => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch = !query || 
      cert.usuario?.nome?.toLowerCase().includes(query) ||
      cert.torneio?.titulo?.toLowerCase().includes(query) ||
      cert.codigo_certificado?.toLowerCase().includes(query);

    const matchesDisciplina = !filterDisciplina || cert.disciplina === filterDisciplina;
    const matchesStatus = !filterStatus || cert.status === filterStatus;
    const matchesPosicao = !filterPosicao || cert.posicao === parseInt(filterPosicao);

    return matchesSearch && matchesDisciplina && matchesStatus && matchesPosicao;
  });

  // ============================================
  // ESTATáSTICAS
  // ============================================
  const stats = {
    total: certificados.length,
    gerados: certificados.filter(c => c.status === 'gerado').length,
    validados: certificados.filter(c => c.status === 'validado').length,
    cancelados: certificados.filter(c => c.status === 'cancelado').length,
  };

  // ============================================
  // FORMATAR DATA
  // ============================================
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  // ============================================
  // RENDERIZAááO
  // ============================================
  return (
    <div className="p-2 sm:p-4">
      {/* Header com Estatásticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Award className="text-blue-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-xs text-gray-500">Total de Certificados</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="text-blue-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.gerados}</div>
              <div className="text-xs text-gray-500">Gerados</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.validados}</div>
              <div className="text-xs text-gray-500">Validados</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="text-red-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.cancelados}</div>
              <div className="text-xs text-gray-500">Cancelados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar de Busca e Filtros */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por usuário, torneio ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={filterDisciplina}
              onChange={(e) => setFilterDisciplina(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            >
              <option value="">Todas Disciplinas</option>
              <option value="Matemática">Matemática</option>
              <option value="Programação">Programação</option>
              <option value="Ingláªs">Ingláªs</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            >
              <option value="">Todos Status</option>
              <option value="gerado">Gerado</option>
              <option value="validado">Validado</option>
              <option value="cancelado">Cancelado</option>
            </select>

            <select
              value={filterPosicao}
              onChange={(e) => setFilterPosicao(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            >
              <option value="">Todas as Posições</option>
              <option value="1">1º Lugar - Ouro</option>
              <option value="2">2º Lugar - Prata</option>
              <option value="3">3º Lugar - Bronze</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Certificados */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Usuário</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Torneio</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Disciplina</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Posição</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Pontuação</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Data</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Carregando certificados...
                  </div>
                </td>
              </tr>
            ) : filteredCertificados.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  {searchTerm || filterDisciplina || filterStatus || filterPosicao
                    ? 'Nenhum certificado encontrado com os filtros aplicados.'
                    : 'Nenhum certificado emitido ainda.'}
                </td>
              </tr>
            ) : (
              filteredCertificados.map(cert => {
                const statusConfig = STATUS_CONFIG[cert.status] || STATUS_CONFIG.gerado;
                const medalConfig = MEDAL_CONFIG[cert.posicao] || MEDAL_CONFIG[1];
                return (
                  <tr key={cert.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">
                            {cert.usuario?.nome || 'Usuário'}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {cert.usuario_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Trophy size={16} className="text-gray-400" />
                        <div className="text-sm text-gray-700">
                          {cert.torneio?.titulo || 'Torneio'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                        {cert.disciplina}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${medalConfig.bg} ${medalConfig.color} flex items-center gap-2 w-fit`}>
                        {renderIcon(medalConfig.icon, 16)}
                        {medalConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">
                        {cert.pontuacao} pts
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit ${statusConfig.className}`}>
                        {renderIcon(statusConfig.icon, 14)}
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar size={12} />
                        {formatDate(cert.data_geracao)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(cert.codigo_certificado);
                            showToast('Código copiado!');
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Copiar código"
                        >
                          <FileText size={18} />
                        </button>
                        <button
                          onClick={() => {
                            window.open(`${apiBase}/api/certificados/download/${cert.codigo_certificado}`, '_blank');
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="Download certificado"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl font-semibold text-sm shadow-lg z-50 flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : toast.type === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-amber-500 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle size={18} />
          ) : toast.type === 'error' ? (
            <XCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}

