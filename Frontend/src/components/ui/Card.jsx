// ============================================
// FICHIER 5: src/components/ui/Card.jsx
// ============================================
import React from 'react';

export default function Card({ 
  children, 
  title,
  subtitle,
  footer,
  className = '',
  headerActions,
  padding = true
}) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-slate-200 ${className}`}>
      {(title || subtitle || headerActions) && (
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {title && (
                <h3 className="text-base font-semibold text-slate-900 leading-tight">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{subtitle}</p>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {headerActions}
              </div>
            )}
          </div>
        </div>
      )}

      <div className={padding ? 'p-5' : ''}>
        {children}
      </div>

      {footer && (
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
}

