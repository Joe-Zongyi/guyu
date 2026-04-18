import type { FileRef } from "../schemas/primitives.js";
import type { ResolveImageSource } from "../providers/imageSource.js";
export interface SaveManualUploadInput {
    dataBase64: string;
    mimeType: string;
    filename?: string;
    width?: number;
    height?: number;
    capturedAt?: string;
}
export interface SavedManualUpload {
    file: FileRef;
    filename?: string;
    size_bytes: number;
}
export declare class ManualUploadStore {
    private readonly uploads;
    save(input: SaveManualUploadInput): SavedManualUpload;
    get(fileId: string): SavedManualUpload | undefined;
    readonly resolveImage: ResolveImageSource;
}
//# sourceMappingURL=manualUploadStore.d.ts.map