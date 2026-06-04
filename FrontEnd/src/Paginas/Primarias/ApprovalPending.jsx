/**
 * ApprovalPending.jsx
 *
 * Tela exibida após o registo público de colaborador.
 * O utilizador aguarda aprovação do administrador.
 */

import { CheckCircle, Clock, Mail, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logotipo from '../../assets/logotipo.png';

export default function ApprovalPending({ email, onBackToLogin }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full p-8 text-center">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logotipo} alt="COMAES" className="h-16 w-auto" />
        </div>

        {/* Ícone de sucesso */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={40} className="text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Candidatura Enviada!
        </h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          A sua candidatura foi recebida com sucesso. A equipa de administração da COMAES irá analisar o seu perfil e documentos.
        </p>

        {/* Status */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock size={16} className="text-amber-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-amber-800">Aguardando aprovação</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Normalmente o processo demora até 48 horas úteis.
              </p>
            </div>
          </div>
        </div>

        {/* Email de notificação */}
        {email && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-blue-500 flex-shrink-0" />
              <p className="text-sm text-blue-700 text-left">
                Quando a sua conta for aprovada ou rejeitada, receberá uma notificação em{' '}
                <span className="font-semibold">{email}</span>.
              </p>
            </div>
          </div>
        )}

        {/* Próximas etapas */}
        <div className="text-left mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Próximas etapas
          </p>
          <div className="space-y-2">
            {[
              'O administrador analisa o seu perfil e documentos',
              'Receberá uma notificação por e-mail com a decisão',
              'Após aprovação, poderá aceder ao painel de colaborador',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">{i + 1}</span>
                </div>
                <p className="text-sm text-gray-600">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Botões */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onBackToLogin || (() => navigate('/login'))}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition text-sm flex items-center justify-center gap-2"
          >
            Voltar ao login
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition text-sm"
          >
            Ir para a página inicial
          </button>
        </div>

      </div>
    </div>
  );
}
