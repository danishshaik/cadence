# Baseline Tracker Inventory

This document captures the current state of all tracker flows for reference during the refactor.
Generated as part of Step 0: Baseline + Safety Nets.

## Tracker Summary

| Tracker | Steps | Route | Provider | Store |
|---------|-------|-------|----------|-------|
| Migraine | 5 | `/log-migraine` | `log-migraine-provider.tsx` | `migraine-store.ts` |
| Mood | 4 | `/log-mood` | `log-mood-provider.tsx` | `mood-store.ts` |
| GI | 6 | `/log-gi` | `log-gi-provider.tsx` | `gi-store.ts` |
| Respiratory | 5+ | `/log-respiratory` | `log-respiratory-provider.tsx` | `respiratory-store.ts` |
| Congestion | 5 | `/log-congestion` | `log-congestion-provider.tsx` | `congestion-store.ts` |
| Arthritis | 5 | `/log-arthritis` | `log-arthritis-provider.tsx` | `arthritis-store.ts` |
| Orthostatic | 5 | `/log-orthostatic` | `log-orthostatic-provider.tsx` | `orthostatic-store.ts` |
| Skin | 5 | `/log-skin` | `log-skin-provider.tsx` | `skin-store.ts` |

---

## Migraine Flow

**Location:** `src/components/migraine/log-flow/`

### Steps
1. **Severity Step** (`severity-step.tsx`) - Pain intensity slider (0-10)
2. **Location Step** (`location-step.tsx`) - Pain location on head diagram
3. **Triggers Step** (`triggers-step.tsx`) - Trigger identification
4. **When Step** (`when-step.tsx`) - Time of day + rough duration selection
5. **Medication Step** (`medication-step.tsx`) - Medication tracking

### Form Data Shape
```typescript
{
  severity: number;          // 0-10
  severityLabel: string;     // Auto-computed ("mild" | "moderate" | "severe")
  startedAt: Date;           // Timestamp for selected time of day
  timeOfDay: string;         // 'morning' | 'afternoon' | 'evening' | 'night'
  isOngoing: boolean;        // True when duration is "Ongoing"
  durationMinutes: number | null; // Duration preset in minutes
  painLocations: string[];   // Pain locations
  triggers: string[];        // Selected triggers
  medicationTaken: boolean;  // Derived from meds selection
  medications: { name: string; takenAt: string }[]; // Medications taken
  medicationNoneSelected: boolean; // UI-only toggle
  notes: string | null;      // Currently not collected in the 5-step flow
}
```

### Shared Components
- `progress-bar.tsx`
- `step-header.tsx`

---

## Mood Flow

**Location:** `src/components/mood/log-flow/`

### Steps
1. **Core State Step** (`core-state-step.tsx`) - XY pad for energy/positivity
2. **Emotions Step** (`emotions-step.tsx`) - Granular emotion selection
3. **Triggers Step** (`triggers-step.tsx`) - Mood triggers
4. **Self-Care Step** (`selfcare-step.tsx`) - Self-care actions taken

### Form Data Shape
```typescript
{
  energy: number;            // -1 to 1 (Y axis)
  positivity: number;        // -1 to 1 (X axis)
  dominantMood: string;      // derived label
  emotions: string[];        // Selected emotions
  somaticSymptoms: string[]; // Selected somatic symptoms
  triggers: string[];        // Selected triggers
  selfCare: string[];        // Self-care activities
  loggedAt: Date;
}
```

### Shared Components
- `progress-bar.tsx`
- `step-header.tsx`

---

## GI Flow

**Location:** `src/components/gi/log-flow/`

### Steps
1. **Timing Step** (`timing-step.tsx`) - When it occurred
2. **Severity Step** (`severity-step.tsx`) - Severity slider
3. **Location Step** (`location-step.tsx`) - Pain location
4. **Symptoms Step** (`symptoms-step.tsx`) - Symptom selection
5. **Bristol Step** (`bristol-step.tsx`) - Bristol stool scale
6. **Triggers Step** (`triggers-step.tsx`) - Triggers

### Form Data Shape
```typescript
{
  timing: string;            // Time selection
  severity: number;          // 0-10
  severityLabel: string;     // Auto-computed
  location: string;          // Pain location
  symptoms: string[];        // Selected symptoms
  bristolType: number;       // 1-7 Bristol scale
  triggers: string[];        // Selected triggers
  loggedAt: Date;
}
```

### Shared Components
- `progress-bar.tsx`
- `step-header.tsx`

---

## Respiratory Flow

**Location:** `src/components/respiratory/log-flow/`

### Steps
1. **Breathing Step** (`breathing-step.tsx`) - Chest constriction level
2. **Symptoms Step** (`symptoms-step.tsx`) - Respiratory symptoms
3. **Sound Step** (`sound-step.tsx`) - Breathing sounds
4. **Triggers Step** (`triggers-step.tsx`) - Triggers
5. **Inhaler Step** (`inhaler-step.tsx`) - Inhaler use
6. **Peak Flow Step** (`peak-flow-step.tsx`) - Peak flow measurement

### Form Data Shape
```typescript
{
  constriction: number;      // Breathing constriction level
  constrictionLabel: string; // Auto-computed
  symptoms: string[];        // Respiratory symptoms
  sounds: string[];          // Breathing sounds
  triggers: string[];        // Selected triggers
  inhalerUsed: boolean;
  peakFlow: number | null;   // Peak flow measurement
  loggedAt: Date;
}
```

