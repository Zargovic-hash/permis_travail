// ============================================
// FICHIER 20: src/components/ui/StatusBadge.jsx
// ============================================
import React from 'react';
import { getStatusLabel, getStatusColor } from '../../utils/formatters';

export default function StatusBadge({ status }) {
  const colorMap = {
    gray: 'bg-slate-100 text-slate-700',
    yellow: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-rose-100 text-rose-700'
  };

  const color = getStatusColor(status);
  const label = getStatusLabel(status);

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${colorMap[color]}`}>
      {label}
    </span>
  );
}

