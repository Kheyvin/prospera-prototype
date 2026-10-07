'use client';

import type { CSSProperties, ReactNode } from 'react';
import { Badge } from '../../components/ds/atoms/Badge';
import { Button } from '../../components/ds/atoms/Button';
import { Card } from '../../components/ds/atoms/Card';
import { Input } from '../../components/ds/atoms/Input';

/* ─────────────────────────────────────────────────────────────────────────
 * Catálogo vivo del PRENTER Design System ("Storybook" embebido, CK-27).
 * Banco de tokens + átomos. Ruta /design-system, sin shell de negocio.
 * NO es una historia de usuario — es la referencia de componentes reutilizable.
 * ───────────────────────────────────────────────────────────────────────── */

const TEAL = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
const NEUTRAL = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
const SEMANTIC: Array<[string, string]> = [
  ['--color-brand', 'brand'],
  ['--color-brand-hover', 'brand-hover'],
  ['--color-brand-active', 'brand-active'],
  ['--color-focus-ring', 'focus-ring'],
  ['--color-success', 'success'],
  ['--color-warning', 'warning'],
  ['--color-danger', 'danger'],
];
const DARK: Array<[string, string]> = [
  ['--color-dark-bg', 'dark-bg'],
  ['--color-dark-surface', 'dark-surface'],
  ['--color-dark-raised', 'dark-raised'],
  ['--color-dark-border', 'dark-border'],
];
const RADII: Array<[string, string]> = [
  ['--radius-sm', 'sm · 4'],
  ['--radius-md', 'md · 8'],
  ['--radius-lg', 'lg · 14'],
  ['--radius-xl', 'xl · 22'],
  ['--radius-pill', 'pill'],
];
const SPACE = ['1', '2', '3', '4', '5', '6', '7', '8'];
const TYPE: Array<[string, string]> = [
  ['--text-display', 'Display · 64'],
  ['--text-h1', 'H1 · 48'],
  ['--text-h2', 'H2 · 36'],
  ['--text-h3', 'H3 · 28'],
  ['--text-h4', 'H4 · 22'],
  ['--text-lg', 'Body lg · 18'],
  ['--text-base', 'Body · 16'],
  ['--text-sm', 'Small · 14'],
];

function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}

function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 'var(--space-9)' }}>
      <Eyebrow>{n} — {title}</Eyebrow>
      <div style={{ marginTop: 'var(--space-5)' }}>{children}</div>
    </section>
  );
}

