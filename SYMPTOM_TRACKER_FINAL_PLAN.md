# Symptom Tracker Consolidation — Final Plan

## Overview
This plan consolidates the best ideas from the drafts into a cohesive, executable approach. It is scaffold-first but de-risks early by validating a field contract and adapter layer before broad migration. The component set remains bounded but realistic, and the JSON system is designed to handle real-world logic without schema bloat.

## Phase 0: Decisions + Guardrails
- Create a dedicated refactor branch before changes.
- Agree on a single tracker scaffold pattern as the baseline.
- Lock a bounded field taxonomy (expanded to reflect real state shapes):
- SelectionField (multi-select chips/pills/grid)
- ChoiceField (single-select cards/buttons)
- ToggleField (yes/no, segmented)
- LinearScaleField (slider-based)
- RadialScaleField (dial/circular)
- XYScaleField (only if required by real use cases)
- BodyMapField (SVG region selection)
- DateTimeField (date/time/duration)
- CounterField (increment/decrement)
- TextField (short/long)
- PhotoField (camera/gallery)
- Enforce “variants, not new types” for visuals with the same state shape.
- Accessibility standards:
- Minimum hit targets
- Screen reader labels
- Focus order and keyboard navigation
- Alternative input paths for complex visuals

## Phase 0.5: Field Contract + Adapter Layer (Risk Reduction)
Define a generic field interface used by all primitives:
```
interface FieldProps<T> {
  value: T;
  onChange: (value: T) => void;
  validation?: ValidationRule<T>;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  variant?: string;
  visualization?: string;
  label: string;
  description?: string;
  accessibilityLabel?: string;
}
```

Create a `TrackerFlowProvider` and adapter layer that:
- Wraps existing per-flow Context APIs.
- Normalizes `formData`, `currentStep`, navigation, and validation.
- Allows old and new steps to coexist during migration.

Pilot this phase by:
- Building one primitive (SelectionField).
- Migrating one step inside one flow.
- Verifying parity before scaling.

## Phase 1: Shared Flow Scaffold (Highest Leverage)
Create `src/components/tracking/` and implement:
- `FlowScaffold`
- Handles safe-area insets, background, shared padding, header/content/footer slots.
- Accepts a `ThemeConfig` or `colorKey` for per-tracker branding.
- `FlowHeader`
- Unified back/cancel with consistent layout.
- `ProgressIndicator`
- `variant="bar" | "dots"` under one API.
- `FlowFooter`
- Standard primary/secondary actions and bottom insets.
- `StepLayout`
- Consistent title/subtitle spacing and content placement.

Migrate flows to the scaffold without changing step internals.
Recommended order:
- Arthritis
- Respiratory
- Orthostatic
- Congestion
- Migraine
- GI
- Mood
- Skin

Definition of done for this phase:
- All flows render inside the shared scaffold.
- Both progress styles are supported without per-flow duplication.
- Step behavior is unchanged.

## Phase 2: Core Field Primitives (Bounded, Realistic Set)
Create `src/components/tracking/fields/` for the taxonomy above.

Implementation notes:
- SelectionField: multi-select, grid/wrap/chips.
- ChoiceField: single-select cards/buttons.
- LinearScaleField: discrete and continuous values.
- RadialScaleField: dial inputs with zones.
- BodyMapField: map-specific hit testing with fallback UI.
- DateTimeField: include duration input explicitly.
- PhotoField: permission-aware capture + gallery.

Map older patterns as variants, not new types:
- MultiSelectGrid, HorizontalPills, BubbleSelector → SelectionField variants
- SelectionCards → ChoiceField variants
- SeveritySlider → LinearScaleField variants
- XYPad → XYScaleField (only if it exists)

## Phase 3: Registries for Visuals, Maps, Actions, Validation
Create:
- `VisualizationRegistry`
- Maps keys to components with a defined contract:
```
interface VisualizationDefinition {
  component: React.ComponentType<{ value: unknown; onChange?: (v: unknown) => void }>;
  type: "decorative" | "feedback" | "interactive";
}
```
- `BodyMapRegistry`
- Defines per-map SVG assets, region data, hit-testing behavior.
- `ActionRegistry`
- Maps an `onSave` string (e.g., `ARTHRITIS_SAVE`) to a store function.
- `ValidationRegistry`
- Maps a validation key to custom rules beyond required checks.

Move existing SVG assets and custom animations into registries so fields stay generic.

## Phase 4: Primitive Migration
Pilot with a tracker that has broad coverage (Migraine recommended):
- Replace step internals with primitives and variants.
- Keep flow logic intact.
- Validate parity with existing visuals and behavior.

Then migrate remaining trackers in batches.

## Phase 5: JSON Schema + Renderer
Define a deliberately small schema that still supports real flow logic:
- Flow config: theme, progress variant, actions, steps
- Step config: title, subtitle, layout hints, fields
- Field config: type, key, label, config, visualization key

Support inter-field logic and conditional branching:
- Field effects: a change in one field can update constraints or behavior of another.
- Conditional steps: show/skip steps based on field values.
- Computed fields: derived values for labels, zones, or summaries.
- Validation: allow warnings vs errors.

Implement `TrackerFlowRenderer` that resolves:
- `field.type` → core primitive
- `field.variant` or `visualization` → registry entry
- `onSave` → `ActionRegistry`
- `validation` → `ValidationRegistry`

Start with one JSON-defined tracker and expand.

## Phase 6: Cleanup
- Remove deprecated per-tracker log-flow components.
- Remove unused providers and duplicate utilities.
- Delete dead assets or legacy visuals after parity is confirmed.

## Rollback + Risk Controls
- Feature flag per tracker to switch old vs new implementation.
- Validate parity before removing old steps.
- Avoid half-migrations by completing a full flow before moving to the next.

## Success Criteria
- All flows use the shared scaffold.
- Field types are limited, typed, and reusable across trackers.
- Visuals and maps are registry-driven.
- Unified flow state is in place across trackers.
- At least one tracker is fully JSON-defined and rendered.
- Accessibility: VoiceOver/TalkBack coverage on primitives.
- Performance: no >10% regression in time-to-interactive.
