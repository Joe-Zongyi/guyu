import type { ZodIssue } from "zod";
import {
  GenerateDailyAdviceInputSchema,
  type GenerateDailyAdviceInput,
} from "../schemas/inputs.js";
import type { CareEvent } from "../schemas/primitives.js";
import type { DailyAdviceResponse } from "../schemas/envelopes.js";
import type {
  Action,
  DailyAdvice,
  DerivedContext,
} from "../schemas/advice.js";
import type {
  Pressure,
  Season,
  Sensitivity,
  WeatherCondition,
} from "../schemas/enums.js";

export interface GenerateDailyAdviceDeps {
  /**
   * Optional clock injection in tests; default uses today_context.date so the
   * function stays deterministic even without it.
   */
  now?: () => Date;
}

const SEASON_FROM_MONTH: Record<number, Season> = {
  1: "winter",
  2: "winter",
  3: "spring",
  4: "spring",
  5: "spring",
  6: "summer",
  7: "summer",
  8: "summer",
  9: "autumn",
  10: "autumn",
  11: "autumn",
  12: "winter",
};

function inferSeason(dateIso: string): Season {
  const month = Number(dateIso.split("-")[1]);
  return SEASON_FROM_MONTH[month] ?? "spring";
}

function dayDiff(fromIso: string, toIsoDate: string): number {
  const from = Date.parse(fromIso);
  const to = Date.parse(`${toIsoDate}T00:00:00Z`);
  if (Number.isNaN(from) || Number.isNaN(to)) return Number.POSITIVE_INFINITY;
  return Math.floor((to - from) / 86_400_000);
}

function bumpPressure(p: Pressure, by: 1 | -1): Pressure {
  const order: Pressure[] = ["low", "medium", "high"];
  const idx = order.indexOf(p);
  const next = Math.max(0, Math.min(2, idx + by));
  return order[next]!;
}

function maxPressure(...values: Pressure[]): Pressure {
  if (values.includes("high")) return "high";
  if (values.includes("medium")) return "medium";
  return "low";
}

function sensitivityToPressure(s: Sensitivity): Pressure {
  return s;
}

interface ResolvedWeather {
  condition: WeatherCondition;
  temperatureC: number | null;
  humidity: number | null;
  lightLevel: "low" | "medium" | "high";
  available: boolean;
}

function resolveWeather(
  input: GenerateDailyAdviceInput["today_context"]["weather_snapshot"],
): ResolvedWeather {
  if (!input) {
    return {
      condition: "unknown",
      temperatureC: null,
      humidity: null,
      lightLevel: "medium",
      available: false,
    };
  }
  const condition = input.condition ?? "unknown";
  const temperatureC =
    typeof input.temperature_c === "number" ? input.temperature_c : null;
  const humidity = typeof input.humidity === "number" ? input.humidity : null;
  const lightLevel = input.light_level ?? "medium";
  const available =
    condition !== "unknown" && temperatureC !== null && humidity !== null;
  return {
    condition,
    temperatureC,
    humidity,
    lightLevel,
    available,
  };
}

function computeTemperatureRisk(
  weather: ResolvedWeather,
  heatSensitivity: Sensitivity,
  coldSensitivity: Sensitivity,
): Pressure {
  if (weather.temperatureC === null) return "low";
  const t = weather.temperatureC;
  if (t >= 32) return sensitivityToPressure(heatSensitivity);
  if (t >= 28)
    return heatSensitivity === "high" ? "medium" : "low";
  if (t <= 5) return sensitivityToPressure(coldSensitivity);
  if (t <= 12)
    return coldSensitivity === "high" ? "medium" : "low";
  return "low";
}

function computeWateringPressure(
  weather: ResolvedWeather,
  daysSinceWater: number,
  riskFlags: string[],
  humiditySensitivity: Sensitivity,
): Pressure {
  let base: Pressure;
  if (daysSinceWater >= 7) base = "high";
  else if (daysSinceWater >= 3) base = "medium";
  else base = "low";

  if (weather.available) {
    if (
      (weather.temperatureC ?? 0) >= 30 ||
      (weather.humidity ?? 50) <= 35
    ) {
      base = bumpPressure(base, 1);
    }
    if (
      weather.condition === "rain" ||
      (weather.humidity ?? 50) >= 85
    ) {
      base = bumpPressure(base, -1);
    }
  }

  if (riskFlags.includes("overwatering_sensitive")) {
    if (daysSinceWater < 5) base = bumpPressure(base, -1);
  }
  if (riskFlags.includes("drought_sensitive")) {
    base = bumpPressure(base, 1);
  }
  if (humiditySensitivity === "high" && daysSinceWater < 2) {
    base = bumpPressure(base, -1);
  }

  return base;
}

