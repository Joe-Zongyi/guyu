const cards = [
  {
    title: "今日养护",
    badge: "今天要做",
    lines: ["浇水 1 次", "散射光 4 小时", "记得查看叶片状态"],
  },
  {
    title: "天气",
    badge: "环境建议",
    lines: ["多云 24°C", "空气湿度 71%", "适合通风和补光"],
  },
  {
    title: "日历",
    badge: "本周节奏",
    lines: ["4 月 18 日 周六", "下次施肥还有 3 天", "本周已打卡 5 次"],
  },
  {
    title: "打卡入口",
    badge: "快速记录",
    lines: ["上传今天的植物照片", "记录浇水和光照", "领取连续养护奖励"],
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#eff4ea] px-4 py-6 text-slate-800">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-sm flex-col rounded-[32px] border border-[#d9e2cf] bg-[#f9f6ef] p-4 shadow-[0_20px_60px_rgba(89,107,67,0.14)]">
        <section className="rounded-[28px] bg-[linear-gradient(180deg,#f7fbf2_0%,#edf4e4_100%)] p-4 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[#68745a]">4 月 18 日 周六</p>
              <h1 className="mt-1 text-[28px] font-semibold tracking-tight">早安，小雨</h1>
              <p className="mt-1 text-sm text-slate-500">
                今天的薄荷状态不错，适合补水和晒一会儿太阳。
              </p>
            </div>
            <div className="rounded-2xl bg-white/75 px-3 py-2 text-center text-xs leading-5 text-[#61704f] shadow-sm">
              <div className="text-[11px]">连续养护</div>
              <div className="text-lg font-semibold">12 天</div>
            </div>
          </div>

          <div className="rounded-[28px] bg-[#dfead2] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#68745a]">我的植物</p>
                <h2 className="mt-1 text-xl font-semibold">薄荷 · 今天状态不错</h2>
              </div>
              <span className="rounded-full bg-[#f8fbf3] px-3 py-1 text-xs font-medium text-[#5f6a52]">
                心情值 86
              </span>
            </div>

            <div className="mt-4 flex min-h-[300px] flex-col items-center justify-center rounded-[24px] bg-[radial-gradient(circle_at_top,#f7fbf2_0%,#edf4e4_45%,#d8e4c6_100%)] px-6 py-8 text-center">
              <div className="relative mb-5 flex h-36 w-36 items-center justify-center">
                <div className="absolute bottom-0 h-12 w-20 rounded-[40px] bg-[#8f5d3d]" />
                <div className="absolute bottom-8 left-7 h-16 w-6 rounded-full bg-[#7da05d]" />
                <div className="absolute bottom-10 left-4 h-12 w-12 rounded-[16px_16px_20px_20px] bg-[#8fbf67]" />
                <div className="absolute bottom-14 right-4 h-14 w-12 rounded-[18px_18px_24px_24px] bg-[#7eb35d]" />
                <div className="absolute bottom-20 left-12 h-10 w-10 rounded-[16px_16px_20px_20px] bg-[#9bcf70]" />
                <div className="absolute bottom-24 right-11 h-9 w-9 rounded-[16px_16px_20px_20px] bg-[#88c465]" />
              </div>
              <div className="rounded-full bg-white/75 px-4 py-2 text-sm text-[#5f6a52] shadow-sm">
                今天适合补水和晒一会儿太阳
              </div>
              <p className="mt-4 max-w-[220px] text-sm leading-6 text-[#627054]">
                保持土壤微湿，下午通风 20 分钟，叶片会更精神。
              </p>
              <div className="mt-5 flex w-full gap-3">
                <button className="flex-1 rounded-2xl bg-[#6f8f58] px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#64824f]">
                  立即打卡
                </button>
                <button className="flex-1 rounded-2xl bg-white/80 px-4 py-3 text-sm font-medium text-[#5f6a52] transition hover:bg-white">
                  查看档案
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-3">
          {cards.map((card) => (
            <article
              key={card.title}
              className="min-h-40 rounded-[24px] bg-[#fffdf8] p-4 shadow-[0_10px_30px_rgba(107,112,92,0.08)]"
            >
              <span className="rounded-full bg-[#eef1e5] px-2.5 py-1 text-[11px] font-medium text-[#6a745d]">
                {card.badge}
              </span>
              <h2 className="mt-2 text-lg font-semibold">{card.title}</h2>
              <div className="mt-4 space-y-2">
                {card.lines.map((line) => (
                  <div
                    key={line}
                    className="rounded-2xl bg-[#f4f6ef] px-3 py-2 text-xs leading-5 text-slate-600"
                  >
                    {line}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="mt-4 rounded-[24px] bg-[#fffdf8] p-4 shadow-[0_10px_30px_rgba(107,112,92,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#68745a]">今日进度</p>
              <h3 className="mt-1 text-lg font-semibold">已经完成 2 / 3 项养护</h3>
            </div>
            <div className="rounded-full bg-[#eff4ea] px-3 py-1 text-sm font-medium text-[#5f6a52]">
              67%
            </div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#edf1e6]">
            <div className="h-full w-2/3 rounded-full bg-[#80a064]" />
          </div>
        </section>
      </div>
    </main>
  );
}
