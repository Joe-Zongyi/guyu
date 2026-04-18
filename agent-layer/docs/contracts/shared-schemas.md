# Shared schemas

This file lists **cross-cutting enums and named shapes** for PlantAgent integration. Normative behavior (degradation, auditing, responsibilities) remains in [agent-layer/docs/agent-handoff.md](../../agent-layer/docs/agent-handoff.md).

## Response status

| Value | Meaning |
|-------|---------|
| `success` | Operation completed; `data` present when applicable |
| `needs_retry` | Transient failure; client may retry |
| `needs_confirmation` | Human or product confirmation required (e.g. draft profile) |
| `failed` | Hard failure; see `error_code` / `message` |

## Error codes

| Code | Typical use |
|------|-------------|
| `IMAGE_TOO_BLURRY` | Input image unusable for vision |
| `NO_PLANT_DETECTED` | No plant in frame |
| `MULTIPLE_PLANTS_DETECTED` | Ambiguous framing |
| `LOW_CONFIDENCE_MATCH` | Recognition uncertain |
| `WEATHER_UNAVAILABLE` | Weather provider missing; advice may still succeed |
| `PROVIDER_TIMEOUT` | Agent or upstream timeout |
| `PROVIDER_UNAVAILABLE` | Agent or upstream unavailable |
| `STATE_ASSESSMENT_UNCERTAIN` | State assessment low confidence |

## Named primitives (reference)

These names align with handoff and per-service contracts:

- `FileRef` — image reference with `file_id`, `url`, `content_type`, `captured_at`
- `WeatherSnapshot` — `condition`, `temperature_c`, `humidity`, `light_level`, etc.
- `CareEvent` — e.g. `type`, `occurred_at`
- `PlantProfileDraft` — output of analyze / pre-confirmation
- `PlantProfile` — confirmed taxonomy + care baseline used in daily advice
- `DailyAdvice` — date, `actions`, `warnings`, `today_summary`, `mood_copy`, `derived_context`
- `PlantStateAssessment` — `overall_state`, `signals`, `suggestions`, etc.

## TypeScript note

Generate shared types from these docs or mirror them in a single `packages/contracts` (or equivalent) module; keep field names stable for Agent versioning.
