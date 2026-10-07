# UI Design System — PRENTER + atomic design + banco reutilizable (project-layer)

> **project-layer · SÍ se edita** (a diferencia del CORE del arnés · ver `_HARNESS-CORE.md`).
> **Origen:** CK-27 (2026-07-20) — el operador fija PRENTER como el design system de Cockpit
> y la doctrina "toda UI se construye contra un banco de componentes atómico, DRY". Cierra el
> hueco `design_system_ref.status: pending` que `[[cockpit-stack]]` declaraba (BL-04).
> **Materializa** la story `sistema/design-system-atomic-storybook`.

## Regla cardinal

Toda UI de Cockpit (y de las apps edge que hereden este árbol) se construye **contra el
banco de componentes PRENTER**, con disciplina **atomic design** y **DRY**: se **consume**
un token/átomo, **jamás se duplica** ni se hardcodea un valor visual. Un componente nuevo
no nace en la vista de feature — nace (o se extiende) en el banco y **se cataloga**.

## SSoT visual = PRENTER (Claude Design)

El design system canónico es el proyecto **"PRENTER Design System"** de Claude Design
(`is_default`, id `a98c2e0d-db82-43f2-8fd7-e7e05c40fd51`). Dark-first · **teal único acento**
(`#00b7aa`) · tipografía display apretada (Coco Gothic→Jost) + cuerpo (Sansation→Mulish) +
**mono técnica** (JetBrains Mono) · bordes hairline · eyebrows mono · trama corporativa sutil.
Guía completa: `SKILL.md`/`readme.md` del proyecto. Se accede vía las tools MCP de Claude Design.

## Las capas (atomic design) y dónde viven

| Capa | Path | Autoría |
|---|---|---|
| **Tokens** | `ui/app/globals.css` (`@theme` + `:root`) | ported de `tokens/*.css` de PRENTER |
| **Átomos** | `ui/components/ds/atoms/` (`Button`·`Badge`·`Card`·`Input`) | port fiel de `components/` de PRENTER |
| **Moléculas** | `ui/components/ds/molecules/` | composición de átomos |
| **Organismos** | `ui/components/{negocio,shell,...}/` | vistas de dominio — **consumen** el banco |
| **Catálogo vivo** | `ui/app/design-system/` → ruta `/design-system` | "Storybook" embebido en el binario |

- **Historias de usuario NO son parte del banco.** El banco = tokens/átomos/moléculas
  reutilizables. Las tabs/páginas de feature (Indicadores, Personas, …) son organismos que lo
  consumen — no engordan el catálogo.
- **"Storybook" = ruta embebida, no Storybook.js** (decisión CK-27, forkeada del operador):
  `/design-system` se embebe en el binario `directorio` como el resto de la UI (cero dependencia
  nueva). Cumple la función de catálogo vivo de tokens/átomos. El campo del seam es
  `design_system_ref.showcase_route`.

## Disciplina (DRY)

1. **Consumir, no duplicar** — `import { Button } from '@/components/ds/atoms'`. ¿Falta una
   variante? Se **extiende el átomo** (nueva `variant`/`tone`), no se crea un botón en la vista.
2. **Token-first** — cero hex hardcodeado en un componente. Usar `var(--color-brand)`, utilidades
   Tailwind derivadas del `@theme` (`text-teal-400`, `rounded-pill`) o los átomos del banco.
3. **Un solo acento** — el teal es el único color de marca (regla PRENTER). Nada de segundo
   acento saturado, gradientes multicolor, ni Inter/Roboto/Arial.
4. **Cataloga en el mismo cambio** — átomo/molécula nuevo o variante nueva → aparece en
   `/design-system` en el mismo commit (si no se cataloga, no existe para el resto).
5. **Verificación REAL** (`[[test-design-doctrine]]`) — un átomo se da por bueno cuando se
   **renderiza en `/design-system`** y se observa (no "compila"). Para átomos con lógica de
   estado (formularios, etc.) → test de componente cuando exista el harness DOM (follow-up BL-04).

## Enforcement (gates idea → done)

| Fase | Owner | Qué exige |
|---|---|---|
| refining (ui-story) | `/po-ux`·`/po` | el `§ Mockup` / mapa de pantalla se piensa con átomos PRENTER existentes; scan de banco antes de proponer un componente nuevo (`[[anti-duplication-refining]]`) |
| ready | `/architect` | tickets citan qué átomos/moléculas se consumen; un átomo nuevo es su propio ticket con "cataloga en /design-system" |
| developing | `builder-*` | Step 0 grep incluye `ui/components/ds/` — match → consumir/extender, nunca recrear (`[[anti-duplication]]`) |
| reviewing | `/auditor` | categoría anti-duplicación: cero hex hardcodeado, cero átomo duplicado, catálogo actualizado |

## Anti-patterns

- ❌ Botón/badge/card nuevo dentro de una vista de feature en vez de consumir/extender el banco.
- ❌ Hex hardcodeado (`#00b7aa`, `#7c3aed`, …) en un componente — usar tokens.
- ❌ Segundo acento saturado o tipografía fuera del set PRENTER.
- ❌ Redefinir un token en un CSS/archivo distinto de `ui/app/globals.css` (drift de fundación).
- ❌ Meter una historia de usuario / vista de dominio en `ui/components/ds/` (es solo el banco).
- ❌ Agregar Storybook.js u otra dep de catálogo (la decisión CK-27 es la ruta embebida).

## Referencias

- `ui/components/ds/README.md` — el banco (capas + reglas operativas).
- `ui/app/design-system/page.tsx` — catálogo vivo.
- Claude Design · proyecto "PRENTER Design System" (`SKILL.md`/`readme.md`/`tokens/`/`components/`).
- `project.config.yaml` § `design_system_ref` — el seam.
- `[[cockpit-stack]]` (declaraba el hueco) · `[[arquitectura-as-code]]` · `[[anti-duplication]]` ·
  `[[anti-duplication-refining]]` · `[[test-design-doctrine]]`.
- `LEDGER.md` CK-27 · story `docs/product/stories/sistema/design-system-atomic-storybook/`.
