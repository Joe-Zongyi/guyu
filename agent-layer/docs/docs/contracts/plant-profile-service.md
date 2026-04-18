# Plant Profile Service Contract

## 1. 目标

Plant Profile Service 负责在用户首次上传植物图片时，输出结构化植物档案草稿 `PlantProfileDraft`，供后端展示和用户确认。

这是唯一允许定义植物物种事实的模块。

## 2. 职责边界

负责：

- 图片质量门禁
- 通过 `vision-model adapter` 调用通用多模态模型
- 闭集植物识别
- taxonomy 映射
- 候选项与低置信度处理
- 基础养护基线生成
- 风险标签生成

不负责：

- 正式入库
- 每日建议
- 病虫害诊断
- 每日状态分析

## 3. 输入

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

## 4. 输出

成功返回：

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

失败或降级返回：

```json
{
  "status": "failed",
  "error_code": "IMAGE_TOO_BLURRY",
  "message": "图片清晰度不足，请重新拍摄",
  "request_id": "req_xxx"
}
```

## 5. recognition_status 规则

- `identified`：可稳定映射到闭集 taxonomy
- `ambiguous`：识别范围收敛到少数候选，但不应自动确认
- `unknown`：无法稳定命中闭集，不得伪造名称

## 6. 稳定性策略

- 首版只支持 20 到 50 个常见家养绿植
- 统一使用 taxonomy catalog v1
- 低置信度必须降级，不能强行输出高置信结果
- 所有识别结果保留 `provider_metadata` 和 `prompt_version`
- 建档草稿必须先给用户确认，再由后端转为正式 `PlantProfile`

## 7. 错误码

- `IMAGE_TOO_BLURRY`
- `NO_PLANT_DETECTED`
- `MULTIPLE_PLANTS_DETECTED`
- `LOW_CONFIDENCE_MATCH`
- `PROVIDER_TIMEOUT`
- `PROVIDER_UNAVAILABLE`

## 8. 建议接口

### `POST /v1/plants/profile:analyze`

请求：首次识别植物并生成 `PlantProfileDraft`

### `POST /v1/plants/profile:confirm`

请求：用户确认草稿，正式创建 `PlantProfile`

## 9. 验收标准

- 用户未确认前不得直接建档
- 闭集外植物不得被高置信命中
- `ambiguous` / `unknown` 路径可用
- 结果结构稳定，可直接被 Team D 和前端消费
- contract tests 能覆盖成功、模糊、未知、失败四条主路径
