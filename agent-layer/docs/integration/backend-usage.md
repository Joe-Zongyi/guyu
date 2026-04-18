# PlantAgent 后端接入说明

本文档面向后端开发，描述如何把仓库内的 PlantAgent 核心库（`@guyu/plant-agent`）集成到后端 BFF 或微服务中。

> 本文档与 `docs/design/agent-handoff.md` 和 `docs/contracts/*.md` 配套使用。
> 协议层以 `docs/contracts/*.md` 为准；本文是落地层的使用说明。

## 1. 交付内容

- `src/` —— 核心库源码（TypeScript ESM，Node 20+）
- `dist/` —— `npm run build` 后的产物（CJS 不发布，仅 ESM）
- `bin/plant-agent` —— CLI，三个子命令各自吃一份 JSON 输入并输出 JSON 响应

后端可以选择：

- **直接 import**（同进程 / 同 monorepo / Node 后端）
- **fork 子进程跑 CLI**（任意语言后端，无需链接）
- **在它外面包一层 HTTP 服务**（仍未实现，详见 §7）

## 2. 安装与构建

```bash
# 在仓库根目录
npm install
npm run typecheck
npm test
npm run build      # 输出 dist/
```

如果要把它当作内部包用：

```bash
npm pack           # 生成 guyu-plant-agent-0.1.0.tgz
# 在后端项目里：
npm install /path/to/guyu-plant-agent-0.1.0.tgz
```

或者用 workspace / file: 协议直接引用源码目录。

## 3. 初始化 PlantAgent

```ts
import {
  PlantAgent,
  createVisionProviderFromEnv,
} from "@guyu/plant-agent";

// 默认不配 provider 时仍会回退到 fake
const agent = new PlantAgent({
  visionProvider: createVisionProviderFromEnv(process.env),
});
```

如果你需要自己解析图片来源（例如只有 `file_id`，需要换成签名 URL 或 base64），可以额外注入 `resolveImage`：

```ts
const agent2 = new PlantAgent({
  visionProvider: createVisionProviderFromEnv(process.env, {
    resolveImage: async (image) => {
      const signedUrl = await getSignedImageUrl(image.file_id);
      return {
        kind: "url",
        url: signedUrl,
        mimeType: image.content_type ?? "image/jpeg",
      };
    },
  }),
});
```

## 4. 三个能力的调用

所有方法都是 `async` 并且**永远不抛业务异常**，失败统一以 `status === "failed"` 返回。`request_id` 必须由后端透传。

### 4.1 `agent.analyzeProfile(input)`

对应 `POST /v1/plants/profile:analyze`。

```ts
const res = await agent.analyzeProfile({
  user_id: "user_xxx",
  image: {
    file_id: "file_xxx",            // 必填
    url: "https://...",             // 可选
    content_type: "image/jpeg",     // 可选
    captured_at: "2026-04-18T09:00:00Z",
  },
  region: "Shanghai",
  request_id: "req_xxx",            // 必填，后端生成
});

if (res.status === "needs_confirmation") {
  // 把 res.data (PlantProfileDraft) 落库为 draft，等用户确认
} else if (res.status === "failed") {
  // 用 res.error_code 决定 UI 文案 / 是否自动重试
}
```

**返回类型**：`needs_confirmation | failed`。
**绝不会**直接返回 `success`：建档草稿必须经用户确认才能转 `PlantProfile`。

### 4.2 `agent.generateDailyAdvice(input)`

对应 `POST /v1/plants/daily-advice:generate`。

```ts
const res = await agent.generateDailyAdvice({
  plant_id: "plant_xxx",
  profile: {
    taxonomy_id: "monstera_deliciosa",
    common_name: "龟背竹",
    care_baseline: { watering_rule: "...", light_rule: "..." },
    risk_flags: ["overwatering_sensitive"],
    weather_link_fields: { /* 可选；缺省按 medium 处理 */ },
  },
  today_context: {
    date: "2026-04-18",            // 必填
    season: "spring",              // 可选；缺省时按 date 月份推断
    weather_snapshot: {            // 可选；缺失时仍返回 success 并加 warning
      condition: "cloudy",
      temperature_c: 24,
      humidity: 68,
      light_level: "medium",
    },
    recent_care_events: [
      { type: "watered", occurred_at: "2026-04-17T10:30:00Z" },
    ],
  },
  request_id: "req_xxx",
});
```

**确定性保证**：相同输入 → 相同 `actions` / `derived_context`。可以按 `(plant_id, date)` 做缓存；不带随机性。

**降级**：`weather_snapshot` 缺失时仍返回 `success`，`warnings` 中会有 `今日天气数据缺失，已按通用基线生成保守建议`。

### 4.3 `agent.assessState(input)`

对应 `POST /v1/plants/state:assess`。

```ts
const res = await agent.assessState({
  plant_id: "plant_xxx",
  image: { file_id: "file_xxx", captured_at: "2026-04-18T09:00:00Z" },
  profile: { taxonomy_id: "monstera_deliciosa", common_name: "龟背竹" },
  recent_assessments: [
    {
      overall_state: "stable",
      signals: ["stable_appearance"],
      assessed_at: "2026-04-17T09:00:00Z",
    },
  ],
  request_id: "req_xxx",
});
```

**白名单**：`signals` 只可能是 `slightly_wilted_leaves | yellowing_tip | leaf_droop | new_growth_visible | stable_appearance | unknown`。
**保守路径**：低置信度只返回 `unknown`，不会编造诊断。
**`escalation_flag`**：仅当 `overall_state === needs_attention`，或 `slightly_stressed && compare_to_previous === worse` 时为 `true`。后端可据此推送通知，但不要等同于病理诊断。

