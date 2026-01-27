import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ExpoSlider } from "@components/ui";
import Svg, { Defs, RadialGradient, Stop, Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@theme";
import { useLogOrthostatic } from "./log-orthostatic-provider";

const isIOS = process.env.EXPO_OS === "ios";

export function SeverityStep() {
  const { formData, updateFormData } = useLogOrthostatic();

  // Pulse effect based on severity
  const pulseScale = 1 + formData.severity / 60;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>How intense was the dizziness?</Text>
          <Text style={styles.subtitle}>Slide to rate the head rush</Text>
        </View>

        <View style={styles.circleWrap}>
          <View style={[styles.orbContainer, { transform: [{ scale: pulseScale }] }]}>
            <View style={styles.orbShadow} />
            <Svg height="200" width="200" viewBox="0 0 200 200">
              <Defs>
                <RadialGradient
                  id="orbGrad"
                  cx="50%"
                  cy="50%"
                  rx="50%"
                  ry="50%"
                  fx="50%"
                  fy="50%"
                  gradientUnits="userSpaceOnUse"
                >
                  <Stop offset="0%" stopColor={colors.orthostaticIndigo300} stopOpacity="1" />
                  <Stop offset="100%" stopColor={colors.orthostaticIndigo600} stopOpacity="1" />
                </RadialGradient>
              </Defs>
              <Circle cx="100" cy="100" r="100" fill="url(#orbGrad)" />
            </Svg>
            {/* Glint */}
            <LinearGradient
              colors={['rgba(255,255,255,0.6)', 'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.glint}
            />
          </View>
        </View>

        <View style={styles.sliderContainer}>
          <View style={styles.sliderLabelsRow}>
            <Text style={styles.sliderLabel}>0</Text>
            <Text style={styles.sliderLabel}>5</Text>
            <Text style={styles.sliderLabel}>10</Text>
          </View>
          <ExpoSlider
            style={styles.slider}
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={formData.severity}
            onValueChange={(value) => updateFormData({ severity: value })}
            minimumTrackTintColor={colors.orthostaticIndigo600}
            maximumTrackTintColor={colors.orthostaticTrack}
            thumbTintColor={colors.orthostaticIndigo600}
          />

          <View style={styles.ranges}>
            <Text style={[styles.rangeText, formData.severity === 0 && styles.rangeActive]}>
              0: Perfectly steady
            </Text>
            <Text style={[styles.rangeText, formData.severity >= 1 && formData.severity <= 3 && styles.rangeActive]}>
              1–3: Slight lightheadedness
            </Text>
            <Text style={[styles.rangeText, formData.severity >= 4 && formData.severity <= 7 && styles.rangeActive]}>
              4–7: Significant spinning / graying
            </Text>
            <Text style={[styles.rangeText, formData.severity >= 8 && styles.rangeActive]}>
              8–10: Near fainting / loss of balance
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  header: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 24,
    fontWeight: "700",
    color: "#2F355B",
    textAlign: "center",
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 14,
    color: colors.orthostaticSlate,
    textAlign: "center",
  },
  circleWrap: {
    alignItems: "center",
    justifyContent: "center",
    height: 240,
  },
  orbContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  orbShadow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.orthostaticIndigo600,
    opacity: 0.3,
    shadowColor: colors.orthostaticIndigo600,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
  },
  glint: {
    position: "absolute",
    top: 40,
    left: 40,
    width: 120,
    height: 80,
    borderRadius: 60,
    transform: [{ rotate: '45deg' }],
  },
  sliderContainer: {
    gap: 12,
  },
  sliderLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 0,
  },
  slider: {
    height: 40,
    width: "100%",
  },
  sliderLabel: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
    color: colors.orthostaticIndigo,
  },
  ranges: {
    gap: 8,
    marginTop: 12,
  },
  rangeText: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 12,
    fontWeight: "500",
    color: colors.orthostaticSlate,
  },
  rangeActive: {
    color: colors.orthostaticIndigo600,
    fontWeight: "700",
  },
});
