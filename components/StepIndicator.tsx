
import React from 'react';
import type { Step } from '../types';

interface StepIndicatorProps {
  currentStep: Step;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps: { id: Exclude<Step, 'confirmation'>, title: string }[] = [
    { id: 'selection', title: 'Selección' },
    { id: 'summary', title: 'Resumen' },
    { id: 'delivery', title: 'Entrega' },
  ];
  
  let currentStepIndex = steps.findIndex(s => s.id === currentStep);
  if (currentStep === 'confirmation') {
      currentStepIndex = steps.length;
  }

  return (
    <div className="w-full">
      <nav aria-label="Progreso de la compra">
        <ol className="flex items-center">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <li className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold transition-colors duration-300 text-sm ${index <= currentStepIndex ? 'bg-accent text-white' : 'bg-gray-200 text-text-secondary'}`}>
                  {index < currentStepIndex ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`ml-3 font-semibold transition-colors duration-300 text-sm ${index <= currentStepIndex ? 'text-text-primary' : 'text-text-secondary'} hidden sm:inline`}>{step.title}</span>
              </li>
              {index < steps.length - 1 && (
                <li className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-colors duration-300 ${index < currentStepIndex ? 'bg-accent' : 'bg-gray-200'}`}></li>
              )}
            </React.Fragment>
          ))}
        </ol>
      </nav>
    </div>
  );
};
