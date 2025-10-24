// ============================================
// FICHIER 22: src/components/ui/Switch.jsx
// ============================================
import React, { forwardRef } from 'react';

const Switch = forwardRef(({ 
  label,
  checked = false,
  onChange,
  disabled = false,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className={`flex items-center ${className}`}>
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? 'bg-indigo-600' : 'bg-slate-200'
        }`}
        {...props}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      {label && (
        <span className="ml-3 text-sm font-medium text-slate-700">
          {label}
        </span>
      )}
    </div>
  );
});

Switch.displayName = 'Switch';

export default Switch;

