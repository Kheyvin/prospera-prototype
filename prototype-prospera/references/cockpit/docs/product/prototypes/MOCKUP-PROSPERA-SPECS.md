---
title: Mockup Cockpit Prospera — Especificaciones
date: 2026-07-13
source: prenter legacy — client deal (fase1-dashboard-directorio)
status: Fase 1 — Diagnóstico Digital (ejemplo real, datos ilustrativos)
---

# Mockup Cockpit Prospera · Especificaciones

## Propósito

Artefacto de venta (deck Clausen S11 "El entregable"). Muestra cómo se ve el **Diagnóstico Digital (Fase 1)** sobre una desarrolladora residencial boutique peruana real.

v2 (2026-06-24): datos fielmente capturados de Prospera Grupo Inmobiliario + benchmarks reales del sector (ASEI / Tinsa / Sperant / CAPECO / ULI / PwC).

---

## Cliente · Contexto

**Empresa:** Prospera Grupo Inmobiliario (desarrolladora residencial, Lima, Perú)

**Stakeholder:** Francisco Clausen (Champion)

**Vista:** Directorio (ejecutivos)

**Proyectos en portafolio:**
- Vista Razuri (San Miguel) — En venta
- Casa Herrera 288 (Pueblo Libre) — En venta
- Catalina Park 671 (La Victoria) — En planos
- Santa Martha Park (Lima) — Próximo
- Valladares Residencial (San Miguel) — Entregado
- Franco Residencial (Surquillo) — Entregado

---

## Los 4 Drivers del IRR

Objetivos directorio (qué mueve la rentabilidad del proyecto):

| ID | Objetivo | KR (Métrica) | Baseline | Target | Unidad |
|----|----------|--------------|----------|--------|--------|
| **absorcion** | Acelerar la venta | Absorción mensual | 1.7 | 3.0 | % / mes |
| **margen** | Proteger margen | Desvío presupuesto obra | ~10 | <5 | % |
| **cronograma** | Entregar a tiempo | Adherencia cronograma | ~85 | 95 | % |
| **caja** | Convertir venta en caja | Separación → firma | 29 | 20 | días |

---

## 6 Áreas + 26 Procesos (SYSTEM-MAP)

Mapeo completo empresa viva — cada proceso, su sistema, digitalización, qué objetivo(s) sostiene:

### 1. Desarrollo & Tierra
Lider: Gerencia General / socios

| Proceso | Sistema | Digital | Objetivos | Ciclo | Puesto | Confianza |
|---------|---------|---------|-----------|-------|--------|-----------|
| Originación y compra terreno | Red + Excel | manual | margen | Originación | Ger. Gral. | media |
| Factibilidad y pro-forma | Excel | manual | margen, caja | Factibilidad | Ger. Gral. | baja |
| Estructuración financiera (fideicomiso) | Banco + fiduciaria | externo | caja, margen | Cierre financiero | Ger./banco | baja |

### 2. Comercial & Ventas
Lider: Jefatura Comercial

| Proceso | Sistema | Digital | Objetivos | Ciclo | Puesto | Confianza |
|---------|---------|---------|-----------|-------|--------|-----------|
| Captación de leads | WhatsApp + form web | manual | absorcion | Comercialización | Ejec. venta | alta |
| Separaciones y reservas | Excel + WhatsApp | manual | absorcion, caja | Comercialización | Asist. comercial | media |
| Cotización y pricing | Excel | manual | absorcion, margen | Comercialización | Jefe comercial | media |
| Programa referidos (embajador) | WhatsApp + Excel | manual | absorcion | Comercialización | Marketing | alta |

### 3. Marketing
Lider: Marketing Prospera

| Proceso | Sistema | Digital | Objetivos | Ciclo | Puesto | Confianza |
|---------|---------|---------|-----------|-------|--------|-----------|
| Pauta digital y campañas | Meta / Google + agencia | externo | absorcion | Comercialización | Coord. marketing | alta |
| Tours 3D y sala de ventas | Proveedor externo | externo | absorcion | Comercialización | Marketing | baja |
| Atribución costo-por-lead | **NO EXISTE** | manual | (huérfano) | Comercialización | — | baja |

### 4. Proyectos & Obra
Lider: Constructora aliada / Proyectos

