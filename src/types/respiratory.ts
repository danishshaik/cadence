// Respiratory & Allergy Tracker Types

// Breathing Symptoms
export const RESPIRATORY_SYMPTOMS = [
  { id: "wheezing", label: "Wheezing", description: "Whistling sound", icon: "wind" },
  { id: "dry_cough", label: "Dry Cough", description: "No phlegm", icon: "cough" },
  { id: "productive_cough", label: "Productive Cough", description: "With phlegm", icon: "droplet" },
  { id: "runny_nose", label: "Runny/Stuffy Nose", description: "Congestion", icon: "nose" },
  { id: "itchy_eyes", label: "Itchy/Watery Eyes", description: "Allergic", icon: "eye" },
  { id: "rapid_breathing", label: "Rapid Breathing", description: "Short breaths", icon: "activity" },
] as const;

export type RespiratorySymptomId = (typeof RESPIRATORY_SYMPTOMS)[number]["id"];

// Environmental Triggers
export const RESPIRATORY_TRIGGERS = [
  { id: "pollen", label: "High Pollen/Nature", icon: "flower" },
  { id: "dust", label: "Dust/Cleaning", icon: "sparkles" },
  { id: "pets", label: "Pets/Dander", icon: "paw" },
  { id: "smoke", label: "Smoke/Pollution", icon: "cloud" },
  { id: "cold_air", label: "Cold Air", icon: "snow" },
  { id: "exercise", label: "Heavy Exercise", icon: "fitness" },
  { id: "stress", label: "Stress/Anxiety", icon: "alert" },
  { id: "perfume", label: "Perfume/Scents", icon: "flask" },
] as const;

export type RespiratoryTriggerId = (typeof RESPIRATORY_TRIGGERS)[number]["id"];

// Impact Levels
export const IMPACT_LEVELS = [
  { id: "none", label: "None", description: "Continued as normal", severity: 0 },
  { id: "mild", label: "Mild", description: "Had to slow down", severity: 1 },
  { id: "moderate", label: "Moderate", description: "Had to stop activity", severity: 2 },
  { id: "severe", label: "Severe", description: "Needed immediate help", severity: 3 },
] as const;

export type ImpactLevelId = (typeof IMPACT_LEVELS)[number]["id"];

// Medications
export const RESPIRATORY_MEDICATIONS = [
  { id: "rescue_inhaler", label: "Rescue Inhaler", type: "counter", defaultPuffs: 2 },
  { id: "controller_meds", label: "Controller Meds", type: "toggle" },
  { id: "antihistamine", label: "Antihistamine", type: "toggle" },
  { id: "nasal_spray", label: "Nasal Spray", type: "toggle" },
  { id: "nebulizer", label: "Nebulizer", type: "toggle" },
] as const;

export type RespiratoryMedicationId = (typeof RESPIRATORY_MEDICATIONS)[number]["id"];

// Breathing Quality Labels
export function getBreathingLabel(constriction: number): string {
  if (constriction <= 2) return "Open & Clear";
  if (constriction <= 4) return "Slightly Tight";
  if (constriction <= 6) return "Moderately Restricted";
  if (constriction <= 8) return "Very Tight";
  return "Severely Constricted";
}

// Main Log Interface
export interface RespiratoryLog {
  id: string;
  createdAt: string;

  // Breathing quality (1-10, 1 = open, 10 = constricted)
  constriction: number;
  constrictionLabel: string;

  // Symptoms
  symptoms: RespiratorySymptomId[];

  // Triggers
  triggers: RespiratoryTriggerId[];

  // Impact on activity
  impact: ImpactLevelId;

  // Medications used
  rescueInhalerPuffs: number;
  medications: RespiratoryMedicationId[];

  // Environmental data (if available)
  airQualityIndex?: number;
  pollenLevel?: "low" | "moderate" | "high" | "very_high";

  // Optional notes
  notes?: string;
}

// Form data for the log flow
export interface RespiratoryFormData {
  constriction: number;
  constrictionLabel: string;
  symptoms: RespiratorySymptomId[];
  triggers: RespiratoryTriggerId[];
  impact: ImpactLevelId;
  rescueInhalerPuffs: number;
  medications: RespiratoryMedicationId[];
  notes: string;
  loggedAt: Date;
}
