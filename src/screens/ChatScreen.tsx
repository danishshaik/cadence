import { ChatInput, ChatMessage, MessageList, QuickReplyMessage } from "@components/chat";
import { CheckinSummary, CheckinWidget } from "@components/checkin";
import { useCheckin } from "@hooks/use-checkin";
import { useMessages } from "@hooks/use-messages";
import { useHeaderHeight } from "@react-navigation/elements";
import { useActiveThread } from "@stores/thread-store";
import { useUserStore } from "@stores/user-store";
import { spacing } from "@theme";
import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const isIOS = process.env.EXPO_OS === "ios";
const CLAUDE_BG = "#F9F6F2";

export function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const headerHeight = useHeaderHeight();
  const activeThread = useActiveThread();
  const initializeUser = useUserStore((state) => state.initializeUser);
  const defaultInset = insets.bottom + 112;
  const [inputHeight, setInputHeight] = useState(defaultInset);

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  const { messages, isLoading, sendMessage, appendMessages, updateMessage } = useMessages(
    activeThread?.id ?? null
  );

  const { submitCheckin, isSubmitting } = useCheckin(activeThread?.id ?? null);

  const handleCheckinSubmit = async (messageId: string, answers: Record<string, unknown>) => {
    if (!activeThread?.id) return;

    try {
      const response = await submitCheckin(answers);

      updateMessage(messageId, { status: "completed", answers });

      appendMessages({
        id: `summary-${Date.now()}`,
        type: "checkin_summary",
        role: "assistant",
        summary: response.message,
        submittedAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      });

      if (response.insights && response.insights.length > 0) {
        appendMessages({
          id: `insight-${Date.now()}`,
          type: "insight",
          role: "assistant",
          insights: response.insights,
          timestamp: new Date().toISOString(),
        });
      }
    } catch {
      appendMessages({
        id: `checkin-error-${Date.now()}`,
        type: "text",
        role: "assistant",
        content: "I couldn’t log that check-in. Please try again.",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const renderWidget = (message: ChatMessage) => {
    if (message.type === "checkin_widget") {
      if (message.status === "completed") return null;

      return (
        <CheckinWidget
          screen={message.screen}
          onSubmit={(answers) => handleCheckinSubmit(message.id, answers)}
          disabled={isSubmitting}
        />
      );
    }

    if (message.type === "checkin_summary") {
      return (
        <CheckinSummary
          title="Check-in"
          summary={message.summary}
          submittedAt={message.submittedAt}
        />
      );
    }

    if (message.type === "quick_reply") {
      return (
        <QuickReplyMessage
          prompt={message.content}
          options={message.options}
          onSelect={(option) => sendMessage(option.label)}
          disabled={isLoading}
        />
      );
    }

    return null;
  };

  const inputInset = Math.max(inputHeight, defaultInset);
  const topInset = headerHeight + spacing.sm;

  return (
    <View style={{ flex: 1, backgroundColor: CLAUDE_BG }}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -height * 0.15,
          left: -width * 0.2,
          width: width * 1.4,
          height: height * 0.6,
          borderRadius: width,
          backgroundColor: "rgba(226, 214, 196, 0.35)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: height * 0.35,
          right: -width * 0.25,
          width: width * 0.9,
          height: width * 0.9,
          borderRadius: width,
          backgroundColor: "rgba(205, 186, 164, 0.28)",
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={isIOS ? "padding" : "height"}
        keyboardVerticalOffset={isIOS ? 90 : 0}
      >
        <MessageList
          messages={messages}
          isTyping={isLoading}
          renderWidget={renderWidget}
          bottomInset={inputInset}
          backgroundColor={CLAUDE_BG}
          topInset={topInset}
        />
        <View
          onLayout={(event) => setInputHeight(event.nativeEvent.layout.height)}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.md + insets.bottom,
            paddingTop: spacing.sm,
          }}
        >
          <ChatInput onSend={sendMessage} disabled={isLoading} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
