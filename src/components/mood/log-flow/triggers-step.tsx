import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Icon } from "@components/ui";
import { useTrackerFlow } from "@components/tracking/tracker-flow-provider";
import { MOOD_TRIGGERS, MoodTriggerId } from "@/types/mood";
import { FlowTitle } from "./flow-title";
import { mentalWeatherColors, mentalWeatherFonts } from "@theme";
import { MoodFormData } from "./mood-flow-types";

const TRIGGER_CATEGORIES = [
  { key: "sleep", label: "Sleep", icon: "moon" },
  { key: "social", label: "Social", icon: "people" },
  { key: "health", label: "Health", icon: "heart-pulse" },
  { key: "environment", label: "Environment", icon: "cloud-rain" },
] as const;

export function TriggersStep() {
  const { formData, updateField } = useTrackerFlow<MoodFormData>();
  const selectedCount = formData.triggers.length;

  const handleTriggerToggle = React.useCallback(
    (id: MoodTriggerId) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const current = formData.triggers;
      const next = current.includes(id)
        ? current.filter((trigger) => trigger !== id)
        : [...current, id];
      updateField("triggers", next);
    },
    [formData.triggers, updateField]
  );

  return (
    <View style={styles.container}>
      <FlowTitle
        title="What's influencing you?"
        subtitle="Select anything that applies today"
        align="center"
        subtitleColor={mentalWeatherColors.textSecondary}
      />

      <View style={styles.cards}>
        {TRIGGER_CATEGORIES.map((category) => {
          const triggers = MOOD_TRIGGERS.filter((trigger) => trigger.category === category.key);
          return (
            <View key={category.key} style={styles.card}>
              <View style={styles.cardHeader}>
                <Icon name={category.icon} size={16} color={mentalWeatherColors.textSecondary} />
                <Text selectable style={styles.cardTitle}>
                  {category.label}
                </Text>
              </View>

              <View style={styles.chipRow}>
                {triggers.map((trigger) => {
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
                      {isSelected ? (
                        <Icon name="checkmark" size={14} color={mentalWeatherColors.accent} />
                      ) : null}
                      <Text
                        selectable
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {trigger.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>

      {selectedCount > 0 ? (
        <View style={styles.summary}>
          <View style={styles.summaryBadge}>
            <Icon name="checkmark-circle" size={14} color={mentalWeatherColors.accent} />
            <Text selectable style={styles.summaryText}>
              {selectedCount} selected
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
  },
  cards: {
    gap: 16,
  },
  card: {
    backgroundColor: mentalWeatherColors.surface,
    borderRadius: 20,
    borderCurve: "continuous",
    padding: 18,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontFamily: mentalWeatherFonts.text,
    fontSize: 13,
    fontWeight: "600",
    color: "#6C7A72",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderCurve: "continuous",
    backgroundColor: mentalWeatherColors.surface,
    borderWidth: 1,
    borderColor: mentalWeatherColors.borderSoft,
  },
  chipSelected: {
    backgroundColor: mentalWeatherColors.accentLight,
    borderColor: mentalWeatherColors.accent,
    borderWidth: 1.5,
  },
  chipPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  chipText: {
    fontFamily: mentalWeatherFonts.text,
    fontSize: 13,
    fontWeight: "500",
    color: mentalWeatherColors.textMuted,
  },
  chipTextSelected: {
    fontWeight: "600",
    color: mentalWeatherColors.accent,
  },
  summary: {
    paddingVertical: 4,
  },
  summaryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderCurve: "continuous",
    alignSelf: "flex-start",
    backgroundColor: mentalWeatherColors.accentLight,
  },
  summaryText: {
    fontFamily: mentalWeatherFonts.text,
    fontSize: 13,
    fontWeight: "600",
    color: mentalWeatherColors.accent,
  },
});
