import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
  description: string;
}

interface PermisStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const PermisStepper: React.FC<PermisStepperProps> = ({
  steps,
  currentStep,
  onStepClick
}) => {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={`relative ${index !== steps.length - 1 ? 'pr-8 sm:pr-20 flex-1' : ''}`}
          >
            {index !== steps.length - 1 && (
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className={`h-0.5 w-full ${
                  index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              </div>
            )}

            <button
              onClick={() => onStepClick && onStepClick(step.id)}
              disabled={!onStepClick || index > currentStep}
              className={`relative flex items-center group ${
                onStepClick && index <= currentStep ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <span className="flex items-center">
                <span
                  className={`relative z-10 w-10 h-10 flex items-center justify-center rounded-full border-2 transition-colors ${
                    index < currentStep
                      ? 'bg-blue-600 border-blue-600'
                      : index === currentStep
                      ? 'border-blue-600 bg-white'
                      : 'border-gray-300 bg-white'
                  } ${
                    onStepClick && index <= currentStep ? 'group-hover:border-blue-700' : ''
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <span
                      className={`text-sm font-semibold ${
                        index === currentStep ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    >
                      {step.id}
                    </span>
                  )}
                </span>
              </span>
              
              <span className="ml-4 min-w-0 flex flex-col">
                <span
                  className={`text-sm font-medium ${
                    index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-xs text-gray-500 hidden sm:block">
                  {step.description}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};