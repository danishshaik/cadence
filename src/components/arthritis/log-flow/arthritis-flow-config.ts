import {
  ArthritisFormData,
  getStiffnessLabel,
  ACTIVITY_TYPES,
  MANAGEMENT_METHODS,
  WEATHER_CONFIRMATIONS,
} from "@/types/arthritis";
import { TrackerFlowConfig } from "@components/tracking/flow-config";

export const arthritisInitialFormData: ArthritisFormData = {
  stiffness: 3,
  stiffnessLabel: "Slightly Stiff",
  morningStiffness: false,
  affectedJoints: [],
  bilateralSymmetry: false,
  barometricPressure: null,
  temperature: null,
  humidity: null,
  weatherConfirmation: null,
  activities: [],
  managementMethods: [],
  notes: "",
  loggedAt: new Date(),
};

export function normalizeArthritisFormData(data: ArthritisFormData): ArthritisFormData {
  const stiffnessLabel = getStiffnessLabel(data.stiffness);
  if (stiffnessLabel === data.stiffnessLabel) {
    return data;
  }
  return { ...data, stiffnessLabel };
}

export const arthritisFlowConfig: TrackerFlowConfig<ArthritisFormData> = {
  id: "arthritis",
  initialData: arthritisInitialFormData,
  steps: [
    {
      id: "stiffness",
      title: "How are your joints moving right now?",
      subtitle: "Slide to show how flexible or locked you feel",
      fields: [
        {
          id: "stiffness",
          type: "stiffness",
          fieldKey: "stiffness",
        },
        {
          id: "morningStiffness",
          type: "toggle",
          fieldKey: "morningStiffness",
          label: "Morning Stiffness",
          visibility: { type: "before_hour", hour: 10 },
        },
      ],
    },
    {
      id: "location",
      title: "Where is the flare-up centered?",
      subtitle: "Tap a joint to place a pulse dot",
      fields: [
        {
          id: "jointMap",
          type: "joint_map",
          fieldKey: "affectedJoints",
          bilateralKey: "bilateralSymmetry",
        },
      ],
      content: [
        {
          type: "note",
          variant: "selection_count",
          fieldKey: "affectedJoints",
          emptyText: "No joints selected",
          singularLabel: "joint",
          pluralLabel: "joints",
        },
      ],
      validationKey: "arthritis.location",
    },
    {
      id: "context",
      title: "How does the air feel?",
      subtitle: "Confirm the environmental context",
      fields: [
        {
          id: "weatherConfirmation",
          type: "selection",
          fieldKey: "weatherConfirmation",
          allowDeselect: true,
          options: WEATHER_CONFIRMATIONS.map((option) => ({
            value: option.id,
            label: option.label,
          })),
          visualizationKey: "weather.pill",
        },
      ],
      content: [
        {
          type: "weather_summary",
          pressureKey: "barometricPressure",
          temperatureKey: "temperature",
          humidityKey: "humidity",
        },
        {
          type: "note",
          variant: "weather_confirmation",
          fieldKey: "weatherConfirmation",
        },
      ],
    },
    {
      id: "activity",
      title: "What has your body done today?",
      subtitle: "Select all that apply",
      fields: [
        {
          id: "activities",
          type: "choice",
          fieldKey: "activities",
          options: ACTIVITY_TYPES.map((activity) => ({
            value: activity.id,
            label: activity.label,
            description: activity.icon,
          })),
          visualizationKey: "activity.pill",
        },
      ],
      content: [
        {
          type: "note",
          variant: "selection_count",
          fieldKey: "activities",
          emptyText: "No activities selected",
          singularLabel: "activity",
          pluralLabel: "activities",
        },
      ],
    },
    {
      id: "management",
      title: "How are you managing it?",
      subtitle: "Select any that help",
      fields: [
        {
          id: "managementMethods",
          type: "choice",
          fieldKey: "managementMethods",
          options: MANAGEMENT_METHODS.map((method) => ({
            value: method.id,
            label: method.label,
            description: method.icon,
          })),
          visualizationKey: "management.card",
        },
      ],
      content: [
        {
          type: "note",
          variant: "selection_count",
          fieldKey: "managementMethods",
          emptyText: "No methods selected",
          singularLabel: "method",
          pluralLabel: "methods",
        },
      ],
    },
  ],
};
