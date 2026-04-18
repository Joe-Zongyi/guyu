const statusBars = [
  { label: "生长", value: "新叶萌发", width: "w-[82%]", tone: "bg-[#7ab560]" },
  { label: "叶片", value: "稳定", width: "w-[68%]", tone: "bg-[#96c96e]" },
  { label: "环境", value: "湿度正常", width: "w-[74%]", tone: "bg-[#b1d983]" },
];

const careRhythm = [
  { label: "清晨", active: true },
  { label: "上午", active: true },
  { label: "午后", active: false },
  { label: "傍晚", active: true },
  { label: "夜间", active: false },
];

const videos = [
  {
    title: "龟背竹补水节奏怎么判断",
    meta: "6 min · 新手友好",
    reason: "适合你现在的补水阶段",
  },
  {
    title: "窗边光照怎么放才不焦叶",
    meta: "4 min · 阳台场景",
    reason: "和今天的光照建议匹配",
  },
];

const bloggers = [
  {
    name: "阳台慢生活",
    tag: "室内绿植",
    note: "擅长窗边植物布置和晨间养护",
  },
  {
    name: "一周一片新叶",
    tag: "新手友好",
    note: "内容偏轻松，适合碎片时间看",
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
              <button className="mt-5 w-full rounded-2xl bg-[#6f8f58] px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#64824f]">
                立即打卡
              </button>
            </div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-3">
          <article className="rounded-[24px] bg-[#fffdf8] p-4 shadow-[0_10px_30px_rgba(107,112,92,0.08)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-[#68745a]">Plant Status</p>
                <h3 className="mt-2 text-[28px] font-semibold leading-none text-[#4a5f3b]">
                  今日状态
                </h3>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#edf4e4]">
                <div className="relative h-10 w-10 rounded-full border-[6px] border-[#b9d990] border-t-[#6f8f58] border-r-[#88b466]" />
              </div>
            </div>

            <div className="mt-4 rounded-[20px] bg-[#f4f7ef] p-3">
              <p className="text-xs text-[#718063]">主状态</p>
              <p className="mt-1 text-lg font-semibold text-[#557043]">新叶萌发中</p>
              <p className="mt-1 text-xs text-slate-500">整体稳定，适合继续室内养护</p>
            </div>

            <div className="mt-4 space-y-3">
              {statusBars.map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-[#61704f]">{item.label}</span>
                    <span className="font-medium text-[#516644]">{item.value}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#edf1e6]">
                    <div className={`h-full rounded-full ${item.width} ${item.tone}`} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[24px] bg-[#fffdf8] p-4 shadow-[0_10px_30px_rgba(107,112,92,0.08)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-[#68745a]">Today Care</p>
                <h3 className="mt-2 text-[28px] font-semibold leading-none text-[#4a5f3b]">
                  今日建议
                </h3>
              </div>
              <div className="rounded-full bg-[#f2f6ea] px-3 py-1 text-[11px] font-medium text-[#6e855a]">
                优先处理
              </div>
            </div>

            <div className="mt-4 rounded-[20px] bg-[linear-gradient(180deg,#eff6e7_0%,#e3efd8_100%)] p-3">
              <p className="text-xs text-[#6f7d61]">补水时间</p>
              <p className="mt-1 text-[30px] font-semibold leading-none text-[#557043]">
                2 天后
              </p>
              <div className="mt-3 flex gap-1">
                {careRhythm.map((item) => (
                  <div key={item.label} className="flex-1">
                    <div
                      className={`h-2.5 rounded-full ${
                        item.active ? "bg-[#82a765]" : "bg-[#dbe7ce]"
                      }`}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-[#728064]">
                {careRhythm.map((item) => (
                  <span key={item.label}>{item.label}</span>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="rounded-[18px] bg-[#f7f8f3] px-3 py-2">
                <p className="text-[11px] text-[#718063]">补光建议</p>
                <p className="mt-1 text-base font-semibold text-[#4f6540]">上午窗边</p>
              </div>
              <div className="rounded-[18px] bg-[#fdf2e8] px-3 py-2">
                <p className="text-[11px] text-[#96724d]">避坑提醒</p>
                <p className="mt-1 text-base font-semibold text-[#8b5d2b]">避免暴晒</p>
              </div>
            </div>
          </article>
        </section>

        <section className="mt-4 rounded-[24px] bg-[#fffdf8] p-4 shadow-[0_10px_30px_rgba(107,112,92,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#68745a]">Video Recommendation</p>
              <h3 className="mt-1 text-lg font-semibold">适合你今天状态的视频</h3>
            </div>
            <span className="rounded-full bg-[#eef1e5] px-3 py-1 text-[11px] font-medium text-[#6a745d]">
              2 条精选
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {videos.map((video) => (
              <div
                key={video.title}
                className="rounded-[20px] bg-[#f4f7ef] p-3"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-10 w-10 rounded-2xl bg-[#dbe8c9]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#4f6540]">{video.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{video.meta}</p>
                    <p className="mt-2 text-xs text-[#6c7a5f]">{video.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-[24px] bg-[#fffdf8] p-4 shadow-[0_10px_30px_rgba(107,112,92,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#68745a]">Similar Blogger</p>
              <h3 className="mt-1 text-lg font-semibold">类似博主推荐</h3>
            </div>
            <span className="rounded-full bg-[#eef1e5] px-3 py-1 text-[11px] font-medium text-[#6a745d]">
              更贴近生活
            </span>
          </div>

          <div className="mt-4 grid gap-3">
            {bloggers.map((blogger) => (
              <div
                key={blogger.name}
                className="flex items-center gap-3 rounded-[20px] bg-[#f4f7ef] p-3"
              >
                <div className="h-12 w-12 rounded-full bg-[linear-gradient(180deg,#a7d27b_0%,#7fa564_100%)]" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-[#4f6540]">
                      {blogger.name}
                    </p>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-[#6a745d]">
                      {blogger.tag}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[#6c7a5f]">
                    {blogger.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
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
