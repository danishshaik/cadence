import React from "react";
import { View, Text } from "react-native";
import { Image, ImageSource } from "expo-image";
import { colors, radius, spacing, typography } from "@theme";

interface AvatarProps {
  source?: ImageSource;
  name?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: 32,
  md: 40,
  lg: 56,
} as const;

export function Avatar({ source, name, size = "md" }: AvatarProps) {
  const sizeValue = sizes[size];

  if (source) {
    return (
      <Image
        source={source}
        contentFit="cover"
        style={{ width: sizeValue, height: sizeValue, borderRadius: radius.full }}
      />
    );
  }

  const initials = name
    ? name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <View
      style={{
        width: sizeValue,
        height: sizeValue,
        borderRadius: radius.full,
        backgroundColor: colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: spacing.xs,
      }}
    >
      <Text
        selectable
        style={{
          ...typography.label,
          color: colors.primary,
          fontWeight: "600",
          fontSize: sizeValue * 0.4,
        }}
      >
        {initials}
      </Text>
    </View>
  );
}
