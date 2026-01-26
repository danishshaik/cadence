import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors } from "@theme";
import { useLogRespiratory } from "./log-respiratory-provider";
import { RESPIRATORY_TRIGGERS, RespiratoryTriggerId } from "@/types/respiratory";

// Map trigger icons to Ionicons
const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  flower: "flower-outline",
  sparkles: "sparkles-outline",
  paw: "paw-outline",
  cloud: "cloud-outline",
  snow: "snow-outline",
  fitness: "fitness-outline",
  alert: "alert-circle-outline",
  flask: "flask-outline",
};

export function TriggersStep() {
  const { formData, updateFormData } = useLogRespiratory();

  const handleToggle = (id: RespiratoryTriggerId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = formData.triggers;
    const updated = current.includes(id)
      ? current.filter((t) => t !== id)
      : [...current, id];
    updateFormData({ triggers: updated });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Any likely triggers around you?</Text>
      <Text style={styles.subtitle}>Select environmental factors</Text>

      {/* Smart Note placeholder - could be connected to real pollen API */}
      <View style={styles.smartNote}>
        <Ionicons name="information-circle" size={18} color={colors.respiratoryAlert} />
        <Text style={styles.smartNoteText}>
          Tip: Track triggers to identify patterns over time
        </Text>
      </View>

      <View style={styles.pillsContainer}>
        {RESPIRATORY_TRIGGERS.map((trigger) => {
          const isSelected = formData.triggers.includes(trigger.id);
          const iconName = ICON_MAP[trigger.icon] || "help-circle-outline";

          return (
            <Pressable
              key={trigger.id}
              onPress={() => handleToggle(trigger.id)}
              style={[styles.pill, isSelected && styles.pillSelected]}
            >
              <Ionicons
                name={iconName}
                size={20}
                color={isSelected ? "#FFFFFF" : colors.textSecondary}
              />
              <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                {trigger.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {formData.triggers.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No known triggers</Text>
          <Text style={styles.emptySubtext}>Skip if unsure</Text>
        </View>
      )}

      {formData.triggers.length > 0 && (
        <Text style={styles.selectedCount}>
          {formData.triggers.length} trigger{formData.triggers.length !== 1 ? "s" : ""} identified
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  title: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: "center",
  },
  smartNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.respiratoryAlertLight,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  smartNoteText: {
    flex: 1,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    color: colors.respiratoryAlert,
  },
  pillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  pillSelected: {
    backgroundColor: colors.respiratory,
    borderColor: colors.respiratory,
  },
  pillText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  pillTextSelected: {
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 24,
  },
  emptyText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  emptySubtext: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 4,
  },
  selectedCount: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    color: colors.respiratory,
    textAlign: "center",
    marginTop: 20,
    fontWeight: "500",
  },
});
