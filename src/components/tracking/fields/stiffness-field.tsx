import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { colors, shadows } from "@theme";
import { ExpoSlider } from "@/components/ui";
import { FieldProps } from "../types";
import { FieldWrapper } from "./field-wrapper";

const isIOS = process.env.EXPO_OS === "ios";

interface StiffnessFieldProps extends FieldProps<number> {
  min?: number;
  max?: number;
  leftLabel?: string;
  rightLabel?: string;
}

export function StiffnessField({
  value,
  onChange,
  min = 0,
  max = 10,
  leftLabel = "Fluid & Flexible",
  rightLabel = "Locked & Rigid",
  disabled,
  required,
  error,
  label,
  description,
}: StiffnessFieldProps) {
  const { width, height } = useWindowDimensions();
  const normalizedValue = useSharedValue((value - min) / (max - min));
  const pulseScale = useSharedValue(1);
  const tremor = useSharedValue(0);
  const lastValueRef = useRef(value);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 2600, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    tremor.value = withRepeat(
      withSequence(
        withTiming(-1, { duration: 60, easing: Easing.linear }),
        withTiming(1, { duration: 60, easing: Easing.linear })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    normalizedValue.value = (value - min) / (max - min);
  }, [value, min, max, normalizedValue]);

  const triggerHaptic = (intensity: "light" | "medium" | "heavy") => {
    const style =
      intensity === "heavy"
        ? Haptics.ImpactFeedbackStyle.Heavy
        : intensity === "medium"
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light;
    Haptics.impactAsync(style);
  };

  const sliderWidth = Math.min(320, width - 64);
  const stageWidth = Math.min(width * 0.9, 360);
  const stageHeight = Math.max(150, Math.min(height * 0.26, 220));
  const maxBallSize = Math.min(stageWidth * 0.6, stageHeight * 0.85, 180);
  const minBallSize = Math.max(80, stageHeight * 0.4);

  const ballStyle = useAnimatedStyle(() => {
    const size = interpolate(normalizedValue.value, [0, 1], [maxBallSize, minBallSize]);
    const pulseMix = interpolate(normalizedValue.value, [0, 0.5, 1], [pulseScale.value, 1.01, 1]);
    const jitter = interpolate(normalizedValue.value, [0, 0.5, 1], [0, 2, 8]);
    const color = interpolateColor(
      normalizedValue.value,
      [0, 0.5, 1],
      [colors.arthritis, colors.arthritisMuted, colors.arthritisAlert]
    );
    const shadowOpacity = interpolate(normalizedValue.value, [0, 1], [0.3, 0.5]);

    return {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      transform: [
        { scale: pulseMix },
        { translateX: tremor.value * jitter },
        { translateY: tremor.value * jitter },
      ],
      shadowOpacity,
    };
  });

  return (
    <FieldWrapper
      label={label}
      description={description}
      required={required}
      error={error}
      disabled={disabled}
    >
      <View style={[styles.ballStage, { width: stageWidth, height: stageHeight }]}>
        <Animated.View style={[styles.jointBall, ballStyle]} />
      </View>

      <View style={styles.labelContainer}>
        <Text selectable style={styles.stiffnessNumber}>{value}</Text>
        <Text selectable style={styles.stiffnessLabel}>
          {value <= 1
            ? "Fluid & Flexible"
            : value <= 3
            ? "Slightly Stiff"
            : value <= 5
            ? "Moderately Stiff"
            : value <= 7
            ? "Very Stiff"
            : value <= 9
            ? "Nearly Locked"
            : "Locked & Rigid"}
        </Text>
      </View>

      <View style={styles.sliderWrapper}>
        <ExpoSlider
          style={[styles.sliderTrack, { width: sliderWidth }]}
          minimumValue={min}
          maximumValue={max}
          step={1}
          value={value}
          onValueChange={(next) => {
            if (disabled) return;
            const rounded = Math.round(next);
            if (lastValueRef.current !== rounded) {
              lastValueRef.current = rounded;
              const intensity = rounded > 7 ? "heavy" : rounded > 4 ? "medium" : "light";
              triggerHaptic(intensity);
              onChange(rounded);
            }
            normalizedValue.value = (rounded - min) / (max - min);
          }}
          minimumTrackTintColor={colors.arthritis}
          maximumTrackTintColor={colors.arthritisSurface}
          thumbTintColor={colors.arthritis}
        />

        <View style={[styles.sliderLabels, { width: sliderWidth }]}>
          <Text selectable style={styles.sliderLabelText}>{leftLabel}</Text>
          <Text selectable style={styles.sliderLabelText}>{rightLabel}</Text>
        </View>
      </View>
    </FieldWrapper>
  );
}

const styles = StyleSheet.create({
  ballStage: {
    alignItems: "center",
    justifyContent: "center",
  },
  jointBall: {
    borderCurve: "continuous",
    shadowColor: colors.arthritis,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 8,
  },
  labelContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  stiffnessNumber: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 44,
    fontWeight: "700",
    color: colors.arthritisText,
    fontVariant: ["tabular-nums"],
  },
  stiffnessLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 17,
    fontWeight: "500",
    color: colors.arthritisTextSecondary,
    marginTop: 4,
  },
  sliderWrapper: {
    alignItems: "center",
  },
  sliderTrack: {
    height: 32,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  sliderLabelText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    fontWeight: "600",
    color: colors.arthritisTextSecondary,
  },
});
