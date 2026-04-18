# Shared Schemas

本文档定义 Guyu 植物智能体第一阶段必须冻结的共享契约，目的是让 Team 0 / A / B / C / D 能并行开发。

## 1. Shared enums

### status

- `success`
- `needs_retry`
- `needs_confirmation`
- `failed`

### error_code

- `IMAGE_TOO_BLURRY`
- `NO_PLANT_DETECTED`
- `MULTIPLE_PLANTS_DETECTED`
- `LOW_CONFIDENCE_MATCH`
- `WEATHER_UNAVAILABLE`
- `PROVIDER_TIMEOUT`
- `PROVIDER_UNAVAILABLE`
- `STATE_ASSESSMENT_UNCERTAIN`

## 2. Shared primitives

### FileRef

```json
{
  "file_id": "file_xxx",
  "url": "https://...",
  "content_type": "image/jpeg",
  "width": 1024,
  "height": 1024,
  "captured_at": "2026-04-18T09:00:00Z"
}
```

### WeatherSnapshot

```json
{
  "date": "2026-04-18",
  "location": "Shanghai",
  "condition": "cloudy",
  "temperature_c": 24,
  "humidity": 68,
  "light_level": "medium",
  "source": "weather-provider-v1"
}
```

### CareEvent

```json
{
  "event_id": "care_evt_xxx",
  "plant_id": "plant_xxx",
  "type": "watered",
  "occurred_at": "2026-04-17T10:30:00Z",
  "metadata": {
    "amount_ml": 200
  }
}
```

## 3. PlantProfileDraft

```json
{
  "draft_id": "draft_xxx",
  "source_image_id": "file_xxx",
  "recognition_status": "identified",
  "taxonomy_id": "monstera_deliciosa",
  "common_name": "龟背竹",
  "scientific_name": "Monstera deliciosa",
  "confidence": 0.92,
  "candidates": [
    {
      "taxonomy_id": "thaumatophyllum_bipinnatifidum",
      "common_name": "春羽",
      "scientific_name": "Thaumatophyllum bipinnatifidum",
      "confidence": 0.41
    }
  ],
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
}
```

规则：

- `recognition_status` 仅允许：`identified | ambiguous | unknown`
- `confidence` 范围为 `0.0 - 1.0`
- `identified` 时必须给出 `taxonomy_id`
- `ambiguous` 时必须给出 `candidates`
- `unknown` 时不得伪造物种字段

## 4. PlantProfile

```json
{
  "plant_id": "plant_xxx",
  "user_id": "user_xxx",
  "taxonomy_id": "monstera_deliciosa",
  "common_name": "龟背竹",
  "scientific_name": "Monstera deliciosa",
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
  "created_from_draft_id": "draft_xxx",
  "profile_version": "v1"
}
```

规则：

- 只能由用户确认后的 `PlantProfileDraft` 转换而来
- Daily Advice 和 State Assessment 只能读取，不得回写改名或改种类

## 5. DailyAdvice

```json
{
  "date": "2026-04-18",
  "actions": [
    {
      "type": "water_check",
      "priority": "medium",
      "reason": "最近两天温度较高，但上次浇水时间较近",
      "suggested_time": "evening"
    }
  ],
  "warnings": ["避免中午暴晒"],
  "today_summary": "今天先观察盆土湿度，暂不急着浇水。",
  "mood_copy": "它今天状态还不错，继续稳稳照顾就好。",
  "derived_context": {
    "watering_pressure": "medium",
    "light_pressure": "medium",
    "temperature_risk": "low"
  }
}
```

规则：

- 主建议必须由规则引擎决定
- `mood_copy` 只能补充表达，不能改变核心建议
- 相同输入必须产出相同 `actions`

## 6. PlantStateAssessment

```json
{
  "overall_state": "slightly_stressed",
  "signals": ["leaf_droop", "slightly_wilted_leaves"],
  "confidence": 0.74,
  "suggestions": [
    "检查盆土是否已经过干",
    "先移动到更稳定的散射光环境"
  ],
  "compare_to_previous": "same",
  "escalation_flag": false
}
```

规则：

- `overall_state` 仅允许：`stable | slightly_stressed | needs_attention`
- `signals` 首版限制在白名单内
- 低置信度时应输出保守建议或 `unknown`
- 不允许输出病虫害诊断名词

## 7. Freeze list

以下内容必须在实现前冻结：

1. 三个核心 schema
2. 所有 enum
3. 图片引用方式
4. weather snapshot 格式
5. care history 最小字段
6. 错误码模型
7. schema versioning 策略