| Proceso | Sistema | Digital | Objetivos | Ciclo | Puesto | Confianza |
|---------|---------|---------|-----------|-------|--------|-----------|
| Expediente técnico y licencias | Arq. + municipalidad | externo | cronograma | Licencias | Proyectos | baja |
| Control de avance obra | Excel + WhatsApp | manual | cronograma, margen | Construcción | Supervisor | media |
| Presupuesto y valorizaciones | Excel | manual | margen | Construcción | Residente | media |

### 5. Finanzas & Cobranzas
Lider: Administración

| Proceso | Sistema | Digital | Objetivos | Ciclo | Puesto | Confianza |
|---------|---------|---------|-----------|-------|--------|-----------|
| Cobranza cuotas preventa | Excel + WhatsApp | manual | caja | Comercialización | Admin. | media |
| Tesorería y flujo caja | Excel + banca web | manual | caja, margen | Transversal | Admin. | media |
| Boletas y facturación e. | Facturador SUNAT | integrado | caja | Transversal | Admin. | alta |
| Contabilidad y tributario | Estudio contable externo | externo | margen | Transversal | Externo | baja |

### 6. Legal, Titulación & Postventa
Lider: Asesoría legal externa

| Proceso | Sistema | Digital | Objetivos | Ciclo | Puesto | Confianza |
|---------|---------|---------|-----------|-------|--------|-----------|
| Contratos preventa y compraventa | Word + notaría | manual | caja, cronograma | Comercialización | Asesor legal | media |
| Titulación: independización → SUNARP | Notaría + SUNARP | externo | cronograma | Titulación | Asesor legal | baja |
| Entrega unidad y acta | Papel + Excel | manual | cronograma | Entrega | Postventa | media |
| Postventa y garantías | WhatsApp / correo | manual | (huérfano) | Postventa | Postventa | media |
| Gestión documental proyecto | Carpetas en Drive | manual | (huérfano) | Transversal | Admin. | baja |

---

## Código de digitalización (estado del sistema)

