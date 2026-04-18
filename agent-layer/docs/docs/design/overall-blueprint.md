# Guyu 植物智能体总体蓝图

## 1. 背景

Guyu 当前仓库只有产品文档 `docs/plans/2026-04-18-guyu-prd.md`，还没有实现代码、接口、数据结构和测试样例。
因此第一阶段目标不是直接写模块代码，而是先把植物智能体的整体蓝图、模块边界、固定契约和团队分工固化为正式文档，作为后续并行开发的设计基线。

本蓝图覆盖三类核心能力：

1. 首图识别并生成结构化植物档案草稿
2. 基于植物档案、天气和历史记录生成每日建议
3. 基于每日图片做基础状态判断

## 2. 已确认约束

- 主识别链路使用通用多模态大模型 API，如 ChatGPT API
- 首版只覆盖常见家养绿植闭集，不做开放世界植物识别
- 允许公网部署，可接入外部 SaaS 或云 API
- 状态判断首版只做基础信号，不做病虫害或复杂诊断
- 建档必须先返回 `PlantProfileDraft`，经用户确认后才正式入库
- 植物识别与状态判断统一通过 `vision-model adapter` 接入多模态模型

## 3. 核心架构原则

- 不做开放式自治 Agent，而做确定性工作流系统
- 植物物种事实只能由建档识别模块产出
- 每日建议模块和状态判断模块只能消费事实，不能重新定义植物品种
- 规则优先于生成，LLM 只参与文案层，不进入关键决策闭环
- 所有模块都必须可降级、可审计、可回放、可版本化

## 4. 总体架构

整体结构采用：`BFF / API 层 + 三个领域模块 + 共享平台能力`

### 4.1 App-facing API / BFF

前端统一通过一层 BFF 调用后端能力，负责：

- 图片上传
- 调用建档识别
- 调用每日建议
- 调用状态判断
- 组织建档确认流
- 统一鉴权、日志、错误码和 request_id

### 4.2 三个领域模块

#### 模块 A：Plant Profile Service

职责：把首次上传图片转成结构化植物档案草稿 `PlantProfileDraft`。

#### 模块 B：Daily Advice Service

职责：基于正式 `PlantProfile`、天气、日期和历史行为产出 `DailyAdvice`。

#### 模块 C：Plant State Assessment Service

职责：基于每日图片和历史记录产出 `PlantStateAssessment`。

### 4.3 共享平台能力

- 图片存储与文件 ID 管理
- `vision-model adapter`
- weather adapter
- taxonomy / plant profile catalog
- care history 数据模型
- observability：日志、trace、指标
- contract/schema package

## 5. 模块边界

### 5.1 Plant Profile Service

目标：首次识别植物，生成可确认、可入库的档案草稿。

输入：

- `image_url` 或 `file_id`
- `user_id`
- `captured_at`
- 可选 `region` / `location`

输出：`PlantProfileDraft`

边界：

- 只有本模块可以定义植物物种相关 canonical facts
- 识别结果必须经过 taxonomy 映射后输出
- 用户未确认前不得写入正式植物档案

稳定性要求：

- 只识别 20 到 50 个常见家养绿植
- 中置信度输出候选列表
- 低置信度输出 `unknown`
- 不允许对白名单外植物高自信命中

### 5.2 Daily Advice Service

目标：告诉用户今天该做什么，并生成一条简短陪伴文案。

输入：

- `plant_id`
- `PlantProfile`
- `TodayContext`

输出：`DailyAdvice`

边界：

- 不重新识别植物
- 不修改 `PlantProfile`
- 主建议来自规则引擎，文案单独生成

稳定性要求：

- 相同输入必须产出相同主建议
- 天气缺失时必须降级为通用建议
- `mood_copy` 不能影响核心动作结论

### 5.3 Plant State Assessment Service

目标：基于每日图片做基础、保守、低风险状态判断。

输入：

- `plant_id`
- `image_url`
- `PlantProfile`
- `recent_assessments`

