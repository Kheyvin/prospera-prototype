'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Spinner, ErrorBanner, EmptyState } from '../ui/Spinner';
import { Card } from '../ui/Card';
import { Tabs } from '../ui/Tabs';
import { Drawer } from '../ui/Drawer';
import { cn } from '../../lib/cn';
import { PersonasTab } from './PersonasTab';
import { getNegocio } from '../../lib/negocio';
import type {
  Negocio,
  NegocioObjetivo,
  NegocioProceso,
  NegocioBrecha,
  Digital,
  Prioridad,
} from '../../lib/negocio';

/**
 * Vista de Negocio empresa-level (I-46, Fase 5) — materializa el diagnóstico M1.
 * A diferencia del resto del cockpit, cuelga de la EMPRESA activa (no de un sistema).
 * Dato curado a mano en el shell de la empresa (empresa/negocio.yaml), leído por
 * /api/negocio. Sin archivo → empty-state honesto.
 *
 * Slice 1: objetivos del directorio + mapa vivo de áreas/procesos con semáforo.
 * Slice 2: el Hilo de Oro (§19) hecho INTERACTIVO — elegir un objetivo del
 * directorio ilumina los procesos que lo sostienen (en el mapa y en la cascada) y
 * resalta las brechas que lo bloquean. Cuatro lentes en sub-tabs (Mapa vivo · Hilo de
 * oro · Brechas · Personas) + drawer de drill-down por proceso (procedencia sin falsa
 * certeza, §14). Personas (BL-01 · CK-12) lee del objeto normalizado, no del negocio.yaml.
 */

const SEMAFORO: Record<Digital, { dot: string; label: string }> = {
  manual: { dot: 'var(--color-danger-dark)', label: 'Manual / Excel' },
  externo: { dot: 'var(--color-warning-dark)', label: 'Tercero / sistema externo' },
  integrado: { dot: 'var(--color-success-dark)', label: 'Integrado' },
};

const CONF_DOT: Record<string, string> = {
  alta: 'var(--color-success-dark)',
  media: 'var(--color-warning-dark)',
  baja: 'var(--color-danger-dark)',
};

const PRIO_CLS: Record<Prioridad, string> = {
  alta: 'text-[var(--color-danger-dark)] border-[var(--color-dark-border)] bg-[var(--color-danger-dark)]/[0.08]',
  media: 'text-[var(--color-warning-dark)] border-[var(--color-dark-border)] bg-[var(--color-warning-dark)]/[0.08]',
  baja: 'text-[var(--text-on-dark-muted)] border-[var(--color-dark-border)]',
};

/** Un proceso aplanado con el nombre de su área (para cascada/huérfanos). */
type FlatProceso = NegocioProceso & { area: string; areaId: string };

function flattenProcesos(negocio: Negocio): FlatProceso[] {
  return negocio.areas.flatMap((a) =>
    a.procesos.map((p) => ({ ...p, area: a.nombre, areaId: a.id }))
  );
}

