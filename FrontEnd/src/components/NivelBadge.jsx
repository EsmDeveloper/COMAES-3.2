/**
 * NivelBadge.jsx — Componente reutilizável do Sistema de Níveis COMAES
 *
 * Variantes:
 *   <NivelBadge nivel={nivelObj} xpTotal={500} compact />     → badge inline (ranking, nome)
 *   <NivelBadge nivel={nivelObj} xpTotal={500} showBar />     → card com barra de progresso
 *   <NivelBadge nivel={nivelObj} xpTotal={500} full />        → card completo com descrição
 */

import React from 'react';
import { getIconForEmoji } from '../utils/iconMapper';

/* ── Dados dos níveis (espelho do xpService.js — fonte única de verdade é o backend) ── */
export const NIVEIS_META = [
  { numero: 1,  titulo: 'Filhote de Coruja',   xp_minimo: 0,     icone: '🐣', cor: '#94A3B8' },
  { numero: 2,  titulo: 'Coruja Curiosa',       xp_minimo: 200,   icone: '🦉', cor: '#64748B' },
  { numero: 3,  titulo: 'Coruja Aprendiz',      xp_minimo: 500,   icone: '📚', cor: '#3B82F6' },
  { numero: 4,  titulo: 'Coruja Estudiosa',     xp_minimo: 1000,  icone: '✏️', cor: '#6366F1' },
  { numero: 5,  titulo: 'Coruja Estrategista',  xp_minimo: 2000,  icone: '🎯', cor: '#8B5CF6' },
  { numero: 6,  titulo: 'Coruja Competidora',   xp_minimo: 3500,  icone: '🏅', cor: '#EC4899' },
  { numero: 7,  titulo: 'Coruja Especialista',  xp_minimo: 5500,  icone: '🔬', cor: '#14B8A6' },
  { numero: 8,  titulo: 'Coruja Sábia',         xp_minimo: 8000,  icone: '🌟', cor: '#F59E0B' },
  { numero: 9,  titulo: 'Coruja Mestre',        xp_minimo: 12000, icone: '👑', cor: '#EF4444' },
  { numero: 10, titulo: 'Coruja Lendária',      xp_minimo: 18000, icone: '🔥', cor: '#7C3AED' },
];

/* ── Utilitários locais  */
export function getNivelMeta(numeroNivel) {
  return NIVEIS_META.find(n => n.numero === numeroNivel) || NIVEIS_META[0];
}

export function calcularProgresso(xpTotal) {
  const nivelAtual  = NIVEIS_META.filter(n => xpTotal >= n.xp_minimo).pop() || NIVEIS_META[0];
  const proximoNivel = NIVEIS_META.find(n => n.numero === nivelAtual.numero + 1);
  if (!proximoNivel) return { nivelAtual, proximoNivel: null, percentual: 100, xpNoNivel: 0, xpParaProximo: 0 };
  const xpNoNivel     = xpTotal - nivelAtual.xp_minimo;
  const xpParaProximo = proximoNivel.xp_minimo - nivelAtual.xp_minimo;
  const percentual    = Math.min(100, Math.round((xpNoNivel / xpParaProximo) * 100));
  return { nivelAtual, proximoNivel, percentual, xpNoNivel, xpParaProximo };
}

