import { NextResponse } from "next/server";
import {
  appendCaptureRecord,
  clearStateCache,
  enqueueModelGeneration,
  readThreeDGrowthState,
  writeState,
} from "@/src/server/three-d-growth/storage";
import { saveUploadedImage } from "@/src/server/three-d-growth/upload";
import { analyzePlantProfile, generatePixelArt } from "@/src/server/agent-bridge";

export async function POST(request: Request) {
  const form = await request.formData();
  const image = form.get("image");

  if (!(image instanceof File)) {
    return NextResponse.json({ error: "缺少图片文件" }, { status: 400 });
  }

  const imageUrl = await saveUploadedImage(image);

  // 并行调用植物识别 + 像素风生成
  let profileResult: Awaited<ReturnType<typeof analyzePlantProfile>> | undefined;
  let pixelArtResult: Awaited<ReturnType<typeof generatePixelArt>> | undefined;

  try {
    [profileResult, pixelArtResult] = await Promise.all([
      analyzePlantProfile(imageUrl),
      generatePixelArt(imageUrl),
    ]);
  } catch (error) {
    console.error("[Plants API] 分析或像素风生成失败", error);
    // 即使失败也继续流程，使用默认值
  }

  const profileDraft = profileResult?.data?.profile_draft;

  // 如果后端无法识别，plant 返回 null，让前端保持默认展示
  const plant = profileDraft
    ? {
        name: profileDraft.common_name,
        scientificName: profileDraft.scientific_name ?? "",
        speciesId: profileDraft.species_id ?? "unknown",
        pixelArtUrl: pixelArtResult?.pixelArtUrl ?? undefined,
        careBaseline: profileDraft.care_baseline
          ? {
              wateringRule: String(profileDraft.care_baseline.watering_rule ?? ""),
              lightRule: String(profileDraft.care_baseline.light_rule ?? ""),
            }
          : undefined,
      }
    : null;

  // 读取当前 state
  const state = await readThreeDGrowthState();

  // 保存 capture 记录
  const captureTitle = plant ? `添加植物：${plant.name}` : "添加植物记录";
  const captureNote = plant?.scientificName ?? "";
  const capture = await appendCaptureRecord({
    plantId: state.plantId,
    capturedAt: new Date().toISOString(),
    imageUrl,
    angle: "front",
    title: captureTitle,
    note: captureNote,
    agentAnalysis: profileDraft
      ? {
          profile: {
            speciesId: profileDraft.species_id,
            commonName: profileDraft.common_name,
            scientificName: profileDraft.scientific_name,
          },
          analyzedAt: new Date().toISOString(),
        }
      : undefined,
  });

  // 读取更新后的 state（包含新 capture）并更新植物名称
  const updatedState = await readThreeDGrowthState();
  const nextPlantName = plant
    ? (plant.scientificName ? `${plant.name} ${plant.scientificName}` : plant.name)
    : state.plantName;
  const nextState = {
    ...updatedState,
    plantName: nextPlantName,
  };
  await writeState(nextState);

  // 清除缓存，确保后续读取最新状态
  clearStateCache();

  // 自动触发 3D 建模
  const model = await enqueueModelGeneration({
    plantId: state.plantId,
    sourceCaptureIds: [capture.id],
  });

  return NextResponse.json({ plant, capture, model });
}
