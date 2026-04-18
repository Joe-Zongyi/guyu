"use client";

import { useMemo, useState } from "react";
import { DeviceFrame } from "@/src/shared/ui/device-frame";

import { gardenPlants, inProgressBadges, lockedBadges, unlockedBadges } from "../data/badges";
import { BadgeCard } from "./badge-card";
import { GardenCard } from "./garden-card";

type ShowcaseTabKey = "badges" | "garden";

const SHOWCASE_TABS: Array<{
  key: ShowcaseTabKey;
  label: string;
}> = [
  { key: "badges", label: "养成徽章" },
  { key: "garden", label: "我的花园" },
];

export function BadgesPageView() {
  const [activeTab, setActiveTab] = useState<ShowcaseTabKey>("badges");

  const activeSection = useMemo(() => {
    if (activeTab === "badges") {
      return {
        type: "badges" as const,
        items: [...unlockedBadges, ...inProgressBadges, ...lockedBadges],
      };
    }

    return {
      type: "garden" as const,
      items: gardenPlants,
    };
  }, [activeTab]);

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.72),transparent_24%),linear-gradient(180deg,#e9f1e3_0%,#dfe9d9_34%,#eef3e9_100%)] px-4 py-6 sm:px-6 lg:px-8 text-slate-800">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-6%] top-[8%] h-72 w-72 rounded-full bg-[#f3df91]/18 blur-3xl" />
        <div className="absolute right-[-8%] top-[22%] h-96 w-96 rounded-full bg-[#b9d8be]/26 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[16%] h-80 w-80 rounded-full bg-[#d7e7bf]/20 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-[1240px] items-start gap-8 lg:grid-cols-[0.95fr_520px]">
        <section className="hidden text-[#274033] lg:block mt-12">
          <div className="max-w-[520px]">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#617763]">
              Achievement Garden
            </p>
            <h1 className="mt-4 font-serif text-[64px] leading-[0.95] text-[#21382b]">
              在成就花园里
              <br />
              见证成长
            </h1>
            <p className="mt-5 max-w-[460px] text-base leading-7 text-[#59705e]">
              在这里收集你与植物共同度过的点滴时光。通过双系统设计，你可以切换查看所有养护徽章，或者浏览已收集的植物图鉴。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <div className="rounded-full border border-white/50 bg-white/60 px-4 py-2 text-sm shadow-[0_12px_24px_rgba(48,70,52,0.08)] backdrop-blur">
                双系统收集
              </div>
              <div className="rounded-full border border-white/50 bg-white/60 px-4 py-2 text-sm shadow-[0_12px_24px_rgba(48,70,52,0.08)] backdrop-blur">
                像素风图鉴
              </div>
            </div>
          </div>
        </section>

        <DeviceFrame>
          <section className="flex min-h-full flex-1 flex-col overflow-hidden rounded-[32px] border border-[#d7e2cf] bg-[linear-gradient(180deg,#f6fbf0_0%,#eef4e4_56%,#fffdf8_100%)] shadow-[0_20px_60px_rgba(86,104,66,0.12)]">
            <div className="p-5 pb-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => window.location.assign("/")}
                  className="inline-flex h-9 items-center gap-2 rounded-full bg-[#e8f0e0] px-4 text-xs font-semibold text-[#274033] transition hover:bg-[#dce6d3]"
                >
                  <span aria-hidden="true">←</span>
                  返回首页
                </button>
                <p className="text-xs font-medium tracking-[0.08em] text-[#6f7d61]">Achievement Garden</p>
              </div>
              <h1 className="mt-1 font-serif text-[31px] leading-tight tracking-tight text-[#324234]">
                成就花园
              </h1>

            <div className="mt-5 rounded-[22px] bg-white/70 p-2 shadow-[0_10px_20px_rgba(86,104,66,0.08)]">
              <div className="grid grid-cols-2 gap-2">
                {SHOWCASE_TABS.map((tab) => {
                  const isActive = activeTab === tab.key;

                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`rounded-[18px] px-3 py-3 text-center transition ${
                        isActive
                          ? "bg-[#6f8f58] text-white shadow-[0_10px_20px_rgba(86,104,66,0.18)]"
                          : "bg-transparent text-[#5f7058] hover:bg-[#f1f5eb]"
                      }`}
                    >
                      <p className="text-sm font-semibold tracking-[0.08em]">{tab.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex-1 border-t border-[#e4eadb] bg-[#fffdf8] px-3 pb-3 pt-3">
            <div className="grid grid-cols-3 gap-2">
              {activeSection.type === "badges"
                ? activeSection.items.map((badge) => (
                    <BadgeCard
                      key={badge.name}
                      badge={badge}
                      lockedStyle={!badge.unlocked && !badge.progress}
                    />
                  ))
                : activeSection.items.map((plant) => (
                    <GardenCard
                      key={`${plant.name}-${plant.days}`}
                      plant={plant}
                    />
                  ))}
            </div>
          </div>
        </section>
        </DeviceFrame>
      </div>
    </main>
  );
}
