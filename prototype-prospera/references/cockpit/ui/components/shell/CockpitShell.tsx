'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { PortfolioEmpresa } from '../../lib/portfolio';
import { COCKPIT_NAV } from '../../lib/nav';
import { cn } from '../../lib/cn';

interface CockpitShellProps {
  empresa: string;
  empresas: PortfolioEmpresa[];
  onEmpresaChange: (slug: string) => void;
  children: ReactNode;
}

/**
 * Shell propio de cockpit (CK-06 Stage 3): monta bajo el route-group
 * app/(directorio) de devhub vía un adapter — espejo React del struct Deps
 * de CK-05. Nav agrupada por rol; hoy solo Directorio tiene una página viva
 * (Negocio) — Área/Consultor quedan como placeholders honestos.
 */
export function CockpitShell({
  empresa,
  empresas,
  onEmpresaChange,
  children,
}: CockpitShellProps) {
  const pathname = usePathname();
  // El export estático (COCKPIT_STATIC=1, trailingSlash:true) hace que
  // usePathname() devuelva "/negocio/" en el binario real — comparar contra
  // entry.href ("/negocio") a secas nunca matchea ahí. Normalizar antes.
  const currentPath = pathname.replace(/\/$/, '');

  return (
    <div className="flex min-h-screen h-screen overflow-hidden">
      <aside className="bg-[var(--color-panel)] border-r border-[var(--color-border)] w-56 flex flex-col shrink-0">
        <div className="px-4 py-4 border-b border-[var(--color-border)]">
          <h1 className="text-base font-semibold">Cockpit</h1>
          <p className="text-[10px] text-[var(--color-muted)] mt-1">Sistema empresarial</p>
        </div>

        {empresas.length > 0 && (
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <label
              htmlFor="cockpit-empresa-select"
              className="block text-[9px] uppercase tracking-wider text-[var(--color-muted)] mb-1"
            >
              Empresa
            </label>
            <select
              id="cockpit-empresa-select"
              value={empresa}
              onChange={(e) => onEmpresaChange(e.target.value)}
              className="w-full bg-[var(--color-panel2)] border border-[var(--color-border)] rounded px-2 py-1 text-xs text-[var(--color-text)]"
            >
              {empresas.map((emp) => (
                <option key={emp.slug} value={emp.slug}>
                  {emp.active ? emp.slug : `${emp.slug} · sin cockpit`}
                </option>
              ))}
            </select>
          </div>
        )}

        <nav className="flex-1 py-3 flex flex-col gap-4">
          <div>
            <div className="px-4 pb-1 text-[9px] uppercase tracking-wider text-[var(--color-muted)]">
              Directorio
            </div>
            {COCKPIT_NAV.map((entry) => (
              <Link
                key={entry.id}
                href={entry.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-xs transition-colors',
                  currentPath === entry.href
                    ? 'bg-[var(--color-panel2)] text-[var(--color-text)] border-l-2 border-[var(--color-accent)]'
                    : 'text-[var(--color-muted)] hover:bg-[var(--color-panel2)] hover:text-[var(--color-text)]'
                )}
              >
                <span>{entry.label}</span>
              </Link>
            ))}
          </div>

          <div>
            <div className="px-4 pb-1 text-[9px] uppercase tracking-wider text-[var(--color-muted)]">
              Área
            </div>
            <div className="px-4 py-2 text-xs text-[var(--color-muted)] opacity-40 cursor-not-allowed">
              próximamente
            </div>
          </div>

          <div>
            <div className="px-4 pb-1 text-[9px] uppercase tracking-wider text-[var(--color-muted)]">
              Consultor
            </div>
            <div className="px-4 py-2 text-xs text-[var(--color-muted)] opacity-40 cursor-not-allowed">
              próximamente
            </div>
          </div>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 overflow-auto">{children}</main>
    </div>
  );
}
