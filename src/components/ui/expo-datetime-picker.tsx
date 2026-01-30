import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";

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

export function ExpoDateTimePicker(_props: ExpoDateTimePickerProps) {
  return <View />;
}
