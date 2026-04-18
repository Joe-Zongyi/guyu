import { NextResponse } from "next/server";
import { appendCaptureRecord, readThreeDGrowthState } from "@/src/server/three-d-growth/storage";
import { saveUploadedImage } from "@/src/server/three-d-growth/upload";
import { analyzePlantProfile, assessPlantState } from "@/src/server/agent-bridge";
import type { CaptureRecord } from "@/src/features/three-d-growth/types";

export async function POST(request: Request) {
  const form = await request.formData();
  const image = form.get("image");

  if (!(image instanceof File)) {
    return NextResponse.json({ error: "缺少图片文件" }, { status: 400 });
  }

  const state = await readThreeDGrowthState();
  const plantId = String(form.get("plantId") || state.plantId);
  const title = String(form.get("title") || "新的成长记录");
  const note = String(form.get("note") || "");
  const angle = String(form.get("angle") || "front") as CaptureRecord["angle"];
  const imageUrl = await saveUploadedImage(image);

  // 并行调用 Agent 分析（植物识别 + 状态评估）
  let agentAnalysis: CaptureRecord["agentAnalysis"];
  try {
    const [profileResult, stateResult] = await Promise.all([
      analyzePlantProfile(imageUrl),
      assessPlantState(imageUrl, plantId, {
        taxonomy_id: "unknown",
        common_name: "未知植物",
      }),
    ]);

    agentAnalysis = {
      profile: profileResult.data?.profile_draft
        ? {
            speciesId: profileResult.data.profile_draft.species_id,
            commonName: profileResult.data.profile_draft.common_name,
            scientificName: profileResult.data.profile_draft.scientific_name,
          }
        : undefined,
      state: stateResult.data?.assessment
        ? {
            overallState: stateResult.data.assessment.overall_state,
            signals: stateResult.data.assessment.signals,
            confidence: stateResult.data.assessment.confidence,
          }
        : undefined,
      analyzedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[Agent Bridge] 分析失败", error);
    // 分析失败不影响主流程，继续保存 capture
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
}
