import { describe, expect, it } from "vitest";
import { PlantAgent } from "../src/agent.js";
import { createHttpServer } from "../src/http/server.js";
import { FakeGeneratedImageStore } from "../src/assets/fake.js";
import { FakeImageGenerationProvider } from "../src/providers/fakeImageGeneration.js";
import { FakeVisionProvider } from "../src/providers/fake.js";

async function startServer() {
  const agent = new PlantAgent({
    visionProvider: new FakeVisionProvider(),
    imageGenerationProvider: new FakeImageGenerationProvider(),
    generatedImageStore: new FakeGeneratedImageStore({
      generateId: ({ index }) => `generated_${index + 1}`,
    }),
  });
  const server = createHttpServer(agent);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("failed to bind test server");
  }
  const baseUrl = `http://127.0.0.1:${address.port}`;
  return {
    baseUrl,
    close: async () => {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    },
  };
}

describe("manual vision HTTP console", () => {
  it("serves the manual console html", async () => {
    const app = await startServer();
    try {
      const response = await fetch(`${app.baseUrl}/_manual/vision`);
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain("text/html");
      const text = await response.text();
      expect(text).toContain("Manual Vision Console");
      expect(text).toContain("/_manual/uploads");
    } finally {
      await app.close();
    }
  });

  it("uploads an image and uses the file in analyze/assess endpoints", async () => {
    const app = await startServer();
    try {
      const uploadResponse = await fetch(`${app.baseUrl}/_manual/uploads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: "leaf.png",
          content_type: "image/png",
          image_base64: Buffer.from("fake image bytes").toString("base64"),
        }),
      });
      expect(uploadResponse.status).toBe(200);
      const uploadPayload = await uploadResponse.json();
      expect(uploadPayload.status).toBe("success");
      expect(uploadPayload.data.file.file_id).toMatch(/^manual_/);

      const analyzeResponse = await fetch(`${app.baseUrl}/v1/plants/profile:analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "manual-user",
          region: "Shanghai",
          image: uploadPayload.data.file,
          request_id: "req_manual_analyze",
        }),
      });
      expect(analyzeResponse.status).toBe(200);
      const analyzePayload = await analyzeResponse.json();
      expect(analyzePayload.status).toBe("needs_confirmation");
      expect(analyzePayload.data.source_image_id).toBe(uploadPayload.data.file.file_id);
      expect(analyzePayload.data.provider_metadata.model).toBe("fake-vision-v1");

      const assessResponse = await fetch(`${app.baseUrl}/v1/plants/state:assess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plant_id: "plant_1",
          image: uploadPayload.data.file,
          profile: {
            taxonomy_id: "monstera_deliciosa",
            common_name: "龟背竹",
          },
          recent_assessments: [],
          request_id: "req_manual_assess",
        }),
      });
      expect(assessResponse.status).toBe(200);
      const assessPayload = await assessResponse.json();
      expect(assessPayload.status).toBe("success");
      expect(assessPayload.data.signals).toEqual(["stable_appearance"]);
    } finally {
      await app.close();
    }
  });

  it("rejects unsupported upload content types", async () => {
    const app = await startServer();
    try {
      const response = await fetch(`${app.baseUrl}/_manual/uploads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: "text/plain",
          image_base64: Buffer.from("not image").toString("base64"),
        }),
      });
      expect(response.status).toBe(400);
      const payload = await response.json();
      expect(payload.status).toBe("failed");
    } finally {
      await app.close();
    }
  });
});
