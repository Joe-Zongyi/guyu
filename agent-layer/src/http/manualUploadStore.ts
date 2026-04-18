import type { FileRef } from "../schemas/primitives.js";
import { newId } from "../util/id.js";
import type { ResolveImageSource } from "../providers/imageSource.js";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

interface StoredUpload {
  dataBase64: string;
  mimeType: string;
  sizeBytes: number;
  filename?: string;
  width?: number;
  height?: number;
  capturedAt?: string;
}

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

export class ManualUploadStore {
  private readonly uploads = new Map<string, StoredUpload>();

  save(input: SaveManualUploadInput): SavedManualUpload {
    const mimeType = input.mimeType.trim().toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new Error(`unsupported content_type: ${input.mimeType}`);
    }

    const dataBase64 = input.dataBase64.trim();
    if (!dataBase64) {
      throw new Error("empty image payload");
    }

    const bytes = Buffer.from(dataBase64, "base64");
    if (bytes.byteLength === 0) {
      throw new Error("invalid base64 image payload");
    }
    if (bytes.byteLength > MAX_UPLOAD_BYTES) {
      throw new Error(`image too large: max ${MAX_UPLOAD_BYTES} bytes`);
    }

    const fileId = newId("manual");
    const stored: StoredUpload = {
      dataBase64,
      mimeType,
      sizeBytes: bytes.byteLength,
      ...(input.filename ? { filename: input.filename } : {}),
      ...(input.width ? { width: input.width } : {}),
      ...(input.height ? { height: input.height } : {}),
      ...(input.capturedAt ? { capturedAt: input.capturedAt } : {}),
    };
    this.uploads.set(fileId, stored);

    return {
      file: {
        file_id: fileId,
        content_type: mimeType,
        ...(stored.width ? { width: stored.width } : {}),
        ...(stored.height ? { height: stored.height } : {}),
        ...(stored.capturedAt ? { captured_at: stored.capturedAt } : {}),
      },
      ...(stored.filename ? { filename: stored.filename } : {}),
      size_bytes: stored.sizeBytes,
    };
  }

  get(fileId: string): SavedManualUpload | undefined {
    const stored = this.uploads.get(fileId);
    if (!stored) return undefined;
    return {
      file: {
        file_id: fileId,
        content_type: stored.mimeType,
        ...(stored.width ? { width: stored.width } : {}),
        ...(stored.height ? { height: stored.height } : {}),
        ...(stored.capturedAt ? { captured_at: stored.capturedAt } : {}),
      },
      ...(stored.filename ? { filename: stored.filename } : {}),
      size_bytes: stored.sizeBytes,
    };
  }

  readonly resolveImage: ResolveImageSource = async (image) => {
    const stored = this.uploads.get(image.file_id);
    if (!stored) return undefined;
    return {
      kind: "base64",
      data: stored.dataBase64,
      mimeType: stored.mimeType,
    };
  };
}
