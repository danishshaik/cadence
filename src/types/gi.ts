export interface GILog {
  id: string;
  severity: number; // 0-10
  severityLabel: "mild" | "moderate" | "severe";
  startedAt: string; // ISO timestamp
  context: ContextType;
  painLocations: PainLocationId[];
  symptoms: SymptomId[];
  bowelMovement: BristolType | null;
  triggers: TriggerId[];
  notes: string | null;
  createdAt: string;
}

export const CONTEXT_OPTIONS = [
  { id: "immediately_after_eating", label: "Immediately after eating", icon: "🍽️" },
  { id: "1_2_hours_after", label: "1-2 hours after eating", icon: "⏰" },
  { id: "upon_waking", label: "Upon waking", icon: "🌅" },
  { id: "randomly", label: "Randomly", icon: "❓" },
] as const;

export const GI_PAIN_LOCATIONS = [
  { id: "upper_abdomen", label: "Upper Abdomen", description: "Epigastric", cx: 50, cy: 25 },
  { id: "lower_left", label: "Lower Left", description: "Descending Colon", cx: 25, cy: 70 },
  { id: "lower_right", label: "Lower Right", description: "Ascending Colon", cx: 75, cy: 70 },
  { id: "navel", label: "Navel Area", description: "Umbilical", cx: 50, cy: 50 },
  { id: "generalized", label: "All Over", description: "Generalized", cx: 50, cy: 50 },
] as const;

export const GI_SYMPTOMS = [
  { id: "bloating", label: "Bloating", icon: "balloon" },
  { id: "nausea", label: "Nausea", icon: "wave" },
  { id: "cramping", label: "Cramping", icon: "knot" },
  { id: "heartburn", label: "Heartburn", icon: "fire" },
  { id: "gas", label: "Gas", icon: "wind" },
  { id: "constipation", label: "Constipation", icon: "stop" },
  { id: "diarrhea", label: "Diarrhea", icon: "arrow-down" },
] as const;

export const BRISTOL_SCALE = [
  { id: "type1", label: "Type 1", description: "Hard lumps", shape: "pebbles" },
  { id: "type2", label: "Type 2", description: "Lumpy sausage", shape: "lumpy" },
  { id: "type3", label: "Type 3", description: "Cracked surface", shape: "cracked" },
  { id: "type4", label: "Type 4", description: "Smooth & soft", shape: "smooth" },
  { id: "type5", label: "Type 5", description: "Soft blobs", shape: "blobs" },
  { id: "type6", label: "Type 6", description: "Mushy", shape: "mushy" },
  { id: "type7", label: "Type 7", description: "Liquid", shape: "liquid" },
  { id: "none", label: "None", description: "No movement today", shape: "none" },
] as const;

export const GI_TRIGGERS = [
  { id: "dairy", label: "Dairy", icon: "🥛", category: "food" },
  { id: "gluten", label: "Gluten/Bread", icon: "🍞", category: "food" },
  { id: "spicy", label: "Spicy Food", icon: "🌶️", category: "food" },
  { id: "fatty", label: "Fatty/Fried", icon: "🍟", category: "food" },
  { id: "caffeine", label: "Caffeine", icon: "☕", category: "food" },
  { id: "alcohol", label: "Alcohol", icon: "🍷", category: "food" },
  { id: "fiber", label: "High Fiber", icon: "🥬", category: "food" },
  { id: "sugar", label: "Processed Sugar", icon: "🍬", category: "food" },
  { id: "stress", label: "Stress/Anxiety", icon: "😰", category: "mental" },
] as const;

export type ContextType = (typeof CONTEXT_OPTIONS)[number]["id"];
export type PainLocationId = (typeof GI_PAIN_LOCATIONS)[number]["id"];
export type SymptomId = (typeof GI_SYMPTOMS)[number]["id"];
export type BristolType = (typeof BRISTOL_SCALE)[number]["id"];
export type TriggerId = (typeof GI_TRIGGERS)[number]["id"];
