"use client";

import Link from "next/link";
import { DeviceFrame } from "@/src/shared/ui/device-frame";
import { DEFAULT_THEME, THEMES } from "../data/showcase-theme";
import type { ThemeData } from "../types";

const PLANT_TABS = [{ id: "monstera" }] as const;

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
              <div className="space-y-3">
                <div className="flex justify-end text-[13px] font-semibold tracking-[0.04em] text-white/85">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#173828] ${theme.accentClassName}`}
                    >
                      {theme.weather}
                    </span>
                    <button
                      type="button"
                      aria-label="添加植物"
                      className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/12 px-3.5 py-2 text-xs font-semibold tracking-[0.04em] text-white shadow-[0_12px_24px_rgba(5,14,10,0.16)] backdrop-blur-md transition hover:bg-white/18"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/18 text-sm leading-none">
                        +
                      </span>
                      添加植物
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center rounded-full border border-white/10 bg-white/8 px-4 py-3 shadow-[0_18px_40px_rgba(4,14,10,0.14)] backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    {PLANT_TABS.map((plant, index) => {
                      const isActive = index === 0;

                      return (
                        <button
                          key={plant.id}
                          type="button"
                          aria-pressed={isActive}
                          aria-label={`植物 ${index + 1}`}
                          className={`h-3.5 w-3.5 rounded-full transition ${
                            isActive
                              ? "scale-110 bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.16)]"
                              : "bg-white/32 hover:bg-white/48"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
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

                <Link
                  href="/growth-3d"
                  className="mt-4 inline-flex w-fit items-center rounded-full bg-[#ebf7df] px-5 py-3 text-sm font-semibold text-[#204735] shadow-[0_12px_24px_rgba(8,26,16,0.15)] transition hover:-translate-y-0.5"
                >
                  记录
                </Link>
              </section>

              <section className="grid min-h-[340px] grid-cols-2 items-stretch gap-3">
                <article
                  className={`flex h-full flex-col rounded-[24px] border border-white/8 p-4 shadow-[0_16px_36px_rgba(7,18,12,0.18)] ${theme.statusClassName}`}
                >
                  <p className="text-[11px] uppercase tracking-[0.28em] text-white/65">
                    Plant Status
                  </p>

                  <div className="mt-3 flex flex-1 flex-col gap-3">
                    <StatusItem
                      label="生长阶段"
                      value={theme.growthStage}
                      barClassName={theme.softAccentClassName}
                    />
                    <StatusItem
                      label="健康状态"
                      value={theme.healthStatus}
                      barClassName="bg-[#e7f1d4]"
                      trend={theme.healthTrend}
                    />
                    <StatusItem
                      label="陪伴天数"
                      value={theme.companionshipDays}
                      barClassName="bg-white/70"
                    />
                  </div>
                </article>

                <article
                  className={`flex h-full flex-col rounded-[24px] p-4 text-[#20321f] shadow-[0_16px_36px_rgba(6,17,11,0.18)] ${theme.careClassName}`}
                >
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#516145]">
                    Care Habit
                  </p>
                  <div className="mt-3 flex flex-1 flex-col gap-2">
                    <HabitCard habit={theme.waterHabit} advice={theme.waterAdvice} />
                    <HabitCard habit={theme.sunlightHabit} advice={theme.sunlightAdvice} />
                    <SoilMoistureCard value={theme.soilMoisture} />
                  </div>
                </article>
              </section>

              <article
                className={`rounded-[24px] p-4 text-[#203225] shadow-[0_16px_36px_rgba(6,18,12,0.16)] ${theme.secondaryCardClassName}`}
              >
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#5b7060]">
                  Video Recommendation
                </p>
                <Link
                  href="#"
                  className="mt-3 flex items-center gap-3 rounded-[20px] bg-white/45 p-3 transition hover:-translate-y-0.5"
                >
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#7aac59_0%,#3a5f43_100%)] text-2xl text-white">
                    ▶
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-xl text-[#243525]">
                      {theme.videoTitle}
                    </p>
                    <p className="mt-1 text-sm text-[#617060]">{theme.videoMeta}</p>
                  </div>
                  <span className="rounded-full bg-[#294d37] px-4 py-2 text-sm font-semibold text-white">
                    观看
                  </span>
                </Link>
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
  trend,
}: {
  label: string;
  value: string;
  barClassName?: string;
  trend?: "up" | "down" | "steady";
}) {
  return (
    <div className="flex flex-1 flex-col justify-center rounded-[18px] bg-black/10 px-4 py-3">
      <p className="text-[11px] text-white/60">{label}</p>
      <div className="mt-1.5 flex items-center gap-1.5">
        <p className="text-[19px] font-semibold leading-none text-white">{value}</p>
        {trend ? <StatusTrendBadge trend={trend} /> : null}
      </div>
    </div>
  );
}

function HabitCard({
  habit,
  advice,
}: {
  habit: string;
  advice: string;
}) {
  return (
    <div className="flex flex-1 flex-col justify-center rounded-[18px] bg-white/55 px-4 py-3 text-[#243224]">
      <p className="whitespace-nowrap text-[22px] font-semibold leading-none">{advice}</p>
      <p className="mt-2 text-[13px] font-medium tracking-[0.04em] text-[#6e7d62]">{habit}</p>
    </div>
  );
}

function SoilMoistureCard({ value }: { value: number }) {
  const size = 52;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(value, 100));
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-1 items-center justify-between gap-3 rounded-[18px] bg-[#294d37] px-4 py-2.5 text-white">
      <p className="text-[12px] font-medium tracking-[0.12em] text-white/75">土壤含水量</p>
      <div className="relative flex h-[52px] w-[52px] shrink-0 items-center justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="h-[52px] w-[52px] -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f7e381"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <span className="absolute text-[13px] font-semibold leading-none">{progress}%</span>
      </div>
    </div>
  );
}

function StatusTrendBadge({ trend }: { trend: "up" | "down" | "steady" }) {
  const glyph = trend === "up" ? "↗" : trend === "down" ? "↘" : "→";
  const tone =
    trend === "up"
      ? "text-[#dff3b8]"
      : trend === "down"
        ? "text-[#ffd6ce]"
        : "text-white/72";

  return (
    <span className={`inline-flex items-center justify-center text-[16px] leading-none ${tone}`} aria-hidden="true">
      {glyph}
    </span>
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
