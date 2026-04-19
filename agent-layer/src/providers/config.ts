import { FakeVisionProvider } from "./fake.js";
import { ClaudeVisionProvider } from "./claude.js";
import { GeminiVisionProvider } from "./gemini.js";
import { OpenAICompatibleVisionProvider } from "./openaiCompatible.js";
import { FakeImageGenerationProvider } from "./fakeImageGeneration.js";
import { OpenRouterImageGenerationProvider } from "./openRouterImageGeneration.js";
import type { ResolveImageSource } from "./imageSource.js";
import type { ImageGenerationProvider } from "./imageGeneration.js";
import type { VisionProvider } from "./types.js";

export type VisionProviderKind =
  | "fake"
  | "claude"
  | "gemini"
  | "openai"
  | "openai-compatible";

export interface VisionProviderCommonConfig {
  provider: VisionProviderKind;
  model?: string;
  timeoutMs?: number;
  resolveImage?: ResolveImageSource;
}

export interface FakeVisionProviderConfig extends VisionProviderCommonConfig {
  provider: "fake";
}

export interface ClaudeVisionProviderConfig
  extends VisionProviderCommonConfig {
  provider: "claude";
  apiKey: string;
  baseURL?: string;
}

export interface GeminiVisionProviderConfig
  extends VisionProviderCommonConfig {
  provider: "gemini";
  apiKey: string;
}

export interface OpenAICompatibleVisionProviderConfig
  extends VisionProviderCommonConfig {
  provider: "openai" | "openai-compatible";
  apiKey: string;
  baseURL?: string;
}

export type VisionProviderConfig =
  | FakeVisionProviderConfig
  | ClaudeVisionProviderConfig
  | GeminiVisionProviderConfig
  | OpenAICompatibleVisionProviderConfig;

export type ImageGenerationProviderKind = "fake" | "openrouter";

export interface ImageGenerationProviderCommonConfig {
  provider: ImageGenerationProviderKind;
  model?: string;
  timeoutMs?: number;
}

export interface FakeImageGenerationProviderConfig
  extends ImageGenerationProviderCommonConfig {
  provider: "fake";
}

export interface OpenRouterImageGenerationProviderConfig
  extends ImageGenerationProviderCommonConfig {
  provider: "openrouter";
  apiKey: string;
  baseUrl?: string;
}

export type ImageGenerationProviderConfig =
  | FakeImageGenerationProviderConfig
  | OpenRouterImageGenerationProviderConfig;

export interface ReadEnv {
  [key: string]: string | undefined;
}

export function parseVisionProviderConfigFromEnv(
  env: ReadEnv = process.env,
): VisionProviderConfig {
  const provider = normalizeProvider(env.PLANT_AGENT_VISION_PROVIDER);
  const timeoutMs = parseTimeout(
    env.PLANT_AGENT_VISION_TIMEOUT_MS,
    "PLANT_AGENT_VISION_TIMEOUT_MS",
  );

  switch (provider) {
    case "claude":
      return {
        provider,
        apiKey: requireEnv(env, "ANTHROPIC_API_KEY"),
        model: env.PLANT_AGENT_CLAUDE_MODEL ?? "claude-opus-4-7",
        timeoutMs,
        baseURL: env.ANTHROPIC_BASE_URL,
      };
    case "gemini":
      return {
        provider,
        apiKey: requireEnv(env, "GOOGLE_API_KEY"),
        model: env.PLANT_AGENT_GEMINI_MODEL ?? "gemini-2.5-flash",
        timeoutMs,
      };
    case "openai":
      return {
        provider,
        apiKey: requireEnv(env, "OPENAI_API_KEY"),
        model: env.PLANT_AGENT_OPENAI_MODEL ?? "gpt-4.1",
        timeoutMs,
        baseURL: env.OPENAI_BASE_URL,
      };
    case "openai-compatible":
      return {
        provider,
        apiKey: requireEnv(
          env,
          "PLANT_AGENT_OPENAI_COMPATIBLE_API_KEY",
        ),
        model:
          env.PLANT_AGENT_OPENAI_COMPATIBLE_MODEL ?? env.PLANT_AGENT_OPENAI_MODEL ?? "gpt-4.1",
        timeoutMs,
        baseURL: requireEnv(env, "PLANT_AGENT_OPENAI_COMPATIBLE_BASE_URL"),
      };
    case "fake":
    default:
      return {
        provider: "fake",
        timeoutMs,
      };
  }
}