| Estado | Color | Significado |
|--------|-------|-------------|
| **manual** | Rojo (#e5564b) | Excel / papel / WhatsApp — sin integración |
| **externo** | Naranja (#f5a524) | Tercero / sistema externo (no propio) |
| **integrado** | Verde (#2ecf96) | Integrado en la operación de Prospera |

---

## 6 Brechas priorizadas (con business case)

| Brecha | Tipo | Objetivo bloqueado | Costo / Impacto | Prioridad |
|--------|------|-------------------|-----------------|-----------|
| **Sin CRM:** leads y pipeline en WhatsApp + Excel | Sistema | Absorción | 1 venta / 104 leads vs ~85 best-in-class (Sperant 2025) | **ALTA** |
| **Pro-forma frágil:** proyecto en Excel sin versión única | Sistema | Margen | "El #1 silencioso" — decisión sin control de versión | **ALTA** |
| **Obra sin control:** avance y presupuesto en Excel | Sistema | Margen | 8–15% sobrecosto típico vs <3% best-in-class | **ALTA** |
| **Cobranza manual:** cuotas en Excel/WhatsApp | Proceso | Caja | 27% de separaciones caen; firma en ~29 días | MEDIA |
| **Titulación sin seguimiento vivo:** SUNARP 3–6 meses | Proceso | Cronograma | 3–6 meses sin trazabilidad → fricción cliente | MEDIA |
| **Postventa sin sistema:** garantías y reporte huérfano | Proceso | (ninguno) | Reputación en riesgo; board se entera tarde | BAJA |

---

## Interfaz / Secciones principales

### 1. Mapa Vivo (default tab)

**Qué muestra:** Empresa viva — 6 áreas × 26 procesos × estado digitalización

**Interacción:**
- Click en "4 Drivers del IRR" → ilumina quién sostiene cada objetivo (Hilo de Oro filtering)
- Cada proceso es un nodo: click → drawer con detalles (sistema, puesto, ciclo, fuente, confianza)
- Leyenda: manual | externo | integrado

**Datos por proceso:**
- Nombre / descripción
- Sistema actual (texto)
- Digitalización (manual / externo / integrado)
- Objetivos que sostiene (links a KRs)
- Ciclo ULI (Originación → Factibilidad → Comercialización → Construcción → Titulación → Entrega → Postventa)
- Responsable (puesto)
- Fuente (Sistema leído | Entrevista | Declarado | Inferido)
- Confianza (alta | media | baja)

### 2. Hilo de Oro (tab 2)

**Qué muestra:** Cascada Objetivo → Función → Proceso → Sistema

**Ejemplo (Absorción acelerada):**
```
OBJETIVO: Absorción mensual 1.7% → 3.0%
  ↓ FUNCIONES QUE SOSTIENEN:
  Comercial: Captación leads / Separaciones / Pricing / Referidos
  Marketing: Pauta digital / Tours 3D
  ↓ PROCESOS CRÍTICOS:
  "Captación leads" (WhatsApp) → estado: manual, tag: OK
  "Separaciones" (Excel) → estado: manual, tag: DÉBIL
  ↓ BRECHAS:
  Sin CRM (leads se enfrían) / Pipeline no visible
```

**Tags por nodo:**
- ✓ **OK** (integrado) — verde
- ⚠ **DÉBIL** (externo/manual pero crítico) — naranja
- ✗ **BREAK** (manual + crítico + gap) — rojo

### 3. Brechas & Caso de Negocio (tab 3)

**Tabla de priorización:** cada brecha × costo / impacto × objetivo que bloquea

Benchmarks del sector (ASEI / Tinsa / Sperant).

---

## Paleta de color (Prenter dark-first)

```css
--bg: #0a0c0d (fondo base)
--panel: #14191b (cards)
--teal: #00b7aa (único acento)
--manual: #e5564b (rojo, proceso manual)
--externo: #f5a524 (naranja, tercero)
--integrado: #2ecf96 (verde, integrado)
```

Dark-first con gradientes subtiles de teal (sin deps, autocontenido).

---

## Drawer (drill-down) — Estructura datos

Click en un nodo → drawer con:
- Nombre proceso + área
- Detalles: Sistema, Puesto, Ciclo, Objetivos
- **Provenance:** Fuente (Sistema leído / Entrevista / Declarado / Inferido) + Confianza (🟢 alta / 🟡 media / 🔴 baja)
- Etiqueta estado (OK / DÉBIL / BREAK)

---

## Notas de diseño / Implementación

1. **Datos ilustrativos:** Prospera real; benchmarks ASEI/Tinsa/Sperant referencia del sector, no sobre Prospera.

2. **Autocontenido:** Sin deps (webpack, build). Modelo de datos al inicio del `<script>` — editable para iterar.

3. **Responsivo:** Grid 3 cols / 2 cols en mobile.

4. **Interactividad JS pura:** tabs, drawer, filtro "Hilo de Oro", click nodos.

5. **Provenance SIEMPRE visible:** cada dato lleva fuente + confianza (M23 Grounding, aplicado).

6. **Huérfanos detectados:** procesos sin objetivo (Postventa, Gestión documental) — flagged en la UI como "no sirve ningún objetivo".

---

## De aquí a Cockpit real

**Próximos pasos (no en esta maqueta):**

- Auth + rol-based (Director vs Jefe área vs Operativo)
- Edit mode: actualizar procesos en tiempo real
- Integración con `/api/objeto` (el esquema normalizado)
- Versionado de cambios (Git como audit log)
- Generación de reportes (PDF, Excels por área)
- Conexión con el Data Lakehouse (N16) para datos reales
- Gestión de Cambios (ISO §7.5) − cambio de proceso → approval workflow → versión nueva

---

## Archivos

- `mockup-prospera-dashboard.html` — Maqueta interactiva (36 KB)
- Datos JSON embebido — 6 áreas, 26 procesos, 4 objetivos, 6 brechas, 5 proyectos

---

## Referencias

- **Benchmarks:** ASEI (Asociación de Empresas Inmobiliarias) · Tinsa (valuadores) · Sperant (CRM) · CAPECO · ULI / PwC
- **Ciclos:** Basados en ULI / modelo Perú 2025
- **Cliente real:** Prospera Grupo Inmobiliario, Lima PE
- **Marca:** Prenter · "Tecnología Global, Inteligencia Local"
