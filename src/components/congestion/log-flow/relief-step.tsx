import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SymbolView } from "expo-symbols";
import * as Haptics from "expo-haptics";
import { colors, shadows } from "@theme";
import { RELIEF_MEASURES, ReliefMeasureId } from "@/types/congestion";
import { useLogCongestion } from "./log-congestion-provider";

const isIOS = process.env.EXPO_OS === "ios";

const ICONS: Record<ReliefMeasureId, string> = {
  tea: "cup.and.saucer",
  steam: "cloud",
  lozenge: "pills",
  inhaler: "lungs",
  propped: "bed.double",
  chest_rub: "heart",
};

export function ReliefStep() {
  const { formData, updateFormData } = useLogCongestion();

  const handleToggle = (id: ReliefMeasureId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = formData.reliefMeasures.includes(id)
      ? formData.reliefMeasures.filter((m) => m !== id)
      : [...formData.reliefMeasures, id];
    updateFormData({ reliefMeasures: updated });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>What helped you settle?</Text>
        <Text style={styles.subtitle}>Select all that apply</Text>
      </View>

      <View style={styles.pillWrap}>
        {RELIEF_MEASURES.map((item) => {
          const isSelected = formData.reliefMeasures.includes(item.id);
          return (
            <Pressable
              key={item.id}
              onPress={() => handleToggle(item.id)}
              style={({ pressed }) => [
                styles.pill,
                isSelected && styles.pillSelected,
                pressed && styles.pillPressed,
              ]}
            >
              <SymbolView
                name={ICONS[item.id]}
                size={16}
                tintColor={isSelected ? "#FFFFFF" : colors.textSecondary}
                fallback={
                  <Text style={[styles.fallbackIcon, isSelected && styles.fallbackIconSelected]}>
                    ●
                  </Text>
                }
              />
              <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  pillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    marginBottom: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderCurve: "continuous",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...shadows.sm,
  },
  pillSelected: {
    backgroundColor: colors.restorativeSage,
    borderColor: colors.restorativeSage,
  },
  pillPressed: {
    transform: [{ scale: 0.98 }],
  },
  pillText: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  pillTextSelected: {
    color: "#FFFFFF",
  },
  fallbackIcon: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  fallbackIconSelected: {
    color: "#FFFFFF",
  },
});