输出：`PlantStateAssessment`

边界：

- 不负责物种识别
- 不负责病虫害诊断
- 不输出高风险诊断性结论

稳定性要求：

- 首版仅支持 5 到 8 个基础状态信号
- 低置信度时返回继续观察建议
- 不允许直接输出病害名称或治疗结论

## 6. 团队并行分工

### Team 0：Platform & Contracts

负责：

- 冻结 schema、枚举、错误码、版本号
- 定义 taxonomy / plant profile catalog v1
- 定义多模态模型 adapter interface
- 提供 mock server、fake model responses、contract tests
- 建 observability 规范

交付物：

- schema 文档
- mock fixtures
- taxonomy v1
- contract test baseline

### Team A：Plant Profile

负责：

- 图片质量门禁
- 多模态模型接入
- taxonomy 映射
- 候选项与低置信度处理
- `PlantProfileDraft` 生成
- 建档确认流契约

### Team B：Daily Advice

负责：

- weather adapter 接入
- 日期、季节、历史记录融合
- 今日动作规则引擎
- 风险提醒逻辑
- mood copy 模板

### Team C：State Assessment

负责：

- 状态信号白名单
- 基于多模态模型的状态分析 pipeline
- 前后对比逻辑
- 保守建议模板
- uncertainty / safety filter

### Team D：App/API & Data

负责：

- 上传接口
- 植物档案、历史记录、assessment 表设计
- `PlantProfileDraft -> PlantProfile` 确认入库流
- app-facing API 整合
- 端到端联调与审计链路

## 7. 必须先冻结的 v1 契约

- 三个核心 schema：`PlantProfileDraft`、`DailyAdvice`、`PlantStateAssessment`
- 统一状态枚举与错误码
- taxonomy 字段命名
- 图片 ID / 文件引用方式
- weather snapshot 格式
- care history 最小字段集

建议的核心接口：

- `POST /v1/plants/profile:analyze`
- `POST /v1/plants/profile:confirm`
- `POST /v1/plants/daily-advice:generate`
- `POST /v1/plants/state:assess`

## 8. 主要风险

1. Contract churn：schema 频繁变动导致各组阻塞
2. Model drift：多模态模型版本或提示词调整后结果漂移
3. Taxonomy ambiguity：植物别名和近似种映射不稳
4. State overreach：状态模块能力边界失控，开始输出不可靠诊断
5. Data pollution：未确认建档或高置信误识别导致脏数据入库

## 9. 推荐落地顺序

1. 先把总体蓝图与 contracts 落成仓库文档
2. Team 0 冻结 schema / taxonomy / mocks
3. Team D 搭上传、存储、确认入库和 API 骨架
4. Team A / B / C 同时基于 mocks 开发
5. 优先完成模块 A，固定 canonical profile contract
6. Team D 接入 live modules 做端到端联调
7. 最后再做模型调用 fallback、趋势分析和更自然文案

## 10. 文档清单

本蓝图对应以下仓库文档：

- `docs/design/overall-blueprint.md`
- `docs/contracts/shared-schemas.md`
- `docs/contracts/plant-profile-service.md`
- `docs/contracts/daily-advice-service.md`
- `docs/contracts/state-assessment-service.md`

## 11. 验证标准

### 文档层验证

- 蓝图是否明确模块边界、团队边界、接口边界
- 三个核心 schema 是否足够支撑 A/B/C/D 并行开发
- 失败路径是否已经枚举

### 实现前验证

- Team A / B / C 是否能仅凭 contracts 和 mocks 开工
- Team D 是否能先做 API 骨架和数据模型而不等待所有模块完成
- 各团队对字段命名是否一致

### 端到端目标

- 首张图片上传后能返回 `PlantProfileDraft`
- 用户确认后能生成正式 `PlantProfile`
- 基于正式档案能生成 `DailyAdvice`
- 用户上传每日图片后能生成 `PlantStateAssessment`
- 全链路具备 request_id、日志、fallback 状态和可观测指标
