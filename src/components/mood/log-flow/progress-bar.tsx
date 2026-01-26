import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "@theme";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = currentStep / totalSteps;

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  track: {
    height: 3,
    backgroundColor: colors.moodLight,
    borderRadius: 1.5,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.mood,
    borderRadius: 1.5,
  },
});
