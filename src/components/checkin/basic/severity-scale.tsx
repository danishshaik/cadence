import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ComponentProps } from "../types";
import { colors, spacing, radius, typography } from "@theme";

type ScaleType =
  | "numeric_1_10"
  | "numeric_1_5"
  | "faces"
  | "visual_analog"
  | "traffic_light"
  | "descriptive";

interface SeverityScaleProps extends ComponentProps<number> {
  scale_type: ScaleType;
  min_label: string;
  max_label: string;
  show_previous?: boolean;
}

const FACES = ["😄", "🙂", "😐", "🙁", "😣"] as const;

const TRAFFIC_LIGHT = [
  { value: 1, label: "Good", color: "#4ADE80" },
  { value: 2, label: "Okay", color: "#FBBF24" },
  { value: 3, label: "Bad", color: "#F87171" },
] as const;

const DESCRIPTIVE = ["None", "Mild", "Moderate", "Severe"] as const;

export function SeverityScale({
  prompt,
  value,
  onChange,
  scale_type,
  min_label,
  max_label,
  show_previous,
  previousValue,
  disabled,
}: SeverityScaleProps) {
  const renderNumericScale = (min: number, max: number) => {
    const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

    return (
      <View style={{ gap: spacing.xs }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 4 }}>
          {numbers.map((num) => {
            const isSelected = value === num;
            return (
              <TouchableOpacity
                key={num}
                onPress={() => onChange(num)}
                disabled={disabled}
                style={[
                  {
                    flex: 1,
                    aspectRatio: 1,
                    maxWidth: 36,
                    borderRadius: radius.full,
                    backgroundColor: colors.surfaceSecondary,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  isSelected && { backgroundColor: colors.primary },
                  disabled && { opacity: 0.5 },
                ]}
              >
                <Text
                  selectable
                  style={{
                    ...typography.bodyMedium,
                    color: isSelected ? colors.surface : colors.textPrimary,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {num}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text selectable style={{ ...typography.caption, color: colors.textTertiary }}>
            {min_label}
          </Text>
          <Text selectable style={{ ...typography.caption, color: colors.textTertiary }}>
            {max_label}
          </Text>
        </View>
      </View>
    );
  };

  const renderFaces = () => (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      {FACES.map((face, index) => {
        const isSelected = value === index + 1;
        return (
          <TouchableOpacity
            key={face}
            onPress={() => onChange(index + 1)}
            disabled={disabled}
            style={[
              {
                padding: spacing.sm,
                borderRadius: radius.md,
                borderCurve: "continuous",
              },
              isSelected && {
                backgroundColor: colors.primaryLight,
                transform: [{ scale: 1.08 }],
              },
              disabled && { opacity: 0.5 },
            ]}
          >
            <Text selectable style={{ fontSize: 28 }}>
              {face}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderTrafficLight = () => (
    <View style={{ flexDirection: "row", gap: spacing.sm }}>
      {TRAFFIC_LIGHT.map((option) => {
        const isSelected = value === option.value;
        return (
          <TouchableOpacity
            key={option.label}
            onPress={() => onChange(option.value)}
            disabled={disabled}
            style={[
              {
                flex: 1,
                paddingVertical: spacing.md,
                borderRadius: radius.md,
                borderCurve: "continuous",
                alignItems: "center",
                backgroundColor: option.color,
              },
              isSelected && { borderWidth: 2, borderColor: colors.textPrimary },
              disabled && { opacity: 0.5 },
            ]}
          >
            <Text selectable style={{ ...typography.bodyMedium, color: colors.surface }}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderDescriptive = () => (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
      {DESCRIPTIVE.map((label, index) => {
        const isSelected = value === index;
        return (
          <TouchableOpacity
            key={label}
            onPress={() => onChange(index)}
            disabled={disabled}
            style={[
              {
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
                borderRadius: radius.full,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
              },
              isSelected && {
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              },
              disabled && { opacity: 0.5 },
            ]}
          >
            <Text
              selectable
              style={{
                ...typography.body,
                color: isSelected ? colors.surface : colors.textPrimary,
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderScale = () => {
    switch (scale_type) {
      case "numeric_1_10":
        return renderNumericScale(1, 10);
      case "numeric_1_5":
        return renderNumericScale(1, 5);
      case "faces":
        return renderFaces();
      case "traffic_light":
        return renderTrafficLight();
      case "descriptive":
        return renderDescriptive();
      case "visual_analog":
      default:
        return renderNumericScale(1, 10);
    }
  };

  return (
    <View style={{ gap: spacing.sm }}>
      <Text selectable style={{ ...typography.bodyMedium, color: colors.textPrimary }}>
        {prompt}
      </Text>
      {renderScale()}
      {show_previous && previousValue !== undefined && (
        <Text selectable style={{ ...typography.caption, color: colors.textTertiary }}>
          Previous: {previousValue}
        </Text>
      )}
    </View>
  );
}
