import React from "react";
import { StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { colors, shadows } from "@theme";
import { useLogArthritis } from "./log-arthritis-provider";
import { StiffnessField, ToggleField } from "@components/tracking";

const isIOS = process.env.EXPO_OS === "ios";

export function SensationStep() {
  const { formData, updateFormData } = useLogArthritis();
  const isMorningTime = new Date().getHours() < 10;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>How are your joints moving right now?</Text>
        <Text style={styles.subtitle}>Slide to show how flexible or locked you feel</Text>
      </View>

      <StiffnessField
        value={formData.stiffness}
        onChange={(stiffness) => updateFormData({ stiffness })}
        min={0}
        max={10}
      />

      {isMorningTime && (
        <View style={styles.morningRow}>
          <ToggleField
            label="Morning Stiffness"
            value={formData.morningStiffness}
            onChange={(value) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              updateFormData({ morningStiffness: value });
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
    gap: 16,
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
    marginBottom: 16,
    textAlign: "center",
  },
  morningRow: {
    width: "100%",
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderCurve: "continuous",
    ...shadows.sm,
  },
});
