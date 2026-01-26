// Arthritis & Musculoskeletal Pain Tracker Types

// Joint Locations (Body Map)
export const JOINT_LOCATIONS = [
  { id: "cervical_spine", label: "Neck", region: "upper" },
  { id: "lumbar_spine", label: "Lower Back", region: "upper" },
  { id: "shoulder_left", label: "Left Shoulder", region: "upper", side: "left" },
  { id: "shoulder_right", label: "Right Shoulder", region: "upper", side: "right" },
  { id: "elbow_left", label: "Left Elbow", region: "arm", side: "left" },
  { id: "elbow_right", label: "Right Elbow", region: "arm", side: "right" },
  { id: "wrist_left", label: "Left Wrist/Hand", region: "arm", side: "left" },
  { id: "wrist_right", label: "Right Wrist/Hand", region: "arm", side: "right" },
  { id: "hip_left", label: "Left Hip", region: "lower", side: "left" },
  { id: "hip_right", label: "Right Hip", region: "lower", side: "right" },
  { id: "knee_left", label: "Left Knee", region: "leg", side: "left" },
  { id: "knee_right", label: "Right Knee", region: "leg", side: "right" },
  { id: "ankle_left", label: "Left Ankle/Foot", region: "leg", side: "left" },
  { id: "ankle_right", label: "Right Ankle/Foot", region: "leg", side: "right" },
] as const;

export type JointLocationId = (typeof JOINT_LOCATIONS)[number]["id"];

// Weather Confirmation Options
export const WEATHER_CONFIRMATIONS = [
  { id: "yes", label: "Yes", description: "Weather matches pain" },
  { id: "no", label: "No", description: "Weather doesn't affect pain" },
  { id: "cold", label: "It's the Cold", description: "Cold specifically triggers pain" },
] as const;

export type WeatherConfirmationId = (typeof WEATHER_CONFIRMATIONS)[number]["id"];

// Activity Types
export const ACTIVITY_TYPES = [
  { id: "sedentary", label: "Sedentary (Sitting/Desk)", icon: "chair", category: "sedentary" },
  { id: "gym_heavy", label: "Gym (Heavy Lifting)", icon: "dumbbell", category: "active" },
  { id: "cardio", label: "Cardio/Run", icon: "heart-pulse", category: "active" },
  { id: "yoga_stretch", label: "Yoga/Stretch", icon: "accessibility", category: "active" },
  { id: "physio", label: "Physiotherapy", icon: "activity", category: "active" },
  { id: "heavy_carrying", label: "Heavy Carrying / Repetitive", icon: "package", category: "impact" },
] as const;

export type ActivityTypeId = (typeof ACTIVITY_TYPES)[number]["id"];

// Management Methods
export const MANAGEMENT_METHODS = [
  { id: "nsaids", label: "NSAIDs", description: "Ibuprofen/Naproxen", icon: "pill", category: "medical" },
  { id: "topical", label: "Topical Cream", description: "Voltaren/BenGay", icon: "droplet", category: "medical" },
  { id: "heat", label: "Heating Pad", description: "Warm compress", icon: "flame", category: "physical" },
  { id: "ice", label: "Ice Pack", description: "Cold compress", icon: "snowflake", category: "physical" },
  { id: "compression", label: "Compression", description: "Sleeve/wrap", icon: "wrap", category: "physical" },
  { id: "foam_rolling", label: "Foam Rolling", description: "Self-massage", icon: "cylinder", category: "physical" },
  { id: "rest", label: "Rest/Nap", description: "Taking a break", icon: "moon", category: "rest" },
  { id: "elevation", label: "Elevation", description: "Raised position", icon: "arrow-up", category: "rest" },
] as const;

export type ManagementMethodId = (typeof MANAGEMENT_METHODS)[number]["id"];

// Stiffness Labels (0-10 scale, 0 = Fluid & Flexible, 10 = Locked & Rigid)
export function getStiffnessLabel(stiffness: number): string {
  if (stiffness <= 1) return "Fluid & Flexible";
  if (stiffness <= 3) return "Slightly Stiff";
  if (stiffness <= 5) return "Moderately Stiff";
  if (stiffness <= 7) return "Very Stiff";
  if (stiffness <= 9) return "Nearly Locked";
  return "Locked & Rigid";
}

// Main Log Interface
export interface ArthritisLog {
  id: string;
  createdAt: string;

  // Stiffness/Pain level (0-10, 0 = fluid, 10 = locked)
  stiffness: number;
  stiffnessLabel: string;

  // Morning stiffness flag
  morningStiffness: boolean;

  // Affected joints
  affectedJoints: JointLocationId[];
  bilateralSymmetry: boolean;

  // Environmental context
  barometricPressure?: "rising" | "falling" | "stable";
  temperature?: number;
  humidity?: number;
  weatherConfirmation?: WeatherConfirmationId;

  // Activities performed
  activities: ActivityTypeId[];

  // Management methods used
  managementMethods: ManagementMethodId[];

  // Optional notes
  notes?: string;
}

// Form data for the log flow
export interface ArthritisFormData {
  stiffness: number;
  stiffnessLabel: string;
  morningStiffness: boolean;
  affectedJoints: JointLocationId[];
  bilateralSymmetry: boolean;
  barometricPressure: "rising" | "falling" | "stable" | null;
  temperature: number | null;
  humidity: number | null;
  weatherConfirmation: WeatherConfirmationId | null;
  activities: ActivityTypeId[];
  managementMethods: ManagementMethodId[];
  notes: string;
  loggedAt: Date;
}
