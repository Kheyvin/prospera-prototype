# captura-manual-kpis — El twin mide sin lakehouse (fuente manual de primera clase)

> `state: idea` · module `cockpit` · node `N13` · release F1 · nace de la auditoría adversarial
> del refinamiento de `arquitectura-refichado-ck21` (2026-07-17), ratificada por el operador.

## Job

Como responsable de un proceso en una organización sin sistemas (o con sistemas sin conector)
quiero registrar los valores de mis KPIs a mano (planilla/form con periodo y evidencia) para que
el twin mida el estado real sin esperar al lakehouse.

## Por qué

La auditoría detectó el hueco más comercial del MVP: en la organización no-digital — la PyME LatAm
objetivo — no hay logs, sin logs no hay N16, y el diferenciador "hilo de oro MEDIDO" degrada
silenciosamente a mapa bonito. La captura manual NO es un parche: es fuente de primera clase con
provenance `Declarado` + frescura, que el lakehouse reemplaza métrica a métrica cuando aparece un
conector (mismo patrón CK-23: fixture → lakehouse sin cambiar la vista).

## Alcance (idea — se refina al promover)

1. Registro manual por KPI: valor, periodo, quién declara, evidencia opcional.
2. La medición lleva `fuente: Declarado` + timestamp — el motor de indicadores pinta la frescura
   (dato viejo = semáforo degradado, jamás verde mentiroso) y el contraste declarado-vs-observado
   cuando ambos existen.
3. Respeta CK-24: KPIs de proceso/rol/área — nunca captura sobre persona-nombrada.
4. Depende de schema-v2 (KPI entidad con fuente/conf por medición) y del cruce de indicadores
   (la vista que consume).

## Prior art scan

Ningún BL/historia existente cubre captura manual de mediciones (`crowdsourcing-frescura` es V2 y
apunta a FRESCURA del mapa, no a valores de KPI; `conectores-ingesta-por-sistema` es F2 y asume
sistema digital). El demo SOMA (Apodictika) valida el patrón de reporte liviano (form de 4 campos
para personal sin método) — adoptado como referencia de fricción mínima.
