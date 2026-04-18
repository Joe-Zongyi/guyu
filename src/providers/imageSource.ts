import type { FileRef } from "../schemas/primitives.js";

export type ResolvedImageSource =
  | { kind: "url"; url: string; mimeType?: string }
  | { kind: "base64"; data: string; mimeType: string };

export type ResolveImageSource = (
  image: FileRef,
) => Promise<ResolvedImageSource | undefined>;

export interface ImageSourceResolverOptions {
  resolveImage?: ResolveImageSource;
}

export async function resolveImageSource(
  image: FileRef,
  options: ImageSourceResolverOptions = {},
): Promise<ResolvedImageSource> {
  if (image.url) {
    return {
      kind: "url",
      url: image.url,
      ...(image.content_type ? { mimeType: image.content_type } : {}),
    };
  }

  const resolved = await options.resolveImage?.(image);
  if (resolved) {
    return resolved;
  }

  throw new Error(
    `image source unavailable for file_id ${image.file_id}: provide image.url or resolveImage`,
  );
}
