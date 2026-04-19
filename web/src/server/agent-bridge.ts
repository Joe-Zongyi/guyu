import { randomUUID } from "node:crypto";

const BE_BASE_URL = process.env.BE_BASE_URL || "http://localhost:8787";

function getPublicImageUrl(imageUrl: string): string {
  if (imageUrl.startsWith("http")) return imageUrl;
  const configuredBaseUrl =
    process.env.APP_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://127.0.0.1:3000";

  let normalizedBaseUrl = configuredBaseUrl;
  try {
    const parsed = new URL(configuredBaseUrl);
    if (parsed.hostname === "localhost") {
      parsed.hostname = "127.0.0.1";
      normalizedBaseUrl = parsed.toString().replace(/\/$/, "");
    }
  } catch {
    normalizedBaseUrl = "http://127.0.0.1:3000";
  }

  return `${normalizedBaseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
}

async function readErrorDetails(response: Response) {
  const rawText = await response.text();
  if (!rawText) {
    return `status=${response.status}`;
  }

  try {
    const parsed = JSON.parse(rawText) as { message?: unknown; error?: unknown };
    const message =
      typeof parsed.message === "string"
        ? parsed.message
        : Array.isArray(parsed.message)
          ? parsed.message.join("; ")
          : typeof parsed.error === "string"
            ? parsed.error
            : rawText;
    return `status=${response.status} body=${message}`;
  } catch {
    return `status=${response.status} body=${rawText}`;
  }
}

export interface AgentProfileResult {
  status: string;
  request_id: string;
  data?: {
    profile_draft?: {
      species_id: string;
      common_name: string;
      scientific_name: string;
    };
  };
}

export interface AgentStateResult {
  status: string;
  request_id: string;
  data?: {
    assessment?: {
      overall_state: string;
      signals: Array<{ signal: string; confidence: number }>;
      confidence: number;
    };
  };
}

export interface AgentPixelArtResult {
  status: string;
  request_id: string;
  data?: {
    source_image_id?: string;
    style?: "pixel_art";
    images?: Array<{
      file_id: string;
      url: string;
      content_type?: string;
      width?: number;
      height?: number;
    }>;
  };
}

export async function analyzePlantProfile(imageUrl: string): Promise<AgentProfileResult> {
  const requestId = `req_${randomUUID()}`;
  const publicUrl = getPublicImageUrl(imageUrl);

  const response = await fetch(`${BE_BASE_URL}/v1/plants/profile/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: "user_default",
      request_id: requestId,
      image: {
        file_id: `capture_${randomUUID()}`,
        url: publicUrl,
        content_type: "image/jpeg",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Agent profile analysis failed: ${await readErrorDetails(response)}`);
  }

  return response.json() as Promise<AgentProfileResult>;
}

export async function assessPlantState(
  imageUrl: string,
  plantId: string,
  profile: { taxonomy_id: string; common_name: string }
): Promise<AgentStateResult> {
  const requestId = `req_${randomUUID()}`;
  const publicUrl = getPublicImageUrl(imageUrl);

  const response = await fetch(`${BE_BASE_URL}/v1/plants/state/assess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      request_id: requestId,
      plant_id: plantId,
      image: {
        file_id: `capture_${randomUUID()}`,
        url: publicUrl,
        content_type: "image/jpeg",
      },
      profile,
      recent_assessments: [],
    }),
  });

  if (!response.ok) {
    throw new Error(`Agent state assessment failed: ${await readErrorDetails(response)}`);
  }

  return response.json() as Promise<AgentStateResult>;
}

export async function generatePlantPixelArt(
  imageUrl: string,
): Promise<AgentPixelArtResult> {
  const requestId = `req_${randomUUID()}`;
  const publicUrl = getPublicImageUrl(imageUrl);

  const response = await fetch(`${BE_BASE_URL}/v1/plants/pixel-art/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      request_id: requestId,
      image: {
        file_id: `capture_${randomUUID()}`,
        url: publicUrl,
        content_type: "image/jpeg",
      },
      variants: 1,
    }),
  });

  if (!response.ok) {
    throw new Error(`Agent pixel art failed: ${await readErrorDetails(response)}`);
  }

  return response.json() as Promise<AgentPixelArtResult>;
}
