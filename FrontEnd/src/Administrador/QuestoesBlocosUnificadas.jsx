/**
 * QuestoesBlocosUnificadas.jsx
 * Componente unificado para gerenciar Blocos de Questões e Questões de Colaboradores
 * Combina a interface de BlocoQuestoesManager com QuestionsColaboradorPendentesTab
 */
import React, { useState, useEffect } from 'react';
import { BookOpen, Users, FileText } from 'lucide-react';
import BlocoQuestoesManager from './BlocoQuestoesManager';
import QuestionsColaboradorPendentesTab from './QuestionsColaboradorPendentesTab';

export default function QuestoesBlocosUnificadas() {
  const [aba, setAba] = useState('blocos'); // 'blocos' ou 'questoes-colaborador'

  return (
    <div className="space-y-6">
      {/* Abas de navegação */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4">
        <div className="flex gap-3 flex-wrap">
          {/* Aba Blocos de Questões */}
          <button
            onClick={() => setAba('blocos')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              aba === 'blocos'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Blocos de Questões
          </button>

          {/* Aba Questões de Colaboradores */}
          <button
            onClick={() => setAba('questoes-colaborador')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              aba === 'questoes-colaborador'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Questões Colaboradores
          </button>
        </div>
      </div>

      {/* Conteúdo das abas */}
      {aba === 'blocos' && (
        <div>
          <BlocoQuestoesManager />
        </div>
      )}

      {aba === 'questoes-colaborador' && (
        <div>
          <QuestionsColaboradorPendentesTab />
        </div>
      )}
    </div>
  );
}
