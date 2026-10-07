'use client';

import { useId, useState } from 'react';
import type { CSSProperties, InputHTMLAttributes, ReactNode } from 'react';

/**
 * PRENTER Input — campo de texto con label, hint y estados (focus teal, invalid).
 * Port fiel de components/forms/Input.jsx (Claude Design). El id se deriva con
 * useId() (estable SSR/CSR) en vez del Math.random() del original.
 */
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label?: ReactNode;
  hint?: ReactNode;
  invalid?: boolean;
  id?: string;
}

export function Input({
  label,
  hint,
  invalid = false,
  disabled = false,
  type = 'text',
  id,
  style,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const autoId = useId();
  const fieldId = id ?? autoId;

  const wrap: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-body)' };
  const lbl: CSSProperties = { fontSize: '13px', fontWeight: 600, color: 'var(--color-neutral-900)' };
  const input: CSSProperties = {
    height: '46px',
    padding: '0 14px',
    fontSize: '15px',
    fontFamily: 'var(--font-body)',
    color: 'var(--color-neutral-900)',
    background: disabled ? 'var(--color-surface-muted)' : 'var(--color-white)',
    border: `1px solid ${invalid ? 'var(--color-danger)' : focused ? 'var(--color-brand)' : 'var(--color-border-default)'}`,
    borderRadius: 'var(--radius-md)',
    outline: 'none',
    boxShadow: focused && !invalid ? '0 0 0 3px rgba(0,183,170,0.16)' : 'none',
    transition: 'border-color .15s ease, box-shadow .15s ease',
    boxSizing: 'border-box',
    width: '100%',
    ...style,
  };
  const hintStyle: CSSProperties = { fontSize: '12px', color: invalid ? 'var(--color-danger)' : 'var(--color-neutral-500)' };

  return (
    <label htmlFor={fieldId} style={wrap}>
      {label && <span style={lbl}>{label}</span>}
      <input
        id={fieldId}
        type={type}
        disabled={disabled}
        style={input}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...rest}
      />
      {hint && <span style={hintStyle}>{hint}</span>}
    </label>
  );
}
