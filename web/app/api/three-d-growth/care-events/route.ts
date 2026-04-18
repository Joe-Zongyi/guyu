import { NextResponse } from "next/server";
import { appendCareEventRecord } from "@/src/server/three-d-growth/storage";

type CreateCareEventPayload = {
  plantId?: string;
  eventType?: "watered";
  occurredAt?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateCareEventPayload;

    if (!body.plantId) {
      return NextResponse.json({ ok: false, error: "缺少植物 ID" }, { status: 400 });
    }

    const eventType = body.eventType ?? "watered";
    const occurredAt = body.occurredAt ?? new Date().toISOString();

    const result = await appendCareEventRecord({
      plantId: body.plantId,
      eventType,
      occurredAt,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "记录养护事件失败";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
