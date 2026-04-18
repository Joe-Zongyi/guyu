"use client";

import { useEffect, useRef, useState } from "react";
import { writeActivePlant, type ActivePlant } from "@/src/shared/plant-store";
import {
  createCapture,
  createModelGeneration,
  fetchThreeDGrowthSnapshot,
} from "@/src/features/three-d-growth/api/client";

type Stage = "idle" | "uploading" | "success" | "error";

type RecognizeResponse = {
  ok: boolean;
  profile: Omit<ActivePlant, "id" | "pixelImageUrl" | "originalImageUrl" | "createdAt">;
  pixelImageUrl: string | null;
  originalImageUrl: string;
  recognitionError?: string;
  pixelArtError?: string;
  error?: string;
};

export function AddPlantModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [stage, setStage] = useState<Stage>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setStage("idle");
    setStatusMessage("");
    setErrorMessage("");
  }, [open]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(next: File | null) {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (!next) {
      setFile(null);
      setPreviewUrl("");
      return;
    }
    setFile(next);
    setPreviewUrl(URL.createObjectURL(next));
    setStage("idle");
    setErrorMessage("");
  }

  async function handleRecognize() {
    if (!file) {
      setErrorMessage("请先选择一张植物图片");
      return;
    }
    setStage("uploading");
    setErrorMessage("");
    setStatusMessage("正在识别植物并生成像素插画…");

    try {
      const formData = new FormData();
      formData.set("image", file);
      const response = await fetch("/api/plant/recognize", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as RecognizeResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "植物识别失败");
      }

      const profile = payload.profile;
      const pixelImageUrl = payload.pixelImageUrl ?? payload.originalImageUrl;
      const plant: ActivePlant = {
        id: `plant-${Date.now()}`,
        commonName: profile.commonName,
        scientificName: profile.scientificName,
        pixelImageUrl,
        originalImageUrl: payload.originalImageUrl,
        growthStage: profile.growthStage,
        healthStatus: profile.healthStatus,
        healthTrend: profile.healthTrend,
        companionshipDays: "第 1 天",
        waterHabit: profile.waterHabit,
        sunlightHabit: profile.sunlightHabit,
        waterAdvice: profile.waterAdvice,
        sunlightAdvice: profile.sunlightAdvice,
        soilMoisture: profile.soilMoisture,
        videoTitle: profile.videoTitle,
        videoMeta: profile.videoMeta,
        videoUrl: profile.videoUrl,
        heroSubtitle: profile.heroSubtitle,
        createdAt: new Date().toISOString(),
      };
      writeActivePlant(plant);

      setStatusMessage("识别完成，正在同步成长重建建模…");

      try {
        await pushToThreeDGrowth(file);
        setStatusMessage("已同步到成长重建页，建模任务已发起");
      } catch (modelError) {
        console.error("[AddPlantModal] 3D 建模同步失败", modelError);
        setStatusMessage("识别成功，但成长重建建模发起失败，可稍后手动重试");
      }

      setStage("success");
      window.setTimeout(() => {
        onClose();
      }, 1200);
    } catch (caught) {
      console.error("[AddPlantModal] 识别流程失败", caught);
      setErrorMessage(caught instanceof Error ? caught.message : "识别失败，请重试");
      setStage("error");
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-[420px] overflow-hidden rounded-[28px] bg-[#f8faf3] text-[#1f2e22] shadow-[0_30px_80px_rgba(8,18,12,0.32)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-[linear-gradient(120deg,#326b46_0%,#5b8e5d_100%)] px-5 py-4 text-white">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/72">
              Add Plant
            </p>
            <p className="mt-1 text-lg font-semibold">添加我的植物</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/14 text-white/90 transition hover:bg-white/22"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 p-5">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
          />

          <div
            onClick={() => inputRef.current?.click()}
            className="flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-[20px] border border-dashed border-[#9bb19f] bg-[#eef4e1] text-center"
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="待识别植物"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="px-6 text-sm text-[#5f7561]">
                <p className="text-[16px] font-semibold text-[#2a4632]">
                  点击选择本地植物图片
                </p>
                <p className="mt-2 leading-6">
                  上传后将自动识别物种、生成像素插画，并在成长重建页发起一次 3D 建模。
                </p>
              </div>
            )}
          </div>

          {stage === "uploading" || stage === "success" ? (
            <p className="rounded-[14px] bg-[#e7f1d4] px-4 py-3 text-sm text-[#3a5a3d]">
              {statusMessage}
            </p>
          ) : null}

          {errorMessage ? (
            <p className="rounded-[14px] bg-[#fde0d8] px-4 py-3 text-sm text-[#8c3a2d]">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={stage === "uploading"}
              className="flex-1 rounded-full border border-[#cdd9c0] bg-white px-4 py-3 text-sm font-semibold text-[#3a5a3d] transition disabled:opacity-50"
            >
              {file ? "重新选择" : "选择图片"}
            </button>
            <button
              type="button"
              onClick={handleRecognize}
              disabled={!file || stage === "uploading" || stage === "success"}
              className="flex-1 rounded-full bg-[#2f6644] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,46,28,0.22)] transition disabled:opacity-60"
            >
              {stage === "uploading"
                ? "识别中…"
                : stage === "success"
                  ? "识别完成"
                  : "开始识别"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

async function pushToThreeDGrowth(file: File) {
  const snapshot = await fetchThreeDGrowthSnapshot();
  const plantId = snapshot.plantId;

  const captureResult = await createCapture({
    plantId,
    title: "首次识别建模",
    angle: "front",
    note: "由首页添加植物流程触发",
    file,
  });

  await createModelGeneration({
    plantId,
    sourceCaptureIds: [captureResult.capture.id],
  });
}
