import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { CaptureRecord, GeneratedModel, ThreeDGrowthModuleState } from "@/src/features/three-d-growth/types";
import { createEmptyThreeDGrowthState } from "@/src/features/three-d-growth/model";

const runtimeRoot = path.join(process.cwd(), "public", "runtime", "three-d-growth");
const uploadsRoot = path.join(runtimeRoot, "uploads");
const statePath = path.join(runtimeRoot, "state.json");

export async function ensureThreeDGrowthRuntime() {
  await mkdir(uploadsRoot, { recursive: true });
}

export async function readThreeDGrowthState() {
  await ensureThreeDGrowthRuntime();
  try {
    const raw = await readFile(statePath, "utf8");
    const parsed = JSON.parse(raw) as ThreeDGrowthModuleState;
    const refreshed = refreshModelStatuses(parsed);
    await writeState(refreshed);
    return refreshed;
  } catch {
    const seeded = createSeedState();
    await writeState(seeded);
    return seeded;
  }
}

export async function writeState(state: ThreeDGrowthModuleState) {
  await ensureThreeDGrowthRuntime();
  await writeFile(statePath, JSON.stringify(state, null, 2), "utf8");
}

export async function appendCaptureRecord(
  input: Omit<CaptureRecord, "id">,
) {
  const state = await readThreeDGrowthState();
  const nextCapture: CaptureRecord = {
    id: `capture-${randomUUID()}`,
    ...input,
  };
  const nextState: ThreeDGrowthModuleState = {
    ...state,
    captures: [nextCapture, ...state.captures],
  };
  await writeState(nextState);
  return nextCapture;
}

export async function enqueueModelGeneration(input: {
  plantId: string;
  sourceCaptureIds: string[];
}) {
  const state = await readThreeDGrowthState();
  const generationIndex = state.models.length + 1;
  const primaryCapture = state.captures.find((item) => item.id === input.sourceCaptureIds[0]);
  const now = new Date().toISOString();
  const nextModel: GeneratedModel = {
    id: `model-${randomUUID()}`,
    plantId: input.plantId,
    status: "processing",
    sourceCaptureIds: input.sourceCaptureIds,
    previewUrl: primaryCapture?.imageUrl,
    milestone: `第 ${generationIndex} 次建模`,
    summary: "系统正在根据最近记录的多张植物照片拼装新的成长模型。",
    progress: 38,
    createdAt: now,
    updatedAt: now,
  };
  const nextState: ThreeDGrowthModuleState = {
    ...state,
    models: [nextModel, ...state.models],
    activeModelId: nextModel.id,
  };
  await writeState(nextState);
  return nextModel;
}

function refreshModelStatuses(state: ThreeDGrowthModuleState) {
  const now = Date.now();
  const nextModels = state.models.map((model) => {
    if (model.status !== "processing") {
      return model;
    }
    const elapsedSeconds = Math.floor((now - new Date(model.createdAt).getTime()) / 1000);
    if (elapsedSeconds >= 6) {
      return {
        ...model,
        status: "ready" as const,
        progress: 100,
        summary: "本轮模型已完成，可以和之前的节点一起对比植物的立体成长变化。",
        updatedAt: new Date().toISOString(),
      };
    }
    return {
      ...model,
      progress: Math.min(94, 38 + elapsedSeconds * 9),
      summary: "系统正在整理叶片空间关系和主茎体积变化，模型即将完成。",
      updatedAt: new Date().toISOString(),
    };
  });

  return {
    ...state,
    models: nextModels,
  };
}

function createSeedState(): ThreeDGrowthModuleState {
  const base = createEmptyThreeDGrowthState();
  const captures: CaptureRecord[] = [
    {
      id: "seed-capture-1",
      plantId: base.plantId,
      capturedAt: "2026-04-08T09:00:00.000Z",
      imageUrl: createPlantDataUrl("#7fb26a", "#bfe37f", "#8d5c3d"),
      angle: "front",
      title: "第 1 周，叶片初步舒展",
      note: "新叶刚刚打开，株型还比较紧。",
    },
    {
      id: "seed-capture-2",
      plantId: base.plantId,
      capturedAt: "2026-04-12T09:00:00.000Z",
      imageUrl: createPlantDataUrl("#729d61", "#cbe889", "#a06a44"),
      angle: "left",
      title: "第 2 周，侧面叶片更开阔",
      note: "左侧叶片开始舒展开，整体更饱满。",
    },
    {
      id: "seed-capture-3",
      plantId: base.plantId,
      capturedAt: "2026-04-17T09:00:00.000Z",
      imageUrl: createPlantDataUrl("#668d58", "#d4ef90", "#93603f"),
      angle: "detail",
      title: "第 3 周，叶缘稳定",
      note: "叶缘颜色更稳定，叶面纹理更清楚。",
    },
  ];

  const models: GeneratedModel[] = [
    {
      id: "seed-model-2",
      plantId: base.plantId,
      status: "processing",
      sourceCaptureIds: ["seed-capture-3", "seed-capture-2"],
      previewUrl: captures[0].imageUrl,
      milestone: "第 2 次建模",
      summary: "正在根据最近的照片重建叶片与株型变化。",
      progress: 56,
      createdAt: new Date(Date.now() - 3000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "seed-model-1",
      plantId: base.plantId,
      status: "ready",
      sourceCaptureIds: ["seed-capture-2", "seed-capture-1"],
      previewUrl: captures[1].imageUrl,
      milestone: "第 1 次建模",
      summary: "首轮植物模型已经完成，可以作为成长基线继续累计记录。",
      progress: 100,
      createdAt: "2026-04-12T10:00:00.000Z",
      updatedAt: "2026-04-12T10:03:00.000Z",
    },
  ];

  return {
    ...base,
    captures,
    models,
    activeModelId: models[0].id,
  };
}

function createPlantDataUrl(stem: string, leaf: string, pot: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 260">
      <rect width="220" height="260" rx="32" fill="#6c936a"/>
      <rect x="102" y="72" width="20" height="96" rx="6" fill="${stem}"/>
      <rect x="72" y="102" width="34" height="34" rx="7" fill="${leaf}"/>
      <rect x="114" y="58" width="36" height="36" rx="7" fill="${leaf}"/>
      <rect x="146" y="110" width="34" height="34" rx="7" fill="${leaf}"/>
      <rect x="82" y="74" width="28" height="28" rx="7" fill="${leaf}"/>
      <rect x="148" y="80" width="28" height="28" rx="7" fill="${leaf}"/>
      <rect x="92" y="168" width="40" height="16" rx="5" fill="#b37a50"/>
      <rect x="100" y="184" width="24" height="26" rx="6" fill="${pot}"/>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
