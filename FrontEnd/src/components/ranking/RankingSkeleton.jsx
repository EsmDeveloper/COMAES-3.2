import React from 'react';

/**
 * Componente de loading skeleton para ranking
 */
const RankingSkeleton = ({ rows = 10 }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
      {/* Header skeleton */}
      <div className="p-6 border-b border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>

      {/* Tabela skeleton */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-6">
                <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
              </th>
              <th className="py-3 px-6">
                <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
              </th>
              <th className="py-3 px-6">
                <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
              </th>
              <th className="py-3 px-6">
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[...Array(rows)].map((_, i) => (
              <tr key={i}>
                <td className="py-4 px-6">
                  <div className="w-8 h-8 rounded-full bg-gray-200 mx-auto"></div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    <div className="w-9 h-9 rounded-full bg-gray-200 mr-3"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </td>
                <td className="py-4 px-6">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer skeleton */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-36"></div>
        </div>
      </div>
    </div>
  );
};

export default RankingSkeleton;