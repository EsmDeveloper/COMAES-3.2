import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TorneioDashboard from '../Paginas/Secundarias/TorneioDashboard';

describe('Bloqueio de torneios após participação', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('desabilita o botão de participar quando o usuário já está participando de outro torneio', async () => {
    vi.stubGlobal('fetch', vi.fn((url) => {
      if (url.includes('/api/tournaments')) {
        if (url.includes('/api/tournaments/usuario/')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              ativo: true,
              torneio: { id: 1, titulo: 'Torneio Atual' },
              disciplina: 'Programação'
            })
          });
        }

        if (url.includes('/participant-counts')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true, counts: { total: 2 } })
          });
        }

        return Promise.resolve({
          ok: true,
          json: async () => ({
            tournaments: [
              {
                id: 1,
                titulo: 'Torneio Atual',
                descricao: 'Torneio já selecionado',
                status: 'ativo',
                inicia_em: '2026-01-01T00:00:00.000Z',
                termina_em: '2030-01-01T00:00:00.000Z',
                tipo_torneio: 'generico'
              },
              {
                id: 2,
                titulo: 'Outro Torneio',
                descricao: 'Torneio bloqueado',
                status: 'ativo',
                inicia_em: '2026-01-01T00:00:00.000Z',
                termina_em: '2030-01-01T00:00:00.000Z',
                tipo_torneio: 'especifico',
                disciplina_especifica: 'Matemática'
              }
            ]
          })
        });
      }

      return Promise.resolve({ ok: true, json: async () => ({}) });
    }));

    localStorage.setItem('user_id', '123');

    render(
      <MemoryRouter>
        <TorneioDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Torneio Atual')).toBeInTheDocument();
      expect(screen.getByText('Outro Torneio')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button', { name: /bloqueado/i });
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeDisabled();
  });
});
