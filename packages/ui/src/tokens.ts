/**
 * ECHOS Design Tokens
 */

export const colors = {
  primary: '#4221CE',
  primaryLight: '#5A3DE8',
  primaryDark: '#3318A8',
  black: '#1A1A1A',
  blackLight: '#2A2A2A',
  blackLighter: '#3A3A3A',
  white: '#E1E0EB',
  whiteDim: '#B0AFBA',
  whiteMuted: '#8A8994',
  glass: 'rgba(30, 30, 42, 0.65)',
  glassBorder: 'rgba(225, 224, 235, 0.12)',
  glassHover: 'rgba(30, 30, 42, 0.80)',
  success: '#2DD4A0',
  warning: '#F5A623',
  error: '#EF4444',
  surface: '#222233',
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
} as const;

export const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  full: '9999px',
} as const;

export const fonts = {
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
} as const;

export const shadows = {
  sm: '0 2px 8px rgba(0, 0, 0, 0.25)',
  md: '0 4px 16px rgba(0, 0, 0, 0.3)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.4)',
  glow: `0 0 20px rgba(66, 33, 206, 0.3)`,
} as const;

export const transitions = {
  fast: '150ms ease',
  normal: '250ms ease',
  slow: '400ms ease',
} as const;
