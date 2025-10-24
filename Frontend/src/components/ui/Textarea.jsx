import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

const Textarea = forwardRef(({ 
  label,
  error,
  helperText,
  className = '',
  required = false,
  rows = 4,
  maxLength,
  showCount = false,
  value,
  onChange,
  ...props 
}, ref) => {
  const textareaClasses = `block w-full rounded-lg border px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 transition-colors resize-y ${
    error 
      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' 
      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
  } ${className}`.trim().replace(/\s+/g, ' ');

  const currentValue = value || '';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        className={textareaClasses}
        rows={rows}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.id}-error` : undefined}
        {...props}
      />
      
      {showCount && maxLength && (
        <div className="mt-1.5 text-xs text-slate-500 text-right">
          {currentValue.length} / {maxLength}
        </div>
      )}
      
      {error && (
        <p className="mt-1.5 text-sm text-rose-600 flex items-center gap-1" id={`${props.id}-error`}>
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;