export function createVisionProvider(
  config: VisionProviderConfig,
): VisionProvider {
  switch (config.provider) {
    case "fake":
      return new FakeVisionProvider();
    case "claude":
      return new ClaudeVisionProvider(config);
    case "gemini":
      return new GeminiVisionProvider(config);
    case "openai":
    case "openai-compatible":
      return new OpenAICompatibleVisionProvider(config);
  }
}

export function createVisionProviderFromEnv(
  env: ReadEnv = process.env,
  extras: { resolveImage?: ResolveImageSource } = {},
): VisionProvider {
  const config = parseVisionProviderConfigFromEnv(env);
  return createVisionProvider(
    extras.resolveImage ? { ...config, resolveImage: extras.resolveImage } : config,
  );
}

export function parseImageGenerationProviderConfigFromEnv(
  env: ReadEnv = process.env,
): ImageGenerationProviderConfig {
  const provider = normalizeImageGenerationProvider(
    env.PLANT_AGENT_IMAGE_GENERATION_PROVIDER,
  );
  const timeoutMs = parseTimeout(
    env.PLANT_AGENT_IMAGE_GENERATION_TIMEOUT_MS,
    "PLANT_AGENT_IMAGE_GENERATION_TIMEOUT_MS",
  );

  switch (provider) {
    case "openrouter":
      return {
        provider,
        apiKey: requireEnv(env, "OPENROUTER_API_KEY"),
        model:
          env.PLANT_AGENT_OPENROUTER_MODEL ??
          "google/gemini-3.1-flash-image-preview",
        timeoutMs,
        baseUrl: env.PLANT_AGENT_OPENROUTER_BASE_URL ?? env.OPENROUTER_BASE_URL,
      };
    case "fake":
    default:
      return {
        provider: "fake",
        timeoutMs,
      };
  }
}

export function createImageGenerationProvider(
  config: ImageGenerationProviderConfig,
): ImageGenerationProvider {
  switch (config.provider) {
    case "fake":
      return new FakeImageGenerationProvider();
    case "openrouter":
      return new OpenRouterImageGenerationProvider(config);
  }
}

export function createImageGenerationProviderFromEnv(
  env: ReadEnv = process.env,
): ImageGenerationProvider {
  return createImageGenerationProvider(
    parseImageGenerationProviderConfigFromEnv(env),
  );
}

function normalizeProvider(input?: string): VisionProviderKind {
  const value = input?.trim().toLowerCase();
  if (
    value === "claude" ||
    value === "gemini" ||
    value === "openai" ||
    value === "openai-compatible" ||
    value === "fake"
  ) {
    return value;
  }
  return "fake";
}

function normalizeImageGenerationProvider(
  input?: string,
): ImageGenerationProviderKind {
  const value = input?.trim().toLowerCase();
  if (value === "openrouter" || value === "fake") {
    return value;
  }
  return "fake";
}

function parseTimeout(input?: string, envName = "timeout"): number | undefined {
  if (!input) return undefined;
  const timeoutMs = Number.parseInt(input, 10);
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error(`invalid ${envName}: ${input}`);
  }
  return timeoutMs;
}

function requireEnv(env: ReadEnv, key: string): string {
  const value = env[key]?.trim();
  if (!value) {
    throw new Error(`missing required environment variable: ${key}`);
  }
  return value;
}
