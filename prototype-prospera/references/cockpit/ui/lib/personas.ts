// Personas — pilar Personas del objeto normalizado (BL-01 · CK-12): persona + rol
// un-archivo-por-entidad en el shell de la empresa (empresa/personas/ + empresa/roles/,
// sistema/schema/objeto.schema.yaml · layout plano D-15). Desde CK-13 se sirven como
// rebanada de /api/objeto?empresa= (el objeto completo, 9 entidades — /api/personas
// quedó superseded). A diferencia del negocio.yaml (proyección curada, D-13), esto ES
// la fuente: las entidades upstream del objeto.

import { request } from './negocio';
import type { Negocio, NegocioProceso } from './negocio';

/** Asignación persona→rol (owning side de la N:M persona↔rol, objeto.schema). */
export interface PersonaRolRef {
  rol: string;
  desde?: string;
  dedicacion?: string;
}

/** Ref normalizada del schema v2 (objeto.schema.yaml): { ref, tipo }. */
export interface RefObj {
  ref: string;
  tipo?: string;
}

/** Business Actor individual (O4) — quién es, qué roles cumple, a quién reporta.
 *  `reporta_a` (schema v2) = array de refs `{ref,tipo}`; se tolera la forma legacy
 *  (string id) para no romper datos viejos. */
export interface Persona {
  id: string;
  nombre: string;
  contacto?: { email?: string; tel?: string; handles?: string[] };
  roles?: PersonaRolRef[];
  competencias?: string[];
  reporta_a?: string | RefObj | Array<string | RefObj>;
  fuente?: string;
  conf?: string;
}

/** Resuelve `reporta_a` (string legacy | ref v2 | array) a los NOMBRES de los
 *  jefes; ref colgante → el id crudo (delata en vez de ocultar, §14). */
export function jefesDePersona(persona: Persona, personas: Persona[]): string[] {
  const raw = persona.reporta_a;
  if (!raw) return [];
  const items = Array.isArray(raw) ? raw : [raw];
  return items
    .map((it) => (typeof it === 'string' ? it : it?.ref))
    .filter((id): id is string => Boolean(id))
    .map((id) => personas.find((p) => p.id === id)?.nombre ?? id);
}

/** Business Role (O4) — el "cargo" (SOMA C8); lo no-procesal vive aquí (ISO cl.5.3). */
export interface Rol {
  id: string;
  nombre: string;
  descripcion?: string;
  responsabilidades?: string[];
  autoridad?: string;
  competencias_req?: string[];
  capabilities_ref?: string[];
  es_stakeholder?: boolean;
  fuente?: string;
  conf?: string;
}

export interface PersonasData {
  personas: Persona[];
  roles: Rol[];
  /** Ruta de empresa/ en disco (debug). */
  _path?: string;
  /** Warnings de validación del cockpit (objeto.schema persona/rol): refs/enums/ciclos. */
  _warnings?: string[];
}

/**
 * Personas + roles de una EMPRESA (cuelga de ?empresa=, como el negocio) — la
 * rebanada Personas de /api/objeto (CK-13). Carpetas ausentes en el shell → listas
 * vacías = empty-state honesto (nunca null: a diferencia del negocio.yaml —un
 * archivo—, acá "no hay carpeta" y "carpeta vacía" son el mismo hecho: el pilar no
 * está poblado). Los warnings son del objeto ENTERO (la validación cruza entidades:
 * un carril_ref colgante de un proceso también delata al pilar Personas).
 */
export async function getPersonas(empresa: string): Promise<PersonasData> {
  const data = await request<{
    personas: Persona[];
    roles: Rol[];
    path: string;
    warnings?: string[];
  }>(`/api/objeto?empresa=${encodeURIComponent(empresa)}`);
  return {
    personas: data.personas ?? [],
    roles: data.roles ?? [],
    _path: data.path,
    _warnings: data.warnings ?? [],
  };
}

// ---- modelo puro (cero React) — inversos por scan (un-hecho-un-lugar) ----

/** Personas que cumplen un rol (inverso de persona.roles[], computado, no guardado). */
export function quienesCumplen(personas: Persona[], rolId: string): Persona[] {
  return personas.filter((p) => (p.roles ?? []).some((r) => r.rol === rolId));
}

/** Nombres de los roles que cumple una persona, resueltos contra roles/ (ref colgante → el id crudo, delata en vez de ocultar). */
export function rolesDePersona(persona: Persona, roles: Rol[]): string[] {
  return (persona.roles ?? []).map((r) => roles.find((x) => x.id === r.rol)?.nombre ?? r.rol);
}

/**
 * Procesos del diagnóstico que corre un rol — match exacto puesto↔rol.nombre.
 * Puente consciente (D-13): negocio.yaml sigue curado a mano con `puesto` texto libre;
 * cuando se genere del objeto, esto pasa a ser una ref real (carril/dueño_ref).
 */
export function procesosDelRol(
  negocio: Negocio,
  rol: Rol
): (NegocioProceso & { area: string })[] {
  return negocio.areas.flatMap((a) =>
    a.procesos.filter((p) => p.puesto === rol.nombre).map((p) => ({ ...p, area: a.nombre }))
  );
}
