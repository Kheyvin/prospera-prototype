'use client';

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

/**
 * PRENTER Button — CTA primario + acciones secundarias.
 * Port fiel de components/core/Button.jsx (Claude Design). Estilo 100%
 * token-driven (var(--brand), etc.) — ver ui/app/globals.css. Pill, display 600,
 * micro-scale al click.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

const SIZES: Record<ButtonSize, CSSProperties> = {
  sm: { padding: '8px 16px', fontSize: '14px', height: '36px' },
  md: { padding: '11px 22px', fontSize: '15px', height: '44px' },
  lg: { padding: '14px 30px', fontSize: '16px', height: '52px' },
};

const VARIANTS: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: 'var(--color-brand)',
    color: 'var(--color-brand-contrast)',
    border: '1px solid var(--color-brand)',
    boxShadow: 'var(--shadow-brand)',
  },
  secondary: {
    background: 'var(--color-white)',
    color: 'var(--color-neutral-900)',
    border: '1px solid var(--color-border-default)',
    boxShadow: 'var(--shadow-xs)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-teal-400)',
    border: '1px solid transparent',
    boxShadow: 'none',
  },
  dark: {
    background: 'var(--color-ink)',
    color: 'var(--color-white)',
    border: '1px solid var(--color-ink)',
    boxShadow: 'var(--shadow-sm)',
  },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  iconLeft = null,
  iconRight = null,
  type = 'button',
  style,
  ...rest
}: ButtonProps) {
  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    letterSpacing: '0.01em',
    borderRadius: 'var(--radius-pill)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    transition: 'transform .12s ease, background .15s ease, box-shadow .15s ease, opacity .15s ease',
    whiteSpace: 'nowrap',
    ...SIZES[size],
    ...VARIANTS[variant],
    ...style,
  };

  return (
    <button
      type={type}
      disabled={disabled}
      style={base}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = 'scale(0.97)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
