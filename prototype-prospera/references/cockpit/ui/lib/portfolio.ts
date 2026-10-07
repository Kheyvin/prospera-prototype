/**
 * portfolio.ts — agrupa las sistema-keys del cockpit en jerarquía Empresa → Sistema.
 * ────────────────────────────────────────────────────────────────────────────
 * En modo MULTI (multi-empresa · daemon :4000) las sistema-keys vienen
 * compuestas como "empresa/sistema" (ej. "vitalia/platform"). En modo SINGLE
 * (un workspace) son simples (ej. "platform", "web") → empresa = "" (la propia).
 *
 * CLIENT-SAFE: sin imports de node. Es el modelo Dueño→Empresa→Sistema (I-36)
 * proyectado sobre las sistema-keys. Desde Fase 1 (I-37) el SistemaProvider deriva
 * estas keys del árbol de GET /api/portfolio (fuente única); estos helpers de
 * key plana siguen sirviendo al modo single y a parsear "empresa/sistema".
 *
 * Extraído a products/cockpit/ (CK-02) — sigue consumido por products/devhub/ui
 * (SistemaProvider/AppShell/Sidebar/EmpresaDependencias/SistemaSwitcher/SystemOverview)
 * vía el alias `@cockpit/lib/*`, dentro del mismo build/binario (una plataforma,
 * un build, un binario — I-64, no derogada) hasta que un futuro campaña decida
 * un runtime propio para P1.
 */

export interface SistemaEntry {
  /** La sistema-key completa que el resto del cockpit usa para fetch (?sistema=...). */
  key: string;
  /** El slug del sistema (parte derecha en multi; la key entera en single). */
  sistema: string;
}

export interface EmpresaGroup {
  /** "" en modo single (no hay prefijo de empresa). */
  empresa: string;
  sistemas: SistemaEntry[];
}

/** ¿La lista trae jerarquía de 2 niveles (alguna key con "empresa/sistema")? */
export function isTwoLevel(sistemas: string[]): boolean {
  return sistemas.some((b) => b.includes('/'));
}

/** Parte un sistema-key en {empresa, sistema}. Sin "/" → empresa = "". */
export function splitSistemaKey(key: string): { empresa: string; sistema: string } {
  const i = key.indexOf('/');
  if (i === -1) return { empresa: '', sistema: key };
  return { empresa: key.slice(0, i), sistema: key.slice(i + 1) };
}

/** La empresa a la que pertenece un sistema-key. */
export function empresaOf(key: string): string {
  return splitSistemaKey(key).empresa;
}

/** Agrupa las keys por empresa, preservando el orden de aparición. */
export function groupByEmpresa(sistemas: string[]): EmpresaGroup[] {
  const order: string[] = [];
  const byEmpresa = new Map<string, SistemaEntry[]>();
  for (const key of sistemas) {
    const { empresa, sistema } = splitSistemaKey(key);
    if (!byEmpresa.has(empresa)) {
      byEmpresa.set(empresa, []);
      order.push(empresa);
    }
    byEmpresa.get(empresa)!.push({ key, sistema });
  }
  return order.map((empresa) => ({ empresa, sistemas: byEmpresa.get(empresa)! }));
}

/** Los sistemas de una empresa dada (lista vacía si no existe). */
export function sistemasFor(sistemas: string[], empresa: string): SistemaEntry[] {
  return groupByEmpresa(sistemas).find((g) => g.empresa === empresa)?.sistemas ?? [];
}

// ── Árbol de /api/portfolio (I-36 · vista de empresa completa) ───────────────
// Espeja el JSON del backend (portfolio.go). `dependencias` = sistemas NO-sistema
// de la empresa (compartido/externo/terciarizado) con su procedencia.

export type Procedencia = 'propio' | 'compartido' | 'externo' | 'terciarizado';

export interface PortfolioSistema {
  slug: string;
  procedencia: Procedencia;
  /** sistema-key navegable; vacío/ausente = no instrumentado (gap, se ve pero no se navega). */
  key?: string;
  ref?: string;
  /** texto libre del sistema (lo muestra el overview de un gap · Fase 2 / I-41). */
  descripcion?: string;
  navegable: boolean;
}

export interface PortfolioEmpresa {
  slug: string;
  kind?: string;
  /** false = empresa registrada sin cockpit instrumentado aún (se ve como gap). */
  active: boolean;
  sistemas: PortfolioSistema[];
}

export interface PortfolioServicio {
  slug: string;
  nombre?: string;
  consumido_por?: string[];
}

export interface PortfolioTree {
  mode: string;
  /** sistema inicial preferido (env DEFAULT_SISTEMA); ausente = sin preferencia. */
  default_sistema?: string;
  empresas: PortfolioEmpresa[];
  servicios_compartidos: PortfolioServicio[];
}

// ── Derivaciones del árbol para el selector + el provider (I-37 · Fase 1) ─────
// El SistemaProvider consume /api/portfolio como FUENTE ÚNICA: deriva la lista
// plana de keys navegables (contrato hacia las vistas) y el selector pinta el
// árbol completo (empresas + gaps). Funciones puras → testeables.

/** Todas las sistema-keys navegables del árbol, en orden de empresa/sistema.
 *  Es el reemplazo de la lista que antes daba /api/sistemas. */
export function navigableKeys(tree: PortfolioTree | null): string[] {
  if (!tree) return [];
  const out: string[] = [];
  for (const e of tree.empresas) {
    for (const s of e.sistemas) {
      if (s.navegable && s.key) out.push(s.key);
    }
  }
  return out;
}

