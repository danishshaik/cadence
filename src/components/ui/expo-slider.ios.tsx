import React, { useMemo } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Host, Slider } from "@expo/ui/swift-ui";
import { tint, frame } from "@expo/ui/swift-ui/modifiers";

export type ExpoSliderProps = {
  value: number;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  style?: StyleProp<ViewStyle>;
  hostStyle?: StyleProp<ViewStyle>;
};

export function ExpoSlider({
  value,
  minimumValue = 0,
  maximumValue = 1,
  step,
  onValueChange,
  minimumTrackTintColor,
  style,
  hostStyle,
}: ExpoSliderProps) {
  const flattenedStyle = StyleSheet.flatten(style);
  const hostMergedStyle = flattenedStyle
    ? [flattenedStyle, hostStyle]
    : hostStyle;

  const modifiers = useMemo(() => {
    const mods = [frame({ maxWidth: 10000, maxHeight: 40 })];
    if (minimumTrackTintColor) {
      mods.push(tint(minimumTrackTintColor));
    }
    return mods;
  }, [minimumTrackTintColor]);

  return (
    <View style={hostMergedStyle}>
      <Host style={{ flex: 1 }}>
        <Slider
          value={value}
          min={minimumValue}
          max={maximumValue}
          step={step}
          onValueChange={onValueChange}
          modifiers={modifiers}
        />
      </Host>
    </View>
  );
}
