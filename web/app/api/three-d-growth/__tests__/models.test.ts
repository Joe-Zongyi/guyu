import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("node:fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn().mockRejectedValue(new Error("ENOENT")),
  writeFile: vi.fn().mockResolvedValue(undefined),
  access: vi.fn().mockRejectedValue(new Error("ENOENT")),
}));

import { POST } from "../models/route";
import { readFile } from "node:fs/promises";

describe("POST /api/three-d-growth/models", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (typeof url === "string" && url.includes("tencentcloudapi.com")) {
          return Promise.resolve({
            ok: true,
            text: () =>
              Promise.resolve(
                JSON.stringify({
                  Response: {
                    JobId: "job-12345",
                  },
                })
              ),
          } as Response);
        }
        return Promise.resolve({ ok: false, status: 404 } as Response);
      })
    );

    // Set required Tencent env vars so loadTencentEnv doesn't throw
    process.env.TENCENT_SECRET_ID = "test-secret-id";
    process.env.TENCENT_SECRET_KEY = "test-secret-key";
    process.env.TENCENT_REGION = "ap-guangzhou";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.TENCENT_SECRET_ID;
    delete process.env.TENCENT_SECRET_KEY;
    delete process.env.TENCENT_REGION;
  });

  test("发起建模任务", async () => {
    // GIVEN: A seeded state with one capture
    const seededState = {
      plantId: "monstera-001",
      plantName: "龟背竹 Monstera",
      captures: [
        {
          id: "capture-test-001",
          plantId: "monstera-001",
          capturedAt: new Date().toISOString(),
          imageUrl: "/runtime/three-d-growth/uploads/test.png",
          angle: "front" as const,
          title: "测试记录",
          note: "",
        },
      ],
      models: [],
    };

    // readFile is called for: state.json, then capture image bytes
    vi.mocked(readFile)
      .mockResolvedValueOnce(JSON.stringify(seededState))
      .mockResolvedValueOnce(Buffer.from("fake-image-data"));

    // WHEN: Requesting model generation
    const request = new Request("http://localhost/api/three-d-growth/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plantId: "monstera-001",
        sourceCaptureIds: ["capture-test-001"],
      }),
    });

    const response = await POST(request);

    // THEN: Returns 200 with a modelId
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.modelId).toBeDefined();
    expect(body.modelId).toMatch(/^model-/);
  });

  test("缺少参数返回 400", async () => {
    // GIVEN: Empty request body
    const request = new Request("http://localhost/api/three-d-growth/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    // WHEN: Calling POST handler
    const response = await POST(request);

    // THEN: Returns 400 with error message
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("缺少建模输入");
  });
});
