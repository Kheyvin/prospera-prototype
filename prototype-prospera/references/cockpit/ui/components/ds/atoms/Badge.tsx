import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

/**
 * PRENTER Badge — etiqueta compacta de estado / categoría.
 * Port fiel de components/core/Badge.jsx (Claude Design). Opción `dot` (punto
 * teal con halo) y `onDark` para superficies oscuras; `mono` = estética técnica.
 */
export type BadgeTone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: BadgeTone;
  subtle?: boolean;
  dot?: boolean;
  onDark?: boolean;
  mono?: boolean;
}

interface ToneSpec {
  fg: string;
  bg: string;
  solidBg: string;
  dark: string;
}

const TONES: Record<BadgeTone, ToneSpec> = {
  brand: { fg: 'var(--color-teal-700)', bg: 'var(--color-teal-50)', solidBg: 'var(--color-brand)', dark: 'var(--color-teal-400)' },
  neutral: { fg: 'var(--color-neutral-700)', bg: 'var(--color-neutral-100)', solidBg: 'var(--color-neutral-700)', dark: 'rgba(255,255,255,0.7)' },
  success: { fg: 'var(--color-success)', bg: '#e7f4ee', solidBg: 'var(--color-success)', dark: '#5cc99a' },
  warning: { fg: 'var(--color-warning)', bg: '#fbf1dc', solidBg: 'var(--color-warning)', dark: '#e0ad4e' },
  danger: { fg: 'var(--color-danger)', bg: '#fbe9e7', solidBg: 'var(--color-danger)', dark: '#e2766b' },
};

export function Badge({
  children,
  tone = 'brand',
  subtle = true,
  dot = false,
  onDark = false,
  mono = false,
  style,
  ...rest
}: BadgeProps) {
  const t = TONES[tone] ?? TONES.brand;
  const wrap: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: dot ? '7px' : '6px',
    fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)',
    fontWeight: mono ? 500 : 600,
    fontSize: mono ? '11.5px' : '12px',
    letterSpacing: mono ? '0.12em' : '0.02em',
    textTransform: mono ? 'uppercase' : 'none',
    padding: '5px 12px',
    borderRadius: 'var(--radius-pill)',
    background: onDark ? 'rgba(255,255,255,0.04)' : subtle ? t.bg : t.solidBg,
    color: onDark ? 'rgba(255,255,255,0.78)' : subtle ? t.fg : 'var(--color-white)',
    border: onDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
    whiteSpace: 'nowrap',
    ...style,
  };
  const dotColor = onDark ? t.dark : subtle ? t.solidBg : 'var(--color-white)';
  return (
    <span style={wrap} {...rest}>
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: dotColor,
            boxShadow: tone === 'brand' ? `0 0 0 3px ${onDark ? 'rgba(0,183,170,0.18)' : 'rgba(0,183,170,0.14)'}` : 'none',
          }}
        />
      )}
      {children}
    </span>
  );
}
