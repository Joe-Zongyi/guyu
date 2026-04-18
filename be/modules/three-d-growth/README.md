# Three-D Growth Backend Module

## 目标

为前端 `growth-3d` 页面提供独立的 3D 成长记录与建模接口。

当前项目中，这个模块的运行时 mock API 先落在 `web/app/api/three-d-growth`，方便前端直接联调；
后续如果后端服务正式接管，这里的模块就是迁移目标。

## 当前前后端边界

### 前端模块

- `web/src/features/three-d-growth`

### 当前服务端实现

- `web/app/api/three-d-growth`
- `web/src/server/three-d-growth`

### 未来正式后端模块建议归位

- `be/modules/three-d-growth`

---

## 建议接口

### `GET /api/three-d-growth`

读取当前植物的 3D 成长时间线快照。

返回内容包括：

- 植物基础信息
- 图片记录列表
- 模型生成记录列表
- 当前激活模型

### `POST /api/three-d-growth/captures`

上传一张新的植物记录图。

输入：

- `plantId`
- `title`
- `angle`
- `note`
- `image`

输出：

- 新增的 `capture` 记录

### `POST /api/three-d-growth/models`

发起一轮新的 3D 建模任务。

输入：

- `plantId`
- `sourceCaptureIds`

输出：

- `modelId`

---

## 数据模型

核心对象与前端共享语义：

- `CaptureRecord`
- `GeneratedModel`
- `ThreeDGrowthModuleState`

后续建议把这些 contract 统一沉淀到独立共享包或 `agent-layer` 相邻的 shared contracts 中。

---

## 与混元 3D 的集成建议

当前仓库已有实验原型：

- `experiments/hunyuan-3d/ui/hunyuan-3d-console.html`
- `experiments/hunyuan-3d/tools/hunyuan_console_server.py`

后续正式接入时，推荐做法：

1. 保留当前前端时间线页面不变
2. 将 `web/src/server/three-d-growth` 中的 mock 生成逻辑抽象成 provider
3. 新增 `hunyuan` provider，复用实验中已有的：
   - 多图上传
   - 任务提交
   - 状态轮询
   - 结果下载
4. 把真实 GLB/GLTF 地址写回 `GeneratedModel.modelUrl`
5. 前端展示层再从“伪 3D 舞台”切换为真实模型 viewer

---

## 当前状态

当前模块已经具备：

- 独立前端 feature
- 独立 API 路由
- 独立 server storage
- 可持续追加记录
- 可持续创建建模批次
- 时间线式展示

因此后续开发重点只需要放在：

- 真正的 3D 生成 provider 接入
- 真实模型展示
- 用户多植物数据隔离
