import type { ThemeData, ThemeKey } from "../types";

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
    secondaryCardClassName: "bg-[#eff7d3]",
    accentClassName: "bg-[#f7e381]",
    softAccentClassName: "bg-[#b9f07b]",
    borderClassName: "border-white/10",
    glowClassName: "guyu-weather-sunny",
    heroSubtitle: "春季养护进行中",
    growthStage: "萌发",
    healthStatus: "稳定向上",
    healthTrend: "up",
    companionshipDays: "第 128 天",
    waterHabit: "喜湿",
    sunlightHabit: "喜阴",
    waterAdvice: "明天浇水",
    sunlightAdvice: "避免暴晒",
    soilMoisture: 68,
    videoTitle: "龟背竹浇水节奏",
    videoMeta: "6 min · 新手友好",
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
    secondaryCardClassName: "bg-[#d9e4df]",
    accentClassName: "bg-[#dbe9e2]",
    softAccentClassName: "bg-[#9cd4a7]",
    borderClassName: "border-white/8",
    glowClassName: "guyu-weather-rainy",
    heroSubtitle: "春季养护进行中",
    growthStage: "缓慢",
    healthStatus: "平稳恢复",
    healthTrend: "up",
    companionshipDays: "第 128 天",
    waterHabit: "喜干",
    sunlightHabit: "喜阴",
    waterAdvice: "3天后浇",
    sunlightAdvice: "保持明亮",
    soilMoisture: 42,
    videoTitle: "阴雨天怎么判断要不要浇水",
    videoMeta: "5 min · 雨季避坑",
  },
};

export const DEFAULT_THEME: ThemeKey = "sunny";
