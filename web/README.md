# Guyu Web（Next.js）

谷雨（Guyu）前端的 Next.js 应用，使用 **App Router**、TypeScript、Tailwind CSS。

> **目录说明：** 本仓库前端代码位于仓库根目录下的 **`web/`**。若文档或习惯中仍写作 `fe/web/`，请以当前 **`web/`** 为准。

## 环境要求

- **Node.js**：建议使用 **20 LTS** 或与团队一致的版本（Next.js 15 官方通常要求 Node 18.18+）。
- **包管理器**：下文以 **npm** 为例；也可使用 `pnpm`、`yarn`、`bun`。

## 安装依赖

在仓库根目录进入前端目录：

```bash
cd web
npm install
```

## 本地开发

启动开发服务器（默认热更新）：

```bash
npm run dev
```

浏览器访问：<http://localhost:3000>。

常用入口文件：`app/page.tsx`、`app/layout.tsx`。修改后保存即可在浏览器中看到更新。

如需指定端口（例如 3001）：

```bash
npx next dev -p 3001
```

## 生产构建与启动

```bash
npm run build
npm run start
```

`npm run start` 会运行 `next start`，默认仍监听 **3000** 端口（可通过环境变量 `PORT` 修改）。

## 代码检查

```bash
npm run lint
```

使用 Next.js 自带的 ESLint 集成（`next lint`）。

## 技术栈摘要

| 项目 | 版本（见 `package.json`） |
|------|---------------------------|
| Next.js | 15.x |
| React | 19.x |
| Tailwind CSS | 3.x |

## 延伸阅读

- [Next.js 文档](https://nextjs.org/docs)
- 仓库内协作约定见同目录 [`AGENTS.md`](./AGENTS.md)
