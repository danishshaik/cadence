# Cadence Agent - React Native Client Overview

## What is Cadence?

**Cadence** is a proactive, patient-facing health assistant that helps people understand, track, and learn from their symptoms with minimal friction. It is explicitly **not** a diagnostic or treatment system—it's an understanding-first, tracking-focused assistant.

### Core Capabilities

1. **Conversational Intake** — Understand symptoms through natural conversation
2. **Custom Check-ins** — AI-generated tracking interfaces tailored to each symptom
3. **Smart Nudges** — Proactive reminders at appropriate times
4. **Pattern Insights** — Surface lightweight observations after enough data is collected

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     REACT NATIVE CLIENT                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Chat Interface + Check-in Widgets + Push Notifications   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FASTIFY BACKEND                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     ORCHESTRATOR                          │  │
│  │         (State machine coordinating all agents)           │  │
│  └─────────────┬─────────────┬─────────────┬────────────────┘  │
│                │             │             │                    │
│       ┌────────▼───┐  ┌──────▼─────┐  ┌───▼────────┐          │
│       │  Intake    │  │  Check-in  │  │  Insight   │          │
│       │  Agent     │  │  Designer  │  │  Agent     │          │
│       └────────────┘  └──────┬─────┘  └────────────┘          │
│                              │                                  │
│                       ┌──────▼─────┐                           │
│                       │ Scheduler  │                           │
│                       │   Agent    │                           │
│                       └────────────┘                           │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL (Neon)  │  Nudge Worker  │  Expo Push Server  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Backend Agents (What They Do)

Understanding the agents helps you know what data to expect from the API.

### 1. Intake Agent
**Purpose**: Understands the user's symptom through conversation.

- Extracts symptom summary, category, and trackable dimensions
- May ask 1-2 clarifying questions before proceeding
- Determines when enough info is gathered to design a check-in

**Output you'll receive**:
- `response_message` — Agent's conversational reply
- `clarificationQuestions` — Optional follow-up questions with answer types
- `ready_for_tracking` — Boolean indicating if intake is complete

### 2. Check-in Designer Agent
**Purpose**: Generates a custom check-in screen schema based on the symptom.

- Creates a `CheckinScreen` object with sections and components
- Selects appropriate UI components (severity scales, body maps, etc.)
- Limits to 1-5 sections, 1-4 components per section
- Targets ~30 second completion time

**Output you'll receive**:
- `checkinScreen` — Full JSON schema the client renders as a widget

### 3. Scheduler Agent
**Purpose**: Creates a nudge schedule for the symptom.

- Determines frequency: `once_daily`, `twice_daily`, `every_other_day`
- Sets preferred times based on symptom patterns
- Includes suppression rules (pause after ignored, skip if logged today)

**Output you'll receive**:
- `nudgePlan` — Schedule details including times and frequency

### 4. Insight Agent
**Purpose**: Analyzes check-in history to surface patterns.

- Runs after 5+ check-ins are logged
- Generates up to 3 insights with confidence levels
- Observations are descriptive, not diagnostic

**Output you'll receive**:
- `insights` — Array of `{ title, observation, confidence }` objects

---

## Session Phases

The orchestrator moves through phases. The frontend should track which phase it's in:

| Phase | Description | What Client Shows |
|-------|-------------|-------------------|
| `intake` | Gathering symptom info | Chat messages, possibly clarification questions |
| `clarifying` | Waiting for answers to follow-up questions | Chat + quick reply options |
| `tracking` | Active tracking period | Check-in widgets when due |
| `insight_ready` | 5+ check-ins logged | Insights appear in chat |

**Note**: The `designing` and `scheduling` steps happen internally on the backend during the transition from `clarifying` to `tracking`. The client may see a brief loading state during this transition.

---

## API Endpoints

The client interacts with these endpoints:

### `POST /api/message`
Send a user message to start or continue a conversation.

**Request**:
```typescript
{
  threadId?: string;    // Omit for new conversation
  message: string;      // User's text input
}
```

**Response**:
```typescript
{
  threadId: string;
  phase: SessionPhase;
  messages: Array<{ role: 'assistant'; content: string }>;
  clarificationQuestions?: Array<{
    id: string;
    question: string;
    answerType: 'free_text' | 'yes_no' | 'single_select';
    options?: string[];
  }>;
  checkinScreen?: CheckinScreen;   // When ready for tracking
  nudgePlan?: NudgePlan;           // Schedule details
}
```

### `POST /api/checkin`
Submit a completed check-in.

**Request**:
```typescript
{
  threadId: string;
  answers: Record<string, any>;  // Component ID → value
}
```

**Response**:
```typescript
{
  ack: true;
  message: string;           // "Logged! 3 days so far."
  checkinCount: number;
  insightsReady?: boolean;
  insights?: Array<{
    title: string;
    observation: string;
    confidence: 'low' | 'medium' | 'high';
  }>;
}
```

