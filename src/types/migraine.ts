export interface MigraineLog {
  id: string;
  severity: number; // 0-10
  severityLabel: "mild" | "moderate" | "severe";
  startedAt: string; // ISO timestamp
  timeOfDay: "night" | "morning" | "afternoon" | "evening";
  isOngoing: boolean;
  durationMinutes: number | null;
  painLocations: string[];
  triggers: string[];
  medicationTaken: boolean;
  medications: { name: string; takenAt: string }[];
  notes: string | null;
  createdAt: string;
}

export type MigraineSeverityLabel = "mild" | "moderate" | "severe";

export interface MigraineFormData {
  severity: number;
  severityLabel: MigraineSeverityLabel;
  startedAt: Date;
  timeOfDay: TimeOfDay;
  isOngoing: boolean;
  durationMinutes: number | null;
  painLocations: string[];
  triggers: string[];
  medications: { name: string; takenAt: string }[];
  medicationNoneSelected: boolean;
  notes: string | null;
}

export interface PainRegion {
  id: string;
  name: string;
  path: string;
}

export const PAIN_REGIONS: Record<"front" | "back", PainRegion[]> = {
  front: [
    { id: "scalp-l", name: "Scalp Left", path: "M 150,30 C 100,30 55,50 55,90 L 150,90 Z" },
    { id: "scalp-r", name: "Scalp Right", path: "M 150,30 C 200,30 245,50 245,90 L 150,90 Z" },
    { id: "forehead-l", name: "Forehead Left", path: "M 55,90 C 53,110 52,130 52,150 L 110,150 L 110,90 Z" },
    { id: "forehead-c", name: "Forehead Center", path: "M 110,90 L 190,90 L 190,150 L 110,150 Z" },
    { id: "forehead-r", name: "Forehead Right", path: "M 245,90 C 247,110 248,130 248,150 L 190,150 L 190,90 Z" },
    { id: "nose", name: "Nose / Bridge", path: "M 110,150 L 190,150 L 165,230 L 135,230 Z" },
    { id: "eye-l", name: "Left Eye & Temple", path: "M 52,150 L 110,150 L 135,230 L 65,230 C 60,210 55,180 52,150 Z" },
    { id: "eye-r", name: "Right Eye & Temple", path: "M 248,150 L 190,150 L 165,230 L 235,230 C 240,210 245,180 248,150 Z" },
    { id: "mouth", name: "Mouth Region", path: "M 135,230 L 165,230 L 170,290 L 130,290 Z" },
    { id: "cheek-l", name: "Left Cheek", path: "M 65,230 L 135,230 L 130,290 L 100,320 L 85,290 C 70,270 65,250 65,230 Z" },
    { id: "cheek-r", name: "Right Cheek", path: "M 235,230 L 165,230 L 170,290 L 200,320 L 215,290 C 230,270 235,250 235,230 Z" },
    { id: "chin", name: "Chin", path: "M 130,290 L 170,290 L 200,320 L 150,350 L 100,320 Z" },
    { id: "neck-front", name: "Neck (Front)", path: "M 100,320 L 150,350 L 200,320 L 230,370 L 70,370 Z" },
  ],
  back: [
    { id: "back-upper-l", name: "Upper Left", path: "M 150,30 C 100,30 55,50 55,140 L 150,140 L 150,30 Z" },
    { id: "back-upper-r", name: "Upper Right", path: "M 150,30 C 200,30 245,50 245,140 L 150,140 L 150,30 Z" },
    { id: "back-lower-l", name: "Lower Left", path: "M 55,140 L 150,140 L 150,290 L 100,320 L 75,250 C 60,220 55,180 55,140 Z" },
    { id: "back-lower-r", name: "Lower Right", path: "M 245,140 L 150,140 L 150,290 L 200,320 L 225,250 C 240,220 245,180 245,140 Z" },
    { id: "back-neck", name: "Neck (Back)", path: "M 100,320 L 150,290 L 200,320 L 230,370 L 70,370 Z" },
  ],
};

const ALL_REGIONS = [...PAIN_REGIONS.front, ...PAIN_REGIONS.back];

export function findPainRegion(id: string): PainRegion | undefined {
  return ALL_REGIONS.find((r) => r.id === id);
}

export const MIGRAINE_TRIGGERS = [
  { id: "stress", label: "Stress", icon: "😰" },
  { id: "lack_of_sleep", label: "Lack of sleep", icon: "😴" },
  { id: "bright_light", label: "Bright light", icon: "☀️" },
  { id: "loud_noise", label: "Loud noise", icon: "🔊" },
  { id: "strong_smell", label: "Strong smell", icon: "👃" },
  { id: "weather", label: "Weather", icon: "🌦️" },
  { id: "skipped_meal", label: "Skipped meal", icon: "🍽️" },
  { id: "dehydration", label: "Dehydration", icon: "💧" },
  { id: "alcohol", label: "Alcohol", icon: "🍷" },
  { id: "caffeine", label: "Caffeine", icon: "☕" },
  { id: "hormonal", label: "Hormonal", icon: "🔄" },
  { id: "screen_time", label: "Screen time", icon: "📱" },
] as const;

export const TIME_OF_DAY_OPTIONS = [
  { id: "night", label: "Night", timeRange: "12am - 6am" },
  { id: "morning", label: "Morning", timeRange: "6am - 12pm" },
  { id: "afternoon", label: "Afternoon", timeRange: "12pm - 6pm" },
  { id: "evening", label: "Evening", timeRange: "6pm - 12am" },
] as const;

export const DURATION_PRESETS = [
  { id: "30m", label: "30m", minutes: 30 },
  { id: "1h", label: "1h", minutes: 60 },
  { id: "2h", label: "2h", minutes: 120 },
  { id: "4h", label: "4h", minutes: 240 },
  { id: "8h+", label: "8h+", minutes: 480 },
] as const;

export type PainLocationId = string;
export type TriggerId = (typeof MIGRAINE_TRIGGERS)[number]["id"];
export type TimeOfDay = (typeof TIME_OF_DAY_OPTIONS)[number]["id"];

export function getInitialMigraineTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 6) return "night";
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening";
}

export function getMigraineSeverityLabel(severity: number): MigraineSeverityLabel {
  if (severity <= 3) return "mild";
  if (severity <= 6) return "moderate";
  return "severe";
}
