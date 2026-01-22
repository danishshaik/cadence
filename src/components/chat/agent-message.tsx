import React from "react";
import { View, Text } from "react-native";
import { Avatar } from "@components/shared";
import { colors, radius, spacing, typography } from "@theme";

interface AgentMessageProps {
  content: string;
  timestamp?: string;
  showAvatar?: boolean;
}

export function AgentMessage({
  content,
  timestamp,
  showAvatar = true,
}: AgentMessageProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        gap: spacing.sm,
      }}
    >
      {showAvatar ? <Avatar name="Cadence" size="sm" /> : <View style={{ width: 32 }} />}
      <View
        style={{
          backgroundColor: colors.surfaceSecondary,
          borderRadius: radius.lg,
          borderCurve: "continuous",
          borderBottomLeftRadius: radius.sm,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          maxWidth: "80%",
          gap: spacing.xs,
        }}
      >
        <Text selectable style={{ ...typography.body, color: colors.textPrimary }}>
          {content}
        </Text>
        {timestamp && (
          <Text selectable style={{ ...typography.caption, color: colors.textTertiary }}>
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
