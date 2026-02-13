import React from "react";
import { StyleProp, StyleSheet, Switch, Text, View, ViewStyle } from "react-native";
import { colors } from "@theme";
import { FieldProps } from "../types";
import { FieldWrapper } from "./field-wrapper";

const isIOS = process.env.EXPO_OS === "ios";

interface ToggleFieldProps extends FieldProps<boolean> {
  labelPlacement?: "row" | "stack";
  variant?: "default" | "card";
  trackOffColor?: string;
  trackOnColor?: string;
  thumbColorOn?: string;
  thumbColorOff?: string;
  iosBackgroundColor?: string;
  labelColor?: string;
  descriptionColor?: string;
  cardStyle?: StyleProp<ViewStyle>;
}

export function ToggleField({
  value,
  onChange,
  disabled,
  required,
  error,
  label,
  description,
  labelPlacement = "row",
  variant = "default",
  trackOffColor = colors.arthritisBorder,
  trackOnColor = colors.arthritisMuted,
  thumbColorOn = colors.arthritis,
  thumbColorOff = "#FFFFFF",
  iosBackgroundColor = colors.arthritisBorder,
  labelColor = colors.arthritisText,
  descriptionColor = colors.arthritisTextSecondary,
  cardStyle,
}: ToggleFieldProps) {
  const rowContent = (
    <View style={[styles.row, labelPlacement === "stack" && styles.rowStack]}>
      {labelPlacement === "row" && label ? (
        <View style={styles.textBlock}>
          <Text selectable style={[styles.label, { color: labelColor }]}>
            {label}
            {required ? " *" : ""}
          </Text>
          {description ? (
            <Text selectable style={[styles.description, { color: descriptionColor }]}>
              {description}
            </Text>
          ) : null}
        </View>
      ) : null}
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: trackOffColor, true: trackOnColor }}
        thumbColor={value ? thumbColorOn : thumbColorOff}
        ios_backgroundColor={iosBackgroundColor}
      />
    </View>
  );

  return (
    <FieldWrapper
      label={labelPlacement === "stack" ? label : undefined}
      description={labelPlacement === "stack" ? description : undefined}
      required={required}
      error={error}
      disabled={disabled}
    >
      {variant === "card" ? (
        <View style={[styles.card, cardStyle]}>{rowContent}</View>
      ) : (
        rowContent
      )}
    </FieldWrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  rowStack: {
    alignItems: "flex-start",
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
    color: colors.arthritisText,
  },
  description: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
  },
  card: {
    width: "100%",
    borderRadius: 18,
    borderCurve: "continuous",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    boxShadow: "0 4px 16px rgba(47, 58, 52, 0.08)",
  },
});
