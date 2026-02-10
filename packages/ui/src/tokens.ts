/**
 * ECHOS Design Tokens — Light mode, 3-color system
 */

export const colors = {
  // Brand triad
  black: '#FAFAFA',
  white: '#FFFFFF',
  accent: '#4221CE',
  accentHover: '#5835E4',
  accentMuted: 'rgba(66, 33, 206, 0.08)',

  // Surfaces
  surface: '#FFFFFF',
  surfaceHover: '#F5F5F7',
  surfaceRaised: '#EFEFEF',

  // Borders
  border: 'rgba(0, 0, 0, 0.10)',
  borderHover: 'rgba(0, 0, 0, 0.16)',
  borderActive: 'rgba(0, 0, 0, 0.24)',

  // Text
  text1: '#111111',
  text2: 'rgba(17, 17, 17, 0.60)',
  text3: 'rgba(17, 17, 17, 0.35)',

  // Functional
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',

  // Legacy aliases (backward compat)
  primary: '#4221CE',
  primaryLight: '#5835E4',
  primaryDark: '#3318A8',
  blackLight: '#FFFFFF',
  blackLighter: '#F5F5F7',
  whiteDim: 'rgba(17, 17, 17, 0.60)',
  whiteMuted: 'rgba(17, 17, 17, 0.35)',
  glass: '#FFFFFF',
  glassBorder: 'rgba(0, 0, 0, 0.10)',
  glassHover: '#F5F5F7',
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
  display: "'halyard-display-variable', sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.06)',
  md: '0 4px 12px rgba(0, 0, 0, 0.08)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
  glow: '0 0 20px rgba(66, 33, 206, 0.15)',
} as const;

export const transitions = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '350ms ease',
} as const;
