# process/ — el proceso de engagement como dato (SSoT)

Definición estructurada del proceso (módulos → etapas → pasos), **front-matter MD por paso**.
Es la **plantilla** (nuestra IP); el estado por cliente (la **instancia**) vive en el repo del cliente.
De aquí se renderizan las dos vistas del cockpit (consultor / cliente) y la proyección SQLite.

- **Modelo + esquema:** [`PROCESS-AS-DATA.md`](PROCESS-AS-DATA.md).
- **Narrativa de diseño (el *por qué*):** [`M1-LEVANTAMIENTO.md`](M1-LEVANTAMIENTO.md) ·
  [`M3-ESPINAZO.md`](M3-ESPINAZO.md) · [`SERVICE-DESIGN.md`](SERVICE-DESIGN.md).
- **No confundir con `core-harness/process/`** = el ciclo SDD de 10 estados (lifecycle de una *historia*, G1–G8). Esto es la capa **por encima** (el engagement). Conectan en los gates.

```
process/<modulo>/_modulo.md · <modulo>/<etapa>/_etapa.md · <modulo>/<etapa>/<paso>.md
```

Poblado: `m1/b1/` (levantamiento Beat 1, 6 pasos) + `m3/e0/` (Apuesta, worked example).
Pendiente: M1 Beats 2-3, M3 Etapas 1-5 (BL-05 del backlog).
