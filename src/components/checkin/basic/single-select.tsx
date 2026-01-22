import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ComponentProps } from "../types";
import { colors, spacing, radius, typography } from "@theme";

interface Option {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

interface SingleSelectProps extends ComponentProps<string> {
  options: Option[];
  display?: "buttons" | "chips" | "list" | "cards";
}

export function SingleSelect({
  prompt,
  value,
  onChange,
  options,
  display = "buttons",
  disabled,
}: SingleSelectProps) {
  const renderButtons = () => (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            disabled={disabled}
            style={[
              {
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
                borderRadius: radius.md,
                borderCurve: "continuous",
                backgroundColor: colors.surfaceSecondary,
                gap: spacing.xs,
              },
              isSelected && { backgroundColor: colors.primary },
              disabled && { opacity: 0.5 },
            ]}
          >
            {option.icon && (
              <Text selectable style={{ fontSize: 16 }}>
                {option.icon}
              </Text>
            )}
            <Text
              selectable
              style={{
                ...typography.bodyMedium,
                color: isSelected ? colors.surface : colors.textPrimary,
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderChips = () => (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
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
              isSelected && {
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
                color: isSelected ? colors.surface : colors.textPrimary,
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderList = () => (
    <View style={{ gap: spacing.sm }}>
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            disabled={disabled}
            style={[
              {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: spacing.md,
                borderRadius: radius.md,
                borderCurve: "continuous",
                backgroundColor: colors.surfaceSecondary,
                borderWidth: 2,
                borderColor: "transparent",
              },
              isSelected && {
                backgroundColor: colors.primaryLight,
                borderColor: colors.primary,
              },
              disabled && { opacity: 0.5 },
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
              {option.icon && (
                <Text selectable style={{ fontSize: 20 }}>
                  {option.icon}
                </Text>
              )}
              <View style={{ gap: 2 }}>
                <Text selectable style={{ ...typography.bodyMedium, color: colors.textPrimary }}>
                  {option.label}
                </Text>
                {option.description && (
                  <Text selectable style={{ ...typography.caption, color: colors.textSecondary }}>
                    {option.description}
                  </Text>
                )}
              </View>
            </View>
            {isSelected && (
              <Text selectable style={{ fontSize: 16, color: colors.primary, fontWeight: "700" }}>
                ✓
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderCards = () => (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            disabled={disabled}
            style={[
              {
                width: "48%",
                padding: spacing.md,
                borderRadius: radius.md,
                borderCurve: "continuous",
                backgroundColor: colors.surfaceSecondary,
                borderWidth: 2,
                borderColor: "transparent",
                alignItems: "center",
                gap: spacing.xs,
              },
              isSelected && {
                backgroundColor: colors.primaryLight,
                borderColor: colors.primary,
              },
              disabled && { opacity: 0.5 },
            ]}
          >
            {option.icon && (
              <Text selectable style={{ fontSize: 24 }}>
                {option.icon}
              </Text>
            )}
            <Text
              selectable
              style={{
                ...typography.bodyMedium,
                color: isSelected ? colors.primary : colors.textPrimary,
                textAlign: "center",
              }}
            >
              {option.label}
            </Text>
            {option.description && (
              <Text selectable style={{ ...typography.caption, color: colors.textSecondary, textAlign: "center" }}>
                {option.description}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderOptions = () => {
    switch (display) {
      case "chips":
        return renderChips();
      case "list":
        return renderList();
      case "cards":
        return renderCards();
      default:
        return renderButtons();
    }
  };

  return (
    <View style={{ gap: spacing.sm }}>
      <Text selectable style={{ ...typography.bodyMedium, color: colors.textPrimary }}>
        {prompt}
      </Text>
      {renderOptions()}
    </View>
  );
}
