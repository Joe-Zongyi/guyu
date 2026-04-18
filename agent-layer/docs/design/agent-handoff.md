# PlantAgent 对接交付说明

本文档给前端和后端说明：我准备交付的 PlantAgent 最终会输出什么、哪些字段稳定、外层应该如何封装接入。

这是一份**对接说明**，不是内部实现细节文档。后端可以先按这里准备接口、落库与联调，前端可以先按这里准备展示和降级逻辑。

## 1. 交付范围

本次交付只覆盖统一 PlantAgent 的 3 个结构化能力：

1. `analyze_profile`：首次图片识别，输出植物档案草稿
2. `generate_daily_advice`：基于正式植物档案和天气/日期/历史记录生成今日建议
3. `assess_state`：基于每日图片和历史记录生成植物状态评估

本次**不**覆盖：

- 上传服务
- 用户鉴权
- 数据库表与持久化逻辑
- 前端页面实现
- 3D 重建
- 视频推荐
- 奖励系统

也就是说，PlantAgent 只负责**结构化输入 -> 结构化输出**。

## 2. 后端建议如何接

后端建议继续暴露产品接口，内部再调用 PlantAgent：

- `POST /v1/plants/profile:analyze` -> `analyze_profile`
- `POST /v1/plants/daily-advice:generate` -> `generate_daily_advice`
- `POST /v1/plants/state:assess` -> `assess_state`

建议后端负责：

- request_id 生成与透传
- 鉴权
- 文件上传与 file_id/url 管理
- 落库
- 缓存
- 超时/重试/熔断
- 记录原始请求响应用于审计

建议前端负责：

- 按结构化字段展示
- 不从自由文本里反推业务逻辑
- 在低置信度、降级、缺少输入时按文档做 UI 降级

## 3. 三个能力的最终输出

以下 3 份契约就是我准备交付的最终输出基线，后端可直接按它们对接：

- `docs/contracts/plant-profile-service.md`
- `docs/contracts/daily-advice-service.md`
- `docs/contracts/state-assessment-service.md`
- 共享枚举与公共结构：`docs/contracts/shared-schemas.md`

### 3.1 analyze_profile

用途：首次识别植物，生成 `PlantProfileDraft`，供前端展示和后端建档确认。

#### 输入

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

#### 成功输出

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

#### 失败输出

```json
{
  "status": "failed",
  "error_code": "IMAGE_TOO_BLURRY",
  "message": "图片清晰度不足，请重新拍摄",
  "request_id": "req_xxx"
}
```

#### 后端需要知道的点

- 这是唯一允许定义植物物种 canonical facts 的能力。
- 用户未确认前，`PlantProfileDraft` 不应直接转正式 `PlantProfile`。
- `recognition_status` 只允许：`identified | ambiguous | unknown`。
- 低置信度必须降级，不能强行给高置信结论。
- 后端应保留 `provider_metadata` 和 `profile_version` 方便审计与后续升级。

#### 前端需要知道的点

- `common_name`、`scientific_name`、`plant_type_tags`、`care_baseline`、`risk_flags` 可直接展示。
- `ambiguous` 时展示候选列表；`unknown` 时展示“待确认植物”，不要伪装成已识别。
- `care_baseline` 是建档后的养护基线，不是“今天立即去做”的任务。

---

### 3.2 generate_daily_advice

用途：基于正式 `PlantProfile`、天气、日期和历史养护记录，生成当天建议 `DailyAdvice`。

#### 输入

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

#### 成功输出

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

#### 关键设计决定

- 主建议来自规则引擎，不由自由文本决定。
- `mood_copy` 只是文案补充，不参与主建议计算。
- 相同输入下，`actions` 必须稳定。
- 天气缺失时，服务仍然可用。
- **我建议第一版天气缺失时仍返回 `status = success`，并在 `warnings` 中说明天气缺失，避免阻断主链路。**

#### 后端需要知道的点

- 后端应把正式 `PlantProfile` 作为这条能力的事实输入源，不要让这条能力重新识别植物。
- 可按 `plant_id + date` 做缓存。
- `actions`、`warnings`、`today_summary` 可直接透传给首页/提醒服务。
- `recent_care_events` 建议后端持久化并作为稳定输入给智能体。

#### 前端需要知道的点

- `actions` 是最重要的结构化展示区，应该直接驱动 checklist/card，而不是从 `today_summary` 里拆。
- `warnings` 是提醒，不是错误。
- `today_summary` 可做首页摘要。
- `mood_copy` 可选展示，不应影响交互逻辑。

---

### 3.3 assess_state

