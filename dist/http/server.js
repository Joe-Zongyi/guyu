import { createServer } from "node:http";
import { PlantAgent } from "../agent.js";
import { createImageGenerationProviderFromEnv, createVisionProviderFromEnv, } from "../providers/factory.js";
import { ManualUploadStore } from "./manualUploadStore.js";
import { handleAnalyzeProfileRequest } from "./routes/analyzeProfile.js";
import { handleAssessStateRequest } from "./routes/assessState.js";
import { handleManualUploadRequest } from "./routes/manualUploads.js";
import { handleManualVisionConsoleRequest } from "./routes/manualVisionConsole.js";
import { handlePixelArtRequest } from "./routes/pixelArt.js";
async function readBody(req) {
    return await new Promise((resolve, reject) => {
        let data = "";
        req.setEncoding("utf8");
        req.on("data", (chunk) => {
            data += chunk;
        });
        req.on("end", () => resolve(data));
        req.on("error", reject);
    });
}
function toHeaders(headers) {
    const result = new Headers();
    for (const [key, value] of Object.entries(headers)) {
        if (value === undefined)
            continue;
        if (Array.isArray(value)) {
            for (const item of value)
                result.append(key, item);
            continue;
        }
        result.set(key, value);
    }
    return result;
}
function notFoundResponse() {
    return new Response(JSON.stringify({
        status: "failed",
        error_code: "PROVIDER_UNAVAILABLE",
        message: "not found",
        request_id: "unknown",
    }), {
        status: 404,
        headers: { "Content-Type": "application/json; charset=utf-8" },
    });
}
export function createHttpServer(agent) {
    const uploadStore = new ManualUploadStore();
    const resolvedAgent = agent ??
        new PlantAgent({
            visionProvider: createVisionProviderFromEnv(process.env, {
                resolveImage: uploadStore.resolveImage,
            }),
            imageGenerationProvider: createImageGenerationProviderFromEnv(process.env),
        });
    return createServer(async (req, res) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        const body = await readBody(req);
        const request = new Request(url, {
            method: req.method,
            headers: toHeaders(req.headers),
            body: req.method === "GET" || req.method === "HEAD" || body.length === 0
                ? undefined
                : body,
        });
        let response;
        switch (url.pathname) {
            case "/v1/images/pixel-art:generate":
                response = await handlePixelArtRequest(request, resolvedAgent);
                break;
            case "/v1/plants/profile:analyze":
                response = await handleAnalyzeProfileRequest(request, resolvedAgent);
                break;
            case "/v1/plants/state:assess":
                response = await handleAssessStateRequest(request, resolvedAgent);
                break;
            case "/_manual/uploads":
                response = await handleManualUploadRequest(request, uploadStore);
                break;
            case "/_manual/vision":
                response = handleManualVisionConsoleRequest(request);
                break;
            default:
                response = notFoundResponse();
                break;
        }
        res.statusCode = response.status;
        response.headers.forEach((value, key) => {
            res.setHeader(key, value);
        });
        res.end(await response.text());
    });
}
//# sourceMappingURL=server.js.map