### Shared Components
- `progress-bar.tsx`
- `step-header.tsx`

---

## Congestion Flow

**Location:** `src/components/congestion/log-flow/`

### Steps
1. **Sleep Step** (`sleep-step.tsx`) - Sleep quality during illness
2. **Cough Character Step** (`cough-character-step.tsx`) - Type of cough
3. **Source Step** (`source-step.tsx`) - Cough source location
4. **Production Step** (`production-step.tsx`) - Phlegm characteristics
5. **Relief Step** (`relief-step.tsx`) - Relief measures used

### Form Data Shape
```typescript
{
  sleepQuality: string;      // Sleep quality rating
  coughCharacter: string;    // Dry/wet/etc.
  source: string;            // Chest/throat/etc.
  production: string;        // Phlegm description
  reliefMeasures: string[];  // What helped
  loggedAt: Date;
}
```

### Shared Components
- `progress-bar.tsx`
- `step-header.tsx`

**Note:** Uses custom header via `useLayoutEffect` + navigation options.

---

## Arthritis Flow

**Location:** `src/components/arthritis/log-flow/`

### Steps
1. **Sensation Step** (`sensation-step.tsx`) - Stiffness level
2. **Location Step** (`location-step.tsx`) - Affected joints
3. **Context Step** (`context-step.tsx`) - Weather context
4. **Activity Step** (`activity-step.tsx`) - Activity correlation
5. **Management Step** (`management-step.tsx`) - Management methods

### Form Data Shape
```typescript
{
  stiffness: number;         // Stiffness severity
  stiffnessLabel: string;    // Auto-computed
  joints: string[];          // Affected joints
  weather: string;           // Weather conditions
  activity: string;          // Activity level/type
  management: string[];      // Management methods used
  loggedAt: Date;
}
```

### Shared Components
**Note:** Uses custom header dots indicator instead of progress bar.

---

## Orthostatic Flow

**Location:** `src/components/orthostatic/log-flow/`

### Steps
1. **Severity Step** (`severity-step.tsx`) - Symptom severity
2. **Duration Step** (`duration-step.tsx`) - Duration of symptoms
3. **Prodrome Step** (`prodrome-step.tsx`) - Pre-standing condition
4. **Hydration Step** (`hydration-step.tsx`) - Hydration assessment
5. **Trigger Step** (`trigger-step.tsx`) - Triggering factors

### Form Data Shape
```typescript
{
  severity: number;          // Symptom severity
  severityLabel: string;     // Auto-computed
  duration: string;          // How long symptoms lasted
  prodrome: string;          // Pre-standing state
  hydration: string;         // Hydration level
  triggers: string[];        // What triggered it
  loggedAt: Date;
}
```

### Shared Components
- `progress-bar.tsx`
- `step-header.tsx`

---

## Skin Flow

**Location:** `src/components/skin/log-flow/`

### Steps
1. **Photo Step** (`photo-step.tsx`) - Photo capture
2. **Breakout Type Step** (`breakout-type-step.tsx`) - Type of breakout
3. **Severity Step** (`severity-step.tsx`) - Severity assessment
4. **Routine Step** (`routine-step.tsx`) - Skincare routine
5. **Triggers Step** (`triggers-step.tsx`) - Skin triggers

### Form Data Shape
```typescript
{
  photoUri: string | null;   // Photo path
  breakoutType: string;      // Type of breakout
  severity: number;          // Severity level
  severityLabel: string;     // Auto-computed
  routine: string[];         // Skincare routine items
  triggers: string[];        // Suspected triggers
  loggedAt: Date;
}
```

### Shared Components
- `progress-bar.tsx`
- `step-header.tsx`

---

## Common Patterns Across Flows

### Provider Pattern
All flows use a context provider that manages:
- `formData` - The current form state
- `currentStep` - Current step number (1-indexed)
- `totalSteps` - Total number of steps
- `updateFormData(key, value)` - Update a form field
- `goToNextStep()` - Advance to next step
- `goToPreviousStep()` - Go back one step
- `canGoBack` - Whether back navigation is allowed
- `isLastStep` - Whether current step is the last

### Save Logic
- "Continue" on last step triggers save
- "Save" button available on steps 2+ for early exit
- Save calls `store.addLog(formData)` and `router.back()`

### Progress Indicators
- Most trackers: Horizontal progress bar (filled segments)
- Arthritis: Dot indicators

### Header Variations
- Most trackers: `StepHeader` component in content
- Congestion: Header set via `useLayoutEffect` on navigation options
- Arthritis: Custom dots in header area

---

## QA Checklist

For each tracker, verify:
- [ ] Flow opens from correct route
- [ ] All steps render correctly
- [ ] Back navigation works
- [ ] Progress indicator updates correctly
- [ ] Form data persists between steps
- [ ] Save creates correct payload shape
- [ ] Cancel/close returns to previous screen

---

## Feature Flags

Feature flags are stored in `src/stores/feature-flags-store.ts`.

Default state: All trackers use legacy flows (`useNewFlow: false`).

To enable new flow for a tracker:
```typescript
const { enableNewFlow } = useFeatureFlagsStore();
enableNewFlow('migraine');
```

To check if new flow is enabled:
```typescript
const useNew = useTrackerFeatureFlag('migraine');
```
