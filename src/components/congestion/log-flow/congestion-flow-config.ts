import {
  COUGH_CHARACTERS,
  CongestionFormData,
  PHLEGM_COLORS,
  RELIEF_MEASURES,
  getSleepLabel,
} from "@/types/congestion";
import {
  AnatomyMapConfig,
  FlowOption,
  MultiSelectCardOption,
  SwatchOption,
  TrackerFlowConfig,
} from "@components/tracking/flow-config";

const congestionAnatomyMapConfig: AnatomyMapConfig = {
  canvasWidth: 302,
  canvasHeight: 420,
  cardHeight: 420,
  maxCardWidth: 342,
  screenPadding: 48,
  cardBackgroundColor: "#FFFFFF",
  cardBorderColor: "#E5EBE5",
  cardShadow: "0 12px 32px rgba(136, 216, 176, 0.09)",
  layers: [
    {
      id: "head",
      x: 120,
      y: 30,
      width: 72,
      height: 72,
      fill: "#E2E8E5",
      borderRadius: 36,
    },
    {
      id: "neck",
      x: 143,
      y: 98,
      width: 26,
      height: 44,
      fill: "#E2E8E5",
      borderRadius: 6,
    },
    {
      id: "arm-left",
      x: 44,
      y: 148,
      width: 32,
      height: 160,
      fill: "#E2E8E5",
      borderRadius: 14,
    },
    {
      id: "arm-right",
      x: 236,
      y: 148,
      width: 32,
      height: 160,
      fill: "#E2E8E5",
      borderRadius: 14,
    },
    {
      id: "torso",
      x: 82,
      y: 138,
      width: 148,
      height: 210,
      fill: "#D4DBD7",
      borderRadius: 24,
    },
    {
      id: "lung-left",
      x: 94,
      y: 168,
      width: 58,
      height: 92,
      fill: "#BEC7C2",
      cornerRadii: {
        topLeft: 8,
        topRight: 18,
        bottomRight: 8,
        bottomLeft: 18,
      },
    },
    {
      id: "lung-right",
      x: 160,
      y: 168,
      width: 58,
      height: 92,
      fill: "#BEC7C2",
      cornerRadii: {
        topLeft: 18,
        topRight: 8,
        bottomRight: 18,
        bottomLeft: 8,
      },
    },
    {
      id: "trachea",
      x: 150,
      y: 128,
      width: 14,
      height: 50,
      fill: "#CBD4CF",
      borderRadius: 4,
    },
  ],
  decorativePoints: [
    { id: "head-dot", x: 156, y: 58, radius: 12 },
    { id: "lung-dot-left", x: 120, y: 210, radius: 12 },
    { id: "lung-dot-right", x: 192, y: 210, radius: 12 },
  ],
  hotspots: [
    {
      id: "head",
      label: "Head",
      x: 156,
      y: 58,
      radius: 12,
      ringRadius: 24,
    },
    {
      id: "throat",
      label: "Throat",
      x: 156,
      y: 122,
      radius: 12,
      ringRadius: 24,
    },
    {
      id: "bronchi",
      label: "Bronchi",
      x: 156,
      y: 168,
      radius: 12,
      ringRadius: 24,
    },
    {
      id: "deep_lungs_left",
      valueId: "deep_lungs",
      label: "Deep Lungs",
      x: 120,
      y: 210,
      radius: 12,
      ringRadius: 24,
    },
    {
      id: "deep_lungs_right",
      valueId: "deep_lungs",
      label: "Deep Lungs",
      x: 192,
      y: 210,
      radius: 12,
      ringRadius: 24,
    },
  ],
};

const coughCharacterOptions: FlowOption[] = COUGH_CHARACTERS.map((character) => {
  const icon =
    character.id === "dry"
      ? "wind"
      : character.id === "barking"
      ? "volume-high-outline"
      : character.id === "wet"
      ? "cloud-rain"
      : "droplets";

  const accentColor =
    character.id === "dry"
      ? "#88D8B0"
      : character.id === "barking"
      ? "#FF9E7A"
      : character.id === "wet"
      ? "#4DB6AC"
      : "#F9A825";

  const iconBackgroundColor =
    character.id === "dry"
      ? "#E8F5F2"
      : character.id === "barking"
      ? "#FFF0E8"
      : character.id === "wet"
      ? "#E0F2F1"
      : "#FFF8E1";

  const glowColor =
    character.id === "dry"
      ? "rgba(136, 216, 176, 0.18)"
      : character.id === "barking"
      ? "rgba(255, 158, 122, 0.18)"
      : character.id === "wet"
      ? "rgba(77, 182, 172, 0.18)"
      : "rgba(249, 168, 37, 0.22)";

  const selectedBackgroundColor = character.id === "productive" ? "#F0FAF5" : "#FFFFFF";

  return {
    value: character.id,
    label: character.label,
    subtitle: character.description,
    icon,
    accentColor,
    iconBackgroundColor,
    glowColor,
    selectedBackgroundColor,
  };
});

