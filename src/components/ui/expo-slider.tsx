import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Slider from "@react-native-community/slider";

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
  onSlidingComplete,
  minimumTrackTintColor,
  maximumTrackTintColor,
  thumbTintColor,
  style,
  hostStyle,
}: ExpoSliderProps) {
  const flattenedStyle = StyleSheet.flatten(style);
  const hostMergedStyle = flattenedStyle ? [flattenedStyle, hostStyle] : hostStyle;

  return (
    <View style={hostMergedStyle}>
      <Slider
        value={value}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        onValueChange={onValueChange}
        onSlidingComplete={onSlidingComplete}
        minimumTrackTintColor={minimumTrackTintColor}
        maximumTrackTintColor={maximumTrackTintColor}
        thumbTintColor={thumbTintColor}
        style={styles.slider}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  slider: {
    width: "100%",
    height: 40,
  },
});