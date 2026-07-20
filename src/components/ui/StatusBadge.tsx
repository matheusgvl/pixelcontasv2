import React from 'react';

export type StatusType = 
  | 'authorized' | 'processing' | 'waiting' | 'rejected' | 'canceled'
  | 'connected' | 'disconnected' | 'attention' | 'syncing'
  | 'active' | 'inactive' | 'sent' | 'pending' | 'reviewed' | 'resolved';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className = ''
}) => {
  const styles: Record<StatusType, { bg: string; text: string; dot: string; label: string }> = {
    // Invoice / Process Statuses
    authorized: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      dot: 'bg-green-600',
      label: 'Autorizada'
    },
    processing: {
      bg: 'bg-pixel-neutral-50',
      text: 'text-pixel-navy-950',
      dot: 'bg-pixel-navy-900',
      label: 'Processando'
    },
    waiting: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
      dot: 'bg-yellow-500',
      label: 'Aguardando'
    },
    rejected: {
      bg: 'bg-red-50',
      text: 'text-red-800',
      dot: 'bg-red-600',
      label: 'Rejeitada'
    },
    canceled: {
      bg: 'bg-gray-100',
      text: 'text-pixel-neutral-900',
      dot: 'bg-pixel-neutral-500',
      label: 'Cancelada'
    },
    // Integration Statuses
    connected: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      dot: 'bg-green-600',
      label: 'Conectado'
    },
    disconnected: {
      bg: 'bg-gray-100',
      text: 'text-pixel-neutral-500',
      dot: 'bg-pixel-neutral-500',
      label: 'Desconectado'
    },
    attention: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
      dot: 'bg-yellow-500',
      label: 'Atenção'
    },
    syncing: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      dot: 'bg-blue-600',
      label: 'Sincronizando'
    },
    // General Statuses
    active: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      dot: 'bg-green-600',
      label: 'Ativo'
    },
    inactive: {
      bg: 'bg-gray-100',
      text: 'text-pixel-neutral-500',
      dot: 'bg-pixel-neutral-500',
      label: 'Inativo'
    },
    sent: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      dot: 'bg-blue-600',
      label: 'Enviado'
    },
    pending: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
      dot: 'bg-yellow-500',
      label: 'Pendente'
    },
    reviewed: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      dot: 'bg-green-600',
      label: 'Revisado'
    },
    resolved: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      dot: 'bg-green-600',
      label: 'Resolvida'
    }
  };

  const current = styles[status] || styles.waiting;
  const displayLabel = label || current.label;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${current.bg} ${current.text} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`}></span>
      {displayLabel}
    </span>
  );
};
