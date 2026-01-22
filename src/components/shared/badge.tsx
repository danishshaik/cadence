import React from "react";
import { View, Text } from "react-native";
import { colors, radius, spacing, typography } from "@theme";

interface BadgeProps {
  label: string;
  variant?: "default" | "success" | "warning" | "error" | "info";
}

const variantStyles = {
  default: {
    backgroundColor: colors.surfaceSecondary,
    color: colors.textSecondary,
  },
  success: {
    backgroundColor: "#D1FAE5",
    color: "#065F46",
  },
  warning: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
  },
  error: {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
  },
  info: {
    backgroundColor: colors.primaryLight,
    color: colors.primary,
  },
} as const;

export function Badge({ label, variant = "default" }: BadgeProps) {
  const variantStyle = variantStyles[variant];

  return (
    <View
      style={{
        paddingVertical: spacing.xs - 2,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.full,
        backgroundColor: variantStyle.backgroundColor,
      }}
    >
      <Text
        selectable
        style={{
          ...typography.label,
          fontWeight: "500",
          color: variantStyle.color,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
