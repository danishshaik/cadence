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
  | "choice.icon-tiles"
  | "selection.compact"
  | "weather.pill"
  | "activity.pill"
  | "management.card"
  | "mood.axis-grid"
  | "mood.bubbles"
  | "mood.triggers"
  | "mood.selfcare"
  | "migraine.severity"
  | "skin.photo"
  | "skin.breakout"
  | "skin.severity"
  | "skin.morning-lightness"
  | "skin.triggers"
  | "skin.routine"
  | "migraine.map"
  | "migraine.bubbles"
  | "migraine.day-part"
  | "migraine.icon-grid"
  | "congestion.sleep"
  | "congestion.source"
  | "congestion.phlegm-swatches"
  | "congestion.relief-cards"
  | "orthostatic.severity"
  | "orthostatic.duration"
  | "orthostatic.prodrome"
  | "orthostatic.position"
  | "orthostatic.segmented-duration"
  | "orthostatic.hydration-cards";

const visualizationRegistry: Record<VisualizationKey, VisualizationConfig> = {
  "choice.icon-tiles": {
    listStyle: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 12,
    },
  },
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
  "skin.photo": {},
  "skin.breakout": {},
  "skin.severity": {},
  "skin.morning-lightness": {},
  "skin.triggers": {},
  "skin.routine": {},
  "migraine.map": {},
  "migraine.bubbles": {},
  "migraine.day-part": {},
  "migraine.icon-grid": {},
  "congestion.sleep": {},
  "congestion.source": {},
  "congestion.phlegm-swatches": {},
  "congestion.relief-cards": {},
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
