import { APIConnectionTimeoutError as AnthropicAPIConnectionTimeoutError } from "@anthropic-ai/sdk";
import { APIConnectionError as OpenAIAPIConnectionError } from "openai";
import { describe, expect, it } from "vitest";
import { ClaudeVisionProvider } from "../src/providers/claude.js";
import { GeminiVisionProvider } from "../src/providers/gemini.js";
import { OpenAICompatibleVisionProvider } from "../src/providers/openaiCompatible.js";

function createSdkError<T extends Error>(
  prototype: object,
  message: string,
): T {
  const error = Object.create(prototype) as Error;
  error.message = message;
  return error as T;
}

describe("real vision providers", () => {
  it("ClaudeVisionProvider normalizes identify responses", async () => {
    const provider = new ClaudeVisionProvider({ apiKey: "sk-ant" });
    let payload: unknown;

    (provider as unknown as { client: { messages: { create: (input: unknown) => Promise<unknown> } } }).client = {
      messages: {
        create: async (input) => {
          payload = input;
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  kind: "identified",
                  image_quality: "blurry",
                  detected_plant_count: 2.7,
                  candidates: [
                    { taxonomy_hint: " monstera deliciosa ", confidence: 1.4 },
                    { taxonomy_hint: "", confidence: 0.2 },
                    { taxonomy_hint: " pothos ", confidence: -0.3 },
                    { taxonomy_hint: " philodendron ", confidence: 0.4 },
                    { taxonomy_hint: " ficus ", confidence: 0.5 },
                    { taxonomy_hint: " extra ", confidence: 0.6 },
                  ],
                }),
              },
            ],
          };
        },
      },
    };

    const result = await provider.identifyPlant({
      request_id: "req_1",
      region: "Shanghai",
      image: {
        file_id: "file_1",
        url: "https://example.com/leaf.png",
      },
    });

    expect(payload).toMatchObject({
      system: expect.stringContaining("Shanghai"),
    });
    expect(result).toEqual({
      kind: "identified",
      image_quality: "blurry",
      detected_plant_count: 3,
      candidates: [
        { taxonomy_hint: "monstera deliciosa", confidence: 1 },
        { taxonomy_hint: "pothos", confidence: 0 },
        { taxonomy_hint: "philodendron", confidence: 0.4 },
        { taxonomy_hint: "ficus", confidence: 0.5 },
      ],
    });
  });

  it("ClaudeVisionProvider maps timeout errors", async () => {
    const provider = new ClaudeVisionProvider({ apiKey: "sk-ant" });

    (provider as unknown as { client: { messages: { create: () => Promise<never> } } }).client = {
      messages: {
        create: async () => {
          throw createSdkError<Error>(
            AnthropicAPIConnectionTimeoutError.prototype,
            "request timed out",
          );
        },
      },
    };

    await expect(
      provider.identifyPlant({
        request_id: "req_2",
        image: {
          file_id: "file_2",
          url: "https://example.com/leaf.png",
        },
      }),
    ).rejects.toMatchObject({ code: "PROVIDER_TIMEOUT" });
  });

  it("OpenAICompatibleVisionProvider uses data URLs and normalizes assess responses", async () => {
    const provider = new OpenAICompatibleVisionProvider({
      apiKey: "sk-openai",
      resolveImage: async () => ({
        kind: "base64",
        data: "YWJjMTIz",
        mimeType: "image/png",
      }),
    });
    let payload: unknown;

    (provider as unknown as { client: { responses: { create: (input: unknown) => Promise<unknown> } } }).client = {
      responses: {
        create: async (input) => {
          payload = input;
          return {
            output_text: JSON.stringify({
              signals: [
                { signal: " leaf_droop ", confidence: 1.5 },
                { signal: "", confidence: 0.2 },
              ],
              overall_confidence: -0.4,
              image_quality: "blurry",
              detected_plant: false,
              raw_notes: "watch drainage",
            }),
          };
        },
      },
    };

    const result = await provider.assessPlantState({
      request_id: "req_3",
      taxonomy_hint: "monstera deliciosa",
      image: {
        file_id: "file_3",
      },
    });

    expect(payload).toMatchObject({
      instructions: expect.stringContaining("monstera deliciosa"),
      input: [
        {
          role: "user",
          content: [
            expect.anything(),
            expect.objectContaining({
              type: "input_image",
              image_url: "data:image/png;base64,YWJjMTIz",
            }),
          ],
        },
      ],
    });
    expect(result).toEqual({
      signals: [{ signal: "leaf_droop", confidence: 1 }],
      overall_confidence: 0,
      image_quality: "blurry",
      detected_plant: false,
      raw_notes: "watch drainage",
    });
  });

  it("OpenAICompatibleVisionProvider maps connection errors", async () => {
    const provider = new OpenAICompatibleVisionProvider({
      apiKey: "sk-openai",
    });

    (provider as unknown as { client: { responses: { create: () => Promise<never> } } }).client = {
      responses: {
        create: async () => {
          throw createSdkError<Error>(
            OpenAIAPIConnectionError.prototype,
            "connection lost",
          );
        },
      },
    };

    await expect(
      provider.identifyPlant({
        request_id: "req_4",
        image: {
          file_id: "file_4",
          url: "https://example.com/leaf.png",
        },
      }),
    ).rejects.toMatchObject({ code: "PROVIDER_UNAVAILABLE" });
  });

  it("GeminiVisionProvider normalizes identify responses", async () => {
    const provider = new GeminiVisionProvider({
      apiKey: "gk",
      timeoutMs: 4321,
      resolveImage: async () => ({
        kind: "url",
        url: "https://example.com/leaf.png",
      }),
    });
    let payload: unknown;

    (provider as unknown as { client: { models: { generateContent: (input: unknown) => Promise<unknown> } } }).client = {
      models: {
        generateContent: async (input) => {
          payload = input;
          return {
            text: JSON.stringify({
              kind: "identified",
              image_quality: "ok",
              detected_plant_count: 1.2,
              candidates: [
                { taxonomy_hint: " ficus lyrata ", confidence: 0.42 },
              ],
            }),
          };
        },
      },
    };

    const result = await provider.identifyPlant({
      request_id: "req_5",
      region: "Hangzhou",
      image: {
        file_id: "file_5",
      },
    });

    expect(payload).toMatchObject({
      config: {
        systemInstruction: expect.stringContaining("Hangzhou"),
        responseMimeType: "application/json",
        httpOptions: { timeout: 4321 },
      },
    });
    expect(result).toEqual({
      kind: "identified",
      image_quality: "ok",
      detected_plant_count: 1,
      candidates: [{ taxonomy_hint: "ficus lyrata", confidence: 0.42 }],
    });
  });

  it("GeminiVisionProvider preserves local image-source errors", async () => {
    const provider = new GeminiVisionProvider({ apiKey: "gk" });

    await expect(
      provider.identifyPlant({
        request_id: "req_6",
        image: {
          file_id: "file_6",
        },
      }),
    ).rejects.toThrow("provide image.url or resolveImage");
  });

  it("GeminiVisionProvider maps timeout messages", async () => {
    const provider = new GeminiVisionProvider({ apiKey: "gk" });

    (provider as unknown as { client: { models: { generateContent: () => Promise<never> } } }).client = {
      models: {
        generateContent: async () => {
          throw new Error("request timed out");
        },
      },
    };

    await expect(
      provider.identifyPlant({
        request_id: "req_7",
        image: {
          file_id: "file_7",
          url: "https://example.com/leaf.png",
        },
      }),
    ).rejects.toMatchObject({ code: "PROVIDER_TIMEOUT" });
  });
});
