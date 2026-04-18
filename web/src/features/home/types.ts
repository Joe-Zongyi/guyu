export type ThemeKey = "sunny" | "rainy";

export type Creator = {
  name: string;
  meta: string;
};

export type ThemeData = {
  key: ThemeKey;
  weather: string;
  dateLabel: string;
  shellClassName: string;
  heroClassName: string;
  statusClassName: string;
  careClassName: string;
  rhythmClassName: string;
  secondaryCardClassName: string;
  accentClassName: string;
  softAccentClassName: string;
  borderClassName: string;
  glowClassName: string;
  heroSubtitle: string;
  health: string;
  growthStage: string;
  leafState: string;
  environment: string;
  primaryCare: string;
  creators: Creator[];
};

export type RhythmBar = {
  label: "morning" | "noon" | "evening";
  value: string;
};
