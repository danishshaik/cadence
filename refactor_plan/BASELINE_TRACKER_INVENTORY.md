# Baseline Tracker Inventory

This document captures the current tracker flows actively routed in the app.
Generated as part of Step 0: Baseline + Safety Nets.

## Active Tracker Summary

| Tracker | Steps | Route | Flow Component | Config | Store |
|---------|-------|-------|----------------|--------|-------|
| Migraine | 5 | `/log-migraine` | `log-migraine-flow-refactor.tsx` | `migraine-flow-config.ts` | `migraine-store.ts` |
| Mood | 4 | `/log-mood` | `log-mood-flow.tsx` | `mood-flow-config.ts` | `mood-store.ts` |
| Congestion | 5 | `/log-congestion` | `log-congestion-flow.tsx` | `congestion-flow-config.ts` | `congestion-store.ts` |
| Arthritis | 5 | `/log-arthritis` | `log-arthritis-flow.tsx` | `arthritis-flow-config.ts` | `arthritis-store.ts` |
| Orthostatic | 5 | `/log-orthostatic` | `log-orthostatic-flow-refactor.tsx` | `orthostatic-flow-config.ts` | `orthostatic-store.ts` |
| Skin | 5 | `/log-skin` | `log-skin-flow.tsx` | `skin-flow-config.ts` | `skin-store.ts` |

## Current Architecture Baseline

- All active trackers use `TrackerFlowProvider` + `TrackerFlowRenderer` with tracker-specific configs.
- Shared scaffold primitives come from `src/components/tracking/` (`FlowScaffold`, `FlowFooter`, `StepLayout`, `useNativeFlowHeader`, field primitives, and registries).
- The new architecture is the default path for all active trackers (no legacy/new runtime switching).

## Scope Notes

- GI and Respiratory trackers are not present in the current app route surface and are not part of the active migration scope.

## QA Checklist

For each active tracker, verify:
- [ ] Flow opens from correct route
- [ ] All steps render correctly
- [ ] Back navigation works
- [ ] Progress indicator updates correctly
- [ ] Form data persists between steps
- [ ] Save creates correct payload shape
- [ ] Cancel/close returns to previous screen
