// ============================================
// FICHIER 19: src/components/ui/Spinner.jsx
// ============================================
import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Spinner({ 
  size = 'md', 
  className = '',
  text
}) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Loader2 className={`animate-spin text-indigo-600 ${sizes[size]} ${className}`} />
      {text && (
        <p className="mt-2 text-sm text-slate-600">{text}</p>
      )}
    </div>
  );
}

