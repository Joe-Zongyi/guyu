export type CaptureRecord = {
  id: string;
  plantId: string;
  capturedAt: string;
  imageUrl: string;
  angle: "front" | "left" | "right" | "top" | "detail";
  title: string;
  note?: string;
};

export type GeneratedModel = {
  id: string;
  plantId: string;
  status: "draft" | "processing" | "ready" | "failed";
  sourceCaptureIds: string[];
  modelUrl?: string;
  previewUrl?: string;
  milestone: string;
  summary: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
};

export type ThreeDGrowthModuleState = {
  plantId: string;
  plantName: string;
  captures: CaptureRecord[];
  models: GeneratedModel[];
  activeModelId?: string;
};
