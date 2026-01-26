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

export const PAIN_LOCATIONS = [
  { id: "left_frontal", label: "Left Front", cx: 35, cy: 30 },
  { id: "right_frontal", label: "Right Front", cx: 65, cy: 30 },
  { id: "left_temple", label: "Left Temple", cx: 18, cy: 45 },
  { id: "right_temple", label: "Right Temple", cx: 82, cy: 45 },
  { id: "occipital", label: "Back of Head", cx: 50, cy: 15 },
  { id: "cervical", label: "Neck", cx: 50, cy: 85 },
  { id: "left_eye", label: "Left Eye", cx: 38, cy: 42 },
  { id: "right_eye", label: "Right Eye", cx: 62, cy: 42 },
] as const;

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

export type PainLocationId = (typeof PAIN_LOCATIONS)[number]["id"];
export type TriggerId = (typeof MIGRAINE_TRIGGERS)[number]["id"];
export type TimeOfDay = (typeof TIME_OF_DAY_OPTIONS)[number]["id"];
