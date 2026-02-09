import React from 'react';
import { colors, radius, transitions } from '../tokens.js';

export interface ProgressBarProps {
  /** 0 to 1 */
  value: number;
  label?: string;
  showPercent?: boolean;
  height?: number;
}

export function ProgressBar({
  value,
  label,
  showPercent = true,
  height = 8,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value * 100));

  return (
    <div>
      {(label || showPercent) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '6px',
            fontSize: '13px',
          }}
        >
          {label && <span style={{ color: colors.whiteDim }}>{label}</span>}
          {showPercent && <span style={{ color: colors.whiteMuted }}>{pct.toFixed(0)}%</span>}
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          background: colors.blackLighter,
          borderRadius: radius.full,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${colors.primary}, ${colors.primaryLight})`,
            borderRadius: radius.full,
            transition: `width ${transitions.normal}`,
          }}
        />
      </div>
    </div>
  );
}
