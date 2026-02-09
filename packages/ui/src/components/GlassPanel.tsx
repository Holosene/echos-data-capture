import React from 'react';
import { colors, radius, shadows } from '../tokens.js';

export interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  padding?: string;
  onClick?: () => void;
}

export function GlassPanel({
  children,
  className = '',
  style,
  padding = '24px',
  onClick,
}: GlassPanelProps) {
  return (
    <div
      className={`glass ${className}`}
      onClick={onClick}
      style={{
        background: colors.glass,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${colors.glassBorder}`,
        borderRadius: radius.lg,
        boxShadow: shadows.md,
        padding,
        transition: 'background 250ms ease, box-shadow 250ms ease',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
