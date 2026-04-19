"use client";

import { useState, useEffect } from "react";
import type { Plant } from "../api/client";

const STORAGE_KEY = "guyu-plant-state";

interface PlantState {
  plant: Plant | null;
  isLoading: boolean;
  error: string | null;
  mounted: boolean;
}

function getStoredPlant(): Plant | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as Plant;
  } catch {
    return null;
  }
}

function setStoredPlant(plant: Plant | null): void {
  if (typeof window === "undefined") return;
  if (plant) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plant));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function usePlant() {
  const [state, setState] = useState<PlantState>({
    plant: null,
    isLoading: false,
    error: null,
    mounted: false,
  });

  // 只在客户端 mount 后读 localStorage，避免 hydration mismatch
  useEffect(() => {
    const stored = getStoredPlant();
    setState((prev) => ({ ...prev, plant: stored, mounted: true }));
  }, []);

  return {
    plant: state.plant,
    isLoading: state.isLoading,
    error: state.error,
    mounted: state.mounted,
    setPlant: (plant: Plant | null) => {
      setStoredPlant(plant);
      setState((prev) => ({ ...prev, plant, error: null }));
    },
    clearPlant: () => {
      setStoredPlant(null);
      setState((prev) => ({ ...prev, plant: null, error: null }));
    },
    setLoading: (loading: boolean) => {
      setState((prev) => ({ ...prev, isLoading: loading }));
    },
    setError: (error: string | null) => {
      setState((prev) => ({ ...prev, error, isLoading: false }));
    },
  };
}
