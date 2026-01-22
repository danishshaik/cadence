export type SessionPhase =
  | "intake"
  | "clarifying"
  | "tracking"
  | "insight_ready"
  | "designing"
  | "scheduling";

export interface Thread {
  id: string;
  symptomSummary: string | null;
  symptomCategory?: string | null;
  phase: SessionPhase;
  status: "active" | "paused" | "completed";
  lastCheckinAt: string | null;
  createdAt: string;
}

export interface ThreadDetail {
  threadId: string;
  symptomSummary: string | null;
  symptomCategory: string | null;
  phase: SessionPhase;
  status: "active" | "paused" | "completed";
  checkinScreen: CheckinScreen | null;
  nudgePlan: NudgePlanResponse | null;
  checkins: Checkin[];
  insights: InsightResult | null;
  createdAt: string;
}

export interface MessageRequest {
  threadId?: string;
  message: string;
}

export interface MessageResponse {
  threadId: string;
  phase: SessionPhase;
  messages: Array<{
    role: "assistant";
    content: string;
  }>;
  clarificationQuestions?: ClarificationQuestion[];
  checkinScreen?: CheckinScreen;
  nudgePlan?: NudgePlan;
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  answerType: "free_text" | "yes_no" | "single_select";
  options?: string[];
}

export interface CheckinRequest {
  threadId: string;
  answers: Record<string, unknown>;
}

export interface CheckinResponse {
  ack: true;
  message: string;
  checkinCount: number;
  insightsReady?: boolean;
  insights?: Insight[];
}

export interface Checkin {
  id: string;
  answers: Record<string, unknown>;
  loggedAt: string;
}

export interface CheckinScreen {
  screen_id: string;
  title: string;
  subtitle?: string;
  sections: CheckinSection[];
  estimated_time_seconds: number;
  allow_skip: boolean;
  submit_label: string;
  tracks_dimensions: string[];
}

export interface CheckinSection {
  id: string;
  title?: string;
  description?: string;
  components: CheckinComponent[];
  show_if?: {
    component_id: string;
    condition: "equals" | "not_equals" | "contains" | "gt" | "lt";
    value: unknown;
  };
}

export interface CheckinComponent {
  type: string;
  id: string;
  prompt: string;
  [key: string]: unknown;
}

export type NudgeFrequency = "once_daily" | "twice_daily" | "every_other_day";

export interface NudgePlan {
  frequency: NudgeFrequency;
  preferredTimes: string[];
  rationale: string;
}

export interface StoredNudgePlan {
  frequency: NudgeFrequency;
  preferred_times: string[];
  time_window_minutes: number;
  suppression_rules?: {
    pause_after_ignored: number;
    skip_if_logged_today: boolean;
    max_thread_age_days: number;
  };
  rationale: string;
}

export type NudgePlanResponse = NudgePlan | StoredNudgePlan;

export interface Insight {
  title: string;
  observation: string;
  confidence: "low" | "medium" | "high";
}

export interface InsightResult {
  insights: Insight[];
  suggestion: string | null;
  generatedAt: string;
}

export interface InsightsResponse {
  ready: boolean;
  insights?: Insight[];
  suggestion?: string | null;
  message?: string;
  checkinCount?: number;
  checkinsNeeded?: number;
}

export interface APIError {
  error: string;
  code: string;
  details?: Array<{ path: string; message: string }>;
}
