import React from "react";
import { TouchableOpacity, Text, ViewStyle } from "react-native";
import { colors, radius, spacing, typography } from "@theme";

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Chip({
  label,
  selected = false,
  onPress,
  disabled = false,
  icon,
  style,
}: ChipProps) {
  return (
    <TouchableOpacity
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: spacing.xs + 2,
          paddingHorizontal: spacing.sm + 4,
          borderRadius: radius.full,
          borderWidth: 1,
          gap: spacing.xs,
        },
        selected
          ? { backgroundColor: colors.primary, borderColor: colors.primary }
          : { backgroundColor: colors.surface, borderColor: colors.border },
        disabled && { opacity: 0.5 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={0.7}
    >
      {icon && <>{icon}</>}
      <Text
        style={{
          ...typography.caption,
          fontWeight: "500",
          color: selected ? colors.surface : colors.textPrimary,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
