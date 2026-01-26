import React, { useEffect } from "react";
import { View, Text, StyleSheet, useWindowDimensions, Switch } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
  interpolate,
  interpolateColor,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, shadows } from "@theme";
import { useLogArthritis } from "./log-arthritis-provider";

const MIN_STIFFNESS = 0;
const MAX_STIFFNESS = 10;
const isIOS = process.env.EXPO_OS === "ios";

export function SensationStep() {
  const { formData, updateFormData } = useLogArthritis();
  const { width, height } = useWindowDimensions();

  const normalizedValue = useSharedValue(
    (formData.stiffness - MIN_STIFFNESS) / (MAX_STIFFNESS - MIN_STIFFNESS)
  );
  const isDragging = useSharedValue(false);
  const pulseScale = useSharedValue(1);
  const tremor = useSharedValue(0);
  const lastStiffness = useSharedValue(formData.stiffness);

  // Check if it's morning (before 10 AM)
  const isMorningTime = new Date().getHours() < 10;

  useEffect(() => {
    // Gentle pulse for healthy state
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 2600, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Tremor for stiff state
    tremor.value = withRepeat(
      withSequence(
        withTiming(-1, { duration: 60, easing: Easing.linear }),
        withTiming(1, { duration: 60, easing: Easing.linear })
      ),
      -1,
      true
    );
  }, []);

  const triggerHaptic = (intensity: "light" | "medium" | "heavy") => {
    const style =
      intensity === "heavy"
        ? Haptics.ImpactFeedbackStyle.Heavy
        : intensity === "medium"
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light;
    Haptics.impactAsync(style);
  };

  const updateStiffness = (value: number) => {
    const stiffness = Math.round(value * (MAX_STIFFNESS - MIN_STIFFNESS) + MIN_STIFFNESS);
    updateFormData({ stiffness });
  };

  const sliderWidth = Math.min(320, width - 64);
  const stageWidth = Math.min(width * 0.9, 360);
  const stageHeight = Math.max(150, Math.min(height * 0.26, 220));
  const maxBallSize = Math.min(stageWidth * 0.6, stageHeight * 0.85, 180);
  const minBallSize = Math.max(80, stageHeight * 0.4);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
    })
    .onUpdate((e) => {
      const newValue = Math.max(0, Math.min(1, e.x / sliderWidth));
      const newStiffness = Math.round(
        newValue * (MAX_STIFFNESS - MIN_STIFFNESS) + MIN_STIFFNESS
      );

      if (lastStiffness.value !== newStiffness) {
        lastStiffness.value = newStiffness;
        const intensity = newStiffness > 7 ? "heavy" : newStiffness > 4 ? "medium" : "light";
        runOnJS(triggerHaptic)(intensity);
        runOnJS(updateStiffness)(newValue);
      }

      normalizedValue.value = newValue;
    })
    .onEnd(() => {
      isDragging.value = false;
      runOnJS(updateStiffness)(normalizedValue.value);
    });

  const tapGesture = Gesture.Tap().onEnd((e) => {
    const newValue = Math.max(0, Math.min(1, e.x / sliderWidth));
    normalizedValue.value = withTiming(newValue, { duration: 200 });
    const stiffness = Math.round(newValue * (MAX_STIFFNESS - MIN_STIFFNESS) + MIN_STIFFNESS);
    const intensity = stiffness > 7 ? "heavy" : stiffness > 4 ? "medium" : "light";
    runOnJS(triggerHaptic)(intensity);
    runOnJS(updateStiffness)(newValue);
  });

  const gesture = Gesture.Race(panGesture, tapGesture);

  // Joint ball animation - smooth when flexible, spiky/vibrating when stiff
  const ballStyle = useAnimatedStyle(() => {
    // Size interpolation - larger when flexible (healthy), smaller when stiff
    const size = interpolate(normalizedValue.value, [0, 1], [maxBallSize, minBallSize]);

    // Pulse effect - more pronounced when healthy
    const pulseMix = interpolate(normalizedValue.value, [0, 0.5, 1], [pulseScale.value, 1.01, 1]);

    // Jitter/tremor - increases with stiffness
    const jitter = interpolate(normalizedValue.value, [0, 0.5, 1], [0, 2, 8]);

    // Color gradient from sage green (healthy) to muted orange (stiff)
    const color = interpolateColor(
      normalizedValue.value,
      [0, 0.5, 1],
      [colors.arthritis, colors.arthritisMuted, colors.arthritisAlert]
    );

    // Shadow intensity increases with stiffness (glow effect)
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

  const fillStyle = useAnimatedStyle(() => ({
    width: `${normalizedValue.value * 100}%`,
    backgroundColor: interpolateColor(
      normalizedValue.value,
      [0, 0.5, 1],
      [colors.arthritis, colors.arthritis, colors.arthritisAlert]
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    left: normalizedValue.value * sliderWidth - 14,
    transform: [{ scale: isDragging.value ? 1.15 : 1 }],
    backgroundColor: interpolateColor(
      normalizedValue.value,
      [0, 0.6, 1],
      [colors.arthritis, colors.arthritis, colors.arthritisAlert]
    ),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>How are your joints moving right now?</Text>
        <Text style={styles.subtitle}>Slide to show how flexible or locked you feel</Text>
      </View>

      <View style={[styles.ballStage, { width: stageWidth, height: stageHeight }]}>
        <Animated.View style={[styles.jointBall, ballStyle]} />
      </View>

      <View style={styles.bottomGroup}>
        <View style={styles.labelContainer}>
          <Text style={styles.stiffnessNumber}>{formData.stiffness}</Text>
          <Text style={styles.stiffnessLabel}>{formData.stiffnessLabel}</Text>
        </View>

        <View style={styles.sliderWrapper}>
          <GestureDetector gesture={gesture}>
            <View style={[styles.sliderTrack, { width: sliderWidth }]}>
              <Animated.View style={[styles.sliderFill, fillStyle]} />
              <Animated.View style={[styles.sliderThumb, thumbStyle]} />
            </View>
          </GestureDetector>

          <View style={[styles.sliderLabels, { width: sliderWidth }]}>
            <Text style={styles.sliderLabelText}>Fluid & Flexible</Text>
            <Text style={styles.sliderLabelText}>Locked & Rigid</Text>
          </View>
        </View>

        {isMorningTime && (
          <View style={styles.morningRow}>
            <Text style={styles.morningLabel}>Morning Stiffness</Text>
            <Switch
              value={formData.morningStiffness}
              onValueChange={(value) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                updateFormData({ morningStiffness: value });
              }}
              trackColor={{ false: colors.arthritisBorder, true: colors.arthritisMuted }}
              thumbColor={formData.morningStiffness ? colors.arthritis : "#FFFFFF"}
              ios_backgroundColor={colors.arthritisBorder}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
  },
  header: {
    alignItems: "center",
  },
  title: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 24,
    fontWeight: "700",
    color: colors.arthritisText,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    color: colors.arthritisTextSecondary,
    marginBottom: 16,
    textAlign: "center",
  },
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
  bottomGroup: {
    alignItems: "center",
    width: "100%",
  },
  labelContainer: {
    alignItems: "center",
    marginBottom: 16,
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
    height: 8,
    backgroundColor: "rgba(119, 221, 119, 0.2)",
    borderRadius: 8,
    borderCurve: "continuous",
    overflow: "visible",
  },
  sliderFill: {
    height: "100%",
    borderRadius: 8,
    borderCurve: "continuous",
  },
  sliderThumb: {
    position: "absolute",
    top: -10,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderCurve: "continuous",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    ...shadows.sm,
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
  morningRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderCurve: "continuous",
    ...shadows.sm,
  },
  morningLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
    color: colors.arthritisText,
  },
});
