# Plant profile service contract

Maps to PlantAgent capability **`analyze_profile`** and suggested HTTP endpoint:

- `POST /v1/plants/profile:analyze` → `analyze_profile`

Authoritative behavior: [agent-layer/docs/agent-handoff.md](../../agent-layer/docs/agent-handoff.md) §3.1.

## Purpose

First-time image analysis; produces `PlantProfileDraft` for UI and backend confirmation before promoting to `PlantProfile`.

## Request body

```json
{
  "user_id": "user_xxx",
  "image": {
    "file_id": "file_xxx",
    "url": "https://...",
    "content_type": "image/jpeg",
    "captured_at": "2026-04-18T09:00:00Z"
  },
  "region": "Shanghai",
  "request_id": "req_xxx"
}
```

## Success response (example)

`status` may be `needs_confirmation` when a draft is ready.

```json
{
  "status": "needs_confirmation",
  "data": {
    "draft_id": "draft_xxx",
    "source_image_id": "file_xxx",
    "recognition_status": "identified",
    "taxonomy_id": "monstera_deliciosa",
    "common_name": "龟背竹",
    "scientific_name": "Monstera deliciosa",
    "confidence": 0.92,
    "candidates": [],
    "plant_type_tags": ["foliage", "indoor"],
    "care_baseline": {
      "watering_rule": "土表 2-3 厘米干后浇透",
      "light_rule": "明亮散射光",
      "humidity_rule": "偏好中高湿度",
      "temperature_range": "18-30C",
      "fertilizing_rule": "生长期每月一次薄肥"
    },
    "risk_flags": ["overwatering_sensitive"],
    "weather_link_fields": {
      "heat_sensitivity": "medium",
      "cold_sensitivity": "medium",
      "humidity_sensitivity": "high",
      "light_sensitivity": "medium"
    },
    "provider_metadata": {
      "model": "vision-model-v1",
      "prompt_version": "profile-v1"
    },
    "profile_version": "v1"
  },
  "request_id": "req_xxx"
}
```

## Failure response (example)

```json
{
  "status": "failed",
  "error_code": "IMAGE_TOO_BLURRY",
  "message": "图片清晰度不足，请重新拍摄",
  "request_id": "req_xxx"
}
```

## Constraints (summary)

- `recognition_status`: `identified` | `ambiguous` | `unknown` only.
- Do not promote draft to formal `PlantProfile` until user confirms.
- Persist `provider_metadata` and `profile_version` for audit and upgrades.
