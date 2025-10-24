// ============================================
// FICHIER 11: src/components/ui/ErrorMessage.jsx
// ============================================
import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ 
  icon: Icon = AlertCircle,
  title = 'Une erreur est survenue',
  description,
  action,
  className = ''
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="flex justify-center mb-4">
        <div className="bg-rose-100 rounded-full p-4">
          <Icon className="w-10 h-10 text-rose-600" />
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
