import React from 'react';
import { colors, radius } from '../tokens.js';

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit?: string;
  tooltip?: string;
  disabled?: boolean;
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit = '',
  tooltip,
  disabled = false,
}: SliderProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <label
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: colors.white,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {label}
          {tooltip && (
            <span
              title={tooltip}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: colors.blackLighter,
                color: colors.whiteMuted,
                fontSize: '11px',
                cursor: 'help',
              }}
            >
              ?
            </span>
          )}
        </label>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: colors.primary,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        style={{
          width: '100%',
          accentColor: colors.primary,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: colors.whiteMuted,
          marginTop: '4px',
        }}
      >
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
