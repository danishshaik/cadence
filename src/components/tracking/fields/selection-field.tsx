import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { colors, shadows } from "@theme";
import { FieldPropsWithVariant } from "../types";
import { FieldWrapper } from "./field-wrapper";

const isIOS = process.env.EXPO_OS === "ios";

export interface SelectionOption {
  value: string;
  label: string;
  description?: string;
}

interface SelectionFieldProps extends FieldPropsWithVariant<string | null> {
  options: SelectionOption[];
}

export function SelectionField({
  value,
  onChange,
  options,
  disabled,
  required,
  error,
  label,
  description,
}: SelectionFieldProps) {
  return (
    <FieldWrapper
      label={label}
      description={description}
      required={required}
      error={error}
      disabled={disabled}
    >
      <View style={styles.list}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => {
                if (disabled) return;
                Haptics.selectionAsync();
                onChange(option.value);
              }}
              style={({ pressed }) => [
                styles.card,
                selected && styles.cardSelected,
                pressed && styles.cardPressed,
              ]}
            >
              <View style={styles.cardContent}>
                <Text selectable style={styles.cardLabel}>
                  {option.label}
                </Text>
                {option.description ? (
                  <Text selectable style={styles.cardDescription}>
                    {option.description}
                  </Text>
                ) : null}
              </View>
              <View style={[styles.dot, selected && styles.dotSelected]} />
            </Pressable>
          );
        })}
      </View>
    </FieldWrapper>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: colors.border ?? colors.arthritisBorder,
    ...shadows.sm,
  },
  cardSelected: {
    borderColor: colors.arthritis,
    backgroundColor: colors.arthritisSurface,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary ?? colors.arthritisText,
  },
  cardDescription: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    color: colors.textSecondary ?? colors.arthritisTextSecondary,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border ?? colors.arthritisBorder,
  },
  dotSelected: {
    borderColor: colors.arthritis,
    backgroundColor: colors.arthritis,
  },
});
