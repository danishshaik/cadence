import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import Animated, { FadeInUp, FadeOut } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, shadows } from "@theme";
import { useLogRespiratory } from "./log-respiratory-provider";

const isIOS = process.env.EXPO_OS === "ios";
const MAX_PUFFS = 4;

interface PuffParticle {
  id: number;
}

export function InhalerStep() {
  const { formData, updateFormData } = useLogRespiratory();
  const [puffs, setPuffs] = useState<PuffParticle[]>([]);
  const timeouts = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const { height } = useWindowDimensions();

  const stageHeight = Math.max(200, Math.min(height * 0.32, 240));

  useEffect(() => {
    return () => {
      timeouts.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  const triggerPuff = () => {
    const id = Date.now();
    setPuffs((prev) => [...prev, { id }]);
    const timeout = setTimeout(() => {
      setPuffs((prev) => prev.filter((puff) => puff.id !== id));
    }, 900);
    timeouts.current.push(timeout);
  };

  const handleIncrement = () => {
    if (formData.rescueInhalerPuffs >= MAX_PUFFS) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateFormData({ rescueInhalerPuffs: formData.rescueInhalerPuffs + 1 });
    triggerPuff();
  };

  const handleDecrement = () => {
    if (formData.rescueInhalerPuffs <= 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateFormData({ rescueInhalerPuffs: formData.rescueInhalerPuffs - 1 });
  };

  const displayPuffs = formData.rescueInhalerPuffs >= 3
    ? "3+"
    : `${formData.rescueInhalerPuffs}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Did you need your rescue inhaler?</Text>
        <Text style={styles.subtitle}>Tap the canister or + to add a puff</Text>
      </View>

      <View style={[styles.inhalerStage, { height: stageHeight }]}>
        <View style={styles.puffLayer}>
          {puffs.map((puff, index) => (
            <Animated.View
              key={puff.id}
              entering={FadeInUp.duration(240).delay(index * 30)}
              exiting={FadeOut.duration(220)}
              style={[styles.puff, { left: 16 + index * 6 }]}
            />
          ))}
        </View>

        <Pressable onPress={handleIncrement} style={styles.inhalerBody}>
          <View style={styles.inhalerCap} />
          <View style={styles.inhalerLabel}>
            <Text style={styles.puffCount}>{displayPuffs}</Text>
            <Text style={styles.puffLabel}>puffs</Text>
            <Text style={styles.puffHint}>
              {formData.rescueInhalerPuffs === 0 ? "Maintenance only" : "Rescue"}
            </Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.stepperRow}>
        <Pressable
          onPress={handleDecrement}
          style={({ pressed }) => [styles.stepperButton, pressed && styles.stepperPressed]}
        >
          <Text style={styles.stepperText}>-</Text>
        </Pressable>
        <Pressable
          onPress={handleIncrement}
          style={({ pressed }) => [styles.stepperButton, styles.stepperPrimary, pressed && styles.stepperPressed]}
        >
          <Text style={[styles.stepperText, styles.stepperTextPrimary]}>+</Text>
        </Pressable>
      </View>

      {formData.rescueInhalerPuffs >= 4 && (
        <Text style={styles.safetyNote}>That’s high. Are you feeling safe?</Text>
      )}
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
    marginBottom: 16,
    textAlign: "center",
  },
  inhalerStage: {
    width: 220,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  puffLayer: {
    position: "absolute",
    top: 20,
    left: 60,
    right: 60,
    height: 80,
  },
  puff: {
    position: "absolute",
    top: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderCurve: "continuous",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: colors.respiratoryIndigoLight,
  },
  inhalerBody: {
    width: 170,
    height: 210,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.respiratoryIndigoLight,
    ...shadows.md,
  },
  inhalerCap: {
    position: "absolute",
    top: -22,
    width: 90,
    height: 32,
    borderRadius: 18,
    borderCurve: "continuous",
    backgroundColor: colors.respiratoryIndigo,
  },
  inhalerLabel: {
    alignItems: "center",
    gap: 6,
  },
  puffCount: {
    fontFamily: isIOS ? "SF Pro Display" : "sans-serif",
    fontSize: 44,
    fontWeight: "700",
    color: colors.respiratoryIndigo,
  },
  puffLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  puffHint: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    color: colors.textTertiary,
  },
  stepperRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 18,
  },
  stepperButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    fontSize: 28,
    fontWeight: "600",
    color: colors.respiratoryIndigo,
  },
  stepperTextPrimary: {
    color: "#FFFFFF",
  },
  safetyNote: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    color: colors.respiratoryAlert,
    marginTop: 16,
  },
});
