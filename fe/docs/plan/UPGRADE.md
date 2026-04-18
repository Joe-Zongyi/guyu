# 前端升级说明 — Guyu（谷雨）

> 本文是**前端工作稿**：在保持 PRD 与契约不变的前提下，说明现网实现、设计稿目标，以及把设计稿各区块**绑定到 Agent JSON 字段**的方式。可选的研究向增强集中在末尾，不作为主路径。

- **文件位置：** `fe/docs/plan/UPGRADE.md`
- **配套视觉稿：** [../assets/20260418-161123-design.png](../assets/20260418-161123-design.png)（单株详情向高保真）
- **字段依据：** [agent-handoff.md](../../../agent-layer/docs/agent-handoff.md) + [agent-layer/docs/contracts/](../../../agent-layer/docs/contracts/)
- **路径约定：** 以 `../../../` 开头的路径相对本文件，指向仓库根。

---

## 目录

- [0. TL;DR](#0-tldr)
- [1. fe/ 目录与当前实现](#1-fe-目录与当前实现)
- [2. 高保真视觉稿解读](#2-高保真视觉稿解读)
- [3. 区块 ↔ Agent 字段绑定](#3-区块--agent-字段绑定)
- [4. 设计令牌（tokens）建议](#4-设计令牌tokens建议)
- [5. PRD 对齐的前端基线](#5-prd-对齐的前端基线)
- [6. 建议集成顺序](#6-建议集成顺序)
- [7. 可选研究向增强（仅叠加）](#7-可选研究向增强仅叠加)
- [8. 参考文档](#8-参考文档)
- [9. 一句话总结](#9-一句话总结)

---

## 0. TL;DR

- **现状**：`fe/web/` 只有 `/` 单路由、**静态 mock**「薄荷首页」，**未**接后端、**未**消费 `actions` / `warnings` 等字段。
- **目标**：按 [设计稿](../assets/20260418-161123-design.png) 落地**单株详情向**首页（深绿单色、圆角大卡、英文区块标题 + 中文正文），并用 `DailyAdvice`、`PlantStateAssessment`、`PlantProfile` 真实驱动 UI。
- **纪律**：结构化字段优先于自由文本；`actions` 驱动行动区，`today_summary` 仅作摘要，`warnings` 仅作轻提示；低置信度一律走降级态（详见 handoff §3 / §6）。

---

## 1. `fe/` 目录与当前实现

### 1.1 目录

| 路径 | 作用 |
|------|------|
| **`fe/web/`** | Next.js **15.3.x**（App Router）、React **19**、Tailwind **3**、TypeScript。脚本：`npm run dev` / `build` / `lint`。 |
| **`fe/docs/plan/`** | 前端规划文档（含本文件）。 |
| **`fe/docs/assets/`** | 设计资产（当前含高保真 PNG）。 |

> `fe/` 内**不存在** `fe/docs/plans/` 的 PRD 副本，也**不存在** `agent-handoff.md` / `contracts/` 副本。PRD 在 `docs/plans/`、对接与契约在 `agent-layer/docs/`。

### 1.2 当前实现快照（`fe/web/`）

| 方面 | 状态 |
|------|------|
| **应用结构** | `app/layout.tsx`（元数据「谷雨 Guyu」、`lang="zh-CN"`）、`app/page.tsx`、`app/globals.css`；默认 Geist 字体。 |
| **路由 / 页面** | 仅 `/`。尚无 `/identify`、`/growth`、`/video` 等。 |
| **后端 / API** | **未**引入 HTTP 客户端，**未**调用 `be/` 或产品 API；页面为页内静态 mock。 |
| **Handoff 字段** | **未**消费 `actions` / `warnings` / `recognition_status` 等。 |
| **UI 与设计稿关系** | 现网为**薄荷线框占位**（问候 + 连续打卡 + 四宫格 + 进度条），**未**还原高保真稿的单株详情 IA、色板与模块。 |
| **3D / 成长 / 视频** | 无 Three.js / WebGL / 时间轴 / 视频模块；`package.json` 无 L-system、shader、Tone.js 相关依赖。 |
| **包体 / 离线** | 普通 Next.js Web 应用，**不**采用研究文档「纯离线、包体 8MB 以内」约束。 |

> **结论：** 仅「1.2」表反映**已提交代码**；第 2~5 节均为**目标 / 设计**，第 7 节为**可选**。

---

## 2. 高保真视觉稿解读

[20260418-161123-design.png](../assets/20260418-161123-design.png) 为 **移动端竖屏、深绿单色系** 的**单株详情主页**（示例物种：**龟背竹 Monstera**）。核心特征：**英文区块标题 + 中文正文**、**大圆角卡片**、**块状像素风插画**、**陪伴向**文案（非诊断）。

### 2.1 区块清单（自上而下）

| # | 区块 | 可视要点 | 组件建议 |
|---|------|---------|----------|
| 1 | **Hero / 头图** | 深绿底、植物名（中英双行）、副标题（如「春季养护进行中」）、右上太阳徽、像素风盆栽插画、主 CTA「立即打卡」 | `PlantHero`（标题区 + 插画槽 + `PrimaryCTA`） |
| 2 | **Plant Status**（左） | 区块名「Plant Status」、主状态词（如「舒展」）、`今日状态` 小标签 + 说明、两个徽章（生长阶段 / 叶片状态） | `StatusCard` + `TagChip` |
| 3 | **Today Care**（右） | 区块名「Today Care」、主行动词（如「补光」）+ 主句「上午窗边 20 min」+ 「今天最值得先做」、副行动「补水 2 天后」、提示 pill「避免暴晒」「湿度舒服」 | `TodayCareCard`（`ActionPrimary` + `ActionSecondary[]` + `HintPill[]`） |
| 4 | **Life Rhythm** | 标签「这周很稳」、环形进度（节律稳定 / 本周养护感受）、波形折线、`陪伴第 N 天` / `上次浇水 X` 统计、高亮洞察条 + 一句总结 | `RhythmRing` + `RhythmSparkline` + `StatPair` + `InsightBar` |
| 5 | **Video Recommendation** | 区块名、方形缩略图、标题（如「龟背竹浇水节奏」）+ 时长 / 标签、「观看」按钮 | `VideoCard` |
| 6 | **Similar Creators** | 两行创作者项：头像 + 昵称 + 标签、「查看」按钮 | `CreatorRow` |

### 2.2 视觉共性

- **色板**：以 **深绿** 为底（Hero、Rhythm、Video、Creators），**浅绿** 为双列状态卡，文字以白 / 浅薄荷灰为主。
- **圆角**：容器 **24–32px**，按钮 / pill **full-round**。
- **版式**：区块标题用小号英文全大写 / 首字大写；正文中文、数字与关键名词加粗。
- **插画**：**块状像素风**（非写实 3D）；Hero 中日照与植物分层。

---

## 3. 区块 ↔ Agent 字段绑定

> 字段名严格按 [agent-handoff.md](../../../agent-layer/docs/agent-handoff.md) §3。前端**不**直接调用 PlantAgent，而是消费后端三个产品接口的响应。

### 3.1 对应接口

| 区块 | 后端接口 | Agent 能力 | 顶层契约 |
|------|---------|-----------|----------|
| Hero、Similar Plants | `POST /v1/plants/profile:analyze`（首次）；后续读取已建档的 `PlantProfile` | `analyze_profile` | `PlantProfile` / `PlantProfileDraft` |
| Plant Status | `POST /v1/plants/state:assess` | `assess_state` | `PlantStateAssessment` |
| Today Care、Hero 副标题 | `POST /v1/plants/daily-advice:generate` | `generate_daily_advice` | `DailyAdvice` |
| Life Rhythm 的数值 | 后端聚合（打卡 / `recent_care_events` / 历次 `assess_state`） | —（非 Agent） | 后端产品数据 |
| Video / Creators | 后端 CMS / 推荐（非 Agent） | —（非 Agent） | 产品 API |

### 3.2 字段映射

| UI 元素 | 来源字段 | 消费规则 |
|---------|---------|---------|
| Hero 标题 | `PlantProfile.common_name` + `scientific_name` | 若为 `PlantProfileDraft` 且 `recognition_status = ambiguous`，标题显示「待确认」并展示 `candidates`；`unknown` 时不得伪装成已识别。 |
| Hero 副标题 | `DailyAdvice.mood_copy` 或 `today_summary`（取短者） | `mood_copy` 仅文案，不得驱动交互。 |
| Plant Status 主状态词 | `PlantStateAssessment.overall_state` → 文案映射（`stable` / `slightly_stressed` / `needs_attention`） | `unknown` 或低 `confidence` 降级为「继续观察」。 |
| Plant Status 描述 | `signals[]` + `suggestions[]` 的**前 1~2 条** | 不拼接诊断式语句；不得输出病虫害 / 根腐等结论。 |
| Plant Status 徽章 | 生长阶段：`PlantProfile.plant_type_tags` + 季节上下文；叶片状态：映射 `signals`（如 `stable_appearance` → 稳定） | 白名单映射；未知一律显示「观察中」。 |
| Today Care 主行动 | `DailyAdvice.actions[]` 中 `priority = high`，其次 `medium` 的第 1 条 | 主行动字段：`type`（映射图标/动词）、`suggested_time`（映射时段）、`reason`（副句）。 |
| Today Care 副行动 | 其余 `actions[]`（如 `water_check` 的倒计时取自 `recent_care_events` 或 `derived_context.watering_pressure`） | 倒计时**不**从 `today_summary` 里解析。 |
| Today Care 提示 pill | `DailyAdvice.warnings[]` + `derived_context`（如 `light_pressure = high` → 「避免暴晒」） | `warnings` 为轻提示、非错误；天气缺失时按 handoff §6 做保守提示。 |
| Life Rhythm 环形 / 折线 | 后端聚合：连续打卡天数、历次 `compare_to_previous` 序列 | Agent 不负责趋势计算。 |
| Life Rhythm 统计 | 陪伴天数（`plant.created_at`）、上次浇水（最近 `CareEvent.type = watered`） | 纯产品数据。 |
| Life Rhythm 洞察条 + 总结 | `DailyAdvice.mood_copy` 或服务端生成的周总结文案 | 陪伴式语气；**不**做惩罚。 |
| Video / Creators | 产品 API | 与 Agent 解耦。 |

### 3.3 状态位与降级

| 场景 | 显示策略 |
|------|---------|
| `DailyAdvice.status = success` 但 `warnings` 非空 | Hero 正常；Today Care 首个 pill 显示 warning。 |
| `DailyAdvice.status = needs_retry` / `failed` | Today Care 空态：「今天暂无建议，稍后再试」；不阻断 Hero 与 Life Rhythm。 |
| `PlantStateAssessment.overall_state = needs_attention` + `escalation_flag = true` | Plant Status 用强调色，文案「建议补充一张清晰图片」；**不**升级为诊断。 |
| 低 `confidence`（assess）/ `ambiguous`（profile） | 走「继续观察 / 待确认」文案；隐藏高确定性徽章。 |

---

## 4. 设计令牌（tokens）建议

> 非设计规范正本，仅为从 PNG 观察到的**工程落地参考值**；建议在 Tailwind theme 或 CSS variables 中集中管理。

| Token | 建议值（近似） | 用途 |
|-------|---------------|------|
| `color.bg.app` | 深绿 `#2f4a3a` 系 | 页面底色 / Hero |
| `color.bg.card.elevated` | 中绿 `#3d5a48` 系 | Rhythm / Video / Creators |
| `color.bg.card.soft` | 浅绿 `#bed3b8` 系 | Plant Status / Today Care 双列卡 |
| `color.fg.primary` | 近白 `#f4f6ef` | 深底正文 |
| `color.fg.muted` | 浅薄荷灰 | 辅助文字 / 区块英文标题 |
| `color.accent.sun` | 暖黄 `#f2d261` 系 | Hero 日照徽 / 正向高亮 |
| `radius.card` | `24–32px` | 所有卡片 |
| `radius.pill` | `full` | 按钮 / 标签 / 徽章 |
| `spacing.card` | 外边距 `16px` / 内边距 `16–20px` | 卡片间距 |
| `typography.sectionLabel` | 英文、12–13px、字重 500 | Plant Status / Today Care / Life Rhythm / Video Recommendation / Similar Creators 区块名 |
| `typography.title` | 中文、20–24px、字重 600 | 区块主状态词 / 主行动 |
| `motion.wind` | 低幅正弦 + 低频噪声 | Hero 插画可选微动（非必须） |

---

## 5. PRD 对齐的前端基线

对齐 [docs/plans/2026-04-18-guyu-prd.md](../../../docs/plans/2026-04-18-guyu-prd.md) §4.1 与 §3。

| 方面 | 范围 |
|------|------|
| **页面** | 首页（本次设计稿所覆盖的**单株详情**属于首页/详情的组合；另需识别、成长、视频列表）。 |
| **数据** | 统一走后端 HTTP API；客户端不直连 PlantAgent；结构化字段映射见 §3。 |
| **消费规则** | `actions` 驱动主行动；`warnings` 作为提示；`ambiguous` / `unknown` 走候选 / 待确认态；低置信度走保守文案。 |
| **3D / 成长** | MVP 可选：单株 3D / 伪 3D / 时间轴 + 轻量 3D；不稳定时退化为图片或静态插画（本设计稿即为像素风静态插画方案）。 |

---

## 6. 建议集成顺序

> 表情：✅ 完成 / ⏳ 进行中 / → 下一步。

- ✅ **0. 脚手架**：`fe/web` Next.js + Tailwind（已有）。
- → **1. 视觉 tokens**：把 §4 token 落到 Tailwind theme 或 CSS variables。  
  *为什么：避免后续每个组件重复硬编码颜色与圆角。*
- → **2. 组件骨架**：按 §2.1 拆 `PlantHero` / `StatusCard` / `TodayCareCard` / `RhythmRing` / `RhythmSparkline` / `VideoCard` / `CreatorRow`；先用 mock props。  
  *为什么：先稳定接口形状，后续替换数据源无需改 UI。*
- → **3. 单株详情路由**：新增 `/plants/[id]` 渲染上述组件；首页 `/` 暂保留或改为列表。  
  *为什么：匹配设计稿的信息架构（单株聚焦）。*
- → **4. API 接入**：按 §3.1 对接三条产品接口，封装 fetcher（加载 / 空态 / 错误态），替换组件 mock。  
  *为什么：字段结构先对齐，再谈视觉细节。*
- → **5. 结构化渲染 + 降级**：严格按 §3.2 / §3.3 消费字段；补 `ambiguous` / `needs_retry` / 低置信度分支。  
  *为什么：handoff 的核心纪律是「不从自由文本反推业务」。*
- → **6. 其他页面**：识别、成长、视频列表按同套 tokens 扩展。
- → **7. 可选增强**：§7 项，feature flag 或独立路由。

---

## 7. 可选研究向增强（仅叠加）

> 来自 `docs/research/谷雨项目优化方案.md`。**必须**用 feature flag 或独立路由，**不得**替代识别 → 养护 → 日历主流程；当前设计稿以**静态像素风插画 + 节律图**即可，**不**强制引入 3D。

- **7.1 L-system + 种子**：稳定字符串 → seed → 分枝拓扑 → mesh，作为成长页 / 数字孪生的**程序化替身**；不替代物种识别。
- **7.2 风场（GPU）**：顶点着色器用 `uTime` + 低频噪声 / 正弦合成，根部固定、冠层摇曳；Hero 插画的微动也可走廉价版（CSS 变换）。
- **7.3 情绪向文案**：`mood_copy` 与树洞 / 谷雨节气 / 工位隐喻对齐；**不做**惩罚式交互，与 `assess_state` 保守路径一致。
- **7.4 吉卜力向美术**：阶梯卡通着色（`smoothstep` 分段）、球面法线偏置、`InstancedMesh` / `mergeGeometries`。
- **7.5 环境音**：滤波噪声 + 慢 LFO + 五声音阶 / 安全音阶，Tone.js 或 Web Audio；受自动播放策略与包体约束。
- **7.6 性能清单（移动 WebView）**：`pixelRatio = min(devicePixelRatio, 2)`；`frustumCulled` + 合理 LOD；重建前 `dispose` 材质 / 几何体；优先 `mergeGeometries` / `InstancedMesh`。

> **边界**：研究文档面向纯离线抖音小游戏（无 `fetch` / WebSocket、包体 8MB 以内），**主应用不采用**该约束。

---

## 8. 参考文档

| 文档 | 作用 |
|------|------|
| [20260418-161123-design.png](../assets/20260418-161123-design.png) | 单株详情向高保真视觉稿 |
| [2026-04-18-guyu-prd.md](../../../docs/plans/2026-04-18-guyu-prd.md) | 页面清单与产品范围 |
| [2026-04-18-guyu-prd-research-alignment.md](../../../docs/plans/2026-04-18-guyu-prd-research-alignment.md) | PRD 与研究文档对照 |
| [agent-handoff.md](../../../agent-layer/docs/agent-handoff.md) | Agent JSON 行为、字段与 UI 规则 |
| [agent-layer/docs/contracts/](../../../agent-layer/docs/contracts/) | 稳定字段形态（profile / assessment / shared）；daily-advice 契约另见 `agent-layer/docs/docs/contracts/` |
| [谷雨项目优化方案.md](../../../docs/research/谷雨项目优化方案.md) | 离线黑客松深挖（可选技术点） |

---

## 9. 一句话总结

**`fe/web/` 当前是单页薄荷低保真首页，未对齐任何字段**；下一步按设计稿的**单株详情 IA**拆组件并接三条 Agent 产品接口（`profile:analyze` / `daily-advice:generate` / `state:assess`），**用 `actions`、`warnings`、`overall_state` 等结构化字段驱动 UI**，研究向增强统一降级为可选分层。
