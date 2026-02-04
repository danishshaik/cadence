import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

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

export function ExpoSlider({ style, hostStyle }: ExpoSliderProps) {
  const flattenedStyle = StyleSheet.flatten(style);
  const hostMergedStyle = flattenedStyle ? [flattenedStyle, hostStyle] : hostStyle;

  return (
    <View style={hostMergedStyle}>
      <View style={styles.slider} />
    </View>
  );
}

const styles = StyleSheet.create({
  slider: {
    width: "100%",
    height: 40,
  },
});
