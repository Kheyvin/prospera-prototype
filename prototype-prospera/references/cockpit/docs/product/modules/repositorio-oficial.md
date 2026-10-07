# repositorio-oficial — Repositorio Oficial confidencial + Depósito de fuentes

## Nodo(s)

- `N6` — Repositorio Oficial (confidencial, infra del cliente). Plano **Organización**,
  artefacto/dato, *no-construido*. Git self-hosted (Forgejo) en la red del cliente:
  única fuente de verdad de arneses, metadata organizada (objeto normalizado),
  documentos oficiales versionados y knowledge. git/archivos = SSoT; cualquier BD =
  índice derivado reconstruible.
- `N12` — Depósito de fuentes (landing zone). Plano **Organización**, artefacto/dato,
  *no-construido*. Zona donde aterriza el crudo del levantamiento (cifrado, auditado)
  y se destruye post-mapa para materializar la cláusula de no-retención del DPA.
  Separado a propósito de la verdad curada de N6.

## Historias

| story-id | type | state | prioridad | node | provenance |
|---|---|---|---|---|---|
| forgejo-self-hosted-bd-vs-archivos | service-story | idea | media | N6 | BL-21 |
| deposito-fuentes-retencion-dpa | service-story | idea | media | N12 | BL-29 |
| knowledge-database-files-first | service-story | idea | tbd | N6 | BL-27 |

## Capabilities

Sin capabilities construidas aún.

## Referencia

Fichas de arquitectura de los nodos en
[`sistema/arquitectura/NODOS.md`](NODOS.md) · secciones
**N6** y **N12**.
