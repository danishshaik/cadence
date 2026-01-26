import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import Slider from "@react-native-community/slider";
import { colors } from "@theme";
import { useLogMigraine } from "./log-migraine-provider";
import { SeverityCircle } from "../severity-circle";

export function SeverityStep() {
  const { formData, updateFormData } = useLogMigraine();

  const getSeverityText = () => {
    if (formData.severity <= 3) return "Mild";
    if (formData.severity <= 6) return "Moderate";
    return "Severe";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How bad is your pain?</Text>
      <Text style={styles.subtitle}>Drag the slider to set intensity</Text>

      <SeverityCircle severity={formData.severity} />

      <View style={styles.valueContainer}>
        <Text style={styles.valueNumber}>{formData.severity}</Text>
        <Text style={styles.valueMax}>/10</Text>
        <Text style={styles.valueLabel}> - {getSeverityText()}</Text>
      </View>

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>MILD</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={10}
          step={1}
          value={formData.severity}
          onValueChange={(value) => updateFormData("severity", value)}
          minimumTrackTintColor={colors.migraine}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.migraine}
        />
        <Text style={styles.sliderLabel}>SEVERE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  valueNumber: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 48,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  valueMax: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 24,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  valueLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 18,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    color: colors.textTertiary,
  },
});
