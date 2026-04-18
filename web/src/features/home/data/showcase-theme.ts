import type { RhythmBar, ThemeData, ThemeKey } from "../types";

export const THEMES: Record<ThemeKey, ThemeData> = {
  sunny: {
    key: "sunny",
    weather: "Sunny",
    dateLabel: "4月18日 Saturday",
    shellClassName:
      "bg-[radial-gradient(circle_at_top_right,rgba(247,227,129,0.22),transparent_18%),linear-gradient(180deg,#2e6a45_0%,#255239_100%)]",
    heroClassName:
      "bg-[linear-gradient(180deg,rgba(71,130,88,0.96)_0%,rgba(52,109,70,0.98)_100%)]",
    statusClassName: "bg-[#5a8e6b]/95",
    careClassName: "bg-[#e3f0bf]",
    rhythmClassName: "bg-[#d7f0b6]",
    secondaryCardClassName: "bg-[#eff7d3]",
    accentClassName: "bg-[#f7e381]",
    softAccentClassName: "bg-[#b9f07b]",
    borderClassName: "border-white/10",
    glowClassName: "guyu-weather-sunny",
    heroSubtitle: "春季养护进行中",
    health: "舒展",
    growthStage: "萌发",
    leafState: "稳定",
    environment: "舒适",
    primaryCare: "上午",
    creators: [
      { name: "自然阳台日记", meta: "窗台养护 · 治愈系" },
      { name: "植物散步时间", meta: "龟背竹日常 · 光照观察" },
    ],
  },
  rainy: {
    key: "rainy",
    weather: "Rainy",
    dateLabel: "4月18日 Saturday",
    shellClassName:
      "bg-[radial-gradient(circle_at_top_right,rgba(189,219,211,0.16),transparent_20%),linear-gradient(180deg,#213a34_0%,#172825_100%)]",
    heroClassName:
      "bg-[linear-gradient(180deg,rgba(50,84,77,0.98)_0%,rgba(35,62,57,0.98)_100%)]",
    statusClassName: "bg-[#35544f]/95",
    careClassName: "bg-[#d8e8c2]",
    rhythmClassName: "bg-[#cfe0d2]",
    secondaryCardClassName: "bg-[#d9e4df]",
    accentClassName: "bg-[#dbe9e2]",
    softAccentClassName: "bg-[#9cd4a7]",
    borderClassName: "border-white/8",
    glowClassName: "guyu-weather-rainy",
    heroSubtitle: "春季养护进行中",
    health: "平稳",
    growthStage: "缓慢",
    leafState: "稳定",
    environment: "湿冷",
    primaryCare: "靠窗",
    creators: [
      { name: "雨天阳台观察", meta: "潮湿养护 · 阴天补光" },
      { name: "慢生长备忘录", meta: "雨季节奏 · 室内通风" },
    ],
  },
};

export const DEFAULT_THEME: ThemeKey = "sunny";

export const RHYTHM_BARS: RhythmBar[] = [
  { label: "morning", value: "72%" },
  { label: "noon", value: "48%" },
  { label: "evening", value: "33%" },
];
