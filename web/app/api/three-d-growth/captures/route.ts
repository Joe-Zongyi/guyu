import { NextResponse } from "next/server";
import { appendCaptureRecord, readThreeDGrowthState } from "@/src/server/three-d-growth/storage";
import { saveUploadedImage } from "@/src/server/three-d-growth/upload";
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

  const capture = await appendCaptureRecord({
    plantId,
    capturedAt: new Date().toISOString(),
    imageUrl,
    angle,
    title,
    note,
  });

  return NextResponse.json({ capture });
}
