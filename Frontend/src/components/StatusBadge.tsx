import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'BROUILLON' | 'EN_ATTENTE' | 'VALIDE' | 'EN_COURS' | 'SUSPENDU' | 'CLOTURE';
  className?: string;
}

const statusConfig = {
  BROUILLON: {
    label: 'Brouillon',
    className: 'bg-status-brouillon-bg text-status-brouillon',
  },
  EN_ATTENTE: {
    label: 'En attente',
    className: 'bg-status-attente-bg text-status-attente',
  },
  VALIDE: {
    label: 'Validé',
    className: 'bg-status-valide-bg text-status-valide',
  },
  EN_COURS: {
    label: 'En cours',
    className: 'bg-status-cours-bg text-status-cours',
  },
  SUSPENDU: {
    label: 'Suspendu',
    className: 'bg-status-suspendu-bg text-status-suspendu',
  },
  CLOTURE: {
    label: 'Clôturé',
    className: 'bg-status-cloture-bg text-status-cloture',
  },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};
