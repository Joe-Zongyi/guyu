export type Badge = {
  name: string;
  title: string;
  icon: string;
  mood: string;
  unlocked: boolean;
  progress?: string;
};

export type GardenPlant = {
  name: string;
  days: number;
  mood: string;
  variety: "monstera" | "pothos" | "cactus" | "ficus" | "fern" | "lily";
};
