# Guyu Plant Agent（`agent-layer`）

结构化输入 → 结构化输出的植物能力层，提供：

- `analyze_profile`：图像识别 → 植物档案草稿  
- `generate_daily_advice`：结合今日上下文 → 当日养护建议  
- `assess_state`：图像 + 档案 → 状态评估  
- `generate_pixel_art`（可选）：像素风 / 图像生成相关能力  

默认使用内置 `FakeVisionProvider` / `FakeImageGenerationProvider`，本地可零密钥跑通。接入真实多模态或图像生成服务时，通过环境变量或构造函数注入对应 Provider 即可。

---

## 大纲与进度

- ✅ **环境与依赖**：本机需 Node.js **≥ 20**（见 `package.json` 的 `engines`）。
- ✅ **安装与编译**：在 **`agent-layer/`** 根目录执行 `npm install` 与 `npm run build`，生成 `dist/`。
- ✅ **类型检查**：`npm run typecheck`。
- ➡ **运行**：CLI（`plant-agent` / `node dist/cli.js`）或代码中 `import { PlantAgent } from "@guyu/plant-agent"`；可选 `npm run manual-console` 启动本地 HTTP 调试台。

**为什么要先 `build`**：`tsc` 将 `src/` 编译到 `dist/`，包的 `main` 与 CLI 的 `bin` 均指向 `dist/`；开发时也可用 `npm run cli`（`tsx` 直接跑 `src/cli.ts`，无需先编译）。

---

## 1. 安装与构建

```bash
cd agent-layer
npm install
npm run build
```

在 `agent-layer/` 下可复制 **`.env.example` → `.env`**，把各服务商 Key 填进 **`.env`**（已加入 `.gitignore`，勿提交）。`npm run cli` 与 `npm run manual-console` 会通过 **`dotenv`** 自动加载当前目录的 `.env`。

### `package.json` 脚本

| 脚本 | 作用 |
|------|------|
| `npm run build` | `tsc` 编译到 `dist/` |
| `npm run typecheck` | 仅类型检查，不产出文件 |
| `npm test` | 运行 Vitest（匹配 `tests/**/*.test.ts`；当前无测试文件时会失败退出） |
| `npm run cli -- <子命令> --input <file.json>` | 开发时用 `tsx` 跑 CLI，无需先 `build` |
| `npm run manual-console` | 启动本地 HTTP 控制台（默认端口见下文） |
| `npm run smoke:bobdong` | 直连 `bobdong.cn` OpenAI 形态 `/v1/chat/completions` 冒烟（需 `.env` 里 `PLANT_AGENT_OPENAI_COMPATIBLE_API_KEY` 或 `BOBDONG_API_KEY`） |
| `npm run smoke:bobdong:gemini` | 同上，走 Gemini 原生 `:generateContent`（`x-goog-api-key`） |

`scripts/bobdong-smoke.ts` 会发送与教程一致的结构（含 `extra_body.imageConfig`、多模态 `messages`），用于验证网关可用性，与 `PlantAgent` 主流程独立。

---

## 2. 类型检查与测试

```bash
npm run typecheck
# npm test   # 需存在 tests/**/*.test.ts；否则 Vitest 会报 “No test files found”
```

---

## 3. 命令行（CLI）

先 **`npm run build`**，然后：

```bash
node dist/cli.js <子命令> --input <json 文件路径>
```

| 子命令 | 能力 | CLI 中是否使用视觉 Provider |
|--------|------|------------------------------|
| `analyze-profile` | 图像 → 植物档案草稿 | 是（`createVisionProviderFromEnv()`） |
| `daily-advice` | 今日上下文 → 养护建议 | 否（纯规则 + LLM 文本，不加载视觉） |
| `assess-state` | 图像 + 档案 → 状态评估 | 是 |
| `pixel-art` | 像素风图像生成 | 否（使用图像生成 Provider，见环境变量） |

从标准输入读入 JSON（`-` 表示 stdin）：

```bash
cat request.json | node dist/cli.js daily-advice --input -
```

开发阶段也可：

```bash
npm run cli -- assess-state --input ./request.json
```

全局安装或 `npm link` 后，可用 `plant-agent` 代替 `node dist/cli.js`。

**说明**：CLI 子命令与输入 JSON 的字段需符合 `src/schemas/inputs.ts` 中的 Zod 契约；可自行准备最小 JSON 样例，无需依赖固定 `examples/` 目录。

