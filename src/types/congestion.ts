// Congestion / Deep Cough Tracker Types

export const SLEEP_QUALITY_OPTIONS = [
  { id: "unbroken", label: "Unbroken Sleep", severity: 0 },
  { id: "woke_once", label: "Woke up once/twice", severity: 1 },
  { id: "frequent", label: "Frequent waking", severity: 2 },
  { id: "up_all_night", label: "Up all night", severity: 3 },
] as const;

export type SleepQualityId = (typeof SLEEP_QUALITY_OPTIONS)[number]["id"];

export function getSleepLabel(severity: number): string {
  if (severity <= 0) return "Unbroken";
  if (severity === 1) return "Woke up";
  if (severity === 2) return "Frequent";
  return "Up all night";
}

export const COUGH_CHARACTERS = [
  { id: "dry", label: "Dry / Tickle", description: "High in the throat, no production" },
  { id: "barking", label: "Barking", description: "Tight, loud, painful" },
  { id: "wet", label: "Wet / Rattling", description: "Deep in the chest, loose" },
  { id: "productive", label: "Productive", description: "Bringing up mucus" },
] as const;

export type CoughCharacterId = (typeof COUGH_CHARACTERS)[number]["id"];

export const CONGESTION_SOURCES = [
  { id: "throat", label: "Throat" },
  { id: "bronchi", label: "Bronchi" },
  { id: "deep_lungs", label: "Deep Lungs" },
] as const;

export type CongestionSourceId = (typeof CONGESTION_SOURCES)[number]["id"];

export const PHLEGM_COLORS = [
  { id: "clear", label: "Clear/White" },
  { id: "yellow", label: "Yellow/Honey" },
  { id: "green", label: "Green" },
  { id: "pink", label: "Pink/Rust" },
] as const;

export type PhlegmColorId = (typeof PHLEGM_COLORS)[number]["id"];

export const RELIEF_MEASURES = [
  { id: "tea", label: "Hot Tea / Honey" },
  { id: "steam", label: "Steam / Shower" },
  { id: "lozenge", label: "Cough Drop" },
  { id: "inhaler", label: "Inhaler" },
  { id: "propped", label: "Sleeping Propped Up" },
  { id: "chest_rub", label: "Chest Rub" },
] as const;

export type ReliefMeasureId = (typeof RELIEF_MEASURES)[number]["id"];

export interface CongestionLog {
  id: string;
  createdAt: string;
  sleepQuality: number;
  sleepLabel: string;
  coughCharacters: CoughCharacterId[];
  congestionSource: CongestionSourceId | null;
  phlegmColor: PhlegmColorId | null;
  reliefMeasures: ReliefMeasureId[];
  notes?: string;
}

export interface CongestionFormData {
  sleepQuality: number;
  sleepLabel: string;
  coughCharacters: CoughCharacterId[];
  congestionSource: CongestionSourceId | null;
  phlegmColor: PhlegmColorId | null;
  reliefMeasures: ReliefMeasureId[];
  notes: string;
  loggedAt: Date;
}
