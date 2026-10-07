---
title: Prototipos HTML — Especificaciones rescatadas
date: 2026-07-13
source: prenter-harness legacy (copiado desde /home/chalreme/Proyectos/prenter-harness/products/docs/architecture/prototypes/)
---

# Vista Consultor · Especificaciones rescatadas

## Modelo de 3 módulos (M1, M3, M2)

Ciclo de vida del engagement cliente:

| Módulo | Fase | Duración | Qué hace |
|--------|------|----------|----------|
| **M1 Levantamiento** | A · una vez | horas/días | De carpeta ~1GB opaca → AS-IS honesto (procesos+sistemas+personas) + lista de dudas a corroborar |
| **M3 Mejora continua** | B · por outcome | semanas/meses | De gaps diagnosticados → apuesta → exploración → shaping → construcción |
| **M2 Mantenimiento** | continuo | indefinido | Contexto vivo + drift + aprobación/rechazo de cambios |

### M1 Levantamiento — 6 etapas

**m1.b1 Arranque / AS-IS** (DONE)  
6 pasos de p01-p06: desde Encuadre hasta Revisión + marcado "a corroborar".

- p01: Encuadre ("Hola") — kickoff o async (30 min virtual + resumen IA) + RACI capturado
- p02: Conectar fuentes — acceso a Drive ~1GB + repos de código
- p03: Ingesta + triage — máquina clasifica artefactos (% obsoletos/duplicados/útiles = "índice de basura")
- p04: document-project — reverse-engineer del código + contrastar código↔docs (drift)
- p05: AS-IS borrador — ensamble procesos (APQC PCF) + sistemas (SYSTEM-MAP) + personas, cada dato con confianza (🟢 sólido / 🟡 inferido / 🔴 hueco)
- p06: Revisión + marcado — consultor cura, arma lista "a corroborar" = agenda entrevistas

**m1.b2 Entrevistas**  
Corroborar documentado-vs-real con trabajadores → AS-IS validado.

**m1.b3 Diagnóstico**  
Gap analysis + semáforo de madurez + plan priorizado + business case (entregable que se vende).

### M3 Mejora continua — Espinazo (Outcome-driven)

**m3.e0 Apuesta / Outcome** (CURRENT) 🔒 gate humano  
6 pasos de p01-p06: desde prep async hasta sembrar OST.

- p01: Prep async (interno) — destaca gap candidato top (valor×esfuerzo×confianza) + business case
- p02: Presentar candidato — sponsor ve outcome + costo/ahorro (IA trae datos, NO empuja)
- p03: Elegir/ajustar outcome — fuerza anclaje a KR (sin KR = alerta); "qué mover" vs "cómo hacerlo"
- p04: Señal appetite (gruesa) — sponsor elige talla: Chico (~1 sem) / Mediano (~1 sprint) / Grande (~1 mes)
- p05: Sellar apuesta 🔒 → slide-to-commit, verifica autoridad + registra quién/cuándo/KR inmutable (git)
- p06: Sembrar OST — crea workspace outcome, enlaza Hilo de Oro, raíz del árbol O→O→S→T

**m3.e1 Exploración de valor · OST**  
Crecer árbol Outcome→Oportunidad→Solución→Test desde la apuesta.

**m3.e2 Grounding del sistema**  
IA documenta existente; humano valida verdad tácita.

**m3.e3 Shaping · Pitch** 🔒 gate humano  
Appetite fino + no-gos; future-state (VSM); pitch final.

**m3.e4 Contrato · spec ratificado** 🔒 G1 · fin discovery  
Criterios EARS + chequeo contradicciones → ratificación.

**m3.e5 Construcción** 🔒 G3–G8  
Claude Code + gates SDD; QA + aceptación valor; mide aporte.

### M2 Mantenimiento (futuro)

Mantener vivo baseline; aporte medido re-prioriza backlog (loop de valor).

---

## Carriles del Service Blueprint (M1.b1 detallado)

| Carril | Función | Ejemplo de tareas |
|--------|---------|-------------------|
| **Touchpoint** | Evidencia visible al cliente | Onboarding, Vista Triage, Vista AS-IS |
| **Acción cliente** | Lo que hace el sponsor/cliente | Confirmar kickoff, otorgar accesos |
| **Acción consultor** | Lo que hace el consultor | Crear engagement, lanzar ingesta, marcar dudas |
| **Frontstage (UI)** | Lo que el sistema muestra | Apuntar fuentes, mostrar índice, mostrar AS-IS a color |
| **Backstage (Análisis)** | Procesamiento interno IA | Estructurar contexto, recorrer+clasificar, ensamblar AS-IS |
| **Soporte** | Metodologías y marcos aplicados | ISO 9001 cl.4, M21, M23, M12, APQC PCF |

---

## Metodologías mapeadas (M-cards, línea de negocio)

Métodos transversales en Cockpit (del legacy, aplicables):

| Card | Nombre | Aplicación en modelo |
|------|--------|----------------------|
| **M02** | OST (Outcome Mapping / Torres) | Raíz outcome = árbol O→O→S→T (e0.p06) |
| **M04** | Shape Up | Appetite talla S/M/L (e0.p04); betting (e0.p05) |
| **M06** | Impact Mapping | Outcome→KR→meta (e0.p03) |
| **M12** | APQC PCF | Taxonomía procesos en AS-IS (b1.p05) |
| **M13** | ArchiMate | Procesos digitales = qué corre sobre qué sistema (b1.p04) |
| **M14** | document-project | Reverse-engineer repos (b1.p04) |
| **M21** | OKR | Outcome = KR (b1.encuadre, e0.p03) |
| **M22** | FinOps Quantify Value | Business case costo/ahorro (e0.p01, e0.p02, e0.p05) |
| **M23** | Grounding / Provenance | Confianza/frescura por dato en AS-IS (b1.p05, b1.p06) |
| **M24** | This Is Service Design Doing | Estructura blueprint Service (carriles) |

