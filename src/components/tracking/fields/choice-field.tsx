import React from "react";
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";
import { colors, shadows } from "@theme";
import { FieldPropsWithVariant } from "../types";
import { FieldWrapper } from "./field-wrapper";

const isIOS = process.env.EXPO_OS === "ios";

export interface ChoiceOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  subtitle?: string;
  accentColor?: string;
  iconBackgroundColor?: string;
  selectedBackgroundColor?: string;
  glowColor?: string;
}

interface ChoiceFieldProps extends FieldPropsWithVariant<string[]> {
  options: ChoiceOption[];
  minSelections?: number;
  maxSelections?: number;
  listStyle?: StyleProp<ViewStyle>;
  renderOption?: (params: {
    option: ChoiceOption;
    selected: boolean;
    onPress: () => void;
    disabled?: boolean;
  }) => React.ReactNode;
}

export function ChoiceField({
  value,
  onChange,
  options,
  minSelections = 0,
  maxSelections,
  disabled,
  required,
  error,
  label,
  description,
  listStyle,
  renderOption,
}: ChoiceFieldProps) {
  const selectedValues = value ?? [];

  const toggleValue = (optionValue: string) => {
    if (disabled) return;
    const isSelected = selectedValues.includes(optionValue);
    if (!isSelected) {
      if (maxSelections && selectedValues.length >= maxSelections) {
        return;
      }
      Haptics.selectionAsync();
      onChange([...selectedValues, optionValue]);
      return;
    }

    if (selectedValues.length <= minSelections) {
      return;
    }
    Haptics.selectionAsync();
    onChange(selectedValues.filter((val) => val !== optionValue));
  };

  return (
    <FieldWrapper
      label={label}
      description={description}
      required={required}
      error={error}
      disabled={disabled}
    >
      <View style={[styles.list, listStyle]}>
        {options.map((option) => {
          const selected = selectedValues.includes(option.value);
          if (renderOption) {
            return (
              <React.Fragment key={option.value}>
                {renderOption({
                  option,
                  selected,
                  onPress: () => toggleValue(option.value),
                  disabled,
                })}
              </React.Fragment>
            );
          }
          return (
            <Pressable
              key={option.value}
              onPress={() => toggleValue(option.value)}
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
              <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                {selected ? <View style={styles.checkboxDot} /> : null}
              </View>
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
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border ?? colors.arthritisBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    borderColor: colors.arthritis,
    backgroundColor: colors.arthritis,
  },
  checkboxDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
});
