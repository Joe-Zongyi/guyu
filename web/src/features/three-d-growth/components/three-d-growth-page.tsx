"use client";

import { useEffect, useMemo, useState } from "react";
import { DeviceFrame } from "@/src/shared/ui/device-frame";
import {
  createCapture,
  createModelGeneration,
  fetchThreeDGrowthSnapshot,
} from "../api/client";
import type { CaptureRecord, GeneratedModel, ThreeDGrowthModuleState } from "../types";

const CAPTURE_ANGLES: Array<CaptureRecord["angle"]> = [
  "front",
  "left",
  "right",
  "top",
  "detail",
];

export function ThreeDGrowthPage() {
  const [snapshot, setSnapshot] = useState<ThreeDGrowthModuleState | null>(null);
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");
  const [title, setTitle] = useState("今天的新叶更舒展");
  const [note, setNote] = useState("叶片边缘更平整，主茎看起来更挺拔。");
  const [angle, setAngle] = useState<CaptureRecord["angle"]>("front");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const next = await fetchThreeDGrowthSnapshot();
        if (cancelled) {
          return;
        }
        setSnapshot(next);
        setActiveModelId((current) => current ?? next.activeModelId ?? next.models[0]?.id ?? null);
        setError("");
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : "读取失败");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 4000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const activeModel = useMemo(() => {
    if (!snapshot) {
      return null;
    }
    return (
      snapshot.models.find((item) => item.id === activeModelId) ??
      snapshot.models[0] ??
      null
    );
  }, [activeModelId, snapshot]);

  const activeCaptures = useMemo(() => {
    if (!snapshot || !activeModel) {
      return [];
    }
    const lookup = new Map(snapshot.captures.map((item) => [item.id, item]));
    return activeModel.sourceCaptureIds
      .map((captureId) => lookup.get(captureId))
      .filter((item): item is CaptureRecord => Boolean(item));
  }, [activeModel, snapshot]);

  async function refreshSnapshot() {
    const next = await fetchThreeDGrowthSnapshot();
    setSnapshot(next);
    setActiveModelId((current) => current ?? next.activeModelId ?? next.models[0]?.id ?? null);
  }

  async function handleCaptureSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!snapshot || !file) {
      setError("请先选择一张植物图片");
      return;
    }

    try {
      setBusy(true);
      setError("");
      await createCapture({
        plantId: snapshot.plantId,
        title,
        angle,
        note,
        file,
      });
      setFile(null);
      setTitle("今天的新叶更舒展");
      setNote("叶片边缘更平整，主茎看起来更挺拔。");
      await refreshSnapshot();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "提交失败");
    } finally {
      setBusy(false);
    }
  }

  async function handleGenerateModel() {
    if (!snapshot) {
      return;
    }
    const sourceCaptureIds = snapshot.captures.slice(0, 4).map((item) => item.id);
    if (sourceCaptureIds.length === 0) {
      setError("请先记录植物图片，再发起建模");
      return;
    }

    try {
      setBusy(true);
      setError("");
      const result = await createModelGeneration({
        plantId: snapshot.plantId,
        sourceCaptureIds,
      });
      await refreshSnapshot();
      setActiveModelId(result.modelId);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "建模失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.72),transparent_24%),linear-gradient(180deg,#edf4e7_0%,#dce9dd_36%,#f4f5ee_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[14%] h-80 w-80 rounded-full bg-[#c8e2b0]/18 blur-3xl" />
        <div className="absolute right-[-8%] top-[10%] h-96 w-96 rounded-full bg-[#e8e0b6]/18 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-[1240px] items-start gap-8 lg:grid-cols-[0.92fr_520px]">
        <section className="hidden text-[#274033] lg:block">
          <div className="max-w-[560px]">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#617763]">
              Plant Growth Reconstruction
            </p>
            <h1 className="mt-4 font-serif text-[62px] leading-[0.95] text-[#21382b]">
              把植物成长
              <br />
              做成一条 3D 时间线
            </h1>
            <p className="mt-5 max-w-[500px] text-base leading-7 text-[#59705e]">
              这个模块让用户持续记录植物照片，并把每次建模任务整理成一条成长时间线。前端页面和后端接口已经分离，后续可以直接把 mock 生成替换成真实的混元 3D 服务。
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <SummaryCard label="记录张数" value={snapshot?.captures.length ?? "--"} />
              <SummaryCard label="生成批次" value={snapshot?.models.length ?? "--"} />
              <SummaryCard label="当前植物" value={snapshot?.plantName ?? "加载中"} />
            </div>
          </div>
        </section>

        <DeviceFrame>
          <section className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(201,232,167,0.18),transparent_18%),linear-gradient(180deg,#244935_0%,#173225_100%)] p-5 shadow-[0_30px_90px_rgba(5,14,10,0.28)]">
            <div className="flex items-center justify-between text-[13px] font-semibold tracking-[0.04em] text-white/85">
              <span>Growth Timeline</span>
              <span className="rounded-full bg-[#e7f2cc] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#2a4b31]">
                3D
              </span>
            </div>

            <section className="mt-4 rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(120,161,111,0.68)_0%,rgba(84,123,82,0.82)_100%)] p-4 shadow-[0_18px_48px_rgba(6,16,11,0.24)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-serif text-[30px] leading-none text-white">
                    {snapshot?.plantName ?? "植物成长档案"}
                  </p>
                  <p className="mt-2 text-sm text-white/74">
                    连续记录与建模，让植物成长变成可回看的立体时间轴。
                  </p>
                </div>
                <div className="rounded-full bg-white/18 px-3 py-2 text-[11px] tracking-[0.18em] text-white/88">
                  持续生成中
                </div>
              </div>

              <div className="mt-4 rounded-[26px] bg-white/6 p-3">
                <ModelGrowthStage
                  model={activeModel}
                  captures={activeCaptures}
                  loading={loading}
                />
              </div>
            </section>

            <section className="mt-4 grid grid-cols-[1fr_0.94fr] gap-3">
              <article className="rounded-[24px] border border-white/8 bg-[#5c8a67]/90 p-4 text-white shadow-[0_16px_36px_rgba(7,18,12,0.18)]">
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/65">Capture Log</p>
                <p className="mt-3 text-sm text-white/72">累计记录</p>
                <p className="mt-1 font-serif text-[38px] leading-none">
                  {snapshot?.captures.length ?? "--"}
                </p>
                <div className="mt-4 space-y-3">
                  <MetricBlock label="最近视角" value={snapshot?.captures[0]?.angle ?? "front"} />
                  <MetricBlock label="最新备注" value={snapshot?.captures[0]?.title ?? "等待记录"} />
                </div>
              </article>

              <article className="rounded-[24px] bg-[#e5f0bf] p-4 text-[#20321f] shadow-[0_16px_36px_rgba(6,17,11,0.18)]">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#516145]">Model Queue</p>
                <div className="mt-3 rounded-[18px] bg-white/55 p-4">
                  <p className="text-sm text-[#6e7d62]">当前状态</p>
                  <p className="mt-1 font-serif text-[32px] leading-none text-[#243224]">
                    {activeModel?.status === "ready"
                      ? "已完成"
                      : activeModel?.status === "processing"
                        ? "生成中"
                        : "待创建"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateModel}
                  disabled={busy || loading}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-[18px] bg-[#294d37] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  发起本轮 3D 建模
                </button>
              </article>
            </section>

            <section className="mt-4 rounded-[28px] bg-[#d8edb8] p-4 text-[#213225] shadow-[0_18px_44px_rgba(6,18,12,0.18)]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#5e715f]">Timeline Builder</p>
                <span className="rounded-full bg-white/55 px-3 py-1 text-xs font-semibold text-[#405141]">
                  模块化上传
                </span>
              </div>

              <form className="mt-4 grid gap-3" onSubmit={handleCaptureSubmit}>
                <label className="grid gap-2 rounded-[20px] bg-white/40 p-3">
                  <span className="text-xs text-[#617060]">本次记录标题</span>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="rounded-[16px] border-0 bg-white/80 px-4 py-3 text-sm text-[#243225] outline-none"
                    placeholder="例如：第 12 天，叶片边缘更舒展"
                  />
                </label>

                <div className="grid grid-cols-[1fr_0.8fr] gap-3">
                  <label className="grid gap-2 rounded-[20px] bg-white/40 p-3">
                    <span className="text-xs text-[#617060]">视角</span>
                    <select
                      value={angle}
                      onChange={(event) => setAngle(event.target.value as CaptureRecord["angle"])}
                      className="rounded-[16px] border-0 bg-white/80 px-4 py-3 text-sm text-[#243225] outline-none"
                    >
                      {CAPTURE_ANGLES.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2 rounded-[20px] bg-white/40 p-3">
                    <span className="text-xs text-[#617060]">植物照片</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                      className="rounded-[16px] border-0 bg-white/80 px-3 py-3 text-sm text-[#243225] outline-none file:mr-3 file:rounded-full file:border-0 file:bg-[#294d37] file:px-3 file:py-2 file:text-white"
                    />
                  </label>
                </div>

                <label className="grid gap-2 rounded-[20px] bg-white/40 p-3">
                  <span className="text-xs text-[#617060]">观察备注</span>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={3}
                    className="resize-none rounded-[16px] border-0 bg-white/80 px-4 py-3 text-sm text-[#243225] outline-none"
                    placeholder="记录这次拍摄时植物的变化、天气或新芽状态"
                  />
                </label>

                <button
                  type="submit"
                  disabled={busy || !file || loading}
                  className="inline-flex items-center justify-center rounded-[18px] bg-[#2a4b31] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  保存这次成长记录
                </button>
              </form>

              {error ? <p className="mt-3 text-sm text-[#8b3a34]">{error}</p> : null}
            </section>

            <section className="mt-4 rounded-[24px] bg-[#eef7d3] p-4 text-[#203225] shadow-[0_16px_36px_rgba(6,18,12,0.16)]">
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#5b7060]">Growth Timeline</p>
                <span className="text-xs text-[#647362]">
                  {snapshot?.models.length ?? 0} 个建模节点
                </span>
              </div>
              <div className="mt-3 grid gap-3">
                {loading ? (
                  <div className="rounded-[18px] bg-white/55 p-4 text-sm text-[#617060]">正在载入时间线…</div>
                ) : (
                  snapshot?.models.map((model, index) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => setActiveModelId(model.id)}
                      className={`grid gap-2 rounded-[20px] border px-4 py-4 text-left transition ${
                        model.id === activeModelId
                          ? "border-[#39593b]/18 bg-white shadow-[0_12px_24px_rgba(42,66,45,0.1)]"
                          : "border-transparent bg-white/58"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-[#7a8a75]">
                            Milestone {index + 1}
                          </p>
                          <h3 className="mt-1 font-serif text-[24px] text-[#28402e]">
                            {model.milestone}
                          </h3>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            model.status === "ready"
                              ? "bg-[#dff0c5] text-[#46623d]"
                              : model.status === "processing"
                                ? "bg-[#f4ebc2] text-[#7d6a2d]"
                                : "bg-[#ecefe5] text-[#697564]"
                          }`}
                        >
                          {statusLabel(model.status)}
                        </span>
                      </div>
                      <p className="text-sm leading-6 text-[#5a6a59]">{model.summary}</p>
                      <div className="h-2 rounded-full bg-[#dfe9d3]">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#587d4e,#a8cf72)] transition-all"
                          style={{ width: `${model.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-[#70806f]">
                        生成于 {formatDate(model.createdAt)}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </section>
          </section>
        </DeviceFrame>
      </div>
    </main>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[24px] border border-white/45 bg-white/55 p-4 shadow-[0_12px_24px_rgba(48,70,52,0.08)] backdrop-blur">
      <p className="text-xs uppercase tracking-[0.22em] text-[#7a8a75]">{label}</p>
      <p className="mt-2 font-serif text-[28px] text-[#21382b]">{value}</p>
    </div>
  );
}

function MetricBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-black/10 p-3">
      <p className="text-xs text-white/60">{label}</p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function ModelGrowthStage({
  model,
  captures,
  loading,
}: {
  model: GeneratedModel | null;
  captures: CaptureRecord[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex min-h-[270px] items-center justify-center rounded-[22px] bg-[#edf4e1]/50 text-sm text-white/78">
        正在装配植物成长舞台…
      </div>
    );
  }

  if (!model) {
    return (
      <div className="flex min-h-[270px] flex-col items-center justify-center rounded-[22px] bg-[#edf4e1]/50 px-6 text-center">
        <p className="font-serif text-2xl text-white">还没有 3D 建模节点</p>
        <p className="mt-3 text-sm leading-6 text-white/72">
          先上传一张植物照片，再发起首轮生成，时间线就会开始生长。
        </p>
      </div>
    );
  }

  const stageImages = captures.slice(0, 3);

  return (
    <div className="relative min-h-[310px] overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.26),transparent_24%),linear-gradient(180deg,#6a9266_0%,#4d7651_100%)] p-4">
      <div className="absolute inset-x-10 bottom-6 h-10 rounded-full bg-[#193024]/30 blur-2xl" />
      <div className="absolute right-4 top-4 rounded-full bg-white/18 px-3 py-2 text-xs tracking-[0.22em] text-white/86">
        {model.milestone}
      </div>
      <div className="absolute left-4 top-4 max-w-[160px] rounded-[18px] bg-white/14 px-3 py-2 text-xs leading-5 text-white/84 backdrop-blur">
        {model.status === "processing"
          ? "本轮模型正在整理叶片、株型和体积关系。"
          : "本轮模型已经完成，可作为成长阶段节点回看。"}
      </div>

      <div className="relative mx-auto mt-14 flex h-[200px] w-[220px] items-center justify-center">
        {stageImages.map((capture, index) => (
          <img
            key={capture.id}
            src={capture.imageUrl}
            alt={capture.title}
            className="absolute h-[150px] w-[110px] rounded-[22px] object-cover shadow-[0_18px_28px_rgba(21,35,24,0.16)]"
            style={{
              transform: `translateX(${(index - 1) * 24}px) translateY(${Math.abs(index - 1) * 10}px) rotate(${(index - 1) * 8}deg)`,
              opacity: index === 1 ? 1 : 0.82,
              zIndex: index + 1,
            }}
          />
        ))}
        <div className="absolute bottom-[-6px] flex h-[82px] w-[82px] items-center justify-center rounded-full border-[10px] border-[#e8f2d6]/75">
          <div className="text-center">
            <p className="font-serif text-[24px] text-[#edf6df]">{Math.round(model.progress)}%</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#eef5df]/78">growth</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function statusLabel(status: GeneratedModel["status"]) {
  if (status === "ready") {
    return "已完成";
  }
  if (status === "processing") {
    return "生成中";
  }
  if (status === "failed") {
    return "失败";
  }
  return "草稿";
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
  });
}
