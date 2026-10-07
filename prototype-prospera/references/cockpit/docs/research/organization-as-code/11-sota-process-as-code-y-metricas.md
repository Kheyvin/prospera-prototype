# 11 · SOTA 2025-2026 — Process-as-code · Organization/EA-as-code · Métricas-as-code

> **Investigación 2026-07-25** (encargada en la sesión de CK-30). Cierra las 5 líneas que quedaron
> abiertas: workflow engines · **anatomía de Backstage** · OCEL 2.0 · modelo→trabajo ejecutable ·
> métricas-as-code. Hermano de [`09`](09-sota-dto-2026-fuente-primaria.md) (DTO desde fuente
> primaria) y [`10`](10-sota-arnes-as-code.md) (arnés-as-code).
>
> **⚠ Contiene una autocrítica dura y verificada (§ "qué está flojo" #18):** nuestro `pre-commit`
> valida el **schema**, no las **instancias** — que es el mismo shape que Backstage. El
> diferenciador G1 está **a medio construir, no construido**.
>
> **Marcas:** **[V]** fuente primaria abierta · **[V-2ª]** secundaria · **[I]** inferencia.
>
> **Nota de método del investigador:** el presupuesto de WebSearch se agotó temprano; todo lo **[V]**
> viene de **WebFetch directo sobre URLs primarias** y de la **API de GitHub autenticada**
> (`search/code`, `search/repositories` → *evidencia negativa contable*). Sesga hacia fuente
> primaria: fuerte en rigor, ciego a prensa/anuncios. Las sub-líneas que no cerraron están
> declaradas **PENDIENTE**, no rellenadas.

---

## § 1 · Process-as-code / workflow engines

### 1.1 · BPMN / DMN / CMMN as code

**El estándar está congelado; la innovación está toda en el tooling.** BPMN sigue en **2.0.2 (enero 2014)** — doce años sin revisión [V]. DMN sí evoluciona: **1.5 formal (ago-2024) + beta 1.7 (sep-2024)** [V]. CMMN quedó huérfana: viva en Flowable y en Camunda 7.24 [V], **ausente de Camunda 8**, que sólo documenta BPMN + DMN 1.3 + Forms [V].

**Linting en CI: existe, es oficial y está mantenido.** `bpmnlint` v11.12.1 (2026-04-22), MIT, 166★, activo [V]. Config en **`.bpmnlintrc`** (`extends` con presets `bpmnlint:recommended`/`all`, bloque `rules`, `moddleExtensions`), corre con `npx bpmnlint diagrama.bpmn`, 21 reglas (`no-disconnected`, `label-required`, `single-blank-start-event`…) [V]. Camunda lo usa como motor vía `bpmnlint-plugin-camunda-compat` (presets `camunda-cloud-8-0`…`8-7`, push 2026-07-24) [V]. **El Desktop Modeler lee el mismo `.bpmnlintrc` que el CI** [V] — editor y gate comparten configuración, exactamente la disciplina SSoT→gate.

Y la guía oficial de CI/CD de Camunda 8 sí prescribe el gate: *"Add a step to your pipeline for automatic process verification using the `bpmnlint` and `dmnlint` libraries"* [V, docs.camunda.io/docs/guides/devops-lifecycle/integrate-web-modeler-in-ci-cd/].

**Diff/merge: viable sólo con herramienta semántica.** El XML crudo es inrevisable porque `<bpmndi:BPMNDiagram>` guarda coordenadas (`<dc:Bounds x="173.0" y="102.0" .../>`) [V]: mover una caja ensucia el diff. **`bpmn-js-differ`** (MIT, 55★, push 2026-07-18) diffea sobre el object model parseado y devuelve `_added`, `_removed`, `_changed` y —lo importante— **`_layoutChanged` separado** [V]. Camunda aplica el mismo principio: *"Only differences that affect the execution of the BPMN process are highlighted"* [V].

Pero el ecosistema de *review* es débil: `bpmn-diff-merge` como git difftool tiene **9 commits y 1★** [V]; la búsqueda de GitHub Actions de bpmnlint devuelve `total_count: 0` [V]. **[I]** Nadie construye `_layoutChanged` si `git diff` alcanzara — la evidencia del dolor es indirecta pero contundente.

### 1.2 · Camunda 8

Línea temporal: 8.7 → 2025-04-08 · **8.8 → 2025-10-14** · **8.9 → 2026-04-14** (actual) [V].

- **El `.bpmn` vive en git como fuente.** Desktop Modeler delimita una *process application* con el marcador **`.process-application`**, layout `src/main/resources/` (BPMN, DMN, Forms) [V]. Despliegue por `@Deployment(resources="classpath:demoProcess.bpmn")` o `POST /deployments`, **atómico**: *"either all resources are deployed or none of them are"* [V].
- **Process application = bundle versionado**: *"a type of folder that contains a set of related files you can work on and deploy as a single bundle"*; el versionado *"save a single snapshot of all the process application files in one action"*; límite práctico de bundle 2-3 MB [V].
- **Git sync del Web Modeler: bidireccional y real** — GitHub, GitLab, Azure DevOps, Bitbucket Cloud y DC [V]. Límites concretos: **máx. 250 commits o 300 archivos por sincronización**; Bitbucket DC no empuja borrados; squash commits rompen el sync [V].
- **El hallazgo incómodo:** el sync es **manual (un botón)** y sobre PRs la doc dice literalmente que hay que resolverlo *"through external Git management"* — **no hay flujo de pull request en el producto** [V]. La colaboración nativa es edición en tiempo real tipo Google Docs con lock de canvas, **sin gate de aprobación** [V]. Y la guía de CI/CD recomienda explícitamente *"a single Web Modeler installation for all environments, utilizing versions to signify versioning and pipeline stages"* [V] — es decir, **el hub es el Modeler, no git**.
- **Tres ejes de versión que no coinciden** [I, sobre base [V]]: commits de git · *versions* del Web Modeler (con diff visual y de XML) · versión del *process definition* del motor (*"if the version has changed… register that deployment as a new version"*; las instancias en curso siguen en su versión) [V].
- **"GitOps para procesos" no existe como concepto documentado** por Camunda [V]. `zbctl deploy` fue expulsado a `camunda-community-hub`, es *community-supported* [V].
- **Cobertura parcial del estándar:** Camunda 8 no soporta Transaction subprocess, Complex gateway ni Cancel event; DataObject/DataStore son *"modeling purposes only"* [V]. **[I]** "BPMN as code" es siempre un dialecto de motor, no portable.
- **Corrección importante:** Camunda 7 **Community Edition está muerta desde 2025-10-14** (sin parches de seguridad tras 7.24). La extensión a 2030/2032 es **sólo Enterprise** [V].

### 1.3 · Temporal

Worker Deployment Versioning es **GA** (server v1.31.0, 2026-04-29; Temporal Cloud 2026-03-30) [V]. Dos comportamientos: **PINNED** (*"guaranteed to complete on a single Worker Deployment Version"*, sin patching) y **AUTO_UPGRADE** (requiere `GetVersion`/`patched()` para replay-safety) [V]. CLI real: `temporal worker deployment set-current-version`, `set-ramping-version --percentage 5` [V].

Los workflows son código en Go/Java/Python/TS/PHP/.NET/Rust, con determinismo estricto [V].

**¿Proceso de negocio u orquestación técnica?** Temporal contesta solo, en su propia doc: **"Temporal isn't a no-code Workflow engine — it is Workflows-as-Code. Instead of dragging and dropping steps in a visual interface, you write your Workflows in code"** [V]. Su home de julio 2026 ni menciona procesos: *"Build AI apps and agents on an open foundation"* [V]. **Veredicto: orquestación técnica.** Cuando dice "business process" quiere decir *el proceso implementado por un ingeniero en Go*. No hay artefacto legible por un no-programador [I].

### 1.4 · Argo · Airflow · Dagster · Prefect · Step Functions

| Motor | Artefacto as-code | Gate CI | Versionado | ¿Negocio? |
|---|---|---|---|---|
| **Argo Workflows** v4.0.8 (2026-07-22) [V] | `apiVersion: argoproj.io/v1alpha1`, `kind: WorkflowTemplate`, `kubectl apply` [V] | **`argo lint --offline`** valida manifests sin cluster [V]; v4.0 trae CRDs con validación → ValidatingAdmissionPolicy [V] | Git + Argo CD (*"WorkflowTemplate resources can be managed with GitOps by using Argo CD"* [V]) | ❌ la unidad es un pod [I] |
| **Airflow** 3.3.0 (2026-07-06) [V] | DAGs como Python: *"Airflow loads Dags from Python source files in Dag bundles"* [V] | — | `[dag_processor] dag_bundle_config_list` con `GitDagBundle` (`tracking_ref`, `subdir`); *"A DAG will run through to completion based on the version at start"* [V]. **Sólo GitDagBundle soporta versionado** (Local/S3/GCS no) [V] | ❌ ETL/datos |
| **Dagster** 1.13.15 (2026-07-23) [V] | **`defs.yaml`** con `type:`/`attributes:`, Jinja `{{ env.VAR }}` [V] | **`dg check yaml`** valida contra schema [V] | Branch deployments efímeros por PR (Dagster+) [V] | ❌ data assets — **pero es el patrón arquitectónico más cercano al nuestro** [I] |
| **Prefect** 3.8.0 (2026-07-23) [V] | `prefect.yaml` (`build`/`push`/`pull`, step `git_clone`) [V] | — | Versiona **la config del deployment**, no el proceso [I]. Escéptico: *"Prefect no empuja tu código a git… intentional to avoid confusion about the git history"* [V] | ❌ |
| **Step Functions** | ASL JSON, extensión **`.asl.json`**, validado por **Statelint** [V] | Statelint + **TestState con mocking** (Step Functions Local **descontinuado**, nov-2025) [V] | Versiones inmutables `...:stateMachine:name:1` + aliases con routing ponderado [V]; IaC `AWS::StepFunctions::StateMachine` + `DefinitionSubstitutions` [V] | ❌ artefacto de despliegue, no de discusión [I] |

Vitalidad (GitHub API, 2026-07-25) [V]: Airflow 46.2k★ · Conductor 32.0k★ · Prefect 23.5k★ · Temporal 21.8k★ · Argo 16.8k★ · Dagster 15.9k★ · Flowable 9.4k★ · Inngest 5.6k★ · Restate 4.2k★ · Camunda 4.2k★ · SpiffWorkflow 1.9k★ · DBOS 1.5k★ · Kogito 612★.

### 1.5 · El bonus que importa: **SpiffArena**

Es el prior art más cercano a "proceso de negocio en git" [V, `docs/how_to_guides/deployment/manage_process_models.md`]:

- Los process models son **archivos en directorios**; la doc abre con *"Managing your process models is similar to managing your source code. As such, it is recommended to store these models in a version control system like Git"*.
- **Sync bidireccional** con `SPIFFWORKFLOW_BACKEND_GIT_COMMIT_ON_SAVE=true`, `..._GIT_SOURCE_BRANCH`, webhook GitHub (`/v1.0/github-webhook-receive`).
- **El detalle decisivo:** *"If your process model repo has a `.git` directory, process instances that are created will store the **commit hash** in the database."* → **cada instancia queda anclada al commit exacto de su definición**.
- Sección literal **"Process Model Promotion Strategy"**: *"the best way of promoting models is to do work on a specific branch and then merge that branch into the next branch"* (dev→staging→prod), o baked-in vía Dockerfile para entornos read-only. El `..._GIT_PUBLISH_TARGET_BRANCH` la propia doc lo desaconseja *"as it is not a standard Git workflow"*.
- **Tests unitarios de BPMN versionados junto al diagrama** (`test_*.json` al lado del `.bpmn`) [V]. Vivo: v2.4.2 (2026-07-21), LGPL-3.0, 140★ (arena) / 1.9k★ (engine) [V].

### 1.6 · Evidencia negativa contable

Búsquedas en la API de GitHub, 2026-07-25 [V]:

| Query | `total_count` |
|---|---|
| `"business process as code"` (repos) | **0** |
| `"process as code" bpmn` (repos) | **1** (0★) |
| `"ISO 9001" as code yaml` (repos) | **0** |
| `"okr as code"` / `"okr-as-code"` (repos) | **0** / **0** |
| `"metrics as code"` (repos) | **1** (1★) |
| `"sop as code" OR "sops as code"` (repos) | **1** (0★) |
| `"work instructions" yaml generate` (repos) | **0** |
| `"digital twin of an organization" yaml` (repos) | **0** |

Además: el único repo temáticamente exacto de ISO-9001-en-git (`CAMRPC/qualitySystems`, *"Transitioning the company's ISO 9001 QMS to GIT"*) tiene **1★ y último push en 2015**; `strongdm/comply` (el "SOC2 en markdown con CI" que todos citan) **sin commits desde 2022-07** [V].

### ▸ VEREDICTO § 1

**Nadie trata el proceso de negocio humano como código versionado, revisable por PR y con gate automático. El espacio está verificablemente vacío, y lo está por una razón estructural: los dos mundos que podrían cerrarlo están separados por el artefacto.**

De un lado, los motores que **sí** modelan trabajo humano —Camunda 8 (*"A core value of Camunda 8 lies in the combination of automation and human interaction"*, user tasks, forms, Tasklist [V]), SpiffArena, Flowable— usan BPMN XML, cuyo diff crudo es inrevisable y cuyo flujo de autoría nativo es un editor visual con colaboración en tiempo real y **sin gate de aprobación**; Camunda incluso recomienda el Web Modeler como hub único de entornos, relegando git a sincronización.

Del otro, los que **sí** tienen disciplina as-code impecable —Temporal, Argo, Dagster, Windmill— orquestan contenedores, funciones y data assets, y su propio marketing lo admite. Cuando un vendor de esta familia dice "business process as code", describe **el proceso implementado por un ingeniero**: es over-claiming y hay que llamarlo así.

**La excepción parcial y el prior art a estudiar es SpiffArena**, único que cierra *editor visual → archivos en git → branch de promoción → URL de PR → instancia anclada a commit hash → tests versionados junto al diagrama*. Le falta el gate automático (no se encontró runner CLI de sus BPMN unit tests para pre-commit → **PENDIENTE**) y su SSoT es BPMN, no entidades de negocio tipadas.

Piezas a robar, probadas por separado: el **`_layoutChanged`** de bpmn-js-differ (separar ruido de significado en el diff), el **`dg check yaml`** de Dagster (schema validation como comando de CI de primera clase), el **commit-hash-por-instancia** de SpiffArena (trazabilidad instancia↔definición), y el **`.bpmnlintrc` compartido entre editor y CI** de Camunda (un solo archivo de reglas, dos consumidores).

---

## § 2 · Organization / EA as code — anatomía de Backstage

Es lo más cercano que existe a "catálogo de la organización as-code", así que va la anatomía real.

### 2.1 · El envelope

Cuatro campos de primer nivel [V, backstage.io/docs/features/software-catalog/descriptor-format]:

```yaml
apiVersion: backstage.io/v1alpha1   # requerido
kind: Component                     # requerido
metadata: {...}                     # requerido
spec: {...}                         # varía por kind; algunos lo omiten
```

`apiVersion` es `backstage.io/v1alpha1` para el catálogo; los Templates usan hoy **`scaffolder.backstage.io/v1beta3`** [V] (la página `descriptor-format` todavía documenta `backstage.io/v1beta2` para Template — **desfase de la propia doc; el canónico vivo es `v1beta3`** [V]).

**`metadata` (común a todo kind)** [V]:

| Campo | Tipo | Req. | Restricción exacta |
|---|---|---|---|
| `name` | string | ✅ | **1-63 chars**, `[a-zA-Z0-9]` separados por `[-_.]` |
| `namespace` | string | — | default `default`; `[a-zA-Z0-9]` separados por `-`; máx 63 |
| `uid` | string | *output-only* | generado por el catálogo |
| `title` | string | — | display name, admite caracteres especiales |
| `description` | string | — | |
| `labels` | object | — | claves `[domain/]name`; valores con reglas de `name` |
| `annotations` | object | — | claves `[domain/]name`; valores: cualquier string |
| `tags` | array | — | `[a-z0-9:+#]` separados por `-`, máx 63 |
| `links` | array | — | `{url (req), title, icon, type}` |

**Referencias entre entidades:** *string-form entity reference* con forma **`[kind:][namespace/]name`** — se omite kind/namespace cuando coinciden con el default [V]. (Nuestro `id-ref` plano es el mismo concepto sin el prefijo de kind.)

**Placeholders de sustitución** en el descriptor: `$text:`, `$json:`, `$yaml:` con URL absoluta o path relativo al `catalog-info.yaml` [V] — mecanismo de composición que nosotros no tenemos.

### 2.2 · Los kinds y su `spec` (verbatim)

| Kind | `spec` requerido | `spec` opcional |
|---|---|---|
| **Component** | `type`, `lifecycle`, `owner` | `system`, `subcomponentOf`, `providesApis[]`, `consumesApis[]`, `dependsOn[]`, `dependencyOf[]` |
| **API** | `type`, `lifecycle`, `owner`, **`definition`** | `system` |
| **Resource** | `type`, `owner` | `system`, `dependsOn[]`, `dependencyOf[]` |
| **System** | `owner` | `domain`, `type` |
| **Domain** | `owner` | `subdomainOf`, `type` |
| **Group** | `type`, **`children[]`** (puede ser vacío) | `profile{displayName,email,picture}`, `parent`, `members[]` |
| **User** | **`memberOf[]`** (puede ser vacío) | `profile{...}` |
| **Location** | `spec` presente (puede ser vacío) | `type`, `target`, `targets[]`, `presence: required\|optional` |
| **Template** | `type`, `parameters`, `steps` | `owner`, `output`, `presentation` |

[V, todo lo anterior]

Semántica del modelo (C4-inspired) [V, system-model]: **Component** = *"a piece of software… mobile feature, web site, backend service or data pipeline"*; **API** = frontera de abstracción (visibilidad public/restricted/private); **Resource** = infraestructura de runtime; **System** = *"a collection of resources and components that exposes one or several public APIs"*; **Domain** = bounded context que agrupa systems que comparten *"terminology, models, metrics, and business purpose"*. **Deployment, Environment y Endpoint están declarados como no soportados todavía** [V].

### 2.3 · Relaciones: cómo se declaran y cómo se derivan las inversas

Backstage **no permite escribir relaciones a mano**. Se declaran vía campos del `spec` y el catálogo **emite** los pares [V, well-known-relations]:

| Relación | Kind origen | Campo `spec` que la genera | Inversa |
|---|---|---|---|
| `ownedBy` | cualquiera | `spec.owner` | `ownerOf` |
| `providesApi` | Component/System | `spec.providesApis[]` | `apiProvidedBy` |
| `consumesApi` | Component/System | `spec.consumesApis[]` | `apiConsumedBy` |
| `dependsOn` | Component/Resource | `spec.dependsOn[]` | `dependencyOf` |
| `parentOf` | Group | `spec.parent` / `spec.children[]` | `childOf` |
| `memberOf` | User/Group | `spec.memberOf[]` / `spec.members[]` | `hasMember` |
| `partOf` | Component/API/System/Domain | `spec.system` / `spec.domain` | `hasPart` |

**El mecanismo exacto** (esto es lo importante, y está en `life-of-an-entity` [V]):

1. **Entity providers** (no procesadores) traen datos de fuentes autoritativas y empujan *entidades sin procesar* a la DB con timestamp. Dos vienen de fábrica: el de locations registradas por el usuario y el de locations estáticas de `app-config`. La DB registra qué provider posee cada entidad; **dos providers no pueden emitir la misma entidad** [V].
2. **Processors** corren en el loop, por etapas: `preProcessEntity` → `validateEntityKind` → `postProcessEntity`. Emiten relaciones con **`processingResult.relation`**, que *"se ponen en una tabla dedicada de relations"*, y entidades diferidas con `processingResult.entity` [V].
3. **Stitching**: ensambla entidad procesada + errores + **todas las relaciones, salientes (emitidas por esta entidad) y entrantes (emitidas por otras que apuntan a ésta)** en la entidad final que expone la API, y refresca el índice de búsqueda. Es determinístico: si el hash (cuerpo + relaciones + errores + entidades referidas + padres) no cambió, se saltea [V].
4. **Orfandad**: si un processor deja de emitir un hijo y nadie más lo referencia, el stitcher le inyecta la annotation **`backstage.io/orphan: 'true'`**; `orphanStrategy: delete` es el default [V]. Borrado por provider = **eager deletion del árbol completo** que salió de esa entidad [V].

**Traducción a nuestro vocabulario:** Backstage aplica *un-hecho-un-lugar* en la **autoría** (un solo extremo escribe la relación en su `spec`) y **materializa ambas direcciones en un read-model reconstruible** (la tabla `relations` + el stitcher). El derivado se persiste, pero en una capa que es **caché derivada de git**, no fuente. Es el mismo contrato que el nuestro, con una capa de materialización que nosotros hoy no tenemos.

### 2.4 · Descubrimiento por `Location`

**Estático**, en `app-config.yaml`:
```yaml
catalog:
  rules:
    - allow: [Component, API, Location, Template]
  locations:
    - type: url
      target: https://github.com/org/repo/blob/master/catalog-info.yaml
      rules:
        - allow: [Group]
```
Por default **sólo se permiten Component, API y Location**; si aparece `catalog.rules`, **reemplaza** el default [V]. Las locations estáticas **no se pueden borrar por la API** [V]. Existe un `readonly` mode que desactiva registrar/borrar locations por API [V].

**Automático**, por provider de organización [V, integrations/github/discovery]:
```yaml
catalog:
  providers:
    github:
      providerId:
        organization: 'backstage'
        catalogPath: '/catalog-info.yaml'   # admite globs: '/groups/**/*.yaml'
        schedule:
          frequency: { minutes: 30 }
          timeout: { minutes: 3 }
```
La doc recomienda ~35 min por el rate limit de 5.000/hora de GitHub [V]. Filtros por branch, regex de repo, topics y visibilidad [V].

### 2.5 · Software Templates (scaffolder)

```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata: { name: v1beta3-demo, title: Test Action template }
spec:
  owner: backstage/techdocs-core
  type: service
  parameters:                       # JSON Schema + ui: hints
    - title: Fill in some steps
      required: [name]
      properties:
        name: { title: Name, type: string, ui:autofocus: true }
        owner:
          ui:field: OwnerPicker
          ui:options: { catalogFilter: { kind: [Group, User] } }
        repoUrl:
          ui:field: RepoUrlPicker
          ui:options: { allowedHosts: [github.com] }
  steps:
    - id: fetchBase
      name: Fetch Base
      action: fetch:template
      input: { url: ./template, values: { name: '${{ parameters.name }}' } }
    - id: publish
      action: publish:github
      input: { repoUrl: '${{ parameters.repoUrl }}', defaultBranch: main }
    - id: register
      action: catalog:register
  output:
    links:
      - title: Open in catalog
        icon: catalog
        entityRef: '${{ steps["register"].output.entityRef }}'
```
[V, verbatim de writing-templates]

Puntos finos: templating **Nunjucks** en `${{ }}`; steps soportan `if:` y `each:`, más `always()` y `failure()` para cleanup; secrets vía `ui:field: Secret` accesibles como `${{ secrets.x }}` (no `parameters`); acciones built-in `fetch:template`, `fetch:plain`, `publish:github`, **`catalog:register`**, **`catalog:write`**; editor con dry-run en `{scaffolder-path}/edit` [V].

**Lo importante conceptualmente:** el scaffolder **cierra el ciclo** — el template crea el repo *y* registra la entidad resultante en el catálogo en el mismo run. Es "compilar un artefacto nuevo desde el modelo, y volver a inscribirlo en el modelo".

### 2.6 · Extender el modelo: la advertencia oficial

Backstage **desaconseja activamente** agregar kinds [V, extending-the-model]: *"most plugins will be compiled against the builtin `@backstage/catalog-model` package and have expectations that kinds align with that"*; el código de base contiene chequeos hardcodeados `if (kind === 'X')`. Recomienda, en orden: (1) usar el campo **`type`** —*"this is where an organization are free to express the variety of entities within a kind"*—, (2) annotations/labels, (3) campos custom en el `spec`, y sólo entonces un kind nuevo con `apiVersion` namespaced (`my-company.net/v1`) + processor con `validateEntityKind`.

### 2.7 · Validación: **no hay gate oficial pre-merge**

La API expone **`POST /validate-entity`** y **`POST /analyze-location`** [V], pero *"the documentation does not specify an official CI/CD validation workflow for catalog-info.yaml files before merge"* [V]. El gate en CI existe sólo como **community**: `RoadieHQ/backstage-entity-validator` (GitHub Action + CircleCI Orb + Docker + CLI, Apache-2.0, 81★, `validationSchemaFileLocation` para reglas propias) [V]. **Validación runtime, no pre-merge.**

### 2.8 · Documentación derivada: TechDocs

`backstage.io/techdocs-ref` *"informs where TechDocs source content is stored so that it can be read and docs can be generated from it"* — típicamente un path relativo a un `mkdocs.yml` [V]. Más `backstage.io/techdocs-entity` / `-entity-path` para compartir docs entre entidades sin duplicar [V]. Es **docs-like-code adjunto a la entidad**, no documento **derivado de** la entidad: TechDocs renderiza markdown escrito a mano, no genera el procedimiento desde el modelo [I, sobre base [V]].

### 2.9 · Port.io y Cortex — ¿aportan algo distinto?

**Port.io — modelo abierto en vez de kinds fijos.** El **Blueprint** es un tipo definido por el usuario, con `schema.properties` (JSON Schema), `relations`, `mirrorProperties`, `calculationProperties` y `aggregationProperties` [V]. Relación [V, verbatim]:
```json
{ "myRelation": { "title": "My title", "target": "My target blueprint",
                  "required": true, "many": false } }
```
con la restricción explícita *"A Relation can't be configured with both `many` and `required` set to `true`"* [V]. Blueprints definibles por Terraform y Pulumi, entidades por GitOps con archivos JSON en el repo [V].

**El hallazgo de Port que más nos toca —y es una advertencia, no un modelo a copiar.** Las `calculationProperties` (jq sobre `.properties.*`, con `colorized: true` y bandas `colors: {OK: green, WARNING: yellow, CRITICAL: red}`) **cambiaron de semántica**: *"With persistent calculation properties, values are computed and stored in the background, as opposed to being computed on-request"*, y **las cuentas creadas después del 2026-03-30 usan modo persistente por default**, con una mejora reportada de *"up to 10 times faster for a blueprint with 100,000 entities and 3 calculation properties"* [V]. Es decir: **el prior art más parecido a nuestro semáforo-computado-al-leer abandonó el compute-on-read por presión de performance a escala de 100k entidades.**

**Cortex — el descriptor es OpenAPI extendido.** `cortex.yaml` es *"a fully compliant OpenAPI 3 spec file, extended with Cortex-specific fields"* [V]:
```yaml
openapi: 3.0.0
info:
  title: Payments API
  x-cortex-tag: payments-api          # identificador único, requerido
  x-cortex-type: team                  # service|team|domain|custom
  x-cortex-owners:
    - { type: group, name: platform-engineering, provider: CORTEX }
  x-cortex-groups: [backend, payments]
  x-cortex-parents:  [{ tag: engineering-domain }]
  x-cortex-dependency:
    - { tag: fraud-detection-service, method: POST, path: /v1/evaluate }
  x-cortex-relationships:
    - { type: depends-on, destinations: [{ tag: fraud-detection-service }] }
  x-cortex-custom-metadata:
    tier: tier-1
```
Aporta dos cosas que Backstage no tiene: **tipos de entidad custom con JSON Schema propio** (`x-cortex-type` + `x-cortex-definition`, ejemplo literal de la doc: `x-cortex-type: org-employees` con `location`/`department` — o sea, **gente como entidad de catálogo, en producción**) y **tipos de relación definidos por el usuario**, semánticamente tipados, con source/target entity types y direccionalidad explícita [V]. Restricción curiosa: *"YAML comments aren't supported in entity descriptors. Cortex stores descriptors as JSON in the database"* [V] — su git no es la fuente, es una capa de importación.

**Adopción medida** (GitHub code search, 2026-07-25) [V]: `filename:catalog-info.yaml` = **2.572** · `filename:cortex.yaml x-cortex-tag` = **340** · `filename:port.yml blueprint` = **169**. Backstage: 33.951★, 7.508 forks, push 2026-07-25 [V].

### 2.10 · Backstage vs. nuestras 12 entidades

**Qué modela Backstage que nosotros no:**

1. **`Location` y el descubrimiento automático.** Nuestro layout es `empresa/<tipo>/<id>.yaml` por convención de carpeta; Backstage tiene una entidad de primera clase para "dónde buscar más entidades", con globs, scheduling y rate-limit awareness. Nosotros escaneamos; ellos declaran la fuente.
2. **`Template` / scaffolder.** Nada equivalente: un artefacto versionado que *genera* otros artefactos y los re-inscribe en el catálogo (`catalog:register`).
3. **`API` como entidad con `definition` embebida** — el contrato técnico como ciudadano de primera. Nuestro `sistema` no lleva su contrato.
4. **Materialización de relaciones inversas** (tabla `relations` + stitcher determinístico con hash). Nosotros computamos el inverso por scan en cada lectura.
5. **Marcado de orfandad** (`backstage.io/orphan`) y política de borrado en cascada. Nuestras refs colgantes son sólo un warning.
6. **Placeholders `$text/$json/$yaml`** para componer descriptores.
7. **`lifecycle` como campo requerido** en Component/API (production/experimental/deprecated). Nosotros tenemos `estado_*` por entidad, no un eje transversal.

**Qué modelamos nosotros que Backstage no —y ahí está la diferencia de fondo:**

1. **Seis entidades sin ningún análogo**: `objetivo` (con `key_result`), `kpi` (con `mediciones`, `banda`, `contribuye_a`, `en_tension_con`, `rollup`), `brecha`, `proyecto_mejora`, `idea`, `capability`. Backstage no tiene ninguna primitiva de intención, de desvío ni de mejora.
2. **`proceso`** — inexistente en Backstage. Su `Component` es software; nuestro `proceso` tiene `actividad[]` con `verbo`, `carril_ref`, `raci`, `tiempos{toque,espera}`, `tipo_actividad`.
3. **`rol` separado de `persona`.** Backstage tiene User y Group y nada más: el rol es implícito en la membresía. Nuestra frontera CK-24 no tiene equivalente — de hecho Backstage ni siquiera versiona su org: **la ingesta de User/Group viene de LDAP/Okta/MS Graph, no de YAML en git** [V, integrations/ldap/org], y la doc *"does not address roles, positions, processes, or objectives — just these two entity kinds"*.
4. **Provenance por dato** (`fuente` + `conf` por campo, `met:` con la metodología que lo justifica). Backstage no tiene noción de confianza ni de origen metodológico.
5. **Relaciones tipadas con semántica ArchiMate** (`assignment`, `serving`, `realization`, `influence`, `composition`, `aggregation`). Backstage tiene 7 pares fijos hardcodeados; Cortex se acerca con relationship types custom, pero sin ontología.
6. **Invariantes de negocio con severidad** (ERROR bloqueante vs WARNING). Backstage valida forma, no reglas de negocio.
7. **El gate pre-commit.** Backstage valida en runtime; nosotros bloqueamos el commit. *(Con la salvedad del punto 18 de la tabla final — ver § "qué está flojo".)*

**Nuestro alcance declarado es el negocio; el de Backstage es explícitamente el software.** Su propia doc: *"a centralized system that keeps track of ownership and metadata for all the software in your ecosystem"*, sin mención alguna de procesos de negocio [V].

### ▸ VEREDICTO § 2

**Backstage es el prior art estructural más fuerte que existe y valida el 60% de nuestro diseño — pero modela otra cosa y se detiene justo antes del gate.** Valida: entidades tipadas en YAML co-ubicado con el trabajo, `apiVersion/kind/metadata/spec` como envelope estable, referencias por string `[kind:][namespace/]name`, relación autorada en **un solo extremo** con la inversa **derivada por la máquina**, descubrimiento declarativo, y un artefacto (`Template`) que compila cosas nuevas desde el modelo y las re-inscribe.

Se detiene en tres lugares y los tres son nuestros: **(a)** su universo es el software —de nuestras 12 entidades sólo `sistema`, `área`(≈Group) y `persona`(≈User) tienen análogo decente, y las seis del hilo de valor no existen; **(b)** su propia organización **no vive en git** sino sincronizada desde LDAP/Okta, y sólo como User/Group sin roles ni puestos; **(c)** **no hay gate pre-merge oficial**.

Advertencia del vecindario: Port.io, que tenía el modelo más parecido al nuestro para propiedades computadas con bandas de color, **migró de compute-on-request a persistencia en background por default para cuentas nuevas desde 2026-03-30**, con 100k entidades como umbral de dolor.

Y el techo político: Backstage **desaconseja explícitamente los kinds nuevos** porque su ecosistema hardcodea `kind === 'X'`. Un modelo de 12 entidades fijas y curadas es una apuesta distinta —y defendible— frente al extremo opuesto de Port (blueprints totalmente libres, donde el modelo deja de ser ontología y pasa a ser configuración del cliente).

---

## § 3 · Process mining + OCEL 2.0 / object-centric

### 3.1 · Anatomía real del estándar

**Quién y cuándo.** Publica el *Chair of Process and Data Science (PADS), RWTH Aachen*. **Versión 2.0, fechada 16-oct-2023**; arXiv `2403.01975` (4-mar-2024), 13 autores encabezados por Berti/Koren/Adams y con van der Aalst [V, PDF leído completo]. Esquemas de validación publicados: XSD, JSON Schema y un PDF de constraints relacionales [V].

**Dato político que cambia cómo hay que citarlo:** el propio spec cuenta que el *OCED Working Group* de la IEEE Task Force on Process Mining **no convergió tras 1,5 años** y que por eso el equipo publicó 2.0 unilateralmente [V, §3]. **OCEL no es estándar de organismo.** XES sí lo es (IEEE 1849-2023); OCEL es *de facto* académico [V].

**Meta-modelo formal (Definition 2, §4)** [V, textual]:

```
L = (E, O, EA, OA, evtype, time, objtype, eatype, oatype, eaval, oaval, E2O, O2O)
```
- `evtype : E → U_etype` — cada evento tiene **exactamente un** tipo.
- `time : E → U_time` — eventos **atómicos**, no duran.
- `eaval : (E × EA) ↛ U_val` — atributos de evento **sin** dimensión temporal propia.
- **`oaval : (O × OA × U_time) ↛ U_val`** — *el timestamp está en la clave*. Ésa es la mecánica exacta de los *dynamic attributes*: `oaval^t` devuelve el último valor con `t' ≤ t`. Un atributo estático es el que sólo tiene asignación en `t = 0`.
- **`E2O ⊆ E × U_qual × O`** — terna **cualificada**; el qualifier *"describe el rol que el objeto juega en la ocurrencia de ese evento"*.
- **`O2O ⊆ O × U_qual × O`** — relaciones objeto-objeto **fuera del contexto de un evento**; ejemplo textual: *"an employee may be part of an organizational unit"*, con qualifiers `part-of`, `reports-to`, `belongs-to`.

Decisiones de diseño explícitas: los valores de atributo de objeto **deliberadamente no se conectan a eventos**; se permiten eventos sin objetos y objetos sin eventos [V]. **Límite duro: `O2O` no tiene timestamp** — una relación objeto-objeto es atemporal en el meta-modelo [V].

**Serialización relacional (SQLite), esquema exacto** [V, §6]:

| Tabla | Columnas |
|---|---|
| `event_map_type` / `object_map_type` | `ocel_type` (PK), `ocel_type_map` |
| `event` / `object` | `ocel_id` (PK), `ocel_type` (FK) |
| `event_<Type>` | `ocel_id` (PK,FK), `ocel_time`, `<atributos>` |
| `object_<Type>` | `ocel_id` (FK), `ocel_time`, `<atributos>`, **`ocel_changed_field`** |
| `event_object` | `ocel_event_id`, `ocel_object_id`, **`ocel_qualifier`** — PK compuesta de las 3 |
| `object_object` | `ocel_source_id`, `ocel_target_id`, **`ocel_qualifier`** — PK compuesta de las 3 |

Tablas **densas por tipo**, no una sparse gigante. En `object_<Type>` el `ocel_id` **no** es PK: el objeto reaparece por cada cambio y `ocel_changed_field` nombra qué columna cambió; la fila con `1970-01-01 00:00 UTC` porta los valores iniciales [V].

**¿Cuál serialización es la canónica?** Ninguna, por decisión explícita: *"el punto crítico es la estandarización y unificación de conceptos (no la serialización de datos usando una sintaxis específica)"* [V]. **[I]** En la práctica el SQLite es el que recibe tratamiento normativo y el que escala.

### 3.2 · OCEL 1.0 → 2.0

1.0 (2020, JSON y XML) ya soportaba eventos ligados a múltiples objetos de distintos tipos. **No tenía: O2O, qualifiers, ni atributos de objeto cambiantes** [V, §2 textual]. 2.0 agrega exactamente esas tres cosas + el formato relacional SQLite + XML rehecho [V].

### 3.3 · Tooling y adopción — la parte incómoda

- **PM4Py**: declara *"complete compatibility with the OCEL 2.0 specification"*, ingiriendo/escribiendo **relacional y XML** [V]. Discovery **`ocdfg`** (OC-DFG) y **`ocpn`** (object-centric Petri nets) + `conformance.ocel` [V]. AGPL-3.0 con versión comercial aparte [V].
- **El catálogo de tool support** lista ~25 herramientas — **prácticamente todo prototipo académico** [V].
- **Celonis: el vendor #1 no habla OCEL nativamente.** Su Object-Centric Data Model está GA y Process Sphere salió en 2023 [V-2ª], pero **ni el blog de OCPM ni el de OCDM mencionan OCEL 2.0** [V, ambos leídos]. El puente en ocel-standard.org se llama literalmente **"Provisional Celonis Upload"**, es un script Python **de RWTH, no de Celonis**, existe *"due to compatibility issues"* y exige crear tipos y relaciones a mano [V]. **Conflicto de interés a declarar: van der Aalst es coautor del estándar y Chief Scientist de Celonis** [V-2ª].
- **IBM** publicó en dic-2025 (`arXiv:2512.03906`) su *Multilevel Process Mining* propio comparado contra el OCPM académico → feature híbrida propia, no adopción [V]. **SAP Signavio**: wiki educativa sobre OCPM **sin claim de producto ni mención de OCEL** [V]. **Microsoft Power Automate Process Mining**: doc puramente case-centric, **cero menciones de object-centric u OCEL** [V].
- **Datasets**: los logs OCEL 2.0 publicados son mayoritariamente **sintéticos**; los "reales" son commits de Angular, el Bundestag, Enron, Ethereum y Age of Empires 2. **No hay un solo log público de un ERP productivo corporativo** [V].
- **Investigación viva pero disputando el meta-modelo**: *"Detecting Dynamic Relationships in Object-Centric Event Logs"* (mar-2026) ataca justamente que **las relaciones cambian en el tiempo**; *"Time and Relations into Focus: Ontological Foundations of Object-Centric Event Data"* (mar-2026) propone una ontología fundacional (gOCED) [V-2ª]. En 2026 el `O2O` atemporal sigue en disputa.

### 3.4 · OCEL vs. un modelo de 12 entidades tipadas

**Qué modela OCEL:** ocurrencias (`E`), cosas (`O`), sus tipos, atributos con historia, y dos familias de arcos cualificados. **Nada más.** **No hay ninguna primitiva con semántica de "valor deseado vs. valor real"**, ni de intención, ni de autoría de una decisión [V]. El propio spec lo admite por elevación: pide que la comunidad estandarice a futuro los *"correspondientes modelos de proceso object-centric **normativos**"* — o sea, **lo normativo vive explícitamente fuera del estándar** [V, textual].

| Nuestra entidad | Análogo OCEL | Solape |
|---|---|---|
| `proceso` | conjunto de *event types* | fuerte, pero a nivel instancia |
| `sistema`, `persona` | *object types* | fuerte |
| `rol` | qualifier E2O **o** object type + O2O | parcial y ambiguo |
| `área` | objeto + O2O `part-of` (el ejemplo del spec es literalmente empleado→unidad organizacional) | fuerte |
| `empresa` | — (OCEL no tiene frontera organizacional) | nulo |
| `objetivo`, `kpi`, `proyecto_mejora`, `idea`, `capability`, `brecha` | **nada** | **nulo** |

**Seis de doce entidades no tienen representación honesta.** Y hay dos diferencias de eje, no de grado [I]: **(a) granularidad** — OCEL modela instancias (millones de facturas), el twin modela tipos y estructura; **(b) qué se versiona** — OCEL versiona *el mundo*, git versiona *el modelo* (quién decidió qué, con autoría, diff y revert). Son ortogonales.

### 3.5 · Task mining

Vendors activos: Celonis, UiPath, SAP Signavio, Microsoft (vía Minit 2022), IBM (myInvenio 2021), ABBYY, Skan.ai, EdgeVerve, Nintex (Kryon 2022), Mimica, Soroco, Kyp.ai, Paxray [V-2ª].

**Privacidad — el punto crítico.** La doc de UiPath es explícita: captura **screenshots, teclado, clicks, movimientos de mouse y apps**, con masking de PII vía Azure Cognitive Services. Pero: *"Informing data subjects is the responsibility of the customer as UiPath has no technical possibility of identifying or taking consent from data subjects"* — **el consentimiento se delega contractualmente al cliente**, y la página no menciona GDPR ni comités de empresa [V]. Doc equivalente de Celonis detrás de login OAuth → **PENDIENTE**.

**¿Sirve para derivar instrucciones de trabajo?** Produce mapas a nivel de clicks, analytics de uso de apps y candidatos a automatizar. Eso es **materia prima, no una instrucción de trabajo**: falta el porqué, el criterio de aceptación y el responsable [I].

### 3.6 · ¿Cierra el loop hacia la mejora?

Celonis nombra tres mecanismos: **Action Flows**, **Orchestration Engine** y, desde Celosphere 2025, *Data Core + Process Intelligence Graph + Orchestration Engine* [V; V-2ª]. **La única cifra de valor cuantificada en toda la investigación es "Campari Group realizó $5M"**, sin metodología ni auditoría [V] — tratar como marketing.

Del lado académico, van der Aalst publicó *"No AI Without PI!"* (`arXiv:2508.00116`) argumentando que OCPM es el eslabón faltante para IA prescriptiva [V] — position paper de keynote, no evidencia empírica.

**Conclusión:** el process mining llega hasta *disparar una acción*. **No llega a gestionar la mejora como objeto de negocio**: en ningún meta-modelo revisado —ni OCEL ni OCDM— hay una entidad `proyecto_mejora` con estados, dueño, costo, ROI y KPI objetivo. El loop cierra a nivel de transacción, no de gestión.

### ▸ VEREDICTO § 3

**OCEL es ALIMENTADOR, con uso secundario como formato de intercambio. No es competidor del twin.**

1. **Cobertura semántica disjunta.** OCEL modela hechos de ejecución pasada; el twin modela estructura deseada, gobierno y desvío. Seis de doce entidades no existen en su meta-modelo, y **el propio spec declara que lo normativo queda fuera de su alcance**.
2. **Encaje arquitectónico limpio.** OCEL/OCPM es el formato natural de la capa de estado real (Lakehouse, N16): produce el As-Is medido que alimenta el motor de indicadores y el cálculo de brecha en N13. Es exactamente la relación N6 × N16 → N13 que ya está en la arquitectura.
3. **Como formato de intercambio: sí, pero sin apuro.** Vale contra PM4Py. **No vale hoy como puente a Celonis** — el conector es un script "provisional" de terceros.

**Qué copiar sin adoptar** [I]: (a) **relaciones cualificadas y direccionadas** — `E2O`/`O2O` con `qualifier` es exactamente la primitiva que necesita `persona`↔`rol`↔`área`; (b) **atributos con validez temporal** (`valor válido desde t`, con el truco de `t=0` para lo estático) para el estado real. **Qué no copiar:** la serialización, y la ausencia de tiempo en O2O — que la propia academia está corrigiendo en 2026.

---

## § 4 · Del modelo al trabajo ejecutable

### 4.1 · (A) ¿Alguien genera SOPs/procedimientos ISO desde un modelo versionado?

**Las suites BPM: sí, y desde antes de los LLM.** Esto es lo primero a internalizar: *"generamos el procedimiento desde el modelo"* **no diferencia** — la arquitectura repositorio + plantilla + regenerar es estándar desde los 2000s [I, sobre base [V]].

- **ARIS Document Generator** [V] — genera *"process manuals in Microsoft Word, branded to your corporate identity"* con *"Easily modify manuals on-demand"*. **Cero IA**: extracción template-based + report scripting en JavaScript.
- **SAP Signavio Process Manager** [V-2ª] — *"Process documentation can include diagrams as well as all element descriptions, and dictionary entries. The documentation is created in Microsoft Word or PDF format."* ~15 tipos de report (RACI, handover, job profiles, riesgo, costos). Lo que SAP lanzó con IA en 2025-03 va **al revés**: text-to-process [V-2ª].
- **Bizagi Modeler** [V] — publica a Word, PDF, Excel, MediaWiki, Web, SharePoint.
- **BOC ADONIS** [V] — *Report Creator for Word*: *"dynamic report content with model attributes… filled with specific model and object data from the ADONIS database"*.
- **Nintex Process Manager (Promapp)** [V] — el más cercano a nuestra tesis: **el modelo ES el documento**. Exporta "Procedure Text", BPMN/XPDL, PDF; su *Process Capture* graba pantalla y con *"cognitive AI"* deja el borrador **dentro del procedure panel** (modelo estructurado), no en un PDF suelto.
- **Engage Process** [V] — el Viewer es *"a digital handbook"* con *"Work and compliance instructions for each process step"*. Sin export ni IA verificable → parcialmente PENDIENTE.

**El mundo QMS/ISO 9001 no llega, y ése es el hueco real.** Ninguno genera desde un modelo de proceso: tratan el procedimiento como **archivo controlado** (versión, aprobación, firma, training), nunca como vista derivada. **ETQ** → `etq.com/etq-ai/` hace 301 a `octave.com`; "genera SOPs" **no verificado** [V]. **MasterControl** → subís *un SOP* y *"generate compliant draft text"*: **doc→doc** [V-2ª]. **Greenlight Guru** → 80+ plantillas + IA para convertir documentos en quizzes [V]. **Ideagen** / **Cognidox** → claims vagos, document control puro [V]. **[I] El puente BPM↔QMS sigue vacío.**

**Captura pantalla→instrucción: one-shot que se pudre.** **Scribe** (*"Documentation that writes itself"*) y **Tango**: sin modelo subyacente, sin re-derivación → **driftea** [V]. Dos excepciones parciales: **Dozuki** (*"Author procedures once and roll them out"*, *"robust version controls built-in"*, ISO 9001/45001 explícito) y **SwipeGuide** (301 → `l2l.com` tras adquisición por L2L): *"standard taxonomy, structures, and templates"* — hay esquema, pero no derivado de un modelo de proceso [V].

**Academia: la línea model→text no revivió.** El clásico es **Leopold, Mendling, Polyvyanyy, *"Generating Natural Language Texts from Business Process Models"*, CAiSE 2012** (LNCS 7328, pp. 64-79) [V]. El único revival genuino: **Klievtsova, Mangler, Kampik, Rinderle-Ma, *"Utilizing Process Models in the Requirements Engineering Process Through Model2Text Transformation"*, IEEE RE 2024**, cuyo propio veredicto es demoledor: *"LLMs produce human-like process descriptions based on the predefined patterns, but apparently **lack true comprehension** of the process models."* **Sólo 6 citas** [V]. La asimetría cuantificada: de ~24 entradas relevantes 2024-2026, **~20 son text→model y 1-2 model→text** [V]. Lo vivo y útil es otra cosa: **Schulte et al., *"Toward LLM-enabled business process coherence checking based on multi-level process documentation"*, Process Science 2025** (DOI `10.1007/s44311-025-00024-6`, open access) — método *aProCheCk*, detecta incoherencias documentación↔modelo con dataset publicado [V]. **Benchmark model→text: no existe → PENDIENTE.**

### 4.2 · (B) ¿El modelo compila a ejecución?

**UiPath Maestro — el que sí llega.** Es el hallazgo más sólido de esta sección [V]:
- *"In Maestro, **BPMN is the language you use to turn real-world processes into automation-ready models**"*; el modelo es **"machine-actionable"** y *"Maestro can validate and orchestrate it"*. User tasks = humanos, service tasks = sistemas, call activities = lógica reutilizable.
- **Versionado real**: se publica con nombre, changelog y versión; Orchestrator muestra *"Updates are available"* y permite *"Upgrade to latest version"*.
- **Modelo como código**: archivos `.bpmn` con extensiones `uipath:activity`/`uipath:event`/`uipath:mapping`, CLI `uip maestro bpmn registry get <type>`, nodos que incluyen **agentes**, RPA jobs, human-in-the-loop, colas y reglas de negocio.
- La frase de producto, que es literalmente nuestra tesis: **"The diagram is the process, not a drawing of it"**, y *"A single BPMN diagram captures every step, decision, exception, and SLA, turning tribal knowledge into a **governed, executable asset**."*
- **Límite honesto** [I]: Maestro **no genera documentación** desde el modelo. Cierra (B), no (A).

**IBM "Bob" — el único que hace BPMN→SOP→agente** [V]. Pipeline verificado: **BPMN → documento SOP → solución watsonx Orchestrate desplegada**, con artefactos `order_processing_agent.yaml`, `order_processing_flow.py`, tools Python, tests y scripts de import. *"Bob analyzes the BPMN model and converts the business process into a working watsonx Orchestrate solution"*; el SOP es la especificación intermedia que el negocio aprueba. **Con pinzas** [I]: es *spec-driven development* — **codegen de una sola pasada**, sin evidencia de re-derivación ni gate de sincronía.

**Los que se quedan a mitad de camino:**
- **Automation Anywhere** [V, vía snippet indexado] — transformación BPMN cuyo objetivo declarado es un proceso *"that contains **enough information that a developer needs to create the automation**"*. Esqueleto para el dev, confesado.
- **SAP Build Process Automation** [V] — importa BPMN y genera estructura **con placeholders**: *"If the placeholders are not replaced with actual artifacts, process cannot be executed"*. Andamio, no compilador.
- **Celonis** [V] — **los agentes CONSUMEN contexto, no se derivan del modelo.** El Process Intelligence Graph se **mina** de event logs, no se autora. **AgentC** es *"a suite of AI agent tools, integrations, and partnerships"* sobre Copilot Studio, watsonx Orchestrate, Bedrock y CrewAI — no genera agentes desde un modelo. Matiz: **Celonis Process Management (ex-Symbio, adquirida 2023-11)** sí es modelo **autorado** con *"Track versions, audits and approvals"*, pero **generación documental no verificada → PENDIENTE**.
- **Microsoft** [V] — **versionado sin derivación.** Los *agent flows* (GA 2025-04-02) se crean sólo por natural language o designer; cero mención de BPMN o minería. La dirección inversa sí está GA: *"Generate process maps for multi-flow automations"* — el mapa se deriva del código, no al revés. Lo fuerte es otra cosa: la extensión VS Code (**GA enero 2026**) da *"YAML agent definitions"*, *"Version control your agent definitions with Git"* y PRs, con `agent.mcs.yaml`, `topics/*.mcs.yaml`, `actions/*.mcs.yml`. Eso es **agent-as-code, no organization-as-code**.

### 4.3 · La tercera vía: el AOP (Agent Operating Procedure)

Categoría nueva con nombre consensuado en 2025-2026 — el procedimiento **es** la configuración del agente:

- **Decagon** [V] — acuñador. *"define agent behavior in **natural language**, the same way you train human agents with **SOPs**"*, combinando *"the flexibility of natural language with the reliability of code"*; *"technical teams can **version with Git-based tracking**"*. **Schema exacto no público → PENDIENTE.**
- **Layerup** [V] — **el más literalmente as-code**: el AOP *"is a **JSON / YAML artifact stored in your source control system**, subject to your change management workflows"*, cada cambio *"associated with a pull request"*, y **la versión del AOP se loguea contra cada caso procesado**. *"The agent's reasoning is not hardcoded in its container image. It is governed by its AOP."* Vertical (underwriting), pero el patrón es exactamente el nuestro.
- **Sierra** [V] — *"composable skills to express procedural knowledge"*; *"**Like software built with infrastructure as code**, each agent release is a snapshot"*.
- **Skan.ai** [V] — mismo término AOP (*"dynamic guardrails that govern how your AI executes core, high-impact work"*), *"auto-generate playbooks from observations"*. Provee el **contexto**; los agentes se despliegan aparte. Formato y versionado **no verificables → PENDIENTE**.
- **Beam AI** — **el contraste útil.** Marketing [V]: *"Your 200-page SOP becomes a working agent."* Los docs lo desmienten [V]: cero página de SOP/schema/versionado; el SOP cae en *agent memory* como *"Reference documents"* → **blob RAG en el prompt vendido como SOP-as-code**.

**Dato negativo relevante** [V]: el término **"SOP-as-code" devuelve cero resultados indexados**; en GitHub, `"sop as code" OR "sops as code"` = **1 repo con 0★**. La categoría no existe públicamente.

### 4.4 · El prior art más cercano a nuestra tesis completa: **Orgschema**

*Orgschema* (Dmitry Zharnikov, 2026-03-08) — *"ISO 9001 in 17 YAML files"*, *"The git commit hash becomes the certification artifact"*, ontología de 6 niveles (Intent, Business Model, Entity, Product, Process, Organization) [V, orgschema.substack.com].

Verificado directamente contra los repos [V, GitHub API 2026-07-25]:
- `spectralbranding/orgschema-demo` — **★0**, creado 2026-03-04, push 2026-07-01. *"Spectra Coffee: complete business specification demo. 25 YAML files across 6 TDD cascade levels with CI/CD validation."* Árbol real: `organization.yaml`, `processes/{opening_closing,quality_control,equipment_maintenance,internal_communications}.yaml`, `compliance/{food_safety,allergen_management}.yaml`, `perception/*.yaml`, `products/*.yaml`, `layers/classifications.yaml`, **`.github/workflows/ci.yml`**.
- `spectralbranding/orgschema-framework` — **★1**. *"Python validator + JSON Schema for Organizational Schema Theory."* Cascada declarada: `L0 Customer Experience Contract → L1 Signal Requirements → L2 Process Contracts → L3 Procedures → L4 Input Specifications → L5 Sourcing Requirements`, validando *"structural correctness, cross-reference integrity, signal coverage, and experience traceability"*.

**Es la misma idea que la nuestra, publicada, con validador y CI.** Y es, a la vez, la mejor noticia posible: **★0-1, un solo autor, sin runtime, sin vistas derivadas, sin `objetivo`/`kpi`/`brecha`/`proyecto_mejora`, y sin compilación de agentes.** Existe la tesis; no existe el producto.

**Nota de higiene de marca:** el término "Organization-as-Code" en GitHub 2026 está siendo **colonizado por frameworks de orquestación de agentes**, no por modelado organizacional [V]: `xuiltul/animaworks` (**248★**, *"Organization-as-Code for autonomous AI agents"*), `OrgLoop/orgloop` (*"Organization as Code — declarative event routing for autonomous AI organizations… You define event sources, actors, routes, and standard operating procedures in YAML"*), `matbgn/p3fo`. Ninguno modela la organización real: modelan un equipo de agentes.

### ▸ VEREDICTO § 4

**(A) modelo → SOP / procedimiento ISO: llega, pero es tecnología vieja y el tramo ISO está vacío.** ARIS, Signavio, Bizagi, ADONIS y Nintex Promapp **sí derivan documentos del modelo y los regeneran**, desde antes de los LLM, con plantillas. **Nadie llega a:** (1) generar el aparato documental **ISO 9001** desde el modelo — el mundo QMS no tiene modelo; (2) derivar **instrucciones de trabajo por puesto** como vista del modelo; (3) **enforcement de drift** — el máximo del mercado es "one-click update", regeneración *voluntaria*, nunca un gate que **bloquee**. Y la línea model→text está académicamente muerta con un veredicto explícito de que los LLM *"lack true comprehension of the process models"*.

**(B) modelo → automatización/agentes: sí llega, y hay ganador claro — UiPath Maestro.** BPMN 2.0 ejecutable, versionado, publicable, con agentes/robots/humanos como nodos del mismo modelo y `.bpmn` manipulable por CLI. **Segundo: IBM Bob** (BPMN→SOP→agente YAML+código), único que cruza (A) y (B) — pero codegen one-shot. **No llegan:** Automation Anywhere y SAP Build (esqueletos con placeholders); Celonis (los agentes **consumen** contexto minado); Microsoft (agent-as-code versionado en git, **pero nacido de un prompt**).

**El hueco competitivo** [I]: nadie une (a) SSoT estructurada + git + gate anti-drift con (b) derivación bidireccional documento↔modelo↔agente, y **ninguno modela la organización** (roles, objetivos, KPIs, brechas) — todos son *single-process*. El patrón AOP (Layerup en particular) es la mitad agéntica de nuestra tesis, ya validada en producción por un tercero.

---

## § 5 · Métricas as-code

### 5.1 · dbt Semantic Layer / MetricFlow

`semantic_models` (spec v1.11, verbatim) [V]:
```yaml
semantic_models:
  - name: transaction
    model: ref('fact_transactions')
    defaults:
      agg_time_dimension: transaction_date   # required si hay measures
    entities:
      - { name: transaction, type: primary, expr: transaction_id }
      - { name: customer,    type: foreign, expr: customer_id }
    dimensions:
      - name: transaction_date
        type: time
        type_params: { time_granularity: day }
    measures:
      - { name: transaction_total, agg: sum }
```

Métricas como artefacto separado, 5 tipos (`simple`, `ratio`, `cumulative`, `derived`, `conversion`) [V]:
```yaml
metrics:
  - name: cancellations
    type: simple
    agg: sum
    expr: cancellations_usd
    fill_nulls_with: 0
    filter: "{{ Dimension('order__value') }} > 100"
  - { name: cancellation_rate, type: ratio, numerator: cancellations, denominator: transaction_amount }
```
`filter` **no es SQL crudo**: es Jinja tipado con `Dimension()`, `TimeDimension()`, `Entity()`, `Metric()` — se resuelve contra el grafo semántico [V].

**Dueño: sí, pero sin tipar.** La spec **v1.12** colapsa las métricas dentro de `models:` y expone `config.meta` libre [V]. **Umbrales/bandas: no existen en ningún lugar de la spec de métricas** — revisados los 5 tipos y sus `type_params`: no hay `target`, `threshold` ni `bands` [V].

**¿Se persiste el valor? No por defecto.** El Semantic Layer *"genera el SQL para hacer el request (incluyendo los joins)"* [V]. La materialización existe pero es **opt-in y explícitamente distinta**: los **Exports** *"corren tus saved queries y escriben la salida a una tabla o vista"*, con una frontera nítida — *"correr un export cuenta contra el uso de queried metrics; consultar la tabla resultante NO cuenta"* [V].

**Estado 2026:** el merger **dbt Labs + Fivetran está consumado** (blog oficial 2026-06-01) [V]; **dbt Core v2.0 en primer alpha**; **Fusion** es el motor en Rust; el código antes ELv2 pasó a **Apache 2.0** [V]. **"dbt Canvas" y "dbt MCP server": PENDIENTE, no verificados — no citar.**

### 5.2 · Cube

```yaml
cubes:
  - name: users
    sql_table: users
    joins:
      - { name: organizations, relationship: many_to_one,
          sql: "{CUBE.organization_id} = {organizations.id}" }
    measures:
      - { name: count, type: count, sql: id }
    dimensions:
      - { name: created_at, sql: created_at, type: time }
    meta:
      ai_context: Context for AI agent     # campo pensado para agentes
```
[V]. `views` componen cubes; `segments` son filtros nombrados [V].

**Pre-aggregations = sí es persistencia** — *"resúmenes materializados que aceleran la performance pre-computando resultados"*, persistidos por default en Cube Store como tablas reales [V]:
```yaml
    pre_aggregations:
      - name: orders_by_status
        measures: [CUBE.count]
        dimensions: [CUBE.status]
        time_dimension: CUBE.created_at
        granularity: day
        partition_granularity: month
        refresh_key: { every: 1 day, incremental: true, update_window: 7 day }
```
**Matiz que nos sirve** [V/I]: el YAML versionado guarda la **política de materialización** (qué, con qué grano, cada cuánto refrescar), **no el número**. Doctrinalmente no viola "el valor no se persiste en el artefacto versionado".

Posicionamiento 2026: Cube se rebautizó *"The AI Context Layer"* con MCP Connectors [V]. 20.494★. **"Cube D3" no aparece en la página de producto → tratar como no verificado.**

### 5.3 · Malloy y Lightdash

**Malloy** vivo pero nicho: `malloydata/malloy` 2.531★; `malloydata/publisher` 92★, *"the open-source semantic model server for the Malloy data language"*, expuesto por **REST y MCP** [V]. Es un **lenguaje**, no YAML.

**Lightdash — el único con `owner` tipado y validado.** Métricas dentro del `schema.yml` de dbt [V]. Tipos: agregadas, **no-agregadas** (referencian otras métricas) y **post-calculation** (`percent_of_total`, `running_total`). Filtros declarativos:
```yaml
metrics:
  active_user_count:
    type: count_distinct
    sql: ${user_id}
    filters: [{ is_active: true }]
```
Y el código fuente confirma `owner` como campo de primera [V]:
```typescript
type SpotlightConfigArgs = {
    visibility?: ...; categories?: string[];
    filterBy?: string[]; segmentBy?: string[];
    defaultSegment?: string; defaultFilter?: MetricFilterRule;
    owner?: string;
};
```
Con **validación real**: *"Invalid spotlight owner: expected string"*, y las `categories` **deben existir en el project config o se tira `ParseError`** [V]. **Eso es un gate anti-drift sobre el artefacto de métrica** — el prior art más cercano al nuestro en el mundo BI. 5.981★, tagline *"Agentic BI"* [V].

### 5.4 · Dónde SÍ viven los umbrales

**LookML** (~2012): measures/dimensions en git revisables por PR, **sin umbral ni dueño** [V].

**Prometheus alerting rules** — umbral + severidad versionados [V]:
```yaml
  - alert: HighRequestLatency
    expr: job:request_latency_seconds:mean5m{job="myjob"} > 0.5
    for: 10m
    keep_firing_for: 5m
    labels: { severity: page }
```
El umbral vive **dentro del string `expr`** — no es campo estructurado; `severity` es label convencional, no schema [V].

**OpenSLO — el candidato más fuerte, y el que más lupa exige.** `apiVersion: openslo/v1`, kinds `SLO | SLI | AlertPolicy | AlertCondition | AlertNotificationTarget | Service | DataSource` [V]. Objetivos como **umbral estructurado y tipado**:
```yaml
objectives:
  - displayName: string
    op: lte | gte | lt | gt      # para thresholdMetric
    value: numeric               # el umbral
    target: numeric              # [0.0, 1.0)
    targetPercent: numeric       # [0.0, 100)
    timeSliceTarget: numeric
    timeSliceWindow: duration-shorthand
```
Y las **bandas de alerta** como objeto versionado aparte, con umbral + ventana + severidad [V]:
```yaml
kind: AlertCondition
spec:
  severity: page
  condition: { kind: burnrate, op: lte, threshold: 2,
               lookbackWindow: 1h, alertAfter: 5m }
```
**PERO: OpenSLO NO tiene campo `owner`** [V] — verificado el schema completo de `metadata` y de `spec`. Y **escepticismo obligatorio**: 1.510★ pero **último push 2025-11-25** — ocho meses sin movimiento; README auto-declarado *"a work in progress"*. **Sloth** está más vivo (2.518★, push 2026-06-19) [V]. **Nobl9: PENDIENTE.**

**Powerpipe/Steampipe** — controles con severidad en `tags` (no tipados), resultados **computados al correr, no almacenados** [V]. **SodaCL** — umbrales tipados con niveles (`threshold: {level: warn}`) y un gate real, **pero el owner NO vive en el YAML**: se gestiona en Soda Cloud vía "Responsibilities" [V] — **parte el artefacto en dos**, justo lo que queremos evitar.

**Grafana** — thresholds como pasos `value + color` (base = −∞, modos absolute/percentage) [V]. Es el único lugar del stack donde el **semáforo** es artefacto de primera clase; su provisioning-as-code **PENDIENTE parcial**.

### 5.5 · OKR-as-code: es un desierto, con evidencia

Barrido con la API de GitHub, 2026-07-25 [V]:
- `"okr as code"` / `"okr-as-code"` en repos: **0 y 0**.
- `topic:okr`: 119 repos, y el top son **apps con base de datos**, no frameworks as-code: `operately/operately` (503★), `get-thriving/thrive` (169★), `oslokommune/okr-tracker` (90★, backend Firebase).
- `gh search code "okr filename:okr.yaml"`: 20 resultados, **~15 falsos positivos**.
- El único OKR-en-git con algo de tracción (`AnandChowdhary/okrs`, 50★) usa **JSON** y son los OKR personales de una persona.
- **GitLab OKRs**: son **work items en la base de datos**, no YAML en git. Introducidos en 15.6, **detrás del feature flag `okrs_mvc` deshabilitado por default**, *"available for testing, but not ready for production use"*, Ultimate only [V]. Tres años y medio en beta.

**Curiosidad muy relevante** [V/I]: varios de los `okr.yaml` que aparecieron son de repos de **agentes/skills de 2026** (`sagerstack/agentic-workflows`, `ai-analyst-lab/ai-analyst`, `mimurchison/claude-chief-of-staff`, `Fujigo-Software/f5-framework-claude`). **El patrón "organización como YAML para que la lea un agente" está naciendo ahora mismo, artesanalmente y sin schema. Llegamos temprano, no tarde.**

### ▸ VEREDICTO § 5

**(a) ¿Se garantiza que el valor se computa al leer y no se persiste?** **Sí, es la doctrina dominante — pero es doctrina *arquitectónica*, no un invariante *enforced*.**

| Sistema | ¿Valor en el artefacto versionado? | Cómo lo garantiza |
|---|---|---|
| dbt SL / MetricFlow | **No** — compila a SQL en cada query [V] | El YAML sólo tiene `agg`/`expr`/`filter`; **no hay campo donde poner un número**. Materializar es un objeto aparte (Exports), hasta se factura distinto [V] |
| Cube | **No** el valor; **sí** la *política* de materialización [V] | `pre_aggregations` versiona qué/cuándo refrescar; el número vive en Cube Store, fuera de git |
| Malloy / Lightdash / LookML | **No** [V] | `sql` + `type` resueltos contra el warehouse |
| Prometheus / OpenSLO / Powerpipe | **No** [V] | `expr`/`query`/`sql` evaluados en runtime; Powerpipe explícito: *"computed at run time"* |
| **Port.io** | **⚠️ SÍ, desde 2026-03-30** [V] | Migró de on-request a **persistent calculation properties** por default en cuentas nuevas, por performance a 100k entidades |

**La doctrina explícita "don't materialize metrics" no existe redactada como tal en fuente primaria. Lo que hay es más fuerte que un eslogan: el schema no tiene dónde escribir el valor.** La garantía es **estructural, no normativa**. Y el contraejemplo de Port demuestra que la normativa sin estructura se dobla bajo presión de escala.

**(b) ¿Alguien declara umbrales/bandas + DUEÑO en el MISMO artefacto versionado?** **Nadie hace las dos cosas con campos tipados.**

| | Umbral/banda tipado | Dueño tipado | Mismo artefacto |
|---|---|---|---|
| **OpenSLO** | ✅ `objectives{op,value,target}` + `AlertCondition{threshold,lookbackWindow,alertAfter,severity}` | ❌ **no existe `owner`** | parcial |
| **Prometheus** | ⚠️ dentro del string `expr` + `for` | ❌ convención en `labels` | parcial |
| **Lightdash** | ❌ sin umbrales | ✅ **`spotlight.owner`, validado con `ParseError`** | parcial |
| **dbt** | ❌ | ⚠️ `config.meta.owner` libre, no tipado | parcial |
| **SodaCL** | ✅ `threshold.level: warn/fail` | ❌ owner en Soda **Cloud** | ❌ partido |
| **Grafana** | ✅ steps `value + color` | ❌ | parcial |
| **Cube / Malloy / LookML** | ❌ | ❌ | ❌ |

**Los dos mundos nunca se cruzaron:** el mundo **BI/semantic layer** sabe de *definición y linaje* y le importa el **dueño**; el mundo **SRE/reliability** sabe de *objetivo, umbral, ventana y quema de presupuesto* y **no le importa el dueño**. **Nuestro `kpi.yaml` —definición + `banda{target,umbral_amarillo,umbral_rojo}` + `dueño_ref` + `rollup` declarado + valor computado al leer— es la unión de los dos, y no se encontró a nadie que la haya hecho** [I].

---

## § 6 · El gap

Restringido a estos 5 temas. No repite los gaps de `09` (DTO) ni de `10` (arnés/agentes).

**G1 · El gate pre-merge sobre un modelo de organización no existe en ningún producto.** Backstage valida en **runtime** y su propia doc no especifica flujo de CI pre-merge; el único gate es un action **community** de Roadie [V]. Camunda recomienda bpmnlint en CI pero su hub es el Web Modeler y **no tiene flujo de PR en producto** [V]. Cortex almacena el descriptor como JSON en DB y ni siquiera admite comentarios en el YAML [V]. **Nadie bloquea el commit cuando el modelo de la organización queda inconsistente.** Lo más cercano son dos gates *parciales* sobre artefactos vecinos: `dg check yaml` de Dagster y el `ParseError` de Lightdash.

**G2 · Nadie deriva instrucciones de trabajo por PUESTO desde el modelo.** Las suites BPM derivan **manuales de proceso** desde hace 20 años [V]. Ninguna deriva la vista *"lo que hace este rol"* como proyección del modelo. **El eje del corte es siempre el proceso, nunca el puesto.** Y ninguna **bloquea** ante drift: el estado del arte es regeneración voluntaria [V].

**G3 · El eslabón `brecha → proyecto_mejora → KPI movido` no existe como entidad en ningún meta-modelo revisado.** Ni OCEL, ni el OCDM de Celonis, ni Backstage, ni Port, ni Cortex, ni dbt/Cube/OpenSLO. El process mining cierra el loop **a nivel de transacción**, no **a nivel de gestión**.

**G4 · Umbral + dueño en el mismo artefacto versionado: la intersección está vacía.** El mundo SRE tiene el umbral tipado y no tiene dueño; el mundo BI tiene dueño y no tiene umbral. SodaCL parte el artefacto en dos. **Y nadie ata la métrica a un `proceso`, a un `objetivo` y a un `rol` en el mismo grafo.**

**G5 · "OKR-as-code" es un desierto medible.** 0 repos con la frase exacta; GitLab lleva **tres años y medio** con sus OKRs detrás de un feature flag deshabilitado por default [V]. Existe SLO-as-code y metric-as-code; **nadie los unió al eje `objetivo → key_result → dueño`.**

**G6 · El puente BPM↔QMS sigue vacío.** El BPM tiene modelo y no toca el control documental; el QMS tiene control documental y **no tiene modelo** [V]. `openregulatory/templates` (ISO 13485/IEC 62304, 170★) prueba que procedimientos normativos en markdown con PR review funcionan — **sin CI, sin validación**, y con la propia empresa habiendo migrado su runtime a un eQMS propietario [V].

**G7 · Compilación bidireccional modelo↔documento↔agente.** UiPath Maestro cierra modelo→ejecución pero **no genera documentación**. ARIS/Signavio/Promapp cierran modelo→documento pero no compilan agentes. IBM "Bob" cruza los dos pero es **codegen one-shot** [V]. **Nadie mantiene los tres artefactos sincronizados por construcción.**

**G8 · La tesis existe publicada, el producto no.** *Orgschema* (★0-1, un autor, 2026) es literalmente *"ISO 9001 in 17 YAML files"* con validador Python + JSON Schema + CI [V]. Es prueba de que la idea es pensable y de que **nadie la construyó**.

---

## § 7 · Implicancias para nuestro diseño

**I1 · Adoptar el envelope de Backstage, no inventar uno.** `apiVersion` + `kind` + `metadata` + `spec` es un contrato probado a 2.572 repos públicos [V]. Concretamente: (a) versionar el schema **en el archivo** (`apiVersion: cockpit.alpacapurpura.lat/v2`) y no sólo en `meta.version` — así una instancia vieja es detectable sin consultar el schema; (b) adoptar su restricción de `name` (1-63 chars, `[a-zA-Z0-9]` separados por `[-_.]`) para nuestros `id`; (c) evaluar el prefijo de kind en las refs (`kpi:rotacion-personal-pct`) — hoy nuestras refs son ambiguas cuando un campo acepta `rol|area` (`kpi.dueño_ref`, `brecha.against_ref`), y el prefijo lo resuelve sin campo extra.

**I2 · La garantía de "no persistir el derivado" debe ser ESTRUCTURAL, no normativa.**
*(Precedente propio ya implementado: `go/objeto.go:63` llama `derivaDivergente(t["kpis"])` con el
comentario `// anotación en el payload — el disco no se toca (RN-9)`, y la función vive en
`go/objeto.go:250`. La doctrina ya corre en Go; lo que falta es que el **schema** la haga
imposible de violar.)* La lección de dbt es que **el schema no tiene dónde escribir el valor**; la de Port es que la doctrina sin estructura **se dobla a los 100k entities**. Acción: `gen_schema.py` debe rechazar **claves desconocidas** en las entidades. Un `kpi.yaml` con un campo `semaforo:` o `valor_actual:` tiene que **fallar el commit**. Y anticipar el problema de Port: si los rollups se vuelven caros, la salida correcta **no** es persistirlos en el YAML sino materializar un *read-model reconstruible* al estilo del stitcher de Backstage (ver I4).

**I3 · Copiar el `qualifier` de OCEL para las relaciones ambiguas.** `E2O ⊆ E × U_qual × O` es exactamente la primitiva que le falta a `persona.roles` y a `persona.reporta_a`. Ya lo hacemos parcialmente (`reporta_a: [{ref, tipo}]`); conviene generalizarlo: **toda relación N:M lleva qualifier tipado**. Beneficio adicional: nos alinea con el formato que va a hablar el Lakehouse (N16).

**I4 · Introducir el *stitcher* como capa explícita entre `empresa/**` y `/api/objeto`.** Backstage resuelve lo mismo con: entidad procesada + relaciones emitidas (tabla dedicada) + **hash determinístico** que saltea el re-stitch si nada cambió [V]. Traducción: un `objeto.Stitch()` en Go que produzca el grafo completo (inversos, rollups, `divergente`, scores) con un hash sobre (cuerpo + refs + errores); reconstruible desde cero, nunca commiteado. Preserva "un-hecho-un-lugar" en la **autoría** sin pagar el scan en cada lectura. Sumar el equivalente de `backstage.io/orphan`: una ref colgante hoy es warning; conviene marcar la entidad huérfana explícitamente en la respuesta.

**I5 · El gate debe bajar del meta-nivel al nivel de instancia.** Hoy `.githooks/pre-commit` valida **el schema**, y las instancias se validan en runtime — **el mismo shape que Backstage** y, por lo tanto, **no es todavía nuestro diferenciador**. El diferenciador aparece cuando el pre-commit valida `empresa/<tipo>/*.yaml` contra el schema **y** contra los invariantes de negocio. **Ése es G1 y hoy está a medio construir.** Modelo de referencia para el CLI: `dg check yaml` de Dagster [V].

> **Anclajes de código para accionar esto** (verificados 2026-07-25): los 4 gates viven en
> `.githooks/pre-commit:20-41` (`gen_arquitectura` · `gen_metodo` · `gen_roadmap` · `gen_schema`).
> **`sistema/schema/gen_schema.py` no tiene ni una referencia a `empresa/`, a un glob ni a
> "instancia"** — confirma la autocrítica de forma independiente. Los invariantes de negocio están
> implementados en `go/objeto.go` y corren al leer (p.ej. el ERROR de `kpi.dueño_ref → persona` en
> `go/objeto.go:686`). El trabajo es **levantar esos invariantes a un validador de instancias
> invocable desde el hook**, no re-escribirlos.

**I6 · Instrucción de trabajo por PUESTO = nuestra vista diferencial (G2).** Nadie corta por el puesto; todos cortan por el proceso. Tenemos el material: `proceso.actividad[].carril_ref` + `raci` + `rol` + `kpi.dueño_ref` + `actividad.alimenta_kpi_refs` permiten proyectar *"todo lo que hace y mide este rol"* sin dato nuevo. **Y es también el artefacto que se compila a la config del agente por puesto** — con lo que la instrucción de trabajo humana y el arnés del agente salen del mismo nodo del grafo, que es precisamente lo que ni Maestro (ejecuta, no documenta) ni ARIS (documenta, no ejecuta) hacen. *(Conecta directo con CK-30.)*

**I7 · Robar la forma de `objectives` de OpenSLO para `kpi.banda`, sin apostar a su ecosistema.** Nuestro `banda: {target, umbral_amarillo, umbral_rojo}` es más pobre. Incorporar: (a) **`op`** explícito (`lte|gte|lt|gt`) — hoy la dirección del semáforo es implícita y por convención, **fuente de bug silencioso**; (b) **ventana** (`isRolling`) — hoy `frecuencia` dice cada cuánto se refresca pero no sobre qué ventana se evalúa la banda. **Pero:** OpenSLO lleva 8 meses sin commits — copiar la forma, no depender del ecosistema.

**I8 · Somos la unión de dos mundos que nunca se cruzaron; escribirlo así en el pitch.** `kpi.yaml` con **definición + banda + dueño (`rol|area`, jamás persona) + `rollup` declarado + `contribuye_a` al KR + `en_tension_con` + valor computado al leer** no tiene equivalente. **`en_tension_con` no lo tiene absolutamente nadie** — ni siquiera está en la literatura de semantic layers.

**I9 · Posicionar OCEL como puerto de entrada del Lakehouse, no como formato del twin.** (a) nuestro enum `fuente: Observado` ya está preparado — declarar OCEL como el formato de importación esperado; (b) **no** adoptar OCEL como serialización del twin ni prometer interoperabilidad con Celonis.

**I10 · Higiene de nombre y de claim.** "Organization-as-Code" está siendo ocupado por frameworks de agentes (AnimaWorks 248★). Y hay que ser precisos: *"generamos procedimientos desde el modelo"* **no** diferencia (ARIS lo hace desde 2005). Lo que diferencia es la conjunción: **entidades de negocio tipadas + gate anti-drift que bloquea + vistas derivadas (incluida la instrucción por puesto) + hilo medido brecha→proyecto→KPI movido + compilación de arneses**.

**I11 · Robar dos piezas tácticas del mundo BPMN.** (a) **`_layoutChanged` separado del cambio semántico** — cuando el twin genere diagramas, el diff debe distinguir "se movió una caja" de "cambió el proceso". (b) **Un solo archivo de reglas con dos consumidores** (`.bpmnlintrc` lo lee el editor *y* el CI) — nuestro `objeto.schema.yaml` debería ser leído por el gate **y** por el editor/UI.

**I12 · Considerar el `Template`/scaffolder de Backstage y el commit-hash-por-instancia de SpiffArena.** El primero: un artefacto versionado que **genera** cosas nuevas y las **re-inscribe** en el catálogo — patrón exacto para "crear un `proyecto_mejora` desde una `brecha`". El segundo: guardar el commit del twin en cada `medicion` y en cada transición de `proyecto_mejora` — trazabilidad auditable de contra qué versión del modelo se midió. Barato, y es el argumento ante un auditor ISO.

---

## § 8 · Fuentes

*Todas accedidas el **2026-07-25**.*

**§1 · Process-as-code** — [Camunda 8 Git Sync](https://docs.camunda.io/docs/components/modeler/web-modeler/git-sync/) · [CI/CD](https://docs.camunda.io/docs/guides/devops-lifecycle/integrate-web-modeler-in-ci-cd/) · [Process applications](https://docs.camunda.io/docs/components/modeler/web-modeler/process-applications/) · [Versioning process definitions](https://docs.camunda.io/docs/components/best-practices/operations/versioning-process-definitions/) · [BPMN coverage](https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/) · [Announcements](https://docs.camunda.io/docs/reference/announcements/) · [bpmnlint](https://github.com/bpmn-io/bpmnlint) · [bpmn-js-differ](https://github.com/bpmn-io/bpmn-js-differ) · [Temporal · Understanding](https://docs.temporal.io/evaluate/understanding-temporal) · [Airflow DAGs](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html) · [Argo WorkflowTemplates](https://argo-workflows.readthedocs.io/en/latest/workflow-templates/) · [AWS ASL](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-amazon-states-language.html) · [SpiffArena · Manage Process Models](https://github.com/sartography/spiff-arena/blob/main/docs/how_to_guides/deployment/manage_process_models.md) · [OMG BPMN](https://www.omg.org/spec/BPMN/) · [OMG DMN](https://www.omg.org/spec/DMN/)

**§2 · Organization / EA as code** — Backstage: [descriptor-format](https://backstage.io/docs/features/software-catalog/descriptor-format) · [well-known-relations](https://backstage.io/docs/features/software-catalog/well-known-relations) · [system-model](https://backstage.io/docs/features/software-catalog/system-model) · [life-of-an-entity](https://backstage.io/docs/features/software-catalog/life-of-an-entity) · [configuration](https://backstage.io/docs/features/software-catalog/configuration) · [extending-the-model](https://backstage.io/docs/features/software-catalog/extending-the-model) · [software-catalog-api](https://backstage.io/docs/features/software-catalog/software-catalog-api) · [writing-templates](https://backstage.io/docs/features/software-templates/writing-templates) · [github discovery](https://backstage.io/docs/integrations/github/discovery/) · [LDAP org](https://backstage.io/docs/integrations/ldap/org) · [RoadieHQ/backstage-entity-validator](https://github.com/RoadieHQ/backstage-entity-validator) · Port.io [relate-blueprints](https://docs.port.io/context-lake/data-model/setup-blueprint/relate-blueprints.md) · [calculation-property](https://docs.port.io/context-lake/data-model/setup-blueprint/properties/calculation-property.md) · Cortex [cortex.yaml](https://docs.cortex.io/ingesting-data-into-cortex/entities-overview/entities/yaml.md) · [custom entities](https://docs.cortex.io/ingesting-data-into-cortex/entities-overview/entities/adding-entities/entity-types/creating-custom-entities.md)

**§3 · OCEL / process mining** — [OCEL 2.0 Specification (PDF)](https://www.ocel-standard.org/2.0/ocel20_specification.pdf) · [ocel-standard.org](https://www.ocel-standard.org/) · [tool support](https://www.ocel-standard.org/tool-support/) · [Provisional Celonis Upload](https://www.ocel-standard.org/tool-support/software/provisional_celonis/) · [arXiv 2403.01975](https://arxiv.org/abs/2403.01975) · arXiv 2508.00116 · arXiv 2512.03906 · [PM4Py API](https://processintelligence.solutions/pm4py/api/api.html) · [Celonis OCPM](https://www.celonis.com/blog/what-is-object-centric-process-mining-ocpm/) · [UiPath Task Mining · privacy](https://docs.uipath.com/task-mining/automation-cloud/latest/user-guide/protection-of-personal-data-and-privacy-of-the-users) · [MS Process Mining](https://learn.microsoft.com/en-us/power-automate/process-mining-overview)

**§4 · Modelo → trabajo ejecutable** — [UiPath Maestro](https://www.uipath.com/product/maestro) · [Maestro BPMN](https://docs.uipath.com/maestro/automation-cloud/latest/user-guide/bpmn) · [publishing & upgrading](https://docs.uipath.com/maestro/automation-cloud/latest/user-guide/publishing-deploying-and-upgrading-agentic-processes) · [IBM Developer · BPMN to agents](https://developer.ibm.com/tutorials/bpmn-to-agents-bob-skills-watsonx-orchestrate/) · [ARIS Document Generator](https://aris.com/fast-track-services/aris-document-generator/) · [SAP Signavio · doc templates](https://help.sap.com/docs/signavio-process-manager/workspace-admin-guide/create-process-documentation-templates) · [BOC ADONIS · Report Creator](https://docs.boc-group.com/adonis/en/modules/RCW/) · [Nintex Promapp](https://help.nintex.com/en-US/promapp/Processes/PrintProcess.htm) · [Decagon AOP](https://decagon.ai/product/aop) · [Layerup AOP lifecycle](https://docs.uselayerup.com/agents/lifecycle/aop) · [OpenRegulatory templates](https://openregulatory.com/templates/) · [Orgschema](https://orgschema.substack.com/p/iso-9001-in-17-yaml-files) · [orgschema-demo](https://github.com/spectralbranding/orgschema-demo) · [orgschema-framework](https://github.com/spectralbranding/orgschema-framework) · Leopold/Mendling/Polyvyanyy CAiSE 2012 (LNCS 7328, 64-79) · Klievtsova et al. IEEE RE 2024 · Schulte et al. Process Science 2025, DOI `10.1007/s44311-025-00024-6`

**§5 · Métricas as-code** — dbt [semantic-models](https://raw.githubusercontent.com/dbt-labs/docs.getdbt.com/current/website/docs/docs/build/semantic-models.md) · [metrics-overview](https://raw.githubusercontent.com/dbt-labs/docs.getdbt.com/current/website/docs/docs/build/metrics-overview.md) · [sl-architecture](https://raw.githubusercontent.com/dbt-labs/docs.getdbt.com/current/website/docs/docs/use-dbt-semantic-layer/sl-architecture.md) · [exports](https://raw.githubusercontent.com/dbt-labs/docs.getdbt.com/current/website/docs/docs/use-dbt-semantic-layer/exports.md) · [Cube · cube ref](https://docs.cube.dev/reference/data-modeling/cube) · [pre-aggregations](https://docs.cube.dev/reference/data-modeling/pre-aggregations) · [Lightdash metrics](https://docs.lightdash.com/references/metrics) · [lightdashProjectConfig.ts](https://raw.githubusercontent.com/lightdash/lightdash/main/packages/common/src/compiler/lightdashProjectConfig.ts) · [OpenSLO README](https://raw.githubusercontent.com/OpenSLO/OpenSLO/main/README.md) · [openslo.com](https://openslo.com/) · [Prometheus alerting rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/) · [Powerpipe benchmark HCL](https://powerpipe.io/docs/powerpipe-hcl/benchmark) · [Soda CLI reference](https://docs.soda.io/reference/soda-cli-reference.md) · [Looker measure param](https://docs.cloud.google.com/looker/docs/reference/param-field-measure) · [Grafana thresholds](https://grafana.com/docs/grafana/latest/panels-visualizations/configure-thresholds/) · [GitLab OKRs](https://docs.gitlab.com/user/okrs/)

---

## Qué está flojo / tratar con pinzas

| # | Ítem | Por qué desconfiar | Qué haría falta |
|---|---|---|---|
| 1 | **Cobertura de prensa/mercado** | El presupuesto de WebSearch se agotó al inicio; todo con WebFetch + GitHub API. Fuerte en primaria, ciego a anuncios/funding/deprecaciones | Barrido con buscador nativo |
| 2 | **Dolor de diff/merge de BPMN** | Evidencia **indirecta** (existencia de `_layoutChanged`, difftool con 1★). Cero post-mortem primario | Foros / SO / caso de empresa |
| 3 | **"GitOps para procesos"** | No existe como término documentado. Afirmado por ausencia | — |
| 4 | **Automation Anywhere** | Citas de snippets del índice; el sitio es SPA JS que sólo devuelve el TOC | Reconfirmar en navegador |
| 5 | **Celonis Process Management (ex-Symbio)** | Modelo autorado con versiones/aprobaciones [V]; **generación documental ISO PENDIENTE**. `symbioworld.com` ya no resuelve | Doc del módulo |
| 6 | **Decagon / Skan.ai AOP schema** | El eje git está [V] en producto, pero `docs.decagon.ai` gateado y Skan sólo publica marketing. Riesgo alto [I] de que el "AOP" sea prosa inyectada como contexto | Demo o doc técnica |
| 7 | **OCEL como "el estándar de la industria"** | **No es IEEE ni ISO**; el grupo OCED de la IEEE fracasó. Spec congelada desde 2023-10-16; papers de 2026 le encuentran huecos | — (usar el término con precisión) |
| 8 | **Adopción industrial de OCEL** | Celonis usa modelo propietario y no lo menciona; IBM construyó lo suyo; SAP y MS no lo mencionan. Datasets "reales" = Enron, Ethereum, AoE2 | Un log de ERP productivo público |
| 9 | **Conflicto de interés OCEL/Celonis** | van der Aalst es coautor del estándar **y** Chief Scientist de Celonis. No declarado en las fuentes | — (declararlo al citar) |
| 10 | **Cifras de ROI de vendors** | Una sola en toda la investigación ($5M, Campari, web propia de Celonis), sin metodología | Tratar como marketing |
| 11 | **OpenSLO** | 1.510★ pero **8 meses sin commits**, README auto-declarado WIP. **Copiar su forma sí; apostar a su ecosistema no** | — |
| 12 | **Port "persistent calculation properties"** | Dato fuerte y muy relevante, pero de una sola página de doc. La fecha (2026-03-30) y el número (10×, 100k) merecen confirmación | Release notes de Port |
| 13 | **Snippets YAML de dbt/Cube/OpenSLO** | WebFetch resume con un modelo chico. Consistentes con las specs, pero **antes de hornearlos en nuestro schema hay que re-abrir la doc y copiar a mano**. Ambigüedad no resuelta en `type_params` de dbt (1.11 vs 1.12) | Copia manual |
| 14 | **`dbt Canvas`, `dbt MCP server`, `Cube D3`** | **No verificados.** "Cube D3" no aparece en la página oficial | **No citar** |
| 15 | **Fecha exacta del merger Fivetran + dbt Labs** | Sólo prueba de que **ya ocurrió** antes del 2026-06-01 | Comunicado oficial |
| 16 | **PENDIENTES declarados** | Runner CLI de los BPMN unit tests de SpiffArena · privacidad de Celonis Task Mining · modelo object-centric de SAP Signavio · provisioning-as-code de thresholds de Grafana · Nobl9 · AtScale/Holistics/Omni/GoodData/Metabase/Great Expectations · benchmark académico model→text (no existe) | — |
| 17 | **ProcessMaker** | `processmaker.com` hace 301 a `decisions.com`, pero la landing de Decisions no menciona la adquisición | Comunicado |
| 18 | **⚠ Nuestro propio gate (autocrítica)** | Hoy `pre-commit` valida el **schema**, no las **instancias** (`empresa/**` está vacío in-repo y los invariantes se enforcean al leer en `/api/objeto`). Eso es **el mismo shape que Backstage** — **el diferenciador G1 está a medio construir, no construido** | Ver I5 |

---

**Resumen de una línea:** de los cinco temas, cuatro tienen dueño parcial y bien identificado (Backstage el catálogo tipado en git, SpiffArena el proceso de negocio en git, UiPath Maestro el modelo→agentes, dbt/OpenSLO/Lightdash las métricas), **ninguno tiene la conjunción**, y el único que publicó nuestra tesis completa (Orgschema) tiene ★1 y ningún runtime — con la salvedad honesta de que nuestro propio gate hoy valida el schema y todavía no las instancias, que es justamente donde vive el diferenciador.
