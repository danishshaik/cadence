import React, { useState } from "react";
import {
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  Pressable,
  Text,
  Modal,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

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

const isIOS = Platform.OS === "ios";
const isAndroid = Platform.OS === "android";

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
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);
  
  const flattenedStyle = StyleSheet.flatten(style);
  const hostMergedStyle = flattenedStyle ? [flattenedStyle, hostStyle] : hostStyle;

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (isAndroid) {
      setShowAndroidPicker(false);
    }
    
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  if (isAndroid) {
    // Android uses a modal trigger
    const label =
      mode === "time"
        ? value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : value.toLocaleDateString();

    return (
      <View style={hostMergedStyle}>
        <Pressable
          onPress={() => setShowAndroidPicker(true)}
          style={{
            padding: 10,
            backgroundColor: "#f0f0f0",
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 16, color: textColor || "#000" }}>{label}</Text>
        </Pressable>
        {showAndroidPicker && (
          <DateTimePicker
            value={value}
            mode={mode}
            display={display || "default"}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={handleChange}
          />
        )}
      </View>
    );
  }

  // iOS renders inline by default or as requested
  return (
    <View style={hostMergedStyle}>
      <DateTimePicker
        value={value}
        mode={mode}
        display={display || "default"}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        onChange={handleChange}
        themeVariant={textColor ? "light" : undefined} // basic theme support
        accentColor={accentColor}
        style={{ alignSelf: 'flex-start' }} // iOS picker needs this sometimes to not stretch weirdly
      />
    </View>
  );
}