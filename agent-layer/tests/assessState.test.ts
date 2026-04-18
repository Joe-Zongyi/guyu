import { describe, expect, it } from "vitest";
import { PlantAgent } from "../src/agent.js";
import { StateAssessmentResponseSchema } from "../src/schemas/index.js";

const baseInput = {
  plant_id: "plant_test_001",
  image: {
    file_id: "file_stable_001",
    captured_at: "2026-04-18T09:00:00Z",
  },
  profile: {
    taxonomy_id: "monstera_deliciosa",
    common_name: "龟背竹",
  },
  recent_assessments: [
    {
      overall_state: "stable" as const,
      signals: ["stable_appearance" as const],
      assessed_at: "2026-04-17T09:00:00Z",
    },
  ],
  request_id: "req_assess_001",
};

describe("assess_state", () => {
  it("stable image returns stable + same trend", async () => {
    const agent = new PlantAgent();
    const res = await agent.assessState(baseInput);
    expect(StateAssessmentResponseSchema.parse(res)).toBeTruthy();
    expect(res.status).toBe("success");
    if (res.status !== "success") return;
    expect(res.data.overall_state).toBe("stable");
    expect(res.data.signals).toContain("stable_appearance");
    expect(res.data.compare_to_previous).toBe("same");
    expect(res.data.escalation_flag).toBe(false);
  });

  it("multiple stress signals raise needs_attention + escalation", async () => {
    const agent = new PlantAgent();
    const res = await agent.assessState({
      ...baseInput,
      image: { ...baseInput.image, file_id: "file_wilt_droop_001" },
    });
    expect(res.status).toBe("success");
    if (res.status !== "success") return;
    expect(res.data.overall_state).toBe("needs_attention");
    expect(res.data.signals).toContain("slightly_wilted_leaves");
    expect(res.data.signals).toContain("leaf_droop");
    expect(res.data.escalation_flag).toBe(true);
    expect(res.data.compare_to_previous).toBe("worse");
  });

  it("low confidence walks the conservative path with unknown signal", async () => {
    const agent = new PlantAgent();
    const res = await agent.assessState({
      ...baseInput,
      image: { ...baseInput.image, file_id: "file_lowconf_001" },
    });
    expect(res.status).toBe("success");
    if (res.status !== "success") return;
    expect(res.data.signals).toEqual(["unknown"]);
    expect(res.data.overall_state).toBe("stable");
    expect(res.data.escalation_flag).toBe(false);
  });

  it("blurry image fails with IMAGE_TOO_BLURRY", async () => {
    const agent = new PlantAgent();
    const res = await agent.assessState({
      ...baseInput,
      image: { ...baseInput.image, file_id: "file_blurry_001" },
    });
    expect(res.status).toBe("failed");
    if (res.status !== "failed") return;
    expect(res.error_code).toBe("IMAGE_TOO_BLURRY");
  });

  it("no plant in image fails with NO_PLANT_DETECTED", async () => {
    const agent = new PlantAgent();
    const res = await agent.assessState({
      ...baseInput,
      image: { ...baseInput.image, file_id: "file_noplant_001" },
    });
    expect(res.status).toBe("failed");
    if (res.status !== "failed") return;
    expect(res.error_code).toBe("NO_PLANT_DETECTED");
  });

  it("provider unavailable surfaces as PROVIDER_UNAVAILABLE", async () => {
    const agent = new PlantAgent();
    const res = await agent.assessState({
      ...baseInput,
      image: { ...baseInput.image, file_id: "file_unavailable_001" },
    });
    expect(res.status).toBe("failed");
    if (res.status !== "failed") return;
    expect(res.error_code).toBe("PROVIDER_UNAVAILABLE");
  });

  it("only emits whitelisted signals", async () => {
    const agent = new PlantAgent();
    const res = await agent.assessState({
      ...baseInput,
      image: { ...baseInput.image, file_id: "file_growth_001" },
    });
    expect(res.status).toBe("success");
    if (res.status !== "success") return;
    const allowed = new Set([
      "slightly_wilted_leaves",
      "yellowing_tip",
      "leaf_droop",
      "new_growth_visible",
      "stable_appearance",
      "unknown",
    ]);
    for (const s of res.data.signals) {
      expect(allowed.has(s)).toBe(true);
    }
  });
});
