"use client";

import { useMemo, useState } from "react";

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
    <main className="min-h-screen bg-[linear-gradient(180deg,#edf4e4_0%,#f8f6ef_100%)] px-4 py-6 text-slate-800">
      <div className="mx-auto w-full max-w-sm">
        <section className="overflow-hidden rounded-[32px] border border-[#d7e2cf] bg-[linear-gradient(180deg,#f6fbf0_0%,#eef4e4_56%,#fffdf8_100%)] shadow-[0_20px_60px_rgba(86,104,66,0.12)]">
          <div className="p-5 pb-4">
            <p className="text-sm font-medium tracking-[0.08em] text-[#6f7d61]">Achievement Garden</p>
            <h1 className="mt-2 font-serif text-[31px] leading-tight tracking-tight text-[#324234]">
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

          <div className="border-t border-[#e4eadb] bg-[#fffdf8] px-3 pb-3 pt-3">
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
      </div>
    </main>
  );
}
