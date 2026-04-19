export interface Plant {
  name: string;
  scientificName: string;
  speciesId: string;
  pixelArtUrl?: string;
  careBaseline?: {
    wateringRule: string;
    lightRule: string;
  };
}

export interface AddPlantResponse {
  plant: Plant | null;
  capture: {
    id: string;
    imageUrl: string;
    title: string;
    note?: string;
  };
  model: {
    id: string;
    status: string;
  };
}

export async function addPlant(file: File): Promise<AddPlantResponse> {
  const formData = new FormData();
  formData.set("image", file);

  const response = await fetch("/api/plants", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "上传失败" }));
    throw new Error(error.error || "上传植物失败");
  }

  return (await response.json()) as AddPlantResponse;
}
