import React from 'react';
import { colors, radius, transitions } from '../tokens.js';

export interface Step {
  label: string;
  key: string;
}

export interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '12px 0',
      }}
    >
      {steps.map((step, i) => {
        const isActive = i === currentStep;
        const isCompleted = i < currentStep;
        const isClickable = onStepClick && i <= currentStep;

        return (
          <React.Fragment key={step.key}>
            {i > 0 && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  background: isCompleted ? colors.primary : colors.blackLighter,
                  transition: `background ${transitions.normal}`,
                  maxWidth: '48px',
                }}
              />
            )}
            <button
              onClick={() => isClickable && onStepClick?.(i)}
              disabled={!isClickable}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: radius.full,
                border: 'none',
                background: isActive
                  ? colors.primary
                  : isCompleted
                    ? 'rgba(66, 33, 206, 0.2)'
                    : 'transparent',
                color: isActive || isCompleted ? colors.white : colors.whiteMuted,
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                cursor: isClickable ? 'pointer' : 'default',
                transition: `all ${transitions.normal}`,
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: isActive
                    ? 'rgba(255,255,255,0.2)'
                    : isCompleted
                      ? colors.primary
                      : colors.blackLighter,
                  color: isCompleted || isActive ? colors.white : colors.whiteMuted,
                }}
              >
                {isCompleted ? '\u2713' : i + 1}
              </span>
              {step.label}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
