import React from "react";
import { View, ViewStyle } from "react-native";
import { colors, radius, shadows, spacing } from "@theme";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
  style?: ViewStyle;
}

const paddingMap: Record<NonNullable<CardProps["padding"]>, ViewStyle> = {
  none: { padding: 0 },
  sm: { padding: spacing.sm },
  md: { padding: spacing.md },
  lg: { padding: spacing.lg },
};

const variantMap: Record<NonNullable<CardProps["variant"]>, ViewStyle> = {
  default: { ...shadows.sm },
  elevated: { ...shadows.widget },
  outlined: { borderWidth: 1, borderColor: colors.border },
};

export function Card({
  children,
  variant = "default",
  padding = "md",
  style,
}: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderCurve: "continuous",
        },
        variantMap[variant],
        paddingMap[padding],
        style,
      ]}
    >
      {children}
    </View>
  );
}
