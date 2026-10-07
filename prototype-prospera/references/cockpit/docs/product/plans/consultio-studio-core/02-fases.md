# Fases — F0 → F3

> Regla general: **F0 no espera a nada.** La extracción (F2) recién arranca cuando el shell
> de Consultio sea necesidad real, no antes. Evitamos el error clásico: parar la entrega de
> valor para "preparar plataforma".

## F0 · Consultio v0 = arneses sin shell (YA ratificada — CK-21/D7) — ARRANCA HOY

**Qué:** los arneses del método M1-M3 corriendo sobre Claude Code pelado (N8), producidos
bajo doctrina Arnesia (N15): levantamiento por entrevista con agente + doc→modelo con
provenance + preview local de Cockpit.

- Cero código de app. Cero dependencia de dev-studio.
- Formato: mismo estándar `prenter-marketplace` / forma-plugin que dev-studio ya sabe
  consumir → **todo arnés que produzcas en F0 es asset directo para F3** (la app futura
  los instala tal cual — el motor de instalación ya existe y está probado).
- SSoT del método: `sistema/metodo/` (cockpit). Historia madre: `sistema/poblar-metodo-m1-m3`.

**Criterio de salida:** primer engagement (o simulacro con fixture golden CK-23) operado
end-to-end con arneses: entrevista → objeto normalizado con provenance → preview → publicación
a repo N6 de prueba.

**Señal que F0 debe responder (input clave para F2):** ¿"engagement = repo git" se sostiene?
- SÍ → la capa git/worktree de dev-studio entra al core casi entera (reuso ~80%).
- NO → la capa git queda per-producto y el core es más chico (reuso ~60%).

## F1 · Frontera marcada en dev-studio (pasiva, ~1 sesión, en paralelo a F0)

**Qué:** hacer visible y enforce-able la línea core-vs-dev DENTRO de dev-studio, sin mover nada.

1. Fitness test nuevo en `arch/fitness/`: paquetes candidatos-a-core (motor arneses, driver,
   sesión, store, transporte, updater) **no importan** paquetes dev-specific (repo taxonomy,
   worktree, changes-panel). Hoy ya casi se cumple (hexagonal); el test lo congela.
2. Marcar en `arch/INDEX.md` (o equivalente) la columna "destino: core | producto".
3. Nada de renombrar/mover todavía.

**Beneficio:** todo lo que se construya en dev-studio de aquí a F2 nace del lado correcto
de la línea. La extracción se vuelve mecánica.

**Criterio de salida:** fitness test verde en CI de dev-studio.

## F2 · Extracción `studio-core` (cuando el shell sea necesidad real)

**Trigger de entrada (cualquiera):** F0 entregó y el consultor pide UI (gestión de sesiones,
preview integrado, instalación 1-click) · o llega el momento de transferir al Analista de
Calidad del cliente (N19) que no va a operar CLI pelado.

**Pasos:**
1. Crear repo `studio-core` (célula propia, ledger SC-NN). Módulo Go + paquete npm del
   design system.
2. Mover (git history preservada — `git filter-repo` o subtree split) los paquetes marcados
   en F1: `domain/arnes`, `ports/{arnes,agent}`, `usecase/{arnes_service,session_service}`,
   `adapters/{arneses,registry,agent/claudecode,store,transport}`, updater, `web/src/shared/*`.
3. dev-studio → primer consumidor: `go.mod` importa core tageado; suite completa (52 tests +
   fitness) verde ANTES y DESPUÉS = definición de extracción correcta.
4. Puntos de variación formalizados (seam del producto): taxonomía unidad-de-trabajo,
   value-stream, tokens branding, URL(s) de marketplace.
5. `go.work` local configurado en ambas máquinas de trabajo (ver `01-disciplina.md` R5).

**Criterio de salida:** dev-studio compila/corre/pasa suite importando core versionado;
cero código duplicado entre repo core y repo producto.

**Estimación honesta:** 2-4 sesiones. La hexagonal + DIP ya pagó el 80% del costo.

## F3 · Consultio app fina

**Qué:** repo `consultio` (célula propia, ledger propio) = core + variación consultoría:
- Taxonomía: engagement / paquete de trabajo / entregable (reemplaza `historia·bug·hotfix`).
- Value-stream del método (M1 levantamiento → M2 mantenimiento → M3 espinazo) en su seam.
- Marketplace por defecto: arneses del método (los de F0, sin tocar).
- Preview local de Cockpit (N13 renderer) — pieza nueva, propia de Consultio.
- Publicación a N6 (dev→UAT→prod, Gestión de Cambios — CK-21/D5).
- Branding propio sobre los tokens del design system.

**Criterio de salida:** consultor opera un engagement completo desde la app; el Analista de
Calidad del cliente puede heredarla (transferencia N9→N19).

**Estimación:** el grueso del shell viene del core; el trabajo propio es taxonomía + preview
+ flujo de publicación.

## Registro

- Ratificación de este plan → ficha CK-NN (borrador en `04-ficha-ck-draft.md`).
- Re-fichar N14 en NODOS.md: "clon de DevStudio" → "app sobre studio-core (extraído de
  DevStudio en F2)". También riesgo abierto 2 de N5 ("cómo se clona Consultio") queda
  respondido por este plan.
- El repo dev-studio registra F1/F2 en su ledger (DH-NN); el core estrena SC-NN.
