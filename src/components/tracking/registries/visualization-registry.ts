import React from "react";
import { StyleProp, ViewStyle } from "react-native";

export type VisualizationVariant = "default" | "compact";

export interface VisualizationContext {
  cardSize?: number;
}

export interface VisualizationConfig {
  variant?: VisualizationVariant;
  listStyle?: StyleProp<ViewStyle>;
  renderOption?: (params: {
    option: { value: string; label: string; description?: string };
    selected: boolean;
    onPress: () => void;
    disabled?: boolean;
  }) => React.ReactNode;
}

export type VisualizationKey =
  | "selection.compact"
  | "weather.pill"
  | "activity.pill"
  | "management.card"
  | "mood.axis-grid"
  | "mood.bubbles"
  | "mood.triggers"
  | "mood.selfcare"
  | "migraine.severity"
  | "migraine.map"
  | "migraine.bubbles"
  | "migraine.day-part"
  | "migraine.icon-grid"
  | "orthostatic.severity"
  | "orthostatic.duration"
  | "orthostatic.prodrome"
  | "orthostatic.position"
  | "orthostatic.segmented-duration"
  | "orthostatic.hydration-cards";

const visualizationRegistry: Record<VisualizationKey, VisualizationConfig> = {
  "selection.compact": {
    variant: "compact",
  },
  "weather.pill": {},
  "activity.pill": {},
  "management.card": {
    listStyle: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 12,
    },
  },
  "mood.axis-grid": {},
  "mood.bubbles": {},
  "mood.triggers": {},
  "mood.selfcare": {},
  "migraine.severity": {},
  "migraine.map": {},
  "migraine.bubbles": {},
  "migraine.day-part": {},
  "migraine.icon-grid": {},
  "orthostatic.severity": {},
  "orthostatic.duration": {},
  "orthostatic.prodrome": {},
  "orthostatic.position": {
    listStyle: {
      flexDirection: "row",
      gap: 16,
    },
  },
  "orthostatic.segmented-duration": {
    variant: "default",
  },
  "orthostatic.hydration-cards": {},
};

export function getVisualization(
  key: VisualizationKey,
  _context?: VisualizationContext
): VisualizationConfig {
  return visualizationRegistry[key];
}
