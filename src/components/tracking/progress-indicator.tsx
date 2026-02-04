import React from "react";
import { StyleSheet, View } from "react-native";

export type ProgressVariant = "dots" | "bar";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  variant?: ProgressVariant;
  activeColor?: string;
  inactiveColor?: string;
  barHeight?: number;
  dotSize?: number;
  dotInactiveSize?: number;
  dotSpacing?: number;
  width?: number | string;
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  variant = "bar",
  activeColor = "#111827",
  inactiveColor = "#E5E7EB",
  barHeight = 6,
  dotSize = 8,
  dotInactiveSize = 6,
  dotSpacing = 6,
  width = "100%",
}: ProgressIndicatorProps) {
  if (variant === "dots") {
    return (
      <View style={[styles.dotsRow, { gap: dotSpacing }]}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isActive = index + 1 === currentStep;
          return (
            <View
              key={`dot-${index}`}
              style={[
                styles.dot,
                {
                  width: isActive ? dotSize : dotInactiveSize,
                  height: isActive ? dotSize : dotInactiveSize,
                  backgroundColor: isActive ? activeColor : inactiveColor,
                },
              ]}
            />
          );
        })}
      </View>
    );
  }

  const progress = totalSteps > 0 ? currentStep / totalSteps : 0;

  return (
    <View style={[styles.barTrack, { height: barHeight, width, backgroundColor: inactiveColor }]}>
      <View style={[styles.barFill, { width: `${progress * 100}%`, backgroundColor: activeColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    borderRadius: 999,
  },
  barTrack: {
    borderRadius: 999,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
  },
});
