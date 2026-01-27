import React, { useEffect } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import { Icon } from "@components/ui";
import * as Haptics from "expo-haptics";
import { colors, shadows } from "@theme";
import { useLogCongestion } from "./log-congestion-provider";

const MIN_QUALITY = 0;
const MAX_QUALITY = 3;
const isIOS = process.env.EXPO_OS === "ios";

export function SleepStep() {
  const { formData, updateFormData } = useLogCongestion();
  const { width } = useWindowDimensions();

  const normalizedValue = useSharedValue(formData.sleepQuality / MAX_QUALITY);
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [pulse]);

  const updateSleepQuality = (value: number) => {
    const quality = Math.round(value * (MAX_QUALITY - MIN_QUALITY) + MIN_QUALITY);
    updateFormData({ sleepQuality: quality });
  };

  const sliderWidth = Math.min(320, width - 48);
  const cardWidth = Math.min(width - 48, 342);
  const cardHeight = 200;

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const newValue = Math.max(0, Math.min(1, e.x / sliderWidth));
      normalizedValue.value = newValue;
    })
    .onEnd(() => {
      runOnJS(updateSleepQuality)(normalizedValue.value);
      runOnJS(Haptics.selectionAsync)();
    });

  const tapGesture = Gesture.Tap().onEnd((e) => {
    const newValue = Math.max(0, Math.min(1, e.x / sliderWidth));
    normalizedValue.value = withTiming(newValue, { duration: 180 });
    runOnJS(updateSleepQuality)(newValue);
    runOnJS(Haptics.selectionAsync)();
  });

  const gesture = Gesture.Race(panGesture, tapGesture);

  const thumbStyle = useAnimatedStyle(() => ({
    left: normalizedValue.value * sliderWidth - 16, // 32/2 = 16
  }));

  const hillsStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: interpolate(normalizedValue.value, [0, 1], [0.8, 1.1]) }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>How was your rest last night?</Text>
        <Text style={styles.subtitle}>Slide to show your sleep quality</Text>
      </View>

      <View style={[styles.sleepCard, { width: cardWidth, height: cardHeight }]}>
        <View style={styles.moonContainer}>
          <Icon name="moon" size={20} color="#FFC107" style={{ opacity: 0.8 }} />
        </View>
        
        {/* Stars */}
        <View style={styles.starsContainer}>
            <View style={[styles.star, { top: 20, left: 40, opacity: 0.6 }]} />
            <View style={[styles.star, { top: 40, left: 80, opacity: 0.4 }]} />
            <View style={[styles.star, { top: 15, left: 120, opacity: 0.7 }]} />
            <View style={[styles.star, { top: 50, left: 160, opacity: 0.3 }]} />
            <View style={[styles.star, { top: 25, left: 200, opacity: 0.5 }]} />
        </View>

        <Animated.View style={[styles.hillsContainer, hillsStyle]}>
          <Svg width={cardWidth} height={100} viewBox="0 0 326 100" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="hillsGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#88D8B0" stopOpacity="0.4" />
                <Stop offset="1" stopColor="#88D8B0" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Path
              d="M0 100c40 0 60-70 100-70 40 0 60 30 100 30 40 0 60-40 100-40 20 0 26 20 26 20l0 60z"
              fill="url(#hillsGradient)"
            />
          </Svg>
        </Animated.View>
      </View>

      <View style={styles.controlsContainer}>
        <View style={[styles.sliderLabels, { width: sliderWidth }]}>
          <Text style={[styles.sliderLabelText, { color: colors.restorativeSage }]}>Unbroken</Text>
          <Text style={styles.sliderLabelText}>Restless</Text>
        </View>

        <View style={styles.sliderWrapper}>
          <GestureDetector gesture={gesture}>
            <View style={[styles.sliderTrackContainer, { width: sliderWidth }]}>
              <ExpoLinearGradient
                colors={[colors.restorativeSage, colors.midnightBlue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sliderTrack}
              />
              <Animated.View style={[styles.sliderThumb, thumbStyle]} />
            </View>
          </GestureDetector>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 32,
    paddingBottom: 12,
  },
  header: {
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 24,
    fontWeight: "600",
    color: colors.midnightBlue,
    textAlign: "center",
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 14,
    color: "rgba(44, 62, 80, 0.5)", // #2C3E5080
    textAlign: "center",
  },
  sleepCard: {
    borderRadius: 24,
    borderCurve: "continuous",
    backgroundColor: colors.midnightBlue,
    overflow: "hidden",
    position: "relative",
    ...shadows.md,
  },
  moonContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 193, 7, 0.2)", // #FFC10730
    justifyContent: "center",
    alignItems: "center",
  },
  starsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: "absolute",
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#FFFFFF",
  },
  hillsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: "flex-end",
  },
  controlsContainer: {
    gap: 16,
    alignItems: "center",
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderLabelText: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(44, 62, 80, 0.4)", // #2C3E5060
  },
  sliderWrapper: {
    height: 32,
    justifyContent: "center",
  },
  sliderTrackContainer: {
    height: 8,
    borderRadius: 4,
  },
  sliderTrack: {
    flex: 1,
    borderRadius: 4,
  },
  sliderThumb: {
    position: "absolute",
    top: -12, // (32 - 8) / 2 = 12, so -12 to center 32px thumb on 8px track
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: colors.restorativeSage,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
});
