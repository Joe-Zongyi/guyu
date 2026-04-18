import { NextResponse } from "next/server";
import { enqueueModelGeneration } from "@/src/server/three-d-growth/storage";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    plantId?: string;
    sourceCaptureIds?: string[];
  };

  if (!body.plantId || !body.sourceCaptureIds?.length) {
    return NextResponse.json({ error: "缺少建模输入" }, { status: 400 });
  }

  const model = await enqueueModelGeneration({
    plantId: body.plantId,
    sourceCaptureIds: body.sourceCaptureIds,
  });

  return NextResponse.json({ modelId: model.id });
}