export function NegocioView({ empresa }: { empresa: string }) {
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado del Hilo de Oro: el objetivo jalado (filtra mapa + cascada + brechas).
  const [activeObj, setActiveObj] = useState<string | null>(null);
  // Recuerda el objetivo jalado POR empresa (memoria-en-sesión: no sobrevive recarga,
  // así no quedan bookmarks fantasma si se edita negocio.yaml). Volver a una empresa
  // ya vista recupera su hilo en vez de resetear a null.
  const objByEmpresa = useRef<Record<string, string | null>>({});
  // Drawer de drill-down: el proceso abierto (con su área).
  const [drill, setDrill] = useState<FlatProceso | null>(null);

  const load = useCallback(() => {
    if (!empresa) {
      setNegocio(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getNegocio(empresa)
      .then((data) => setNegocio(data))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [empresa]);

  useEffect(() => {
    load();
  }, [load]);

  // Cambiar de empresa: restaura el objetivo recordado de esa empresa (memoria-en-sesión)
  // y cierra el drawer. Sin memoria previa → arranca limpio.
  useEffect(() => {
    setActiveObj(empresa ? objByEmpresa.current[empresa] ?? null : null);
    setDrill(null);
  }, [empresa]);

  if (loading) return <div className="p-8"><Spinner /></div>;
  if (error) return <div className="p-6"><ErrorBanner message={error} /></div>;

  if (!negocio) {
    return (
      <div className="mx-auto max-w-6xl space-y-5 p-6">
        <EmptyState>
          {empresa ? (
            <>
              <span className="text-[var(--text-on-dark)] font-medium">{empresa}</span> todavía no
              tiene <span className="text-[var(--color-teal-400)]">diagnóstico de negocio</span>. Se
              cura a mano en <code className="text-[var(--text-on-dark-faint)]">empresa/negocio.yaml</code>{' '}
              de su repo — es la salida del Levantamiento M1, no se deriva del código.
            </>
          ) : (
            <>Elegí una empresa en el selector para ver su diagnóstico de negocio.</>
          )}
        </EmptyState>
        {/* El pilar Personas vive UPSTREAM del negocio.yaml (objeto normalizado,
            BL-01 · CK-12): puede estar poblado aunque el diagnóstico no exista aún. */}
        {empresa && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-on-dark-muted)]">
              Personas
            </h2>
            <PersonasTab empresa={empresa} negocio={null} />
          </section>
        )}
      </div>
    );
  }

  const objById = (id: string | null) =>
    id ? negocio.objetivos.find((o) => o.id === id) ?? null : null;

  function toggleObj(id: string) {
    setActiveObj((cur) => {
      const next = cur === id ? null : id;
      if (empresa) objByEmpresa.current[empresa] = next;
      return next;
    });
  }

  const tabs = [
    {
      id: 'mapa',
      label: 'Mapa vivo',
      content: (
        <MapaTab negocio={negocio} activeObj={activeObj} onDrill={setDrill} />
      ),
    },
    {
      id: 'hilo',
      label: 'Hilo de oro',
      content: <HiloTab negocio={negocio} activeObj={activeObj} />,
    },
    {
      id: 'brechas',
      label: 'Brechas',
      content: (
        <BrechasTab
          brechas={negocio.brechas ?? []}
          activeObj={activeObj}
          objById={objById}
        />
      ),
    },
    {
      id: 'personas',
      label: 'Personas',
      content: <PersonasTab empresa={empresa} negocio={negocio} />,
    },
  ];

  const activeObjName = objById(activeObj)?.nombre;

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-6">
      <header className="space-y-1.5">
        <h1 className="text-xl font-semibold text-[var(--text-on-dark)]">{negocio.titulo}</h1>
        {negocio.nota && <p className="text-xs text-[var(--text-on-dark-faint)]">{negocio.nota}</p>}
      </header>

      {/* Validación al leer (negocio.schema.yaml): el cockpit es el chokepoint de todo
          negocio.yaml. Warnings no-fatales (enums/refs mal formados) — se sigue mostrando
          lo que se pudo leer, pero el dato malo se delata en vez de mentir en silencio. */}
      {negocio._warnings && negocio._warnings.length > 0 && (
        <div className="rounded-md border border-[var(--color-dark-border)] bg-[var(--color-warning-dark)]/[0.08] p-3">
          <div className="text-xs font-semibold text-[var(--color-warning-dark)]">
            ⚠ negocio.yaml mal formado · {negocio._warnings.length}{' '}
            {negocio._warnings.length === 1 ? 'aviso' : 'avisos'}
          </div>
          <ul className="mt-1.5 space-y-0.5 font-mono text-[11px] text-[var(--text-on-dark)]">
            {negocio._warnings.map((wmsg, i) => (
              <li key={i}>· {wmsg}</li>
            ))}
          </ul>
          <p className="mt-1.5 text-[10px] text-[var(--text-on-dark-faint)]">
            Contrato:{' '}
            <code className="text-[var(--text-on-dark-faint)]">.claude/harness/schema/negocio.schema.yaml</code>.
            Se muestra lo que se pudo leer.
          </p>
        </div>
      )}

      {/* Objetivos del directorio — clicables: jalar uno tensa el Hilo de Oro. */}
      <section className="space-y-2">
        <div className="flex flex-wrap items-baseline gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-on-dark-muted)]">
            Objetivos del directorio
          </h2>
          <span className="text-[11px] text-[var(--text-on-dark-faint)]">
            {activeObjName ? (
              <>
                Hilo de oro: <span className="text-[var(--color-success-dark)]">{activeObjName}</span> ·
                tocá de nuevo para soltar
              </>
            ) : (
              <>tocá un objetivo para ver quién lo sostiene</>
            )}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {negocio.objetivos.map((o) => (
            <ObjetivoCard
              key={o.id}
              obj={o}
              active={activeObj === o.id}
              dim={activeObj !== null && activeObj !== o.id}
              onClick={() => toggleObj(o.id)}
            />
          ))}
        </div>
      </section>

      {/* Cuatro lentes del mismo diagnóstico; las tres primeras gobernadas por el
          objetivo jalado, Personas lee el objeto normalizado (BL-01 · CK-12). */}
      <section className="min-h-[20rem]">
        <Tabs tabs={tabs} variant="line" />
      </section>

      {/* Drill-down por proceso: procedencia sin falsa certeza (§14). */}
      <ProcesoDrawer proceso={drill} objById={objById} onClose={() => setDrill(null)} />
    </div>
  );
}

