import { describe, expect, it } from "vitest";
import { FakeGeneratedImageStore } from "../src/assets/fake.js";
import { FakeImageGenerationProvider } from "../src/providers/fakeImageGeneration.js";
import { PlantAgent } from "../src/agent.js";
import { handlePixelArtRequest } from "../src/http/routes/pixelArt.js";

function makeAgent() {
  return new PlantAgent({
    imageGenerationProvider: new FakeImageGenerationProvider(),
    generatedImageStore: new FakeGeneratedImageStore({
      generateId: ({ index }) => `generated_${index + 1}`,
    }),
  });
}

describe("pixel-art HTTP route", () => {
  it("returns success envelope for POST requests", async () => {
    const request = new Request(
      "http://localhost/v1/images/pixel-art:generate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: {
            file_id: "file_http_001",
            url: "https://example.com/source.png",
          },
          style_references: [],
          variants: 2,
          request_id: "req_http_001",
        }),
      },
    );

    const response = await handlePixelArtRequest(request, makeAgent());
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.status).toBe("success");
    expect(payload.data.images).toHaveLength(2);
    expect(payload.data.images[0].file_id).toBe("generated_1");
    expect(payload.data.images[0].url).toMatch(/^https:\/\//);
  });

  it("rejects unsupported methods", async () => {
    const request = new Request(
      "http://localhost/v1/images/pixel-art:generate",
      { method: "GET" },
    );

    const response = await handlePixelArtRequest(request, makeAgent());
    expect(response.status).toBe(405);
  });

  it("rejects invalid JSON", async () => {
    const request = new Request(
      "http://localhost/v1/images/pixel-art:generate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not json",
      },
    );

    const response = await handlePixelArtRequest(request, makeAgent());
    expect(response.status).toBe(400);
  });
});
