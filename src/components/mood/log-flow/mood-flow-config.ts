import {
  BubbleChoiceItem,
  CategorizedChipCategory,
  CategorizedChipItem,
  MultiSelectCardOption,
  TrackerFlowConfig,
  TrackerFlowTheme,
} from "@components/tracking/flow-config";
import { mentalWeatherColors, mentalWeatherFonts } from "@theme";
import { MOOD_TRIGGERS, SELF_CARE_OPTIONS } from "@/types/mood";
import { getInitialMoodFormData, MoodFormData } from "./mood-flow-types";

const moodEmotionBubbles: BubbleChoiceItem[] = [
  { id: "stress", label: "Stress", icon: "brain" },
  { id: "sleep", label: "Sleep", icon: "moon" },
  { id: "light", label: "Light", icon: "sun" },
  { id: "noise", label: "Noise", icon: "volume-2" },
  { id: "smell", label: "Smell", icon: "wind" },
  { id: "weather", label: "Weather", icon: "cloud-rain" },
  { id: "meals", label: "Meals", icon: "utensils-crossed" },
  { id: "water", label: "Water", icon: "droplets" },
  { id: "alcohol", label: "Alcohol", icon: "wine" },
  { id: "caffeine", label: "Caffeine", icon: "coffee" },
  { id: "hormonal", label: "Hormonal", icon: "heart-pulse" },
  { id: "screen", label: "Screen", icon: "monitor" },
];

const moodTriggerCategories: CategorizedChipCategory[] = [
  { id: "sleep", label: "Sleep", icon: "moon" },
  { id: "social", label: "Social", icon: "people" },
  { id: "health", label: "Health", icon: "heart-pulse" },
  { id: "environment", label: "Environment", icon: "cloud-rain" },
];

const moodTriggerItems: CategorizedChipItem[] = MOOD_TRIGGERS.map((trigger) => ({
  id: trigger.id,
  label: trigger.label,
  category: trigger.category,
}));

const selfCareCardConfig: Record<
  (typeof SELF_CARE_OPTIONS)[number]["id"],
  { title: string; subtitle: string; icon: string }
> = {
  meditation: { title: "Meditation", subtitle: "Calm your mind", icon: "brain" },
  exercise: { title: "Walk", subtitle: "Move your body", icon: "footprints" },
  journaled: { title: "Journaling", subtitle: "Write it out", icon: "pen-line" },
  talked: { title: "Talk to a friend", subtitle: "Connection heals", icon: "message-circle" },
  medication: { title: "Medication", subtitle: "Support your body", icon: "pill" },
  survived: { title: "Just survived", subtitle: "You made it through", icon: "shield" },
};

const selfCareCardOptions: MultiSelectCardOption[] = SELF_CARE_OPTIONS.map((option) => {
  const config = selfCareCardConfig[option.id];
  return {
    id: option.id,
    title: config.title,
    subtitle: config.subtitle,
    icon: config.icon,
  };
});

export const moodFlowTheme: TrackerFlowTheme = {
  titleStyle: {
    fontFamily: mentalWeatherFonts.rounded,
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 32,
    color: mentalWeatherColors.textPrimary,
    textAlign: "center",
  },
  subtitleStyle: {
    fontFamily: mentalWeatherFonts.text,
    fontSize: 15,
    fontWeight: "500",
    color: mentalWeatherColors.textSoft,
    textAlign: "center",
  },
  noteStyle: {
    fontFamily: mentalWeatherFonts.text,
    fontSize: 14,
    fontWeight: "500",
    color: mentalWeatherColors.hint,
    textAlign: "center",
  },
};

export const moodFlowConfig: TrackerFlowConfig<MoodFormData> = {
  id: "mood",
  initialData: getInitialMoodFormData(),
  theme: moodFlowTheme,
  steps: [
    {
      id: "core",
      title: "How does your mind\nfeel right now?",
      subtitle: "Drag the orb to describe your state",
      fields: [
        {
          id: "core-state",
          type: "axis_grid",
          fieldKey: "energy",
          secondaryKey: "positivity",
          dominantKey: "dominantMood",
          leftLabel: "Unpleasant",
          rightLabel: "Pleasant",
          topLabel: "High energy",
          bottomLabel: "Low energy",
          cardGradient: ["#FFFFFF", "#FFFFFF"],
          visualizationKey: "mood.axis-grid",
        },
      ],
      content: [
        {
          type: "note",
          variant: "text",
          text: "Just go with your gut",
        },
      ],
    },
    {
      id: "emotions",
      title: "Pick a few words",
      subtitle: "How are you feeling right now?",
      fields: [
        {
          id: "emotions",
          type: "bubble_choice",
          fieldKey: "emotions",
          bubbleItems: moodEmotionBubbles,
          bubbleLayoutPreset: "pencil",
          visualizationKey: "mood.bubbles",
        },
      ],
    },
    {
      id: "triggers",
      title: "What's influencing you?",
      subtitle: "Select anything that applies today",
      fields: [
        {
          id: "triggers",
          type: "categorized_chips",
          fieldKey: "triggers",
          chipCategories: moodTriggerCategories,
          chipItems: moodTriggerItems,
          visualizationKey: "mood.triggers",
        },
      ],
    },
    {
      id: "selfcare",
      title: "Did you support yourself?",
      subtitle: "Every small step counts",
      fields: [
        {
          id: "selfcare",
          type: "multi_select_card",
          fieldKey: "selfCare",
          fill: true,
          cardOptions: selfCareCardOptions,
          badgeTemplate: "{count} thing{plural} - you showed up for yourself.",
          badgeIcon: "sparkles",
          visualizationKey: "mood.selfcare",
        },
      ],
    },
  ],
};
