import type {
  CaptureRecord,
  CareEventRecord,
  GeneratedModel,
  ThreeDGrowthModuleState,
} from "./types";

export function createEmptyThreeDGrowthState(
  plantId = "monstera-001",
  plantName = "龟背竹 Monstera",
): ThreeDGrowthModuleState {
  return {
    plantId,
    plantName,
    captures: [],
    models: [],
    careEvents: [],
    activeModelId: undefined,
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
    milestone: "新的建模批次",
    summary: "等待生成本轮植物 3D 模型。",
    progress: 0,
    createdAt: input.now,
    updatedAt: input.now,
  };

  return {
    ...state,
    models: [...state.models, nextModel],
    activeModelId: nextModel.id,
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

export function findActiveModel(state: ThreeDGrowthModuleState) {
  return (
    state.models.find((model) => model.id === state.activeModelId) ??
    state.models[0] ??
    null
  );
}

export function appendCareEvent(
  state: ThreeDGrowthModuleState,
  event: CareEventRecord,
) {
  return {
    ...state,
    careEvents: [event, ...state.careEvents],
  };
}
