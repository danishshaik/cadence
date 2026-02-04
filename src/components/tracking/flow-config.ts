import { StyleProp, TextStyle, ViewStyle } from "react-native";
import { FormDataConstraint } from "./types";
import { ValidationKey } from "./registries/validation-registry";
import { VisualizationKey } from "./registries/visualization-registry";

export type VisibilityRule = {
  type: "before_hour";
  hour: number;
};

export interface FlowOption {
  value: string;
  label: string;
  description?: string;
}

export interface RegionMapConfig {
  frontSilhouette: string;
  backSilhouette: string;
  regions: Record<"front" | "back", { id: string; name: string; path: string }[]>;
}

export interface BubbleChoiceItem {
  id: string;
  label: string;
  icon: string;
}

export interface CategorizedChipCategory {
  id: string;
  label: string;
  icon: string;
}

export interface CategorizedChipItem {
  id: string;
  label: string;
  category: string;
}

export interface DayPartOption {
  id: string;
  label: string;
  icon: string;
}

export interface DurationOption {
  id: string;
  label: string;
  minutes: number | null;
  ongoing: boolean;
}

export interface IconGridItem {
  id: string;
  label: string;
  icon: string;
}

export interface MultiSelectCardOption {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
}

export type TrackerFieldType =
  | "axis_grid"
  | "stiffness"
  | "linear_scale"
  | "toggle"
  | "joint_map"
  | "selection"
  | "choice"
  | "hero_scale"
  | "region_map"
  | "bubble_choice"
  | "day_part_duration"
  | "icon_grid"
  | "multi_select_card"
  | "categorized_chips";

export interface TrackerFieldConfig {
  id: string;
  type: TrackerFieldType;
  fieldKey: string;
  secondaryKey?: string;
  dominantKey?: string;
  fill?: boolean;
  label?: string;
  description?: string;
  required?: boolean;
  allowDeselect?: boolean;
  min?: number;
  max?: number;
  step?: number;
  leftLabel?: string;
  rightLabel?: string;
  topLabel?: string;
  bottomLabel?: string;
  cardGradient?: string[];
  options?: FlowOption[];
  visualizationKey?: VisualizationKey;
  bilateralKey?: string;
  visibility?: VisibilityRule;
  startedAtKey?: string;
  durationKey?: string;
  ongoingKey?: string;
  noneSelectedKey?: string;
  hintText?: string;
  noneOptionLabel?: string;
  mapConfig?: RegionMapConfig;
  bubbleItems?: BubbleChoiceItem[];
  bubbleLayoutPreset?: "pencil";
  dayParts?: DayPartOption[];
  durationOptions?: DurationOption[];
  iconItems?: IconGridItem[];
  iconValueType?: "string" | "object";
  cardOptions?: MultiSelectCardOption[];
  badgeTemplate?: string;
  badgeIcon?: string;
  badgeShowWhenEmpty?: boolean;
  chipCategories?: CategorizedChipCategory[];
  chipItems?: CategorizedChipItem[];
}

export type FlowContentBlock =
  | {
      type: "weather_summary";
      pressureKey: string;
      temperatureKey: string;
      humidityKey: string;
    }
  | {
      type: "note";
      variant: "selection_count";
      fieldKey: string;
      emptyText?: string;
      singularLabel?: string;
      pluralLabel?: string;
    }
  | {
      type: "note";
      variant: "weather_confirmation";
      fieldKey: string;
    }
  | {
      type: "note";
      variant: "text";
      text: string;
    };

export interface TrackerStepConfig {
  id: string;
  title?: string;
  subtitle?: string;
  fields: TrackerFieldConfig[];
  content?: FlowContentBlock[];
  validationKey?: ValidationKey;
}

export interface TrackerFlowTheme {
  containerStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  fieldsStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  noteStyle?: StyleProp<TextStyle>;
}

export interface TrackerFlowConfig<TFormData extends FormDataConstraint> {
  id: string;
  steps: TrackerStepConfig[];
  initialData: TFormData;
  theme?: TrackerFlowTheme;
}
