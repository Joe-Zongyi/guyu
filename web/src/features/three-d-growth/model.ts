import type { CaptureRecord, GeneratedModel, ThreeDGrowthModuleState } from "./types";

export function createEmptyThreeDGrowthState(): ThreeDGrowthModuleState {
  return {
    captures: [],
    models: [],
  };
}

export function queueModelGeneration(
  state: ThreeDGrowthModuleState,
  input: {
    plantId: string;
    sourceCaptureIds: string[];
    now: string;
  },
): ThreeDGrowthModuleState {
  const nextModel: GeneratedModel = {
    id: `model-${input.now}`,
    plantId: input.plantId,
    status: "draft",
    sourceCaptureIds: input.sourceCaptureIds,
    createdAt: input.now,
    updatedAt: input.now,
  };

  return {
    ...state,
    models: [...state.models, nextModel],
  };
}

export function appendCapture(
  state: ThreeDGrowthModuleState,
  capture: CaptureRecord,
): ThreeDGrowthModuleState {
  return {
    ...state,
    captures: [...state.captures, capture],
  };
}
