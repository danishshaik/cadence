import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SymbolView } from "expo-symbols";
import { colors, radius, spacing, typography } from "@theme";

interface CheckinSummaryProps {
  title: string;
  summary: string;
  submittedAt: string;
  onPress?: () => void;
}

export function CheckinSummary({
  title,
  summary,
  submittedAt,
  onPress,
}: CheckinSummaryProps) {
  const formattedTime = new Date(submittedAt).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: spacing.md,
        marginVertical: spacing.xs,
        padding: spacing.sm,
        backgroundColor: colors.surfaceSecondary,
        borderRadius: radius.md,
        borderCurve: "continuous",
        gap: spacing.sm,
      }}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: colors.surface,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SymbolView
          name="checkmark.circle.fill"
          size={20}
          tintColor={colors.success}
          fallback={<Text selectable style={{ color: colors.success }}>✓</Text>}
        />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.sm }}>
          <Text selectable style={{ ...typography.bodyMedium, color: colors.textPrimary }}>
            {title}
          </Text>
          <Text selectable style={{ ...typography.caption, color: colors.textTertiary }}>
            {formattedTime}
          </Text>
        </View>
        <Text
          selectable
          style={{ ...typography.caption, color: colors.textSecondary }}
          numberOfLines={1}
        >
          {summary}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
