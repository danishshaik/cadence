import React from "react";
import { View, Text, Pressable, StyleSheet, Platform, ScrollView } from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "@theme";
import { MIGRAINE_TRIGGERS } from "@/types/migraine";
import { useLogMigraine } from "./log-migraine-provider";

export function TriggersStep() {
  const { formData, updateFormData } = useLogMigraine();

  const handleTriggerToggle = (triggerId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newTriggers = formData.triggers.includes(triggerId)
      ? formData.triggers.filter((id) => id !== triggerId)
      : [...formData.triggers, triggerId];
    updateFormData("triggers", newTriggers);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What triggered it?</Text>
      <Text style={styles.subtitle}>Select any potential triggers</Text>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.triggerGrid}>
          {MIGRAINE_TRIGGERS.map((trigger) => {
            const isSelected = formData.triggers.includes(trigger.id);
            return (
              <Pressable
                key={trigger.id}
                onPress={() => handleTriggerToggle(trigger.id)}
                style={[styles.triggerChip, isSelected && styles.triggerChipSelected]}
              >
                <Text style={styles.triggerIcon}>{trigger.icon}</Text>
                <Text style={[styles.triggerLabel, isSelected && styles.triggerLabelSelected]}>
                  {trigger.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.selectedInfo}>
        {formData.triggers.length === 0 ? (
          <Text style={styles.selectedText}>No triggers selected (optional)</Text>
        ) : (
          <Text style={styles.selectedText}>
            {formData.triggers.length} trigger{formData.triggers.length !== 1 ? "s" : ""} selected
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  triggerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  triggerChip: {
    width: "31%",
    aspectRatio: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
    paddingHorizontal: 4,
  },
  triggerChipSelected: {
    backgroundColor: colors.migraineLight,
    borderColor: colors.migraine,
  },
  triggerIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  triggerLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 11,
    fontWeight: "500",
    color: colors.textSecondary,
    textAlign: "center",
  },
  triggerLabelSelected: {
    color: colors.migraine,
    fontWeight: "600",
  },
  selectedInfo: {
    alignItems: "center",
    paddingTop: 16,
  },
  selectedText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    color: colors.textSecondary,
  },
});
