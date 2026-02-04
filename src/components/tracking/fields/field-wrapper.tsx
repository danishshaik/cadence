import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors } from "@theme";

interface FieldWrapperProps {
  label?: string;
  description?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const isIOS = process.env.EXPO_OS === "ios";

export function FieldWrapper({
  label,
  description,
  required,
  error,
  disabled,
  containerStyle,
  children,
}: FieldWrapperProps) {
  return (
    <View style={[styles.container, disabled && styles.disabled, containerStyle]}>
      {(label || description) && (
        <View style={styles.header}>
          {label && (
            <Text selectable style={styles.label}>
              {label}
              {required ? " *" : ""}
            </Text>
          )}
          {description && <Text selectable style={styles.description}>{description}</Text>}
        </View>
      )}
      {children}
      {error ? (
        <Text selectable style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  disabled: {
    opacity: 0.6,
  },
  header: {
    gap: 6,
  },
  label: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary ?? colors.arthritisText,
  },
  description: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    color: colors.textSecondary ?? colors.arthritisTextSecondary,
  },
  error: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    color: colors.error ?? "#DC2626",
  },
});
