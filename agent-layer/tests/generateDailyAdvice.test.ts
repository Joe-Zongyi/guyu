import { describe, expect, it } from "vitest";
import { PlantAgent } from "../src/agent.js";
import { DailyAdviceResponseSchema } from "../src/schemas/index.js";

const monsteraProfile = {
  taxonomy_id: "monstera_deliciosa",
  common_name: "龟背竹",
  care_baseline: {
    watering_rule: "土表 2-3 厘米干后浇透",
    light_rule: "明亮散射光",
  },
  risk_flags: ["overwatering_sensitive"],
  weather_link_fields: {
    heat_sensitivity: "medium" as const,
    cold_sensitivity: "medium" as const,
    humidity_sensitivity: "high" as const,
    light_sensitivity: "medium" as const,
  },
};

function buildInput(overrides: Record<string, unknown> = {}) {
  return {
    plant_id: "plant_test_001",
    profile: monsteraProfile,
    today_context: {
      date: "2026-04-18",
      season: "spring" as const,
      weather_snapshot: {
        condition: "cloudy" as const,
        temperature_c: 24,
        humidity: 68,
        light_level: "medium" as const,
      },
      recent_care_events: [
        { type: "watered" as const, occurred_at: "2026-04-17T10:30:00Z" },
      ],
    },
    request_id: "req_advice_001",
    ...overrides,
  };
}

describe("generate_daily_advice", () => {
  it("returns success and validates against schema", async () => {
    const agent = new PlantAgent();
    const res = await agent.generateDailyAdvice(buildInput());
    expect(DailyAdviceResponseSchema.parse(res)).toBeTruthy();
    expect(res.status).toBe("success");
    if (res.status !== "success") return;
    expect(res.data.date).toBe("2026-04-18");
    expect(res.data.actions.length).toBeGreaterThan(0);
    expect(res.data.derived_context.watering_pressure).toBeDefined();
  });

  it("is deterministic: same input -> same actions", async () => {
    const agent = new PlantAgent();
    const a = await agent.generateDailyAdvice(buildInput());
    const b = await agent.generateDailyAdvice(buildInput());
    expect(a).toEqual(b);
  });

  it("downgrades gracefully when weather is missing (still success)", async () => {
    const agent = new PlantAgent();
    const input = buildInput();
    delete (input.today_context as Record<string, unknown>).weather_snapshot;
    const res = await agent.generateDailyAdvice(input);
    expect(res.status).toBe("success");
    if (res.status !== "success") return;
    expect(res.data.warnings.some((w) => w.includes("天气数据缺失"))).toBe(true);
    expect(res.data.actions.length).toBeGreaterThan(0);
  });

  it("hot sunny day with high heat sensitivity -> move_to_shade + warning", async () => {
    const agent = new PlantAgent();
    const res = await agent.generateDailyAdvice(
      buildInput({
        profile: {
          ...monsteraProfile,
          weather_link_fields: {
            ...monsteraProfile.weather_link_fields,
            heat_sensitivity: "high",
            light_sensitivity: "high",
          },
        },
        today_context: {
          date: "2026-07-15",
          season: "summer",
          weather_snapshot: {
            condition: "sunny",
            temperature_c: 34,
            humidity: 55,
            light_level: "high",
          },
          recent_care_events: [
            { type: "watered", occurred_at: "2026-07-14T10:30:00Z" },
          ],
        },
      }),
    );
    expect(res.status).toBe("success");
    if (res.status !== "success") return;
    const actionTypes = res.data.actions.map((a) => a.type);
    expect(actionTypes).toContain("move_to_shade");
    expect(res.data.warnings).toContain("避免中午暴晒");
    expect(res.data.derived_context.temperature_risk).toBe("high");
  });

  it("recently watered overwatering-sensitive plant -> warning + skip_water", async () => {
    const agent = new PlantAgent();
    const res = await agent.generateDailyAdvice(
      buildInput({
        today_context: {
          date: "2026-04-18",
          season: "spring",
          weather_snapshot: {
            condition: "cloudy",
            temperature_c: 22,
            humidity: 70,
            light_level: "medium",
          },
          recent_care_events: [
            { type: "watered", occurred_at: "2026-04-17T20:00:00Z" },
          ],
        },
      }),
    );
    expect(res.status).toBe("success");
    if (res.status !== "success") return;
    expect(res.data.actions[0]!.type).toBe("skip_water");
    expect(
      res.data.warnings.some((w) => w.includes("最近刚浇过水")),
    ).toBe(true);
  });

  it("long time since watering on a hot day -> water_now high priority", async () => {
    const agent = new PlantAgent();
    const res = await agent.generateDailyAdvice(
      buildInput({
        today_context: {
          date: "2026-04-18",
          season: "spring",
          weather_snapshot: {
            condition: "sunny",
            temperature_c: 30,
            humidity: 35,
            light_level: "high",
          },
          recent_care_events: [
            { type: "watered", occurred_at: "2026-04-08T09:00:00Z" },
          ],
        },
      }),
    );
    expect(res.status).toBe("success");
    if (res.status !== "success") return;
    const water = res.data.actions.find(
      (a) => a.type === "water_now" || a.type === "water_check",
    );
    expect(water?.type).toBe("water_now");
    expect(water?.priority).toBe("high");
  });

  it("rejects invalid input", async () => {
    const agent = new PlantAgent();
    const res = await agent.generateDailyAdvice({});
    expect(res.status).toBe("failed");
  });
});
