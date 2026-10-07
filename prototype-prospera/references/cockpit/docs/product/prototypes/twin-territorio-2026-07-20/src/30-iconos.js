const S={ok:'var(--ok)',warn:'var(--warn)',crit:'var(--crit)',faint:'#5c6b68'};
const health={verde:'var(--ok)',ambar:'var(--warn)',rojo:'var(--crit)'};
/* badge de ícono por tipo (M13 ArchiMate, ancla SOLO-TIPOS — objeto.schema.yaml campo `archimate:`).
   Pictograma DIBUJADO, no forma abstracta ni letra — se lee sin leyenda. SVG inline, cero dep nueva. */
const TICO={
  proceso:'<svg viewBox="0 0 14 14"><path d="M3.5 2 L10 7 L3.5 12" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  sistema:'<svg viewBox="0 0 14 14"><rect x="4" y="1.5" width="8.5" height="11" fill="none" stroke-width="1.3"/><rect class="fl" x="1" y="3.8" width="3.3" height="2.2"/><rect class="fl" x="1" y="8" width="3.3" height="2.2"/></svg>',
  rol:'<svg viewBox="0 0 14 14"><circle cx="7" cy="4.3" r="2.5" fill="none" stroke-width="1.5"/><path d="M2 12.6c0-3.1 2.2-5 5-5s5 1.9 5 5" fill="none" stroke-width="1.5" stroke-linecap="round"/></svg>',
  area:'<svg viewBox="0 0 14 14"><rect x="5" y="1" width="4" height="3" fill="none" stroke-width="1.2"/><rect x="1" y="10" width="4" height="3" fill="none" stroke-width="1.2"/><rect x="9" y="10" width="4" height="3" fill="none" stroke-width="1.2"/><path d="M7 4v3M7 7H3v3M7 7h4v3" fill="none" stroke-width="1.1"/></svg>',
  objetivo:'<svg viewBox="0 0 14 14"><path d="M3 1v12" stroke-width="1.4" stroke-linecap="round"/><path class="fl" d="M3 1.4c2-1 3.6 1 5.6 0v5c-2 1-3.6-1-5.6 0z"/></svg>',
  kpi:'<svg viewBox="0 0 14 14"><rect class="fl" x="1.3" y="8" width="2.6" height="4.6"/><rect class="fl" x="5.7" y="5" width="2.6" height="7.6"/><rect class="fl" x="10.1" y="2" width="2.6" height="10.6"/></svg>',
  brecha:'<svg viewBox="0 0 14 14"><path d="M7 1.5 L13 12.5 L1 12.5 Z" fill="none" stroke-width="1.4" stroke-linejoin="round"/><line x1="7" y1="5.2" x2="7" y2="8.6" stroke-width="1.4" stroke-linecap="round"/><circle class="fl" cx="7" cy="10.6" r="0.9"/></svg>',
  idea:'<svg viewBox="0 0 14 14"><path d="M7 1.5a4 4 0 0 0-2 7.5c.5.4.8 1 .8 1.6h2.4c0-.6.3-1.2.8-1.6A4 4 0 0 0 7 1.5z" fill="none" stroke-width="1.3"/><line x1="5.2" y1="12.3" x2="8.8" y2="12.3" stroke-width="1.2" stroke-linecap="round"/></svg>',
  proyecto:'<svg viewBox="0 0 14 14"><path d="M11.5 4.5A5 5 0 1 0 12.5 8" fill="none" stroke-width="1.4" stroke-linecap="round"/><path d="M11.5 1.5v3.3h-3.3" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  empresa:'<svg viewBox="0 0 14 14"><path d="M2 12.6V5l5-3 5 3v7.6" fill="none" stroke-width="1.3" stroke-linejoin="round"/><rect class="fl" x="4.1" y="6" width="1.6" height="1.6"/><rect class="fl" x="8.3" y="6" width="1.6" height="1.6"/><path d="M5.6 12.6V9.4h2.8v3.2" fill="none" stroke-width="1.2"/></svg>',
  persona:'<svg viewBox="0 0 14 14"><circle class="fl" cx="7" cy="4.2" r="2.6"/><path class="fl" d="M2 12.8c0-2.9 2.2-5.1 5-5.1s5 2.2 5 5.1z"/></svg>',
  capability:'<svg viewBox="0 0 14 14"><path d="M7 1.2 12.1 4.1v5.8L7 12.8 1.9 9.9V4.1z" fill="none" stroke-width="1.3" stroke-linejoin="round"/><circle class="fl" cx="7" cy="7" r="1.9"/></svg>',
  puesto:'<svg viewBox="0 0 14 14"><rect x="1.6" y="1.6" width="10.8" height="10.8" rx="2" fill="none" stroke-width="1.2"/><circle cx="7" cy="5.3" r="1.8" fill="none" stroke-width="1.2"/><path d="M4.1 10.7c0-1.7 1.3-2.9 2.9-2.9s2.9 1.2 2.9 2.9" fill="none" stroke-width="1.2" stroke-linecap="round"/></svg>',
  arnes:'<svg viewBox="0 0 14 14"><path d="M7 1.3 12 3.1v4c0 3-2.1 5-5 5.6-2.9-.6-5-2.6-5-5.6v-4z" fill="none" stroke-width="1.3" stroke-linejoin="round"/><path d="M4.7 7 6.3 8.6 9.3 5.4" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  respaldo:'<svg viewBox="0 0 14 14"><path d="M7 3.2C5.8 2.2 4 2 2.2 2v9.3c1.8 0 3.6.2 4.8 1.2 1.2-1 3-1.2 4.8-1.2V2C10 2 8.2 2.2 7 3.2z" fill="none" stroke-width="1.2" stroke-linejoin="round"/><path d="M7 3.2v9.3" fill="none" stroke-width="1.1"/></svg>',
};
/* v18 · tipos del gobierno del directorio. Un pictograma nuevo (el dinero) y el resto REUSA el
   ícono del tipo con el que comparte semántica — mismo criterio M13: la forma dice el tipo, el
   color jamás (un acento, PRENTER). Cierra la regla "ícono en el header de TODA ficha" (decisión 24). */
TICO.dinero='<svg viewBox="0 0 14 14"><rect x="1" y="3.2" width="12" height="7.6" rx="1.4" fill="none" stroke-width="1.3"/><circle class="fl" cx="7" cy="7" r="1.9"/><path d="M3.1 7h.8M10.1 7h.8" stroke-width="1.2" stroke-linecap="round"/></svg>';
TICO.cifra=TICO.dinero; TICO.caja=TICO.dinero; TICO.presupuesto=TICO.dinero;
TICO.riesgo=TICO.brecha; TICO.inversion=TICO.proyecto; TICO.acuerdo=TICO.respaldo; TICO.alcance=TICO.respaldo;
/* v20 · la ficha de capacidad pasó a llamarse por su nombre común ("Capacidad", GLOSARIO) — el tipo se
   deriva del primer término del encabezado, así que el alias es lo que mantiene ícono y respaldo en su
   lugar. `cobertura` = el hueco declarado del mapa de capacidades: mismo tipo, otra pregunta. */
TICO.capacidad=TICO.capability; TICO.cobertura=TICO.capability;
const tbadge=(tipo,title)=>`<span class="tbadge" title="${title}">${TICO[tipo]}</span>`;
const iico=(tipo,title)=>`<span class="eg-ico" title="${title}">${TICO[tipo]}</span>`;
const confCol=c=>({alta:S.ok,media:S.warn,baja:S.crit}[c]||'var(--tx-faint)');

