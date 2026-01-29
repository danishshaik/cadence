export type VisualizationVariant = "default" | "compact";

interface VisualizationConfig {
  variant: VisualizationVariant;
}

export type VisualizationKey = "selection.compact";

const visualizationRegistry: Record<VisualizationKey, VisualizationConfig> = {
  "selection.compact": {
    variant: "compact",
  },
};

export function getVisualization(key: VisualizationKey): VisualizationConfig {
  return visualizationRegistry[key];
}
