import React from "react";
import { View, Text } from "react-native";
import { Chip } from "@components/shared";
import { colors, spacing, typography } from "@theme";

interface QuickReplyMessageProps {
  prompt: string;
  options: { id: string; label: string }[];
  onSelect: (option: { id: string; label: string }) => void;
  disabled?: boolean;
}

export function QuickReplyMessage({
  prompt,
  options,
  onSelect,
  disabled = false,
}: QuickReplyMessageProps) {
  return (
    <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.xs, gap: spacing.sm }}>
      <Text selectable style={{ ...typography.bodyMedium, color: colors.textPrimary }}>
        {prompt}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        {options.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            onPress={() => onSelect(option)}
            disabled={disabled}
          />
        ))}
      </View>
    </View>
  );
}
