// ============================================
// FICHIER 9: src/components/ui/Dropdown.jsx
// ============================================
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Dropdown({ 
  trigger,
  children,
  align = 'left',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignmentClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2'
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger || (
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
            <span>Options</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className={`absolute z-50 mt-2 w-56 rounded-lg bg-white shadow-xl border border-slate-200 overflow-hidden ${alignmentClasses[align]}`}>
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ 
  children, 
  onClick,
  icon: Icon,
  variant = 'default',
  disabled = false
}) {
  const variants = {
    default: 'text-slate-700 hover:bg-slate-50',
    danger: 'text-rose-600 hover:bg-rose-50'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${variants[variant]}`}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span>{children}</span>
    </button>
  );
}

