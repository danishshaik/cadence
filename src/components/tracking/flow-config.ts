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

export type TrackerFieldType =
  | "stiffness"
  | "linear_scale"
  | "toggle"
  | "joint_map"
  | "selection"
  | "choice";

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
