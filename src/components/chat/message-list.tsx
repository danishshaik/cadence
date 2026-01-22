import React, { useRef, useEffect } from "react";
import { FlatList, View, ListRenderItem } from "react-native";
import { AgentMessage } from "./agent-message";
import { UserMessage } from "./user-message";
import { TypingIndicator } from "./typing-indicator";
import { ChatMessage } from "./types";
import { colors, spacing } from "@theme";

interface MessageListProps {
  messages: ChatMessage[];
  isTyping?: boolean;
  onScrollToBottom?: () => void;
  renderWidget?: (message: ChatMessage) => React.ReactNode;
  bottomInset?: number;
  backgroundColor?: string;
  topInset?: number;
}

export function MessageList({
  messages,
  isTyping = false,
  renderWidget,
  bottomInset = spacing.lg,
  backgroundColor = colors.background,
  topInset = spacing.md,
}: MessageListProps) {
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (messages.length > 0) {
      const timeout = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [messages.length, isTyping]);

  const renderMessage: ListRenderItem<ChatMessage> = ({ item, index }) => {
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showAvatar =
      item.role === "assistant" && (!prevMessage || prevMessage.role !== "assistant");

    switch (item.type) {
      case "text":
        if (item.role === "user") {
          return <UserMessage content={item.content} timestamp={item.timestamp} />;
        }
        return (
          <AgentMessage
            content={item.content}
            timestamp={item.timestamp}
            showAvatar={showAvatar}
          />
        );
      case "checkin_widget":
      case "checkin_summary":
      case "insight":
      case "quick_reply":
        if (renderWidget) {
          return <>{renderWidget(item)}</>;
        }
        return null;
      default:
        return null;
    }
  };

  const ListFooter = () => (
    <>
      {isTyping && <TypingIndicator />}
      <View style={{ height: bottomInset }} />
    </>
  );

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={(item) => item.id}
      style={{ flex: 1, backgroundColor }}
      contentContainerStyle={{ paddingTop: topInset, flexGrow: 1 }}
      ListFooterComponent={ListFooter}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      inverted={false}
      contentInsetAdjustmentBehavior="automatic"
    />
  );
}