### `GET /api/thread`
List all threads for the current user.

**Response**:
```typescript
{
  threads: Array<{
    id: string;
    symptomSummary: string | null;
    phase: SessionPhase;
    status: 'active' | 'paused' | 'completed';
    lastCheckinAt: string | null;
    createdAt: string;
  }>;
}
```

### `GET /api/thread/:threadId`
Get full thread state including check-in history.

### `GET /api/thread/:threadId/insights`
Get insights for a specific thread (if ready).

---

## Check-in Screen Schema

The `CheckinScreen` is the JSON structure your widgets render. Understanding this is critical.

```typescript
interface CheckinScreen {
  screen_id: string;
  title: string;                    // "Headache Check-in"
  subtitle?: string;
  sections: CheckinSection[];       // 1-5 sections
  estimated_time_seconds: number;   // Usually ~30
  allow_skip: boolean;
  submit_label: string;             // "Log check-in"
  tracks_dimensions: string[];      // ["severity", "location", "triggers"]
}

interface CheckinSection {
  id: string;
  title?: string;                   // "Pain Details"
  description?: string;
  components: CheckinComponent[];   // 1-4 components
  show_if?: {                       // Conditional visibility
    component_id: string;
    condition: 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt';
    value: any;
  };
}
```

---

## Check-in Component Types

The backend generates these component types. The client must implement renderers for each:

### P0 — Basic (Must Have)

| Type | Description | Value Type |
|------|-------------|------------|
| `severity_scale` | Pain/intensity rating | `number` |
| `yes_no` | Simple toggle, optional "maybe" | `boolean \| 'maybe'` |
| `single_select` | Choose one option | `string` |
| `multi_select` | Choose multiple | `string[]` |
| `free_text` | Open text input | `string` |

### P1 — Extended

| Type | Description | Value Type |
|------|-------------|------------|
| `body_map` | Tap regions on body diagram | `string[]` (region IDs) |
| `pain_map` | Body map with intensity per region | `{ points: PainPoint[] }` |
| `time_selector` | When did it happen | `string` (time/relative) |
| `duration_input` | How long did it last | `number` (in specified unit) |
| `frequency_tracker` | How many times today/this week | `number \| string` |
| `trigger_checklist` | What might have caused it | `string[]` |
| `context_capture` | Activity, food, sleep context | `string \| string[]` |
| `timeline` | Mark events over time span | `object` |

### P2 — Advanced

| Type | Description |
|------|-------------|
| `intensity_heatmap` | Heat map overlay on body region |
| `anatomical_selector` | Specific body systems (joints, lymph nodes) |
| `photo_capture` | Document with camera |
| `visual_comparison` | Compare photos side-by-side |

**Example component from schema**:
```typescript
{
  type: 'severity_scale',
  id: 'pain_intensity',
  prompt: 'How would you rate your pain right now?',
  scale_type: 'numeric_1_10',  // or 'faces', 'traffic_light', etc.
  min_label: 'No pain',
  max_label: 'Worst imaginable',
  show_previous: true
}
```

---

## Authentication

For MVP, auth uses a simple header:

```
X-User-Id: <user-uuid>
```

If omitted, the backend creates an anonymous user **but does not return the ID**, so you will create a new user on every request. The client must generate and persist a UUID on first launch and include it on every API call. In production, this will be replaced with proper JWT/session auth.

---

## Push Notifications

The backend sends nudges via **Expo Push Notifications**. The client should:

1. Register for push notifications on app launch
2. Send the Expo push token to the backend (endpoint TBD)
3. Handle notification taps to open the relevant thread
4. Display the check-in widget when opened from a nudge

Nudge payload structure:
```typescript
{
  threadId: string;
  title: string;        // "Time to check in"
  body: string;         // "How's your headache today?"
}
```

---

## Design Vision

The Cadence mobile client is a **ChatGPT-style conversational interface** where symptom tracking happens through interactive widgets embedded in the chat. The focus is simplicity: one screen, one conversation, minimal UI chrome.

### Visual Inspiration

Drawing from modern health apps like Whoop & Bevel combined with ChatGPT's conversational simplicity:

- **Clean white canvas** — Minimal visual noise
- **Generous whitespace** — Breathing room, content floats in space
- **Rounded cards** — Large border radius (16-24px) on widgets
- **Subtle shadows** — Soft elevation without harsh drop shadows
- **Clean typography** — SF Pro or Inter, with clear hierarchy
- **Accent colors for data** — Blue for primary, green for positive states

---

## Core Interface: Chat + Widgets

The entire app is a single chat screen with a left drawer for thread history.

