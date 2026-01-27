import React, { useCallback, useMemo } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

type HostComponent = React.ComponentType<{
  children: React.ReactNode;
  matchContents?: boolean | { vertical?: boolean; horizontal?: boolean };
  style?: StyleProp<ViewStyle>;
}>;

type SwiftDatePickerComponent = React.ComponentType<{
  selection?: Date;
  range?: { start?: Date; end?: Date };
  displayedComponents?: ("date" | "hourAndMinute")[];
  onDateChange?: (date: Date) => void;
  modifiers?: unknown[];
}>;

type ComposeDateTimePickerComponent = React.ComponentType<{
  initialDate?: string | null;
  displayedComponents?: "date" | "hourAndMinute" | "dateAndTime";
  color?: string;
  onDateSelected?: (date: Date) => void;
  modifiers?: unknown[];
}>;

type DatePickerStyleFactory = (style: "automatic" | "compact" | "graphical" | "wheel") => unknown;
type TintFactory = (color: string) => unknown;
type ForegroundStyleFactory = (style: string) => unknown;

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

const isIOS = process.env.EXPO_OS === "ios";
const isAndroid = process.env.EXPO_OS === "android";

function clampDate(date: Date, min?: Date, max?: Date) {
  const time = date.getTime();
  if (min && time < min.getTime()) return min;
  if (max && time > max.getTime()) return max;
  return date;
}

function displayToPickerStyle(display?: ExpoDateTimePickerDisplay) {
  if (display === "spinner") return "wheel" as const;
  if (display === "inline") return "graphical" as const;
  return "automatic" as const;
}

export function ExpoDateTimePicker({
  value,
  mode,
  onChange,
  minimumDate,
  maximumDate,
  display,
  accentColor,
  textColor,
  hostStyle,
  style,
}: ExpoDateTimePickerProps) {
  const flattenedStyle = StyleSheet.flatten(style);
  const hostMergedStyle = flattenedStyle ? [flattenedStyle, hostStyle] : hostStyle;

  const handleChange = useCallback(
    (nextDate: Date) => {
      onChange(clampDate(nextDate, minimumDate, maximumDate));
    },
    [maximumDate, minimumDate, onChange]
  );

  const iosComponents = useMemo(() => {
    if (mode === "time") return ["hourAndMinute"] as ("date" | "hourAndMinute")[];
    if (mode === "datetime") return ["date", "hourAndMinute"] as ("date" | "hourAndMinute")[];
    return ["date"] as ("date" | "hourAndMinute")[];
  }, [mode]);

  const androidComponents = useMemo(() => {
    if (mode === "time") return "hourAndMinute" as const;
    if (mode === "datetime") return "dateAndTime" as const;
    return "date" as const;
  }, [mode]);

  if (isIOS) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const swift = require("@expo/ui/swift-ui") as {
      Host: HostComponent;
      DatePicker: SwiftDatePickerComponent;
    };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const modifiersModule = require("@expo/ui/swift-ui/modifiers") as {
      datePickerStyle: DatePickerStyleFactory;
      tint: TintFactory;
      foregroundStyle: ForegroundStyleFactory;
    };

    const modifiers: unknown[] = [];
    modifiers.push(modifiersModule.datePickerStyle(displayToPickerStyle(display)));
    if (accentColor) {
      modifiers.push(modifiersModule.tint(accentColor));
    }
    if (textColor) {
      modifiers.push(modifiersModule.foregroundStyle(textColor));
    }

    return (
      <swift.Host matchContents style={hostMergedStyle}>
        <swift.DatePicker
          selection={value}
          range={{ start: minimumDate, end: maximumDate }}
          displayedComponents={iosComponents}
          onDateChange={handleChange}
          modifiers={modifiers}
        />
      </swift.Host>
    );
  }

  if (isAndroid) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const compose = require("@expo/ui/jetpack-compose") as {
      Host: HostComponent;
      DateTimePicker: ComposeDateTimePickerComponent;
      fillMaxWidth: (fraction?: number) => unknown;
    };

    // Compose picker treats `initialDate` as its controlled value, so re-key to refresh.
    const pickerKey = `${mode}-${value.toISOString()}`;

    return (
      <compose.Host matchContents style={hostMergedStyle}>
        <compose.DateTimePicker
          key={pickerKey}
          initialDate={value.toISOString()}
          displayedComponents={androidComponents}
          color={accentColor}
          onDateSelected={handleChange}
          modifiers={[compose.fillMaxWidth()]}
        />
      </compose.Host>
    );
  }

  // Minimal fallback without third-party dependencies.
  const label =
    mode === "time"
      ? value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : value.toLocaleDateString();

  return (
    <View style={hostMergedStyle}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Pressable onPress={() => handleChange(new Date(value.getTime() - 60 * 60 * 1000))}>
          <Text>-</Text>
        </Pressable>
        <Text>{label}</Text>
        <Pressable onPress={() => handleChange(new Date(value.getTime() + 60 * 60 * 1000))}>
          <Text>+</Text>
        </Pressable>
      </View>
    </View>
  );
}
