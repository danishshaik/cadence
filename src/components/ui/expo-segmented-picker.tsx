import React from "react";
import {
  LayoutChangeEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

export type ExpoSegmentedPickerOption = {
  id: string;
  label: string;
};

export type ExpoSegmentedPickerProps = {
  options: ExpoSegmentedPickerOption[];
  selectedId: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  accentColor?: string;
  surfaceColor?: string;
  textPrimaryColor?: string;
  textSecondaryColor?: string;
  style?: StyleProp<ViewStyle>;
  onLayout?: (event: LayoutChangeEvent) => void;
};

const isIOS = process.env.EXPO_OS === "ios";

export function ExpoSegmentedPicker({
  options,
  selectedId,
  onChange,
  disabled,
  accentColor = "#0F172A",
  surfaceColor = "#F3F4F6",
  textPrimaryColor = "#FFFFFF",
  textSecondaryColor = "#6B7280",
  style,
  onLayout,
}: ExpoSegmentedPickerProps) {
  return (
    <View style={[styles.container, { backgroundColor: surfaceColor }, style]} onLayout={onLayout}>
      {options.map((option) => {
        const isSelected = option.id === selectedId;
        return (
          <Pressable
            key={option.id}
            onPress={() => {
              if (disabled) return;
              onChange(option.id);
            }}
            style={[
              styles.segment,
              isSelected && { backgroundColor: accentColor },
              disabled && styles.segmentDisabled,
            ]}
            disabled={disabled}
          >
            <Text
              style={[
                styles.segmentText,
                { color: textSecondaryColor },
                isSelected && { color: textPrimaryColor },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 4,
    borderRadius: 12,
    borderCurve: "continuous",
    padding: 4,
    alignSelf: "center",
    width: "100%",
  },
  segment: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  segmentDisabled: {
    opacity: 0.7,
  },
  segmentText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
  },
});
