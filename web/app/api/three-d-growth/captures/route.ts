import { NextResponse } from "next/server";
import { appendCaptureRecord, readThreeDGrowthState } from "@/src/server/three-d-growth/storage";
import { saveUploadedImage } from "@/src/server/three-d-growth/upload";
import {
  analyzePlantProfile,
  assessPlantState,
  generatePlantPixelArt,
} from "@/src/server/agent-bridge";
import type { CaptureRecord } from "@/src/features/three-d-growth/types";

type UploadedFile = {
  size: number;
  type?: string;
  name?: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

function isUploadedFile(value: unknown): value is UploadedFile {
  if (!value || typeof value === "string") return false;
  const c = value as Partial<UploadedFile>;
  return (
    typeof c.size === "number" &&
    c.size > 0 &&
    typeof c.arrayBuffer === "function"
  );
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const image = form.get("image");

    if (!isUploadedFile(image)) {
      return NextResponse.json(
        { ok: false, error: "缺少图片文件" },
        { status: 400 },
      );
    }

    const requestedPlantId = form.get("plantId");
    const fallbackState = await readThreeDGrowthState();
    const plantId =
      typeof requestedPlantId === "string" && requestedPlantId
        ? requestedPlantId
        : fallbackState.plantId;
    const title = String(form.get("title") || "新的成长记录");
    const note = String(form.get("note") || "");
    const angle = String(form.get("angle") || "front") as CaptureRecord["angle"];
    const imageUrl = await saveUploadedImage(image);

    let agentAnalysis: CaptureRecord["agentAnalysis"];
    const [profileResult, stateResult, pixelArtResult] = await Promise.allSettled([
      analyzePlantProfile(imageUrl),
      assessPlantState(imageUrl, plantId, {
        taxonomy_id: "unknown",
        common_name: "未知植物",
      }),
      generatePlantPixelArt(imageUrl),
    ]);

    if (profileResult.status === "rejected") {
      console.error("[Agent Bridge] 植物识别失败", profileResult.reason);
    }

    if (stateResult.status === "rejected") {
      console.error("[Agent Bridge] 状态评估失败", stateResult.reason);
    }

    if (pixelArtResult.status === "rejected") {
      console.error("[Agent Bridge] 像素图生成失败", pixelArtResult.reason);
    }

    if (
      profileResult.status === "fulfilled" ||
      stateResult.status === "fulfilled" ||
      pixelArtResult.status === "fulfilled"
    ) {
      const generatedPixelImage =
        pixelArtResult.status === "fulfilled"
          ? pixelArtResult.value.data?.images?.[0]
          : undefined;

      agentAnalysis = {
        profile:
          profileResult.status === "fulfilled" && profileResult.value.data?.profile_draft
            ? {
                speciesId: profileResult.value.data.profile_draft.species_id,
                commonName: profileResult.value.data.profile_draft.common_name,
                scientificName: profileResult.value.data.profile_draft.scientific_name,
              }
            : undefined,
        state:
          stateResult.status === "fulfilled" && stateResult.value.data?.assessment
            ? {
                overallState: stateResult.value.data.assessment.overall_state,
                signals: stateResult.value.data.assessment.signals,
                confidence: stateResult.value.data.assessment.confidence,
              }
            : undefined,
        pixelArt: generatedPixelImage?.url
          ? {
              imageUrl: generatedPixelImage.url,
              fileId: generatedPixelImage.file_id,
            }
          : undefined,
        analyzedAt: new Date().toISOString(),
      };
    }

    const capture = await appendCaptureRecord({
      plantId,
      capturedAt: new Date().toISOString(),
      imageUrl,
      angle,
      title,
      note,
      agentAnalysis,
    });

    return NextResponse.json({ capture });
  } catch (err) {
    console.error("[/api/three-d-growth/captures] handler crashed", err);
    const message =
      err instanceof Error ? err.message : "internal error in captures route";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
