import { describe, expect, it } from "vitest";
import {
  PlantAgent,
  PixelArtGenerationResponseSchema,
} from "../src/index.js";

const baseInput = {
  image: {
    file_id: "file_pixel_source_001",
    url: "https://example.com/source.png",
    content_type: "image/png",
  },
  style_references: [
    {
      file_id: "file_style_001",
      url: "https://example.com/style-1.png",
      content_type: "image/png",
    },
  ],
  prompt: "Prefer a bonsai-like silhouette.",
  variants: 2,
  request_id: "req_pixel_001",
};

describe("generate_pixel_art", () => {
  it("returns success and validates against schema", async () => {
    const agent = new PlantAgent();
    const res = await agent.generatePixelArt(baseInput);
    expect(PixelArtGenerationResponseSchema.parse(res)).toBeTruthy();
    expect(res.status).toBe("success");
    if (res.status !== "success") return;
    expect(res.data.style).toBe("pixel_art");
    expect(res.data.images).toHaveLength(2);
    expect(res.data.images[0]?.file_id).toBeTruthy();
    expect(res.data.images[0]?.url).toMatch(/^https:\/\//);
  });

  it("surfaces provider timeout as PROVIDER_TIMEOUT", async () => {
    const agent = new PlantAgent();
    const res = await agent.generatePixelArt({
      ...baseInput,
      image: { ...baseInput.image, file_id: "file_timeout_001" },
    });
    expect(res.status).toBe("failed");
    if (res.status !== "failed") return;
    expect(res.error_code).toBe("PROVIDER_TIMEOUT");
  });

  it("defaults to one variant when omitted", async () => {
    const agent = new PlantAgent();
    const { variants, ...input } = baseInput;
    void variants;
    const res = await agent.generatePixelArt(input);
    expect(res.status).toBe("success");
    if (res.status !== "success") return;
    expect(res.data.images).toHaveLength(1);
  });

  it("rejects invalid input", async () => {
    const agent = new PlantAgent();
    const res = await agent.generatePixelArt({});
    expect(res.status).toBe("failed");
  });
});