function computeLightPressure(
  weather: ResolvedWeather,
  lightSensitivity: Sensitivity,
): Pressure {
  if (!weather.available) return "medium";
  if (weather.condition === "sunny" && lightSensitivity === "high")
    return "high";
  if (weather.condition === "sunny") return "medium";
  if (weather.condition === "overcast" || weather.condition === "rain")
    return lightSensitivity === "high" ? "low" : "low";
  return "medium";
}

function buildActions(opts: {
  derived: DerivedContext;
  weather: ResolvedWeather;
  riskFlags: string[];
  daysSinceWater: number;
  daysSinceFertilize: number;
  season: Season;
  heatSensitivity: Sensitivity;
  humiditySensitivity: Sensitivity;
  lightSensitivity: Sensitivity;
}): Action[] {
  const actions: Action[] = [];

  if (opts.daysSinceWater <= 0) {
    actions.push({
      type: "skip_water",
      priority: "low",
      reason: "今天已浇过水，避免重复浇水",
      suggested_time: "any",
    });
  } else if (opts.derived.watering_pressure === "high") {
    actions.push({
      type: "water_now",
      priority: "high",
      reason: "距离上次浇水时间较长，且当前环境偏干燥",
      suggested_time: "evening",
    });
  } else if (opts.derived.watering_pressure === "medium") {
    actions.push({
      type: "water_check",
      priority: "medium",
      reason: "近期温度或干燥度上升，建议先检查盆土湿度",
      suggested_time: "evening",
    });
  } else {
    actions.push({
      type: "skip_water",
      priority: "low",
      reason: "盆土水分应仍充足，今天无需浇水",
      suggested_time: "any",
    });
  }

  if (
    opts.weather.available &&
    opts.weather.condition === "sunny" &&
    (opts.weather.temperatureC ?? 0) >= 30 &&
    opts.heatSensitivity !== "low"
  ) {
    actions.push({
      type: "move_to_shade",
      priority: "high",
      reason: "今日高温且阳光强烈，避免叶片灼伤",
      suggested_time: "midday",
    });
  }

  if (
    opts.weather.available &&
    opts.humiditySensitivity === "high" &&
    (opts.weather.humidity ?? 60) < 40
  ) {
    actions.push({
      type: "increase_humidity",
      priority: "medium",
      reason: "环境湿度偏低，建议喷雾或加湿",
      suggested_time: "morning",
    });
  }

  if (
    opts.weather.available &&
    (opts.weather.humidity ?? 0) >= 85 &&
    opts.riskFlags.includes("overwatering_sensitive")
  ) {
    actions.push({
      type: "ventilate",
      priority: "medium",
      reason: "环境湿度过高且植物易闷根，建议加强通风",
      suggested_time: "morning",
    });
  }

  if (
    (opts.season === "spring" || opts.season === "summer") &&
    opts.daysSinceFertilize >= 30 &&
    opts.derived.watering_pressure !== "high"
  ) {
    actions.push({
      type: "fertilize",
      priority: "low",
      reason: "进入生长季且距离上次施肥已超过 30 天，可施一次薄肥",
      suggested_time: "morning",
    });
  }

  if (actions.length === 1 && actions[0]!.type === "skip_water") {
    actions.push({
      type: "observe",
      priority: "low",
      reason: "状态平稳，今天以观察为主",
      suggested_time: "any",
    });
  }

  return actions;
}

function buildWarnings(opts: {
  weather: ResolvedWeather;
  derived: DerivedContext;
  heatSensitivity: Sensitivity;
  coldSensitivity: Sensitivity;
  lightSensitivity: Sensitivity;
  riskFlags: string[];
  daysSinceWater: number;
}): string[] {
  const warnings: string[] = [];

  if (!opts.weather.available) {
    warnings.push("今日天气数据缺失，已按通用基线生成保守建议");
  }

  if (
    opts.weather.available &&
    opts.weather.condition === "sunny" &&
    (opts.weather.temperatureC ?? 0) >= 28 &&
    opts.lightSensitivity !== "low"
  ) {
    warnings.push("避免中午暴晒");
  }

  if (
    opts.weather.available &&
    (opts.weather.temperatureC ?? 99) <= 8 &&
    opts.coldSensitivity !== "low"
  ) {
    warnings.push("夜间温度可能偏低，注意远离冷风口");
  }

  if (
    opts.riskFlags.includes("overwatering_sensitive") &&
    opts.daysSinceWater <= 1
  ) {
    warnings.push("最近刚浇过水，避免再次浇水以防积水烂根");
  }

  return warnings;
}

