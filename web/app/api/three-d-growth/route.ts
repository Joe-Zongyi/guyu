import { NextResponse } from "next/server";
import { readThreeDGrowthState } from "@/src/server/three-d-growth/storage";

export async function GET() {
  const state = await readThreeDGrowthState();
  return NextResponse.json(state);
}
