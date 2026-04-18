import type { GeneratedImageStore, GeneratedImageStoreRequest } from "./types.js";
export interface PassthroughGeneratedImageStoreOptions {
    generateId?: (req: GeneratedImageStoreRequest) => string;
}
export declare class PassthroughGeneratedImageStore implements GeneratedImageStore {
    private readonly generateId;
    constructor(options?: PassthroughGeneratedImageStoreOptions);
    saveGeneratedImage(req: GeneratedImageStoreRequest): Promise<{
        height?: number | undefined;
        width?: number | undefined;
        content_type?: string | undefined;
        file_id: string;
        url: string;
    }>;
}
//# sourceMappingURL=passthrough.d.ts.map