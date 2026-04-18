import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("node:fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn().mockRejectedValue(new Error("ENOENT")),
  writeFile: vi.fn().mockResolvedValue(undefined),
  access: vi.fn().mockRejectedValue(new Error("ENOENT")),
}));

import { GET } from "../route";
import { readFile } from "node:fs/promises";
import { clearStateCache } from "@/src/server/three-d-growth/storage";

describe("GET /api/three-d-growth", () => {
  beforeEach(() => {
    // Clear the in-memory state cache so each test starts fresh
    clearStateCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("返回完整状态快照", async () => {
    // GIVEN: A seeded state with captures and models
    const seededState = {
      plantId: "monstera-001",
      plantName: "龟背竹 Monstera",
      captures: [
        {
          id: "capture-001",
          plantId: "monstera-001",
          capturedAt: new Date().toISOString(),
          imageUrl: "/runtime/three-d-growth/uploads/test.png",
          angle: "front",
          title: "测试记录",
        },
      ],
      models: [
        {
          id: "model-001",
          plantId: "monstera-001",
          status: "draft",
          sourceCaptureIds: ["capture-001"],
          milestone: "第 1 次建模",
          summary: "等待生成",
          progress: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      careEvents: [
        {
          id: "care-001",
          plantId: "monstera-001",
          eventType: "watered",
          occurredAt: "2026-04-19T09:00:00.000Z",
          label: "浇水",
        },
      ],
      activeModelId: "model-001",
    };
    vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify(seededState));

    // WHEN: Calling GET handler
    const response = await GET(new Request("http://localhost/api/three-d-growth"));

    // THEN: Returns 200 with full state
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.plantId).toBe("monstera-001");
    expect(body.captures).toBeInstanceOf(Array);
    expect(body.captures.length).toBe(1);
    expect(body.models).toBeInstanceOf(Array);
    expect(body.models.length).toBe(1);
    expect(body.careEvents).toBeInstanceOf(Array);
    expect(body.careEvents.length).toBe(1);
    expect(body.careEvents[0].eventType).toBe("watered");
    expect(body.activeModelId).toBe("model-001");
  });

  test("状态文件不存在时返回初始状态", async () => {
    // GIVEN: State file does not exist
    vi.mocked(readFile).mockRejectedValueOnce(new Error("ENOENT"));

    // WHEN: Calling GET handler
    const response = await GET(new Request("http://localhost/api/three-d-growth"));

    // THEN: Returns 200 with initial empty state
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.plantId).toBe("monstera-001");
    expect(body.captures).toEqual([]);
    expect(body.models).toEqual([]);
    expect(body.careEvents).toEqual([]);
    expect(body.activeModelId).toBeUndefined();
  });
});
