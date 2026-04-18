import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { CaptureRecord, GeneratedModel, ThreeDGrowthModuleState } from "@/src/features/three-d-growth/types";
import { createEmptyThreeDGrowthState } from "@/src/features/three-d-growth/model";
import {
  downloadModelToPublic,
  queryHunyuanJob,
  selectResultFile,
  submitHunyuanJob,
} from "./hunyuan";

const runtimeRoot = path.join(process.cwd(), "public", "runtime", "three-d-growth");
const uploadsRoot = path.join(runtimeRoot, "uploads");
const modelsRoot = path.join(runtimeRoot, "models");
const statePath = path.join(runtimeRoot, "state.json");

export async function ensureThreeDGrowthRuntime() {
  await mkdir(uploadsRoot, { recursive: true });
  await mkdir(modelsRoot, { recursive: true });
}

export async function readThreeDGrowthState() {
  await ensureThreeDGrowthRuntime();
  try {
    const raw = await readFile(statePath, "utf8");
    const parsed = JSON.parse(raw) as ThreeDGrowthModuleState;
    const refreshed = await refreshModelStatuses(parsed);
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

export async function appendCaptureRecord(input: Omit<CaptureRecord, "id">) {
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
  const sourceCaptures = input.sourceCaptureIds
    .map((captureId) => state.captures.find((item) => item.id === captureId))
    .filter((item): item is CaptureRecord => Boolean(item));

  if (sourceCaptures.length === 0) {
    throw new Error("没有可用于建模的图片记录");
  }

  const images = await Promise.all(
    sourceCaptures.map(async (capture) => ({
      name: path.basename(capture.imageUrl) || `${capture.id}.png`,
      bytes: await readCaptureBytes(capture.imageUrl),
      view: mapCaptureAngleToHunyuanView(capture.angle),
    })),
  );

  console.log("[3D Growth][Server] 提交混元 3D 任务", {
    plantId: input.plantId,
    captureCount: images.length,
    captureIds: sourceCaptures.map((item) => item.id),
  });

  const submission = await submitHunyuanJob({
    images,
    engine: "pro",
    model: "3.1",
    enablePbr: true,
  });

  const generationIndex = state.models.length + 1;
  const now = new Date().toISOString();
  const nextModel: GeneratedModel = {
    id: `model-${randomUUID()}`,
    plantId: input.plantId,
    status: "processing",
    sourceCaptureIds: sourceCaptures.map((item) => item.id),
    jobId: submission.jobId,
    queryAction: submission.queryAction,
    region: submission.region,
    previewUrl: sourceCaptures[0]?.imageUrl,
    milestone: `第 ${generationIndex} 次建模`,
    summary: "已提交混元 3D 任务，正在等待云端生成结果。",
    progress: 12,
    createdAt: now,
    updatedAt: now,
  };
  const nextState: ThreeDGrowthModuleState = {
    ...state,
    models: [nextModel, ...state.models],
    activeModelId: nextModel.id,
  };
  await writeState(nextState);

  console.log("[3D Growth][Server] 混元任务提交成功", {
    modelId: nextModel.id,
    jobId: submission.jobId,
  });

  return nextModel;
}

async function refreshModelStatuses(state: ThreeDGrowthModuleState) {
  const nextModels = await Promise.all(
    state.models.map(async (model) => {
      if (
        model.status !== "processing" ||
        !model.jobId ||
        !model.queryAction ||
        !model.region
      ) {
        return model;
      }

      try {
        const result = await queryHunyuanJob({
          jobId: model.jobId,
          queryAction: model.queryAction as "QueryHunyuanTo3DRapidJob" | "QueryHunyuanTo3DProJob",
          region: model.region,
        });

        const remoteStatus = String(result.Status ?? "UNKNOWN");
        const files = Array.isArray(result.ResultFile3Ds)
          ? (result.ResultFile3Ds as Array<Record<string, unknown>>)
          : [];
        const selected = selectResultFile(files);
        const previewImageUrl =
          typeof selected?.PreviewImageUrl === "string" ? selected.PreviewImageUrl : undefined;
        const downloadUrl = typeof selected?.Url === "string" ? selected.Url : undefined;

        if (remoteStatus === "DONE") {
          let modelUrl = model.modelUrl;

          if (downloadUrl && !modelUrl) {
            try {
              const downloadedPath = await downloadModelToPublic({
                downloadUrl,
                targetDir: path.join(modelsRoot, model.id),
                filenameHint: model.id,
              });
              modelUrl = toPublicUrl(downloadedPath);
            } catch (downloadError) {
              console.error("[3D Growth][Server] 下载混元模型失败", {
                modelId: model.id,
                jobId: model.jobId,
                error: downloadError,
              });
            }
          }

          return {
            ...model,
            status: "ready" as const,
            modelUrl,
            previewUrl: previewImageUrl ?? model.previewUrl,
            downloadUrl,
            progress: 100,
            errorMessage: undefined,
            summary: modelUrl
              ? "混元 3D 模型已生成完成，可以直接在时间线中查看。"
              : "混元 3D 任务已完成，但当前没有拿到可直接展示的模型文件。",
            updatedAt: new Date().toISOString(),
          };
        }

        if (remoteStatus === "FAIL") {
          return {
            ...model,
            status: "failed" as const,
            progress: 100,
            errorMessage: String(result.ErrorMessage ?? result.ErrorCode ?? "混元 3D 生成失败"),
            summary: String(result.ErrorMessage ?? "混元 3D 任务失败"),
            updatedAt: new Date().toISOString(),
          };
        }

        return {
          ...model,
          previewUrl: previewImageUrl ?? model.previewUrl,
          progress: remoteStatus === "RUN" ? 68 : 24,
          summary:
            remoteStatus === "RUN"
              ? "混元 3D 正在生成模型，云端任务运行中。"
              : "混元 3D 任务已提交，等待云端开始处理。",
          updatedAt: new Date().toISOString(),
        };
      } catch (error) {
        console.error("[3D Growth][Server] 查询混元任务状态失败", {
          modelId: model.id,
          jobId: model.jobId,
          error,
        });

        return {
          ...model,
          summary: "状态同步暂时失败，稍后会自动重试。",
          updatedAt: new Date().toISOString(),
        };
      }
    }),
  );

  return {
    ...state,
    models: nextModels,
  };
}

function createSeedState(): ThreeDGrowthModuleState {
  return createEmptyThreeDGrowthState();
}

async function readCaptureBytes(imageUrl: string) {
  if (imageUrl.startsWith("data:")) {
    return decodeDataUrl(imageUrl);
  }

  const normalized = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
  const absolutePath = path.join(process.cwd(), "public", normalized.replace(/^runtime\//, "runtime/"));
  return readFile(absolutePath);
}

function decodeDataUrl(value: string) {
  const [, meta = "", body = ""] = value.match(/^data:(.*?),(.*)$/) ?? [];
  if (!body) {
    throw new Error("无效的 data URL");
  }
  if (meta.includes(";base64")) {
    return Buffer.from(body, "base64");
  }
  return Buffer.from(decodeURIComponent(body), "utf8");
}

function mapCaptureAngleToHunyuanView(angle: CaptureRecord["angle"]) {
  if (angle === "left") {
    return "left";
  }
  if (angle === "right") {
    return "right";
  }
  if (angle === "top") {
    return "top";
  }
  return undefined;
}

function toPublicUrl(absolutePath: string) {
  const relative = path.relative(path.join(process.cwd(), "public"), absolutePath);
  return `/${relative.replaceAll("\\", "/")}`;
}
