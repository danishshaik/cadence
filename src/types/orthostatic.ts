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

export function getOrthostaticSeverityLabel(severity: number): string {
  if (severity <= 2) return "Mild";
  if (severity <= 5) return "Moderate";
  if (severity <= 7) return "Strong";
  return "Near fainting";
}
