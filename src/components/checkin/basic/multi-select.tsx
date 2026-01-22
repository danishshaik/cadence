import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ComponentProps } from "../types";
import { colors, spacing, radius, typography } from "@theme";

interface Option {
  value: string;
  label: string;
  icon?: string;
}

interface MultiSelectProps extends ComponentProps<string[]> {
  options: Option[];
  min_selections?: number;
  max_selections?: number;
  display?: "chips" | "checkboxes" | "grid";
}

export function MultiSelect({
  prompt,
  value = [],
  onChange,
  options,
  min_selections = 0,
  max_selections,
  display = "chips",
  disabled,
}: MultiSelectProps) {
  const toggleOption = (optionValue: string) => {
    const currentValues = value || [];
    const isSelected = currentValues.includes(optionValue);

    if (isSelected) {
      onChange(currentValues.filter((item) => item !== optionValue));
    } else {
      if (max_selections && currentValues.length >= max_selections) return;
      onChange([...currentValues, optionValue]);
    }
  };

  const isSelected = (optionValue: string) => (value || []).includes(optionValue);

  const renderChips = () => (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
      {options.map((option) => {
        const selected = isSelected(option.value);
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => toggleOption(option.value)}
            disabled={disabled}
            style={[
              {
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: spacing.xs + 2,
                paddingHorizontal: spacing.sm + 4,
                borderRadius: radius.full,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                gap: spacing.xs,
              },
              selected && {
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              },
              disabled && { opacity: 0.5 },
            ]}
          >
            {option.icon && (
              <Text selectable style={{ fontSize: 14 }}>
                {option.icon}
              </Text>
            )}
            <Text
              selectable
              style={{
                ...typography.caption,
                fontWeight: "500",
                color: selected ? colors.surface : colors.textPrimary,
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderCheckboxes = () => (
    <View style={{ gap: spacing.sm }}>
      {options.map((option) => {
        const selected = isSelected(option.value);
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => toggleOption(option.value)}
            disabled={disabled}
            style={[
              {
                flexDirection: "row",
                alignItems: "center",
                padding: spacing.md,
                borderRadius: radius.md,
                borderCurve: "continuous",
                backgroundColor: colors.surfaceSecondary,
                gap: spacing.sm,
              },
              selected && { backgroundColor: colors.primaryLight },
              disabled && { opacity: 0.5 },
            ]}
          >
            <View
              style={[
                {
                  width: 24,
                  height: 24,
                  borderRadius: radius.sm,
                  borderWidth: 2,
                  borderColor: colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                },
                selected && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
            >
              {selected && (
                <Text selectable style={{ color: colors.surface, fontWeight: "700" }}>
                  ✓
                </Text>
              )}
            </View>
            {option.icon && (
              <Text selectable style={{ fontSize: 16 }}>
                {option.icon}
              </Text>
            )}
            <Text selectable style={{ ...typography.body, color: colors.textPrimary }}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderGrid = () => (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
      {options.map((option) => {
        const selected = isSelected(option.value);
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => toggleOption(option.value)}
            disabled={disabled}
            style={[
              {
                width: "48%",
                padding: spacing.md,
                borderRadius: radius.md,
                borderCurve: "continuous",
                backgroundColor: colors.surfaceSecondary,
                alignItems: "center",
                gap: spacing.xs,
              },
              selected && { backgroundColor: colors.primary },
              disabled && { opacity: 0.5 },
            ]}
          >
            {option.icon && (
              <Text selectable style={{ fontSize: 20 }}>
                {option.icon}
              </Text>
            )}
            <Text
              selectable
              style={{
                ...typography.caption,
                fontWeight: "500",
                color: selected ? colors.surface : colors.textPrimary,
                textAlign: "center",
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderOptions = () => {
    switch (display) {
      case "checkboxes":
        return renderCheckboxes();
      case "grid":
        return renderGrid();
      default:
        return renderChips();
    }
  };

  return (
    <View style={{ gap: spacing.sm }}>
      <Text selectable style={{ ...typography.bodyMedium, color: colors.textPrimary }}>
        {prompt}
        {max_selections && (
          <Text selectable style={{ ...typography.caption, color: colors.textSecondary }}>
            {" "}(Select up to {max_selections})
          </Text>
        )}
      </Text>
      {renderOptions()}
      {min_selections > 0 && (value || []).length < min_selections && (
        <Text selectable style={{ ...typography.caption, color: colors.warning }}>
          Please select at least {min_selections} option{min_selections > 1 ? "s" : ""}
        </Text>
      )}
    </View>
  );
}