// ── Objetivo (tarjeta clicable) ──────────────────────────────────────────────

function ObjetivoCard({
  obj,
  active,
  dim,
  onClick,
}: {
  obj: NegocioObjetivo;
  active: boolean;
  dim: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-md border bg-[var(--color-panel2)] p-3 text-left transition-all duration-100',
        active
          ? 'border-[var(--color-success-dark)] ring-1 ring-[var(--color-success-dark)]/40'
          : 'border-[var(--color-dark-border)] hover:border-[var(--color-dark-border)]',
        dim && 'opacity-50'
      )}
    >
      <div className="min-h-[24px] font-mono text-[10px] uppercase tracking-wide text-[var(--text-on-dark-faint)]">
        {obj.kr}
      </div>
      <div className="mt-1 text-sm font-semibold leading-tight text-[var(--text-on-dark)]">
        {obj.nombre}
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-1.5 font-mono text-sm">
        <span className="text-[var(--text-on-dark-faint)] line-through">{obj.from}</span>
        <span className="text-[var(--color-success-dark)]">→</span>
        <span className="font-semibold text-[var(--text-on-dark)]">{obj.to}</span>
        {obj.unit && <span className="text-[10px] text-[var(--text-on-dark-muted)]">{obj.unit}</span>}
      </div>
    </button>
  );
}

// ── Tab: Mapa vivo ───────────────────────────────────────────────────────────

