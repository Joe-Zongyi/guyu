import type { ResolveImageSource } from "./imageSource.js";
import type { ImageGenerationProvider } from "./imageGeneration.js";
import type { VisionProvider } from "./types.js";
export type VisionProviderKind = "fake" | "claude" | "gemini" | "openai" | "openai-compatible";
export interface VisionProviderCommonConfig {
    provider: VisionProviderKind;
    model?: string;
    timeoutMs?: number;
    resolveImage?: ResolveImageSource;
}
export interface FakeVisionProviderConfig extends VisionProviderCommonConfig {
    provider: "fake";
}
export interface ClaudeVisionProviderConfig extends VisionProviderCommonConfig {
    provider: "claude";
    apiKey: string;
    baseURL?: string;
}
export interface GeminiVisionProviderConfig extends VisionProviderCommonConfig {
    provider: "gemini";
    apiKey: string;
}
export interface OpenAICompatibleVisionProviderConfig extends VisionProviderCommonConfig {
    provider: "openai" | "openai-compatible";
    apiKey: string;
    baseURL?: string;
}
export type VisionProviderConfig = FakeVisionProviderConfig | ClaudeVisionProviderConfig | GeminiVisionProviderConfig | OpenAICompatibleVisionProviderConfig;
export type ImageGenerationProviderKind = "fake" | "openrouter";
export interface ImageGenerationProviderCommonConfig {
    provider: ImageGenerationProviderKind;
    model?: string;
    timeoutMs?: number;
}
export interface FakeImageGenerationProviderConfig extends ImageGenerationProviderCommonConfig {
    provider: "fake";
}
export interface OpenRouterImageGenerationProviderConfig extends ImageGenerationProviderCommonConfig {
    provider: "openrouter";
    apiKey: string;
    baseUrl?: string;
}
export type ImageGenerationProviderConfig = FakeImageGenerationProviderConfig | OpenRouterImageGenerationProviderConfig;
export interface ReadEnv {
    [key: string]: string | undefined;
}
export declare function parseVisionProviderConfigFromEnv(env?: ReadEnv): VisionProviderConfig;
export declare function createVisionProvider(config: VisionProviderConfig): VisionProvider;
export declare function createVisionProviderFromEnv(env?: ReadEnv, extras?: {
    resolveImage?: ResolveImageSource;
}): VisionProvider;
export declare function parseImageGenerationProviderConfigFromEnv(env?: ReadEnv): ImageGenerationProviderConfig;
export declare function createImageGenerationProvider(config: ImageGenerationProviderConfig): ImageGenerationProvider;
export declare function createImageGenerationProviderFromEnv(env?: ReadEnv): ImageGenerationProvider;
//# sourceMappingURL=config.d.ts.map