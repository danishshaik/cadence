import React, { useMemo } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Slider } from "@expo/ui/jetpack-compose";

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
  maximumTrackTintColor,
  thumbTintColor,
  style,
  hostStyle,
}: ExpoSliderProps) {
  const flattenedStyle = StyleSheet.flatten(style);
  const hostMergedStyle = flattenedStyle
    ? [flattenedStyle, hostStyle]
    : hostStyle;

  const steps = useMemo(() => {
    if (!step || step <= 0) return 0;
    return Math.round((maximumValue - minimumValue) / step) - 1;
  }, [minimumValue, maximumValue, step]);

  const elementColors = useMemo(
    () => ({
      activeTrackColor: minimumTrackTintColor,
      inactiveTrackColor: maximumTrackTintColor,
      thumbColor: thumbTintColor,
    }),
    [minimumTrackTintColor, maximumTrackTintColor, thumbTintColor]
  );

  return (
    <View style={[styles.host, hostMergedStyle]}>
      <Slider
        value={value}
        min={minimumValue}
        max={maximumValue}
        steps={steps}
        onValueChange={onValueChange}
        elementColors={elementColors}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    height: 40,
  },
});