/** Los sistemas de una empresa (por slug) en el árbol; [] si no existe. */
export function sistemasForEmpresa(
  tree: PortfolioTree | null,
  empresa: string,
): PortfolioSistema[] {
  if (!tree) return [];
  return tree.empresas.find((e) => e.slug === empresa)?.sistemas ?? [];
}

/** La primera key navegable de una empresa (para saltar al elegirla); undefined si solo tiene gaps. */
export function firstNavegableKey(
  tree: PortfolioTree | null,
  empresa: string,
): string | undefined {
  return sistemasForEmpresa(tree, empresa).find((s) => s.navegable && s.key)?.key;
}

/** Un sistema concreto de una empresa por su slug; undefined si no existe.
 *  Es el lookup para resolver el sistema SELECCIONADO (navegable o gap) en el
 *  selector — Fase 2 lo usa para decidir si pinta vista normal u overview. */
export function sistemaBySlug(
  tree: PortfolioTree | null,
  empresa: string,
  slug: string,
): PortfolioSistema | undefined {
  if (!slug) return undefined;
  return sistemasForEmpresa(tree, empresa).find((s) => s.slug === slug);
}

/** El slug del sistema por defecto al entrar a una empresa: el primer navegable
 *  si lo hay, si no el primer sistema (gap → overview). "" si no tiene ninguno. */
export function defaultSistemaSlug(
  tree: PortfolioTree | null,
  empresa: string,
): string {
  const sistemas = sistemasForEmpresa(tree, empresa);
  const nav = sistemas.find((s) => s.navegable && s.key);
  return (nav ?? sistemas[0])?.slug ?? '';
}

/** ¿La empresa tiene al menos un sistema navegable? (false → mostrar overview/placeholder). */
export function empresaHasNavegable(
  tree: PortfolioTree | null,
  empresa: string,
): boolean {
  return firstNavegableKey(tree, empresa) !== undefined;
}

/** Los sistemas NO-propio (dependencias: compartido/externo/terciarizado) de la
 *  empresa de el sistema actual. */
export function dependenciasForSistema(
  tree: PortfolioTree | null,
  sistema: string,
): PortfolioSistema[] {
  if (!tree) return [];
  const empresa = empresaOf(sistema);
  const e = tree.empresas.find((x) => x.slug === empresa);
  return e ? e.sistemas.filter((s) => s.procedencia !== 'propio') : [];
}

// ── Deep-link por URL (I-50) ─────────────────────────────────────────────────
// La navegación viaja en la barra como dos params: ?empresa=<slug>&sistema=<slug>.
// `empresa` fija la empresa (round-trips la Vista de Negocio empresa-scoped y
// futuras empresas solo-gap); `sistema` es el slug DENTRO de la empresa (puede ser
// navegable → board, o gap → overview). Es la SSoT de navegación: gana sobre
// localStorage al cargar, y el selector la reescribe en cada cambio (router.replace).
// La forma de la URL del navegador es independiente de la del API Go (?sistema=
// compuesto que arman los fetch): el front la construye desde el estado, no al revés.

/** Lee la intención de navegación de una query string (?empresa=&sistema=).
 *  Valores ausentes/vacíos → undefined (el caller cae a localStorage/default). */
export function parseSistemaSearch(search: string): { empresa?: string; sistema?: string } {
  const p = new URLSearchParams(search);
  return {
    empresa: p.get('empresa') || undefined,
    sistema: p.get('sistema') || undefined,
  };
}

/** Serializa empresa+slug a query string (con '?' inicial; '' si ambos vacíos). */
export function buildSistemaSearch(empresa: string, sistemaSlug: string): string {
  const p = new URLSearchParams();
  if (empresa) p.set('empresa', empresa);
  if (sistemaSlug) p.set('sistema', sistemaSlug);
  const s = p.toString();
  return s ? `?${s}` : '';
}

/** Selección de navegación canónica resuelta contra el árbol. */
export interface SistemaSelection {
  empresa: string;
  sistemaSlug: string;
  /** Key navegable ACTIVA: el sistema elegido si es navegable; si es gap, el
   *  primer navegable de la empresa (key de fondo para Sidebar/FileWatch mientras
   *  el shell pinta el overview). undefined si la empresa no tiene ningún navegable. */
  key?: string;
  /** true → el sistema elegido es un gap (el shell muestra SystemOverview). */
  isGap: boolean;
}

/** Resuelve una intención (?empresa=&sistema=) contra el árbol a una selección
 *  canónica. Defensivo: empresa inexistente → null (el caller conserva su estado
 *  actual); slug que no pertenece a la empresa → el default de la empresa. */
export function resolveSistemaIntent(
  tree: PortfolioTree | null,
  intent: { empresa?: string; sistema?: string },
): SistemaSelection | null {
  if (!tree || !intent.empresa) return null;
  const emp = tree.empresas.find((e) => e.slug === intent.empresa);
  if (!emp) return null;
  const empresa = emp.slug;
  const slug =
    intent.sistema && sistemaBySlug(tree, empresa, intent.sistema)
      ? intent.sistema
      : defaultSistemaSlug(tree, empresa);
  const sel = sistemaBySlug(tree, empresa, slug);
  if (sel?.navegable && sel.key) {
    return { empresa, sistemaSlug: slug, key: sel.key, isGap: false };
  }
  return { empresa, sistemaSlug: slug, key: firstNavegableKey(tree, empresa), isGap: true };
}
