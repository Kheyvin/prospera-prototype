# lakehouse — Data Lakehouse + conectores de ingesta

## Nodo(s)

- `N16` — Data Lakehouse. Plano **Organización**, servicio/dato, *no-construido*.
  Lakehouse ligero (dlt + DuckLake) en la infra del cliente que consolida la operación
  de todos los sistemas y nutre a Cockpit (N13) con el cruce estructura × operación —
  "cómo vamos día a día".
- `N18` — Sistemas operacionales de la organización. Plano **Organización**, sistemas
  fuente, *existe* (son del cliente; lo no-construido es su integración con el lake).
  SaaS, ERP, sistema a medida y Excels que alimentan la ingesta.

## Historias

| story-id | type | state | prioridad | node | provenance |
|---|---|---|---|---|---|
| construir-lakehouse-dlt-ducklake | service-story | idea | media | N16 | BL-22 |
| conectores-ingesta-por-sistema | service-story | idea | tbd | N18 | BL-18 |

## Capabilities

Sin capabilities construidas aún.

## Referencia

Fichas de arquitectura de los nodos en
[`sistema/arquitectura/NODOS.md`](NODOS.md) · secciones
**N16** y **N18**.