```
┌─────────────────────────────────────┐
│  ☰                    Cadence   👤  │  Header (hamburger opens drawer)
├─────────────────────────────────────┤
│                                     │
│                                     │
│         (scrollable chat area)      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Agent                       │   │  ← Agent message
│  │  "Good morning! Time for     │   │
│  │   your headache check-in."   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Headache Check-in          │   │  ← Active widget
│  │                             │   │     (half-screen max)
│  │  How's your headache?       │   │
│  │  ┌─────────────────────┐   │   │
│  │  │ 1 2 3 4 ⑤ 6 7 8 9 10│   │   │
│  │  │ None          Severe│   │   │
│  │  └─────────────────────┘   │   │
│  │                             │   │
│  │  Any triggers?              │   │
│  │  ┌────┐ ┌────┐ ┌────────┐  │   │
│  │  │Stress│ │Sleep│ │Weather│  │   │
│  │  └────┘ └────┘ └────────┘  │   │
│  │                             │   │
│  │  ┌───────────────────────┐ │   │
│  │  │      Log Check-in     │ │   │
│  │  └───────────────────────┘ │   │
│  └─────────────────────────────┘   │
│                                     │
│                                     │
│         (whitespace)                │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  ┌───────────────────────────┐  ↑  │  Text input
│  │ Message Cadence...        │  │  │
│  └───────────────────────────┘     │
└─────────────────────────────────────┘
```

### Left Drawer (Thread History)

```
┌──────────────────┬──────────────────────┐
│                  │                      │
│  ✕  Threads      │                      │
│                  │                      │
│  ┌────────────┐  │                      │
│  │ Today      │  │                      │
│  │ Migraine   │  │      (main chat)     │
│  │ tracking   │  │                      │
│  └────────────┘  │                      │
│                  │                      │
│  ┌────────────┐  │                      │
│  │ Jan 15     │  │                      │
│  │ New symptom│  │                      │
│  │ intake     │  │                      │
│  └────────────┘  │                      │
│                  │                      │
│  ┌────────────┐  │                      │
│  │ Jan 10     │  │                      │
│  │ Back pain  │  │                      │
│  │ check-ins  │  │                      │
│  └────────────┘  │                      │
│                  │                      │
│  ───────────     │                      │
│                  │                      │
│  ＋ New Thread   │                      │
│                  │                      │
└──────────────────┴──────────────────────┘
```

---

## Widget Behavior

### Only 1-2 Widgets Visible

- **At most one active widget** at the bottom of the chat
- **One completed widget** may be visible above if just submitted
- Older content scrolls up and out of view (like chat messages)

### Widget Lifecycle

1. **Agent sends message** → "Time for your check-in"
2. **Widget appears** below the message
3. **User interacts** with form components
4. **User submits** → Widget collapses to summary
5. **Summary scrolls up** → Next message/widget appears (or whitespace)

### After Submission

```
┌─────────────────────────────────┐
│  Agent                          │
│  "Time for your check-in."      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  ✓ Headache Check-in • 2:30 PM  │  ← Collapsed summary
│  Severity: 5/10 • Triggers: 2   │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Agent                          │
│  "Got it. I noticed your        │
│   headaches are often worse     │
│   after poor sleep. Rest up!"   │
└─────────────────────────────────┘

        (whitespace)

┌───────────────────────────────┐
│ Message Cadence...            │
└───────────────────────────────┘
```

---

## Layout Architecture

```
App
├── Drawer (left side)
│   └── ThreadList.tsx           # List of saved threads
│
├── ChatScreen (main content)
│   ├── Header.tsx               # Hamburger + title + avatar
│   ├── MessageList.tsx          # Scrollable chat area
│   │   ├── AgentMessage.tsx     # Text bubbles from agent
│   │   ├── UserMessage.tsx      # Text bubbles from user
│   │   ├── CheckinWidget.tsx    # Active check-in form
│   │   └── CheckinSummary.tsx   # Collapsed completed check-in
│   └── TextInput.tsx            # Bottom input bar
│
├── CheckinComponents/
│   ├── SeverityScale.tsx
│   ├── YesNo.tsx
│   ├── SingleSelect.tsx
│   ├── MultiSelect.tsx
│   ├── FreeText.tsx
│   ├── BodyMap.tsx
│   └── TimeSelector.tsx
│
└── Shared/
    ├── Card.tsx
    ├── Button.tsx
    └── Chip.tsx
```

---

## Interaction Flow

### Receiving a Check-in

1. Push notification arrives (or scheduled time)
2. App opens to chat screen
3. Agent message appears: "Time for your afternoon check-in"
4. Widget slides in below the message
5. User completes and submits
6. Widget collapses → Agent responds with insight/confirmation

### Free-form Chat

User can type in the text input at any time:
- "I'm having a headache right now"
- "What patterns have you noticed?"
- "Skip today's check-in"

