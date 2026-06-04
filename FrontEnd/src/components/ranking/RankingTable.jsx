import React, { useState } from 'react';
import PosBadge from './PosBadge';
import RankingSkeleton from './RankingSkeleton';
import { Search } from 'lucide-react';

/**
 * Componente RankingTable - Tabela responsiva de ranking
 * 
 * @param {Object} props
 * @param {Array} props.data - Dados do ranking
 * @param {string} props.title - Título da tabela
 * @param {boolean} [props.isAuthenticated=false] - Se o usuário está autenticado
 * @param {Object} [props.currentUser=null] - Dados do usuário autenticado
 * @param {string} [props.searchPlaceholder="Buscar por username..."] - Placeholder do campo de busca
 * @param {boolean} [props.showLevel=true] - Se deve mostrar a coluna de nível
 * @param {boolean} [props.loading=false] - Estado de carregamento
 */
const RankingTable = ({
  data,
  title,
  isAuthenticated = false,
  currentUser = null,
  searchPlaceholder = "Buscar por username...",
  showLevel = true,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar dados com base na busca
  const filteredData = searchTerm.trim()
    ? data.filter(item => {
        const username = item.username || item.usuario?.username || item.usuario?.nome || '';
        return username.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : data;

  // Limitar visualização para não autenticados
  const displayData = isAuthenticated ? filteredData : filteredData.slice(0, 10);

  // Skeleton rows para loading
  if (loading) {
    return <RankingSkeleton rows={isAuthenticated ? 10 : 5} />;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header com título e busca (apenas para autenticados) */}
      <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {!isAuthenticated && (
            <p className="text-sm text-gray-500 mt-1">
              Top 10 - <span className="font-medium">Faça login</span> para ver o ranking completo
            </p>
          )}
        </div>
        
        {isAuthenticated && (
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        )}
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posição</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
              {showLevel && <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nível</th>}
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pontuação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayData.length === 0 ? (
              <tr>
                <td colSpan={showLevel ? 4 : 3} className="py-12 px-6 text-center">
                  <div className="text-gray-500">
                    <Search size={32} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Nenhum resultado encontrado para "{searchTerm}"</p>
                  </div>
                </td>
              </tr>
            ) : (
              displayData.map((item, index) => {
                const isCurrentUser = currentUser && (
                  item.userId === currentUser.id ||
                  item.usuario?.id === currentUser.id ||
                  item.usuario?.userId === currentUser.id
                );

                const username = item.username || item.usuario?.username || item.usuario?.nome || 'Usuário';
                const avatar = item.avatar || item.usuario?.imagem;
                const level = item.level || item.usuario?.nivel_atual || 1;
                const score = item.score || item.pontuacao || item.xp_total || 0;
                const position = item.position || index + 1;

                return (
                  <tr
                    key={item.id || index}
                    className={`transition-colors hover:bg-gray-50 ${isCurrentUser ? 'bg-blue-50' : ''}`}
                  >
                    <td className="py-4 px-6 whitespace-nowrap">
                      <PosBadge position={position} />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm mr-3 flex-shrink-0 overflow-hidden">
                          {avatar ? (
                            <img
                              src={avatar}
                              alt={username}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <span className={avatar ? 'hidden' : ''}>
                            {username.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {username}
                            </span>
                            {isCurrentUser && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                você
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            Participa desde {item.joinedDate || '2024'}
                          </div>
                        </div>
                      </div>
                    </td>
                    {showLevel && (
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Nível {level}
                        </div>
                      </td>
                    )}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-base font-semibold text-gray-900">
                        {score.toLocaleString('pt-BR')} pts
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer com estatísticas */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Mostrando <span className="font-medium">{displayData.length}</span> de{' '}
            <span className="font-medium">{data.length}</span> usuários
          </div>
          {!isAuthenticated && (
            <div className="text-blue-600 font-medium">
              Faça login para ver todos os {data.length} usuários
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RankingTable;