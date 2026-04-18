# Plant State Assessment Service Contract

## 1. 目标

Plant State Assessment Service 基于用户每日上传图片，对植物当前状态做基础、保守、低风险判断，并输出 `PlantStateAssessment`。

## 2. 职责边界

负责：

- 基于通用多模态模型识别基础状态信号
- 与历史 assessment 做前后对比
- 输出保守建议
- 不确定性过滤和安全约束

不负责：

- 物种识别
- 病虫害诊断
- 植物治疗方案生成
- 修改 `PlantProfile`

## 3. 输入

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

## 4. 输出

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

## 5. 信号白名单

首版仅允许以下信号：

- `slightly_wilted_leaves`
- `yellowing_tip`
- `leaf_droop`
- `new_growth_visible`
- `stable_appearance`
- `unknown`

## 6. 输出约束

- `overall_state` 仅允许：`stable | slightly_stressed | needs_attention`
- 低置信度时优先输出 `unknown` 或保守建议
- 不允许输出病虫害名称、根腐病、真菌感染等强诊断结论
- `escalation_flag` 只能表示需要更多关注，不能等同于医学或病理诊断

## 7. 稳定性策略

- 首版只做基础状态信号
- 通过 safety filter 拦截高风险和过度诊断性表述
- 所有输出保留模型和 prompt 版本元数据能力，便于后续审计
- compare-to-previous 只做 `better | same | worse | unknown` 四档保守比较

## 8. 错误码

- `STATE_ASSESSMENT_UNCERTAIN`
- `IMAGE_TOO_BLURRY`
- `NO_PLANT_DETECTED`
- `PROVIDER_TIMEOUT`
- `PROVIDER_UNAVAILABLE`

## 9. 建议接口

### `POST /v1/plants/state:assess`

请求：基于每日图片和历史状态记录生成 `PlantStateAssessment`

## 10. 验收标准

- 只输出批准的基础状态信号
- 不输出病虫害结论
- 低置信度时走保守路径
- 可与同一 `plant_id` 的 Daily Advice 和 Profile 关联
- contract tests 能覆盖稳定、轻微异常、不确定三类典型路径
