import React from "react";
import { View, Text, StyleSheet, Platform, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  runOnJS,
  interpolate,
  interpolateColor,
  Easing,
} from "react-native-reanimated";
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Circle,
  Path,
  G,
} from "react-native-svg";
import * as Haptics from "expo-haptics";
import { colors } from "@theme";
import { useLogSkin } from "./log-skin-provider";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

const MIN_SEVERITY = 1;
const MAX_SEVERITY = 10;

export function SeverityStep() {
  const { formData, updateFormData } = useLogSkin();
  const { width: screenWidth } = useWindowDimensions();

  const sliderWidth = screenWidth - 80;
  const normalizedValue = useSharedValue((formData.severity - MIN_SEVERITY) / (MAX_SEVERITY - MIN_SEVERITY));
  const isDragging = useSharedValue(false);

  const triggerHaptic = (intensity: "light" | "medium" | "heavy") => {
    const style =
      intensity === "heavy"
        ? Haptics.ImpactFeedbackStyle.Heavy
        : intensity === "medium"
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light;
    Haptics.impactAsync(style);
  };

  const updateSeverity = (value: number) => {
    const severity = Math.round(value * (MAX_SEVERITY - MIN_SEVERITY) + MIN_SEVERITY);
    updateFormData({ severity });
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
    })
    .onUpdate((e) => {
      const newValue = Math.max(0, Math.min(1, e.x / sliderWidth));
      const oldSeverity = Math.round(normalizedValue.value * (MAX_SEVERITY - MIN_SEVERITY) + MIN_SEVERITY);
      const newSeverity = Math.round(newValue * (MAX_SEVERITY - MIN_SEVERITY) + MIN_SEVERITY);

      if (oldSeverity !== newSeverity) {
        const intensity = newSeverity > 7 ? "heavy" : newSeverity > 4 ? "medium" : "light";
        runOnJS(triggerHaptic)(intensity);
      }

      normalizedValue.value = newValue;
    })
    .onEnd(() => {
      isDragging.value = false;
      runOnJS(updateSeverity)(normalizedValue.value);
    });

  const tapGesture = Gesture.Tap()
    .onEnd((e) => {
      const newValue = Math.max(0, Math.min(1, e.x / sliderWidth));
      normalizedValue.value = withTiming(newValue, { duration: 200 });
      const severity = Math.round(newValue * (MAX_SEVERITY - MIN_SEVERITY) + MIN_SEVERITY);
      const intensity = severity > 7 ? "heavy" : severity > 4 ? "medium" : "light";
      runOnJS(triggerHaptic)(intensity);
      runOnJS(updateSeverity)(newValue);
    });

  const gesture = Gesture.Race(panGesture, tapGesture);

  // Animated shape style - morphs based on severity
  const shapeStyle = useAnimatedStyle(() => {
    const scale = interpolate(normalizedValue.value, [0, 0.5, 1], [1, 1.1, 1.2]);
    return {
      transform: [{ scale }],
    };
  });

  // Shape color interpolation
  const shapeColorStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      normalizedValue.value,
      [0, 0.3, 0.7, 1],
      [colors.skinCalm, colors.skinMuted, colors.skinAlert, colors.skinAlert]
    );
    return { backgroundColor };
  });

  // Slider fill style
  const fillStyle = useAnimatedStyle(() => ({
    width: `${normalizedValue.value * 100}%`,
    backgroundColor: interpolateColor(
      normalizedValue.value,
      [0, 0.3, 0.7, 1],
      [colors.skinCalm, colors.skin, colors.skinAlert, colors.skinAlert]
    ),
  }));

  // Thumb position
  const thumbStyle = useAnimatedStyle(() => ({
    left: normalizedValue.value * sliderWidth - 14,
    transform: [{ scale: isDragging.value ? 1.2 : 1 }],
  }));

  // Label animation
  const severityLabel = formData.severityLabel;
  const currentSeverity = formData.severity;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How does your skin feel?</Text>
      <Text style={styles.subtitle}>Drag to indicate sensation level</Text>

      {/* Morphing shape visualization */}
      <View style={styles.shapeContainer}>
        <Animated.View style={[styles.shapeWrapper, shapeStyle]}>
          <Svg width={160} height={160} viewBox="0 0 160 160">
            <Defs>
              <RadialGradient id="calmGradient" cx="40%" cy="30%" r="60%">
                <Stop offset="0%" stopColor={colors.skinCalm} stopOpacity={0.9} />
                <Stop offset="100%" stopColor={colors.skin} stopOpacity={0.7} />
              </RadialGradient>
              <RadialGradient id="alertGradient" cx="40%" cy="30%" r="60%">
                <Stop offset="0%" stopColor={colors.skinAlert} stopOpacity={0.9} />
                <Stop offset="50%" stopColor={colors.skinAlert} stopOpacity={0.8} />
                <Stop offset="100%" stopColor="#D46B64" stopOpacity={0.9} />
              </RadialGradient>
            </Defs>

            {/* Base shape - smooth when calm, bumpy when inflamed */}
            {currentSeverity <= 3 ? (
              // Smooth water droplet
              <G>
                <Path
                  d="M 80 30
                     C 80 30 50 70 50 100
                     C 50 125 63 140 80 140
                     C 97 140 110 125 110 100
                     C 110 70 80 30 80 30 Z"
                  fill="url(#calmGradient)"
                />
                {/* Highlight */}
                <Circle cx="65" cy="85" r="8" fill="#FFFFFF" opacity={0.4} />
                <Circle cx="70" cy="90" r="4" fill="#FFFFFF" opacity={0.3} />
              </G>
            ) : currentSeverity <= 6 ? (
              // Transitional - slightly bumpy sphere
              <G>
                <Circle cx="80" cy="85" r="50" fill="url(#calmGradient)" />
                {/* Some texture bumps */}
                <Circle cx="55" cy="70" r="6" fill={colors.skinAlert} opacity={0.3} />
                <Circle cx="100" cy="80" r="5" fill={colors.skinAlert} opacity={0.25} />
                <Circle cx="70" cy="110" r="4" fill={colors.skinAlert} opacity={0.2} />
                {/* Highlight */}
                <Circle cx="65" cy="70" r="10" fill="#FFFFFF" opacity={0.3} />
              </G>
            ) : (
              // Inflamed prickly sphere
              <G>
                <Circle cx="80" cy="85" r="50" fill="url(#alertGradient)" />
                {/* Prickly texture bumps */}
                <Circle cx="50" cy="70" r="8" fill={colors.skinAlert} opacity={0.6} />
                <Circle cx="110" cy="75" r="7" fill={colors.skinAlert} opacity={0.5} />
                <Circle cx="60" cy="110" r="6" fill={colors.skinAlert} opacity={0.55} />
                <Circle cx="95" cy="115" r="7" fill={colors.skinAlert} opacity={0.5} />
                <Circle cx="75" cy="50" r="5" fill={colors.skinAlert} opacity={0.45} />
                <Circle cx="100" cy="100" r="6" fill={colors.skinAlert} opacity={0.5} />
                <Circle cx="55" cy="90" r="5" fill={colors.skinAlert} opacity={0.4} />
                {/* Slight highlight */}
                <Circle cx="65" cy="65" r="8" fill="#FFFFFF" opacity={0.15} />
              </G>
            )}
          </Svg>
        </Animated.View>
      </View>

      {/* Severity label */}
      <View style={styles.labelContainer}>
        <Text style={styles.severityNumber}>{currentSeverity}</Text>
        <Text style={styles.severityLabel}>{severityLabel}</Text>
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
          <Text style={styles.sliderLabelText}>Calm</Text>
          <Text style={styles.sliderLabelText}>Painful</Text>
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
  shapeContainer: {
    width: 180,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  shapeWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  labelContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  severityNumber: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 48,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  severityLabel: {
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
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: colors.skin,
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
