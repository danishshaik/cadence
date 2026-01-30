import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@theme";
import { ExpoSlider } from "@/components/ui";
import { FieldPropsWithVariant } from "../types";
import { FieldWrapper } from "./field-wrapper";

const isIOS = process.env.EXPO_OS === "ios";

interface LinearScaleFieldProps extends FieldPropsWithVariant<number> {
  min: number;
  max: number;
  step?: number;
  leftLabel?: string;
  rightLabel?: string;
}

export function LinearScaleField({
  value,
  onChange,
  min,
  max,
  step = 1,
  leftLabel,
  rightLabel,
  disabled,
  required,
  error,
  label,
  description,
}: LinearScaleFieldProps) {
  return (
    <FieldWrapper
      label={label}
      description={description}
      required={required}
      error={error}
      disabled={disabled}
    >
      <View style={styles.valueRow}>
        <Text selectable style={styles.valueText}>
          {value}
        </Text>
      </View>
      <ExpoSlider
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={colors.arthritis}
        maximumTrackTintColor={colors.arthritisSurface}
        thumbTintColor={colors.arthritis}
        style={styles.slider}
      />
      {(leftLabel || rightLabel) && (
        <View style={styles.scaleLabels}>
          <Text selectable style={styles.scaleLabel}>
            {leftLabel ?? ""}
          </Text>
          <Text selectable style={styles.scaleLabel}>
            {rightLabel ?? ""}
          </Text>
        </View>
      )}
    </FieldWrapper>
  );
}

const styles = StyleSheet.create({
  valueRow: {
    alignItems: "center",
  },
  valueText: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary ?? colors.arthritisText,
    fontVariant: ["tabular-nums"],
  },
  slider: {
    width: "100%",
    height: 40,
  },
  scaleLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  scaleLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary ?? colors.arthritisTextSecondary,
  },
});
