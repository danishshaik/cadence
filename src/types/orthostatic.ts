export type OrthostaticSymptom = "eyes" | "ears" | "legs" | "chest";

export type OrthostaticPosition = "supine" | "sitting";

export type OrthostaticSedentaryDuration = "under_10_min" | "thirty_min" | "one_hour_plus";

export type OrthostaticHydrationFactor =
  | "dehydrated"
  | "large_meal"
  | "alcohol"
  | "hot_weather"
  | "missed_medication";

export interface OrthostaticLog {
  id: string;
  severity: number;
  durationSeconds: number;
  durationMinutes: number;
  symptoms: OrthostaticSymptom[];
  positionBeforeStanding: OrthostaticPosition;
  sedentaryDuration: OrthostaticSedentaryDuration;
  hydrationFactors: OrthostaticHydrationFactor[];
  createdAt: string;
}
