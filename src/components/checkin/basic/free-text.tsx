import React from "react";
import { View, Text, TextInput } from "react-native";
import { ComponentProps } from "../types";
import { colors, spacing, radius, typography } from "@theme";

interface FreeTextProps extends ComponentProps<string> {
  placeholder?: string;
  max_length?: number;
  optional?: boolean;
}

export function FreeText({
  prompt,
  value = "",
  onChange,
  placeholder,
  max_length = 500,
  optional = true,
  disabled,
}: FreeTextProps) {
  return (
    <View style={{ gap: spacing.xs }}>
      <Text selectable style={{ ...typography.bodyMedium, color: colors.textPrimary }}>
        {prompt}
        {optional && (
          <Text selectable style={{ ...typography.caption, color: colors.textSecondary }}>
            {" "}(Optional)
          </Text>
        )}
      </Text>
      <TextInput
        style={[
          {
            ...typography.body,
            backgroundColor: colors.surfaceSecondary,
            borderRadius: radius.md,
            borderCurve: "continuous",
            padding: spacing.md,
            minHeight: 80,
            color: colors.textPrimary,
            textAlignVertical: "top",
          },
          disabled && { opacity: 0.5 },
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        maxLength={max_length}
        editable={!disabled}
        multiline
        numberOfLines={3}
      />
      <Text
        selectable
        style={{
          ...typography.caption,
          color: colors.textTertiary,
          textAlign: "right",
          fontVariant: ["tabular-nums"],
        }}
      >
        {(value || "").length}/{max_length}
      </Text>
    </View>
  );
}
