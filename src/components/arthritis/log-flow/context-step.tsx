import React, { useEffect } from "react";
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { SymbolView } from "expo-symbols";
import * as Haptics from "expo-haptics";
import { colors, shadows } from "@theme";
import { useLogArthritis } from "./log-arthritis-provider";
import { WeatherConfirmationId, WEATHER_CONFIRMATIONS } from "@/types/arthritis";

const isIOS = process.env.EXPO_OS === "ios";

// Simulated weather data (in a real app, this would come from a weather API)
function getSimulatedWeather() {
  const pressures = ["rising", "falling", "stable"] as const;
  const temps = [42, 48, 55, 62, 68];
  const humidities = [45, 58, 65, 72, 80];

  return {
    pressure: pressures[Math.floor(Math.random() * pressures.length)],
    temperature: temps[Math.floor(Math.random() * temps.length)],
    humidity: humidities[Math.floor(Math.random() * humidities.length)],
  };
}

function WeatherIcon({ pressure }: { pressure: "rising" | "falling" | "stable" | null }) {
  const iconName = pressure === "falling" ? "arrow.down" : pressure === "rising" ? "arrow.up" : "equal";

  return (
    <View style={styles.weatherIconContainer}>
      <SymbolView
        name={`chevron.${pressure === "falling" ? "down" : pressure === "rising" ? "up" : "compact.down"}`}
        size={28}
        tintColor={colors.arthritis}
        fallback={
          <Text style={styles.iconFallback}>
            {pressure === "falling" ? "↓" : pressure === "rising" ? "↑" : "="}
          </Text>
        }
      />
    </View>
  );
}

function ConfirmationPill({
  id,
  label,
  selected,
  onPress,
}: {
  id: WeatherConfirmationId;
  label: string;
  selected: boolean;
  onPress: (id: WeatherConfirmationId) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress(id)}
      style={[styles.pill, selected && styles.pillSelected]}
    >
      <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function ContextStep() {
  const { formData, updateFormData } = useLogArthritis();
  const { width } = useWindowDimensions();

  // Initialize weather data on mount
  useEffect(() => {
    if (formData.barometricPressure === null) {
      const weather = getSimulatedWeather();
      updateFormData({
        barometricPressure: weather.pressure,
        temperature: weather.temperature,
        humidity: weather.humidity,
      });
    }
  }, []);

  const handleConfirmationPress = (id: WeatherConfirmationId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateFormData({
      weatherConfirmation: formData.weatherConfirmation === id ? null : id,
    });
  };

  const pressureLabel =
    formData.barometricPressure === "falling"
      ? "Low (Falling)"
      : formData.barometricPressure === "rising"
      ? "High (Rising)"
      : "Stable";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>How does the air feel?</Text>
        <Text style={styles.subtitle}>Confirm the environmental context</Text>
      </View>

      <View style={styles.weatherCard}>
        <WeatherIcon pressure={formData.barometricPressure} />
        <Text style={styles.pressureLabel}>Barometric Pressure: {pressureLabel}</Text>
        <Text style={styles.weatherDetails}>
          Temp {formData.temperature ?? "--"}°F | Humidity {formData.humidity ?? "--"}%
        </Text>
      </View>

      <View style={styles.questionSection}>
        <Text style={styles.questionText}>Does the weather match your pain?</Text>

        <View style={styles.pillsRow}>
          {WEATHER_CONFIRMATIONS.map((option) => (
            <ConfirmationPill
              key={option.id}
              id={option.id}
              label={option.label}
              selected={formData.weatherConfirmation === option.id}
              onPress={handleConfirmationPress}
            />
          ))}
        </View>
      </View>

      <Text style={styles.footerNote}>
        {formData.weatherConfirmation
          ? `Weather correlation: ${
              formData.weatherConfirmation === "yes"
                ? "Confirmed"
                : formData.weatherConfirmation === "cold"
                ? "Cold-related"
                : "Not related"
            }`
          : "Select an option above"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
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
    marginBottom: 12,
    textAlign: "center",
  },
  weatherCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderCurve: "continuous",
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: "center",
    width: "100%",
    gap: 12,
    ...shadows.md,
  },
  weatherIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.arthritisSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  iconFallback: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.arthritis,
  },
  pressureLabel: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: colors.arthritisText,
    textAlign: "center",
  },
  weatherDetails: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    color: colors.arthritisTextSecondary,
    textAlign: "center",
  },
  questionSection: {
    alignItems: "center",
    gap: 16,
    width: "100%",
  },
  questionText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
    color: colors.arthritisText,
    textAlign: "center",
  },
  pillsRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: "#EEEEEE",
  },
  pillSelected: {
    backgroundColor: colors.arthritis,
  },
  pillText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    fontWeight: "700",
    color: colors.arthritisText,
  },
  pillTextSelected: {
    color: "#FFFFFF",
  },
  footerNote: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    color: colors.arthritisTextSecondary,
  },
});
