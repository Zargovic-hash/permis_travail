// ============================================
// FICHIER 21: src/components/ui/Stepper.jsx
// ============================================
import React from 'react';
import { Check } from 'lucide-react';

export default function Stepper({ 
  steps = [], 
  currentStep = 0,
  className = ''
}) {
  return (
    <nav aria-label="Progress" className={className}>
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <li 
              key={index} 
              className={`relative flex-1 ${index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}
            >
              {index !== steps.length - 1 && (
                <div className="absolute top-4 left-0 -ml-px w-full h-0.5 bg-slate-200">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      isCompleted ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              )}

              <div className="relative flex items-start group">
                <span className="flex items-center">
                  <span
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                      isCompleted 
                        ? 'border-indigo-600 bg-indigo-600' 
                        : isCurrent 
                          ? 'border-indigo-600 bg-white' 
                          : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : (
                      <span 
                        className={`h-2.5 w-2.5 rounded-full ${
                          isCurrent ? 'bg-indigo-600' : 'bg-transparent'
                        }`} 
                      />
                    )}
                  </span>
                </span>
                <span className="ml-3 flex min-w-0 flex-col">
                  <span 
                    className={`text-sm font-medium ${
                      isCurrent ? 'text-indigo-600' : isCompleted ? 'text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    {step}
                  </span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

