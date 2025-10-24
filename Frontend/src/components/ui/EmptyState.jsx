// ============================================
// FICHIER 10: src/components/ui/EmptyState.jsx
// ============================================
import React from 'react';
import { FileQuestion } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon = FileQuestion,
  title = 'Aucune donnée',
  description,
  action,
  className = ''
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="flex justify-center mb-4">
        <div className="bg-slate-100 rounded-full p-4">
          <Icon className="w-10 h-10 text-slate-400" />
        </div>
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

