import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { colors } from "@theme";
import { useLogMigraine } from "./log-migraine-provider";
import { BubbleChoiceField } from "@components/tracking/fields/bubble-choice-field";

const isIOS = Platform.OS === "ios";

const palette = {
  textPrimary: "#2F3A34",
  textSecondary: "#7B857F",
  textMuted: "#4A5A52",
} as const;

const TRIGGER_BUBBLES = [
  { id: "stress", label: "Stress", icon: "brain" },
  { id: "lack_of_sleep", label: "Sleep", icon: "moon" },
  { id: "bright_light", label: "Light", icon: "sun" },
  { id: "loud_noise", label: "Noise", icon: "volume-2" },
  { id: "strong_smell", label: "Smell", icon: "wind" },
  { id: "weather", label: "Weather", icon: "cloud-rain" },
  { id: "skipped_meal", label: "Meals", icon: "utensils-crossed" },
  { id: "dehydration", label: "Water", icon: "droplets" },
  { id: "alcohol", label: "Alcohol", icon: "wine" },
  { id: "caffeine", label: "Caffeine", icon: "coffee" },
  { id: "hormonal", label: "Hormonal", icon: "heart-pulse" },
  { id: "screen_time", label: "Screen", icon: "monitor" },
] as const;

export function TriggersStep() {
  const { formData, updateFormData } = useLogMigraine();

  const handleChange = React.useCallback(
    (next: string[]) => {
      updateFormData("triggers", next);
    },
    [updateFormData]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What triggered it?</Text>
      <Text style={styles.subtitle}>Tap bubbles to select</Text>

      <BubbleChoiceField
        value={formData.triggers}
        onChange={handleChange}
        items={TRIGGER_BUBBLES}
        accentColor={colors.migraine}
        textPrimaryColor={palette.textPrimary}
        textSecondaryColor={palette.textSecondary}
        textMutedColor={palette.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 24,
    fontWeight: "700",
    color: palette.textPrimary,
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    color: palette.textSecondary,
    textAlign: "center",
    marginBottom: 12,
  },
});
