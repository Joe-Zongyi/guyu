import type { GeneratedImageStore, GeneratedImageStoreRequest } from "./types.js";
export interface FakeGeneratedImageStoreOptions {
    baseUrl?: string;
    generateId?: (req: GeneratedImageStoreRequest) => string;
}
export declare class FakeGeneratedImageStore implements GeneratedImageStore {
    private readonly baseUrl;
    private readonly generateId;
    constructor(options?: FakeGeneratedImageStoreOptions);
    saveGeneratedImage(req: GeneratedImageStoreRequest): Promise<{
        height?: number | undefined;
        width?: number | undefined;
        content_type?: string | undefined;
        file_id: string;
        url: string;
    }>;
}
//# sourceMappingURL=fake.d.ts.map