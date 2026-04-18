# Guyu Plant Agent（`agent-layer`）

结构化输入 → 结构化输出的植物能力层：`analyze_profile`、`generate_daily_advice`、`assess_state`。默认使用内置 `FakeVisionProvider`，便于本地跑通；接入真实视觉服务时传入自定义 `VisionProvider` 即可。

---

## 大纲与进度

- ✅ **环境与依赖**：本机需 Node.js **≥ 20**（见 `package.json` 的 `engines`）。
- ✅ **安装与编译**：在 **`agent-layer/` 根目录**执行 `npm install` 与 `npm run build`，生成 `dist/`。
- ✅ **一键跑通**：`npm run run:through`（`build` + `test` + 三个示例 CLI）；仅编译+测试用 `npm run verify`。
- ➡ **运行**：CLI（`plant-agent` / `node dist/cli.js`）或代码中 `import { PlantAgent } from "@guyu/plant-agent"`（需先 `npm run build` 或从源码用打包器解析）。

**为什么要先 `build`**：`tsc` 将 `src/` 编译到 `dist/`，CLI 的 `bin` 指向 `dist/cli.js`；开发时也可用 `npm run cli`（通过 `tsx` 直接跑 `src/cli.ts`，无需先编译）。

---

## 1. 安装与构建

在仓库中进入本目录：

```bash
cd agent-layer
npm install
npm run build
```

### `package.json` 快捷指令

| 脚本 | 作用 |
|------|------|
| `npm run run:through` | **推荐**：`build` → `test` → 依次跑 `examples/` 下三条 CLI |
| `npm run verify` | `build` + `test`（不跑 CLI） |
| `npm run run:examples` | 仅三条示例 CLI（需已有 `dist/`） |
| `npm run run:analyze-profile` / `run:daily-advice` / `run:assess-state` | 单条示例 |

使用 **pnpm** 时把上述命令里的 `npm run` 换成 `pnpm` 即可（例如 `pnpm run:through`），无需改脚本内容。

---

## 2. 测试与类型检查

```bash
npm test
npm run typecheck
```

---

## 3. 命令行（CLI）

先完成 **`npm run build`**，然后可用 **编译产物**（推荐，不依赖 `tsx`）：

```bash
node dist/cli.js <子命令> --input <json 文件路径>
```

子命令与含义：

| 子命令 | 能力 |
|--------|------|
| `analyze-profile` | 图像 → 植物档案草稿（识别） |
| `daily-advice` | 结合今日上下文 → 当日养护建议 |
| `assess-state` | 图像 + 档案 → 状态评估 |

使用仓库内示例（与测试用例对齐的 **Fake** 行为）：

```bash
node dist/cli.js analyze-profile --input examples/analyze-profile.json
node dist/cli.js daily-advice --input examples/daily-advice.json
node dist/cli.js assess-state --input examples/assess-state.json
```

从标准输入读入 JSON（`-` 表示 stdin）：

```bash
cat examples/daily-advice.json | node dist/cli.js daily-advice --input -
```

若全局安装本包或在本目录 `npm link`，可直接使用 `plant-agent` 代替 `node dist/cli.js`。

开发时也可不编译，直接：

```bash
npm run cli -- daily-advice --input examples/daily-advice.json
```

（依赖 `tsx`；若遇权限或 IPC 报错，优先使用上面的 `node dist/cli.js`。）

---

## 4. 在代码中调用

构建后从包入口导入（路径以你项目的模块解析为准）：

```ts
import { PlantAgent } from "@guyu/plant-agent";

const agent = new PlantAgent();
const res = await agent.generateDailyAdvice(/* parsed JSON object */);
```

自定义视觉提供方时传入 `visionProvider`（并实现 `VisionProvider` 接口）。契约与字段说明见 `docs/contracts/` 下的 Markdown。

---

## 5. 目录说明

| 路径 | 说明 |
|------|------|
| `src/` | TypeScript 源码 |
| `dist/` | `npm run build` 输出（宜加入 `.gitignore`） |
| `tests/` | Vitest 测试 |
| `examples/` | 跑通 CLI 的最小 JSON 样例 |
| `docs/` | 合约与设计文档（非 npm 包的一部分） |

---

**一句话**：在 `agent-layer` 下执行 `npm install` → `npm run build` → `npm test`，再用 `node dist/cli.js … --input examples/…` 即可端到端跑通。
