import {
  MigraineFormData,
  getInitialMigraineTimeOfDay,
  getMigraineSeverityLabel,
  PAIN_REGIONS,
} from "@/types/migraine";
import { colors } from "@theme";
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
  { id: "stress", label: "Stress", icon: "brain" },
  { id: "lack_of_sleep", label: "Sleep", icon: "moon" },
  { id: "bright_light", label: "Light", icon: "sun" },
  { id: "loud_noise", label: "Noise", icon: "volume-2" },
  { id: "strong_smell", label: "Smell", icon: "wind" },
  { id: "weather", label: "Weather", icon: "cloud-rain" },
  { id: "skipped_meal", label: "Meals", icon: "utensils-crossed" },
  { id: "dehydration", label: "Water", icon: "droplets" },
  { id: "alcohol", label: "Alcohol", icon: "wine" },
  { id: "caffeine", label: "Caffeine", icon: "coffee" },
  { id: "hormonal", label: "Hormonal", icon: "heart-pulse" },
  { id: "screen_time", label: "Screen", icon: "monitor" },
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
      title: "How severe is your migraine?",
      subtitle: "Rate your pain from 0 to 10",
      fields: [
        {
          id: "severity",
          type: "hero_scale",
          fieldKey: "severity",
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
      title: "Where does it hurt?",
      subtitle: "Tap the areas affected",
      fields: [
        {
          id: "location",
          type: "region_map",
          fieldKey: "painLocations",
          mapConfig: migraineMapConfig,
          visualizationKey: "migraine.map",
        },
      ],
    },
    {
      id: "triggers",
      title: "What triggered it?",
      subtitle: "Tap bubbles to select",
      fields: [
        {
          id: "triggers",
          type: "bubble_choice",
          fieldKey: "triggers",
          fill: true,
          bubbleItems: migraineTriggerBubbles,
          visualizationKey: "migraine.bubbles",
        },
      ],
    },
    {
      id: "when",
      title: "Pick a time of day",
      subtitle: "Then choose a rough length",
      fields: [
        {
          id: "when",
          type: "day_part_duration",
          fieldKey: "timeOfDay",
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
      title: "Did you take medication?",
      subtitle: "Tap all that apply",
      headerBadge: {
        icon: "pill",
        gradient: [colors.migraine, "#FF8CCB"],
      },
      fields: [
        {
          id: "medication",
          type: "icon_grid",
          fieldKey: "medications",
          showBadge: false,
          iconItems: migraineMedOptions,
          noneSelectedKey: "medicationNoneSelected",
          noneOptionLabel: "No medication taken",
          iconValueType: "object",
          visualizationKey: "migraine.icon-grid",
        },
      ],
    },
  ],
  theme: {
    headerStyle: { paddingHorizontal: 0 },
    titleStyle: { color: colors.arthritisText, fontSize: 28 },
    subtitleStyle: { color: colors.arthritisTextSecondary, fontSize: 17 },
  },
};