---

## 4. 在代码中调用

构建后从包入口导入：

```ts
import { PlantAgent } from "@guyu/plant-agent";
import {
  createVisionProviderFromEnv,
  createImageGenerationProviderFromEnv,
} from "@guyu/plant-agent";

const agent = new PlantAgent({
  visionProvider: createVisionProviderFromEnv(),
  imageGenerationProvider: createImageGenerationProviderFromEnv(),
});

await agent.analyzeProfile(input);
await agent.generateDailyAdvice(input);
await agent.generatePixelArt(input);
```

也可显式传入 `FakeVisionProvider` 或自定义实现 `VisionProvider`（见 `src/providers/types.ts`）。领域契约与字段说明见 `docs/contracts/`。

---

## 5. 接入真实 API（环境变量）

实现细节见 **`src/providers/config.ts`**。以下为摘要：**勿将密钥提交到仓库**；本地可用 `.env` + 进程注入，生产用密钥管理。

### 5.1 视觉能力（`analyze-profile` / `assess-state` / 需要多模态的调用）

设置 **`PLANT_AGENT_VISION_PROVIDER`**（默认未设置或非法值时等价于 `fake`）：

| 值 | 必填环境变量 | 常用可选变量 |
|----|----------------|----------------|
| `fake` | 无 | — |
| `claude` | `ANTHROPIC_API_KEY` | `ANTHROPIC_BASE_URL`、`PLANT_AGENT_CLAUDE_MODEL`（默认 `claude-opus-4-7`） |
| `gemini` | `GOOGLE_API_KEY` | `PLANT_AGENT_GEMINI_MODEL`（默认 `gemini-2.5-flash`） |
| `openai` | `OPENAI_API_KEY` | `OPENAI_BASE_URL`、`PLANT_AGENT_OPENAI_MODEL`（默认 `gpt-4.1`） |
| `openai-compatible` | `PLANT_AGENT_OPENAI_COMPATIBLE_API_KEY`、`PLANT_AGENT_OPENAI_COMPATIBLE_BASE_URL` | `PLANT_AGENT_OPENAI_COMPATIBLE_MODEL` 等 |

全局超时（毫秒，可选）：**`PLANT_AGENT_VISION_TIMEOUT_MS`**

**兼容 OpenAI 形态的第三方网关**（例如自建或代理的 `https://example.com/v1/chat/completions`）：使用 `openai-compatible`，把网关根地址填到 **`PLANT_AGENT_OPENAI_COMPATIBLE_BASE_URL`**，密钥填到 **`PLANT_AGENT_OPENAI_COMPATIBLE_API_KEY`**。具体路径与鉴权方式须与网关文档一致；本包按 OpenAI 兼容多模态客户端实现。

### 5.2 图像生成（`pixel-art` / `generatePixelArt`）

设置 **`PLANT_AGENT_IMAGE_GENERATION_PROVIDER`**：

| 值 | 必填环境变量 | 常用可选变量 |
|----|----------------|----------------|
| `fake` | 无 | — |
| `openrouter` | `OPENROUTER_API_KEY` | `OPENROUTER_BASE_URL`、`PLANT_AGENT_OPENROUTER_MODEL`（默认 `google/gemini-3.1-flash-image-preview`） |

超时（可选）：**`PLANT_AGENT_IMAGE_GENERATION_TIMEOUT_MS`**

### 5.3 与「手动 HTTP 控制台」配合

```bash
npm run manual-console
```

默认监听 **`PORT`**（未设置时为 **3000**）。用于浏览器侧上传与调试，与 Nest 后端无绑定关系；生产接入应通过宿主应用注入 `PlantAgent` 与环境变量。

---

## 6. 目录说明

| 路径 | 说明 |
|------|------|
| `src/` | TypeScript 源码（能力、Schema、Provider、可选 `http/` 调试服务） |
| `dist/` | `npm run build` 输出（建议加入 `.gitignore`） |
| `docs/` | 合约与设计文档 |

---

**一句话**：在 `agent-layer` 下执行 `npm install` → `npm run build` → `npm run typecheck`，按需设置 **`PLANT_AGENT_VISION_PROVIDER`** 与对应密钥 / Base URL，即可从 Fake 切到真实多模态与图像生成服务。
