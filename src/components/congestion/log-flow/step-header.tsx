import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "@theme";

interface StepHeaderProps {
  currentStep: number;
  totalSteps: number;
}

export function StepHeader({ currentStep, totalSteps }: StepHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isActive = index + 1 === currentStep;
          return (
            <View
              key={index}
              style={[
                styles.stepDot,
                isActive ? styles.activeDot : styles.inactiveDot,
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
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  stepsContainer: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  stepDot: {
    borderRadius: 4,
  },
  activeDot: {
    width: 8,
    height: 8,
    backgroundColor: colors.midnightBlue,
  },
  inactiveDot: {
    width: 6,
    height: 6,
    backgroundColor: "rgba(44, 62, 80, 0.3)", // #2C3E5050
  },
});
