# 前后端连接与性能优化计划

## 目标
连接前端 3D 成长页面与后端 agent-layer，实现：
1. 照相上传 → 后端处理 → Agent 调用 (植物识别 + 状态评估) → 3D 模型
2. 时间线拖动时的并行性能优化 (< 100ms)

---

## 架构分析

### 当前组件
| 组件 | 位置 | 功能 | 状态 |
|------|------|------|------|
| be 后端 | `be/` (NestJS) | 已集成 `@guyu/plant-agent` | ✅ 已连接 |
| 前端 3D 页面 | `web/src/features/three-d-growth/` | 上传图片、时间线、模型渲染 | ✅ 存在 |
| 前端 API 路由 | `web/app/api/three-d-growth/` | 处理上传和建模请求 | ✅ 存在 |
| 3D 业务逻辑 | `web/src/server/three-d-growth/` | Hunyuan 3D API | ✅ 存在 |

### 需要连接的部分
- 前端 API 路由 → be 后端 agent-layer (HTTP API 调用)
- 上传图片后调用植物分析/状态评估
- 时间线性能优化

---

## 实现步骤

### 第一阶段：连接前端 API 与 be 后端 Agent

#### 1.1 创建 Agent Bridge
新建 `web/src/server/agent-bridge.ts`：
```typescript
// 通过 HTTP 调用 be 后端的 Agent 能力
// be 后端暴露：POST /v1/plants/profile/analyze, POST /v1/plants/state/assess
```

#### 1.2 修改上传 API
修改 `web/app/api/three-d-growth/captures/route.ts`：
- 上传图片后，并行调用 be 后端 Agent 分析
- 将分析结果存入 capture record

### 第二阶段：工作流串联

#### 完整工作流 (并行优化)
```
用户上传照片
    ↓
POST /api/three-d-growth/captures (保存图片)
    ↓┌─ 植物识别 (analyzeProfile) ─并行─┐
    ├─ 状态评估 (assessState)          │
    └───────────────────────────────────┘
    ↓
POST /api/three-d-growth/models (发起 3D 建模)
    ↓
前端轮询 GET /api/three-d-growth (获取状态)
    ↓
3D 模型就绪 → 前端渲染
```

### 第三阶段：时间线性能优化

#### 3.1 模型预加载 (Promise.all 并行)
```typescript
// 使用 Promise.all 并行预加载相邻模型
async function preloadAdjacentModels(currentIndex: number) {
  const prev = models[currentIndex - 1];
  const next = models[currentIndex + 1];
  await Promise.all([
    prev?.modelUrl ? loadModel(prev.modelUrl) : Promise.resolve(),
    next?.modelUrl ? loadModel(next.modelUrl) : Promise.resolve(),
  ]);
}
```

#### 3.2 requestAnimationFrame 批量更新
```typescript
const pendingUpdates = new Map<string, ModelState>();
function queueModelUpdate(modelId: string, state: ModelState) {
  pendingUpdates.set(modelId, state);
  requestAnimationFrame(() => flushUpdates());
}
```

#### 3.3 Intersection Observer 懒加载
- 预加载可见区域内的模型
- 卸载不可见区域的模型

---

## 关键文件修改

| 文件 | 操作 |
|------|------|
| `web/src/server/agent-bridge.ts` | 新建 - 连接 be 后端 Agent API |
| `web/app/api/three-d-growth/captures/route.ts` | 修改 - 调用 Agent 分析 |
| `web/src/features/three-d-growth/types.ts` | 修改 - 添加 agent 分析结果字段 |
| `web/src/features/three-d-growth/api/client.ts` | 添加并行预加载方法 |
| `web/src/features/three-d-growth/components/three-d-growth-page.tsx` | 优化渲染 |
| `web/src/server/three-d-growth/storage.ts` | 添加模型缓存 |

---

## 验证方式

1. **功能测试**:
   - `curl` 上传图片，验证 Agent 分析结果返回
   - 检查 3D 模型生成完成

2. **性能测试**:
   - Chrome DevTools 测量时间线拖动延迟 < 100ms
   - 验证模型预加载生效

3. **并行测试**:
   - 同时上传多张图片，验证并行处理
