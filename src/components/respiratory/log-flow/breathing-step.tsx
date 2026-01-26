import React, { useEffect } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
  interpolate,
  interpolateColor,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { colors } from "@theme";
import { useLogRespiratory } from "./log-respiratory-provider";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const MIN_CONSTRICTION = 1;
const MAX_CONSTRICTION = 10;

export function BreathingStep() {
  const { formData, updateFormData } = useLogRespiratory();

  const normalizedValue = useSharedValue(
    (formData.constriction - MIN_CONSTRICTION) / (MAX_CONSTRICTION - MIN_CONSTRICTION)
  );
  const isDragging = useSharedValue(false);
  const pulseScale = useSharedValue(1);

  // Gentle pulsing animation for the ring
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
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

  const sliderWidth = 280;

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
    })
    .onUpdate((e) => {
      const newValue = Math.max(0, Math.min(1, e.x / sliderWidth));
      const oldConstriction = Math.round(
        normalizedValue.value * (MAX_CONSTRICTION - MIN_CONSTRICTION) + MIN_CONSTRICTION
      );
      const newConstriction = Math.round(
        newValue * (MAX_CONSTRICTION - MIN_CONSTRICTION) + MIN_CONSTRICTION
      );

      if (oldConstriction !== newConstriction) {
        const intensity = newConstriction > 7 ? "heavy" : newConstriction > 4 ? "medium" : "light";
        runOnJS(triggerHaptic)(intensity);
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

  // Animated ring properties - constricts as value increases
  const ringProps = useAnimatedProps(() => {
    // Ring gets smaller and thicker as constriction increases
    const baseRadius = interpolate(normalizedValue.value, [0, 1], [70, 35]);
    const strokeWidth = interpolate(normalizedValue.value, [0, 1], [8, 25]);
    const radius = baseRadius * pulseScale.value;

    return {
      r: radius,
      strokeWidth: strokeWidth,
    };
  });

  // Ring color animation
  const ringStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      normalizedValue.value,
      [0, 0.4, 0.7, 1],
      [colors.respiratory, colors.respiratoryMuted, colors.respiratoryAlert, colors.respiratoryAlert]
    );
    return { stroke: color };
  });

  // Slider fill style
  const fillStyle = useAnimatedStyle(() => ({
    width: `${normalizedValue.value * 100}%`,
    backgroundColor: interpolateColor(
      normalizedValue.value,
      [0, 0.4, 0.7, 1],
      [colors.respiratory, colors.respiratoryMuted, colors.respiratoryAlert, colors.respiratoryAlert]
    ),
  }));

  // Thumb position
  const thumbStyle = useAnimatedStyle(() => ({
    left: normalizedValue.value * sliderWidth - 14,
    transform: [{ scale: isDragging.value ? 1.2 : 1 }],
    backgroundColor: interpolateColor(
      normalizedValue.value,
      [0, 0.5, 1],
      [colors.respiratory, colors.respiratoryMuted, colors.respiratoryAlert]
    ),
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How does your chest feel?</Text>
      <Text style={styles.subtitle}>Drag to indicate breathing quality</Text>

      {/* Animated airway ring */}
      <View style={styles.ringContainer}>
        <Svg width={180} height={180} viewBox="0 0 180 180">
          <Defs>
            <RadialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={colors.respiratory} stopOpacity={0.2} />
              <Stop offset="100%" stopColor={colors.respiratory} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          {/* Glow effect */}
          <Circle cx="90" cy="90" r="80" fill="url(#ringGlow)" />
          {/* Main ring */}
          <AnimatedCircle
            cx="90"
            cy="90"
            fill="none"
            stroke={colors.respiratory}
            animatedProps={ringProps}
            strokeLinecap="round"
          />
        </Svg>
      </View>

      {/* Constriction label */}
      <View style={styles.labelContainer}>
        <Text style={styles.constrictionNumber}>{formData.constriction}</Text>
        <Text style={styles.constrictionLabel}>{formData.constrictionLabel}</Text>
      </View>

      {/* Slider */}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: "center",
  },
  ringContainer: {
    width: 180,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  labelContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  constrictionNumber: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 48,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  constrictionLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 18,
    fontWeight: "500",
    color: colors.textSecondary,
    marginTop: 4,
  },
  sliderWrapper: {
    alignItems: "center",
  },
  sliderTrack: {
    height: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 4,
    overflow: "visible",
  },
  sliderFill: {
    height: "100%",
    borderRadius: 4,
  },
  sliderThumb: {
    position: "absolute",
    top: -10,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  sliderLabelText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    color: colors.textSecondary,
  },
});
