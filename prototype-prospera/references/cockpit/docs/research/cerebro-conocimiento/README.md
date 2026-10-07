# cerebro-conocimiento/ — SOTA de memoria agéntica + diseño del cerebro v2

Origen: conversación operador↔CTO 2026-07-23. Pregunta disparadora: "ya existen soluciones que
ayudan a Claude Code a guardar conocimiento (Graphify et al.) — investigar cuáles hay, cuál es la
mejor técnicamente, y aprender de ellas para tener NUESTRA versión de construcción y almacenamiento
de conocimiento, replicable al construir el digital twin de las organizaciones."

Barrido: 3 investigaciones paralelas verificadas contra fuentes primarias (repos/papers/docs,
2026-07-23) — herramientas Claude Code · plataformas de memoria de agentes · familia GraphRAG +
motores embebibles. Hermano de `../organization-as-code/` (visión producto) y `../rediseno-total/`
(02 = Knowledge Database files-first, cuyo veredicto este corpus RATIFICA con evidencia nueva).

| Doc | Qué contiene |
|---|---|
| [`01-sota-memoria-agentica.md`](01-sota-memoria-agentica.md) | El paisaje completo (12+ sistemas), tabla comparativa, el veredicto "cuál es la mejor" y la evidencia 2026 que valida files-first+git+determinista |
| [`02-diseno-cerebro-v2.md`](02-diseno-cerebro-v2.md) | Los 10 patrones robados (rankeados, con qué ya tenemos) + diseño v2 de nuestro cerebro en 3 fases + validación por fase |
| [`03-proyeccion-twin.md`](03-proyeccion-twin.md) | Cómo el mismo stack se replica al twin de cada organización cliente (N6/N12/N13, Gestión de Cambios como invalidación firmada) |

Estado del cerebro propio al momento del barrido: `sistema/metodo/` con GRAFO.md generado +
skills `/metodo`·`/metodo-aprende` + ciclo de vida v3 (`vigente|superseded|descartada`) + gates
(commit `adb4e97`, 2026-07-22).
