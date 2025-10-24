// ============================================
// FICHIER 2: src/components/ui/Avatar.jsx
// ============================================
import React from 'react';
import { User } from 'lucide-react';

export default function Avatar({ 
  src,
  alt,
  name,
  size = 'md',
  className = ''
}) {
  const sizes = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
    '2xl': 'h-20 w-20 text-xl'
  };

  const getInitials = () => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-white shadow-sm ${className}`}
      />
    );
  }

  if (name) {
    return (
      <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-semibold shadow-sm ${className}`}>
        {getInitials()}
      </div>
    );
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shadow-sm ${className}`}>
      <User className="w-1/2 h-1/2" />
    </div>
  );
}

