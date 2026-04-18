# Web Dev Cache Troubleshooting

## Symptom

前端页面突然退化成纯文本，Tailwind utility class 像是全部失效，或者 Next.js 在本地开发时反复出现这类报错：

- `No utility classes were detected in your source files`
- `.next/server/app/page.js` / `app-paths-manifest.json` / `fallback-build-manifest.json` 丢失
- webpack cache `pack.gz` 的 `ENOENT` / `EPERM`

## Root Cause

这个项目在 `web/src/` 下有大量页面和组件。只要 `tailwind.config.ts` 没有稳定扫描 `./src/**/*`，或者本地 `.next` 缓存被多个 dev server / 热更新异常写坏，Next.js 15 + Tailwind 的开发链路就可能出现：

1. Tailwind 没有生成 utility class
2. 页面被渲染成纯文本
3. `.next` 内部编译产物不完整，继续触发 404 / 500 / manifest 丢失

## Permanent Guardrails

当前仓库已经做了两层固定处理：

1. `web/tailwind.config.ts` 必须保留下面这类配置：

```ts
content: {
  relative: true,
  files: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
}
```

2. `web/package.json` 提供了缓存重置脚本：

```bash
npm run dev:reset
```

它会删除：

- `.next`
- `.tailwind-check.css`
- `.dev.log`
- `tsconfig.tsbuildinfo`

## Recovery Steps

当这个问题再次出现时，按下面顺序处理：

1. 停掉所有 `web/` 目录下的 `next dev`
2. 在 `web/` 下执行：

```bash
npm run dev:reset
```

3. 重新执行：

```bash
npm run dev
```

4. 确保只保留一个本地 dev server，避免多个端口和多个 `.next` 写入互相打架

## Important Note

如果以后从历史提交恢复文件、切分支、或者手动覆盖 `tailwind.config.ts`，优先检查 `src` 扫描路径有没有被带回旧版本。这是这个问题最容易再次出现的入口。
