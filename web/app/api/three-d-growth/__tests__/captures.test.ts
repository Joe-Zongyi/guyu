import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

// Must mock fs/promises before importing modules that use it
vi.mock("node:fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn().mockRejectedValue(new Error("ENOENT")),
  writeFile: vi.fn().mockResolvedValue(undefined),
  access: vi.fn().mockRejectedValue(new Error("ENOENT")),
}));

import { POST } from "../captures/route";
import { writeFile, readFile } from "node:fs/promises";

function createMockImageFile(name = "test.jpg") {
  const buffer = Buffer.from("fake-image-data");
  return new File([buffer], name, { type: "image/jpeg" });
}

function mockFetchWithAgentResults() {
  return vi.fn().mockImplementation((url: string) => {
    if (url.includes("/profile/analyze")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "ok",
            request_id: "req_profile_001",
            data: {
              profile_draft: {
                species_id: "monstera-deliciosa",
                common_name: "龟背竹",
                scientific_name: "Monstera deliciosa",
              },
            },
          }),
      } as Response);
    }
    if (url.includes("/state/assess")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "ok",
            request_id: "req_state_001",
            data: {
              assessment: {
                overall_state: "healthy",
                signals: [{ signal: "叶片翠绿", confidence: 0.95 }],
                confidence: 0.92,
              },
            },
          }),
      } as Response);
    }
    return Promise.resolve({ ok: false, status: 404 } as Response);
  });
}

describe("POST /api/three-d-growth/captures", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetchWithAgentResults());
    vi.mocked(writeFile).mockClear();
    vi.mocked(readFile).mockClear();
    // Simulate fresh state (no state.json exists)
    vi.mocked(readFile).mockRejectedValue(new Error("ENOENT"));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("上传图片并触发 Agent 并行分析", async () => {
    const form = new FormData();
    form.append("image", createMockImageFile());
    form.append("plantId", "monstera-001");
    form.append("title", "测试记录");
    form.append("note", "测试备注");
    form.append("angle", "front");

    const request = new Request("http://localhost/api/three-d-growth/captures", {
      method: "POST",
      body: form,
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.capture).toBeDefined();
    expect(body.capture.imageUrl).toMatch(/^\/runtime\/three-d-growth\/uploads\//);
    expect(body.capture.agentAnalysis).toBeDefined();
    expect(body.capture.agentAnalysis.profile).toEqual({
      speciesId: "monstera-deliciosa",
      commonName: "龟背竹",
      scientificName: "Monstera deliciosa",
    });
    expect(body.capture.agentAnalysis.state).toEqual({
      overallState: "healthy",
      signals: [{ signal: "叶片翠绿", confidence: 0.95 }],
      confidence: 0.92,
    });
    expect(body.capture.agentAnalysis.analyzedAt).toBeDefined();
  });

  test("Agent 分析失败时仍保存 capture", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error"))
    );

    const form = new FormData();
    form.append("image", createMockImageFile());

    const request = new Request("http://localhost/api/three-d-growth/captures", {
      method: "POST",
      body: form,
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.capture).toBeDefined();
    expect(body.capture.agentAnalysis).toBeUndefined();
  });

  test("缺少图片返回 400", async () => {
    const form = new FormData();
    form.append("plantId", "monstera-001");

    const request = new Request("http://localhost/api/three-d-growth/captures", {
      method: "POST",
      body: form,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBe("缺少图片文件");
  });
});
