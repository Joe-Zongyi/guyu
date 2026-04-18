import { describe, expect, it } from "vitest";
import { ClaudeVisionProvider } from "../src/providers/claude.js";
import { FakeImageGenerationProvider } from "../src/providers/fakeImageGeneration.js";
import {
  createImageGenerationProvider,
  createImageGenerationProviderFromEnv,
  createVisionProvider,
  createVisionProviderFromEnv,
  parseImageGenerationProviderConfigFromEnv,
  parseVisionProviderConfigFromEnv,
} from "../src/providers/factory.js";
import { FakeVisionProvider } from "../src/providers/fake.js";
import { GeminiVisionProvider } from "../src/providers/gemini.js";
import { OpenAICompatibleVisionProvider } from "../src/providers/openaiCompatible.js";
import { OpenRouterImageGenerationProvider } from "../src/providers/openRouterImageGeneration.js";

describe("vision provider config", () => {
  it("defaults to fake provider when env is missing", () => {
    expect(parseVisionProviderConfigFromEnv({})).toEqual({
      provider: "fake",
      timeoutMs: undefined,
    });
  });

  it("parses claude provider env", () => {
    expect(
      parseVisionProviderConfigFromEnv({
        PLANT_AGENT_VISION_PROVIDER: "claude",
        ANTHROPIC_API_KEY: "sk-ant",
        PLANT_AGENT_CLAUDE_MODEL: "claude-opus-4-7",
        ANTHROPIC_BASE_URL: "https://anthropic.example.com",
        PLANT_AGENT_VISION_TIMEOUT_MS: "15000",
      }),
    ).toEqual({
      provider: "claude",
      apiKey: "sk-ant",
      model: "claude-opus-4-7",
      timeoutMs: 15000,
      baseURL: "https://anthropic.example.com",
    });
  });

  it("parses openai-compatible env with model fallback", () => {
    expect(
      parseVisionProviderConfigFromEnv({
        PLANT_AGENT_VISION_PROVIDER: "openai-compatible",
        PLANT_AGENT_OPENAI_COMPATIBLE_API_KEY: "relay-key",
        PLANT_AGENT_OPENAI_COMPATIBLE_BASE_URL: "https://relay.example.com/v1",
        PLANT_AGENT_OPENAI_MODEL: "relay-model",
      }),
    ).toEqual({
      provider: "openai-compatible",
      apiKey: "relay-key",
      model: "relay-model",
      timeoutMs: undefined,
      baseURL: "https://relay.example.com/v1",
    });
  });

  it("rejects invalid vision timeout values", () => {
    expect(() =>
      parseVisionProviderConfigFromEnv({
        PLANT_AGENT_VISION_TIMEOUT_MS: "nope",
      }),
    ).toThrow("invalid PLANT_AGENT_VISION_TIMEOUT_MS: nope");
  });

  it("creates the expected provider classes", () => {
    expect(createVisionProvider({ provider: "fake" })).toBeInstanceOf(
      FakeVisionProvider,
    );
    expect(
      createVisionProvider({ provider: "claude", apiKey: "sk-ant" }),
    ).toBeInstanceOf(ClaudeVisionProvider);
    expect(
      createVisionProvider({ provider: "gemini", apiKey: "gk" }),
    ).toBeInstanceOf(GeminiVisionProvider);
    expect(
      createVisionProvider({ provider: "openai", apiKey: "sk-openai" }),
    ).toBeInstanceOf(OpenAICompatibleVisionProvider);
    expect(
      createVisionProvider({
        provider: "openai-compatible",
        apiKey: "relay-key",
        baseURL: "https://relay.example.com/v1",
      }),
    ).toBeInstanceOf(OpenAICompatibleVisionProvider);
  });

  it("creates providers from env", () => {
    expect(
      createVisionProviderFromEnv({
        PLANT_AGENT_VISION_PROVIDER: "gemini",
        GOOGLE_API_KEY: "gk",
      }),
    ).toBeInstanceOf(GeminiVisionProvider);
  });
});

describe("image generation provider config", () => {
  it("defaults to fake provider when env is missing", () => {
    expect(parseImageGenerationProviderConfigFromEnv({})).toEqual({
      provider: "fake",
      timeoutMs: undefined,
    });
  });

  it("parses openrouter env with default model", () => {
    expect(
      parseImageGenerationProviderConfigFromEnv({
        PLANT_AGENT_IMAGE_GENERATION_PROVIDER: "openrouter",
        OPENROUTER_API_KEY: "sk-or-test",
        OPENROUTER_BASE_URL: "https://relay.example.com/api/v1",
        PLANT_AGENT_IMAGE_GENERATION_TIMEOUT_MS: "25000",
      }),
    ).toEqual({
      provider: "openrouter",
      apiKey: "sk-or-test",
      model: "google/gemini-3.1-flash-image-preview",
      timeoutMs: 25000,
      baseUrl: "https://relay.example.com/api/v1",
    });
  });

  it("honors explicit openrouter model", () => {
    expect(
      parseImageGenerationProviderConfigFromEnv({
        PLANT_AGENT_IMAGE_GENERATION_PROVIDER: "openrouter",
        OPENROUTER_API_KEY: "sk-or-test",
        PLANT_AGENT_OPENROUTER_MODEL: "custom-model",
      }),
    ).toEqual({
      provider: "openrouter",
      apiKey: "sk-or-test",
      model: "custom-model",
      timeoutMs: undefined,
      baseUrl: undefined,
    });
  });

  it("rejects invalid image generation timeout values", () => {
    expect(() =>
      parseImageGenerationProviderConfigFromEnv({
        PLANT_AGENT_IMAGE_GENERATION_TIMEOUT_MS: "bad",
      }),
    ).toThrow("invalid PLANT_AGENT_IMAGE_GENERATION_TIMEOUT_MS: bad");
  });

  it("creates the expected image generation provider classes", () => {
    expect(
      createImageGenerationProvider({ provider: "fake" }),
    ).toBeInstanceOf(FakeImageGenerationProvider);
    expect(
      createImageGenerationProvider({
        provider: "openrouter",
        apiKey: "sk-or-test",
      }),
    ).toBeInstanceOf(OpenRouterImageGenerationProvider);
  });

  it("creates image generation providers from env", () => {
    expect(
      createImageGenerationProviderFromEnv({
        PLANT_AGENT_IMAGE_GENERATION_PROVIDER: "openrouter",
        OPENROUTER_API_KEY: "sk-or-test",
      }),
    ).toBeInstanceOf(OpenRouterImageGenerationProvider);
  });
});
