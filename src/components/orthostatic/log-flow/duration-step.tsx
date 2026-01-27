import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ExpoSlider } from "@components/ui";
import { colors } from "@theme";
import { useLogOrthostatic } from "./log-orthostatic-provider";

const isIOS = process.env.EXPO_OS === "ios";

export function DurationStep() {
  const { formData, updateFormData } = useLogOrthostatic();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How long until you felt steady?</Text>
      <Text style={styles.subtitle}>Seconds vs minutes helps pinpoint severity</Text>

      <View style={styles.pickerCard}>
        <View style={styles.pulseRing} />
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerValue}>{String(formData.durationSeconds).padStart(2, "0")}</Text>
          <Text style={styles.pickerLabel}>seconds</Text>
          <ExpoSlider
            style={styles.slider}
            minimumValue={0}
            maximumValue={59}
            step={1}
            value={formData.durationSeconds}
            onValueChange={(value) => updateFormData({ durationSeconds: value })}
            minimumTrackTintColor={colors.orthostatic}
            maximumTrackTintColor={colors.orthostaticMuted}
            thumbTintColor={colors.orthostatic}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerValue}>{formData.durationMinutes}</Text>
          <Text style={styles.pickerLabel}>minutes</Text>
          <ExpoSlider
            style={styles.slider}
            minimumValue={0}
            maximumValue={5}
            step={1}
            value={formData.durationMinutes}
            onValueChange={(value) => updateFormData({ durationMinutes: value })}
            minimumTrackTintColor={colors.orthostatic}
            maximumTrackTintColor={colors.orthostaticMuted}
            thumbTintColor={colors.orthostatic}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontFamily: isIOS ? "SF Pro Display" : "sans-serif",
    fontSize: 26,
    fontWeight: "700",
    color: "#2F355B",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    color: "rgba(102,126,234,0.7)",
    textAlign: "center",
    marginBottom: 24,
  },
  pickerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(102,126,234,0.15)",
  },
  pulseRing: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    borderColor: "rgba(102,126,234,0.2)",
  },
  pickerColumn: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  pickerValue: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 32,
    fontWeight: "700",
    color: colors.orthostatic,
  },
  pickerLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    color: colors.textSecondary,
  },
  divider: {
    width: 1,
    height: 120,
    backgroundColor: "rgba(102,126,234,0.2)",
  },
  slider: {
    width: "100%",
    height: 36,
  },
});
