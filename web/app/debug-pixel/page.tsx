"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";

type DebugResponse = {
  ok?: boolean;
  model?: string;
  endpoint?: string;
  generatedImageUrl?: string | null;
  raw?: unknown;
  error?: string;
  details?: string;
};

type SelectedImage = {
  file: File | null;
  previewUrl: string;
};

const initialImageState: SelectedImage = {
  file: null,
  previewUrl: "",
};

const DEFAULT_MODEL = "black-forest-labs/flux.2-pro";
const DEFAULT_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

export default function DebugPixelPage() {
  const [prompt, setPrompt] = useState(
    "请严格以目标植物图作为唯一的植物主体依据，确保生成结果仍然是同一种植物，不能把植物种类、叶型、叶片分布、枝干或茎杆结构、整体轮廓或花盆形状改掉。请使用系统内置的像素风模板来渲染，不需要参考额外风格图。最终画面应是主体居中、背景简洁、描边清楚、层次明确、适合展示的精品像素风植物插画，避免额外杜撰新的叶片、花朵、藤蔓或器官。",
  );
  const [targetImage, setTargetImage] = useState<SelectedImage>(initialImageState);
  const [result, setResult] = useState<DebugResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => Boolean(targetImage.file) && !isSubmitting,
    [isSubmitting, targetImage.file],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!targetImage.file) {
      setResult({
        error: "请先上传目标植物图。",
      });
      return;
    }

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("sourceImage", targetImage.file);

    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch("/api/pixel-art-debug", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as DebugResponse;
      setResult(payload);
    } catch (error) {
      setResult({
        error: "请求失败，调试页没有拿到返回。",
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
    type: "target",
  ) {
    const file = event.target.files?.[0] ?? null;
    const nextState: SelectedImage = file
      ? { file, previewUrl: URL.createObjectURL(file) }
      : initialImageState;

    if (targetImage.previewUrl) URL.revokeObjectURL(targetImage.previewUrl);
    setTargetImage(nextState);
  }

  return (
    <main className="min-h-screen bg-[#0d160f] px-4 py-8 text-[#f7f4ea]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[36px] border border-[#29412d] bg-[radial-gradient(circle_at_top_left,rgba(152,203,125,0.2),transparent_35%),linear-gradient(135deg,#132117_0%,#0d160f_55%,#18261d_100%)] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)] md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.4em] text-[#9cbb92]">
                OpenRouter Pixel Lab
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#f7f0dc] md:text-6xl">
                像素植物调试台
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#c8d0be] md:text-base">
                只上传目标植物图，手动控制提示词，直接查看
                `black-forest-labs/flux.2-pro`
                的返回结果。风格参考图已经被总结成内置模板，用来测试是否能减少植物身份混淆。
              </p>
            </div>

            <div className="rounded-[28px] border border-[#314e33] bg-[rgba(15,24,17,0.72)] px-5 py-4 text-sm text-[#c9d5c0] backdrop-blur">
              <div>Model: `{DEFAULT_MODEL}`</div>
              <div className="mt-1">Endpoint: `{DEFAULT_ENDPOINT}`</div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[32px] border border-[#314a36] bg-[rgba(20,30,22,0.9)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.25)] md:p-6"
          >
            <div className="grid gap-5">
              <UploadCard
                title="目标植物图"
                hint="这是模型唯一可以参考的植物主体图，种类和结构都必须严格遵循它。"
                image={targetImage}
                onChange={(event) => handleImageChange(event, "target")}
              />
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-medium text-[#eff3df]">
                自定义提示词
              </span>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={7}
                className="w-full rounded-[24px] border border-[#37543c] bg-[#0e1711] px-4 py-4 text-sm leading-7 text-[#f7f4ea] outline-none transition placeholder:text-[#68806d] focus:border-[#9ecb7d]"
                placeholder="例如：暖色 16-bit 像素风，背景像温室展台，叶片要更饱满，花盆保留陶土材质。"
              />
            </label>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={!canSubmit}
                className="rounded-full bg-[#a8db79] px-6 py-3 text-sm font-semibold text-[#102012] transition hover:bg-[#b8ea8c] disabled:cursor-not-allowed disabled:bg-[#425346] disabled:text-[#aeb8ac]"
              >
                {isSubmitting ? "生成中..." : "开始调试"}
              </button>
              <p className="text-sm text-[#98aa95]">
                目标图必填。风格参考图已被内置成固定模板，API key 只在服务端读取，不会下发到浏览器。
              </p>
            </div>
          </form>

          <section className="rounded-[32px] border border-[#314a36] bg-[rgba(16,24,18,0.88)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.25)] md:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#90af86]">
                  Result
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[#f6f0db]">
                  返回预览
                </h2>
              </div>
              {result?.model ? (
                <div className="rounded-full border border-[#3b5940] px-4 py-2 text-xs text-[#c3d0bd]">
                  {result.model}
                </div>
              ) : null}
            </div>

            <div className="mt-5 overflow-hidden rounded-[28px] border border-dashed border-[#426149] bg-[#0b120d]">
              {result?.generatedImageUrl ? (
                <img
                  src={result.generatedImageUrl}
                  alt="Generated pixel art"
                  className="block aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center px-8 text-center text-sm leading-7 text-[#7f937c]">
                  上传图片并提交后，这里会显示模型返回的图片。如果上游只返回文本或报错，下方会保留原始响应帮助你排查。
                </div>
              )}
            </div>

            <div className="mt-5 rounded-[24px] border border-[#314a36] bg-[#0c1510] p-4">
              <p className="text-sm font-medium text-[#edf4de]">调试响应</p>
              <pre className="mt-3 max-h-[26rem] overflow-auto whitespace-pre-wrap break-all text-xs leading-6 text-[#b8c7b3]">
                {JSON.stringify(result, null, 2) || "等待请求结果..."}
              </pre>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function UploadCard({
  title,
  hint,
  image,
  onChange,
}: {
  title: string;
  hint: string;
  image: SelectedImage;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#eff3df]">{title}</span>
      <span className="mb-3 block text-sm leading-6 text-[#93a68f]">{hint}</span>
      <div className="overflow-hidden rounded-[26px] border border-[#38513b] bg-[#0d1710]">
        {image.previewUrl ? (
          <img
            src={image.previewUrl}
            alt={title}
            className="block aspect-[4/3] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center px-6 text-center text-sm leading-7 text-[#72856e]">
            点击下方按钮选择图片
          </div>
        )}
      </div>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={onChange}
        className="mt-3 block w-full rounded-full border border-[#3d5a42] bg-[#101a12] px-4 py-3 text-sm text-[#cad6c6] file:mr-4 file:rounded-full file:border-0 file:bg-[#223526] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#dce9d5]"
      />
    </label>
  );
}
