import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("node:fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn().mockRejectedValue(new Error("ENOENT")),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "../care-events/route";
import { readFile } from "node:fs/promises";
import { clearStateCache } from "@/src/server/three-d-growth/storage";

describe("POST /api/three-d-growth/care-events", () => {
  beforeEach(() => {
    clearStateCache();
    vi.mocked(readFile).mockRejectedValue(new Error("ENOENT"));
  });

  test("记录浇水事件并返回事件内容", async () => {
    const request = new Request("http://localhost/api/three-d-growth/care-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plantId: "monstera-001",
        eventType: "watered",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.event).toBeDefined();
    expect(body.event.plantId).toBe("monstera-001");
    expect(body.event.eventType).toBe("watered");
    expect(body.event.label).toBe("浇水");
    expect(body.snapshot.careEvents).toHaveLength(1);
  });

  test("缺少 plantId 时返回 400", async () => {
    const request = new Request("http://localhost/api/three-d-growth/care-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventType: "watered",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBe("缺少植物 ID");
  });
});
