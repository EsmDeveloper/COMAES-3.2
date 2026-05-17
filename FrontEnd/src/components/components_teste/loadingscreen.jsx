// src/components/LoadingScreen.tsx
import React from 'react';
import { Brain, Sparkles } from 'lucide-react';

export const LoadingScreen = ({ areaTitle, gradient }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
    <div className="relative mb-8">
      <div className="w-24 h-24">
        <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${gradient} opacity-20 animate-ping`}></div>
        <div className={`relative w-24 h-24 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center`}>
          <Brain className="h-12 w-12 text-white animate-pulse" />
        </div>
      </div>
    </div>
    <h2 className="text-2xl font-bold text-gray-800 mb-2">Carregando questões…</h2>
    <p className="text-gray-600">Preparando o quiz para <strong>{areaTitle}</strong></p>
  </div>
);
