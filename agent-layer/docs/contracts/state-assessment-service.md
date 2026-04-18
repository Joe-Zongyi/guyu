# State assessment service contract

Maps to PlantAgent capability **`assess_state`** and suggested HTTP endpoint:

- `POST /v1/plants/state:assess` → `assess_state`

Authoritative behavior: [agent-layer/docs/agent-handoff.md](../../agent-layer/docs/agent-handoff.md) §3.3.

## Purpose

Conservative visual state assessment from a daily image and history; **does not** re-identify species or mutate `PlantProfile`.

## Request body

```json
{
  "plant_id": "plant_xxx",
  "image": {
    "file_id": "file_xxx",
    "url": "https://...",
    "captured_at": "2026-04-18T09:00:00Z"
  },
  "profile": {
    "taxonomy_id": "monstera_deliciosa",
    "common_name": "龟背竹"
  },
  "recent_assessments": [
    {
      "overall_state": "stable",
      "signals": ["stable_appearance"],
      "assessed_at": "2026-04-17T09:00:00Z"
    }
  ],
  "request_id": "req_xxx"
}
```

## Success response (example)

```json
{
  "status": "success",
  "data": {
    "overall_state": "slightly_stressed",
    "signals": ["leaf_droop", "slightly_wilted_leaves"],
    "confidence": 0.74,
    "suggestions": [
      "检查盆土是否已经过干",
      "先移动到更稳定的散射光环境"
    ],
    "compare_to_previous": "same",
    "escalation_flag": false
  },
  "request_id": "req_xxx"
}
```

## Allowed values (summary)

**`overall_state`:** `stable` | `slightly_stressed` | `needs_attention`

**Signal whitelist (v1):** `slightly_wilted_leaves`, `yellowing_tip`, `leaf_droop`, `new_growth_visible`, `stable_appearance`, `unknown`

**Forbidden:** Strong disease diagnoses (pest names, root rot, fungal infection, etc.) — see handoff.

## Storage hint

`compare_to_previous` supports timelines; store snapshots alongside `DailyAdvice` / `PlantProfile` as needed.
