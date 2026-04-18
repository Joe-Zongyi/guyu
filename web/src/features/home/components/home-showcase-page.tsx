"use client";

import { DeviceFrame } from "@/src/shared/ui/device-frame";
import { DEFAULT_THEME, RHYTHM_BARS, THEMES } from "../data/showcase-theme";
import type { ThemeData } from "../types";

export function HomeShowcasePage() {
  const theme = THEMES[DEFAULT_THEME];

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.72),transparent_24%),linear-gradient(180deg,#e9f1e3_0%,#dfe9d9_34%,#eef3e9_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-6%] top-[8%] h-72 w-72 rounded-full bg-[#f3df91]/18 blur-3xl" />
        <div className="absolute right-[-8%] top-[22%] h-96 w-96 rounded-full bg-[#b9d8be]/26 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[16%] h-80 w-80 rounded-full bg-[#d7e7bf]/20 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-[1240px] items-center gap-8 lg:grid-cols-[0.95fr_520px]">
        <section className="hidden text-[#274033] lg:block">
          <div className="max-w-[520px]">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#617763]">
              Guyu Mobile Showcase
            </p>
            <h1 className="mt-4 font-serif text-[64px] leading-[0.95] text-[#21382b]">
              把首页放进一台
              <br />
              适合展示的手机里
            </h1>
            <p className="mt-5 max-w-[460px] text-base leading-7 text-[#59705e]">
              现在这个首页会以真机陈列稿的形式展示：外层是机身、玻璃高光和投影，内层仍然保持可交互的移动端界面，更适合 demo、汇报和评审现场直接展示。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <div className="rounded-full border border-white/50 bg-white/60 px-4 py-2 text-sm shadow-[0_12px_24px_rgba(48,70,52,0.08)] backdrop-blur">
                430px 级手机画布
              </div>
              <div className="rounded-full border border-white/50 bg-white/60 px-4 py-2 text-sm shadow-[0_12px_24px_rgba(48,70,52,0.08)] backdrop-blur">
                首页模块已拆分
              </div>
              <div className="rounded-full border border-white/50 bg-white/60 px-4 py-2 text-sm shadow-[0_12px_24px_rgba(48,70,52,0.08)] backdrop-blur">
                预留 3D 成长模块
              </div>
            </div>
          </div>
        </section>

        <DeviceFrame>
          <section
            className={`relative overflow-hidden rounded-[34px] border ${theme.borderClassName} p-5 shadow-[0_30px_90px_rgba(5,14,10,0.28)] transition-all duration-500 ${theme.shellClassName}`}
          >
            <WeatherBackdrop theme={theme} />

            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center justify-between text-[13px] font-semibold tracking-[0.04em] text-white/85">
                <span>{theme.dateLabel}</span>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#173828] ${theme.accentClassName}`}
                >
                  {theme.weather}
                </span>
              </div>

              <section
                className={`rounded-[30px] border border-white/8 p-5 shadow-[0_18px_48px_rgba(6,16,11,0.24)] ${theme.heroClassName}`}
              >
                <p className="font-serif text-[30px] leading-none text-white">龟背竹 Monstera</p>
                <p className="mt-2 text-sm text-white/70">{theme.heroSubtitle}</p>

                <div className="relative mt-5 flex min-h-[190px] items-center justify-center overflow-hidden rounded-[28px] bg-white/4">
                  <div className="absolute inset-x-10 bottom-6 h-8 rounded-full bg-[#163126]/30 blur-2xl" />
                  <PixelPlant />
                </div>

                <button
                  type="button"
                  className="mt-4 inline-flex w-fit items-center rounded-full bg-[#ebf7df] px-5 py-3 text-sm font-semibold text-[#204735] shadow-[0_12px_24px_rgba(8,26,16,0.15)] transition hover:-translate-y-0.5"
                >
                  立即打卡
                </button>
              </section>

              <section className="grid grid-cols-[1.02fr_0.92fr] gap-3">
                <article
                  className={`rounded-[24px] border border-white/8 p-4 shadow-[0_16px_36px_rgba(7,18,12,0.18)] ${theme.statusClassName}`}
                >
                  <p className="text-[11px] uppercase tracking-[0.28em] text-white/65">
                    Plant Status
                  </p>
                  <p className="mt-3 text-sm text-white/70">总体状态</p>
                  <p className="mt-1 font-serif text-[38px] leading-none text-white">
                    {theme.health}
                  </p>

                  <div className="mt-4 space-y-3">
                    <StatusItem
                      label="生长阶段"
                      value={theme.growthStage}
                      barClassName={theme.softAccentClassName}
                    />
                    <StatusItem
                      label="叶片状态"
                      value={theme.leafState}
                      barClassName="bg-[#e7f1d4]"
                    />
                    <div className="rounded-[18px] bg-black/10 p-3">
                      <p className="text-xs text-white/60">环境感受</p>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
                        <div
                          className={`h-full w-2/3 rounded-full ${theme.accentClassName}`}
                        />
                      </div>
                      <p className="mt-2 text-sm font-medium text-white">{theme.environment}</p>
                    </div>
                  </div>
                </article>

                <article
                  className={`rounded-[24px] p-4 text-[#20321f] shadow-[0_16px_36px_rgba(6,17,11,0.18)] ${theme.careClassName}`}
                >
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#516145]">
                    Today Care
                  </p>
                  <div className="mt-3 rounded-[18px] bg-white/55 p-4">
                    <p className="text-sm text-[#6e7d62]">补光</p>
                    <p className="mt-1 font-serif text-[34px] leading-none text-[#243224]">
                      {theme.primaryCare}
                    </p>
                  </div>
                  <div className="mt-3 space-y-2">
                    <Reminder label="补水" value="两天后" />
                    <Reminder label="暴晒" value="避免" />
                  </div>
                </article>
              </section>

              <article
                className={`rounded-[28px] p-4 text-[#203225] shadow-[0_18px_44px_rgba(6,18,12,0.18)] ${theme.rhythmClassName}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#5e715f]">
                    Life Rhythm
                  </p>
                  <span className="rounded-full bg-white/55 px-3 py-1 text-xs font-semibold text-[#405141]">
                    这周很稳
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-[124px_1fr] gap-3">
                  <div className="flex min-h-[168px] flex-col items-center justify-center rounded-[24px] bg-white/38 p-3 text-center">
                    <div className="relative flex h-24 w-24 items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-[10px] border-white/45" />
                      <div className="absolute inset-[2px] rotate-45 rounded-full border-[10px] border-transparent border-r-[#3b6e50] border-t-[#3b6e50]" />
                      <div className="text-center">
                        <p className="font-serif text-2xl text-[#243626]">节律</p>
                        <p className="mt-1 text-xs text-[#617060]">稳定</p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-[#657363]">本周养护感受</p>
                  </div>

                  <div className="flex flex-col justify-between rounded-[24px] bg-white/38 p-4">
                    <RhythmCurve />
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[#38503e]">
                      <span className="rounded-full bg-white/70 px-3 py-2">陪伴第 128 天</span>
                      <span className="rounded-full bg-white/70 px-3 py-2">上次浇水 前天</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-[#4d624e]">今天顺手通风更偏早晨</p>
                  <div className="mt-3 flex items-end gap-2">
                    {RHYTHM_BARS.map((bar) => (
                      <div key={bar.label} className="flex flex-1 flex-col gap-2">
                        <div className="h-24 rounded-[18px] bg-white/45 p-1">
                          <div
                            className="w-full rounded-[14px] bg-[#3f704f] transition-all duration-500"
                            style={{ height: bar.value }}
                          />
                        </div>
                        <p className="text-center text-[11px] uppercase tracking-[0.18em] text-[#607261]">
                          {bar.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-[#536652]">
                  你最近更常在早晨照顾它，生活和养护节奏正在同步。
                </p>
              </article>

              <article
                className={`rounded-[24px] p-4 text-[#203225] shadow-[0_16px_36px_rgba(6,18,12,0.16)] ${theme.secondaryCardClassName}`}
              >
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#5b7060]">
                  Video Recommendation
                </p>
                <div className="mt-3 flex items-center gap-3 rounded-[20px] bg-white/45 p-3">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#7aac59_0%,#3a5f43_100%)] text-2xl text-white">
                    ▶
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-xl text-[#243525]">龟背竹浇水节奏</p>
                    <p className="mt-1 text-sm text-[#617060]">6 min · 新手友好</p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full bg-[#294d37] px-4 py-2 text-sm font-semibold text-white"
                  >
                    观看
                  </button>
                </div>
              </article>

              <article
                className={`rounded-[24px] p-4 text-[#203225] shadow-[0_16px_36px_rgba(6,18,12,0.16)] ${theme.secondaryCardClassName}`}
              >
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#5b7060]">
                  Similar Creators
                </p>
                <div className="mt-3 space-y-3">
                  {theme.creators.map((creator, index) => (
                    <div
                      key={creator.name}
                      className="flex items-center gap-3 rounded-[20px] bg-white/45 p-3"
                    >
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] text-sm font-semibold text-white ${
                          index === 0 ? "bg-[#4f7a5f]" : "bg-[#65895b]"
                        }`}
                      >
                        {creator.name.slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-[#243525]">{creator.name}</p>
                        <p className="truncate text-sm text-[#5e6f60]">{creator.meta}</p>
                      </div>
                      <button
                        type="button"
                        className="rounded-full border border-[#274334]/12 bg-white/70 px-4 py-2 text-sm font-semibold text-[#274334]"
                      >
                        查看
                      </button>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(8,15,11,0.12)_100%)]" />
          </section>
        </DeviceFrame>
      </div>
    </main>
  );
}

function StatusItem({
  label,
  value,
  barClassName,
}: {
  label: string;
  value: string;
  barClassName: string;
}) {
  return (
    <div className="rounded-[18px] bg-black/10 p-3">
      <div className={`h-1.5 w-10 rounded-full ${barClassName}`} />
      <p className="mt-2 text-xs text-white/60">{label}</p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function Reminder({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-[16px] bg-white/45 px-3 py-3">
      <div className="h-10 w-1.5 rounded-full bg-[#6f9564]" />
      <p className="text-sm text-[#31432f]">
        <span className="font-semibold">{label}</span>
        <span className="mx-2 text-[#7b8978]">·</span>
        <span>{value}</span>
      </p>
    </div>
  );
}

function PixelPlant() {
  const blocks = [
    "left-[108px] top-[48px] h-6 w-6 bg-[#b7f07d]",
    "left-[132px] top-[34px] h-7 w-7 bg-[#9ee06d]",
    "left-[160px] top-[50px] h-6 w-6 bg-[#b7f07d]",
    "left-[96px] top-[82px] h-7 w-7 bg-[#9ee06d]",
    "left-[144px] top-[82px] h-9 w-9 bg-[#b7f07d]",
    "left-[132px] top-[62px] h-[72px] w-[22px] bg-[#84cc6c]",
  ];

  return (
    <div className="relative h-[178px] w-full max-w-[290px]">
      {blocks.map((className) => (
        <div
          key={className}
          className={`absolute rounded-[4px] shadow-[0_4px_10px_rgba(0,0,0,0.08)] ${className}`}
        />
      ))}
      <div className="absolute left-[118px] top-[132px] h-[10px] w-[52px] rounded-[3px] bg-[#a86e49]" />
      <div className="absolute left-[124px] top-[142px] h-6 w-10 rounded-[4px] bg-[#8b5a3b]" />
    </div>
  );
}

function RhythmCurve() {
  return (
    <div className="relative h-[92px] overflow-hidden rounded-[20px] bg-[#edf5e1]">
      <svg
        viewBox="0 0 220 92"
        className="absolute inset-0 h-full w-full"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M10 68C42 48 58 24 92 30C129 37 137 66 169 54C188 47 198 29 210 24"
          stroke="#406d4e"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {[["42", "48"], ["92", "30"], ["169", "54"], ["210", "24"]].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5.5" fill="#406d4e" />
        ))}
      </svg>
    </div>
  );
}

function WeatherBackdrop({ theme }: { theme: ThemeData }) {
  if (theme.key === "sunny") {
    return (
      <>
        <div className={`absolute right-[-30px] top-[-26px] h-36 w-36 ${theme.glowClassName}`}>
          <div className="absolute inset-[22px] rounded-full bg-[#ffd965]" />
          {[0, 45, 90, 135].map((rotation) => (
            <div
              key={rotation}
              className="absolute left-1/2 top-1/2 h-24 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffe48a]/80"
              style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}
            />
          ))}
        </div>
        <div className="absolute bottom-[-70px] left-[-20px] h-44 w-44 rounded-full bg-[#ffefb4]/14 blur-3xl" />
      </>
    );
  }

  return (
    <>
      <div className={`absolute right-[-10px] top-3 h-28 w-40 ${theme.glowClassName}`}>
        <div className="absolute left-8 top-3 h-14 w-14 rounded-full bg-[#dce7e3]" />
        <div className="absolute left-2 top-8 h-16 w-16 rounded-full bg-[#d3dfda]" />
        <div className="absolute left-16 top-8 h-16 w-16 rounded-full bg-[#cbd9d4]" />
        <div className="absolute left-5 top-12 h-10 w-24 rounded-full bg-[#d1ddd8]" />
        {[18, 48, 78, 108].map((left, index) => (
          <div
            key={left}
            className="guyu-raindrop absolute top-[72px] h-8 w-1 rounded-full bg-[#b4cbc3]"
            style={{
              left,
              animationDelay: `${index * 0.18}s`,
            }}
          />
        ))}
      </div>
      <div className="absolute bottom-[-70px] right-[-10px] h-40 w-40 rounded-full bg-[#d3e2dc]/12 blur-3xl" />
    </>
  );
}