const phlegmSwatches: SwatchOption[] = PHLEGM_COLORS.map((option) => ({
  id: option.id,
  label: option.id === "pink" ? "Pink/Rust" : option.label.split("/")[0],
  color:
    option.id === "clear"
      ? "#E7EBEF"
      : option.id === "yellow"
      ? "#FFD659"
      : option.id === "green"
      ? "#74C58A"
      : "#EF9A9A",
}));

const phlegmInsights: Record<string, string> = {
  clear: "Clear usually indicates low mucus production",
  yellow: "Yellow typically indicates immune response",
  green: "Green may indicate thicker mucus production",
  pink: "If pink/rust persists, contact your provider",
};

const reliefCardMeta: Record<
  (typeof RELIEF_MEASURES)[number]["id"],
  { icon: string; subtitle: string; title: string }
> = {
  tea: {
    title: "Hot Tea / Honey",
    subtitle: "Warm soothing drink.",
    icon: "coffee",
  },
  steam: {
    title: "Steam / Shower",
    subtitle: "Hot steam inhalation.",
    icon: "cloud-outline",
  },
  lozenge: {
    title: "Cough Drop",
    subtitle: "Lozenge or throat drop.",
    icon: "pill",
  },
  inhaler: {
    title: "Inhaler",
    subtitle: "Prescribed inhaler.",
    icon: "wind",
  },
  chest_rub: {
    title: "Chest Rub",
    subtitle: "Vapor rub or balm.",
    icon: "hand-left-outline",
  },
  propped: {
    title: "Rest",
    subtitle: "Lying down, sleeping.",
    icon: "bed-outline",
  },
};

const reliefOptions: MultiSelectCardOption[] = RELIEF_MEASURES.map((option) => ({
  id: option.id,
  title: reliefCardMeta[option.id].title,
  subtitle: reliefCardMeta[option.id].subtitle,
  icon: reliefCardMeta[option.id].icon,
}));

export const congestionInitialFormData: CongestionFormData = {
  sleepQuality: 0,
  sleepLabel: getSleepLabel(0),
  wokeDuringNight: false,
  coughCharacters: [],
  congestionSource: ["throat"],
  phlegmColor: null,
  reliefMeasures: [],
  notes: "",
  loggedAt: new Date(),
};

export function normalizeCongestionFormData(data: CongestionFormData): CongestionFormData {
  const sleepLabel = getSleepLabel(data.sleepQuality);
  if (sleepLabel === data.sleepLabel) {
    return data;
  }
  return { ...data, sleepLabel };
}

export const congestionFlowConfig: TrackerFlowConfig<CongestionFormData> = {
  id: "congestion",
  initialData: congestionInitialFormData,
  steps: [
    {
      id: "sleep",
      title: "How was your rest last night?",
      subtitle: "Slide to show your sleep quality",
      fields: [
        {
          id: "sleepQuality",
          type: "hero_scale",
          fieldKey: "sleepQuality",
          secondaryKey: "sleepLabel",
          min: 0,
          max: 3,
          step: 1,
          leftLabel: "Unbroken",
          rightLabel: "Restless",
          visualizationKey: "congestion.sleep",
        },
        {
          id: "wokeDuringNight",
          type: "toggle",
          fieldKey: "wokeDuringNight",
          label: "Woke during the night",
          visualizationKey: "congestion.sleep",
        },
      ],
    },
    {
      id: "character",
      title: "What does the cough feel like?",
      subtitle: "Select all that apply",
      fields: [
        {
          id: "coughCharacters",
          type: "choice",
          fieldKey: "coughCharacters",
          options: coughCharacterOptions,
          visualizationKey: "choice.icon-tiles",
          fill: true,
        },
      ],
    },
    {
      id: "source",
      title: "Where is the congestion sitting?",
      subtitle: "Tap to select the affected area",
      fields: [
        {
          id: "congestionSource",
          type: "anatomy_hotspot",
          fieldKey: "congestionSource",
          anatomyMapConfig: congestionAnatomyMapConfig,
          anatomySelectionMode: "multiple",
          visualizationKey: "congestion.source",
          fill: true,
        },
      ],
    },
    {
      id: "production",
      title: "If productive, what color is it?",
      subtitle: "This helps track your recovery",
      fields: [
        {
          id: "phlegmColor",
          type: "swatch_selection",
          fieldKey: "phlegmColor",
          swatchOptions: phlegmSwatches,
          swatchInsightByValue: phlegmInsights,
          visualizationKey: "congestion.phlegm-swatches",
        },
      ],
    },
    {
      id: "relief",
      title: "What helped you settle?",
      subtitle: "Select all that apply",
      fields: [
        {
          id: "reliefMeasures",
          type: "multi_select_card",
          fieldKey: "reliefMeasures",
          cardOptions: reliefOptions,
          visualizationKey: "congestion.relief-cards",
          fill: true,
        },
      ],
    },
  ],
  theme: {
    containerStyle: { gap: 20 },
    headerStyle: { paddingHorizontal: 0 },
    titleStyle: {
      color: "#2F3A34",
      fontSize: 24,
      fontWeight: "700",
      lineHeight: 30,
    },
    subtitleStyle: {
      color: "#7B857F",
      fontSize: 14,
      lineHeight: 18,
    },
  },
};
