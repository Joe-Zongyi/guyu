export type ThemeKey = "sunny" | "rainy";

export type ThemeData = {
  key: ThemeKey;
  weather: string;
  dateLabel: string;
  shellClassName: string;
  heroClassName: string;
  statusClassName: string;
  careClassName: string;
  secondaryCardClassName: string;
  accentClassName: string;
  softAccentClassName: string;
  borderClassName: string;
  glowClassName: string;
  heroSubtitle: string;
  growthStage: string;
  healthStatus: string;
  healthTrend: "up" | "down" | "steady";
  companionshipDays: string;
  waterHabit: string;
  sunlightHabit: string;
  waterAdvice: string;
  sunlightAdvice: string;
  wateringTrend: number[];
  videoTitle: string;
  videoMeta: string;
};
