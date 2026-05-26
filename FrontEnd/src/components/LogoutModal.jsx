/**
 * LogoutModal.jsx — padronizado com ComaesModal
 */
import { LogOut } from 'lucide-react';
import ComaesModal, { ModalBtnCancel, ModalBtnDanger } from './ComaesModal';

export default function LogoutModal({ isOpen, onConfirm, onCancel }) {
  return (
    <ComaesModal
      isOpen={isOpen}
      onClose={onCancel}
      title="Terminar Sessão"
      icon={<LogOut size={18} />}
      iconBg="bg-red-100"
      iconColor="text-red-600"
      maxWidth="max-w-sm"
      footer={
        <>
          <ModalBtnCancel onClick={onCancel}>Cancelar</ModalBtnCancel>
          <ModalBtnDanger onClick={onConfirm}>
            <LogOut size={15} /> Sair
          </ModalBtnDanger>
        </>
      }
    >
      <p className="text-gray-500 text-sm text-center leading-relaxed py-2">
        Tem certeza que deseja terminar a sua sessão?
      </p>
    </ComaesModal>
  );
}
