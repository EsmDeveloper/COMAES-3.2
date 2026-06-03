/**
 * StreakBadge.jsx — Componente de Sequência de Aprendizagem COMAES
 *
 * Variantes:
 *   <StreakBadge streak={7} ativa compact />         → badge inline pequeno (ex: no perfil/ranking)
 *   <StreakBadge streak={7} ativa />                 → badge padrão com chama
 *   <StreakBadge streak={7} maximo={12} ativa card /> → card completo com mensagem e recorde
 */

import React from 'react';
import { Flame } from 'lucide-react';

/* ── Cores dinâmicas com base no streak ─────────────────────────── */
function getCores(streak, ativa) {
  if (!ativa || streak === 0) {
    return { fundo: '#F3F4F6', texto: '#9CA3AF', borda: '#E5E7EB', chama: '#D1D5DB' };
  }
  if (streak >= 30) return { fundo: '#FEF2F2', texto: '#991B1B', borda: '#FECACA', chama: '#EF4444' };
  if (streak >= 14) return { fundo: '#FFF7ED', texto: '#9A3412', borda: '#FED7AA', chama: '#F97316' };
  if (streak >= 7)  return { fundo: '#FFFBEB', texto: '#92400E', borda: '#FDE68A', chama: '#F59E0B' };
  if (streak >= 3)  return { fundo: '#FFF7ED', texto: '#C2410C', borda: '#FDBA74', chama: '#FB923C' };
  return { fundo: '#FFF7ED', texto: '#C2410C', borda: '#FED7AA', chama: '#FB923C' };
}

/* ── Texto motivador com base no streak ─────────────────────────── */
function getMensagem(streak, ativa) {
  if (!ativa || streak === 0) return 'Realiza uma atividade hoje para iniciar a tua sequência!';
  if (streak === 1) return 'Sequência iniciada! Volta amanhã para continuar. 🔥';
  if (streak < 7)  return `${streak} dias seguidos! Mantém o ritmo!`;
  if (streak < 14) return `${streak} dias! Estás a criar um hábito sólido!`;
  if (streak < 30) return `${streak} dias! Dedicação impressionante!`;
  return `${streak} dias consecutivos! És uma inspiração! 🏆`;
}

/* ── Componente principal ─────────────────────────────────────────── */
export default function StreakBadge({
  streak = 0,
  maximo = 0,
  ativa = false,
  compact = false,
  card = false,
  mensagem,
  className = '',
}) {
  const cores = getCores(streak, ativa);
  const msgTexto = mensagem || getMensagem(streak, ativa);
  const exibir = ativa ? streak : 0;

  /* ── COMPACT: badge inline minúsculo ── */
  if (compact) {
    return (
      <span
        className={className}
        title={msgTexto}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 3,
          fontSize: 11,
          fontWeight: 700,
          padding: '2px 7px',
          borderRadius: 999,
          background: cores.fundo,
          color: cores.texto,
          border: `1px solid ${cores.borda}`,
          whiteSpace: 'nowrap',
          lineHeight: 1.5,
        }}
      >
        <Flame size={11} color={cores.chama} fill={ativa && streak > 0 ? cores.chama : 'none'} />
        <span>{exibir}</span>
      </span>
    );
  }

  /* ── CARD: card completo com mensagem e recorde ── */
  if (card) {
    return (
      <div
        className={className}
        style={{
          background: cores.fundo,
          border: `1.5px solid ${cores.borda}`,
          borderRadius: 16,
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* Cabeçalho */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `${cores.chama}20`,
              border: `1.5px solid ${cores.borda}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Flame size={22} color={cores.chama} fill={ativa && streak > 0 ? cores.chama : 'none'} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: cores.texto, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Sequência de Aprendizagem
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: cores.texto, lineHeight: 1.2 }}>
                {exibir} {exibir === 1 ? 'dia' : 'dias'}
              </div>
            </div>
          </div>
          {maximo > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase' }}>Recorde</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: cores.texto, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Flame size={14} color={cores.chama} fill={cores.chama} />
                {maximo}
              </div>
            </div>
          )}
        </div>

        {/* Mensagem motivadora */}
        <div style={{
          fontSize: 13,
          color: cores.texto,
          padding: '10px 12px',
          background: `${cores.chama}10`,
          borderRadius: 9,
          lineHeight: 1.5,
          borderLeft: `3px solid ${cores.chama}`,
        }}>
          {msgTexto}
        </div>

        {/* Barra visual dos últimos 7 dias */}
        <div style={{ display: 'flex', gap: 5 }}>
          {Array.from({ length: 7 }, (_, i) => {
            const dia = 7 - i;
            const ativo = ativa && exibir >= dia;
            return (
              <div
                key={i}
                title={`Dia ${dia}`}
                style={{
                  flex: 1,
                  height: 8,
                  borderRadius: 999,
                  background: ativo ? cores.chama : '#E5E7EB',
                  transition: 'background 0.3s',
                  opacity: ativo ? (1 - (i * 0.07)) : 1,
                }}
              />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9CA3AF' }}>
          <span>7 dias atrás</span>
          <span>Hoje</span>
        </div>
      </div>
    );
  }

  /* ── DEFAULT: badge padrão com chama ── */
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 999,
        background: cores.fundo,
        border: `1px solid ${cores.borda}`,
        fontSize: 14,
        fontWeight: 700,
        color: cores.texto,
        cursor: 'default',
      }}
      title={msgTexto}
    >
      <Flame size={16} color={cores.chama} fill={ativa && streak > 0 ? cores.chama : 'none'} />
      <span>{exibir} {exibir === 1 ? 'dia' : 'dias'}</span>
      {!ativa && streak === 0 && (
        <span style={{ fontSize: 11, opacity: 0.6, fontWeight: 400 }}>— sem sequência</span>
      )}
    </div>
  );
}
