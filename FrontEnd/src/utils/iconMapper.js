/**
 * iconMapper.js - Mapeamento profissional de Emojis para Ícones React
 * 
 * Este arquivo centraliza a conversão de emojis para ícones React (lucide-react)
 * Garante uma UI profissional sem comprometer a funcionalidade
 */

import React from 'react';
import {
  Code,
  Zap,
  Rocket,
  Calculator,
  Ruler,
  Hash,
  Globe,
  Star,
  Bot,
  Smile,
  HelpCircle,
  ThumbsUp,
  AlertCircle,
  Clock,
  Target,
  Award,
  Microscope,
  Sparkles,
  Crown,
  Flame,
  Egg,
  Bird,
  BookOpen,
  Trophy,
  Medal,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Link2,
  Zap as Connection,
  Bell,
  RefreshCw,
  Clipboard,
  Lightbulb,
  Volume2,
} from 'lucide-react';

/**
 * Mapeamento centralizado de emojis para componentes React Icons
 * Cada entrada contém: emoji, ícone React, cor padrão, e significado
 */
export const EMOJI_TO_ICON_MAP = {
  '💻': { icon: Code, label: 'Código', color: 'text-blue-600' },
  '⚡': { icon: Zap, label: 'Energia', color: 'text-yellow-500' },
  '🚀': { icon: Rocket, label: 'Lançamento', color: 'text-blue-600' },
  '🧮': { icon: Calculator, label: 'Matemática', color: 'text-amber-600' },
  '📐': { icon: Ruler, label: 'Geometria', color: 'text-purple-600' },
  '🔢': { icon: Hash, label: 'Números', color: 'text-green-600' },
  '🌍': { icon: Globe, label: 'Mundial', color: 'text-blue-500' },
  '⭐': { icon: Star, label: 'Estrela', color: 'text-yellow-500' },
  '': { icon: Volume2, label: 'Fala', color: 'text-green-600' },
  '🤖': { icon: Bot, label: 'Bot', color: 'text-gray-600' },
  '😊': { icon: Smile, label: 'Feliz', color: 'text-yellow-400' },
  '🤔': { icon: HelpCircle, label: 'Dúvida', color: 'text-purple-500' },
  '👍': { icon: ThumbsUp, label: 'Bom', color: 'text-blue-600' },
  '😅': { icon: AlertCircle, label: 'Aviso', color: 'text-orange-500' },
  '⏰': { icon: Clock, label: 'Tempo', color: 'text-red-500' },
  '🎯': { icon: Target, label: 'Alvo', color: 'text-red-600' },
  '🏅': { icon: Award, label: 'Medalha', color: 'text-amber-500' },
  '🔬': { icon: Microscope, label: 'Ciência', color: 'text-green-600' },
  '🌟': { icon: Sparkles, label: 'Brilho', color: 'text-yellow-500' },
  '👑': { icon: Crown, label: 'Coroa', color: 'text-amber-600' },
  '🔥': { icon: Flame, label: 'Fogo', color: 'text-orange-600' },
  '🐣': { icon: Egg, label: 'Ovo', color: 'text-yellow-600' },
  '🦉': { icon: Bird, label: 'Coruja', color: 'text-amber-700' },
  '📚': { icon: BookOpen, label: 'Livros', color: 'text-blue-700' },
  '🥇': { icon: Trophy, label: 'Ouro', color: 'text-yellow-500' },
  '🥈': { icon: Medal, label: 'Prata', color: 'text-gray-400' },
  '🥉': { icon: Medal, label: 'Bronze', color: 'text-amber-700' },
  '🏆': { icon: Trophy, label: 'Troféu', color: 'text-yellow-500' },
  '💡': { icon: Lightbulb, label: 'Ideia', color: 'text-yellow-500' },
  '✨': { icon: Sparkles, label: 'Especial', color: 'text-purple-400' },
  '🔄': { icon: RefreshCw, label: 'Atualizar', color: 'text-blue-600' },
  '📋': { icon: Clipboard, label: 'Lista', color: 'text-gray-600' },
  '⚠️': { icon: AlertTriangle, label: 'Atenção', color: 'text-yellow-600' },
  '❌': { icon: XCircle, label: 'Erro', color: 'text-red-600' },
  '✅': { icon: CheckCircle, label: 'Sucesso', color: 'text-green-600' },
  '🔗': { icon: Link2, label: 'Link', color: 'text-blue-600' },
  '📊': { icon: BarChart3, label: 'Gráfico', color: 'text-indigo-600' },
  '🔌': { icon: Zap, label: 'Conexão', color: 'text-yellow-500' },
  '🔔': { icon: Bell, label: 'Notificação', color: 'text-red-500' },
};

/**
 * Renderiza ícone React baseado em emoji
 * @param {string} emoji - O emoji a ser convertido
 * @param {number} size - Tamanho do ícone em pixels (default 24)
 * @param {string} className - Classes CSS adicionais
 * @returns {React.ReactNode} Componente de ícone ou emoji fallback
 */
export function getIconForEmoji(emoji, size = 24, className = '') {
  const mapping = EMOJI_TO_ICON_MAP[emoji];
  
  if (!mapping) {
    // Fallback para emoji original se não encontrado
    return React.createElement('span', { style: { fontSize: size } }, emoji);
  }

  const Icon = mapping.icon;
  return React.createElement(Icon, { 
    size: size,
    className: className || mapping.color,
    title: mapping.label
  });
}

/**
 * Renderiza múltiplos ícones
 * @param {string[]} emojis - Array de emojis
 * @param {number} size - Tamanho dos ícones
 * @returns {React.ReactNode} Componente com ícones
 */
export function getIconsForEmojis(emojis, size = 24) {
  return emojis.map((emoji, idx) => 
    React.createElement('div', { key: `${emoji}-${idx}`, className: 'inline-block' },
      getIconForEmoji(emoji, size)
    )
  );
}

/**
 * Retorna apenas o objeto de mapeamento (para uso customizado)
 * @param {string} emoji - O emoji
 * @returns {object} Objeto com icon, label, color
 */
export function getIconMapping(emoji) {
  return EMOJI_TO_ICON_MAP[emoji] || null;
}

export default EMOJI_TO_ICON_MAP;
