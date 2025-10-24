// ============================================
// FICHIER 6: src/components/ui/Checkbox.jsx
// ============================================
import React, { forwardRef } from 'react';

const Checkbox = forwardRef(({ 
  label,
  error,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          ref={ref}
          type="checkbox"
          className={`h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${error ? 'border-rose-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {label && (
        <div className="ml-3 text-sm">
          <label htmlFor={props.id} className="font-medium text-slate-700 cursor-pointer leading-tight">
            {label}
          </label>
          {error && (
            <p className="text-rose-600 mt-1 text-xs leading-tight">{error}</p>
          )}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;

