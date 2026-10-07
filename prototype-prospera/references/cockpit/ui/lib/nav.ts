/** Entradas de nav que cockpit expone a shells anfitriones (hoy: sidebar devhub). */
export interface CockpitNavEntry {
  id: string;
  href: string;
  label: string;
}

export const COCKPIT_NAV: CockpitNavEntry[] = [
  { id: 'negocio', href: '/negocio', label: 'Negocio' },
];