## 5. 状态与错误码

所有响应都有以下 `status` 之一：

| status | 出现位置 | 后端处理建议 |
| --- | --- | --- |
| `success` | daily-advice / assess-state | 直接落库与展示 |
| `needs_confirmation` | analyze-profile | 落库为 draft，引导用户确认 |
| `failed` | 任意 | 按 `error_code` 决定 UI 文案 / 重试策略 |
| `needs_retry` | 预留 | 当前实现不主动返回 |

`error_code` 一览（来自 `docs/contracts/shared-schemas.md`）：

- `IMAGE_TOO_BLURRY` —— 图片质量门禁拦截，建议引导重拍
- `NO_PLANT_DETECTED` —— 未检出植物，引导重拍
- `MULTIPLE_PLANTS_DETECTED` —— 单株拍摄
- `LOW_CONFIDENCE_MATCH` —— 闭集置信度不足
- `WEATHER_UNAVAILABLE` —— 当前规则不会主动返回，weather 缺失走 success + warning
- `PROVIDER_TIMEOUT` / `PROVIDER_UNAVAILABLE` —— vision provider 失败，建议有限次重试 + 告警
- `STATE_ASSESSMENT_UNCERTAIN` —— 输入校验失败时由 assess-state 兜底

> 后端务必把原始 Agent 响应（含 `request_id` 和 `provider_metadata`）原样留存，便于审计与回放。

## 6. 替换为真实 vision-model

生产环境推荐直接使用库内置的 provider 工厂，而不是在业务层手写 SDK 装配：

```ts
import {
  createVisionProviderFromEnv,
  createVisionProvider,
} from "@guyu/plant-agent";

const fromEnv = createVisionProviderFromEnv(process.env);

const explicit = createVisionProvider({
  provider: "openai-compatible",
  apiKey: process.env.PLANT_AGENT_OPENAI_COMPATIBLE_API_KEY!,
  baseURL: process.env.PLANT_AGENT_OPENAI_COMPATIBLE_BASE_URL!,
  model: "gpt-4.1",
  timeoutMs: 15000,
});
```

支持的 provider：

- `fake`
- `claude`
- `gemini`
- `openai`
- `openai-compatible`

环境变量约定：

- `PLANT_AGENT_VISION_PROVIDER`
- `PLANT_AGENT_VISION_TIMEOUT_MS`
- `ANTHROPIC_API_KEY` / `ANTHROPIC_BASE_URL`
- `GOOGLE_API_KEY`
- `OPENAI_API_KEY` / `OPENAI_BASE_URL`
- `PLANT_AGENT_OPENAI_COMPATIBLE_API_KEY`
- `PLANT_AGENT_OPENAI_COMPATIBLE_BASE_URL`
- `PLANT_AGENT_CLAUDE_MODEL`
- `PLANT_AGENT_GEMINI_MODEL`
- `PLANT_AGENT_OPENAI_MODEL`
- `PLANT_AGENT_OPENAI_COMPATIBLE_MODEL`

注意：真实 provider 需要可访问图片内容。输入里如果没有 `image.url`，你必须通过 `resolveImage` 把 `file_id` 解析成 URL 或 base64 图片数据；仅有 `file_id` 不足以调用多模态 API。

当 `PLANT_AGENT_VISION_PROVIDER` 缺失或非法时，工厂会默认回退到 `fake` provider，方便本地联调和测试。

## 7. CLI 联调

不想在后端引入 Node 时，可以 fork 子进程跑 CLI：

```bash
# 文件输入
plant-agent analyze-profile --input ./req.json
plant-agent daily-advice    --input ./req.json
plant-agent assess-state    --input ./req.json

# 标准输入
cat req.json | plant-agent daily-advice --input -
```

行为：

- 输出严格 JSON 到 stdout（带缩进）
- `status === failed` 时进程 exit code = 1，便于运维监控
- 任何解析异常走 stderr，不污染 stdout

## 8. 字段透传 / 落库 checklist

后端建议保留以下字段原样存档（来自 `docs/design/agent-handoff.md` §5）：

- `request_id`、`profile_version`、`provider_metadata`
- 物种事实：`taxonomy_id`、`common_name`、`scientific_name`、`confidence`、`care_baseline`、`risk_flags`、`weather_link_fields`
- 每日建议：`actions`、`warnings`、`derived_context`、`today_summary`、`mood_copy`
- 状态评估：`overall_state`、`signals`、`suggestions`、`compare_to_previous`、`escalation_flag`

落库时建议：

1. `PlantProfileDraft` 与 `PlantProfile` 分两张表；`PlantProfile.created_from_draft_id` 指回草稿
2. `DailyAdvice` 按 `(plant_id, date)` 唯一，命中先返回缓存
3. `PlantStateAssessment` 按 `assessed_at` 时序追加，喂回 `recent_assessments` 供下次调用

## 9. 注意事项

- **不要**在后端再做一遍植物识别或状态推断 —— 物种事实唯一来源是 `analyze_profile`
- **不要**把 `mood_copy` 当作业务字段使用 —— 它只是文案补充
- **不要**用 LLM 自由文本去反推 `actions` —— 所有结构化结论都已经在 JSON 字段里
- **请**把 `weather_snapshot` 的获取放在后端做，agent 只接受快照，不主动调天气服务
- **请**在 vision provider 实现里做超时和重试的细节控制，agent 只做一次直调

## 10. 一句话总结

后端只需要：构造 JSON、调对应方法、按 `status` 分支处理、原样落库 `data` 与 `provider_metadata`。其它都不用做。
