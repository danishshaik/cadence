import React from "react";
import { View, Text, StyleSheet, Platform, useWindowDimensions } from "react-native";
import Slider from "@react-native-community/slider";
import Svg, { Path, G, Defs, LinearGradient, Stop } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { colors } from "@theme";
import { useLogGI } from "./log-gi-provider";

function StomachIllustration({ severity, size }: { severity: number; size: number }) {
  const t = severity / 10;

  const greenRGB = { r: 136, g: 201, b: 161 };
  const coralRGB = { r: 255, g: 140, b: 148 };

  const r = Math.round(greenRGB.r + (coralRGB.r - greenRGB.r) * t);
  const g = Math.round(greenRGB.g + (coralRGB.g - greenRGB.g) * t);
  const b = Math.round(greenRGB.b + (coralRGB.b - greenRGB.b) * t);
  const strokeColor = `rgb(${r}, ${g}, ${b})`;

  const relaxedPath = `M 80 30 C 50 30 30 50 30 80 C 30 110 40 140 50 160 C 60 180 75 190 100 190 C 125 190 140 180 150 160 C 160 140 170 110 170 80 C 170 50 150 30 120 30 Z`;
  const tensePath = `M 80 35 C 55 35 35 55 38 85 C 35 100 42 130 55 155 C 60 170 70 180 100 180 C 130 180 140 170 145 155 C 158 130 165 100 162 85 C 165 55 145 35 120 35 Z`;
  const stomachPath = severity > 5 ? tensePath : relaxedPath;
  const showCrampLines = severity >= 6;

  return (
    <View style={[styles.illustrationContainer, { width: size, height: size }]}>
      <Svg width="100%" height="100%" viewBox="0 0 200 220">
        <Defs>
          <LinearGradient id="stomachGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={strokeColor} stopOpacity={0.2} />
            <Stop offset="100%" stopColor={strokeColor} stopOpacity={0.05} />
          </LinearGradient>
        </Defs>

        <Path
          d={stomachPath}
          fill="url(#stomachGradient)"
          stroke={strokeColor}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <Path d="M 90 30 L 90 10 M 110 30 L 110 10" stroke={strokeColor} strokeWidth={2.5} strokeLinecap="round" />

        {showCrampLines && (
          <G opacity={Math.min((severity - 5) / 5, 1)}>
            <Path d="M 60 80 C 70 75 80 85 90 80" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" fill="none" />
            <Path d="M 110 90 C 120 85 130 95 140 90" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" fill="none" />
            <Path d="M 70 120 C 80 115 90 125 100 120" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" fill="none" />
            <Path d="M 100 140 C 110 135 120 145 130 140" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" fill="none" />
          </G>
        )}

        {severity >= 8 && (
          <G opacity={0.4}>
            <Path d="M 25 80 L 20 80" stroke={strokeColor} strokeWidth={2} />
            <Path d="M 175 80 L 180 80" stroke={strokeColor} strokeWidth={2} />
            <Path d="M 25 120 L 18 120" stroke={strokeColor} strokeWidth={2} />
            <Path d="M 175 120 L 182 120" stroke={strokeColor} strokeWidth={2} />
          </G>
        )}
      </Svg>
    </View>
  );
}

export function SeverityStep() {
  const { formData, updateFormData } = useLogGI();
  const { height } = useWindowDimensions();

  const illustrationSize = Math.min(180, height * 0.22);

  const handleSeverityChange = (value: number) => {
    const severity = Math.round(value);
    let severityLabel: "mild" | "moderate" | "severe" = "mild";
    if (severity >= 7) severityLabel = "severe";
    else if (severity >= 4) severityLabel = "moderate";
    updateFormData({ severity, severityLabel });
  };

  const handleSlidingComplete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getSeverityText = () => {
    if (formData.severity <= 3) return "Mild";
    if (formData.severity <= 6) return "Moderate";
    return "Severe";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How intense?</Text>

      <StomachIllustration severity={formData.severity} size={illustrationSize} />

      <View style={styles.severityDisplay}>
        <Text style={[styles.severityNumber, { color: formData.severity <= 5 ? colors.gi : colors.giSevere }]}>
          {formData.severity}
        </Text>
        <Text style={styles.severityText}>{getSeverityText()}</Text>
      </View>

      <View style={styles.sliderSection}>
        <View style={styles.sliderLabels}>
          <Text style={[styles.sliderLabel, { color: colors.gi }]}>Mild</Text>
          <Text style={[styles.sliderLabel, { color: colors.giSevere }]}>Severe</Text>
        </View>

        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={10}
          step={1}
          value={formData.severity}
          onValueChange={handleSeverityChange}
          onSlidingComplete={handleSlidingComplete}
          minimumTrackTintColor={formData.severity <= 5 ? colors.gi : colors.giSevere}
          maximumTrackTintColor={colors.border}
          thumbTintColor={formData.severity <= 5 ? colors.gi : colors.giSevere}
        />
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
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  illustrationContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  severityDisplay: {
    alignItems: "center",
    marginVertical: 12,
  },
  severityNumber: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 56,
    fontWeight: "700",
  },
  severityText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    color: colors.textSecondary,
  },
  sliderSection: {
    width: "100%",
    marginTop: "auto",
    paddingBottom: 8,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sliderLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    fontWeight: "600",
  },
  slider: {
    width: "100%",
    height: 40,
  },
});
