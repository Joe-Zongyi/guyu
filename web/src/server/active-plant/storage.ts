import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { ActivePlant, PlantStoreState } from "@/src/shared/plant-store";

const runtimeRoot = path.join(process.cwd(), "public", "runtime", "active-plant");
const imagesRoot = path.join(runtimeRoot, "images");
const statePath = path.join(runtimeRoot, "state.json");

export async function ensureActivePlantRuntime() {
  await mkdir(imagesRoot, { recursive: true });
}

export async function readPersistedPlantStore(): Promise<PlantStoreState> {
  await ensureActivePlantRuntime();

  try {
    const raw = await readFile(statePath, "utf8");
    return normalizePersistedState(JSON.parse(raw) as unknown);
  } catch {
    return createEmptyPlantStore();
  }
}

export async function writePersistedPlantStore(
  state: PlantStoreState,
): Promise<PlantStoreState> {
  await ensureActivePlantRuntime();

  const persistedPlants = await Promise.all(
    state.plants.map(async (plant) => ({
      ...plant,
      pixelImageUrl: await persistImageReference(plant.pixelImageUrl, "pixel"),
      originalImageUrl: await persistImageReference(plant.originalImageUrl, "original"),
    })),
  );

  const persistedState = normalizePersistedState({
    plants: persistedPlants,
    activePlantId: state.activePlantId,
  });

  await writeFile(statePath, `${JSON.stringify(persistedState, null, 2)}\n`, "utf8");
  return persistedState;
}

export function createEmptyPlantStore(): PlantStoreState {
  return {
    plants: [],
    activePlantId: null,
  };
}

function normalizePersistedState(value: unknown): PlantStoreState {
  if (!value || typeof value !== "object") {
    return createEmptyPlantStore();
  }

  const maybeState = value as Partial<PlantStoreState> & Partial<ActivePlant>;
  const plants = Array.isArray(maybeState.plants)
    ? maybeState.plants.filter(isActivePlantLike)
    : isActivePlantLike(maybeState)
      ? [maybeState]
      : [];

  const activePlantId =
    typeof maybeState.activePlantId === "string" &&
    plants.some((plant) => plant.id === maybeState.activePlantId)
      ? maybeState.activePlantId
      : plants[0]?.id ?? null;

  return {
    plants,
    activePlantId,
  };
}

function isActivePlantLike(value: unknown): value is ActivePlant {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ActivePlant>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.commonName === "string" &&
    typeof candidate.scientificName === "string"
  );
}

async function persistImageReference(
  value: string | undefined,
  prefix: "pixel" | "original",
): Promise<string | undefined> {
  if (!value) {
    return undefined;
  }

  if (value.startsWith("/runtime/active-plant/")) {
    return value;
  }

  if (value.startsWith("/") && !value.startsWith("/api/")) {
    return value;
  }

  if (value.startsWith("data:")) {
    const { bytes, extension } = decodeDataUrl(value);
    return writeImage(bytes, prefix, extension);
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      const response = await fetch(value);
      if (!response.ok) {
        return value;
      }
      const bytes = Buffer.from(await response.arrayBuffer());
      const extension = extensionFromContentType(response.headers.get("content-type"));
      return writeImage(bytes, prefix, extension);
    } catch {
      return value;
    }
  }

  return value;
}

async function writeImage(bytes: Buffer, prefix: string, extension: string) {
  const filename = `${prefix}-${randomUUID()}${extension}`;
  const absolutePath = path.join(imagesRoot, filename);
  await writeFile(absolutePath, bytes);
  return `/runtime/active-plant/images/${filename}`;
}

function decodeDataUrl(value: string) {
  const match = value.match(/^data:(.*?),(.*)$/);
  if (!match) {
    throw new Error("Invalid data URL");
  }

  const [, meta, body] = match;
  const contentType = meta.split(";")[0] || "image/png";
  const extension = extensionFromContentType(contentType);
  const bytes = meta.includes(";base64")
    ? Buffer.from(body, "base64")
    : Buffer.from(decodeURIComponent(body), "utf8");

  return { bytes, extension };
}

function extensionFromContentType(contentType: string | null) {
  const normalized = (contentType || "").toLowerCase();
  if (normalized.includes("jpeg") || normalized.includes("jpg")) {
    return ".jpg";
  }
  if (normalized.includes("webp")) {
    return ".webp";
  }
  if (normalized.includes("gif")) {
    return ".gif";
  }
  return ".png";
}