function Swatch({ color, label, code }: { color: string; label: string; code?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div
        style={{
          height: '56px',
          borderRadius: 'var(--radius-md)',
          background: color,
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      />
      <div style={{ fontSize: '12px', color: 'var(--text-on-dark)' }}>{label}</div>
      {code && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-on-dark-faint)' }}>{code}</div>}
    </div>
  );
}

const grid = (min: string): CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fill, minmax(${min}, 1fr))`,
  gap: 'var(--space-4)',
});

const rowWrap: CSSProperties = { display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' };

export default function DesignSystemPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--color-dark-bg)',
        color: 'var(--text-on-dark)',
        fontFamily: 'var(--font-body)',
        padding: 'var(--space-8) var(--space-7)',
      }}
    >
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ marginBottom: 'var(--space-9)' }}>
          <Eyebrow>Cockpit · banco de componentes</Eyebrow>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-display)',
              fontWeight: 600,
              letterSpacing: 'var(--tracking-tight)',
              lineHeight: 'var(--leading-tight)',
              margin: '12px 0 10px',
            }}
          >
            PRENTER Design System
          </h1>
          <p style={{ color: 'var(--text-on-dark-muted)', maxWidth: '640px', fontSize: 'var(--text-lg)' }}>
            Dark-first, teal como único acento, tipografía display apretada + mono técnica. Toda UI nueva se
            construye contra estos tokens y átomos — <strong style={{ color: 'var(--text-on-dark)' }}>no se duplica</strong> (DRY).
          </p>
          <div style={{ ...rowWrap, marginTop: 'var(--space-5)' }}>
            <Badge tone="brand" dot onDark mono>
              is_default
            </Badge>
            <Badge tone="neutral" onDark mono>
              atomic design
            </Badge>
            <Badge tone="brand" onDark mono>
              CK-27
            </Badge>
          </div>
        </header>

        {/* 01 · Color */}
        <Section n="01" title="Color · teal (único acento)">
          <div style={grid('88px')}>
            {TEAL.map((s) => (
              <Swatch key={s} color={`var(--color-teal-${s})`} label={`teal-${s}`} code={`--color-teal-${s}`} />
            ))}
          </div>
        </Section>

        <Section n="02" title="Color · neutrals + semánticos">
          <div style={grid('88px')}>
            {NEUTRAL.map((s) => (
              <Swatch key={s} color={`var(--color-neutral-${s})`} label={`neutral-${s}`} />
            ))}
          </div>
          <div style={{ ...grid('120px'), marginTop: 'var(--space-5)' }}>
            {SEMANTIC.map(([v, label]) => (
              <Swatch key={v} color={`var(${v})`} label={label} code={v} />
            ))}
          </div>
        </Section>

        <Section n="03" title="Superficies dark (identidad)">
          <div style={grid('120px')}>
            {DARK.map(([v, label]) => (
              <Swatch key={v} color={`var(${v})`} label={label} code={v} />
            ))}
          </div>
        </Section>

        {/* 04 · Typography */}
        <Section n="04" title="Tipografía">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {TYPE.map(([v, label]) => (
              <div key={v} style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-5)' }}>
                <div style={{ width: '120px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-on-dark-faint)', flexShrink: 0 }}>
                  {label}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: `var(${v})`, fontWeight: 600, letterSpacing: 'var(--tracking-tight)', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Tecnología Global
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-5)', marginTop: 'var(--space-3)' }}>
              <div style={{ width: '120px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-on-dark-faint)', flexShrink: 0 }}>
                Mono · eyebrow
              </div>
              <div className="eyebrow">01 — EL MOMENTO · FIG 0.3</div>
            </div>
          </div>
        </Section>

        {/* 05 · Spacing + radii */}
        <Section n="05" title="Spacing (grid 4px) + radios">
          <div style={{ ...rowWrap, alignItems: 'flex-end', marginBottom: 'var(--space-6)' }}>
            {SPACE.map((s) => (
              <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                <div style={{ width: `var(--space-${s})`, height: `var(--space-${s})`, background: 'var(--color-brand)', borderRadius: '3px' }} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-on-dark-faint)' }}>{s}</div>
              </div>
            ))}
          </div>
          <div style={rowWrap}>
            {RADII.map(([v, label]) => (
              <div key={v} style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: `var(${v})`, background: 'var(--color-dark-raised)', border: '1px solid var(--dark-border-teal)' }} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-on-dark-faint)' }}>{label}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* 06 · Button */}
        <Section n="06" title="Átomo · Button">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div style={rowWrap}>
              <Button variant="primary">Cotizar proyecto</Button>
              <Button variant="secondary">Ver detalle</Button>
              <Button variant="ghost">Saber más →</Button>
              <Button variant="dark">Dark</Button>
              <Button variant="primary" disabled>
                Deshabilitado
              </Button>
            </div>
            <div style={rowWrap}>
              <Button size="sm">sm</Button>
              <Button size="md">md</Button>
              <Button size="lg">lg</Button>
            </div>
          </div>
        </Section>

        {/* 07 · Badge */}
        <Section n="07" title="Átomo · Badge">
          <div style={rowWrap}>
            <Badge tone="brand" dot>
              Novedad
            </Badge>
            <Badge tone="success">Sano</Badge>
            <Badge tone="warning">En riesgo</Badge>
            <Badge tone="danger">Crítico</Badge>
            <Badge tone="neutral">Neutro</Badge>
            <Badge tone="brand" mono>
              KPI
            </Badge>
          </div>
          <div style={{ ...rowWrap, marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--color-dark-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Badge tone="brand" dot onDark>
              onDark
            </Badge>
            <Badge tone="success" onDark>
              onDark success
            </Badge>
            <Badge tone="neutral" onDark mono>
              onDark mono
            </Badge>
          </div>
        </Section>

        {/* 08 · Card */}
        <Section n="08" title="Átomo · Card">
          <div style={grid('260px')}>
            <Card variant="light" caption="FIG 0.1">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, margin: '0 0 6px', color: 'var(--color-neutral-900)' }}>Card light</h3>
              <p style={{ color: 'var(--color-neutral-700)', fontSize: '14px', margin: 0 }}>Superficie clara para bloques de lectura densa.</p>
            </Card>
            <Card variant="dark" caption="FIG 0.2" accent>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, margin: '0 0 6px' }}>Card dark · accent</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>Lenguaje web: hairline + borde superior teal.</p>
            </Card>
            <Card variant="dark">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, margin: '0 0 6px' }}>Card dark</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>Sin caption ni accent.</p>
            </Card>
          </div>
        </Section>

        {/* 09 · Input */}
        <Section n="09" title="Átomo · Input">
          <div style={{ maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', background: 'var(--color-surface-card)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)' }}>
            <Input label="Empresa" placeholder="Nombre de la empresa" hint="Como aparecerá en el twin." />
            <Input label="Correo" type="email" placeholder="contacto@empresa.com" invalid hint="Correo inválido." defaultValue="no-es-mail" />
            <Input label="Deshabilitado" placeholder="—" disabled />
          </div>
        </Section>

        <footer style={{ marginTop: 'var(--space-9)', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--color-dark-border)', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-on-dark-faint)', letterSpacing: '0.1em' }}>
          PRENTER DS · CK-27 · ui/components/ds · .claude/rules/ui-design-system.md
        </footer>
      </div>
    </main>
  );
}
