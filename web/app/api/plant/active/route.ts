import { NextResponse } from "next/server";
import type { PlantStoreState } from "@/src/shared/plant-store";
import {
  readPersistedPlantStore,
  writePersistedPlantStore,
} from "@/src/server/active-plant/storage";

export async function GET() {
  const state = await readPersistedPlantStore();
  return NextResponse.json({ ok: true, state });
}

export async function POST(request: Request) {
  try {
    const state = (await request.json()) as PlantStoreState;
    const persisted = await writePersistedPlantStore(state);
    return NextResponse.json({ ok: true, state: persisted });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to persist plant store";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
