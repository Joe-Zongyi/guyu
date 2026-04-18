"use client";

import { useEffect, useState } from "react";
import type { ActivePlant } from "./types";

const STORAGE_KEY = "guyu.activePlant";
const EVENT_NAME = "guyu:activePlantChange";

export function readActivePlant(): ActivePlant | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as ActivePlant;
  } catch {
    return null;
  }
}

export function writeActivePlant(plant: ActivePlant | null) {
  if (typeof window === "undefined") {
    return;
  }
  if (plant === null) {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plant));
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: plant }));
}

export function useActivePlant() {
  const [plant, setPlant] = useState<ActivePlant | null>(null);

  useEffect(() => {
    setPlant(readActivePlant());

    function handleChange(event: Event) {
      const detail = (event as CustomEvent<ActivePlant | null>).detail;
      setPlant(detail ?? readActivePlant());
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) {
        setPlant(readActivePlant());
      }
    }

    window.addEventListener(EVENT_NAME, handleChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, handleChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return plant;
}