用途：基于每日图片和历史状态记录，生成基础、保守、低风险的状态判断 `PlantStateAssessment`。

#### 输入

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

#### 成功输出

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

#### 关键设计决定

- 首版只允许白名单状态信号：
  - `slightly_wilted_leaves`
  - `yellowing_tip`
  - `leaf_droop`
  - `new_growth_visible`
  - `stable_appearance`
  - `unknown`
- `overall_state` 只允许：`stable | slightly_stressed | needs_attention`
- 低置信度时优先走保守路径。
- **不允许输出病虫害名称、根腐病、真菌感染等强诊断结论。**

#### 后端需要知道的点

- 这条能力不负责物种识别，也不修改 `PlantProfile`。
- 可和同一 `plant_id` 的 `DailyAdvice`、`PlantProfile` 关联存储。
- `compare_to_previous` 可用于时间轴和趋势变化展示。
- `escalation_flag` 只表示“需要更多关注”，不是医学/病理结论。

#### 前端需要知道的点

- `overall_state` 是主状态位。
- `signals` 和 `suggestions` 可以直接展示。
- `unknown` 或低置信度不应展示成“诊断失败”，而应展示成“继续观察/建议补充图片”。

## 4. 共享结构与枚举

共享定义以后端和前端都应该按 `docs/contracts/shared-schemas.md` 为准，重点包括：

### 状态枚举

- `success`
- `needs_retry`
- `needs_confirmation`
- `failed`

### 错误码

- `IMAGE_TOO_BLURRY`
- `NO_PLANT_DETECTED`
- `MULTIPLE_PLANTS_DETECTED`
- `LOW_CONFIDENCE_MATCH`
- `WEATHER_UNAVAILABLE`
- `PROVIDER_TIMEOUT`
- `PROVIDER_UNAVAILABLE`
- `STATE_ASSESSMENT_UNCERTAIN`

### 共享 primitive

- `FileRef`
- `WeatherSnapshot`
- `CareEvent`
- `PlantProfileDraft`
- `PlantProfile`
- `DailyAdvice`
- `PlantStateAssessment`

## 5. 建议的前后端落地方式

### 后端建议落库/透传

后端建议保留以下字段原样：

- `request_id`
- `taxonomy_id`
- `common_name`
- `scientific_name`
- `confidence`
- `care_baseline`
- `risk_flags`
- `weather_link_fields`
- `actions`
- `warnings`
- `derived_context`
- `overall_state`
- `signals`
- `suggestions`
- `compare_to_previous`
- `provider_metadata`
- `profile_version`

### 前端建议直接消费

前端可以直接展示这些字段：

- 识别结果页：`common_name`、`scientific_name`、`confidence`、`care_baseline`、`risk_flags`
- 首页建议卡：`today_summary`、`actions`、`warnings`
- 状态评估页：`overall_state`、`signals`、`suggestions`

## 6. 降级和失败约定

### analyze_profile

- 低置信度：`ambiguous` 或 `unknown`
- 图片不可用：`failed`
- 不允许闭集外植物高置信命中

### generate_daily_advice

- 天气不可用：仍返回可消费结果
- 建议使用通用基线生成建议，不阻断首页
- 通过 `warnings` 告知后端/前端当前为保守建议

### assess_state

- 低置信度：优先 `unknown` 或保守建议
- 图片模糊：可失败或保守降级
- 不允许输出诊断型疾病结论

## 7. 对接阶段我会额外给的内容

在实现阶段，我还会补：

- `docs/design/agent-handoff.md` 对应的样例 JSON fixtures
- 本地 CLI 或 service 调用示例
- schema 校验测试
- contract tests

但后端现在可以先按本文档和 `docs/contracts/*.md` 开始准备接口、字段和落库结构。

## 8. 后端当前最需要先做的事

如果后端现在就开始对接，建议优先准备：

1. 三个产品接口：
   - `POST /v1/plants/profile:analyze`
   - `POST /v1/plants/daily-advice:generate`
   - `POST /v1/plants/state:assess`
2. `request_id` 透传
3. `PlantProfileDraft` / `PlantProfile` / `DailyAdvice` / `PlantStateAssessment` 的存储结构
4. 天气缺失和低置信度的降级逻辑
5. 原始 Agent 响应快照留存

## 9. 一句话总结

你可以把 PlantAgent 理解成一个统一的智能体核心层：

- 输入都是结构化 JSON
- 输出都是结构化 JSON
- 三个能力分别覆盖建档识别、今日建议、状态评估
- 后端只要按本文档准备接口和数据结构，后续接入实现时不需要再返工协议层
