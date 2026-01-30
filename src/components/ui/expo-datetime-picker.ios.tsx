import React, { useMemo } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { DatePicker, Host } from "@expo/ui/swift-ui";
import { datePickerStyle, tint } from "@expo/ui/swift-ui/modifiers";

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

  const clampDate = (date: Date) => {
    let next = date;
    if (minimumDate && next < minimumDate) next = minimumDate;
    if (maximumDate && next > maximumDate) next = maximumDate;
    return next;
  };

  const displayedComponents = useMemo((): ("date" | "hourAndMinute")[] => {
    if (mode === "time") return ["hourAndMinute"];
    if (mode === "date") return ["date"];
    return ["date", "hourAndMinute"];
  }, [mode]);

  const pickerStyle = useMemo(() => {
    if (display === "spinner") return "wheel";
    if (display === "inline") return "graphical";
    return "automatic";
  }, [display]);

  const modifiers = useMemo(() => {
    const mods = [datePickerStyle(pickerStyle)];
    if (accentColor) {
      mods.push(tint(accentColor));
    }
    return mods;
  }, [pickerStyle, accentColor]);

  return (
    <View style={hostMergedStyle}>
      <Host>
        <DatePicker
          title=""
          selection={value}
          range={{ start: minimumDate, end: maximumDate }}
          displayedComponents={displayedComponents}
          modifiers={modifiers}
          onDateChange={(date) => onChange(clampDate(date))}
        />
      </Host>
    </View>
  );
}
