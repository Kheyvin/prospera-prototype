# PRENTER Design System — banco de componentes (as-code · CK-27)

SSoT visual = proyecto **Claude Design "PRENTER Design System"** (`is_default`). Este árbol
es el **banco reutilizable** de Cockpit: toda UI nueva se construye contra estos tokens +
átomos, **nunca se duplica un componente** (DRY). Doctrina enforce-able:
`.claude/rules/ui-design-system.md`.

## Atomic design (capas)

| Capa | Dónde | Qué |
|---|---|---|
| **Tokens** | `ui/app/globals.css` (`@theme` + `:root`) | Color (teal único acento, dark-first), tipografía (display/body/mono), spacing (grid 4px), radios, sombras. Ported de `tokens/*.css` de PRENTER. |
| **Átomos** | `ui/components/ds/atoms/` | `Button`, `Badge`, `Card`, `Input`. Token-driven, sin lógica de negocio. |
| **Moléculas** | `ui/components/ds/molecules/` | Composición de átomos (pendiente de poblar). |
| **Organismos** | `ui/components/{negocio,shell}/` | Vistas de dominio — consumen átomos/moléculas. Migración progresiva a `ds/` = follow-up de la story `design-system-atomic-storybook`. |

> **Historias de usuario NO viven acá.** El banco es solo tokens/átomos/moléculas
> reutilizables. Las vistas de feature (tab Indicadores, Personas, …) son organismos que
> los consumen.

## Catálogo vivo ("Storybook")

Ruta embebida **`/design-system`** (`ui/app/design-system/page.tsx`) — se embebe en el
binario `directorio` como el resto de la UI (cero dependencia Storybook.js). Renderiza la
paleta de tokens + cada átomo con sus variantes. Es la referencia visual para construir.

## Reglas

1. **Consumir, no duplicar** — `import { Button } from '@/components/ds/atoms'`. Si falta una
   variante, se extiende el átomo; no se crea un botón nuevo en la vista.
2. **Token-first** — cero hex hardcodeado en componentes; usar `var(--color-brand)`, utilidades
   Tailwind (`text-teal-400`) o los átomos.
3. **Un solo acento** — el teal es el único color de marca (regla PRENTER).
4. **Nuevo átomo/molécula** → se cataloga en `/design-system` en el mismo cambio.
