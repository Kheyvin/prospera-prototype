# Reusable prototype foundation

These foundation documents prepare a future single-file client prototype. The surrounding portable package includes old runnable HTML references, but no new Prospera implementation or client scope interpretation.

Read in order:

1. [Architecture and scaffold](arch.md): boundaries, pack contracts, state and delivery.
2. [Design and atomic UI](design.md): PRENTER tokens, inventory, layouts and component states.
3. [UX contract](ux.md): five-tab journey, twin interaction rules and analyst workflows.
4. [Source review](source-review.md): what was observed, what is adapted, and known limitations.

For the next session, copy [client-pack.json](client-pack.json) into a new client directory, fill it from approved scope/evidence, and use [scenario.md](scenario.md) for each guided interaction. The JSON is an intake skeleton: its null identity fields and empty collections must be completed before it qualifies as a buildable pack. It is not a formal JSON Schema; implementing the schemas and validators is part of the future scaffold.

Use [handoff-checklist.md](handoff-checklist.md) to review readiness and the eventual artifact. The reusable blueprint was prepared without interpreting client scope. The scope is now included separately in [client-inputs/prospera/scope](../../client-inputs/prospera/scope/) for the next implementation session. Original historical prototypes and production UI files remain unchanged.
