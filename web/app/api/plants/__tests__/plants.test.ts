import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

// Must mock fs/promises before importing modules that use it
vi.mock("node:fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn().mockRejectedValue(new Error("ENOENT")),
  writeFile: vi.fn().mockResolvedValue(undefined),
  access: vi.fn().mockRejectedValue(new Error("ENOENT")),
}));

import { POST } from "../route";
import { writeFile, readFile } from "node:fs/promises";

function createMockImageFile(name = "test.jpg") {
  const buffer = Buffer.from("fake-image-data");
  return new File([buffer], name, { type: "image/jpeg" });
}

function mockFetchWithResults() {
  return vi.fn().mockImplementation((url: string) => {
    if (typeof url === "string" && url.includes("/profile/analyze")) {
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
                care_baseline: {
                  watering_rule: "每周浇水1-2次，保持土壤微湿",
                  light_rule: "明亮散射光，避免直射",
                },
              },
            },
          }),
      } as Response);
    }
    if (typeof url === "string" && url.includes("/pixel-art/generate")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "success",
            data: {
              images: [
                { url: "/runtime/three-d-growth/uploads/pixel-test.png", file_id: "f1" },
              ],
            },
          }),
      } as Response);
    }
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
  });
}

// Helper to intercept writeFile calls and return the latest state on readFile
let currentState: Record<string, unknown> | null = null;

function setupStatefulReadFile() {
  currentState = null;

  vi.mocked(writeFile).mockImplementation(async (_path, data) => {
    const pathStr = String(_path);
    if (typeof data === "string" && pathStr.includes("state.json")) {
      const parsed = JSON.parse(data);
      currentState = parsed;
    }
  });

  vi.mocked(readFile).mockImplementation(async (filePath) => {
    const pathStr = String(filePath);
    if (pathStr.includes("state.json")) {
      if (currentState) {
        return Buffer.from(JSON.stringify(currentState));
      }
      throw new Error("ENOENT");
    }
    // For capture image bytes
    if (pathStr.includes("uploads")) {
      return Buffer.from("fake-image-data");
    }
    throw new Error("ENOENT");
  });
}

describe("POST /api/plants", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetchWithResults());
    setupStatefulReadFile();

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

  test("上传图片并返回植物信息、像素风图片和建模任务", async () => {
    const form = new FormData();
    form.append("image", createMockImageFile());

    const request = new Request("http://localhost/api/plants", {
      method: "POST",
      body: form,
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.plant).toBeDefined();
    expect(body.plant.name).toBe("龟背竹");
    expect(body.plant.scientificName).toBe("Monstera deliciosa");
    expect(body.plant.pixelArtUrl).toBeDefined();
    expect(body.plant.pixelArtUrl).toMatch(/pixel-test\.png/);

    expect(body.capture).toBeDefined();
    expect(body.capture.id).toBeDefined();
    expect(body.capture.imageUrl).toMatch(/^\/runtime\/three-d-growth\/uploads\//);

    expect(body.model).toBeDefined();
    expect(body.model.id).toBeDefined();
    expect(body.model.id).toMatch(/^model-/);
    expect(body.model.status).toBe("processing");
  });

  test("缺少图片返回 400", async () => {
    const form = new FormData();
    form.append("note", "no image");

    const request = new Request("http://localhost/api/plants", {
      method: "POST",
      body: form,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBe("缺少图片文件");
  });
});
