import { SkinFormData, getSeverityLabel } from "@/types/skin";
import { colors } from "@theme";
import {
  IconGridItem,
  MultiSelectCardOption,
  TrackerFlowConfig,
  TrackerFlowTheme,
} from "@components/tracking/flow-config";

const skinBreakoutOptions: IconGridItem[] = [
  { id: "whitehead", label: "Whitehead", icon: "circle" },
  { id: "blackhead", label: "Blackhead", icon: "circle" },
  { id: "papule", label: "Papule", icon: "circle" },
  { id: "cystic", label: "Cystic", icon: "circle" },
  { id: "texture", label: "Texture", icon: "circle" },
  { id: "scarring", label: "Fading", icon: "circle" },
];

const skinTriggerOptions: MultiSelectCardOption[] = [
  {
    id: "cycle",
    title: "Cycle",
    subtitle: "Hormonal changes.",
    icon: "water-outline",
  },
  {
    id: "stress",
    title: "High Stress",
    subtitle: "Anxiety or tension.",
    icon: "zap",
  },
  {
    id: "poor_sleep",
    title: "Poor Sleep",
    subtitle: "Under 6 hours rest.",
    icon: "moon-outline",
  },
  {
    id: "dairy_sugar",
    title: "Dairy / Sugar",
    subtitle: "Inflammatory foods.",
    icon: "utensils-crossed",
  },
  {
    id: "dirty_pillowcase",
    title: "Dirty Pillowcase",
    subtitle: "Unwashed bedding.",
    icon: "bed-outline",
  },
  {
    id: "touching_face",
    title: "Touching Face",
    subtitle: "Hands on skin.",
    icon: "hand-left-outline",
  },
];

const skinRoutineOptions: MultiSelectCardOption[] = [
  {
    id: "cleanser",
    title: "Cleanser",
    subtitle: "Gentle foaming wash",
    icon: "droplets",
  },
  {
    id: "toner",
    title: "Toner",
    subtitle: "Hydrating essence",
    icon: "flask-outline",
  },
  {
    id: "treatment",
    title: "Treatment",
    subtitle: "Retinol, Niacinamide",
    icon: "sparkles",
  },
  {
    id: "moisturizer",
    title: "Moisturizer",
    subtitle: "Barrier repair cream",
    icon: "sparkles",
  },
  {
    id: "spf",
    title: "SPF",
    subtitle: "Sun protection",
    icon: "sunny-outline",
  },
];

const skinFlowTheme: TrackerFlowTheme = {
  headerStyle: { paddingHorizontal: 0 },
  titleStyle: {
    color: "#2F3A34",
    fontSize: 24,
    fontWeight: "700",
  },
  subtitleStyle: {
    color: "#6C7A72",
    fontSize: 14,
  },
  noteStyle: {
    color: colors.skin,
    fontSize: 13,
    fontWeight: "600",
  },
};

export const skinInitialFormData: SkinFormData = {
  photoUri: undefined,
  breakoutTypes: [],
  severity: 3,
  severityLabel: "Mild",
  morningLightness: false,
  triggers: [],
  routineTime: new Date().getHours() < 14 ? "am" : "pm",
  routineSteps: [],
  treatmentActives: [],
  spotTreatments: [],
  notes: "",
  loggedAt: new Date(),
};

export function normalizeSkinFormData(data: SkinFormData): SkinFormData {
  const severityLabel = getSeverityLabel(data.severity);
  if (severityLabel === data.severityLabel) {
    return data;
  }
  return { ...data, severityLabel };
}

export const skinFlowConfig: TrackerFlowConfig<SkinFormData> = {
  id: "skin",
  initialData: skinInitialFormData,
  theme: skinFlowTheme,
  steps: [
    {
      id: "photo",
      fields: [
        {
          id: "photo",
          type: "camera_capture",
          fieldKey: "photoUri",
          visualizationKey: "skin.photo",
          fill: true,
        },
      ],
    },
    {
      id: "breakout",
      title: "What's showing up?",
      subtitle: "Select all that apply",
      fields: [
        {
          id: "breakout",
          type: "icon_grid",
          fieldKey: "breakoutTypes",
          iconItems: skinBreakoutOptions,
          showBadge: false,
          visualizationKey: "skin.breakout",
        },
      ],
      content: [
        {
          type: "note",
          variant: "selection_count",
          fieldKey: "breakoutTypes",
          emptyText: "0 selected",
          singularLabel: "",
          pluralLabel: "",
        },
      ],
    },
    {
      id: "severity",
      fields: [
        {
          id: "severity",
          type: "hero_scale",
          fieldKey: "severity",
          secondaryKey: "severityLabel",
          min: 1,
          max: 10,
          step: 1,
          leftLabel: "Calm",
          rightLabel: "Painful",
          label: "How does your skin feel?",
          description: "Drag to indicate sensation level",
          visualizationKey: "skin.severity",
        },
        {
          id: "morning-lightness",
          type: "toggle",
          fieldKey: "morningLightness",
          label: "Morning lightness",
          visualizationKey: "skin.morning-lightness",
        },
      ],
    },
    {
      id: "triggers",
      title: "Any likely culprits?",
      subtitle: "Select potential triggers",
      fields: [
        {
          id: "triggers",
          type: "multi_select_card",
          fieldKey: "triggers",
          cardOptions: skinTriggerOptions,
          visualizationKey: "skin.triggers",
        },
      ],
      content: [
        {
          type: "note",
          variant: "selection_count",
          fieldKey: "triggers",
          emptyText: "0 triggers selected",
          singularLabel: "trigger",
          pluralLabel: "triggers",
        },
      ],
    },
    {
      id: "routine",
      title: "Routine",
      subtitle: "Track what you applied today",
      fields: [
        {
          id: "routine",
          type: "multi_select_card",
          fieldKey: "routineSteps",
          cardOptions: skinRoutineOptions,
          visualizationKey: "skin.routine",
        },
      ],
    },
  ],
};
