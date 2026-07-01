import { describe, expect, it } from 'vitest';
import { getTorneioAssocState } from '../Administrador/utils/torneioAssociacaoUtils';

describe('getTorneioAssocState', () => {
  it('bloqueia a associação para torneios finalizados sem associação prévia', () => {
    const state = getTorneioAssocState({
      torneioStatus: 'finalizado',
      blocoStatus: 'publicado',
      isAssociated: false,
    });

    expect(state.canToggle).toBe(false);
    expect(state.showRemoveButton).toBe(false);
    expect(state.showDisabledHint).toBe(true);
  });

  it('permite a remoção explícita para torneios finalizados já associados', () => {
    const state = getTorneioAssocState({
      torneioStatus: 'finalizado',
      blocoStatus: 'publicado',
      isAssociated: true,
    });

    expect(state.canToggle).toBe(false);
    expect(state.showRemoveButton).toBe(true);
    expect(state.showDisabledHint).toBe(false);
  });

  it('permite o checkbox para torneios ativos quando o bloco está publicado', () => {
    const state = getTorneioAssocState({
      torneioStatus: 'ativo',
      blocoStatus: 'publicado',
      isAssociated: false,
    });

    expect(state.canToggle).toBe(true);
    expect(state.showRemoveButton).toBe(false);
    expect(state.showDisabledHint).toBe(false);
  });
});
