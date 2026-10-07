# SOTA — Data Lakehouse ligero para PyME (nutre a Cockpit con operación día a día)

> Investigación 2026-07-08 (rediseño CK-18). Contexto: lakehouse en infra del cliente (o hosteado
> por nosotros como opción de pago); ingesta de SaaS externos, ERP enlatado, sistemas a medida y
> Excels; consumidor = binario Go (Cockpit) que cruza estructura org × operación. Bajo mantenimiento,
> sin data engineers, sin K8s.

## Panorama
2025-2026 consolidó el "small data stack": la mayoría de empresas tiene 50 GB–2 TB analíticos y el
aparato Spark/catálogo/compaction de los lakehouses clásicos es un desastre operativo para equipos
chicos. Hito: **DuckLake 1.0** (abr-2026, DuckDB v1.5.2): formato lakehouse cuyo metadato vive en
una BD SQL común (SQLite/Postgres/DuckDB) — sin servicio de catálogo, sin jobs de compactación
(writes chicos se "inlinean", umbral 10 filas), ACID gratis. En ingesta, **dlt** (Python puro, sin
servidor, estado incremental propio) desplazó a Airbyte para equipos sin ops (Airbyte hoy asume
K8s + Temporal + Redis).

## Comparativa
| Opción | Ops | Escala | Veredicto |
|---|---|---|---|
| DuckDB + Parquet plano | ~cero | cientos GB | Base, pero sin ACID/schema evolution: corto con múltiples pipelines |
| **DuckDB + DuckLake** (catálogo SQLite/Postgres) | ~cero | ≤ bajos TB | **Ganador**; multi-proceso vía catálogo Postgres |
| Iceberg / Delta | catálogo + compactación + tuning | PB | Sobreingeniería (DuckLake ~926× en queries chicas) |
| Postgres warehouse | conocidas | <~100 GB | Row-store penaliza agregaciones; úsalo como *catálogo* DuckLake |
| ClickHouse | servidor siempre-on | real-time alto vol | Cliente equivocado para unipersonal |
| **dlt** | pip + cron | sobrada | **Ganador ingesta** (2.8–6× vs Airbyte/Sling) |
| Airbyte / Meltano | K8s / taps dispares | — | Descartar (costo ops / fragilidad) |
| Dagster / Airflow | servicio+DB+UI | — | Innecesario: cron/systemd timers + healthcheck |

## Recomendación concreta
**Por cliente, en su servidor:** repo de pipelines **dlt** (SaaS vía verified sources o REST; ERP y
DBs a medida vía `sql_database`+ConnectorX) → **DuckLake** (Parquet en disco local o su S3/MinIO,
**catálogo en Postgres** mínimo → escritor-pipeline y lector-Cockpit concurrentes, snapshots, time
travel). Un solo host sin Postgres → arranca catálogo SQLite, migra después (es un `ATTACH` distinto,
no migración de datos).

**Excel como fuente de primera clase:** carpeta "drop" (o upload desde UI de Cockpit) → dlt
`filesystem` + `read_excel`, o `read_xlsx` de DuckDB con `all_varchar=true` a staging + validación
tipada; archiva cada archivo con hash/fecha (auditabilidad). Pipeline normal, no excepción.

**Exposición a Go:** DuckDB **embebido** vía driver oficial `github.com/duckdb/duckdb-go`
(database/sql); Cockpit abre DuckDB in-memory y `ATTACH ... AS lake (TYPE ducklake)` en lectura.
Cero servicio intermedio, cero puerto nuevo.

**Orquestación:** systemd timers + healthchecks.io + logs a archivo.

**Crecimiento:** SQLite→Postgres → MotherDuck si pagan hosting → Iceberg solo si aparece 2º motor
de query (no pasará a esta escala).

## Qué diferir
Iceberg/Delta y catálogo-servicio; Airbyte/Meltano; Dagster/Airflow; ClickHouse; dbt/SQLMesh y
semantic layers (SQL en repo basta ~30 transformaciones); CDC/streaming (batch horario sobra);
MinIO si el disco local alcanza.

## Fuentes (2026-07-08)
- DuckLake v1.0: ducklake.select/2026/04/13/ducklake-10/ · Duck Lake vs Iceberg: definite.app/blog/duck-lake-vs-iceberg
- DuckDB usa RDBMS para "small changes": theregister.com/2026/04/16/duckdb_uses_rdbms_lakehouse/
- Self-hosted ELT benchmark (dlt vs Sling/Airbyte/Meltano): dlthub.com/blog/self-hosted-tools-benchmarking
- Driver Go: github.com/duckdb/duckdb-go · Excel: duckdb.org/docs/.../excel_import · dlt filesystem+Excel
- DuckDB vs ClickHouse: posthog.com/blog/duckdb-vs-clickhouse
