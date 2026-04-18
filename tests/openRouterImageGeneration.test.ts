import { afterEach, describe, expect, it, vi } from "vitest";
import { OpenRouterImageGenerationProvider } from "../src/providers/openRouterImageGeneration.js";

const originalFetch = globalThis.fetch;

describe("OpenRouterImageGenerationProvider", () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("maps a chat completion image response into generated drafts", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              images: [
                {
                  type: "image_url",
                  image_url: {
                    url: "data:image/png;base64,ZmFrZQ==",
                  },
                },
              ],
            },
          },
        ],
      }),
    });
    globalThis.fetch = fetchMock as typeof fetch;

    const provider = new OpenRouterImageGenerationProvider({
      apiKey: "test-key",
      model: "test-model",
    });

    const result = await provider.generatePixelArt({
      image: {
        file_id: "file_x",
        url: "https://example.com/source.png",
      },
      style_references: [
        {
          file_id: "style_1",
          url: "https://example.com/style.png",
        },
      ],
      prompt: "Use pixel art.",
      variants: 1,
      request_id: "req_123",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toMatchObject({
      model: "test-model",
      modalities: ["image"],
    });
    expect(result).toEqual([
      {
        url: "data:image/png;base64,ZmFrZQ==",
        content_type: "image/png",
      },
    ]);
  });

  it("maps a markdown image response into generated drafts", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: "![image](data:image/png;base64,ZmFrZQ==)",
            },
          },
        ],
      }),
    });
    globalThis.fetch = fetchMock as typeof fetch;

    const provider = new OpenRouterImageGenerationProvider({
      apiKey: "test-key",
      model: "test-model",
    });

    const result = await provider.generatePixelArt({
      image: {
        file_id: "file_x",
        url: "https://example.com/source.png",
      },
      request_id: "req_123",
    });

    expect(result).toEqual([
      {
        url: "data:image/png;base64,ZmFrZQ==",
        content_type: "image/png",
      },
    ]);
  });

    const provider = new OpenRouterImageGenerationProvider({
      apiKey: "test-key",
    });

    await expect(
      provider.generatePixelArt({
        image: { file_id: "file_x" },
        request_id: "req_123",
      }),
    ).rejects.toMatchObject({ code: "PROVIDER_UNAVAILABLE" });

    await expect(
      provider.generatePixelArt({
        image: { file_id: "file_x", url: "https://example.com/source.png" },
        style_references: [{ file_id: "style_1" }],
        request_id: "req_123",
      }),
    ).rejects.toMatchObject({ code: "PROVIDER_UNAVAILABLE" });
  });
});
