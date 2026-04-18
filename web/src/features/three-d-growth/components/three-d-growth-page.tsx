"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DeviceFrame } from "@/src/shared/ui/device-frame";
import { ModelStageViewer } from "./model-stage-viewer";
import {
  createCapture,
  createModelGeneration,
  fetchThreeDGrowthSnapshot,
} from "../api/client";
import type { CaptureRecord, GeneratedModel, ThreeDGrowthModuleState } from "../types";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type CalendarEvent = {
  dateKey: string;
  day: number;
  type: "capture" | "model" | "care";
  label: string;
  highlight?: boolean;
};

export function ThreeDGrowthPage() {
  const [snapshot, setSnapshot] = useState<ThreeDGrowthModuleState | null>(null);
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function logStep(message: string, payload?: unknown) {
    if (payload === undefined) {
      console.log(`[3D Growth] ${message}`);
      return;
    }
    console.log(`[3D Growth] ${message}`, payload);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        logStep("开始读取 3D 重建快照");
        const next = await fetchThreeDGrowthSnapshot();
        if (cancelled) {
          return;
        }
        logStep("读取 3D 重建快照成功", {
          captures: next.captures.length,
          models: next.models.length,
          activeModelId: next.activeModelId ?? null,
        });
        setSnapshot(next);
        setActiveModelId((current) => current ?? next.activeModelId ?? next.models[0]?.id ?? null);
        setError("");
      } catch (nextError) {
        if (!cancelled) {
          logStep("读取 3D 重建快照失败", nextError);
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

  const models = snapshot?.models ?? [];
  const captures = snapshot?.captures ?? [];

  const activeModel = useMemo(() => {
    if (!snapshot) {
      return null;
    }
    return snapshot.models.find((item) => item.id === activeModelId) ?? snapshot.models[0] ?? null;
  }, [activeModelId, snapshot]);

  useEffect(() => {
    if (!activeModel) {
      return;
    }
    console.log("[3D Growth] 当前模型状态更新", {
      modelId: activeModel.id,
      status: activeModel.status,
      progress: activeModel.progress,
      summary: activeModel.summary,
    });
  }, [activeModel]);

  const activeIndex = useMemo(() => {
    if (!activeModel) {
      return 0;
    }
    const nextIndex = models.findIndex((item) => item.id === activeModel.id);
    return nextIndex >= 0 ? nextIndex : 0;
  }, [activeModel, models]);

  const calendarMonth = useMemo(() => {
    if (activeModel?.createdAt) {
      return new Date(activeModel.createdAt);
    }
    if (captures[0]?.capturedAt) {
      return new Date(captures[0].capturedAt);
    }
    return new Date();
  }, [activeModel?.createdAt, captures]);

  const calendarEvents = useMemo(() => {
    const nextEvents: CalendarEvent[] = [];
    for (const capture of captures.slice(0, 8)) {
      const date = new Date(capture.capturedAt);
      nextEvents.push({
        dateKey: toDateKey(date),
        day: date.getDate(),
        type: "capture",
        label: `补拍 ${angleLabel(capture.angle)}`,
      });
    }
    for (const model of models.slice(0, 6)) {
      const date = new Date(model.createdAt);
      nextEvents.push({
        dateKey: toDateKey(date),
        day: date.getDate(),
        type: "model",
        label: model.milestone,
        highlight: model.id === activeModel?.id,
      });
    }
    const baseDate = activeModel?.createdAt
      ? new Date(activeModel.createdAt)
      : captures[0]?.capturedAt
        ? new Date(captures[0].capturedAt)
        : new Date();
    const careDate = new Date(baseDate);
    careDate.setDate(careDate.getDate() + 7);
    nextEvents.push({
      dateKey: toDateKey(careDate),
      day: careDate.getDate(),
      type: "care",
      label: "施肥提醒",
    });
    return nextEvents;
  }, [activeModel?.createdAt, activeModel?.id, captures, models]);

  const calendarDays = useMemo(
    () => buildCalendarDays(calendarMonth, calendarEvents),
    [calendarEvents, calendarMonth],
  );

  async function refreshSnapshot() {
    logStep("刷新建模快照");
    const next = await fetchThreeDGrowthSnapshot();
    logStep("刷新建模快照完成", {
      captures: next.captures.length,
      models: next.models.length,
      activeModelId: next.activeModelId ?? null,
    });
    setSnapshot(next);
    setActiveModelId((current) => current ?? next.activeModelId ?? next.models[0]?.id ?? null);
  }

  async function handleQuickCapture(nextFile: File | null) {
    if (!snapshot || !nextFile) {
      logStep("拍照建模触发失败：缺少快照或图片文件", {
        hasSnapshot: Boolean(snapshot),
        hasFile: Boolean(nextFile),
      });
      setError("请先选择一张植物图片");
      return;
    }

    try {
      logStep("开始拍照建模", {
        fileName: nextFile.name,
        fileSize: nextFile.size,
        fileType: nextFile.type,
        plantId: snapshot.plantId,
      });
      setBusy(true);
      setError("");
      const captureResult = await createCapture({
        plantId: snapshot.plantId,
        title: "新的建模记录",
        angle: "front",
        note: "",
        file: nextFile,
      });
      logStep("图片上传成功，已创建补拍记录", captureResult.capture);
      const latest = await fetchThreeDGrowthSnapshot();
      logStep("上传后重新读取快照", {
        captures: latest.captures.length,
        models: latest.models.length,
      });
      setSnapshot(latest);
      const sourceCaptureIds = latest.captures.slice(0, 4).map((item) => item.id);
      if (sourceCaptureIds.length > 0) {
        logStep("开始发起建模任务", {
          plantId: latest.plantId,
          sourceCaptureIds,
        });
        const result = await createModelGeneration({
          plantId: latest.plantId,
          sourceCaptureIds,
        });
        logStep("建模任务已创建", result);
        await refreshSnapshot();
        setActiveModelId(result.modelId);
        logStep("当前激活模型已切换", { modelId: result.modelId });
      }
    } catch (nextError) {
      logStep("拍照建模流程失败", nextError);
      setError(nextError instanceof Error ? nextError.message : "建模失败");
    } finally {
      logStep("拍照建模流程结束");
      setBusy(false);
    }
  }

  function handleBack() {
    window.location.assign("/");
  }

  function handleTimelineChange(nextIndex: number) {
    const nextModel = models[nextIndex];
    if (nextModel) {
      logStep("时间线切换模型", {
        index: nextIndex,
        modelId: nextModel.id,
        milestone: nextModel.milestone,
      });
      setActiveModelId(nextModel.id);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.72),transparent_24%),linear-gradient(180deg,#edf4e7_0%,#dce9dd_36%,#f4f5ee_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[12%] h-80 w-80 rounded-full bg-[#c8e2b0]/18 blur-3xl" />
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
              做成 3D 时间线
            </h1>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <SummaryCard label="记录张数" value={captures.length || "--"} />
              <SummaryCard label="建模批次" value={models.length || "--"} />
              <SummaryCard label="当前植物" value={snapshot?.plantName ?? "加载中"} />
            </div>
          </div>
        </section>

        <DeviceFrame>
          <section className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(201,232,167,0.14),transparent_18%),linear-gradient(180deg,#263f37_0%,#1a2f28_100%)] p-4 shadow-[0_30px_90px_rgba(5,14,10,0.28)]">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#eef5df] px-5 text-sm font-semibold text-[#274033]"
              >
                <span aria-hidden="true">←</span>
                返回
              </button>
              <div className="min-w-0 text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#bfd1c4]">
                  3D Growth Reconstruction
                </p>
                <p className="mt-1 text-[22px] font-semibold text-[#f6fbf6]">成长重建</p>
              </div>
            </div>

            <section className="mt-4 rounded-[32px] bg-[#314c44]/95 p-4 shadow-[0_18px_48px_rgba(6,16,11,0.24)]">
              <div className="mt-4 rounded-[26px] border border-white/12 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_24%),linear-gradient(180deg,#78996b_0%,#66825f_100%)] p-4">
                <ModelGrowthStage model={activeModel} loading={loading} />
              </div>
            </section>

            <section className="mt-5 px-1">
              <div className="mt-5">
                {models.length > 0 ? (
                  <>
                    <div className="relative h-8">
                      <div className="absolute inset-x-0 top-3 h-[10px] rounded-full bg-[#1a2c28]" />
                      <div
                        className="absolute left-0 top-3 h-[10px] rounded-full bg-[#e7f5b6]"
                        style={{
                          width:
                            models.length > 1
                              ? `${(activeIndex / (models.length - 1)) * 100}%`
                              : "100%",
                        }}
                      />
                      <input
                        type="range"
                        min={0}
                        max={Math.max(models.length - 1, 0)}
                        step={1}
                        value={activeIndex}
                        onChange={(event) => handleTimelineChange(Number(event.target.value))}
                        className="absolute inset-0 h-8 w-full cursor-pointer appearance-none bg-transparent accent-[#f6fbf6]"
                      />
                      <div className="absolute inset-x-0 top-[6px] flex justify-between px-2">
                        {models.map((model, index) => {
                          const isActive = index === activeIndex;
                          const isPast = index < activeIndex;
                          return (
                            <button
                              key={model.id}
                              type="button"
                              onClick={() => setActiveModelId(model.id)}
                              className={`h-6 w-6 rounded-full border-2 transition ${
                                isActive
                                  ? "border-white bg-[#f6fbf6]"
                                  : isPast
                                    ? "border-[#d7e6d8] bg-[#d7e6d8]"
                                    : "border-[#7e968d] bg-[#7e968d]"
                              }`}
                              aria-label={`切换到 ${model.milestone}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                    <div className="mt-3 flex justify-between gap-2 text-[11px] font-semibold">
                      {models.map((model, index) => (
                        <span
                          key={model.id}
                          className={index === activeIndex ? "text-[#f3fbf4]" : "text-[#cfe0d2]"}
                        >
                          {formatTickDate(model.createdAt)}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="py-2 text-sm text-[#e7efea]">
                    还没有时间线节点，先上传照片并发起一次建模。
                  </div>
                )}
              </div>
            </section>

            <section className="mt-6 px-1 text-white">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const nextFile = event.target.files?.[0] ?? null;
                  if (nextFile) {
                    void handleQuickCapture(nextFile);
                  }
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy || loading}
                className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-[#d0846e] px-4 py-4 text-base font-bold text-white shadow-[0_16px_40px_rgba(106,44,32,0.18)] disabled:opacity-50"
              >
                {busy ? "生成中..." : "拍照建模"}
              </button>

              {error ? <p className="mt-3 text-sm text-[#fff3ef]">{error}</p> : null}
            </section>

            <section className="mt-4 rounded-[28px] bg-[#e8eedb] p-4 text-[#243128] shadow-[0_16px_40px_rgba(11,35,25,0.12)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[12px] font-semibold text-[#5d725f]">Care Calendar</p>
                  <p className="mt-1 text-[20px] font-semibold">日历</p>
                </div>
                <div className="rounded-full bg-white px-4 py-2 text-[11px] font-bold text-[#465d46]">
                  {calendarMonth.getFullYear()}.{String(calendarMonth.getMonth() + 1).padStart(2, "0")}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-[11px] font-semibold text-[#607061]">
                <LegendDot color="bg-[#5A8E6B]" label="浇水 / 补拍" />
                <LegendDot color="bg-[#2D7B4A]" label="3D 建模" />
                <LegendDot color="bg-[#E7C86B]" label="施肥提醒" />
              </div>

              <div className="mt-4 rounded-[22px] bg-[#f6f7f2] p-4">
                <div className="grid grid-cols-7 gap-x-2 gap-y-3 text-center">
                  {WEEKDAY_LABELS.map((label) => (
                    <p key={label} className="text-xs font-semibold text-[#738375]">
                      {label}
                    </p>
                  ))}
                  {calendarDays.map((day) => (
                    <CalendarDay key={`${day.dateKey}-${day.dayLabel}`} day={day} />
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 text-[11px] font-semibold text-[#70806f]">
                <span>
                  {activeModel
                    ? `${new Date(activeModel.createdAt).getDate()} 日完成第 ${activeIndex + 1} 次重建`
                    : "等待第一轮重建"}
                </span>
                <span>{captures.length} 次补拍 · {models.length} 个节点</span>
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

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}

function CalendarDay({
  day,
}: {
  day: ReturnType<typeof buildCalendarDays>[number];
}) {
  if (!day.inMonth) {
    return <div className="h-12 rounded-[14px] bg-transparent opacity-35" />;
  }

  if (day.highlight) {
    return (
      <div className="flex h-12 items-center justify-center">
        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full bg-[#2d7b4a] text-white">
          <span className="text-[15px] font-bold leading-none">{day.dayLabel}</span>
          <span className="mt-1 text-[9px] font-semibold">{day.label}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-12 flex-col items-center justify-center rounded-[14px] bg-[#eef2ea]">
      <span className="text-[14px] font-bold leading-none text-[#243128]">{day.dayLabel}</span>
      {day.dotColor ? <span className={`mt-2 h-2 w-2 rounded-full ${day.dotColor}`} /> : null}
    </div>
  );
}

function ModelGrowthStage({
  model,
  loading,
}: {
  model: GeneratedModel | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex min-h-[284px] items-center justify-center rounded-[22px] bg-[#edf4e1]/20 text-sm text-white/78">
        正在装配植物成长舞台…
      </div>
    );
  }

  if (!model) {
    return (
      <div className="flex min-h-[284px] flex-col items-center justify-center rounded-[22px] bg-[#edf4e1]/20 px-6 text-center">
        <p className="font-serif text-2xl text-white">还没有 3D 建模节点</p>
        <p className="mt-3 text-sm leading-6 text-white/72">
          先上传一张植物照片，再发起首轮生成，时间线就会开始生长。
        </p>
      </div>
    );
  }

  if (model.status === "processing") {
    return (
      <div className="flex min-h-[284px] flex-col justify-center rounded-[24px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_26%),linear-gradient(180deg,#759465_0%,#69855f_100%)] p-6 text-white">
        <div className="mx-auto w-full max-w-[300px]">
          <div className="rounded-[24px] border border-white/14 bg-white/10 p-5 backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/62">
              Hunyuan 3D
            </p>
            <p className="mt-3 font-serif text-[30px] leading-none">模型生成中</p>
            <p className="mt-3 text-sm leading-6 text-white/72">{model.summary}</p>

            <div className="mt-6">
              <div className="flex items-center justify-between text-xs font-semibold text-white/68">
                <span>当前进度</span>
                <span>{model.progress}%</span>
              </div>
              <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/14">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#eef7d9_0%,#d6ed9d_55%,#f3d28c_100%)] transition-all duration-500"
                  style={{ width: `${Math.max(8, model.progress)}%` }}
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-white/72">
              <div className="rounded-[16px] bg-black/10 px-3 py-3">上传图片</div>
              <div className="rounded-[16px] bg-white/18 px-3 py-3 text-white">云端生成</div>
              <div className="rounded-[16px] bg-black/10 px-3 py-3">模型回传</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (model.status === "failed") {
    return (
      <div className="flex min-h-[284px] flex-col items-center justify-center rounded-[22px] bg-[#edf4e1]/20 px-6 text-center">
        <p className="font-serif text-2xl text-white">建模失败</p>
        <p className="mt-3 text-sm leading-6 text-white/72">
          {model.errorMessage || model.summary || "本次 3D 生成没有成功完成。"}
        </p>
      </div>
    );
  }

  if (!model.modelUrl) {
    return (
      <div className="flex min-h-[284px] flex-col items-center justify-center rounded-[22px] bg-[#edf4e1]/20 px-6 text-center">
        <p className="font-serif text-2xl text-white">模型已完成</p>
        <p className="mt-3 text-sm leading-6 text-white/72">
          当前任务已经结束，但还没有拿到可展示的 3D 模型文件。
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[284px] overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_24%),linear-gradient(180deg,#759465_0%,#69855f_100%)] p-4">
      <div className="absolute inset-x-[14%] top-[18%] h-40 rounded-full bg-[#d5e8ad]/14 blur-[2px]" />
      <div className="absolute inset-x-[25%] bottom-8 h-5 rounded-full bg-[#193024]/28 blur-xl" />

      <div className="relative mx-auto mt-2 h-[238px] w-full max-w-[320px]">
        <ModelStageViewer modelPath={model.modelUrl} />
      </div>
    </div>
  );
}

function formatTickDate(value: string) {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}.${day}`;
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function angleLabel(angle: CaptureRecord["angle"]) {
  if (angle === "front") {
    return "正面";
  }
  if (angle === "left") {
    return "左侧";
  }
  if (angle === "right") {
    return "右侧";
  }
  if (angle === "top") {
    return "顶部";
  }
  return "细节";
}

function buildCalendarDays(monthDate: Date, events: CalendarEvent[]) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;
  const eventMap = new Map<string, CalendarEvent[]>();

  for (const event of events) {
    const bucket = eventMap.get(event.dateKey) ?? [];
    bucket.push(event);
    eventMap.set(event.dateKey, bucket);
  }

  const result: Array<{
    dateKey: string;
    inMonth: boolean;
    dayLabel: string;
    dotColor?: string;
    highlight?: boolean;
    label?: string;
  }> = [];

  for (let index = 0; index < startOffset; index += 1) {
    result.push({
      dateKey: `empty-${index}`,
      inMonth: false,
      dayLabel: "",
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const dateKey = toDateKey(date);
    const dayEvents = eventMap.get(dateKey) ?? [];
    const highlightEvent = dayEvents.find((event) => event.highlight);
    const primaryEvent = dayEvents[0];
    result.push({
      dateKey,
      inMonth: true,
      dayLabel: String(day),
      highlight: Boolean(highlightEvent),
      label: highlightEvent?.type === "model" ? "建模" : highlightEvent?.label,
      dotColor: highlightEvent
        ? undefined
        : primaryEvent
          ? colorForEvent(primaryEvent.type)
          : undefined,
    });
  }

  while (result.length % 7 !== 0) {
    result.push({
      dateKey: `empty-tail-${result.length}`,
      inMonth: false,
      dayLabel: "",
    });
  }

  return result;
}

function colorForEvent(type: CalendarEvent["type"]) {
  if (type === "model") {
    return "bg-[#2D7B4A]";
  }
  if (type === "care") {
    return "bg-[#E7C86B]";
  }
  return "bg-[#5A8E6B]";
}
