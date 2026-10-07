'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useEmpresa } from '../providers/EmpresaProvider';
import { CockpitShell } from './CockpitShell';

/** Cablea EmpresaProvider → CockpitShell (props) — el layout raíz se queda
 *  server component; este wrapper es el único punto 'use client' necesario.
 *  El catálogo del design system (/design-system) se renderiza SIN el shell de
 *  negocio (no es una vista de empresa): es el banco de componentes a pantalla
 *  completa. Ver .claude/rules/ui-design-system.md. */
export function CockpitShellConnected({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { empresa, setEmpresa, tree } = useEmpresa();

  if (pathname?.startsWith('/design-system')) {
    return <>{children}</>;
  }

  return (
    <CockpitShell empresa={empresa} empresas={tree?.empresas ?? []} onEmpresaChange={setEmpresa}>
      {children}
    </CockpitShell>
  );
}
