import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from "react-native";
import { colors, radius, spacing, typography } from "@theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, ViewStyle> = {
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surfaceSecondary },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: { backgroundColor: "transparent" },
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, ViewStyle> = {
  sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, minHeight: 32 },
  md: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, minHeight: 44 },
  lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, minHeight: 52 },
};

const textVariantColors: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: colors.surface,
  secondary: colors.textPrimary,
  outline: colors.textPrimary,
  ghost: colors.primary,
};

const textSizes: Record<NonNullable<ButtonProps["size"]>, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        {
          borderRadius: radius.md,
          borderCurve: "continuous",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
        },
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && { width: "100%" },
        isDisabled && { opacity: 0.5 },
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? colors.surface : colors.primary}
          size="small"
        />
      ) : (
        <Text
          style={{
            ...typography.bodyMedium,
            color: textVariantColors[variant],
            fontSize: textSizes[size],
          }}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
