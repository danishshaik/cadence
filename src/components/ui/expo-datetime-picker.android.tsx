import React, { useMemo } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { DateTimePicker } from "@expo/ui/jetpack-compose";

export type ExpoDateTimePickerMode = "date" | "time" | "datetime";
export type ExpoDateTimePickerDisplay = "default" | "spinner" | "inline";

export type ExpoDateTimePickerProps = {
  value: Date;
  mode: ExpoDateTimePickerMode;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  display?: ExpoDateTimePickerDisplay;
  accentColor?: string;
  textColor?: string;
  hostStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};

export function ExpoDateTimePicker({
  value,
  mode,
  onChange,
  minimumDate,
  maximumDate,
  display,
  accentColor,
  hostStyle,
  style,
}: ExpoDateTimePickerProps) {
  const flattenedStyle = StyleSheet.flatten(style);
  const hostMergedStyle = flattenedStyle
    ? [flattenedStyle, hostStyle]
    : hostStyle;

  const displayedComponents = useMemo(() => {
    if (mode === "time") return "hourAndMinute";
    if (mode === "date") return "date";
    return "dateAndTime";
  }, [mode]);

  const variant = useMemo(() => {
    if (display === "inline") return "input";
    return "picker";
  }, [display]);

  const clampDate = (date: Date) => {
    let next = date;
    if (minimumDate && next < minimumDate) next = minimumDate;
    if (maximumDate && next > maximumDate) next = maximumDate;
    return next;
  };

  return (
    <View style={hostMergedStyle}>
      <DateTimePicker
        initialDate={value.toISOString()}
        displayedComponents={displayedComponents}
        variant={variant}
        showVariantToggle={false}
        color={accentColor}
        onDateSelected={(date) => onChange(clampDate(date))}
      />
    </View>
  );
}
