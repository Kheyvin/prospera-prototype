// Negocio — Vista de Negocio empresa-level (I-46, Fase 5): el diagnóstico M1
// (objetivos del directorio + áreas/procesos con semáforo de digitalización + el
// Hilo de Oro §19). Curado a mano en el shell de la empresa (empresa/negocio.yaml),
// servido por /api/negocio?empresa= — cockpit es dueño de ese contrato desde CK-05.
// null = la empresa no tiene diagnóstico aún.
//
// El cliente fetch (`request`/`NegocioApiError`) es una vendorización consciente del
// wrapper de devhub/ui/lib/api-client.ts (mismo racional que el glue Go de CK-05):
// cockpit queda autocontenido para Stage 4, drift del envelope `{error}` aceptado.

/** Nivel de digitalización de un proceso (el "semáforo"). */
export type Digital = 'manual' | 'externo' | 'integrado';

/** Un objetivo del directorio con su indicador (KR) y meta from→to. */
export interface NegocioObjetivo {
  id: string;
  nombre: string;
  kr: string;
  from: string;
  to: string;
  unit?: string;
}

/** Un proceso del negocio: qué lo corre, cuán digital, a qué objetivos sirve. */
export interface NegocioProceso {
  id: string;
  nombre: string;
  sistema: string;
  digital: Digital;
  /** ids de objetivo que sirve ([] = huérfano, no sube a ninguna meta). */
  obj: string[];
  puesto?: string;
  fuente?: string;
  conf?: string;
  /** Etapa del ciclo de vida (para el drawer de drill-down, slice 2). */
  ciclo?: string;
}

/** Prioridad de una brecha (compone con el costo del caso de negocio). */
export type Prioridad = 'alta' | 'media' | 'baja';

/**
 * Una brecha del diagnóstico (motor de Gap Analysis, §15): qué falla, a qué
 * objetivo bloquea y su caso de negocio. `obj` = id de UN objetivo (o null si no
 * sube a ninguno) — distinto del `obj[]` de un proceso. Slice 2.
 */
export interface NegocioBrecha {
  nombre: string;
  /** El caso de negocio en una línea (por qué duele). */
  sub?: string;
  /** 'Sistema' (ausencia/automatización) o 'Proceso' (doc/método). */
  tipo: string;
  /** id del objetivo que bloquea, o null = sin objetivo (huérfana). */
  obj: string | null;
  /** Costo de no hacer (cifra). */
  costo?: string;
  /** Etiqueta/referencia del costo (la fuente o el benchmark). */
  costoLbl?: string;
  prio: Prioridad;
}

/** Un área del negocio (agrupa procesos por función). */
export interface NegocioArea {
  id: string;
  nombre: string;
  lider?: string;
  procesos: NegocioProceso[];
}

export interface Negocio {
  empresa: string;
  titulo: string;
  nota?: string;
  objetivos: NegocioObjetivo[];
  areas: NegocioArea[];
  /** Brechas priorizadas atadas a objetivo (motor de Gap Analysis §15, slice 2). */
  brechas?: NegocioBrecha[];
  /** Ruta del negocio.yaml en disco (debug). */
  _path?: string;
  /** Warnings de validación del cockpit (negocio.schema.yaml): enums/refs mal formados. */
  _warnings?: string[];
}

export class NegocioApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

/** Compartido con lib/personas.ts (mismo envelope {error} del runtime propio). */
export async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // body vacío · OK
  }
  if (!res.ok) {
    const msg =
      (body as { error?: string } | null)?.error ?? `HTTP ${res.status}`;
    throw new NegocioApiError(msg, res.status, body);
  }
  return body as T;
}

/**
 * Diagnóstico de negocio de una EMPRESA (Vista de Negocio, I-46). A diferencia del
 * resto del cliente, cuelga de la empresa (?empresa=), no del sistema. `null` = la
 * empresa no tiene empresa/negocio.yaml en su shell → empty-state honesto.
 */
export async function getNegocio(empresa: string): Promise<Negocio | null> {
  const data = await request<{
    negocio: Negocio | null;
    path: string;
    warnings?: string[];
  }>(`/api/negocio?empresa=${encodeURIComponent(empresa)}`);
  return data.negocio
    ? { ...data.negocio, _path: data.path, _warnings: data.warnings ?? [] }
    : null;
}
