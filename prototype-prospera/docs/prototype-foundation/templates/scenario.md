# Scenario: <stable-id>

Copy for each guided interaction. Populate from approved client scope; placeholders are not demo content.

| Field | Value |
| --- | --- |
| Title / user intent | <what the analyst or organizational user wants to achieve> |
| Scope item IDs / demo coverage | <references; interactive or illustrated> |
| Entry tab and context | <web or desktop; workspace/process/entity IDs> |
| Preconditions | <required evidence, views, relations and fixture state> |
| Source IDs and confidence | <references and known/inferred/unverified interpretation> |
| Methodology mappings | <method IDs and why each applies, or not applicable> |
| Trigger | <labeled button or supported sample prompt> |
| Accessibility path | <keyboard/touch route and expected focus destination> |

## Ordered events

Each event has `eventId`, `sessionId`, `sequence`, `kind`, and structured `payload`. Tool results include `callId`; reviews include `requestId`. Event kind and command IDs must exist in the scenario registry. Timing is presentation-only and must not change outcomes.

| Sequence / event ID | Kind / target ID | Visible text or structured result | State effect | Pause or error behavior |
| --- | --- | --- | --- | --- |
| <1 / unique ID> | <analyst-message / session> | <supported input> | <append turn> | <stop leaves transcript> |
| <2 / unique ID> | <tool-start/result / source or artifact> | <evidence and extracted result> | <paired by call ID> | <failure retains evidence> |
| <3 / unique ID> | <approval-request / request ID> | <proposal, affected entity IDs, evidence> | <await explicit review> | <no auto approval> |
| <4 / unique ID> | <approval-result / same request> | <approve/reject/cancel> | <approved applies demo-only patch once> | <rejection/cancel does not apply> |

## Proposed changes

List entity/relation additions, edits and removals with before/after values and source IDs. Include their effects on web preview context and highlighted relationships. No executable shell or HTML payloads. Mark inferred statements explicitly.

## Expected outcome and recovery

- Success: <observable result and exact affected IDs>.
- Rejection/cancel: <unchanged entities; visible explanation>.
- Unsupported input: <honest guidance; preserve draft>.
- Switching tab/workspace: <pause, preserved context/draft, explicit continuation>.
- Reset: <fixture restoration, canceled timers and cleared staged changes>.
- Missing prerequisites: <unavailable message rather than fabricated data>.

## Review evidence

Record the validated input pack revision, interaction test/journey reference, rendered screenshots at target sizes, and keyboard/focus result. These are future checks; do not mark complete based only on this template.
