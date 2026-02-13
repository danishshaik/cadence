import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { Badge } from "@components/shared";
import { Thread } from "@stores/thread-store";
import { colors, spacing, radius, typography } from "@theme";

interface ThreadListItemProps {
  thread: Thread;
  isActive: boolean;
  onPress: () => void;
}

const STATUS_SYMBOLS: Record<Thread["phase"], SymbolViewProps["name"]> = {
  intake: { ios: "bubble.left.and.bubble.right", android: "chat" } as unknown as SymbolViewProps["name"],
  clarifying: { ios: "questionmark.circle", android: "help" } as unknown as SymbolViewProps["name"],
  tracking: { ios: "waveform.path.ecg", android: "monitor_heart" } as unknown as SymbolViewProps["name"],
  insight_ready: { ios: "lightbulb", android: "lightbulb" } as unknown as SymbolViewProps["name"],
  designing: { ios: "sparkles", android: "auto_awesome" } as unknown as SymbolViewProps["name"],
  scheduling: { ios: "calendar", android: "calendar_today" } as unknown as SymbolViewProps["name"],
};

const CATEGORY_ICONS: Record<string, string> = {
  pain: "🩹",
  skin: "🔬",
  digestive: "🍽️",
  sleep: "😴",
  fatigue: "⚡",
  default: "📋",
};

export function ThreadListItem({ thread, isActive, onPress }: ThreadListItemProps) {
  const icon = CATEGORY_ICONS[thread.symptomCategory || "default"] || CATEGORY_ICONS.default;
  const statusSymbol = STATUS_SYMBOLS[thread.phase];

  const formatLastCheckin = () => {
    if (!thread.lastCheckinAt) return null;

    const date = new Date(thread.lastCheckinAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const lastCheckin = formatLastCheckin();
  const checkinLabel =
    thread.phase === "tracking"
      ? `${thread.checkinCount} check-in${thread.checkinCount !== 1 ? "s" : ""}`
      : thread.phase.replace("_", " ");

  return (
    <TouchableOpacity
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          padding: spacing.sm + 4,
          marginHorizontal: spacing.sm,
          marginVertical: spacing.xs / 2,
          borderRadius: radius.md,
          borderCurve: "continuous",
          gap: spacing.sm,
        },
        isActive && { backgroundColor: colors.primaryLight },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: radius.sm,
          borderCurve: "continuous",
          backgroundColor: colors.surface,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text selectable style={{ fontSize: 18 }}>
          {icon}
        </Text>
      </View>

      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
          <Text
            selectable
            style={{
              ...typography.bodyMedium,
              color: isActive ? colors.primary : colors.textPrimary,
              flex: 1,
            }}
            numberOfLines={1}
          >
            {thread.symptomSummary || "New symptom"}
          </Text>
          {thread.hasUnreadInsights && (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.primary,
              }}
            />
          )}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
          <SymbolView
            name={statusSymbol}
            size={12}
            tintColor={isActive ? colors.primary : colors.textTertiary}
            fallback={
              <Text selectable style={{ ...typography.caption, color: colors.textTertiary }}>
                ●
              </Text>
            }
          />
          <Text selectable style={{ ...typography.caption, color: colors.textTertiary }}>
            {checkinLabel}
          </Text>
          {lastCheckin && (
            <>
              <Text selectable style={{ ...typography.caption, color: colors.textTertiary }}>
                ·
              </Text>
              <Text selectable style={{ ...typography.caption, color: colors.textTertiary }}>
                {lastCheckin}
              </Text>
            </>
          )}
        </View>
      </View>

      {thread.phase === "insight_ready" && <Badge label="Insights" variant="info" />}
    </TouchableOpacity>
  );
}
