export type CaptureRecord = {
  id: string;
  plantId: string;
  capturedAt: string;
  imageUrl: string;
  note?: string;
};

export type GeneratedModel = {
  id: string;
  plantId: string;
  status: "draft" | "processing" | "ready" | "failed";
  sourceCaptureIds: string[];
  modelUrl?: string;
  previewUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type ThreeDGrowthModuleState = {
  captures: CaptureRecord[];
  models: GeneratedModel[];
};
