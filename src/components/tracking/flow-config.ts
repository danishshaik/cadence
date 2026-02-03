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
  size: number;
  x: number;
  y: number;
  labelSize?: number;
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

export type TrackerFieldType =
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
  | "icon_grid";

export interface TrackerFieldConfig {
  id: string;
  type: TrackerFieldType;
  fieldKey: string;
  label?: string;
  description?: string;
  required?: boolean;
  allowDeselect?: boolean;
  min?: number;
  max?: number;
  step?: number;
  leftLabel?: string;
  rightLabel?: string;
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
  dayParts?: DayPartOption[];
  durationOptions?: DurationOption[];
  iconItems?: IconGridItem[];
  iconValueType?: "string" | "object";
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
    };

export interface TrackerStepConfig {
  id: string;
  title?: string;
  subtitle?: string;
  fields: TrackerFieldConfig[];
  content?: FlowContentBlock[];
  validationKey?: ValidationKey;
}

export interface TrackerFlowConfig<TFormData extends FormDataConstraint> {
  id: string;
  steps: TrackerStepConfig[];
  initialData: TFormData;
}
