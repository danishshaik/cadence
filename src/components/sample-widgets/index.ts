/**
 * Sample Widgets
 *
 * Inspirational widget designs showcasing advanced interaction patterns
 * and accessibility-first UI for health tracking.
 */

export { MigraineCrisisWidget } from "./migraine-crisis-widget";
export type { MigraineMetrics } from "./migraine-crisis-widget";
export { BreatheDashboardWidget } from "./breathe-dashboard-widget";
export { ArthritisDashboardWidget } from "../arthritis/arthritis-dashboard-widget";

export {
  SAMPLE_WIDGETS,
  getPinnedWidgets,
  getSampleWidget,
  getWidgetsByCategory,
  type SampleWidget,
} from "./sample-widget-data";

export {
  PinnedWidgetShowcase,
  resetDismissedWidgets,
} from "./pinned-widget-showcase";