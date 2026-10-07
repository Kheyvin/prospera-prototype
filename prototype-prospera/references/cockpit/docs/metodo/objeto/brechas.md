# Capítulo · Brechas (gaps — el diagnóstico)

> El marco de la `brecha` — el **O6** del backbone (qué le falta a la empresa para llegar). Es el hallazgo
> accionable para la dirección: dónde el AS-IS queda por debajo de lo deseado. Cierra el Hilo de Oro.

---

## 1 · Qué es una brecha

- **Definición.** La **distancia entre el AS-IS y lo deseado** — un hallazgo que impide o retrasa un objetivo.
  No es un problema vago: es un *gap medido* contra algo verificable (una capability, un proceso, un sistema
  o un objetivo).
- **Marco/Norma.** **ArchiMate Assessment** (capa Motivation, M13). **Gap analysis**. Madurez **COBIT** (M15)
  para `nivel_as_is`/`nivel_to_be`. **ISO 9000 3.6.9** (nonconformity). **OKR** (target variance).
  **WSJF** (M28) para priorizar. **FinOps** (M22) para el costo. Verificabilidad por evidencia (ISO 19011).
- **Fuente.** M13 (Assessment) · M15 (COBIT) · M28 (WSJF) · M22 (FinOps) · ISO 9000/19011.

## 2 · La analogía

Si el objetivo es el **destino** y el KR el **odómetro**, la brecha es la **luz de "check-engine"**: señala
**qué pieza** (capability/proceso/sistema) impide llegar, **cuánto** falta (`delta` = to_be − as_is), **cuánto
cuesta** cerrarla (FinOps) y **qué tan urgente** es (WSJF) — para que la dirección priorice con criterio, no
por corazonada.

## 3 · Tipos (enum `gap_tipo`)

| Tipo | Qué es | Norma |
|---|---|---|
| **nonconformity** | incumple un requisito/norma | ISO 9000 3.6.9 |
| **target_variance** | no alcanza el KR/target | OKR |
| **assessment_finding** | madurez por debajo de lo deseado | COBIT / heatmap |

## 4 · En el schema

`brechas/gap-*.yaml`:
```
id · nombre · sub (el caso en una línea) · tipo (gap_tipo)
against_ref → capability | proceso | sistema | objetivo   (lo deficiente — REQUERIDO, verificable)
nivel_as_is · nivel_to_be (COBIT) · delta (= to_be − as_is)
kr_ref[] → key_result   (qué KR bloquea — arista del Hilo)
severidad (= delta × criticidad-KR) · prio (WSJF) · costo (FinOps) · estado · evidencia
```

## 5 · Cómo se cosen (cierre del Hilo de Oro)

```
objetivo ──drives──▶ capability/proceso ◀──against── BRECHA ──bloquea (kr_ref)──▶ key_result
```
La brecha apunta (`against_ref`) a **lo que falla** y (`kr_ref`) a **qué resultado bloquea**. Así el Cockpit
puede decir: *"la meta X está en riesgo porque la capability/proceso Y tiene esta brecha, de este tamaño, con
este costo y esta prioridad."* Eso es el diagnóstico que vende el consultor.

## 6 · Cómo emergen (para Prenter)

Las brechas **no se inventan**: salen de contrastar el **AS-IS empírico** contra los **objetivos** y el
**assessment** de capabilities. Para Prenter varias ya asomaron en la conversación (a confirmar en la
Pregunta 8): Nicolify **en construcción** (bloquea la automatización comercial) · empresa **sin constituir**
(bloquea contratación formal) · Cockpit **sin shippear** (bloquea el SGC vivo) · **bus factor = 1** (todo
depende de Christian → el caso de los agentes). Cada una se anclará a su `against_ref` y su `kr_ref`.

## 7 · Trampas

1. **Brecha sin `against_ref` = no verificable.** Un gap debe apuntar a algo concreto (capability/proceso/
   sistema/objetivo), o es una queja, no un hallazgo.
2. **El TO-BE es del cliente.** `nivel_to_be` lo fija el dueño (diferido); no lo imponemos.
3. **Severidad sin KR = opinión.** La severidad se deriva del KR que bloquea × su criticidad, no del ánimo.
4. **`from`/`as_is` sin medición → se marca, no se inventa** (provenance, M23).
