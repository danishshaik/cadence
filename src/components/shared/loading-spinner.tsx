import React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { colors, spacing, typography } from "@theme";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  message?: string;
  overlay?: boolean;
}

export function LoadingSpinner({
  size = "large",
  message,
  overlay = false,
}: LoadingSpinnerProps) {
  const content = (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.lg,
        gap: spacing.sm,
      }}
    >
      <ActivityIndicator size={size} color={colors.primary} />
      {message && (
        <Text selectable style={{ ...typography.caption, color: colors.textSecondary }}>
          {message}
        </Text>
      )}
    </View>
  );

  if (overlay) {
    return (
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999,
        }}
      >
        {content}
      </View>
    );
  }

  return content;
}
