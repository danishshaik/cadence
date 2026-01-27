import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Chip } from "@components/shared/chip";
import { colors } from "@theme";
import { useLogOrthostatic } from "./log-orthostatic-provider";
import { OrthostaticHydrationFactor } from "@/types/orthostatic";

const isIOS = process.env.EXPO_OS === "ios";

const OPTIONS: { id: OrthostaticHydrationFactor; label: string }[] = [
  { id: "dehydrated", label: "Dehydrated / Thirsty" },
  { id: "large_meal", label: "Large meal" },
  { id: "alcohol", label: "Alcohol" },
  { id: "hot_weather", label: "Hot weather" },
  { id: "missed_medication", label: "Missed meds" },
];

export function HydrationStep() {
  const { formData, updateFormData } = useLogOrthostatic();

  const toggle = (id: OrthostaticHydrationFactor) => {
    const exists = formData.hydrationFactors.includes(id);
    const next = exists
      ? formData.hydrationFactors.filter((item) => item !== id)
      : [...formData.hydrationFactors, id];
    updateFormData({ hydrationFactors: next });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Have you had enough water today?</Text>
      <Text style={styles.subtitle}>Select anything that applies</Text>

      <View style={styles.grid}>
        {OPTIONS.map((option, index) => {
          const selected = formData.hydrationFactors.includes(option.id);
          const isAlert = option.id === "dehydrated";

          return (
            <Chip
              key={option.id}
              label={option.label}
              selected={selected}
              onPress={() => toggle(option.id)}
              style={[
                styles.chip,
                index === 0 ? styles.chipFull : styles.chipHalf,
                selected && !isAlert && styles.chipSelected,
                isAlert && selected && styles.alertChip,
                isAlert && !selected && styles.alertChipOutline,
              ]}
            />
          );
        })}
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
    fontSize: 24,
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
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(102,126,234,0.2)",
  },
  chipFull: {
    flexBasis: "100%",
  },
  chipHalf: {
    flexBasis: "48%",
  },
  chipSelected: {
    backgroundColor: colors.orthostatic,
    borderColor: colors.orthostatic,
  },
  alertChip: {
    backgroundColor: colors.orthostaticAlert,
    borderColor: colors.orthostaticAlert,
  },
  alertChipOutline: {
    borderColor: colors.orthostaticAlert,
  },
});
