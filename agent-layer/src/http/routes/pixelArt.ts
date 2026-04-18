import { PlantAgent } from "../../agent.js";
import { respondJson } from "../response.js";

export async function handlePixelArtRequest(
  request: Request,
  agent = new PlantAgent(),
): Promise<Response> {
  if (request.method !== "POST") {
    return respondJson(
      405,
      {
        status: "failed",
        error_code: "PROVIDER_UNAVAILABLE",
        message: "method not allowed",
        request_id: "unknown",
      },
      { Allow: "POST" },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return respondJson(400, {
      status: "failed",
      error_code: "PROVIDER_UNAVAILABLE",
      message: "invalid json body",
      request_id: "unknown",
    });
  }

  const result = await agent.generatePixelArt(body);
  const statusCode = result.status === "success" ? 200 : 400;
  return respondJson(statusCode, result);
}
