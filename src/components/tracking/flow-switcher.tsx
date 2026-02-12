import React from "react";
import {
  TrackerName,
  useTrackerFeatureFlag,
} from "@stores/feature-flags-store";

interface FlowSwitcherProps {
  /** Which tracker this switcher is for */
  tracker: TrackerName;
  /** The legacy (current) flow component */
  legacyFlow: React.ReactNode;
  /** The new (refactored) flow component - optional until implemented */
  newFlow?: React.ReactNode;
}

/**
 * Conditionally renders either the legacy or new flow based on feature flag.
 *
 * Usage:
 * ```tsx
 * <FlowSwitcher
 *   tracker="respiratory"
 *   legacyFlow={<LogRespiratoryFlow />}
 *   newFlow={<NewRespiratoryFlow />}  // Add when implemented
 * />
 * ```
 *
 * When newFlow is not provided, always renders legacyFlow regardless of flag.
 */
export function FlowSwitcher({
  tracker,
  legacyFlow,
  newFlow,
}: FlowSwitcherProps) {
  const useNewFlow = useTrackerFeatureFlag(tracker);

  // If new flow isn't implemented yet, always use legacy
  if (!newFlow) {
    return <>{legacyFlow}</>;
  }

  return <>{useNewFlow ? newFlow : legacyFlow}</>;
}
