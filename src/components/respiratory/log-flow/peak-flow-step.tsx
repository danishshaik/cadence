import React from "react";
import { View, Text, TextInput, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors, shadows } from "@theme";
import { useRespiratoryStore } from "@stores/respiratory-store";
import { useLogRespiratory } from "./log-respiratory-provider";

const isIOS = process.env.EXPO_OS === "ios";
const MAX_FLOW = 800;

const ZONE_COLORS = {
  green: "#D1FAE5",
  yellow: "#FEF3C7",
  red: "#FEE2E2",
  neutral: "#FFFFFF",
};
const ZONE_STROKES = {
  green: "#34D399",
  yellow: "#FBBF24",
  red: "#FCA5A5",
  neutral: colors.respiratoryIndigo,
};

export function PeakFlowStep() {
  const { formData, updateFormData } = useLogRespiratory();
  const personalBest = useRespiratoryStore((state) => state.personalBestPeakFlow);
  const { width, height } = useWindowDimensions();

  const dialSize = Math.min(200, width * 0.6, height * 0.3);
  const dialRadius = Math.max(60, (dialSize - 40) / 2);

  const peakFlow = formData.peakFlow ?? 0;
  const progress = Math.min(peakFlow / MAX_FLOW, 1);

  const hasBaseline = personalBest !== null && personalBest > 0;
  const percentOfBest = hasBaseline ? peakFlow / personalBest : null;

  let zone: "green" | "yellow" | "red" | "neutral" = "neutral";
  if (percentOfBest !== null) {
    if (percentOfBest >= 0.8) zone = "green";
    else if (percentOfBest >= 0.5) zone = "yellow";
    else zone = "red";
  }

  const dialBackground = ZONE_COLORS[zone];
  const dialStroke = ZONE_STROKES[zone];

  const strokeWidth = 10;
  const circumference = 2 * Math.PI * dialRadius;
  const dashOffset = circumference * (1 - progress);

  const handleChangeText = (text: string) => {
    const digits = text.replace(/[^0-9]/g, "");
    if (digits.length === 0) {
      updateFormData({ peakFlow: null });
      return;
    }

    const value = Math.min(parseInt(digits, 10), MAX_FLOW);
    updateFormData({ peakFlow: value });
  };

  const handleStep = (delta: number) => {
    const next = Math.max(0, Math.min(MAX_FLOW, peakFlow + delta));
    updateFormData({ peakFlow: next });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Did you measure your flow?</Text>
        <Text style={styles.subtitle}>Optional — add your peak flow in L/min</Text>
      </View>

      <View style={[styles.dialContainer, { backgroundColor: dialBackground, width: dialSize, height: dialSize, borderRadius: dialSize / 2 }]}>
        <Svg width={dialSize} height={dialSize} viewBox={`0 0 ${dialSize} ${dialSize}`}>
          <Circle
            cx={dialSize / 2}
            cy={dialSize / 2}
            r={dialRadius}
            stroke="rgba(92, 107, 192, 0.15)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={dialSize / 2}
            cy={dialSize / 2}
            r={dialRadius}
            stroke={dialStroke}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${dialSize / 2} ${dialSize / 2})`}
          />
        </Svg>

        <View style={styles.dialCenter}>
          <TextInput
            value={formData.peakFlow ? String(formData.peakFlow) : ""}
            onChangeText={handleChangeText}
            placeholder="--"
            keyboardType="number-pad"
            placeholderTextColor={colors.textTertiary}
            style={styles.input}
          />
          <Text style={styles.unit}>L/min</Text>
        </View>
      </View>

      <View style={styles.stepperRow}>
        <Pressable
          onPress={() => handleStep(-10)}
          style={({ pressed }) => [styles.stepperButton, pressed && styles.stepperPressed]}
        >
          <Text style={styles.stepperText}>-</Text>
        </Pressable>
        <Pressable
          onPress={() => handleStep(10)}
          style={({ pressed }) => [styles.stepperButton, styles.stepperPrimary, pressed && styles.stepperPressed]}
        >
          <Text style={[styles.stepperText, styles.stepperTextPrimary]}>+</Text>
        </Pressable>
      </View>

      <Text style={styles.zoneNote}>
        {hasBaseline
          ? `Zone: ${zone.charAt(0).toUpperCase() + zone.slice(1)}`
          : "Set a personal best to see your zone"}
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
    fontFamily: isIOS ? "SF Pro Display" : "sans-serif",
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 12,
    textAlign: "center",
  },
  dialContainer: {
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
    ...shadows.md,
  },
  dialCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    fontFamily: isIOS ? "SF Pro Display" : "sans-serif",
    fontSize: 32,
    fontWeight: "700",
    color: colors.textPrimary,
    minWidth: 80,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  unit: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  stepperRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 18,
  },
  stepperButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderCurve: "continuous",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.respiratoryIndigoLight,
    ...shadows.sm,
  },
  stepperPrimary: {
    backgroundColor: colors.respiratoryIndigo,
    borderColor: colors.respiratoryIndigo,
  },
  stepperPressed: {
    transform: [{ scale: 0.96 }],
  },
  stepperText: {
    fontFamily: isIOS ? "SF Pro Display" : "sans-serif",
    fontSize: 24,
    fontWeight: "600",
    color: colors.respiratoryIndigo,
  },
  stepperTextPrimary: {
    color: "#FFFFFF",
  },
  zoneNote: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 16,
  },
});
