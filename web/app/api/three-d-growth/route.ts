import { NextResponse } from "next/server";
import { readThreeDGrowthState } from "@/src/server/three-d-growth/storage";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const plantId = searchParams.get("plantId") ?? undefined;
  const state = await readThreeDGrowthState(plantId);
  return NextResponse.json(state);
}
