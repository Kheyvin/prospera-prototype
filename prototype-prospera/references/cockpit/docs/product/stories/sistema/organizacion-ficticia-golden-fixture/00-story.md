# 00-story.md — organización ficticia golden fixture: el twin lleno

---
story_id: organizacion-ficticia-golden-fixture
type: service-story
module: sistema
capability: sistema/organizacion-ficticia-golden-fixture
links:
  story_yaml: ./story.yaml
  ledger: ../../../../../LEDGER.md
---

## Job-To-Be-Done

**Como** constructor del MVP
**Quiero** una organización ficticia COMPLETA (golden fixture) que ejerza el 100% del `objeto.schema` v2, servida por `/api/objeto` sin warnings
**Para** desarrollar y demostrar el twin pintado en Cockpit sin esperar al proceso de captura (Consultio) ni al lakehouse

## Por qué importa

Twin-first (CK-23): partir de atrás hacia adelante. Fijar primero el artefacto final — el twin con
todo lleno — des-riesga el schema y las vistas, desbloquea la fase F1.1-twin-pintado sin lakehouse
(los valores "reales" de KPI vienen hardcodeados del fixture) y produce el **contrato de salida de
Consultio**: el arnés del método debe poder producir un objeto de esta completitud. Ninguna
instancia existente ejerce el schema completo: prenter (dogfood) es real pero parcial (42 yamls).

## Qué es (alcance idea)

- **Shell hermano nuevo** (nombre a definir en refinamiento, p.ej. `demo-acme/`) con
  `empresa/<tipo>/` llena al 100% contra el schema v2 (layout plano D-15, I-39).
- **Cobertura total**: todas las entidades (las 9 de v1 + OKR/KPI/Proyecto de v2), todos los campos,
  todas las aristas del hilo de oro recorribles (objetivo→OKR/KR→KPI→proceso/rol/persona);
  organigrama con áreas anidadas; procesos con RACI + actividades; capabilities con assessment;
  brechas con costo/ROI; proyectos con ciclo de vida.
- **Valores de KPI hardcodeados** (estado "real" simulado) — lo que el lakehouse reemplazará en
  F1.4-twin-mide-real.
- **Provenance realista** (`fuente`+`conf` por dato) como si la hubiera producido la corrida M1 de
  Consultio — el fixture simula la salida del método, no un dump sintético.
- **Registrada en el registry del cockpit**: `/api/objeto?empresa=<id>` responde las entidades
  juntas, cero warnings de invariantes.

## Triple uso

1. **Fixture de desarrollo** — `cruce-estructura-operacion-indicadores` y
   `brecha-proyecto-ciclo-vida` se construyen CONTRA estos datos.
2. **Documentación-por-ejemplo** — las plantillas del schema v2 explicadas con una instancia
   completa (complementa `ejemplo-vertice.yaml`, que muestra UN vértice).
3. **Demo comercial** — el twin pintado con una organización creíble, sin datos de cliente.

## Antecedentes / Contexto

- Ficha: **CK-23** (2026-07-17) — twin-first: el twin lleno antes que el proceso de llenado.
- Depende de `sistema/schema-v2-hilo-de-oro-kinetica` (la forma que este fixture llena).
- Consumidores: `cockpit/cruce-estructura-operacion-indicadores` (dep directa),
  `cockpit/brecha-proyecto-ciclo-vida` (transitiva), `consultio/operar-metodo-construir-mapa-completo`
  (contrato de aceptación).
- Instancias viven en shells hermanos (I-39, D-15); validación al leer (CK-13, CAP-08).

## Prior art scan

Grep cross-tree en `docs/product/stories/` (fixture · ficticia · demo · golden · seed · ejemplo):
sin historia que cubra este alcance. Revisadas: shell `prenter/empresa/` (dogfood real, 42 yamls,
parcial — NO se reemplaza ni se completa a mano: es real y se llenará con el método; el fixture es
completo-por-diseño y ficticio), `sistema/schema/ejemplo-vertice.yaml` (un vértice de ejemplo, no
una organización), `sistema/reconciliar-objeto-schema-9-entidades` (done — validó contra prenter,
no creó instancia completa), `cockpit/cruce-estructura-operacion-indicadores` +
`cockpit/brecha-proyecto-ciclo-vida` (consumidores de estos datos, no productores).

## Directiva del operador (refinamiento schema-v2, 2026-07-17)

La organización ficticia debe recrear una **corporación de al menos ~200 empleados** (prenter es
demasiado chica como referencia — puede usarse como semilla, o partir de cero). Se construye
**empezando por UN área completa** (todas las entidades/aristas del v2 al 100% en esa área) y
crece de ahí. El seed del vocabulario de verbos (`sistema/schema/verbos.yaml`, historia
schema-v2) se diseña contra esta corporación.

## Próximo paso

`→ /po lee este archivo + carga skill correspondiente → produce 01-spec.md + actualiza product/stories/sistema/organizacion-ficticia-golden-fixture/story.yaml`

> Procedencia: ficha **CK-23** (2026-07-17) — twin-first, re-secuencia F1.
