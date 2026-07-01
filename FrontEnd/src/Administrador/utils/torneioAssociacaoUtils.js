export const getTorneioAssocState = ({ torneioStatus, blocoStatus, isAssociated }) => {
  const canToggle = !['finalizado', 'cancelado'].includes(torneioStatus)
    && ['publicado', 'aprovado'].includes(blocoStatus)
    && !isAssociated;

  const showRemoveButton = torneioStatus === 'finalizado' && isAssociated;
  const showDisabledHint = torneioStatus === 'finalizado' && !isAssociated;

  return {
    canToggle,
    showRemoveButton,
    showDisabledHint,
  };
};
