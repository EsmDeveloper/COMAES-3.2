import React from 'react';
import { BarChart3, Users, TrendingUp, Download } from 'lucide-react';

const RankingsMonitor = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Monitoramento de Rankings
        </h1>
        <p className="text-gray-600">
          Painel administrativo para monitorar e gerenciar os rankings educacionais da plataforma COMAES.
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total de Participantes</p>
              <p className="text-2xl font-bold text-gray-900">1,248</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-green-600">
            <TrendingUp size={16} className="inline mr-1" />
            +12% esta semana
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pontuação Média</p>
              <p className="text-2xl font-bold text-gray-900">3,245</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <BarChart3 className="text-green-600" size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-green-600">
            <TrendingUp size={16} className="inline mr-1" />
            +8% esta semana
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Disciplina Top</p>
              <p className="text-2xl font-bold text-gray-900">Programação</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <BarChart3 className="text-purple-600" size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            485 participantes ativos
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rankings Ativos</p>
              <p className="text-2xl font-bold text-gray-900">4</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <BarChart3 className="text-amber-600" size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Geral, Matemática, Programação, Inglês
          </div>
        </div>
      </div>

      {/* Mensagem Informativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          Sistema de Ranking Global
        </h3>
        <p className="text-blue-700 mb-4">
          O sistema de ranking global foi implementado com sucesso. Os administradores são redirecionados para este painel, enquanto:
        </p>
        <ul className="text-blue-700 space-y-2">
          <li>• <strong>Estudantes</strong> têm acesso completo ao ranking (top 100 + filtros)</li>
          <li>• <strong>Visitantes</strong> veem apenas o top 10 da categoria Geral</li>
          <li>• <strong>Colaboradores</strong> têm visualização completa, mas sem participação</li>
        </ul>
      </div>

      {/* Ações Administrativas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Administrativas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Download size={20} className="text-gray-600" />
              <span className="font-medium text-gray-700">Exportar Dados</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Exportar rankings em CSV</p>
          </button>

          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <BarChart3 size={20} className="text-gray-600" />
              <span className="font-medium text-gray-700">Relatórios</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Gerar relatórios detalhados</p>
          </button>

          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Users size={20} className="text-gray-600" />
              <span className="font-medium text-gray-700">Gerenciar</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Gerenciar participantes</p>
          </button>

          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <TrendingUp size={20} className="text-gray-600" />
              <span className="font-medium text-gray-700">Métricas</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Analisar métricas</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RankingsMonitor;