function MapaTab({
  negocio,
  activeObj,
  onDrill,
}: {
  negocio: Negocio;
  activeObj: string | null;
  onDrill: (p: FlatProceso) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <p className="mr-auto text-xs text-[var(--text-on-dark-faint)]">
          Cada función del negocio, su sistema y cuánto está digitalizada. Lo manual y
          lo tercerizado, a la vista.
        </p>
        <Legend />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {negocio.areas.map((a) => {
          const hasServe =
            activeObj !== null && a.procesos.some((p) => p.obj.includes(activeObj));
          return (
            <Card
              key={a.id}
              className={cn(
                'p-0 transition-opacity duration-100',
                activeObj !== null && !hasServe && 'opacity-50'
              )}
            >
              <div className="flex items-center justify-between border-b border-[var(--color-dark-border)] px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[var(--text-on-dark)]">
                    {a.nombre}
                  </div>
                  {a.lider && (
                    <div className="truncate text-[10px] text-[var(--text-on-dark-faint)]">{a.lider}</div>
                  )}
                </div>
                <span className="shrink-0 rounded border border-[var(--color-dark-border)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-on-dark-faint)]">
                  {a.procesos.length}
                </span>
              </div>
              <ul className="space-y-1.5 p-3">
                {a.procesos.map((p) => (
                  <ProcesoRow
                    key={p.id}
                    proceso={p}
                    serves={activeObj !== null && p.obj.includes(activeObj)}
                    dim={activeObj !== null && !p.obj.includes(activeObj)}
                    onClick={() => onDrill({ ...p, area: a.nombre, areaId: a.id })}
                  />
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ProcesoRow({
  proceso,
  serves,
  dim,
  onClick,
}: {
  proceso: NegocioProceso;
  serves: boolean;
  dim: boolean;
  onClick: () => void;
}) {
  const sem = SEMAFORO[proceso.digital] ?? SEMAFORO.manual;
  const orphan = proceso.obj.length === 0;
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex w-full items-center gap-3 rounded-md border bg-[var(--color-dark-raised)] px-3 py-2 text-left transition-all duration-100 hover:border-[var(--color-dark-border)]',
          serves ? 'border-[var(--color-success-dark)]/50' : 'border-[var(--color-dark-border)]',
          dim && 'opacity-40'
        )}
      >
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: sem.dot }}
          title={sem.label}
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm text-[var(--text-on-dark)]">{proceso.nombre}</div>
          <div className="truncate font-mono text-[10px] text-[var(--text-on-dark-faint)]">
            {proceso.sistema}
          </div>
        </div>
        {orphan && (
          <span
            className="shrink-0 rounded border border-dashed border-[var(--color-dark-border)] px-1.5 py-0.5 font-mono text-[9px] uppercase text-[var(--color-warning-dark)]"
            title="No sube a ningún objetivo del directorio"
          >
            huérfano
          </span>
        )}
      </button>
    </li>
  );
}

// ── Tab: Hilo de oro (cascada) ───────────────────────────────────────────────

const HILO_TAG: Record<Digital, { label: string; cls: string }> = {
  integrado: { label: 'sostiene', cls: 'text-[var(--color-success-dark)] border-[var(--color-success-dark)]/40' },
  externo: { label: 'depende de tercero', cls: 'text-[var(--color-warning-dark)] border-[var(--color-warning-dark)]/40' },
  manual: { label: 'se rompe · manual', cls: 'text-[var(--color-danger-dark)] border-[var(--color-danger-dark)]/40' },
};

function HiloTab({
  negocio,
  activeObj,
}: {
  negocio: Negocio;
  activeObj: string | null;
}) {
  const flat = useMemo(() => flattenProcesos(negocio), [negocio]);
  // Sin objetivo jalado, mostramos el primero (como el mockup) con un hint.
  const obj = activeObj
    ? negocio.objetivos.find((o) => o.id === activeObj) ?? negocio.objetivos[0]
    : negocio.objetivos[0];
  if (!obj) return null;

  const serving = flat.filter((p) => p.obj.includes(obj.id));
  const orphans = flat.filter((p) => p.obj.length === 0);

  return (
    <div className="space-y-4">
      {!activeObj && (
        <p className="text-[11px] text-[var(--text-on-dark-faint)]">
          Mostrando <span className="text-[var(--text-on-dark)]">{obj.nombre}</span> · tocá otro
          objetivo arriba para seguir su hilo.
        </p>
      )}

      {/* El objetivo, en la cima del hilo */}
      <Card className="border-[var(--color-success-dark)]/30">
        <div className="font-mono text-[10px] uppercase tracking-wide text-[var(--text-on-dark-faint)]">
          Objetivo del directorio
        </div>
        <h3 className="mt-1 text-base font-semibold text-[var(--text-on-dark)]">{obj.nombre}</h3>
        <div className="mt-1 font-mono text-xs text-[var(--text-on-dark-muted)]">
          {obj.kr}: <span className="text-[var(--text-on-dark-faint)] line-through">{obj.from} {obj.unit}</span>{' '}
          <span className="text-[var(--color-success-dark)]">→</span>{' '}
          <span className="text-[var(--text-on-dark)]">{obj.to} {obj.unit}</span>
        </div>
      </Card>

      {/* Los procesos/puestos/sistemas que deberían sostenerlo */}
      <div className="space-y-2">
        <div className="font-mono text-[10px] uppercase tracking-wide text-[var(--text-on-dark-faint)]">
          Procesos · puestos · sistemas que lo sostienen ({serving.length})
        </div>
        {serving.length === 0 ? (
          <Card className="text-sm text-[var(--text-on-dark-muted)]">
            Ningún proceso conecta a este objetivo —{' '}
            <span className="text-[var(--color-danger-dark)]">la cadena no arranca.</span>
          </Card>
        ) : (
          serving.map((p) => {
            const tag = HILO_TAG[p.digital] ?? HILO_TAG.manual;
            return (
              <div
                key={`${p.areaId}-${p.id}`}
                className="flex items-center gap-3 rounded-md border border-[var(--color-dark-border)] bg-[var(--color-dark-raised)] px-3 py-2"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: SEMAFORO[p.digital].dot }}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-[var(--text-on-dark)]">{p.nombre}</div>
                  <div className="truncate font-mono text-[10px] text-[var(--text-on-dark-faint)]">
                    {p.area} · {p.puesto ?? '—'} · {p.sistema}
                  </div>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase',
                    tag.cls
                  )}
                >
                  {tag.label}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Huérfanos: trabajo que no sube a ningún objetivo */}
      <div className="rounded-lg border border-dashed border-[var(--color-dark-border)] bg-[var(--color-panel2)] p-4">
        <h4 className="text-sm font-semibold text-[var(--text-on-dark)]">
          Trabajo que no sube a ningún objetivo ({orphans.length})
        </h4>
        <p className="mt-0.5 text-xs text-[var(--text-on-dark-faint)]">
          Procesos que hoy no conectan con ninguna meta del directorio. ¿Suman, o son
          candidatos a estandarizar / soltar?
        </p>
        {orphans.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {orphans.map((p) => (
              <span
                key={`${p.areaId}-${p.id}`}
                className="rounded-md border border-[var(--color-dark-border)] bg-[var(--color-dark-raised)] px-2.5 py-1.5 text-xs text-[var(--text-on-dark-muted)]"
              >
                <span className="font-medium text-[var(--text-on-dark)]">{p.nombre}</span> · {p.area}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab: Brechas ─────────────────────────────────────────────────────────────

function BrechasTab({
  brechas,
  activeObj,
  objById,
}: {
  brechas: NegocioBrecha[];
  activeObj: string | null;
  objById: (id: string | null) => NegocioObjetivo | null;
}) {
  if (brechas.length === 0) {
    return (
      <EmptyState>
        Esta empresa todavía no tiene brechas diagnosticadas en{' '}
        <code className="text-[var(--text-on-dark-faint)]">empresa/negocio.yaml</code>.
      </EmptyState>
    );
  }
  const filterName = objById(activeObj)?.nombre;
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-on-dark-faint)]">
        Cada brecha atada a un objetivo del directorio, con su caso de negocio.
        {filterName && (
          <>
            {' '}Resaltadas: las que bloquean{' '}
            <span className="text-[var(--color-success-dark)]">{filterName}</span>.
          </>
        )}
      </p>
      <div className="overflow-hidden rounded-lg border border-[var(--color-dark-border)]">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-dark-border)] bg-[var(--color-dark-raised)] text-left font-mono text-[10px] uppercase tracking-wide text-[var(--text-on-dark-faint)]">
              <th className="px-4 py-2.5 font-medium" style={{ width: '36%' }}>Brecha</th>
              <th className="px-3 py-2.5 font-medium">Tipo</th>
              <th className="px-3 py-2.5 font-medium">Objetivo que bloquea</th>
              <th className="px-3 py-2.5 font-medium">Costo de no hacer / ref.</th>
              <th className="px-3 py-2.5 font-medium">Prio</th>
            </tr>
          </thead>
          <tbody>
            {brechas.map((g, i) => {
              const o = objById(g.obj);
              const match = activeObj !== null && g.obj === activeObj;
              const dim = activeObj !== null && g.obj !== activeObj;
              return (
                <tr
                  key={i}
                  className={cn(
                    'border-b border-[var(--color-dark-border)] align-top transition-all duration-100 last:border-0',
                    match && 'bg-[var(--color-success-dark)]/[0.06]',
                    dim && 'opacity-45'
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-[var(--text-on-dark)]">{g.nombre}</div>
                    {g.sub && (
                      <div className="mt-0.5 text-xs leading-snug text-[var(--text-on-dark-faint)]">
                        {g.sub}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded border border-[var(--color-dark-border)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-on-dark-muted)]">
                      {g.tipo}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {o ? (
                      <span className="rounded border border-[var(--color-success-dark)]/40 px-1.5 py-0.5 text-xs text-[var(--color-success-dark)]">
                        {o.nombre}
                      </span>
                    ) : (
                      <span className="rounded border border-dashed border-[var(--color-dark-border)] px-1.5 py-0.5 text-xs text-[var(--color-warning-dark)]">
                        sin objetivo
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-mono text-xs text-[var(--text-on-dark)]">{g.costo ?? '—'}</div>
                    {g.costoLbl && (
                      <div className="mt-0.5 text-[10px] text-[var(--text-on-dark-faint)]">{g.costoLbl}</div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        'rounded border px-2 py-0.5 font-mono text-[10px] uppercase',
                        PRIO_CLS[g.prio] ?? PRIO_CLS.baja
                      )}
                    >
                      {g.prio}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Drawer: drill-down por proceso ───────────────────────────────────────────

function ProcesoDrawer({
  proceso,
  objById,
  onClose,
}: {
  proceso: FlatProceso | null;
  objById: (id: string | null) => NegocioObjetivo | null;
  onClose: () => void;
}) {
  const sem = proceso ? SEMAFORO[proceso.digital] ?? SEMAFORO.manual : null;
  const objs = proceso ? proceso.obj.map((id) => objById(id)).filter(Boolean) : [];
  return (
    <Drawer
      open={proceso !== null}
      onClose={onClose}
      width={440}
      title={
        proceso && (
          <div className="min-w-0">
            <div className="truncate font-mono text-[10px] uppercase tracking-wide text-[var(--text-on-dark-faint)]">
              {proceso.area}
            </div>
            <div className="truncate text-sm font-semibold text-[var(--text-on-dark)]">
              {proceso.nombre}
            </div>
          </div>
        )
      }
    >
      {proceso && sem && (
        <div className="space-y-4 text-sm">
          {proceso.puesto && (
            <div className="text-xs text-[var(--text-on-dark-muted)]">
              Responsable: <span className="text-[var(--text-on-dark)]">{proceso.puesto}</span>
            </div>
          )}
          <dl className="space-y-2.5">
            {proceso.ciclo && <DRow k="Etapa del ciclo" v={proceso.ciclo} />}
            <DRow
              k="Digitalización"
              v={
                <span className="inline-flex items-center gap-2">
                  <i className="h-2.5 w-2.5 rounded-full" style={{ background: sem.dot }} />
                  {sem.label}
                </span>
              }
            />
            <DRow k="Sistema actual" v={proceso.sistema} />
            <DRow
              k="Objetivos que sirve"
              v={
                objs.length ? (
                  <span className="flex flex-wrap justify-end gap-1.5">
                    {objs.map((o) => (
                      <span
                        key={o!.id}
                        className="rounded border border-[var(--color-success-dark)]/40 px-1.5 py-0.5 text-xs text-[var(--color-success-dark)]"
                      >
                        {o!.nombre}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="text-[var(--color-warning-dark)]">no conecta a ningún objetivo</span>
                )
              }
            />
          </dl>

          {/* Procedencia — honestidad sin falsa certeza (§14) */}
          <div className="rounded-lg border border-[var(--color-dark-border)] bg-[var(--color-panel2)] p-3">
            <div className="font-mono text-[10px] uppercase tracking-wide text-[var(--text-on-dark-faint)]">
              Procedencia · sin falsa certeza
            </div>
            <dl className="mt-2 space-y-2.5">
              <DRow k="Fuente del dato" v={proceso.fuente ?? '—'} />
              <DRow
                k="Confianza"
                v={
                  <span className="inline-flex items-center gap-2">
                    <i
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: CONF_DOT[proceso.conf ?? ''] ?? 'var(--text-on-dark-faint)' }}
                    />
                    {proceso.conf ?? '—'}
                  </span>
                }
              />
            </dl>
          </div>
        </div>
      )}
    </Drawer>
  );
}

function DRow({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-xs text-[var(--text-on-dark-faint)]">{k}</dt>
      <dd className="min-w-0 text-right text-[var(--text-on-dark)]">{v}</dd>
    </div>
  );
}

// ── compartido ───────────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-on-dark-muted)]">
      {(Object.keys(SEMAFORO) as Digital[]).map((k) => (
        <span key={k} className="inline-flex items-center gap-1.5">
          <i className="h-2 w-2 rounded-full" style={{ background: SEMAFORO[k].dot }} />
          {SEMAFORO[k].label}
        </span>
      ))}
    </div>
  );
}
