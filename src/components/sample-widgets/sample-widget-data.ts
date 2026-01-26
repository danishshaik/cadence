/**
 * Sample Widget Data
 *
 * Predefined widget configurations that can be shown as pinned inspiration
 * when users first open the app. These showcase the design language and
 * interaction patterns available in Cadence.
 */

export interface SampleWidget {
  id: string;
  type: "migraine_crisis" | "sleep_tracker" | "mood_journal" | "pain_diary" | "breathe_dashboard" | "arthritis_dashboard";
  title: string;
  description: string;
  category: "neurological" | "mental_health" | "sleep" | "pain" | "respiratory" | "musculoskeletal";
  designPhilosophy: string;
  features: string[];
  isPinned: boolean;
  sortOrder: number;
}

export const SAMPLE_WIDGETS: SampleWidget[] = [
  {
    id: "sample-breathe-001",
    type: "breathe_dashboard",
    title: "Breathe Dashboard",
    description:
      "A compact summary widget tracking respiratory control and environmental factors.",
    category: "respiratory",
    designPhilosophy: `
      Compact Dashboard Design:
      • Soft respiratory palette (#E1F5FE background)
      • Key metrics at a glance (Days Controlled)
      • Contextual environmental data (Air Quality)
      • Minimalist typography and iconography
    `,
    features: [
      "Days fully controlled counter",
      "Air Quality Indicator",
      "Gradient progress bars",
    ],
    isPinned: true,
    sortOrder: 1,
  },
  {
    id: "sample-arthritis-001",
    type: "arthritis_dashboard",
    title: "Arthritis Dashboard",
    description:
      "A compact mobility tracking widget with weather correlation insights and trend visualization.",
    category: "musculoskeletal",
    designPhilosophy: `
      Functional Mobility Design:
      • Sage Green palette (#77DD77) for natural relief
      • Weather correlation insights (barometric pressure)
      • 5-day mobility trend line
      • Green/Orange color coding for status
    `,
    features: [
      "Weather correlation insight",
      "Mobility trend graph",
      "Joint status indicator",
      "Quick log access",
    ],
    isPinned: true,
    sortOrder: 2,
  },
];

/**
 * Get pinned sample widgets for display
 */
export const getPinnedWidgets = (): SampleWidget[] => {
  return SAMPLE_WIDGETS.filter((w) => w.isPinned).sort((a, b) => a.sortOrder - b.sortOrder);
};

/**
 * Get sample widget by ID
 */
export const getSampleWidget = (id: string): SampleWidget | undefined => {
  return SAMPLE_WIDGETS.find((w) => w.id === id);
};

/**
 * Get sample widgets by category
 */
export const getWidgetsByCategory = (category: SampleWidget["category"]): SampleWidget[] => {
  return SAMPLE_WIDGETS.filter((w) => w.category === category);
};
