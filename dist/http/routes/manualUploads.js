import { respondJson } from "../response.js";
export async function handleManualUploadRequest(request, store) {
    if (request.method !== "POST") {
        return respondJson(405, {
            status: "failed",
            error_code: "PROVIDER_UNAVAILABLE",
            message: "method not allowed",
            request_id: "unknown",
        }, { Allow: "POST" });
    }
    let body;
    try {
        body = await request.json();
    }
    catch {
        return respondJson(400, {
            status: "failed",
            error_code: "PROVIDER_UNAVAILABLE",
            message: "invalid json body",
            request_id: "unknown",
        });
    }
    try {
        const input = body;
        const saved = store.save({
            dataBase64: input.image_base64 ?? "",
            mimeType: input.content_type ?? "",
            ...(typeof input.filename === "string" ? { filename: input.filename } : {}),
            ...(typeof input.width === "number" ? { width: input.width } : {}),
            ...(typeof input.height === "number" ? { height: input.height } : {}),
            ...(typeof input.captured_at === "string"
                ? { capturedAt: input.captured_at }
                : {}),
        });
        return respondJson(200, {
            status: "success",
            data: saved,
            request_id: "manual_upload",
        });
    }
    catch (error) {
        return respondJson(400, {
            status: "failed",
            error_code: "PROVIDER_UNAVAILABLE",
            message: error.message,
            request_id: "manual_upload",
        });
    }
}
//# sourceMappingURL=manualUploads.js.map