import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Tracker names that can have feature flags for the refactor.
 * Each tracker can independently toggle between legacy and new flows.
 */
export type TrackerName =
  | "migraine"
  | "mood"
  | "gi"
  | "respiratory"
  | "congestion"
  | "arthritis"
  | "orthostatic"
  | "skin";

/**
 * Feature flags for controlling the tracker refactor rollout.
 * When a tracker's flag is true, the new (refactored) flow is used.
 * When false, the legacy flow is used.
 */
interface FeatureFlagsStore {
  /** Map of tracker name to whether the new flow is enabled */
  useNewFlow: Record<TrackerName, boolean>;

  /** Enable new flow for a specific tracker */
  enableNewFlow: (tracker: TrackerName) => void;

  /** Disable new flow for a specific tracker (use legacy) */
  disableNewFlow: (tracker: TrackerName) => void;

  /** Toggle the flow for a specific tracker */
  toggleFlow: (tracker: TrackerName) => void;

  /** Check if new flow is enabled for a tracker */
  isNewFlowEnabled: (tracker: TrackerName) => boolean;

  /** Enable new flow for all trackers */
  enableAllNewFlows: () => void;

  /** Disable new flow for all trackers (use all legacy) */
  disableAllNewFlows: () => void;

  /** Reset to default state (all legacy) */
  reset: () => void;
}

const DEFAULT_FLAGS: Record<TrackerName, boolean> = {
  migraine: false,
  mood: false,
  gi: false,
  respiratory: false,
  congestion: false,
  arthritis: false,
  orthostatic: false,
  skin: false,
};

export const useFeatureFlagsStore = create<FeatureFlagsStore>()(
  persist(
    (set, get) => ({
      useNewFlow: { ...DEFAULT_FLAGS },

      enableNewFlow: (tracker) =>
        set((state) => ({
          useNewFlow: { ...state.useNewFlow, [tracker]: true },
        })),

      disableNewFlow: (tracker) =>
        set((state) => ({
          useNewFlow: { ...state.useNewFlow, [tracker]: false },
        })),

      toggleFlow: (tracker) =>
        set((state) => ({
          useNewFlow: {
            ...state.useNewFlow,
            [tracker]: !state.useNewFlow[tracker],
          },
        })),

      isNewFlowEnabled: (tracker) => get().useNewFlow[tracker],

      enableAllNewFlows: () =>
        set({
          useNewFlow: {
            migraine: true,
            mood: true,
            gi: true,
            respiratory: true,
            congestion: true,
            arthritis: true,
            orthostatic: true,
            skin: true,
          },
        }),

      disableAllNewFlows: () =>
        set({ useNewFlow: { ...DEFAULT_FLAGS } }),

      reset: () => set({ useNewFlow: { ...DEFAULT_FLAGS } }),
    }),
    {
      name: "cadence-feature-flags",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

/**
 * Hook to check if a specific tracker should use the new flow.
 * Usage: const useNew = useTrackerFeatureFlag('migraine');
 */
export function useTrackerFeatureFlag(tracker: TrackerName): boolean {
  return useFeatureFlagsStore((state) => state.useNewFlow[tracker]);
}
