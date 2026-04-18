# 后端升级说明 — Guyu（谷雨）

> 本文是**后端升级工作稿**：在保持与前端 `fe/` 和 agent-layer 契约一致的前提下，说明后端当前状态、为支持前端单株详情页所需的接口变更，以及推荐的实施顺序。
>
> - **文件位置：** `be/docs/UPGRADE.md`
> - **前端对齐：** [../../fe/docs/plan/UPGRADE.md](../../fe/docs/plan/UPGRADE.md)
> - **总体架构：** [plan/PLAN.md](plan/PLAN.md)
> - **Agent 契约：** [../../agent-layer/docs/agent-handoff.md](../../agent-layer/docs/agent-handoff.md)
> - **路径约定：** 以 `../../` 开头的路径相对本文件，指向仓库根。

---

## 目录

- [0. TL;DR](#0-tldr)
- [1. 后端当前状态](#1-后端当前状态)
- [2. 前端升级对后端的依赖分析](#2-前端升级对后端的依赖分析)
- [3. 必要的接口变更与新增](#3-必要的接口变更与新增)
- [4. 数据模型与持久化](#4-数据模型与持久化)
- [5. 后端优化建议](#5-后端优化建议)
- [6. 实施顺序（对齐前端）](#6-实施顺序对齐前端)
- [7. 参考文档](#7-参考文档)
- [8. 一句话总结](#8-一句话总结)

---

## 0. TL;DR

- **当前状态**：`be/` 目录为空，仅有文档规划，无任何实现代码。
- **目标**：实现产品后端，支持前端单株详情页的数据需求，包括：
  - 三条 Agent 能力路由（`profile:analyze`、`daily-advice:generate`、`state:assess`）
  - 植物档案、养护事件、评估与建议快照的持久化
  - 文件上传管理
  - 聚合接口（单株详情页聚合数据、视频推荐、相似创作者）
- **技术选型建议**：Node.js ≥20、TypeScript、**NestJS**（已安装 skill）、PostgreSQL（生产）、SQLite（开发）

---

## 1. 后端当前状态

| 方面 | 状态 |
|------|------|
| **项目初始化** | 无 `package.json``、无 TypeScript 配置、无源码目录 |
| **HTTP 服务** | 无实现 |
| **数据库** | 无 schema、无连接配置 |
| **依赖管理** | 未引用 `@guyu/plant-agent` |
| **文件上传** | 无实现 |
| **日志 / 观测** | 无实现 |
| **测试** | 无测试代码 |

> **结论**：后端从零开始，需要完整实现。

---

## 2. 前端升级对后端的依赖分析

根据 [前端 UPGRADE.md §3](../../fe/docs/plan/UPGRADE.md#3-区块--agent-字段绑定)，前端单株详情页需要以下后端支持：

### 2.1 前端区块 ↔ 后端接口映射

| 前端区块 | 需要的后端接口 | 数据来源 | 实现复杂度 |
|----------|--------------|---------|------------|
| **Hero** | `GET /v1/plants/:plantId`（详情）或 `POST /v1/plants/profile:analyze`（首次） | `PlantProfile` + `DailyAdvice`（标题） | 中 |
| **Plant Status** | `GET /v1/plants/:plantId/state:latest` 或包含在详情接口 | `PlantStateAssessment` | 低 |
| **Today Care** | `GET /v1/plants/:plantId/daily-advice:today` | `DailyAdvice` | 低 |
| **Life Rhythm** | `GET /v1/plants/:plantId/rhythm` | 后端聚合（打卡 + 历史评估） | 高 |
| **Video Recommendation** | `GET /v1/plants/:plantId/videos` 或 `GET /v1/videos?plantId=:id` | CMS / 推荐服务 | 低 |
| **Similar Creators** | `GET /v1/creators/similar?plantId=:id` | CMS / 推荐服务 | 低 |

### 2.2 前端升级驱动

前端 UPGRADE.md §6 建议的集成顺序：

1. ✅ **脚手架** → 前端已完成
2. → **视觉 tokens** → 纯前端，后端无需改动
3. → **组件骨架** → 前端使用 mock，后端可并行实现
4. → **单株详情路由** → 需要后端 `GET /v1/plants/:id` 接口
5. → **API 接入** → **关键依赖**：后端三条 Agent 路由必须可用
6. → **结构化渲染 + 降级** → 后端需支持 `warnings`、`status` 等字段透传
7. → **其他页面** → 识别、成长、视频列表需要对应后端接口

---

## 3. 必要的接口变更与新增

### 3.1 核心路由（必须）

与 [PLAN.md §2.2](plan/PLAN.md#22-agent-能力对应的三个核心路由) 一致：

| 方法 | 路径 | 请求体 | 响应体 | 前端用途 |
|------|------|--------|--------|---------|
| `POST` | `/v1/plants/profile:analyze` | `{ image_url, captured_at, region? }` | `PlantProfileDraft` Envelope | 首次识图，获取候选物种 |
| `POST` | `/v1/plants/profile:confirm` | `{ plant_profile_draft_id, confirmed: true }` | `PlantProfile` | 确认建档 |
| `POST` | `/v1/plants/daily-advice:generate` | `{ plant_id, date? }` | `DailyAdvice` Envelope | 今日养护建议 |
| `POST` | `/v1/plants/state:assess` | `{ plant_id, image_url }` | `PlantStateAssessment` Envelope | 植物状态评估 |

**响应格式约定：**

```json
{
  "request_id": "uuid-v4",
  "status": "success" | "needs_retry" | "failed",
  "data": { /* Agent 响应 */ },
  "warnings": [],
  "error": null
}
```

### 3.2 聚合接口（支持前端单株详情页）

为减少前端往返，提供聚合接口：

#### 3.2.1 单株详情聚合

**`GET /v1/plants/:plantId`**

响应示例：

```json
{
  "request_id": "uuid",
  "status": "success",
  "data": {
    "profile": {
      "id": "plant-uuid",
      "common_name": "龟背竹",
      "scientific_name": "Monstera deliciosa",
      "plant_type_tags": ["tropical", "broadleaf"],
      "created_at": "2026-04-01T00:00:00Z"
    },
    "daily_advice": {
      "status": "success",
      "today_summary": "今天适合检查光照和浇水状态",
      "actions": [
        {
          "type": "water_check",
          "priority": "high",
          "suggested_time": "morning",
          "reason": "土壤表面干燥"
        }
      ],
      "warnings": ["今天气温较高，避免暴晒"]
    },
    "latest_assessment": {
      "overall_state": "stable",
      "confidence": 0.92,
      "signals": [
        {
          "type": "leaf_condition",
          "value": "healthy",
          "description": "叶片色泽正常"
        }
      ]
    },
    "rhythm_summary": {
      "streak_days": 12,
      "last_care_event": {
        "type": "watered",
        "timestamp": "2026-04-17T08:30:00Z"
      },
      "stability_score": 0.85
    }
  }
}
```

#### 3.2.2 节律数据接口

**`GET /v1/plants/:plantId/rhythm?days=7`**

响应示例：

```json
{
  "request_id": "uuid",
  "data": {
    "streak_days": 12,
    "care_events": [
      {
        "type": "watered",
        "timestamp": "2026-04-17T08:30:00Z"
      },
      {
        "type": "fertilized",
        "timestamp": "2026-04-15T10:00:00Z"
      }
    ],
    "assessments": [
      {
        "overall_state": "stable",
        "timestamp": "2026-04-17T08:30:00Z"
      }
    ],
    "stability_trend": [0.8, 0.82, 0.85, 0.88, 0.87, 0.85, 0.86]
  }
}
```

### 3.3 文件上传接口

**`POST /v1/files/upload`**

支持前端上传植物图片，返回可由 Agent 消费的 `file_id` 或 `url`。

响应示例：

```json
{
  "request_id": "uuid",
  "status": "success",
  "data": {
    "file_id": "file-uuid",
    "url": "https://cdn.example.com/images/file-uuid.jpg",
    "expires_at": "2026-04-25T00:00:00Z"
  }
}
```

### 3.4 养护事件记录接口

**`POST /v1/plants/:plantId/care-events`**

用于记录用户执行养护操作（浇水、施肥等），支持节律统计。

请求示例：

```json
{
  "type": "watered",
  "timestamp": "2026-04-18T08:00:00Z",
  "notes": "早晨浇水"
}
```

### 3.5 CMS / 推荐接口（可先 mock）

**`GET /v1/videos?plantId=:id&limit=3`**

响应示例：

```json
{
  "request_id": "uuid",
  "data": [
    {
      "id": "video-1",
      "title": "龟背竹浇水节奏",
      "duration": 180,
      "thumbnail_url": "https://cdn.example.com/thumbs/video-1.jpg",
      "taxonomy_id": "monstera"
    }
  ]
}
```

**`GET /v1/creators/similar?plantId=:id&limit=4`**

响应示例：

```json
{
  "request_id": "uuid",
  "data": [
    {
      "id": "creator-1",
      "name": "园艺小王",
      "avatar_url": "https://cdn.example.com/avatars/creator-1.jpg",
      "tags": ["室内植物", "新手友好"]
    }
  ]
}
```

---

## 4. 数据模型与持久化

### 4.1 核心实体

| 表名 | 字段（核心） | 用途 |
|------|-------------|------|
| `plants` | `id, user_id, common_name, scientific_name, plant_type_tags[], taxonomy_id, created_at, updated_at` | 植物档案 |
| `care_events` | `id, plant_id, type (watered|fertilized|pruned|repotted), timestamp, notes` | 养护事件 |
| `plant_state_assessments` | `id, plant_id, overall_state, confidence, signals[], timestamp, image_url` | 状态评估快照 |
| `daily_advice_snapshots` | `id, plant_id, date, advice_json, warnings[], status, timestamp` | 每日建议快照 |
| `files` | `id, user_id, original_name, content_type, size, url, expires_at` | 文件管理 |

### 4.2 索引建议

- `plants(user_id, created_at)` - 用户植物列表
- `care_events(plant_id, timestamp DESC)` - 节律计算
- `plant_state_assessments(plant_id, timestamp DESC)` - 最新状态
- `daily_advice_snapshots(plant_id, date)` - 避免重复生成

### 4.3 开发 → 生产迁移

- **开发**：SQLite 或内存数据库，快速启动
- **生产**：PostgreSQL，支持高并发与复杂查询
- **迁移策略**：Prisma ORM 或 TypeORM，提供 schema 迁移能力

---

## 5. 后端优化建议

### 5.1 性能优化

| 优化点 | 当前问题 | 建议 |
|--------|---------|------|
| **Agent 调用缓存** | 每次请求都调用 PlantAgent | 相同输入（植物 + 日期）缓存 1h |
| **文件上传** | 未实现 | 使用 CDN 或对象存储（S3 / OSS） |
| **并发限制** | 未实现 | 对同一用户的并发 Agent 调用限流 |
| **响应压缩** | 未实现 | 启用 gzip / brotli 压缩 JSON 响应 |

### 5.2 可观测性

| 功能 | 建议 |
|------|------|
| **结构化日志**` | 使用 Winston / Pino，统一 `request_id`、`plant_id`、`ability` |
| **指标收集** | Prometheus / OpenTelemetry，记录 Agent 调用耗时、成功率 |
| **分布式追踪** | OpenTelemetry，追踪 HTTP → Agent 的全链路 |
| **健康检查** | `/health` 端点，检查数据库连接与 Agent 可用性 |

### 5.3 安全

| 方面 | 建议 |
|------|------|
| **鉴权** | 首版可占位，生产需 JWT 验证 `user_id` |
| **输入校验** | 使用 Zod 或 class-validator，校验请求体 |
| **速率限制** | 对上传和 Agent 调用端点限流 |
| **CORS** | 开发环境允许 `http://localhost:3000` |

### 5.4 错误处理与降级

| 场景 | 处理策略 |
|------|---------|
| **Agent 超时** | 返回 `503`，前端提示稍后重试 |
| **天气数据缺失** | 仍返回 `DailyAdvice`，在 `warnings` 中说明 |
| **低置信度识别** | 返回 `needs_confirmation`，前端展示候选列表 |
| **图片无法访问** | 返回 `400`，引导重新上传 |

---

## 6. 实施顺序（对齐前端）

| 阶段 | 后端步骤 | 对应前端阶段 | 验收标准 |
|------|---------|--------------|---------|
| **P0** | 初始化 NestJS 项目、配置 TypeScript、ESLint、Prettier | 前端脚手架 | `npm run dev` 可启动 |
| **P0** | 引入 `@guyu/plant-agent` 依赖 | — | 可 `import PlantAgent` |
| **P0** | 配置开发数据库（SQLite） | — | 数据库连接正常 |
| **P0** | 实现 `POST /v1/plants/profile:analyze` | 前端 API 接入 | 返回 `PlantProfileDraft` |
| **P0** | 实现 `POST /v1/plants/daily-advice:generate` | 前端 API 接入 | 返回 `DailyAdvice` |
| **P0** | 实现 `POST /v1/plants/state:assess` | 前端 API 接入 | 返回 `PlantStateAssessment` |
| **P0** | 实现 `/health` 端点 | — | 可健康检查 |
| **P1** | 实现 `POST /v1/plants/profile:confirm` | — | 可创建正式植物档案 |
| **P1** | 实现 `POST /v1/files/upload` | — | 可上传并获取 `file_id` |
| **P1** | 实现核心表 schema（plants, care_events） | — | 可持久化基础数据 |
| **P1** | 实现 `POST /v1/plants/:plantId/care-events` | — | 可记录养护事件 |
| **P1** | 实现 `GET /v1/plants/:plantId`（聚合接口） | 前端单株详情路由 | 返回完整页面数据 |
| **P2** | 实现 `GET /v1/plants/:plantId/rhythm` | 前端 Life Rhythm | 返回节律趋势 |
| **P2** | 实现 `GET /v1/videos`（可 mock） | 前端视频列表 | 返回推荐视频 |
| **P2** | 实现 `GET /v1/creators/similar`（可 mock） | 前端相似创作者 | 返回创作者列表 |
| **P2** | 配置生产数据库（PostgreSQL） | — | 生产环境可用 |
| **P2** | 配置结构化日志与指标 | — | 可观测 |

### 关键里程碑

| 里程碑 | 标准 |
|--------|------|
| **M1: Agent 对通** | 三条 Agent 路由可用，前端可调用 |
| **M2: 单株详情可展示** | `GET /v1/plants/:id` 返回完整数据 |
| **M3: 养护闭环** | 可上传 → 识别 → 确认 → 记录养护 → 评估 |
| **M4: 生产就绪** | PostgreSQL、对象存储、鉴权、观测就位 |

---

## 7. 参考文档

| 文档 | 路径 |
|------|------|
| 后端总体规划 | [plan/PLAN.md](plan/PLAN.md) |
| 前端升级 | [../../fe/docs/plan/UPGRADE.md](../../fe/docs/plan/UPGRADE.md) |
| Agent 对接 | [../../agent-layer/docs/agent-handoff.md](../../agent-layer/docs/agent-handoff.md) |
| 共享 schema | [../../agent-layer/docs/contracts/shared-schemas.md](../../agent-layer/docs/contracts/shared-schemas.md) |
| 产品 PRD | [../../docs/plans/2026-04-18-guyu-prd.md](../../docs/plans/2026-04-18-guyu-prd.md) |

---

## 8. 一句话总结

**后端当前为空，需要从零实现 NestJS 服务，优先实现三条 Agent 路由支持前端 API 接入，逐步补充持久化、文件上传、聚合接口和 CMS 推荐，最终实现完整的产品后端能力。**
