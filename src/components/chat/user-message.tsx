import React from "react";
import { View, Text } from "react-native";
import { colors, radius, spacing, typography } from "@theme";

interface UserMessageProps {
  content: string;
  timestamp?: string;
}

export function UserMessage({ content, timestamp }: UserMessageProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
      }}
    >
      <View
        style={{
          backgroundColor: colors.primary,
          borderRadius: radius.lg,
          borderCurve: "continuous",
          borderBottomRightRadius: radius.sm,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          maxWidth: "80%",
          gap: spacing.xs,
        }}
      >
        <Text selectable style={{ ...typography.body, color: colors.surface }}>
          {content}
        </Text>
        {timestamp && (
          <Text
            selectable
            style={{
              ...typography.caption,
              color: "rgba(255, 255, 255, 0.7)",
              textAlign: "right",
            }}
          >
            {new Date(timestamp).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
          </Text>
        )}
      </View>
    </View>
  );
}
