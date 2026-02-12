import {
  OrthostaticHydrationFactor,
  OrthostaticPosition,
  OrthostaticSedentaryDuration,
  OrthostaticSymptom,
} from "@/types/orthostatic";
import { TrackerFlowConfig, TrackerFlowTheme } from "@components/tracking/flow-config";

type DurationUnitId = "seconds" | "minutes";

export interface OrthostaticFlowFormData {
  severity: number;
  durationSeconds: number;
  durationMinutes: number;
  durationUnit: DurationUnitId;
  symptoms: OrthostaticSymptom[];
  positionBeforeStanding: OrthostaticPosition;
  sedentaryDuration: OrthostaticSedentaryDuration;
  hydrationFactors: OrthostaticHydrationFactor[];
}

const hydrationOptions: { value: OrthostaticHydrationFactor; label: string; description: string }[] = [
  {
    value: "large_meal",
    label: "Large meal",
    description: "utensils-crossed|Blood shifts to digestion.",
  },
  {
    value: "hot_weather",
    label: "Hot environment",
    description: "sun|Heat widens blood vessels.",
  },
  {
    value: "dehydrated",
    label: "Thirsty / dehydrated",
    description: "droplets|Low blood volume.",
  },
  {
    value: "alcohol",
    label: "Alcohol",
    description: "wine|Can lower standing tolerance.",
  },
  {
    value: "missed_medication",
    label: "Missed medication",
    description: "pill|Routine support may be reduced.",
  },
];

const orthostaticFlowTheme: TrackerFlowTheme = {
  containerStyle: {
    gap: 18,
  },
  headerStyle: {
    paddingHorizontal: 0,
  },
  titleStyle: {
    color: "#2F3A34",
    fontSize: 26,
    fontWeight: "700",
  },
  subtitleStyle: {
    color: "#9AA2A0",
    fontSize: 15,
  },
  noteStyle: {
    color: "#6C7A72",
    fontSize: 13,
  },
};

export const orthostaticInitialFormData: OrthostaticFlowFormData = {
  severity: 5,
  durationSeconds: 12,
  durationMinutes: 0,
  durationUnit: "seconds",
  symptoms: [],
  positionBeforeStanding: "supine",
  sedentaryDuration: "under_10_min",
  hydrationFactors: [],
};

export const orthostaticFlowConfig: TrackerFlowConfig<OrthostaticFlowFormData> = {
  id: "orthostatic",
  initialData: orthostaticInitialFormData,
  theme: orthostaticFlowTheme,
  steps: [
    {
      id: "severity",
      title: "How intense was the dizziness?",
      subtitle: "Slide to rate the head rush",
      fields: [
        {
          id: "severity",
          type: "hero_scale",
          fieldKey: "severity",
          min: 0,
          max: 10,
          step: 1,
          leftLabel: "No dizziness",
          rightLabel: "Worst",
          visualizationKey: "orthostatic.severity",
        },
      ],
    },
    {
      id: "duration",
      title: "How long until you felt steady?",
      subtitle: "Seconds vs minutes helps pinpoint severity",
      fields: [
        {
          id: "duration",
          type: "radial_duration",
          fieldKey: "durationSeconds",
          unitKey: "durationUnit",
          durationUnits: [
            { id: "seconds", label: "Seconds", min: 0, max: 59, step: 1, targetKey: "durationSeconds" },
            { id: "minutes", label: "Minutes", min: 0, max: 5, step: 1, targetKey: "durationMinutes" },
          ],
          durationPresets: [
            { id: "p-15s", label: "15s", value: 15, unitId: "seconds" },
            { id: "p-30s", label: "30s", value: 30, unitId: "seconds" },
            { id: "p-1m", label: "1m", value: 1, unitId: "minutes" },
          ],
          visualizationKey: "orthostatic.duration",
        },
      ],
    },
    {
      id: "prodrome",
      title: "Did your vision or hearing change?",
      subtitle: "Tap body areas to mark symptoms",
      fields: [
        {
          id: "symptoms",
          type: "hotspot_map",
          fieldKey: "symptoms",
          hotspots: [
            {
              id: "eyes",
              label: "Vision changes",
              x: 130,
              y: 48,
              size: 12,
              calloutLabel: "Vision",
              calloutOffsetX: 24,
              calloutOffsetY: -38,
            },
            {
              id: "ears",
              label: "Hearing changes",
              x: 96,
              y: 48,
              size: 10,
            },
            {
              id: "chest",
              label: "Palpitations",
              x: 130,
              y: 122,
              size: 12,
            },
            {
              id: "legs",
              label: "Leg weakness",
              x: 151,
              y: 252,
              size: 12,
            },
          ],
          visualizationKey: "orthostatic.prodrome",
        },
      ],
      content: [
        {
          type: "note",
          variant: "selection_count",
          fieldKey: "symptoms",
          emptyText: "No symptoms selected",
          singularLabel: "symptom",
          pluralLabel: "symptoms",
        },
      ],
    },
    {
      id: "trigger",
      title: "What position were you in before standing?",
      subtitle: "Choose supine or sitting, then estimate time",
      fields: [
        {
          id: "position",
          type: "selection",
          fieldKey: "positionBeforeStanding",
          options: [
            { value: "supine", label: "Supine" },
            { value: "sitting", label: "Sitting" },
          ],
          visualizationKey: "orthostatic.position",
        },
        {
          id: "sedentary-duration",
          type: "segmented_selection",
          fieldKey: "sedentaryDuration",
          label: "How long were you in this position?",
          description: "Select the approximate duration",
          options: [
            { value: "under_10_min", label: "< 10 min" },
            { value: "thirty_min", label: "30 min" },
            { value: "one_hour_plus", label: "1 hour+" },
          ],
          visualizationKey: "orthostatic.segmented-duration",
        },
      ],
    },
    {
      id: "hydration",
      title: "Did any of these apply before you stood up?",
      subtitle: "Select any that apply",
      fields: [
        {
          id: "hydration-factors",
          type: "choice",
          fieldKey: "hydrationFactors",
          options: hydrationOptions,
          visualizationKey: "orthostatic.hydration-cards",
        },
      ],
      content: [
        {
          type: "note",
          variant: "selection_count",
          fieldKey: "hydrationFactors",
          emptyText: "Nothing selected yet",
          singularLabel: "factor",
          pluralLabel: "factors",
        },
      ],
    },
  ],
};