function buildTodaySummary(actions: Action[], weather: ResolvedWeather): string {
  const top = actions[0]!;
  const weatherTag = weather.available
    ? `${weather.condition}/${weather.temperatureC}°C`
    : "天气未知";
  switch (top.type) {
    case "water_now":
      return `今天建议浇水（${weatherTag}）。`;
    case "water_check":
      return `今天先检查盆土湿度，再决定是否浇水（${weatherTag}）。`;
    case "skip_water":
      return `今天先观察盆土湿度，暂不急着浇水（${weatherTag}）。`;
    default:
      return `今天以观察为主（${weatherTag}）。`;
  }
}

function buildMoodCopy(derived: DerivedContext): string {
  const stress =
    derived.temperature_risk === "high" || derived.watering_pressure === "high";
  if (stress) return "它今天可能有点小辛苦，多留意它的状态吧。";
  if (derived.watering_pressure === "low" && derived.temperature_risk === "low")
    return "它今天状态还不错，继续稳稳照顾就好。";
  return "今天的它状态平稳，按节奏照顾就好。";
}

function getLastEventTime(
  events: GenerateDailyAdviceInput["today_context"]["recent_care_events"],
  type: "watered" | "fertilized",
): string | undefined {
  const filtered = events.filter((e: CareEvent) => e.type === type);
  if (filtered.length === 0) return undefined;
  const sorted = [...filtered].sort((a, b) =>
    a.occurred_at < b.occurred_at ? 1 : -1,
  );
  return sorted[0]!.occurred_at;
}

export async function generateDailyAdvice(
  rawInput: unknown,
  _deps: GenerateDailyAdviceDeps = {},
): Promise<DailyAdviceResponse> {
  const parsed = GenerateDailyAdviceInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      status: "failed",
      error_code: "PROVIDER_UNAVAILABLE",
      message: `invalid input: ${parsed.error.issues
        .map((i: ZodIssue) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")}`,
      request_id:
        (rawInput as { request_id?: string })?.request_id ?? "unknown",
    };
  }
  const input = parsed.data;

  const weather = resolveWeather(input.today_context.weather_snapshot);
  const season =
    input.today_context.season ?? inferSeason(input.today_context.date);

  const weatherLink = input.profile.weather_link_fields ?? {
    heat_sensitivity: "medium",
    cold_sensitivity: "medium",
    humidity_sensitivity: "medium",
    light_sensitivity: "medium",
  };

  const lastWateredIso = getLastEventTime(
    input.today_context.recent_care_events,
    "watered",
  );
  const lastFertilizedIso = getLastEventTime(
    input.today_context.recent_care_events,
    "fertilized",
  );
  const daysSinceWater = lastWateredIso
    ? dayDiff(lastWateredIso, input.today_context.date)
    : 7;
  const daysSinceFertilize = lastFertilizedIso
    ? dayDiff(lastFertilizedIso, input.today_context.date)
    : 60;

  const watering_pressure = computeWateringPressure(
    weather,
    daysSinceWater,
    input.profile.risk_flags,
    weatherLink.humidity_sensitivity,
  );
  const light_pressure = computeLightPressure(
    weather,
    weatherLink.light_sensitivity,
  );
  const temperature_risk = computeTemperatureRisk(
    weather,
    weatherLink.heat_sensitivity,
    weatherLink.cold_sensitivity,
  );

  const derived: DerivedContext = {
    watering_pressure,
    light_pressure,
    temperature_risk: maxPressure(temperature_risk),
  };

  const actions = buildActions({
    derived,
    weather,
    riskFlags: input.profile.risk_flags,
    daysSinceWater,
    daysSinceFertilize,
    season,
    heatSensitivity: weatherLink.heat_sensitivity,
    humiditySensitivity: weatherLink.humidity_sensitivity,
    lightSensitivity: weatherLink.light_sensitivity,
  });

  const warnings = buildWarnings({
    weather,
    derived,
    heatSensitivity: weatherLink.heat_sensitivity,
    coldSensitivity: weatherLink.cold_sensitivity,
    lightSensitivity: weatherLink.light_sensitivity,
    riskFlags: input.profile.risk_flags,
    daysSinceWater,
  });

  const advice: DailyAdvice = {
    date: input.today_context.date,
    actions,
    warnings,
    today_summary: buildTodaySummary(actions, weather),
    mood_copy: buildMoodCopy(derived),
    derived_context: derived,
  };

  return {
    status: "success",
    data: advice,
    request_id: input.request_id,
  };
}
