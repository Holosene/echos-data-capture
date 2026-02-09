import React, { useState } from 'react';
import { colors, radius, shadows, transitions } from '../tokens.js';

export interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

export function Tooltip({ text, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: colors.surface,
            color: colors.white,
            padding: '8px 12px',
            borderRadius: radius.sm,
            fontSize: '13px',
            lineHeight: '1.4',
            whiteSpace: 'nowrap',
            maxWidth: '280px',
            boxShadow: shadows.lg,
            zIndex: 100,
            pointerEvents: 'none',
            opacity: visible ? 1 : 0,
            transition: `opacity ${transitions.fast}`,
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
}
