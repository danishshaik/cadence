import { useState, useCallback, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cadenceApi, ApiError } from "@services/api";
import { useThreadStore } from "@stores/thread-store";
import { threadKeys } from "./use-threads";
import type { MessageRequest, CheckinScreen, NudgePlan } from "@/types/api";
import type { ChatMessage } from "@components/chat/types";

interface UseMessagesReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (text: string) => Promise<void>;
  appendMessages: (next: ChatMessage | ChatMessage[]) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  checkinScreen: CheckinScreen | null;
  nudgePlan: NudgePlan | null;
}

const createWelcomeMessage = (): ChatMessage => ({
  id: "welcome",
  type: "text",
  role: "assistant",
  content:
    "Hi! I'm Cadence, your symptom tracking assistant. Tell me about what you've been experiencing.",
  timestamp: new Date().toISOString(),
});

const formatMutationError = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.status === 0) return "Network error";
    return `${error.message} (HTTP ${error.status})`;
  }

  if (error instanceof Error) return error.message;
  return "Unknown error";
};

export function useMessages(threadId: string | null): UseMessagesReturn {
  const queryClient = useQueryClient();
  const { addThread, updateThread, setActiveThread } = useThreadStore();
  const previousThreadId = useRef<string | null>(threadId);

  const [messages, setMessages] = useState<ChatMessage[]>([createWelcomeMessage()]);
  const [checkinScreen, setCheckinScreen] = useState<CheckinScreen | null>(null);
  const [nudgePlan, setNudgePlan] = useState<NudgePlan | null>(null);

  useEffect(() => {
    const prev = previousThreadId.current;
    const didChange = prev !== threadId;

    if (didChange) {
      const switchingFromThread = !!prev;
      const switchingToThread = !!threadId;
      const shouldReset = !switchingToThread || (switchingFromThread && switchingToThread);

      if (shouldReset) {
        setMessages([createWelcomeMessage()]);
        setCheckinScreen(null);
        setNudgePlan(null);
      }
    }

    previousThreadId.current = threadId;
  }, [threadId]);

  const appendMessages = useCallback((next: ChatMessage | ChatMessage[]) => {
    const nextList = Array.isArray(next) ? next : [next];
    setMessages((prev) => [...prev, ...nextList]);
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<ChatMessage>) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? ({ ...msg, ...updates } as ChatMessage) : msg))
    );
  }, []);

  const mutation = useMutation({
    mutationFn: async (data: MessageRequest) => cadenceApi.sendMessage(data),
    onSuccess: (response, variables) => {
      if (__DEV__) {
        console.log("cadenceApi.sendMessage response", response);
      }
      if (!variables.threadId && response.threadId) {
        addThread({
          id: response.threadId,
          symptomSummary: null,
          phase: response.phase,
          status: "active",
          lastCheckinAt: null,
          checkinCount: 0,
          createdAt: new Date().toISOString(),
        });
        setActiveThread(response.threadId);
      }

      const messages = Array.isArray(response.messages) ? response.messages : [];

      const appendTextMessage = (content: string, suffix: string) => {
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${suffix}`,
            type: "text",
            role: "assistant",
            content,
            timestamp: new Date().toISOString(),
          },
        ]);
      };

      messages.forEach((msg, index) => {
        const content =
          typeof msg === "string"
            ? msg
            : msg?.content ??
              (msg as { message?: string }).message ??
              (msg as { text?: string }).text ??
              (msg as { content?: { text?: string } }).content?.text ??
              "";

        if (!content.trim()) {
          if (__DEV__) {
            appendTextMessage("Debug: assistant message content was empty.", `empty-${index}`);
          }
          return;
        }

        const newMessage: ChatMessage = {
          id: `${Date.now()}-${index}`,
          type: "text",
          role: "assistant",
          content,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, newMessage]);
      });

      if (!messages.length) {
        const fallback =
          (response as { message?: string }).message ??
          (response as { content?: string }).content ??
          "";
        if (fallback.trim()) {
          appendTextMessage(fallback, "fallback");
        }
      }

      if (__DEV__ && !messages.length && !(response as { message?: string }).message) {
        appendTextMessage("Debug: response contained no message text.", "debug");
      }

      if (response.clarificationQuestions && response.clarificationQuestions.length > 0) {
        const clarificationMessages: ChatMessage[] = [];

        response.clarificationQuestions.forEach((question, index) => {
          if (question.answerType === "free_text") {
            clarificationMessages.push({
              id: `clarify-${Date.now()}-${index}`,
              type: "text",
              role: "assistant",
              content: question.question,
              timestamp: new Date().toISOString(),
            });
            return;
          }

          const options =
            question.options?.length
              ? question.options
              : question.answerType === "yes_no"
                ? ["Yes", "No"]
                : [];

          clarificationMessages.push({
            id: `qr-${Date.now()}-${index}`,
            type: "quick_reply",
            role: "assistant",
            content: question.question,
            answerType: question.answerType,
            options: options.map((option) => ({ id: option, label: option })),
            timestamp: new Date().toISOString(),
          });
        });

        setMessages((prev) => [...prev, ...clarificationMessages]);
      }

      if (response.checkinScreen) {
        setCheckinScreen(response.checkinScreen);
        const widgetMessage: ChatMessage = {
          id: `widget-${Date.now()}`,
          type: "checkin_widget",
          role: "assistant",
          screen: response.checkinScreen,
          status: "active",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, widgetMessage]);
      }

      if (response.nudgePlan) {
        setNudgePlan(response.nudgePlan);
      }

      if (response.threadId) {
        updateThread(response.threadId, { phase: response.phase });
      }

      queryClient.invalidateQueries({ queryKey: threadKeys.all });
    },
    onError: (error) => {
      const debugSuffix = __DEV__ ? ` (debug: ${formatMutationError(error)})` : "";
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: "text",
        role: "assistant",
        content: `Sorry — I couldn’t reach the server. Please try again in a moment.${debugSuffix}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  const sendMessage = useCallback(
    async (text: string) => {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "text",
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        await mutation.mutateAsync({
          threadId: threadId ?? undefined,
          message: text,
        });
      } catch {
        // Error UI handled via onError callback.
      }
    },
    [threadId, mutation]
  );

  return {
    messages,
    isLoading: mutation.isPending,
    error: mutation.error as Error | null,
    sendMessage,
    appendMessages,
    updateMessage,
    checkinScreen,
    nudgePlan,
  };
}
