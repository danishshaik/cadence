import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ComponentProps } from "../types";
import { colors, spacing, radius, typography } from "@theme";

interface YesNoProps extends ComponentProps<boolean | "maybe"> {
  show_maybe?: boolean;
}

export function YesNo({
  prompt,
  value,
  onChange,
  show_maybe = false,
  disabled,
}: YesNoProps) {
  const options = show_maybe
    ? [
        { value: true, label: "Yes" },
        { value: "maybe" as const, label: "Maybe" },
        { value: false, label: "No" },
      ]
    : [
        { value: true, label: "Yes" },
        { value: false, label: "No" },
      ];

  return (
    <View style={{ gap: spacing.sm }}>
      <Text selectable style={{ ...typography.bodyMedium, color: colors.textPrimary }}>
        {prompt}
      </Text>
      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <TouchableOpacity
              key={String(option.value)}
              onPress={() => onChange(option.value)}
              disabled={disabled}
              style={[
                {
                  flex: 1,
                  paddingVertical: spacing.md,
                  borderRadius: radius.md,
                  borderCurve: "continuous",
                  backgroundColor: colors.surfaceSecondary,
                  alignItems: "center",
                },
                isSelected && { backgroundColor: colors.primary },
                disabled && { opacity: 0.5 },
              ]}
            >
              <Text
                selectable
                style={{
                  ...typography.bodyMedium,
                  color: isSelected ? colors.surface : colors.textPrimary,
                }}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
