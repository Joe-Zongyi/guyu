import { describe, expect, it } from "vitest";
import { resolveImageSource } from "../src/providers/imageSource.js";

describe("resolveImageSource", () => {
  it("prefers image url from the request", async () => {
    await expect(
      resolveImageSource({
        file_id: "file_1",
        url: "https://example.com/plant.jpg",
        content_type: "image/jpeg",
      }),
    ).resolves.toEqual({
      kind: "url",
      url: "https://example.com/plant.jpg",
      mimeType: "image/jpeg",
    });
  });

  it("falls back to resolveImage when url is absent", async () => {
    const resolved = await resolveImageSource(
      {
        file_id: "file_2",
      },
      {
        resolveImage: async (image) => ({
          kind: "base64",
          data: `${image.file_id}-base64`,
          mimeType: "image/png",
        }),
      },
    );

    expect(resolved).toEqual({
      kind: "base64",
      data: "file_2-base64",
      mimeType: "image/png",
    });
  });

  it("throws when no image source is available", async () => {
    await expect(
      resolveImageSource({
        file_id: "file_3",
      }),
    ).rejects.toThrow(
      "image source unavailable for file_id file_3: provide image.url or resolveImage",
    );
  });
});
