# Symptom Tracking Plan Refactor

This document breaks the refactor into commit-sized steps. Each step includes verifiable QA checks so you can commit after completion.

## Step 0: Baseline + Safety Nets
**Goal:** Capture current behavior and establish guardrails.

**Work**
- Identify all current tracker flows and their route/entry points.
- Capture screenshots or short recordings for each flow (1 full run per tracker).
- List all existing step components and where they live.
- Create a feature flag toggle to switch old/new per tracker (if not already present).

**QA (must be verifiable)**
- Run `npm run lint` with no new errors.
- Start dev server (`npm run start`), open each tracker flow, and confirm current behavior matches your recordings.
- Verify feature flag default keeps old flows active.

**Commit suggestion**
- `chore: baseline tracker behavior + flag`.

## Step 1: Field Contract + Adapter Layer
**Goal:** Define the shared field interface and a wrapper that normalizes flow state.

**Work**
- Add `FieldProps<T>` (or equivalent) in a shared location.
- Introduce `TrackerFlowProvider` + adapter that normalizes: `formData`, `currentStep`, `setStep`, validation, and `onSave`.
- Wire provider into one pilot flow without changing step UIs.

**QA (must be verifiable)**
- Run `npm run lint`.
- In the pilot flow, complete a run and verify the saved payload matches pre-refactor payload shape.
- Navigate back/forward steps and confirm `currentStep` stays correct.

**Commit suggestion**
- `feat: add field contract and flow adapter`.

## Step 2: Shared Flow Scaffold
**Goal:** Centralize layout, header, progress, footer, and step spacing.

**Work**
- Implement `FlowScaffold`, `FlowHeader`, `ProgressIndicator`, `FlowFooter`, `StepLayout`.
- Migrate flows to use scaffold without changing step internals.
- Support both progress variants (`bar`, `dots`) via one API.

**QA (must be verifiable)**
- Run `npm run lint`.
- For each migrated flow, verify:
  - Header/back/cancel works.
  - Progress indicator matches previous style.
  - Primary/secondary buttons behave the same.
  - Safe-area padding looks correct on iOS and Android simulators (or Expo Go).

**Commit suggestion**
- `feat: add shared tracking scaffold`.

## Step 3: Core Field Primitives (Pilot Set)
**Goal:** Introduce a bounded field taxonomy and implement 2-3 primitives.

**Work**
- Create `src/components/tracking/fields/`.
- Implement `SelectionField`, `ChoiceField`, `LinearScaleField` (pilot set).
- Ensure each field supports `value`, `onChange`, `error`, `disabled`, `required`, `variant`, `label`, `description`.

**QA (must be verifiable)**
- Run `npm run lint`.
- Add a simple dev-only screen or story route to render each new field in isolation.
- Verify each field supports keyboard focus and screen reader labels.

**Commit suggestion**
- `feat: add core field primitives (selection, choice, scale)`.

## Step 4: Visualization + Action + Validation Registries
**Goal:** Move specialized visuals/logic into registries so fields stay generic.

**Work**
- Add `VisualizationRegistry`, `ActionRegistry`, `ValidationRegistry`.
- Add at least one entry to each registry from existing flows.
- Update a pilot field to resolve its visualization via registry.

**QA (must be verifiable)**
- Run `npm run lint`.
- In pilot flow, confirm registry-driven visualization renders and behaves the same.
- Confirm `onSave` resolution matches previous store call.

**Commit suggestion**
- `feat: add tracking registries`.

## Step 5: Migrate One Full Tracker to Primitives
**Goal:** Replace step internals for a single tracker while keeping flow logic intact.

**Work**
- Choose a pilot tracker (Migraine recommended).
- Convert each step to use field primitives + variants.
- Keep flow navigation, validation, and save logic unchanged.

**QA (must be verifiable)**
- Run `npm run lint`.
- Complete a full run of the pilot tracker and confirm:
  - Answers are saved correctly.
  - Validation errors appear where expected.
  - Visual parity with baseline recordings.
- Compare payload shape with Step 0 snapshot.

**Commit suggestion**
- `feat: migrate migraine tracker steps to primitives`.

## Step 6: JSON Schema + Renderer (Single Tracker)
**Goal:** Define minimal JSON schema and render one tracker from config.

**Work**
- Define JSON config format for flow/steps/fields.
- Implement `TrackerFlowRenderer` to map config to primitives + registries.
- Convert pilot tracker to JSON config and render it.

**QA (must be verifiable)**
- Run `npm run lint`.
- Run the JSON-rendered tracker end-to-end and compare payload to pre-refactor payload.
- Verify conditional logic and validation are respected.

**Commit suggestion**
- `feat: add json flow renderer + pilot config`.

## Step 7: Migrate Remaining Trackers in Batches
**Goal:** Move the rest of the trackers to primitives and/or JSON configs.

**Work**
- Batch migrations in groups of 1-2 trackers per commit.
- Keep a feature flag to fall back to legacy per tracker until parity confirmed.

**QA (must be verifiable)**
- Run `npm run lint`.
- For each migrated tracker, complete a full run and compare outputs to baseline.
- Confirm feature flag toggles old/new correctly.

**Commit suggestion**
- `feat: migrate <tracker> to primitives`.

## Step 8: Cleanup + Dead Code Removal
**Goal:** Remove legacy components after parity is confirmed.

**Work**
- Delete legacy tracker components/providers once flags are removed.
- Remove unused assets and helpers.
- Update any docs to reflect new architecture.

**QA (must be verifiable)**
- Run `npm run lint`.
- Start app and confirm all trackers work end-to-end.
- Grep for legacy component names to confirm removal.

**Commit suggestion**
- `chore: remove legacy tracking code`.

## Step 9: Regression + Performance Pass
**Goal:** Validate performance, a11y, and UX regression checks.

**Work**
- Verify screen reader labels and navigation across all primitives.
- Check touch target sizes and focus order.
- Profile the heaviest tracker (time-to-interactive and scrolling smoothness).

**QA (must be verifiable)**
- Run `npm run lint`.
- Manual accessibility pass using VoiceOver/TalkBack.
- Compare key performance metrics to baseline (<10% regression).

**Commit suggestion**
- `chore: tracking regression pass`.

## Notes
- Use short commits; avoid mixing multiple trackers in a single commit.
- Keep feature flags until each tracker matches baseline behavior and payloads.
- Update this plan as the refactor progresses.

## Future Considerations (Post-MVP)

The JSON renderer is intended to support **server-driven flows**—trackers created dynamically by the server that don't ship with the app. Once the MVP is working, revisit:

- **Schema versioning:** Handle mismatches between server schema version and client capabilities. Consider `schemaVersion` and `minClientVersion` fields.
- **Runtime validation:** Add schema validation (e.g., zod/ajv) to gracefully handle malformed configs.
- **Fallback behavior:** Define what happens when the client encounters unknown field types (skip, placeholder, or block flow).
- **Action registry design:** Server can't send executable code. Define how `onSave` actions map to client-side handlers (predefined action types vs. registry lookup).
- **Conditional logic:** Keep show/hide and skip conditions simple and declarative. Avoid complex expression languages.
- **Caching & offline:** Strategy for fetching, caching, and invalidating remote flow configs.
- **Security:** Sanitize user-facing strings, validate all inputs before rendering.