/* ── Componente principal  */
export default function NivelBadge({
  nivelNumero,      // número do nível (1-10) — usado quando não passa nivelObj
  nivelObj,         // objeto { numero, titulo, icone, cor, xp_minimo } vindo da API
  xpTotal = 0,      // XP total acumulado para calcular a barra
  compact = false,  // badge inline pequeno (ex: ao lado do nome no ranking)
  showBar = false,  // exibe barra de XP + info de progresso
  full = false,     // card completo com descrição
  className = '',
}) {
  const meta = nivelObj || getNivelMeta(nivelNumero || 1);
  const progresso = (showBar || full) ? calcularProgresso(xpTotal) : null;

  /* ── COMPACT: pequeno badge inline ── */
  if (compact) {
    return (
      <span
        className={className}
        title={`${meta.icone} ${meta.titulo} · ${xpTotal.toLocaleString('pt-PT')} XP`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 3,
          fontSize: 11,
          fontWeight: 700,
          padding: '2px 7px',
          borderRadius: 999,
          background: `${meta.cor}18`,
          color: meta.cor,
          border: `1px solid ${meta.cor}40`,
          whiteSpace: 'nowrap',
          lineHeight: 1.5,
        }}
      >
        <span style={{ fontSize: 12 }} className="flex items-center">
          {getIconForEmoji(meta.icone, 14)}
        </span>
        <span>Nível {meta.numero}</span>
      </span>
    );
  }

  /* ── SHOW BAR: badge + barra de progresso ── */
  if (showBar && progresso) {
    return (
      <div
        className={className}
        style={{
          background: '#fff',
          border: `1px solid ${meta.cor}30`,
          borderRadius: 14,
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {/* Cabeçalho */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `${meta.cor}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                {getIconForEmoji(meta.icone, 20)}
              </span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F1117', lineHeight: 1.2 }}>
                {meta.titulo}
              </div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>
                Nível {meta.numero} · {xpTotal.toLocaleString('pt-PT')} XP total
              </div>
            </div>
          </div>
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: meta.cor,
            background: `${meta.cor}15`,
            padding: '3px 9px', borderRadius: 999,
          }}>
            {progresso.percentual}%
          </span>
        </div>

        {/* Barra de progresso */}
        <div style={{ height: 6, background: '#E8EAEF', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progresso.percentual}%`,
            background: `linear-gradient(90deg, ${meta.cor}99, ${meta.cor})`,
            borderRadius: 999,
            transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>

        {/* Info de progresso */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF' }}>
          <span>{progresso.xpNoNivel.toLocaleString('pt-PT')} XP no nível</span>
          {progresso.proximoNivel ? (
            <span>
              {progresso.xpParaProximo.toLocaleString('pt-PT')} XP para{' '}
              <strong style={{ color: '#6B7280' }}>Nível {progresso.proximoNivel.numero}</strong>
            </span>
          ) : (
            <span style={{ color: meta.cor, fontWeight: 600 }}>Nível máximo atingido!</span>
          )}
        </div>
      </div>
    );
  }

  /* ── FULL: card completo com descrição e todos os detalhes ── */
  if (full && progresso) {
    return (
      <div
        className={className}
        style={{
          background: '#fff',
          border: `1.5px solid ${meta.cor}40`,
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        {/* Header colorido */}
        <div style={{
          background: `linear-gradient(135deg, ${meta.cor}22, ${meta.cor}08)`,
          borderBottom: `1px solid ${meta.cor}20`,
          padding: '18px 20px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 52, height: 52,
            borderRadius: 14,
            background: `${meta.cor}25`,
            border: `2px solid ${meta.cor}50`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26,
          }}>
            {meta.icone}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: meta.cor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
              Nível {meta.numero}
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0F1117', lineHeight: 1.2 }}>
              {meta.titulo}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: meta.cor }}>
              {xpTotal.toLocaleString('pt-PT')}
            </div>
            <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>XP TOTAL</div>
          </div>
        </div>

        {/* Barra de progresso */}
        <div style={{ padding: '14px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
            <span style={{ color: '#6B7280', fontWeight: 500 }}>Progresso para o próximo nível</span>
            <span style={{ color: meta.cor, fontWeight: 700 }}>{progresso.percentual}%</span>
          </div>
          <div style={{ height: 8, background: '#E8EAEF', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progresso.percentual}%`,
              background: `linear-gradient(90deg, ${meta.cor}80, ${meta.cor})`,
              borderRadius: 999,
              transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 11, color: '#9CA3AF' }}>
            <span>{progresso.xpNoNivel.toLocaleString('pt-PT')} / {progresso.xpParaProximo.toLocaleString('pt-PT')} XP</span>
            {progresso.proximoNivel ? (
              <span>
                Próximo: {progresso.proximoNivel.icone}{' '}
                <strong style={{ color: '#374151' }}>{progresso.proximoNivel.titulo}</strong>
                {' '}· {(progresso.proximoNivel.xp_minimo - xpTotal).toLocaleString('pt-PT')} XP restante
              </span>
            ) : (
              <span style={{ color: meta.cor, fontWeight: 700 }}>✓ Nível máximo</span>
            )}
          </div>
        </div>

        {/* Todos os níveis como mini-timeline */}
        <div style={{ padding: '0 20px 16px', display: 'flex', gap: 5 }}>
          {NIVEIS_META.map(n => (
            <div
              key={n.numero}
              title={`${n.icone} ${n.titulo} — ${n.xp_minimo.toLocaleString('pt-PT')} XP`}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 999,
                background: xpTotal >= n.xp_minimo ? n.cor : '#E8EAEF',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  /* ── DEFAULT: badge simples sem barra ── */
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 12px',
        borderRadius: 999,
        background: `${meta.cor}15`,
        border: `1px solid ${meta.cor}35`,
        fontSize: 13,
        fontWeight: 600,
        color: meta.cor,
      }}
    >
      <span>{meta.icone}</span>
      <span>{meta.titulo}</span>
      <span style={{ fontSize: 11, opacity: 0.7 }}>· Nív. {meta.numero}</span>
    </div>
  );
}