---

## Gates (decisiones irreversibles)

| Gate | Fase | Dueño | Criterio |
|------|------|-------|----------|
| **🔒 Sellar la apuesta** | m3.e0.p05 | Accountable KR | RACI autoridad verificada + anclaje KR |
| **🔒 Shaping · Pitch** | m3.e3 | PM/Sponsor | Appetite fino + no-gos + future-state |
| **🔒 Contrato ratificado** | m3.e4 | Architect | EARS + contradicciones resueltas (fin discovery) |
| **🔒 G1–G8 Construcción** | m3.e5 | Builder/QA | Gates SDD (sds gates + live-verify) |

---

## Datos clave del ejemplo (Inmobiliaria Vértice)

- **Sponsor:** Mateo Salas (Dueño)
- **Consultor:** Pedro
- **Meta del trimestre:** Días de cobro 45 → 30
- **Progreso:** 28% (3 de 14 pasos hechos)
- **Fase actual:** A · Levantamiento
- **Estado m1.b1:** DONE
- **Estado m3.e0:** CURRENT (aquí estás 🟡)

---

## Fricciones rescatadas (patrones a evitar)

| Fricción | Contexto | Cómo evitarla |
|----------|----------|----------------|
| Ahogarse en ~1GB | p03 ingesta | Triage rankea señal/ruido; consultor solo mira top |
| Falsa completitud AS-IS | p05-p06 | Código de color = CONFIANZA (no madurez); dejar 🟡/🔴 visibles |
| Deseo vago → sin métrica | e0.p03 outcome | Forzar anclaje a KR; sin KR = alerta del sistema |
| Rubber-stamp de apuesta | e0.p05 | slide-to-commit (gesto peso), no "ok" | |
| Saltar a solución | e0.p03 | "Qué mover" antes "cómo hacerlo"; outcome ≠ scope |
| Confundir appetite con estimado | e0.p04 | Appetite = señal gruesa (S/M/L); estimado fino viene en Etapa 3 |

---

## Plantillas rescatadas

**correo_invitacion** (encuadre kickoff):
```
Asunto: Arranquemos — diagnóstico digital de {{empresa}}

Hola {{sponsor}}:
Para arrancar necesito 30 min contigo. Veremos tres cosas:
• qué metas quieres mover este trimestre,
• quién decide qué en tu equipo,
• y un primer vistazo a cómo trabajan hoy.

Si lo tienes a mano, sube tu organigrama (aunque sea informal) antes de la reunión; 
si no, lo armamos juntos.
¿Te va {{fecha_propuesta}}? — {{consultor}}
```

**guion_kickoff** (facilitación conversacional):
```
Tono: cercano, sin jerga, curioso. 5-7 preguntas abiertas, una a la vez. Escuchar más que hablar.

• Apertura: "Cuéntame qué hace {{empresa}} y qué te quita el sueño este trimestre."
• Metas: "Si en 3 meses una sola cosa mejorara, ¿cuál sería? ¿cómo la medirías hoy?"
• Autoridad: "¿Quién decide sobre [área]? ¿a quién más debo incluir?"
• Proceso: "Llévame por un día normal de [área clave]."
• Cierre: "¿Qué NO debería tocar / con qué hay que tener cuidado?"

Evitar: prometer soluciones · términos técnicos (KR/OST/gap) · que se sienta interrogatorio.
```

---

## Concepto Hilo de Oro (§2, referencia)

El "outcome (meta que se mueve)" anclado visualmente a: 
- Objetivo estratégico del cliente (OKR)
- Business case (costo~A vs ahorro~B)
- Árbol OST que lo descompone en oportunidades

Se "siembra" en e0.p06 como raíz del árbol Outcome→Oportunidad→Solución→Test.

---

## Notas de implementación para Cockpit

1. **Contexto de autoridad (RACI):** Capturado en encuadre (p01), usado en e0.p05 para verificar que el accountable del KR sea quien sella.

2. **Confianza por dato (M23):** Cada artefacto lleva `{fuente, fecha, confianza_level}`. Persistido en versiones de AS-IS.

3. **Markdown → HTML renderizado:** Ambos prototipos son auto-renderizadores JS con JSON embebido (SPA); Cockpit puede rehidratarlos del backend.

4. **Roles visuales:** Emojis 🧑 (humano) · 🤖 (sistema) · 👥 (reunión) · ◇ (decisión) · ⏳ (espera) para marcar actor de cada paso.

5. **Loop de valor:** M2 mantiene "baseline vivo"; aporte medido (m3.e5) realimenta prioridad en backlog (outcome siguiente).

---

## Fuente

- **vista-consultor.html:** Prototipo interactivo de vista del Consultor; generado por `tooling/scripts/gen_prototypes.py` desde `service/process/` del legacy.
- **service-blueprint.html:** Detalle operativo de cada etapa en carriles (tipo Satoru Nakamura "This Is Service Design Doing").
- Ambos: diseño de vía David Mott (legacy Prenter) · metodología Chris Revilla (operador Cockpit).