Agent responds with text and/or a widget as appropriate.

### Animation Choreography

```
[Check-in Submitted]
    ↓
[Widget collapses: full height → 60px summary] (250ms ease-out)
    ↓
[Agent typing indicator appears] (200ms)
    ↓
[Agent message slides in] (300ms spring)
    ↓
[If another widget needed, it slides in] (300ms)
```

---

## Design Tokens

### Colors

```typescript
const colors = {
  // Backgrounds
  background: '#FFFFFF',          // Pure white canvas
  surface: '#FFFFFF',             // Cards (same, shadows differentiate)
  surfaceSecondary: '#F9FAFB',    // Subtle gray for input bar bg
  
  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  
  // Accents
  primary: '#3B82F6',             // Blue - primary actions
  primaryLight: '#EFF6FF',        // Blue tint for selections
  success: '#10B981',             // Green - positive states
  warning: '#F59E0B',             // Amber - alerts
  error: '#EF4444',               // Red - errors
  
  // Severity gradient
  severityLow: '#4ADE80',
  severityMid: '#FBBF24',
  severityHigh: '#F87171',
  
  // Borders
  border: '#E5E7EB',
  borderFocused: '#3B82F6',
  
  // Drawer
  drawerBackground: '#F9FAFB',
  drawerOverlay: 'rgba(0,0,0,0.3)',
};
```

### Spacing

```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

### Typography

```typescript
const typography = {
  h1: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  h3: { fontSize: 17, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodyMedium: { fontSize: 16, fontWeight: '500', lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  label: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
};
```

### Shadows

```typescript
const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  widget: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
};
```

### Border Radius

```typescript
const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};
```

---

## Key Principles

### 1. **One Thing at a Time**
Only one active widget visible. User focus is never split.

### 2. **Half-Screen Maximum**
No widget exceeds 50% of screen height. If content is longer, widget scrolls internally.

### 3. **Chat is Primary**
Everything lives in the chat. Widgets are just rich messages.

### 4. **Minimal Chrome**
No tabs, no bottom nav. Just the drawer for threads and the input bar.

### 5. **Instant Feedback**
Every tap responds immediately. No loading states longer than 200ms without indicator.

### 6. **Conversational**
Agent messages feel human. Widgets feel like structured replies to questions.

---

## Message Types in Chat

| Type | Description |
|------|-------------|
| `agent_text` | Plain text from the agent |
| `user_text` | Plain text from the user |
| `checkin_widget` | Active check-in form (interactive) |
| `checkin_summary` | Completed check-in (collapsed) |
| `insight` | Agent-generated insight card |
| `quick_reply` | Tappable response options |

---

## Technology Stack

- **Framework**: React Native (Expo managed workflow)
- **Navigation**: Expo Router + Drawer
- **Styling**: NativeWind (Tailwind for RN) or StyleSheet
- **State**: Zustand
- **Animations**: React Native Reanimated 3
- **Gestures**: React Native Gesture Handler
- **Data Fetching**: TanStack Query
- **Push Notifications**: Expo Notifications

---

## Implementation Tasks

The following task files detail each step of the React Native client implementation:

| Task | File | Description |
|------|------|-------------|
| 01 | [01-project-setup.md](./01-project-setup.md) | Initialize Expo project, configure TypeScript, install dependencies |
| 02 | [02-design-system.md](./02-design-system.md) | Build core UI components (Card, Button, Chip, TextInput, etc.) |
| 03 | [03-chat-screen.md](./03-chat-screen.md) | Main chat interface with message list and input |
| 04 | [04-checkin-widgets.md](./04-checkin-widgets.md) | Check-in form components (P0 basic components) |
| 05 | [05-drawer.md](./05-drawer.md) | Thread list drawer and navigation |
| 06 | [06-api-integration.md](./06-api-integration.md) | Connect to Cadence backend with React Query |
| 07 | [07-notifications.md](./07-notifications.md) | Push notification handling for nudges |
| 08 | [08-animations.md](./08-animations.md) | Polish transitions and micro-interactions |

### Build Order

Execute the tasks in order. Each builds on the previous:

```
01 Project Setup → 02 Design System → 03 Chat Screen → 04 Check-in Widgets
                                                              ↓
08 Animations ← 07 Notifications ← 06 API Integration ← 05 Drawer
```

### Future Tasks (P1/P2 Components)

After completing the core MVP, additional tasks for extended components:

- **Body Maps** - Interactive body region selection
- **Pain Maps** - Body maps with intensity per region
- **Time & Context** - TimeSelector, DurationInput, TriggerChecklist
- **Anatomical Selectors** - Joints, lymph nodes, muscles
- **Insights View** - Charts and pattern visualization
- **Photo Capture** - Camera integration for visual symptoms
