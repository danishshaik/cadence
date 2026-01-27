import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Chip } from "@components/shared/chip";
import { colors } from "@theme";
import { useLogOrthostatic } from "./log-orthostatic-provider";
import { OrthostaticSymptom } from "@/types/orthostatic";

const isIOS = process.env.EXPO_OS === "ios";

const OPTIONS: { id: OrthostaticSymptom; label: string }[] = [
  { id: "eyes", label: "Eyes: Tunnel vision" },
  { id: "ears", label: "Ears: Ringing" },
  { id: "legs", label: "Legs: Weakness" },
  { id: "chest", label: "Chest: Palpitations" },
];

export function ProdromeStep() {
  const { formData, updateFormData } = useLogOrthostatic();

  const toggle = (id: OrthostaticSymptom) => {
    const exists = formData.symptoms.includes(id);
    const next = exists
      ? formData.symptoms.filter((item) => item !== id)
      : [...formData.symptoms, id];
    updateFormData({ symptoms: next });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Did your vision or hearing change?</Text>
      <Text style={styles.subtitle}>Tap areas to mark prodrome symptoms</Text>

      <View style={styles.mapCard}>
        <View style={styles.halo} />
        <View style={styles.head} />
        <View style={styles.body} />
        <View style={styles.core} />
        <View style={styles.legs} />
      </View>

      <View style={styles.chipGrid}>
        {OPTIONS.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            selected={formData.symptoms.includes(option.id)}
            onPress={() => toggle(option.id)}
            style={[
              styles.chip,
              formData.symptoms.includes(option.id) && styles.chipSelected,
            ]}
          />
        ))}
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
    marginBottom: 24,
  },
  mapCard: {
    alignItems: "center",
    justifyContent: "center",
    height: 220,
    marginBottom: 24,
  },
  halo: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(201,212,255,0.6)",
  },
  head: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "rgba(102,126,234,0.6)",
  },
  body: {
    width: 14,
    height: 90,
    borderRadius: 7,
    marginTop: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "rgba(102,126,234,0.4)",
  },
  core: {
    position: "absolute",
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.orthostatic,
    backgroundColor: colors.orthostaticMuted,
    top: 128,
  },
  legs: {
    position: "absolute",
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.orthostatic,
    backgroundColor: colors.orthostaticMuted,
    top: 172,
  },
  chipGrid: {
    gap: 10,
  },
  chip: {
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(102,126,234,0.2)",
  },
  chipSelected: {
    backgroundColor: colors.orthostatic,
    borderColor: colors.orthostatic,
  },
});
