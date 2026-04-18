import type { CaptureRecord, ThreeDGrowthModuleState } from "../types";

export async function fetchThreeDGrowthSnapshot(plantId?: string) {
  const searchParams = new URLSearchParams();
  if (plantId) {
    searchParams.set("plantId", plantId);
  }

  const response = await fetch(
    `/api/three-d-growth${searchParams.size ? `?${searchParams.toString()}` : ""}`,
    {
      cache: "no-store",
    },
  );
  if (!response.ok) {
    throw new Error("读取 3D 模块数据失败");
  }
  return (await response.json()) as ThreeDGrowthModuleState;
}

export async function createCapture(input: {
  plantId: string;
  title: string;
  angle: CaptureRecord["angle"];
  note?: string;
  file: File;
}) {
  const formData = new FormData();
  formData.set("plantId", input.plantId);
  formData.set("title", input.title);
  formData.set("angle", input.angle);
  formData.set("note", input.note ?? "");
  formData.set("image", input.file);

  const response = await fetch("/api/three-d-growth/captures", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error("上传植物记录失败");
  }
  return (await response.json()) as { capture: CaptureRecord };
}

export async function createModelGeneration(input: {
  plantId: string;
  sourceCaptureIds: string[];
}) {
  const response = await fetch("/api/three-d-growth/models", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("发起 3D 生成失败");
  }
  return (await response.json()) as { modelId: string };
}

/**
 * 预加载模型文件到浏览器缓存，用于时间线切换时减少延迟。
 */
export function preloadModel(modelUrl: string): Promise<void> {
  return fetch(modelUrl, { method: "GET", cache: "force-cache" })
    .then(() => undefined)
    .catch(() => undefined);
}

/**
 * 并行预加载相邻索引的模型。
 */
export function preloadAdjacentModels(
  models: Array<{ modelUrl?: string }>,
  currentIndex: number
): void {
  const prev = models[currentIndex - 1];
  const next = models[currentIndex + 1];
  void Promise.all([
    prev?.modelUrl ? preloadModel(prev.modelUrl) : Promise.resolve(),
    next?.modelUrl ? preloadModel(next.modelUrl) : Promise.resolve(),
  ]);
}
