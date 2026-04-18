export type CaptureRecord = {
  id: string;
  plantId: string;
  capturedAt: string;
  imageUrl: string;
  angle: "front" | "left" | "right" | "top" | "detail";
  title: string;
  note?: string;
  agentAnalysis?: {
    profile?: {
      speciesId: string;
      commonName: string;
      scientificName: string;
    };
    state?: {
      overallState: string;
      signals: Array<{ signal: string; confidence: number }>;
      confidence: number;
    };
    analyzedAt: string;
  };
};

export type GeneratedModel = {
  id: string;
  plantId: string;
  status: "draft" | "processing" | "ready" | "failed";
  sourceCaptureIds: string[];
  jobId?: string;
  queryAction?: string;
  region?: string;
  modelUrl?: string;
  previewUrl?: string;
  downloadUrl?: string;
  milestone: string;
  summary: string;
  progress: number;
  errorMessage?: string;
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
