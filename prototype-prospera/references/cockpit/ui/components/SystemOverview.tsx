'use client';

import { Info } from 'lucide-react';
import type {
  PortfolioSistema,
  PortfolioServicio,
  Procedencia,
} from '../lib/portfolio';

/**
 * SystemOverview (Fase 2 · I-41) — la "carnet" de un sistema NO instrumentado.
 * ────────────────────────────────────────────────────────────────────────────
 * Gemelo a nivel SISTEMA del `NotApplicableForPlatform`: cuando el sistema
 * seleccionado es un gap (Odoo compartido, un externo, un proceso terciarizado,
 * o un propio aún sin cockpit), el shell pinta esto en vez de las vistas
 * sistema-scoped — que no aplican porque no hay backlog SDD que mostrar.
 *
 * Todo sale del árbol que el cliente YA tiene (GET /api/portfolio, fuente única
 * de Fase 1): procedencia · ref scopeado por company · descripción · dueño
 * (derivado de servicios_compartidos para los compartidos). Sin telemetría aún.
 */

const PROC_LABEL: Record<Procedencia, string> = {
  propio: 'sistema propio · sin instrumentar',
  compartido: 'servicio compartido del holding',
  externo: 'sistema externo',
  terciarizado: 'proceso terciarizado',
};

const PROC_COLOR: Record<Procedencia, string> = {
  propio: 'text-[var(--color-muted)]',
  compartido: 'text-sky-400',
  externo: 'text-[var(--color-warning-dark)]',
  terciarizado: 'text-zinc-400',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 text-xs">
      <span className="w-28 shrink-0 text-[var(--color-muted)] uppercase tracking-wider text-[10px] pt-0.5">
        {label}
      </span>
      <span className="text-[var(--color-text)]">{children}</span>
    </div>
  );
}

export function SystemOverview({
  sistema,
  empresa,
  servicios,
}: {
  sistema: PortfolioSistema;
  empresa: string;
  servicios: PortfolioServicio[];
}) {
  // Dueño: para un compartido, el servicio del holding (nombre + consumidores).
  const servicio =
    sistema.procedencia === 'compartido'
      ? servicios.find((s) => s.slug === sistema.slug)
      : undefined;

  return (
    <div className="p-6">
      <div className="max-w-lg mx-auto mt-12 rounded border border-[var(--color-border)] bg-[var(--color-panel)] border-l-2 border-l-amber-500/70 p-5 text-sm">
        <h2 className="font-semibold flex items-center gap-2 mb-1">
          <Info className="w-4 h-4 text-[var(--color-warning-dark)]" />
          {sistema.slug}
          {empresa ? <span className="text-[var(--color-muted)] font-normal">· {empresa}</span> : null}
        </h2>
        <p className={`text-xs mb-4 ${PROC_COLOR[sistema.procedencia] ?? 'text-[var(--color-muted)]'}`}>
          {PROC_LABEL[sistema.procedencia] ?? sistema.procedencia}
        </p>

        <div className="flex flex-col gap-2">
          {servicio?.nombre && <Field label="Dueño">{servicio.nombre}</Field>}
          {sistema.ref && (
            <Field label="Referencia">
              <span className="font-mono text-[11px]">{sistema.ref}</span>
            </Field>
          )}
          {sistema.descripcion && <Field label="Descripción">{sistema.descripcion}</Field>}
          {servicio?.consumido_por && servicio.consumido_por.length > 0 && (
            <Field label="Consumido por">
              {servicio.consumido_por.join(' · ')}
            </Field>
          )}
        </div>

        <p className="mt-5 pt-3 border-t border-[var(--color-border)] text-[var(--color-muted)] leading-relaxed">
          <span className="text-[var(--color-warning-dark)]">○ sin telemetría aún</span> — este sistema
          no es un proyecto SDD, así que no tiene Board, Roadmap, Mapa ni Drift. Es un
          <b> gap de digitalización</b> visible: existe y se mapea, todavía sin datos en
          el cockpit.
        </p>
      </div>
    </div>
  );
}
