import React from "react";
import { View, Text, Pressable, StyleSheet, Platform, TextInput } from "react-native";
import { colors } from "@theme";
import { DURATION_PRESETS } from "@/types/migraine";
import { useLogMigraine } from "./log-migraine-provider";

export function DurationStep() {
  const { formData, updateFormData } = useLogMigraine();

  const handleToggleOngoing = (isOngoing: boolean) => {
    updateFormData("isOngoing", isOngoing);
    if (isOngoing) {
      updateFormData("durationMinutes", null);
    }
  };

  const handlePresetSelect = (minutes: number) => {
    updateFormData("durationMinutes", minutes);
  };

  const formatDuration = (minutes: number | null): string => {
    if (minutes === null) return "--";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How long has it lasted?</Text>
      <Text style={styles.subtitle}>Select duration or mark as ongoing</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>STILL HAPPENING?</Text>
        <View style={styles.toggleRow}>
          <Pressable
            onPress={() => handleToggleOngoing(true)}
            style={[styles.toggleButton, formData.isOngoing && styles.toggleButtonSelected]}
          >
            <Text style={[styles.toggleText, formData.isOngoing && styles.toggleTextSelected]}>
              Yes
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleToggleOngoing(false)}
            style={[styles.toggleButton, !formData.isOngoing && styles.toggleButtonSelected]}
          >
            <Text style={[styles.toggleText, !formData.isOngoing && styles.toggleTextSelected]}>
              No
            </Text>
          </Pressable>
        </View>
      </View>

      {!formData.isOngoing && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>QUICK SELECT</Text>
            <View style={styles.presetGrid}>
              {DURATION_PRESETS.map((preset) => {
                const isSelected = formData.durationMinutes === preset.minutes;
                return (
                  <Pressable
                    key={preset.id}
                    onPress={() => handlePresetSelect(preset.minutes)}
                    style={[styles.presetChip, isSelected && styles.presetChipSelected]}
                  >
                    <Text style={[styles.presetText, isSelected && styles.presetTextSelected]}>
                      {preset.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.durationDisplay}>
            <Text style={styles.durationValue}>
              {formatDuration(formData.durationMinutes)}
            </Text>
            <Text style={styles.durationLabel}>duration</Text>
          </View>
        </>
      )}

      {formData.isOngoing && (
        <View style={styles.ongoingMessage}>
          <Text style={styles.ongoingIcon}>⏳</Text>
          <Text style={styles.ongoingText}>
            Duration will be calculated when you update or close this log
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
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    color: colors.textTertiary,
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  toggleButtonSelected: {
    backgroundColor: colors.migraineLight,
    borderColor: colors.migraine,
  },
  toggleText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  toggleTextSelected: {
    color: colors.migraine,
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  presetChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  presetChipSelected: {
    backgroundColor: colors.migraineLight,
    borderColor: colors.migraine,
  },
  presetText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  presetTextSelected: {
    color: colors.migraine,
  },
  durationDisplay: {
    alignItems: "center",
    marginTop: 24,
  },
  durationValue: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 48,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  durationLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  ongoingMessage: {
    alignItems: "center",
    marginTop: 48,
    paddingHorizontal: 24,
  },
  ongoingIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  ongoingText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
});
