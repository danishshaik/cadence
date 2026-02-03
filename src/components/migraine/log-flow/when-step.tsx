import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@theme";
import { Icon } from "@components/ui";
import { useLogMigraine } from "./log-migraine-provider";

const isIOS = Platform.OS === "ios";

const palette = {
  card: "#FFFFFF",
  accent: colors.migraine,
  accentSoft: "#FCE4F1",
  textPrimary: "#2F3A34",
  textSecondary: "#7B857F",
  textMuted: "#4A5A52",
  border: "#E5E7EB",
} as const;

const DAY_PARTS = [
  { id: "morning", label: "Morning", icon: "sunrise" },
  { id: "afternoon", label: "Afternoon", icon: "sun" },
  { id: "evening", label: "Evening", icon: "sunset" },
  { id: "night", label: "Night", icon: "moon" },
] as const;

const DURATION_OPTIONS = [
  { id: "short", label: "≤1h", minutes: 60, ongoing: false },
  { id: "medium", label: "1–4h", minutes: 240, ongoing: false },
  { id: "long", label: "4h+", minutes: 480, ongoing: false },
  { id: "ongoing", label: "Ongoing", minutes: null, ongoing: true },
] as const;

export function WhenStep() {
  const { formData, updateFormData } = useLogMigraine();

  const handleDayPartSelect = (timeOfDay: (typeof DAY_PARTS)[number]["id"]) => {
    updateFormData("timeOfDay", timeOfDay);
    updateFormData("startedAt", new Date());
  };

  const handleDurationSelect = (option: (typeof DURATION_OPTIONS)[number]) => {
    if (option.ongoing) {
      updateFormData("isOngoing", true);
      updateFormData("durationMinutes", null);
      return;
    }

    updateFormData("durationMinutes", option.minutes);
    updateFormData("isOngoing", false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleArea}>
        <Text style={styles.title}>Pick a time of day</Text>
        <Text style={styles.subtitle}>Then choose a rough length</Text>
      </View>

      <View style={styles.dayPartGrid}>
        <View style={styles.dayPartRow}>
          {DAY_PARTS.slice(0, 2).map((part) => {
            const isSelected = formData.timeOfDay === part.id;
            return (
              <Pressable
                key={part.id}
                onPress={() => handleDayPartSelect(part.id)}
                style={[
                  styles.dayPartTile,
                  isSelected && styles.dayPartTileSelected,
                ]}
              >
                <Icon
                  name={part.icon}
                  size={22}
                  color={isSelected ? colors.migraine : colors.migraine}
                />
                <Text
                  style={[
                    styles.dayPartLabel,
                    isSelected && styles.dayPartLabelSelected,
                  ]}
                >
                  {part.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.dayPartRow}>
          {DAY_PARTS.slice(2).map((part) => {
            const isSelected = formData.timeOfDay === part.id;
            return (
              <Pressable
                key={part.id}
                onPress={() => handleDayPartSelect(part.id)}
                style={[
                  styles.dayPartTile,
                  isSelected && styles.dayPartTileSelected,
                ]}
              >
                <Icon
                  name={part.icon}
                  size={22}
                  color={isSelected ? colors.migraine : colors.migraine}
                />
                <Text
                  style={[
                    styles.dayPartLabel,
                    isSelected && styles.dayPartLabelSelected,
                  ]}
                >
                  {part.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.durationCard}>
        <Text style={styles.durationLabel}>How long?</Text>
        <Text style={styles.durationHelper}>Tap one to choose</Text>
        <View style={styles.durationSegments}>
          {DURATION_OPTIONS.map((option) => {
            const isSelected = option.ongoing
              ? formData.isOngoing
              : !formData.isOngoing && formData.durationMinutes === option.minutes;
            return (
              <Pressable
                key={option.id}
                onPress={() => handleDurationSelect(option)}
                style={[
                  styles.durationSegment,
                  isSelected && styles.durationSegmentSelected,
                ]}
              >
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                  style={[
                    styles.durationSegmentText,
                    isSelected && styles.durationSegmentTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Text style={styles.hintText}>Fine-tune later if needed</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    alignItems: "center",
  },
  titleArea: {
    width: "100%",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 24,
    fontWeight: "700",
    color: palette.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    color: palette.textSecondary,
    textAlign: "center",
  },
  dayPartGrid: {
    width: "100%",
    gap: 12,
  },
  dayPartRow: {
    flexDirection: "row",
    gap: 12,
  },
  dayPartTile: {
    flex: 1,
    height: 110,
    backgroundColor: palette.card,
    borderRadius: 20,
    borderCurve: "continuous",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    boxShadow: "0 4px 16px rgba(233, 30, 140, 0.06)",
  },
  dayPartTileSelected: {
    backgroundColor: palette.accentSoft,
  },
  dayPartLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
    color: palette.textMuted,
  },
  dayPartLabelSelected: {
    color: palette.accent,
  },
  durationCard: {
    width: "100%",
    backgroundColor: palette.card,
    borderRadius: 24,
    borderCurve: "continuous",
    padding: 20,
    gap: 12,
    boxShadow: "0 6px 20px rgba(233, 30, 140, 0.06)",
  },
  durationLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 18,
    fontWeight: "600",
    color: palette.textMuted,
  },
  durationHelper: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    fontWeight: "500",
    color: palette.textSecondary,
  },
  durationSegments: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    borderCurve: "continuous",
  },
  durationSegment: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  durationSegmentSelected: {
    backgroundColor: palette.accent,
  },
  durationSegmentText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 11,
    fontWeight: "600",
    color: "#6D6C6A",
  },
  durationSegmentTextSelected: {
    color: "#FFFFFF",
  },
  hintText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "500",
    color: "#E91E8C90",
    textAlign: "center",
  },
});
