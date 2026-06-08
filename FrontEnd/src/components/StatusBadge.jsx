/**
 * StatusBadge.jsx
 * 
 * Displays status badges for blocos and questões
 * Statuses:
 * - pendente (yellow) - Awaiting admin review
 * - aprovado (green) - Approved, ready to use
 * - rejeitado (red) - Rejected, needs revision
 * - aprovada (green) - Questão approved
 * - rejeitada (red) - Questão rejected
 */

import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

const StatusBadge = ({ status, size = 'md', showIcon = true }) => {
  const statusConfig = {
    pendente: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-300',
      icon: Clock,
      label: 'Pendente',
      description: 'Aguardando revisão'
    },
    aprovado: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
      icon: CheckCircle,
      label: 'Aprovado',
      description: 'Pronto para usar'
    },
    aprovada: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
      icon: CheckCircle,
      label: 'Aprovada',
      description: 'Pronto para usar'
    },
    rejeitado: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300',
      icon: AlertCircle,
      label: 'Rejeitado',
      description: 'Requer alterações'
    },
    rejeitada: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300',
      icon: AlertCircle,
      label: 'Rejeitada',
      description: 'Requer alterações'
    }
  };

  const config = statusConfig[status] || statusConfig.pendente;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]} font-medium`}
      title={config.description}
    >
      {showIcon && <Icon className="w-4 h-4" />}
      <span>{config.label}</span>
    </div>
  );
};

export default StatusBadge;

/**
 * Usage Examples:
 * 
 * <StatusBadge status="pendente" />
 * <StatusBadge status="aprovado" size="lg" />
 * <StatusBadge status="rejeitado" showIcon={false} />
 */
