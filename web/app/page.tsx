import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-8 text-slate-800">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-5 rounded-[32px] border border-[#d8e2cf] bg-[#fbfaf5] p-5 shadow-[0_20px_60px_rgba(86,104,66,0.12)]">
        <header className="rounded-[28px] bg-[linear-gradient(180deg,#f6fbf0_0%,#eaf3df_100%)] p-5">
          <p className="text-sm text-[#6f7d61]">谷雨 Guyu</p>
          <h1 className="mt-2 text-[30px] font-semibold tracking-tight text-[#314334]">
            欢迎回来
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#66735b]">
            这里是你的绿植生活面板，后续可以从这里进入首页、成长记录和徽章库。
          </p>
        </header>

        <section className="rounded-[26px] bg-[#f2f7ec] p-4">
          <p className="text-sm text-[#6f7d61]">新页面入口</p>
          <h2 className="mt-1 text-xl font-semibold text-[#3e5644]">养成徽章库</h2>
          <p className="mt-2 text-sm leading-6 text-[#617059]">
            查看已解锁和未解锁的养殖成就，记录你和植物一起生活的每一个节点。
          </p>
          <Link
            href="/badges"
            className="mt-4 inline-flex rounded-full bg-[#6f8f58] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#64824f]"
          >
            进入徽章库
          </Link>
        </section>

        <section className="rounded-[26px] bg-[#eef2ff] p-4">
          <p className="text-sm text-[#5e6786]">AI 调试入口</p>
          <h2 className="mt-1 text-xl font-semibold text-[#2c3553]">像素植物调试台</h2>
          <p className="mt-2 text-sm leading-6 text-[#5d6780]">
            上传目标植物图和风格参考图，自定义提示词，直接查看 OpenRouter
            图像模型返回结果。
          </p>
          <Link
            href="/debug-pixel"
            className="mt-4 inline-flex rounded-full bg-[#314674] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#27385d]"
          >
            打开调试台
          </Link>
        </section>
      </div>
    </main>
  );
}
