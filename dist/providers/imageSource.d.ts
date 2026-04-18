import type { FileRef } from "../schemas/primitives.js";
export type ResolvedImageSource = {
    kind: "url";
    url: string;
    mimeType?: string;
} | {
    kind: "base64";
    data: string;
    mimeType: string;
};
export type ResolveImageSource = (image: FileRef) => Promise<ResolvedImageSource | undefined>;
export interface ImageSourceResolverOptions {
    resolveImage?: ResolveImageSource;
}
export declare function resolveImageSource(image: FileRef, options?: ImageSourceResolverOptions): Promise<ResolvedImageSource>;
//# sourceMappingURL=imageSource.d.ts.map