import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ExpoSlider } from "@components/ui";
import { colors } from "@theme";
import { useLogMigraine } from "./log-migraine-provider";
import { SeverityCircle } from "../severity-circle";

const isIOS = process.env.EXPO_OS === "ios";

const palette = {
  textPrimary: "#2F3A34",
  textSecondary: "#7B857F",
  textMuted: "#6C7A72",
  cardSurface: "#FFF5FA",
  cardSurfaceTop: "#FFFFFF",
  pillBackground: "#FFF0F6",
  accent: "#E91E8C",
  gradientLow: "#8EF2B2",
  gradientMid: "#FFE082",
  gradientHigh: "#FF8AC7",
  gradientMax: "#F44336",
  tickIdle: "#D6DED9",
} as const;

export function SeverityStep() {
  const { formData, updateFormData } = useLogMigraine();
  const severityLabel =
    formData.severityLabel.charAt(0).toUpperCase() +
    formData.severityLabel.slice(1);
  const ticks = Array.from({ length: 11 }, (_, index) => index);

  return (
    <View style={styles.container}>
      <View style={styles.titleArea}>
        <Text style={styles.title}>How severe is your migraine?</Text>
        <Text style={styles.subtitle}>Rate your pain from 0 to 10</Text>
      </View>

      <LinearGradient
        colors={[palette.cardSurfaceTop, palette.cardSurface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.card}
      >
        <View style={styles.valueStack}>
          <SeverityCircle severity={formData.severity} size={180} />
          <Text style={styles.valueNumber} selectable>
            {formData.severity}
          </Text>
          <View style={styles.severityPill}>
            <Text style={styles.severityPillText}>{severityLabel}</Text>
          </View>
        </View>

        <View style={styles.sliderContainer}>
          <View style={styles.sliderTrackWrap}>
            <LinearGradient
              colors={[
                palette.gradientLow,
                palette.gradientMid,
                palette.gradientHigh,
                palette.gradientMax,
              ]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.gradientTrack}
            />
            <ExpoSlider
              style={styles.slider}
              hostStyle={styles.sliderHost}
              minimumValue={0}
              maximumValue={10}
              step={1}
              value={formData.severity}
              onValueChange={(value) => updateFormData("severity", value)}
              minimumTrackTintColor={colors.migraine}
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor={colors.migraine}
            />
          </View>
          <View style={styles.sliderTicks}>
            {ticks.map((tick) => {
              const isActive = tick === formData.severity;
              return (
                <View
                  key={`tick-${tick}`}
                  style={[styles.tick, isActive && styles.tickActive]}
                />
              );
            })}
          </View>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>No pain</Text>
            <Text style={styles.sliderLabel}>Worst pain</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 20,
  },
  titleArea: {
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 26,
    fontWeight: "700",
    color: palette.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    color: palette.textSecondary,
    textAlign: "center",
  },
  card: {
    width: "100%",
    borderRadius: 28,
    borderCurve: "continuous",
    padding: 24,
    gap: 20,
    alignItems: "center",
    boxShadow: "0 12px 30px rgba(233, 30, 140, 0.16)",
  },
  valueStack: {
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  valueNumber: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 56,
    fontWeight: "700",
    color: palette.accent,
    fontVariant: ["tabular-nums"],
  },
  severityPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderCurve: "continuous",
    backgroundColor: palette.pillBackground,
  },
  severityPillText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    fontWeight: "600",
    color: palette.accent,
  },
  sliderContainer: {
    width: "100%",
    gap: 10,
  },
  sliderTrackWrap: {
    height: 40,
    justifyContent: "center",
  },
  gradientTrack: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 10,
    borderRadius: 100,
    borderCurve: "continuous",
  },
  slider: {
    height: 40,
  },
  sliderHost: {
    height: 40,
  },
  sliderTicks: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 10,
  },
  tick: {
    width: 4,
    height: 4,
    borderRadius: 99,
    backgroundColor: palette.tickIdle,
  },
  tickActive: {
    width: 8,
    height: 8,
    backgroundColor: palette.accent,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 11,
    fontWeight: "500",
    color: palette.textMuted,
  },
});
