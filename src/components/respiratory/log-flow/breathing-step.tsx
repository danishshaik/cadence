import React, { useEffect } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
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
import { useLogRespiratory } from "./log-respiratory-provider";

const MIN_CONSTRICTION = 1;
const MAX_CONSTRICTION = 10;
const isIOS = process.env.EXPO_OS === "ios";

export function BreathingStep() {
  const { formData, updateFormData } = useLogRespiratory();
  const { width, height } = useWindowDimensions();

  const normalizedValue = useSharedValue(
    (formData.constriction - MIN_CONSTRICTION) / (MAX_CONSTRICTION - MIN_CONSTRICTION)
  );
  const isDragging = useSharedValue(false);
  const pulseScale = useSharedValue(1);
  const tremor = useSharedValue(0);
  const lastConstriction = useSharedValue(formData.constriction);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    tremor.value = withRepeat(
      withSequence(
        withTiming(-1, { duration: 70, easing: Easing.linear }),
        withTiming(1, { duration: 70, easing: Easing.linear })
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

  const updateConstriction = (value: number) => {
    const constriction = Math.round(value * (MAX_CONSTRICTION - MIN_CONSTRICTION) + MIN_CONSTRICTION);
    updateFormData({ constriction });
  };

  const sliderWidth = Math.min(320, width - 64);
  const stageWidth = Math.min(width * 0.9, 360);
  const stageHeight = Math.max(150, Math.min(height * 0.26, 220));
  const maxCircleSize = Math.min(stageWidth * 0.85, stageHeight * 0.9, 280);
  const minCircleSize = Math.max(56, stageHeight * 0.22);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
    })
    .onUpdate((e) => {
      const newValue = Math.max(0, Math.min(1, e.x / sliderWidth));
      const newConstriction = Math.round(
        newValue * (MAX_CONSTRICTION - MIN_CONSTRICTION) + MIN_CONSTRICTION
      );

      if (lastConstriction.value !== newConstriction) {
        lastConstriction.value = newConstriction;
        const intensity = newConstriction > 7 ? "heavy" : newConstriction > 4 ? "medium" : "light";
        runOnJS(triggerHaptic)(intensity);
        runOnJS(updateConstriction)(newValue);
      }

      normalizedValue.value = newValue;
    })
    .onEnd(() => {
      isDragging.value = false;
      runOnJS(updateConstriction)(normalizedValue.value);
    });

  const tapGesture = Gesture.Tap().onEnd((e) => {
    const newValue = Math.max(0, Math.min(1, e.x / sliderWidth));
    normalizedValue.value = withTiming(newValue, { duration: 200 });
    const constriction = Math.round(newValue * (MAX_CONSTRICTION - MIN_CONSTRICTION) + MIN_CONSTRICTION);
    const intensity = constriction > 7 ? "heavy" : constriction > 4 ? "medium" : "light";
    runOnJS(triggerHaptic)(intensity);
    runOnJS(updateConstriction)(newValue);
  });

  const gesture = Gesture.Race(panGesture, tapGesture);

  const circleStyle = useAnimatedStyle(() => {
    const size = interpolate(normalizedValue.value, [0, 1], [maxCircleSize, minCircleSize]);
    const baseScale = interpolate(normalizedValue.value, [0, 1], [1.05, 0.7]);
    const pulseMix = interpolate(normalizedValue.value, [0, 0.6, 1], [pulseScale.value, 1, 1]);
    const jitter = interpolate(normalizedValue.value, [0, 0.7, 1], [0, 1.5, 6]);
    const color = interpolateColor(
      normalizedValue.value,
      [0, 0.5, 1],
      [colors.respiratory, colors.respiratoryIndigo, colors.respiratoryAlert]
    );

    return {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      opacity: interpolate(normalizedValue.value, [0, 1], [0.35, 0.6]),
      transform: [
        { scale: baseScale * pulseMix },
        { translateX: tremor.value * jitter },
        { translateY: tremor.value * jitter },
      ],
    };
  });

  const fillStyle = useAnimatedStyle(() => ({
    width: `${normalizedValue.value * 100}%`,
    backgroundColor: interpolateColor(
      normalizedValue.value,
      [0, 0.5, 1],
      [colors.respiratoryIndigo, colors.respiratoryIndigo, colors.respiratoryAlert]
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    left: normalizedValue.value * sliderWidth - 16,
    transform: [{ scale: isDragging.value ? 1.15 : 1 }],
    backgroundColor: interpolateColor(
      normalizedValue.value,
      [0, 0.6, 1],
      [colors.respiratoryIndigo, colors.respiratoryIndigo, colors.respiratoryAlert]
    ),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>How much air are you getting?</Text>
        <Text style={styles.subtitle}>Slide left for open, right for tight</Text>
      </View>

      <View style={[styles.bubbleStage, { width: stageWidth, height: stageHeight }]}>
        <Animated.View style={[styles.breathCircle, circleStyle]} />
      </View>

      <View style={styles.bottomGroup}>
        <View style={styles.labelContainer}>
          <Text style={styles.constrictionNumber}>{formData.constriction}</Text>
          <Text style={styles.constrictionLabel}>{formData.constrictionLabel}</Text>
        </View>

        <View style={styles.sliderWrapper}>
          <GestureDetector gesture={gesture}>
            <View style={[styles.sliderTrack, { width: sliderWidth }]}>
              <Animated.View style={[styles.sliderFill, fillStyle]} />
              <Animated.View style={[styles.sliderThumb, thumbStyle]} />
            </View>
          </GestureDetector>

          <View style={[styles.sliderLabels, { width: sliderWidth }]}>
            <Text style={styles.sliderLabelText}>Open</Text>
            <Text style={styles.sliderLabelText}>Tight</Text>
          </View>
        </View>
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
    fontFamily: isIOS ? "SF Pro Display" : "sans-serif",
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: "center",
  },
  bubbleStage: {
    alignItems: "center",
    justifyContent: "center",
  },
  breathCircle: {
    borderCurve: "continuous",
    ...shadows.sm,
  },
  bottomGroup: {
    alignItems: "center",
  },
  labelContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  constrictionNumber: {
    fontFamily: isIOS ? "SF Pro Display" : "sans-serif",
    fontSize: 44,
    fontWeight: "700",
    color: colors.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  constrictionLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 17,
    fontWeight: "500",
    color: colors.textSecondary,
    marginTop: 4,
  },
  sliderWrapper: {
    alignItems: "center",
  },
  sliderTrack: {
    height: 10,
    backgroundColor: "rgba(92, 107, 192, 0.12)",
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
    width: 32,
    height: 32,
    borderRadius: 16,
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
    fontSize: 13,
    color: colors.textSecondary,
  },
});
