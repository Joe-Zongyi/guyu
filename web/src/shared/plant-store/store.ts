"use client";

import { useEffect, useMemo, useState } from "react";
import type { ActivePlant, PlantStoreState } from "./types";

const STORAGE_KEY = "guyu.plantStore";
const LEGACY_STORAGE_KEY = "guyu.activePlant";
const EVENT_NAME = "guyu:plantStoreChange";
const ACTIVE_PLANT_API = "/api/plant/active";
const DATA_URL_PREFIX = "data:";

function isDataUrl(value: string | undefined): value is string {
  return typeof value === "string" && value.startsWith(DATA_URL_PREFIX);
}

function getPersistedPlant(plant: ActivePlant): ActivePlant {
  return {
    ...plant,
    pixelImageUrl: isDataUrl(plant.pixelImageUrl) ? undefined : plant.pixelImageUrl,
    originalImageUrl: isDataUrl(plant.originalImageUrl)
      ? undefined
      : plant.originalImageUrl,
  };
}

function normalizeState(state: PlantStoreState | null | undefined): PlantStoreState {
  if (!state) {
    return { plants: [], activePlantId: null };
  }

  const plants = Array.isArray(state.plants) ? state.plants : [];
  const activePlantId =
    typeof state.activePlantId === "string" &&
    plants.some((plant) => plant.id === state.activePlantId)
      ? state.activePlantId
      : plants[0]?.id ?? null;

  return {
    plants,
    activePlantId,
  };
}

function persistableState(state: PlantStoreState): PlantStoreState {
  return {
    plants: state.plants.map(getPersistedPlant),
    activePlantId: state.activePlantId,
  };
}

function migrateLegacyPlant(): PlantStoreState | null {
  const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const plant = JSON.parse(raw) as ActivePlant;
    if (!plant?.id) {
      return null;
    }
    return {
      plants: [plant],
      activePlantId: plant.id,
    };
  } catch {
    return null;
  }
}

function writeLocalPlantStore(state: PlantStoreState) {
  const normalized = normalizeState(state);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistableState(normalized)));
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (error) {
    console.warn("[plant-store] Failed to persist plant store", error);
    window.localStorage.removeItem(STORAGE_KEY);
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: normalized }));
}

export function readPlantStore(): PlantStoreState {
  if (typeof window === "undefined") {
    return { plants: [], activePlantId: null };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return normalizeState(JSON.parse(raw) as PlantStoreState);
    }
  } catch {
    return { plants: [], activePlantId: null };
  }

  const migrated = migrateLegacyPlant();
  if (migrated) {
    writeLocalPlantStore(migrated);
    return migrated;
  }

  return { plants: [], activePlantId: null };
}

export function readActivePlant(): ActivePlant | null {
  const state = readPlantStore();
  return state.plants.find((plant) => plant.id === state.activePlantId) ?? null;
}

export function writeActivePlant(plant: ActivePlant | null) {
  if (typeof window === "undefined") {
    return;
  }

  const current = readPlantStore();
  if (plant === null) {
    writeLocalPlantStore({ plants: [], activePlantId: null });
    return;
  }

  const nextPlants = [plant, ...current.plants.filter((item) => item.id !== plant.id)];
  writeLocalPlantStore({
    plants: nextPlants,
    activePlantId: plant.id,
  });
}

export async function savePlantStore(state: PlantStoreState) {
  if (typeof window === "undefined") {
    return normalizeState(state);
  }

  const normalized = normalizeState(state);
  const response = await fetch(ACTIVE_PLANT_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(normalized),
  });

  if (!response.ok) {
    throw new Error("保存植物列表失败");
  }

  const payload = (await response.json()) as {
    ok: boolean;
    state: PlantStoreState;
    error?: string;
  };

  if (!payload.ok) {
    throw new Error(payload.error || "保存植物列表失败");
  }

  writeLocalPlantStore(payload.state);
  return payload.state;
}

export async function saveActivePlant(plant: ActivePlant | null) {
  const current = readPlantStore();

  if (plant === null) {
    return savePlantStore({ plants: [], activePlantId: null });
  }

  const nextPlants = [plant, ...current.plants.filter((item) => item.id !== plant.id)];
  return savePlantStore({
    plants: nextPlants,
    activePlantId: plant.id,
  });
}

export async function setActivePlantId(plantId: string) {
  const current = readPlantStore();
  if (!current.plants.some((plant) => plant.id === plantId)) {
    return current;
  }

  return savePlantStore({
    ...current,
    activePlantId: plantId,
  });
}

async function fetchPersistedPlantStore() {
  const response = await fetch(ACTIVE_PLANT_API, {
    cache: "no-store",
  });
  if (!response.ok) {
    return null;
  }
  const payload = (await response.json()) as {
    ok: boolean;
    state: PlantStoreState;
  };
  return payload.ok ? normalizeState(payload.state) : null;
}

export function usePlantStore() {
  const [state, setState] = useState<PlantStoreState>({ plants: [], activePlantId: null });

  useEffect(() => {
    const localState = readPlantStore();
    setState(localState);

    void fetchPersistedPlantStore()
      .then((persistedState) => {
        if (!persistedState) {
          return;
        }
        setState(persistedState);
        writeLocalPlantStore(persistedState);
      })
      .catch(() => undefined);

    function handleChange(event: Event) {
      const detail = (event as CustomEvent<PlantStoreState>).detail;
      setState(detail ?? readPlantStore());
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY || event.key === LEGACY_STORAGE_KEY) {
        setState(readPlantStore());
      }
    }

    window.addEventListener(EVENT_NAME, handleChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, handleChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const activePlant = useMemo(
    () => state.plants.find((plant) => plant.id === state.activePlantId) ?? null,
    [state],
  );

  return {
    state,
    plants: state.plants,
    activePlant,
  };
}

export function useActivePlant() {
  return usePlantStore().activePlant;
}
