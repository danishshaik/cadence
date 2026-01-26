// Skin/Dermatology Tracker Types - "Clarity"

// Breakout Types
export const BREAKOUT_TYPES = [
  { id: "whitehead", label: "Whitehead", description: "Surface" },
  { id: "blackhead", label: "Blackhead", description: "Congestion" },
  { id: "papule", label: "Papule", description: "Red Bump" },
  { id: "cystic", label: "Cystic", description: "Deep/Underground" },
  { id: "texture", label: "Texture", description: "Scabbing" },
  { id: "scarring", label: "Fading", description: "Scarring" },
] as const;

export type BreakoutTypeId = (typeof BREAKOUT_TYPES)[number]["id"];

// Skin Triggers
export const SKIN_TRIGGERS = [
  { id: "cycle", label: "Cycle", icon: "droplet" },
  { id: "stress", label: "High Stress", icon: "alert-circle" },
  { id: "poor_sleep", label: "Poor Sleep", icon: "moon" },
  { id: "dairy_sugar", label: "Dairy/Sugar", icon: "cookie" },
  { id: "dirty_pillowcase", label: "Dirty Pillowcase", icon: "bed" },
  { id: "touching_face", label: "Touching Face", icon: "hand" },
  { id: "new_product", label: "New Product", icon: "flask" },
  { id: "humidity", label: "Humidity", icon: "cloud" },
  { id: "sweat", label: "Sweat/Exercise", icon: "activity" },
] as const;

export type SkinTriggerId = (typeof SKIN_TRIGGERS)[number]["id"];

// Routine Steps
export const ROUTINE_STEPS = [
  { id: "cleanser", label: "Cleanser", category: "basic" },
  { id: "toner", label: "Toner", category: "basic" },
  { id: "treatment", label: "Treatment", category: "active" },
  { id: "moisturizer", label: "Moisturizer", category: "basic" },
  { id: "spf", label: "SPF", category: "basic" },
] as const;

export type RoutineStepId = (typeof ROUTINE_STEPS)[number]["id"];

// Treatment Actives (sub-menu for Treatment step)
export const TREATMENT_ACTIVES = [
  { id: "retinol", label: "Retinol" },
  { id: "salicylic", label: "Salicylic Acid" },
  { id: "benzoyl", label: "Benzoyl Peroxide" },
  { id: "niacinamide", label: "Niacinamide" },
  { id: "azelaic", label: "Azelaic Acid" },
  { id: "vitamin_c", label: "Vitamin C" },
] as const;

export type TreatmentActiveId = (typeof TREATMENT_ACTIVES)[number]["id"];

// Spot Treatments
export const SPOT_TREATMENTS = [
  { id: "pimple_patch", label: "Pimple Patch" },
  { id: "ice_roller", label: "Ice Roller" },
  { id: "spot_treatment", label: "Spot Treatment" },
] as const;

export type SpotTreatmentId = (typeof SPOT_TREATMENTS)[number]["id"];

// Time of Day for Routine
export type RoutineTime = "am" | "pm";

// Severity Labels
export function getSeverityLabel(severity: number): string {
  if (severity <= 2) return "Calm";
  if (severity <= 4) return "Mild";
  if (severity <= 6) return "Moderate";
  if (severity <= 8) return "Uncomfortable";
  return "Painful";
}

// Main Log Interface
export interface SkinLog {
  id: string;
  createdAt: string;

  // Photo data (optional - user may skip)
  photoUri?: string;
  photoMetadata?: {
    ambientLight?: number; // lux
    timeOfDay: string;
  };

  // Breakout types selected
  breakoutTypes: BreakoutTypeId[];

  // Severity (1-10)
  severity: number;
  severityLabel: string;

  // Triggers
  triggers: SkinTriggerId[];

  // Routine
  routineTime: RoutineTime;
  routineSteps: RoutineStepId[];
  treatmentActives: TreatmentActiveId[];
  spotTreatments: SpotTreatmentId[];

  // Optional notes
  notes?: string;
}

// Form data for the log flow
export interface SkinFormData {
  photoUri?: string;
  breakoutTypes: BreakoutTypeId[];
  severity: number;
  severityLabel: string;
  triggers: SkinTriggerId[];
  routineTime: RoutineTime;
  routineSteps: RoutineStepId[];
  treatmentActives: TreatmentActiveId[];
  spotTreatments: SpotTreatmentId[];
  notes: string;
  loggedAt: Date;
}
