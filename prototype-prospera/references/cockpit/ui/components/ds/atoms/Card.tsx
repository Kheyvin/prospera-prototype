import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

/**
 * PRENTER Card — contenedor de superficie.
 * Port fiel de components/core/Card.jsx (Claude Design).
 * `variant`: 'light' (blanco) | 'dark' (lenguaje web, superficie oscura + borde hairline).
 * `caption`: etiqueta mono tipo "FIG 0.2". `accent`: borde superior teal.
 * `glow`: marca la superficie para el brillo teal que sigue el cursor (data-glow).
 */
export type CardVariant = 'light' | 'dark';
export type CardElevation = 'flat' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: CardVariant;
  elevation?: CardElevation;
  padding?: string;
  accent?: boolean;
  caption?: ReactNode;
  glow?: boolean;
}

const SHADOWS: Record<CardElevation, string> = {
  flat: 'none',
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
};

export function Card({
  children,
  variant = 'light',
  elevation = 'sm',
  padding = 'var(--space-6)',
  accent = false,
  caption = null,
  glow = false,
  style,
  ...rest
}: CardProps) {
  const dark = variant === 'dark';
  const wrap: CSSProperties = {
    position: 'relative',
    background: dark ? 'var(--color-dark-surface)' : 'var(--color-surface-card)',
    border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--color-border-subtle)',
    borderTop: accent
      ? dark
        ? '1px solid rgba(0,183,170,0.5)'
        : '3px solid var(--color-brand)'
      : dark
        ? '1px solid rgba(255,255,255,0.08)'
        : '1px solid var(--color-border-subtle)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: dark ? 'none' : SHADOWS[elevation] ?? SHADOWS.sm,
    color: dark ? 'rgba(255,255,255,0.9)' : 'inherit',
    padding,
    boxSizing: 'border-box',
    ...style,
  };
  return (
    <div style={wrap} {...(glow ? { 'data-glow': '' } : {})} {...rest}>
      {caption && (
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: dark ? 'rgba(255,255,255,0.36)' : 'var(--color-neutral-500)',
            marginBottom: '14px',
          }}
        >
          {caption}
        </div>
      )}
      {children}
    </div>
  );
}
