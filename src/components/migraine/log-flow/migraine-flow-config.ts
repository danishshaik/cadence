import {
  MigraineFormData,
  getInitialMigraineTimeOfDay,
  getMigraineSeverityLabel,
  PAIN_REGIONS,
} from "@/types/migraine";
import {
  BubbleChoiceItem,
  DayPartOption,
  DurationOption,
  IconGridItem,
  RegionMapConfig,
  TrackerFlowConfig,
} from "@components/tracking/flow-config";

const FRONT_SILHOUETTE =
  "M 150,30 C 95,30 55,50 55,90 C 52,130 52,150 52,150 C 55,180 60,210 65,230 C 65,250 70,270 85,290 L 100,320 L 70,370 L 230,370 L 200,320 L 215,290 C 230,270 235,250 235,230 C 240,210 245,180 248,150 C 248,150 248,130 245,90 C 245,50 205,30 150,30 Z";

const BACK_SILHOUETTE =
  "M 150,30 C 95,30 55,50 55,140 C 55,180 60,220 75,250 L 100,320 L 70,370 L 230,370 L 200,320 L 225,250 C 240,220 245,180 245,140 C 245,50 205,30 150,30 Z";

const migraineMapConfig: RegionMapConfig = {
  frontSilhouette: FRONT_SILHOUETTE,
  backSilhouette: BACK_SILHOUETTE,
  regions: PAIN_REGIONS,
};

const migraineTriggerBubbles: BubbleChoiceItem[] = [
  { id: "stress", label: "Stress", icon: "brain", size: 100, x: 8, y: 5 },
  { id: "lack_of_sleep", label: "Sleep", icon: "moon", size: 86, x: 132, y: 18 },
  { id: "bright_light", label: "Light", icon: "sun", size: 94, x: 242, y: 40 },
  { id: "loud_noise", label: "Noise", icon: "volume-2", size: 80, x: 52, y: 122 },
  { id: "strong_smell", label: "Smell", icon: "wind", size: 76, x: 162, y: 130 },
  { id: "weather", label: "Weather", icon: "cloud-rain", size: 82, x: 255, y: 160 },
  { id: "skipped_meal", label: "Meals", icon: "utensils-crossed", size: 92, x: 0, y: 225 },
  { id: "dehydration", label: "Water", icon: "droplets", size: 82, x: 115, y: 240 },
  { id: "alcohol", label: "Alcohol", icon: "wine", size: 78, x: 220, y: 265 },
  { id: "caffeine", label: "Caffeine", icon: "coffee", size: 80, x: 40, y: 340 },
  { id: "hormonal", label: "Hormonal", icon: "heart-pulse", size: 88, x: 145, y: 350, labelSize: 10 },
  { id: "screen_time", label: "Screen", icon: "monitor", size: 80, x: 255, y: 368 },
];

const migraineDayParts: DayPartOption[] = [
  { id: "morning", label: "Morning", icon: "sunrise" },
  { id: "afternoon", label: "Afternoon", icon: "sun" },
  { id: "evening", label: "Evening", icon: "sunset" },
  { id: "night", label: "Night", icon: "moon" },
];

const migraineDurationOptions: DurationOption[] = [
  { id: "short", label: "≤1h", minutes: 60, ongoing: false },
  { id: "medium", label: "1–4h", minutes: 240, ongoing: false },
  { id: "long", label: "4h+", minutes: 480, ongoing: false },
  { id: "ongoing", label: "Ongoing", minutes: null, ongoing: true },
];

const migraineMedOptions: IconGridItem[] = [
  { id: "Ibuprofen", label: "Ibuprofen", icon: "pill" },
  { id: "Tylenol", label: "Tylenol", icon: "pill" },
  { id: "Excedrin", label: "Excedrin", icon: "zap" },
  { id: "Sumatriptan", label: "Sumatriptan", icon: "syringe" },
  { id: "Aspirin", label: "Aspirin", icon: "heart-pulse" },
  { id: "Other", label: "Other", icon: "plus" },
];

export const migraineInitialFormData: MigraineFormData = {
  severity: 5,
  severityLabel: "moderate",
  startedAt: new Date(),
  timeOfDay: getInitialMigraineTimeOfDay(),
  isOngoing: true,
  durationMinutes: null,
  painLocations: [],
  triggers: [],
  medications: [],
  medicationNoneSelected: false,
  notes: null,
};

export function normalizeMigraineFormData(data: MigraineFormData): MigraineFormData {
  const severityLabel = getMigraineSeverityLabel(data.severity);
  if (severityLabel === data.severityLabel) {
    return data;
  }
  return { ...data, severityLabel };
}

export const migraineFlowConfig: TrackerFlowConfig<MigraineFormData> = {
  id: "migraine",
  initialData: migraineInitialFormData,
  steps: [
    {
      id: "severity",
      fields: [
        {
          id: "severity",
          type: "hero_scale",
          fieldKey: "severity",
          label: "How severe is your migraine?",
          description: "Rate your pain from 0 to 10",
          min: 0,
          max: 10,
          step: 1,
          leftLabel: "No pain",
          rightLabel: "Worst pain",
          visualizationKey: "migraine.severity",
        },
      ],
    },
    {
      id: "location",
      fields: [
        {
          id: "location",
          type: "region_map",
          fieldKey: "painLocations",
          label: "Where does it hurt?",
          description: "Tap the areas affected",
          mapConfig: migraineMapConfig,
          visualizationKey: "migraine.map",
        },
      ],
    },
    {
      id: "triggers",
      fields: [
        {
          id: "triggers",
          type: "bubble_choice",
          fieldKey: "triggers",
          label: "What triggered it?",
          description: "Tap bubbles to select",
          bubbleItems: migraineTriggerBubbles,
          visualizationKey: "migraine.bubbles",
        },
      ],
    },
    {
      id: "when",
      fields: [
        {
          id: "when",
          type: "day_part_duration",
          fieldKey: "timeOfDay",
          label: "Pick a time of day",
          description: "Then choose a rough length",
          hintText: "Fine-tune later if needed",
          dayParts: migraineDayParts,
          durationOptions: migraineDurationOptions,
          startedAtKey: "startedAt",
          durationKey: "durationMinutes",
          ongoingKey: "isOngoing",
          visualizationKey: "migraine.day-part",
        },
      ],
    },
    {
      id: "medication",
      fields: [
        {
          id: "medication",
          type: "icon_grid",
          fieldKey: "medications",
          label: "Did you take medication?",
          description: "Tap all that apply",
          iconItems: migraineMedOptions,
          noneSelectedKey: "medicationNoneSelected",
          noneOptionLabel: "No medication taken",
          iconValueType: "object",
          visualizationKey: "migraine.icon-grid",
        },
      ],
    },
  ],
};
