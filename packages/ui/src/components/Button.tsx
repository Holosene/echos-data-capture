import React, { useState } from 'react';
import { colors, radius, transitions, shadows, fonts } from '../tokens.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  style?: React.CSSProperties;
  className?: string;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: colors.primary,
    color: colors.white,
    border: 'none',
  },
  secondary: {
    background: 'transparent',
    color: colors.white,
    border: `1px solid ${colors.glassBorder}`,
  },
  ghost: {
    background: 'transparent',
    color: colors.whiteDim,
    border: 'none',
  },
  danger: {
    background: colors.error,
    color: colors.white,
    border: 'none',
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '6px 14px', fontSize: '13px' },
  md: { padding: '10px 20px', fontSize: '14px' },
  lg: { padding: '14px 28px', fontSize: '16px' },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  style,
  className = '',
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);

  const baseStyle: React.CSSProperties = {
    ...variantStyles[variant],
    ...sizeStyles[size],
    borderRadius: radius.md,
    fontFamily: fonts.body,
    fontWeight: 500,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: `all ${transitions.fast}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: hovered && !disabled ? shadows.glow : 'none',
    transform: hovered && !disabled ? 'translateY(-1px)' : 'none',
    ...style,
  };

  return (
    <button
      type={type}
      className={className}
      style={baseStyle}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {loading && (
        <span
          style={{
            width: '14px',
            height: '14px',
            border: `2px solid ${colors.whiteDim}`,
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'echos-spin 0.8s linear infinite',
            display: 'inline-block',
          }}
        />
      )}
      {children}
    </button>
  );
}
