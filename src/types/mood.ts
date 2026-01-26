export interface MoodLog {
  id: string;
  // Core state (XY pad values)
  energy: number; // -1 to 1 (low to high)
  positivity: number; // -1 to 1 (unpleasant to pleasant)
  dominantMood: string; // derived label
  // Granular emotions
  emotions: EmotionId[];
  // Somatic symptoms
  somaticSymptoms: SomaticSymptomId[];
  // Triggers
  triggers: MoodTriggerId[];
  // Self-care
  selfCare: SelfCareId[];
  // Timestamps
  loggedAt: string;
  createdAt: string;
}

export const EMOTIONS = [
  { id: "anxious", label: "Anxious" },
  { id: "irritable", label: "Irritable" },
  { id: "overwhelmed", label: "Overwhelmed" },
  { id: "numb", label: "Numb" },
  { id: "content", label: "Content" },
  { id: "grateful", label: "Grateful" },
  { id: "focused", label: "Focused" },
  { id: "foggy", label: "Foggy" },
  { id: "lonely", label: "Lonely" },
  { id: "connected", label: "Connected" },
] as const;

export const SOMATIC_SYMPTOMS = [
  { id: "head_ache", label: "Headache", region: "head", type: "tension" },
  { id: "head_fog", label: "Brain Fog", region: "head", type: "heaviness" },
  { id: "head_racing", label: "Racing Thoughts", region: "head", type: "tension" },
  { id: "throat_lump", label: "Lump in Throat", region: "throat", type: "tension" },
  { id: "throat_tight", label: "Throat Tightness", region: "throat", type: "tension" },
  { id: "chest_flutter", label: "Heart Flutter", region: "chest", type: "tension" },
  { id: "chest_heavy", label: "Heavy Chest", region: "chest", type: "heaviness" },
  { id: "chest_tight", label: "Chest Tightness", region: "chest", type: "tension" },
  { id: "stomach_nausea", label: "Nausea", region: "stomach", type: "tension" },
  { id: "stomach_butterflies", label: "Butterflies", region: "stomach", type: "tension" },
  { id: "stomach_knot", label: "Knot", region: "stomach", type: "tension" },
  { id: "back_heavy", label: "Heavy Shoulders", region: "back", type: "heaviness" },
  { id: "back_tense", label: "Back Tension", region: "back", type: "tension" },
] as const;

export const MOOD_TRIGGERS = [
  // Sleep
  { id: "poor_sleep", label: "Poor Sleep", icon: "moon", category: "sleep" },
  { id: "overslept", label: "Overslept", icon: "moon", category: "sleep" },
  { id: "insomnia", label: "Insomnia", icon: "moon", category: "sleep" },
  // Social
  { id: "conflict", label: "Conflict", icon: "people", category: "social" },
  { id: "isolation", label: "Isolation", icon: "people", category: "social" },
  { id: "social_event", label: "Social Event", icon: "people", category: "social" },
  // Health
  { id: "hormone_cycle", label: "Hormone Cycle", icon: "heart", category: "health" },
  { id: "medication_missed", label: "Missed Medication", icon: "heart", category: "health" },
  { id: "alcohol_caffeine", label: "Alcohol/Caffeine", icon: "heart", category: "health" },
  // Environment
  { id: "work_stress", label: "Work Stress", icon: "bolt", category: "environment" },
  { id: "weather", label: "Weather", icon: "bolt", category: "environment" },
  { id: "news_media", label: "News/Media", icon: "bolt", category: "environment" },
] as const;

export const SELF_CARE_OPTIONS = [
  { id: "meditation", label: "Meditation/Breathing", icon: "lotus" },
  { id: "exercise", label: "Exercised/Walked", icon: "walk" },
  { id: "journaled", label: "Journaled", icon: "book" },
  { id: "talked", label: "Spoke to Someone", icon: "chat" },
  { id: "medication", label: "Took Medication", icon: "pill" },
  { id: "survived", label: "Just Survived", icon: "shield" },
] as const;

export type EmotionId = (typeof EMOTIONS)[number]["id"];
export type SomaticSymptomId = (typeof SOMATIC_SYMPTOMS)[number]["id"];
export type MoodTriggerId = (typeof MOOD_TRIGGERS)[number]["id"];
export type SelfCareId = (typeof SELF_CARE_OPTIONS)[number]["id"];

// Helper to derive mood label from XY position
export function getMoodLabel(energy: number, positivity: number): string {
  if (positivity > 0.3) {
    if (energy > 0.3) return "Energized";
    if (energy < -0.3) return "Calm";
    return "Content";
  }
  if (positivity < -0.3) {
    if (energy > 0.3) return "Anxious";
    if (energy < -0.3) return "Low";
    return "Unsettled";
  }
  if (energy > 0.3) return "Alert";
  if (energy < -0.3) return "Tired";
  return "Neutral";
}
