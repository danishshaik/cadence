import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import Svg, { Path, Circle, Line } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { colors } from "@theme";
import { useLogMood } from "./log-mood-provider";
import { MOOD_TRIGGERS, MoodTriggerId } from "@/types/mood";

function TriggerIcon({ icon, isSelected }: { icon: string; isSelected: boolean }) {
  const color = isSelected ? colors.mood : colors.textSecondary;
  const size = 20;

  const icons: Record<string, React.ReactNode> = {
    moon: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={isSelected ? colors.moodLight : "none"}
        />
      </Svg>
    ),
    people: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx={9} cy={7} r={4} stroke={color} strokeWidth={1.5} fill={isSelected ? colors.moodLight : "none"} />
        <Path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke={color} strokeWidth={1.5} />
        <Circle cx={17} cy={7} r={3} stroke={color} strokeWidth={1.5} fill={isSelected ? colors.moodLight : "none"} />
        <Path d="M21 21v-2a3 3 0 00-2-2.83" stroke={color} strokeWidth={1.5} />
      </Svg>
    ),
    heart: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={isSelected ? colors.moodLight : "none"}
        />
      </Svg>
    ),
    bolt: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={isSelected ? colors.moodLight : "none"}
        />
      </Svg>
    ),
  };

  return icons[icon] || null;
}

export function TriggersStep() {
  const { formData, updateFormData } = useLogMood();

  const handleTriggerToggle = (id: MoodTriggerId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const currentTriggers = formData.triggers;
    const newTriggers = currentTriggers.includes(id)
      ? currentTriggers.filter((t) => t !== id)
      : [...currentTriggers, id];
    updateFormData({ triggers: newTriggers });
  };

  const categories = [
    { key: "sleep", label: "Sleep" },
    { key: "social", label: "Social" },
    { key: "health", label: "Health" },
    { key: "environment", label: "Environment" },
  ] as const;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's influencing you?</Text>

      {categories.map((category) => {
        const triggers = MOOD_TRIGGERS.filter((t) => t.category === category.key);
        return (
          <View key={category.key} style={styles.section}>
            <Text style={styles.sectionLabel}>{category.label}</Text>
            <View style={styles.row}>
              {triggers.map((trigger) => {
                const isSelected = formData.triggers.includes(trigger.id);
                return (
                  <Pressable
                    key={trigger.id}
                    onPress={() => handleTriggerToggle(trigger.id)}
                    style={({ pressed }) => [
                      styles.trigger,
                      isSelected && styles.triggerSelected,
                      pressed && styles.triggerPressed,
                    ]}
                  >
                    <TriggerIcon icon={trigger.icon} isSelected={isSelected} />
                    <Text
                      style={[styles.triggerText, isSelected && styles.triggerTextSelected]}
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
  section: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 11,
    fontWeight: "600",
    color: colors.textTertiary,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: "transparent",
    gap: 8,
  },
  triggerSelected: {
    backgroundColor: colors.moodLight,
    borderColor: colors.mood,
  },
  triggerPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  triggerText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  triggerTextSelected: {
    fontWeight: "600",
    color: colors.mood,
  },
  summary: {
    alignItems: "center",
    marginTop: "auto",
    paddingTop: 12,
  },
  summaryText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    color: colors.mood,
    fontWeight: "600",
  },
});
