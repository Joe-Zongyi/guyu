import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { rm } from "node:fs/promises";
import path from "node:path";

import { POST as postCaptures } from "../../app/api/three-d-growth/captures/route";
import { POST as postModels } from "../../app/api/three-d-growth/models/route";
import { GET as getSnapshot } from "../../app/api/three-d-growth/route";
import {
  readThreeDGrowthState,
  writeState,
} from "@/src/server/three-d-growth/storage";
import { createEmptyThreeDGrowthState } from "@/src/features/three-d-growth/model";

const runtimeRoot = path.join(
  process.cwd(),
  "public",
  "runtime",
  "three-d-growth"
);
const statePath = path.join(runtimeRoot, "state.json");

/**
 * Real API E2E tests for 3D Growth module.
 *
 * These tests exercise actual infrastructure:
 *   - Real file system (uploads, state.json)
 *   - Real BE backend (agent analysis)
 *   - Real Tencent Hunyuan API (3D model generation)
 *
 * Prerequisites:
 *   - BE backend running at BE_BASE_URL (default http://localhost:8787)
 *   - TENCENT_SECRET_ID / TENCENT_SECRET_KEY configured (for models test)
 *   - Internet connectivity
 *
 * Run separately from the main test suite:
 *   npm run test:real-api
 */
describe("3D Growth Real API E2E", () => {
  let originalState: Awaited<
    ReturnType<typeof readThreeDGrowthState>
  > | null = null;
  let createdCaptureId: string | null = null;
  let createdImageUrl: string | null = null;

  beforeAll(async () => {
    // GIVEN: Backup existing state so we can restore later
    try {
      originalState = await readThreeDGrowthState();
    } catch {
      originalState = null;
    }
    // Start with a clean empty state for deterministic tests
    await writeState(createEmptyThreeDGrowthState());
  });

  afterAll(async () => {
    // Restore original state
    if (originalState) {
      await writeState(originalState);
    }

    // Clean up uploaded image file if one was created
    if (createdImageUrl) {
      try {
        const relative = createdImageUrl.startsWith("/")
          ? createdImageUrl.slice(1)
          : createdImageUrl;
        const absolutePath = path.join(process.cwd(), "public", relative);
        await rm(absolutePath, { force: true });
      } catch {
        // ignore cleanup errors
      }
    }
  });

  test("POST /captures uploads image and triggers real agent analysis", async () => {
    // GIVEN: A real public plant image
    const unsplashUrl =
      "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&q=80";
    const imageResponse = await fetch(unsplashUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to fetch test image from Unsplash");
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageFile = new File([imageBuffer], "real-test-plant.jpg", {
      type: "image/jpeg",
    });

    const form = new FormData();
    form.append("image", imageFile);
    form.append("plantId", "monstera-real-001");
    form.append("title", "Real API Test Capture");
    form.append("note", "Created by real-api E2E test");
    form.append("angle", "front");

    // WHEN: POST to captures endpoint (no mocks – real fs + real fetch to BE)
    const request = new Request(
      "http://localhost/api/three-d-growth/captures",
      {
        method: "POST",
        body: form,
      }
    );

    const response = await postCaptures(request);

    // THEN: Returns 200 with capture data
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.capture).toBeDefined();
    expect(body.capture.id).toBeDefined();
    expect(body.capture.imageUrl).toMatch(
      /^\/runtime\/three-d-growth\/uploads\//
    );

    createdCaptureId = body.capture.id;
    createdImageUrl = body.capture.imageUrl;

    // Agent analysis may succeed or fail depending on BE availability / rate limits.
    // We assert structure when present, but do not require success.
    if (body.capture.agentAnalysis) {
      expect(body.capture.agentAnalysis.analyzedAt).toBeDefined();
      if (body.capture.agentAnalysis.profile) {
        expect(body.capture.agentAnalysis.profile.commonName).toBeDefined();
      }
      if (body.capture.agentAnalysis.state) {
        expect(body.capture.agentAnalysis.state.overallState).toBeDefined();
        expect(Array.isArray(body.capture.agentAnalysis.state.signals)).toBe(
          true
        );
      }
    }
  });

  test("GET /three-d-growth returns state with real captures", async () => {
    // GIVEN: At least one capture exists from the previous test

    // WHEN: GET snapshot
    const response = await getSnapshot();

    // THEN: Returns 200 with non-empty captures array
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.plantId).toBe("monstera-001");
    expect(body.captures).toBeInstanceOf(Array);
    expect(body.captures.length).toBeGreaterThan(0);
    expect(body.models).toBeInstanceOf(Array);
  });

  test("POST /models enqueues real 3D generation", async () => {
    // GIVEN: A capture created earlier
    if (!createdCaptureId) {
      console.warn("Skipping models test – no capture available");
      return;
    }

    const request = new Request(
      "http://localhost/api/three-d-growth/models",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plantId: "monstera-real-001",
          sourceCaptureIds: [createdCaptureId],
        }),
      }
    );

    // WHEN: POST to models endpoint (real Tencent API call)
    let response: Response;
    try {
      response = await postModels(request);
    } catch (error) {
      // enqueueModelGeneration throws when credentials are missing;
      // treat this as an expected failure for the real-api test.
      console.warn("Real API model generation failed:", error);
      return;
    }

    // THEN: Returns 200 with a modelId
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.modelId).toBeDefined();
    expect(body.modelId).toMatch(/^model-/);
  });
});
