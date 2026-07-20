import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number; // 1-indexed
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  className = ''
}) => {
  return (
    <div className={`w-full ${className}`}>
      {/* Mobile progress indicator */}
      <div className="md:hidden flex items-center justify-between px-2 mb-4">
        <span className="text-xs font-semibold text-pixel-neutral-500 uppercase tracking-wider">
          Passo {currentStep} de {steps.length}
        </span>
        <span className="text-sm font-bold text-pixel-navy-900 font-title">
          {steps[currentStep - 1].title}
        </span>
      </div>

      {/* Desktop stepper progress bar */}
      <div className="hidden md:flex items-center justify-between w-full relative">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          const isLast = stepNum === steps.length;

          return (
            <React.Fragment key={idx}>
              {/* Step circle */}
              <div className="flex flex-col items-center relative z-10">
                <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2
                  ${isCompleted 
                    ? 'bg-pixel-navy-900 border-pixel-navy-900 text-white' 
                    : isActive 
                      ? 'bg-white border-pixel-navy-900 text-pixel-navy-900 ring-4 ring-brand-teal/10' 
                      : 'bg-white border-pixel-neutral-200 text-pixel-neutral-500'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 stroke-[3px]" />
                  ) : (
                    <span>{stepNum}</span>
                  )}
                </div>
                <div className="absolute top-11 text-center whitespace-nowrap">
                  <p className={`text-xs font-bold font-title ${isActive ? 'text-pixel-navy-900' : isCompleted ? 'text-pixel-navy-900' : 'text-pixel-neutral-500'}`}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-[10px] text-brand-grayBlue/60 mt-0.5 max-w-[100px] overflow-hidden text-ellipsis">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div className="flex-1 h-0.5 bg-pixel-neutral-200 mx-4 relative top-[-8px]">
                  <div 
                    className="h-full bg-pixel-navy-900 transition-all duration-300"
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Spacer to reserve height for desktop labels */}
      <div className="hidden md:block h-16"></div>
    </div>
  );
};
