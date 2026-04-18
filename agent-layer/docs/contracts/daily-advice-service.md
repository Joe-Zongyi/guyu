# Daily Advice Service Contract

## 1. 目标

Daily Advice Service 基于正式 `PlantProfile`、天气、日期和历史养护记录，生成当天养护建议 `DailyAdvice`。

## 2. 职责边界

负责：

- weather adapter 接入
- 日期、季节、天气和历史事件融合
- 今日动作规则生成
- 风险提醒生成
- mood copy 文案生成

不负责：

- 植物物种识别
- 修改 `PlantProfile`
- 从图片直接判断植物状态

## 3. 输入

```json
{
  "plant_id": "plant_xxx",
  "profile": {
    "taxonomy_id": "monstera_deliciosa",
    "common_name": "龟背竹",
    "care_baseline": {
      "watering_rule": "土表 2-3 厘米干后浇透",
      "light_rule": "明亮散射光"
    },
    "risk_flags": ["overwatering_sensitive"]
  },
  "today_context": {
    "date": "2026-04-18",
    "season": "spring",
    "weather_snapshot": {
      "condition": "cloudy",
      "temperature_c": 24,
      "humidity": 68,
      "light_level": "medium"
    },
    "recent_care_events": [
      {
        "type": "watered",
        "occurred_at": "2026-04-17T10:30:00Z"
      }
    ]
  },
  "request_id": "req_xxx"
}
```

## 4. 输出

```json
{
  "status": "success",
  "data": {
    "date": "2026-04-18",
    "actions": [
      {
        "type": "water_check",
        "priority": "medium",
        "reason": "近期温度较高，但上次浇水时间较近",
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
  },
  "request_id": "req_xxx"
}
```

## 5. 生成规则

- 主建议由规则引擎决定
- `mood_copy` 是可选文案层，不参与主建议计算
- 相同输入必须返回相同 `actions`
- 天气不可用时必须降级，但服务仍需可用

## 6. 降级策略

天气服务失败时返回：

- `status = success` 或 `needs_retry`，由 Team 0 统一定义
- `warnings` 中增加天气缺失说明
- 用 `PlantProfile.care_baseline` 生成通用建议
- 不阻断主链路

建议错误码：

- `WEATHER_UNAVAILABLE`
- `PROVIDER_TIMEOUT`
- `PROVIDER_UNAVAILABLE`

## 7. 建议接口

### `POST /v1/plants/daily-advice:generate`

请求：基于正式植物档案和今日上下文生成 `DailyAdvice`

## 8. 验收标准

- 不重新识别植物
- 不回写或修改 `PlantProfile`
- 天气缺失时仍然有可用输出
- `mood_copy` 不影响主建议
- 主建议在相同输入下保持稳定
