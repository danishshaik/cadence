import type { CheckinScreen } from "@/types/api";

export type MessageRole = "user" | "assistant";

export interface BaseMessage {
  id: string;
  timestamp: string;
}

export interface TextMessage extends BaseMessage {
  type: "text";
  role: MessageRole;
  content: string;
}

export interface CheckinWidgetMessage extends BaseMessage {
  type: "checkin_widget";
  role: "assistant";
  screen: CheckinScreen;
  status: "active" | "completed" | "skipped";
  answers?: Record<string, unknown>;
}

export interface CheckinSummaryMessage extends BaseMessage {
  type: "checkin_summary";
  role: "assistant";
  summary: string;
  submittedAt: string;
}

export interface InsightMessage extends BaseMessage {
  type: "insight";
  role: "assistant";
  insights: {
    title: string;
    observation: string;
    confidence: "low" | "medium" | "high";
  }[];
}

export interface QuickReplyMessage extends BaseMessage {
  type: "quick_reply";
  role: "assistant";
  content: string;
  answerType: "yes_no" | "single_select";
  options: {
    id: string;
    label: string;
  }[];
}

export type ChatMessage =
  | TextMessage
  | CheckinWidgetMessage
  | CheckinSummaryMessage
  | InsightMessage
  | QuickReplyMessage;
