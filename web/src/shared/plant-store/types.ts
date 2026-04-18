export type ActivePlant = {
  id: string;
  commonName: string;
  scientificName: string;
  pixelImageUrl?: string;
  originalImageUrl?: string;

  growthStage: string;
  healthStatus: string;
  healthTrend: "up" | "down" | "steady";
  companionshipDays: string;

  waterHabit: string;
  sunlightHabit: string;
  waterAdvice: string;
  sunlightAdvice: string;
  soilMoisture: number;

  videoTitle: string;
  videoMeta: string;
  videoUrl?: string;

  heroSubtitle: string;

  createdAt: string;
};

export type PlantStoreState = {
  plants: ActivePlant[];
  activePlantId: string | null;
};
