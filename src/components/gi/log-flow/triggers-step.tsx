import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "@theme";
import { useLogGI } from "./log-gi-provider";
import { GI_TRIGGERS, TriggerId } from "@/types/gi";

export function TriggersStep() {
  const { formData, updateFormData } = useLogGI();

  const handleTriggerToggle = (id: TriggerId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const currentTriggers = formData.triggers;
    const newTriggers = currentTriggers.includes(id)
      ? currentTriggers.filter((t) => t !== id)
      : [...currentTriggers, id];
    updateFormData({ triggers: newTriggers });
  };

  const foodTriggers = GI_TRIGGERS.filter((t) => t.category === "food");
  const mentalTriggers = GI_TRIGGERS.filter((t) => t.category === "mental");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Any triggers?</Text>

      {/* Food Triggers - Compact Chip Grid */}
      <Text style={styles.sectionLabel}>Food & Drink</Text>
      <View style={styles.chipsContainer}>
        {foodTriggers.map((trigger) => {
          const isSelected = formData.triggers.includes(trigger.id);
          return (
            <Pressable
              key={trigger.id}
              onPress={() => handleTriggerToggle(trigger.id)}
              style={({ pressed }) => [
                styles.chip,
                isSelected && styles.chipSelected,
                pressed && styles.chipPressed,
              ]}
            >
              <Text style={styles.chipIcon}>{trigger.icon}</Text>
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{trigger.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Mental/Other Triggers */}
      <Text style={styles.sectionLabel}>Other</Text>
      <View style={styles.chipsContainer}>
        {mentalTriggers.map((trigger) => {
          const isSelected = formData.triggers.includes(trigger.id);
          return (
            <Pressable
              key={trigger.id}
              onPress={() => handleTriggerToggle(trigger.id)}
              style={({ pressed }) => [
                styles.chip,
                styles.chipMental,
                isSelected && styles.chipMentalSelected,
                pressed && styles.chipPressed,
              ]}
            >
              <Text style={styles.chipIcon}>{trigger.icon}</Text>
              <Text style={[styles.chipText, isSelected && styles.chipTextMentalSelected]}>{trigger.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {formData.triggers.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {formData.triggers.length} selected
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  sectionLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: "transparent",
    gap: 6,
  },
  chipSelected: {
    backgroundColor: colors.giLight,
    borderColor: colors.gi,
  },
  chipMental: {
    borderColor: "rgba(168, 85, 247, 0.2)",
    backgroundColor: "rgba(168, 85, 247, 0.05)",
  },
  chipMentalSelected: {
    backgroundColor: "rgba(168, 85, 247, 0.15)",
    borderColor: "rgba(168, 85, 247, 0.6)",
  },
  chipPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  chipIcon: {
    fontSize: 14,
  },
  chipText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  chipTextSelected: {
    fontWeight: "600",
    color: colors.gi,
  },
  chipTextMentalSelected: {
    fontWeight: "600",
    color: "rgb(168, 85, 247)",
  },
  summary: {
    alignItems: "center",
    marginTop: "auto",
  },
  summaryText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    color: colors.gi,
    fontWeight: "600",
  },
});
