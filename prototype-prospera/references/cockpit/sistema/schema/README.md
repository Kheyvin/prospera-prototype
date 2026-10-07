# schema/ — esquemas de datos del dominio (as-code)

El **contrato de forma** del objeto de negocio normalizado — qué entidades existen, con qué campos
e invariantes. Cambiar algo aquí = decisión de sistema (ficha `CK-NN` / `D-NN` en el mismo evento).

| Archivo | Qué es |
|---|---|
| [`objeto.schema.yaml`](objeto.schema.yaml) | El contrato v2 (CK-26): **12 nodos** del Hilo de Oro medible (empresa · persona · rol · área · proceso · sistema · objetivo · kpi · proyecto_mejora · idea · capability · brecha) con campos, refs cruzadas, enums, invariantes (RACI A==1, key_results ≥ 1, sin ciclos) y la capa kinética (acciones + máquina de estados PDCA). SSoT declarado; lo lee/valida `/api/objeto` (CAP-08, `go/objeto.go`). Disciplina `met:` inline (norma/marco por campo). |
| [`verbos.yaml`](verbos.yaml) | Vocabulario de verbos ALM×MGI (44 canónicos + sinónimos; gobernanza por PR, RN-11). Cargado en runtime por `go/objeto.go`. |
| [`gen_schema.py`](gen_schema.py) | Gate anti-drift del contrato (4º gate, pre-commit): valida `objeto.schema.yaml` v2 + `verbos.yaml`. |
| [`gen_cobertura.py`](gen_cobertura.py) + [`gen_cobertura.yaml`](gen_cobertura.yaml) | Generador on-demand de cobertura de la flota (`--flota`/`--manifiesto`) + su política; salida: [`manifiesto-cobertura-flota.md`](manifiesto-cobertura-flota.md) (GENERADO). Test: `test_gen_cobertura.py`. |
| [`ejemplo-vertice.yaml`](ejemplo-vertice.yaml) | **Fixture de validación END-TO-END** del contrato: instancia ficticia (Inmobiliaria Vértice — NO el cliente real). Hilo de Oro completo objetivo→KR→proceso→rol/persona→sistema→capability→brecha. Ilustrativo (todo junto; en producción = un-archivo-por-entidad, D-15). |
| [`DECISIONES.md`](DECISIONES.md) | **ADR del modelo**: log D-NN detrás del contrato — cada campo `met:` del schema cita estos códigos inline. Vive junto al schema (disciplina mismo-evento: cambiar el contrato = append D-NN aquí). |

El **book** del objeto (el *porqué* metodológico de cada casilla — entidades, objetivos, kpis,
procesos, brechas, mejoras, glosario) es lectura humana y vive en
[`docs/metodo/objeto/`](../../docs/metodo/objeto) (movido en CK-28); las citas `met:`/`§` del
schema refieren a esos capítulos.

Procedencia: campaña `modelo-objeto` destilada al cerrar BL-07 (la campaña se borró; esto ES el
hogar del modelo). v2 (12 nodos + kinética + verbos) = historia `schema-v2-hilo-de-oro-kinetica`
(CK-26). Deuda abierta: `negocio.yaml` a proyección generada (BL-19).
