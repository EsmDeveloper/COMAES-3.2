/**
 * ConfirmModal.jsx — padronizado com ComaesModal
 * Substitui window.confirm() com interface consistente COMAES.
 */
import { AlertCircle, Trash2, Info } from 'lucide-react';
import ComaesModal, { ModalBtnCancel, ModalBtnDanger, ModalBtnPrimary } from './ComaesModal';

const TYPES = {
  danger:  { Icon: Trash2,       iconBg: 'bg-red-100',    iconColor: 'text-red-600',    Btn: ModalBtnDanger  },
  warning: { Icon: AlertCircle,  iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600', Btn: ModalBtnDanger  },
  info:    { Icon: Info,         iconBg: 'bg-blue-100',   iconColor: 'text-blue-600',   Btn: ModalBtnPrimary },
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar Ação',
  message = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger',
}) {
  const { Icon, iconBg, iconColor, Btn } = TYPES[type] || TYPES.danger;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <ComaesModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={<Icon size={18} />}
      iconBg={iconBg}
      iconColor={iconColor}
      maxWidth="max-w-md"
      footer={
        <>
          <ModalBtnCancel onClick={onClose}>{cancelText}</ModalBtnCancel>
          <Btn onClick={handleConfirm}>{confirmText}</Btn>
        </>
      }
    >
      <p className="text-gray-600 text-sm leading-relaxed py-2">{message}</p>
    </ComaesModal>
  );
}
