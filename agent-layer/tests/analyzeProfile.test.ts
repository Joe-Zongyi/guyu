import { describe, expect, it } from "vitest";
import { FakeVisionProvider } from "../src/providers/fake.js";
import { PlantAgent } from "../src/agent.js";
import {
  PlantProfileDraftSchema,
  ProfileResponseSchema,
} from "../src/schemas/index.js";

const baseInput = {
  user_id: "user_test",
  image: {
    file_id: "file_monstera_clear_001",
    url: "https://example.com/img.jpg",
    content_type: "image/jpeg",
    captured_at: "2026-04-18T09:00:00Z",
  },
  region: "Shanghai",
  request_id: "req_test_001",
};

function makeAgent() {
  return new PlantAgent({
    visionProvider: new FakeVisionProvider(),
    analyzeProfileDeps: { generateDraftId: () => "draft_test_fixed" },
  });
}

describe("analyze_profile", () => {
  it("identified path: stable confident species hit", async () => {
    const agent = makeAgent();
    const res = await agent.analyzeProfile(baseInput);
    expect(res.status).toBe("needs_confirmation");
    expect(ProfileResponseSchema.parse(res)).toBeTruthy();
    if (res.status !== "needs_confirmation") return;
    expect(res.data.recognition_status).toBe("identified");
    expect(res.data.taxonomy_id).toBe("monstera_deliciosa");
    expect(res.data.common_name).toBe("龟背竹");
    expect(res.data.confidence).toBeGreaterThanOrEqual(0.75);
    expect(res.data.profile_version).toBe("v1");
    expect(res.data.provider_metadata.prompt_version).toBe("profile-v1");
    expect(res.request_id).toBe("req_test_001");
    PlantProfileDraftSchema.parse(res.data);
  });

  it("ambiguous path: returns >=2 candidates and no top-level taxonomy", async () => {
    const agent = makeAgent();
    const res = await agent.analyzeProfile({
      ...baseInput,
      image: { ...baseInput.image, file_id: "file_ambiguous_pothos" },
    });
    expect(res.status).toBe("needs_confirmation");
    if (res.status !== "needs_confirmation") return;
    expect(res.data.recognition_status).toBe("ambiguous");
    expect(res.data.candidates.length).toBeGreaterThanOrEqual(2);
    expect(res.data.taxonomy_id).toBeUndefined();
  });

  it("low-confidence path: returns LOW_CONFIDENCE_MATCH failure", async () => {
    const agent = makeAgent();
    const res = await agent.analyzeProfile({
      ...baseInput,
      image: { ...baseInput.image, file_id: "file_lowconf_001" },
    });
    expect(res.status).toBe("failed");
    if (res.status !== "failed") return;
    expect(res.error_code).toBe("LOW_CONFIDENCE_MATCH");
  });

  it("blurry image fails with IMAGE_TOO_BLURRY", async () => {
    const agent = makeAgent();
    const res = await agent.analyzeProfile({
      ...baseInput,
      image: { ...baseInput.image, file_id: "file_blurry_001" },
    });
    expect(res.status).toBe("failed");
    if (res.status !== "failed") return;
    expect(res.error_code).toBe("IMAGE_TOO_BLURRY");
  });

  it("no plant fails with NO_PLANT_DETECTED", async () => {
    const agent = makeAgent();
    const res = await agent.analyzeProfile({
      ...baseInput,
      image: { ...baseInput.image, file_id: "file_noplant_001" },
    });
    expect(res.status).toBe("failed");
    if (res.status !== "failed") return;
    expect(res.error_code).toBe("NO_PLANT_DETECTED");
  });

  it("multiple plants fails with MULTIPLE_PLANTS_DETECTED", async () => {
    const agent = makeAgent();
    const res = await agent.analyzeProfile({
      ...baseInput,
      image: { ...baseInput.image, file_id: "file_multi_001" },
    });
    expect(res.status).toBe("failed");
    if (res.status !== "failed") return;
    expect(res.error_code).toBe("MULTIPLE_PLANTS_DETECTED");
  });

  it("provider timeout surfaces as PROVIDER_TIMEOUT", async () => {
    const agent = makeAgent();
    const res = await agent.analyzeProfile({
      ...baseInput,
      image: { ...baseInput.image, file_id: "file_timeout_001" },
    });
    expect(res.status).toBe("failed");
    if (res.status !== "failed") return;
    expect(res.error_code).toBe("PROVIDER_TIMEOUT");
  });

  it("does not invent species fields on unknown branch", async () => {
    const agent = new PlantAgent({
      visionProvider: new FakeVisionProvider(),
      analyzeProfileDeps: {
        generateDraftId: () => "draft_unknown",
        thresholds: { identifiedMin: 0.99, ambiguousMin: 0.9 },
      },
    });
    const res = await agent.analyzeProfile({
      ...baseInput,
      image: { ...baseInput.image, file_id: "file_lowconf_001" },
    });
    expect(res.status).toBe("failed");
    if (res.status !== "failed") return;
    expect(res.error_code).toBe("LOW_CONFIDENCE_MATCH");
  });
});
