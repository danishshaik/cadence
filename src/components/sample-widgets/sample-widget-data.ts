/**
 * Sample Widget Data
 *
 * Predefined widget configurations that can be shown as pinned inspiration
 * when users first open the app. These showcase the design language and
 * interaction patterns available in Cadence.
 */

export interface SampleWidget {
  id: string;
  type: "migraine_crisis" | "sleep_tracker" | "mood_journal" | "pain_diary";
  title: string;
  description: string;
  category: "neurological" | "mental_health" | "sleep" | "pain";
  designPhilosophy: string;
  features: string[];
  isPinned: boolean;
  sortOrder: number;
}

export const SAMPLE_WIDGETS: SampleWidget[] = [
  {
    id: "sample-migraine-001",
    type: "migraine_crisis",
    title: "Migraine Crisis Tracker",
    description:
      "A specialized crisis console designed for tracking migraine attacks with accessibility-first design. Features tremor-tolerant touch targets, variable resistance haptics, and a vantablack theme to minimize light exposure.",
    category: "neurological",
    designPhilosophy: `
      This widget embodies the "Vantablack" design philosophy:

      Visual Language:
      • Absolute Zero Black (#000000) background - device bezel vanishes
      • No drop shadows (causes visual blur for migraineurs)
      • Inner glow and rim lighting define edges without light pollution
      • System Rounded Heavy typography - text secondary to iconography

      Interaction Model - "Haptic Landscape":
      • Variable resistance haptics guide users with vision issues
      • Heavy thud for toggles ON (breaker switch feel)
      • Light click for toggles OFF
      • Gradient friction on sliders - resistance increases with severity

      Touch Targets:
      • Voronoi-expanded hit areas for tremor tolerance
      • Fuzzy body map regions extend well outside visual bounds
      • All targets sized for imprecise motor control
    `,
    features: [
      "Fluid Pain Thermometer (0-10 continuous scale)",
      "Color interpolation: Teal → Indigo → Crimson",
      "Morphing face icon that transitions smoothly between expressions",
      "Quick-Shot Medication button with 3-second undo window",
      "Fuzzy body map with Voronoi-expanded touch regions",
      "Binary trigger grid (Light, Sound, Smell, Nausea)",
      "Magnetic snap functional capacity slider",
      "Two-page swipe interface",
      "Real-time haptic feedback",
      "Fire-and-forget data persistence",
    ],
    isPinned: true,
    sortOrder: 1,
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
