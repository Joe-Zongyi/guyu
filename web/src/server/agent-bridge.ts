import { randomUUID } from "node:crypto";

const BE_BASE_URL = process.env.BE_BASE_URL || "http://localhost:8787";

function getPublicImageUrl(imageUrl: string): string {
  if (imageUrl.startsWith("http")) return imageUrl;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
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
    throw new Error(`Agent profile analysis failed: ${response.status}`);
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
    throw new Error(`Agent state assessment failed: ${response.status}`);
  }

  return response.json() as Promise<AgentStateResult>;
}
