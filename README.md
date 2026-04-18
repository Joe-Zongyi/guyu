# Guyu

Guyu 是一个面向家庭绿植用户的 AI 养护助手项目仓库。当前代码库同时承载主业务代码、前端设计文档，以及独立的混元 3D 调研实验。

## 项目结构

- `web/`：Next.js 前端应用。
- `agent-layer/`：植物识别、状态评估、每日建议的 Agent 领域层与契约。
- `be/`：后端占位目录，后续可承接 API 与服务实现。
- `docs/`：统一项目文档。
- `docs/plans/`：PRD 和阶段计划。
- `docs/research/`：研究类文档。
- `docs/frontend/`：前端设计稿、升级计划和数据契约。
- `experiments/hunyuan-3d/`：混元 3D 独立实验区。

## 混元 3D 实验区

- `experiments/hunyuan-3d/ui/`：本地测试页面。
- `experiments/hunyuan-3d/tools/`：启动脚本和本地 Python 服务。
- `experiments/hunyuan-3d/docs/`：实验说明文档。
- `experiments/hunyuan-3d/assets/`：设计稿和辅助素材。
- `experiments/hunyuan-3d/samples/`：历史测试样例、输入图片和缓存结果。
- `experiments/hunyuan-3d/runtime/`：实际运行时生成目录，默认不提交。

## 常用入口

- 前端应用：`cd web && npm run dev`
- Agent 层：`cd agent-layer && npm test`
- 混元 3D 控制台：`.\experiments\hunyuan-3d\tools\start-hunyuan-console.ps1`
