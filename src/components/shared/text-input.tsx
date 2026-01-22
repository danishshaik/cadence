import React, { useState } from "react";
import { View, TextInput as RNTextInput, Text, TextInputProps } from "react-native";
import { colors, radius, spacing, typography } from "@theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
}

export function TextInput({ label, error, hint, style, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={{ width: "100%", gap: spacing.xs }}>
      {label && (
        <Text selectable style={{ ...typography.label, color: colors.textPrimary }}>
          {label}
        </Text>
      )}
      <RNTextInput
        style={[
          {
            ...typography.body,
            backgroundColor: colors.surfaceSecondary,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            borderCurve: "continuous",
            paddingVertical: spacing.sm + 2,
            paddingHorizontal: spacing.md,
            color: colors.textPrimary,
          },
          isFocused && {
            borderColor: colors.borderFocused,
            backgroundColor: colors.surface,
          },
          error && { borderColor: colors.error },
          style,
        ]}
        placeholderTextColor={colors.textTertiary}
        onFocus={(event) => {
          setIsFocused(true);
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          props.onBlur?.(event);
        }}
        {...props}
      />
      {error && (
        <Text selectable style={{ ...typography.caption, color: colors.error }}>
          {error}
        </Text>
      )}
      {hint && !error && (
        <Text selectable style={{ ...typography.caption, color: colors.textTertiary }}>
          {hint}
        </Text>
      )}
    </View>
  );
}
