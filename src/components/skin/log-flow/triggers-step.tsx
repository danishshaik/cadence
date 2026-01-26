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
import { useLogSkin } from "./log-skin-provider";
import { SKIN_TRIGGERS, SkinTriggerId } from "@/types/skin";

// Map trigger icons to Ionicons names
const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  droplet: "water-outline",
  "alert-circle": "alert-circle-outline",
  moon: "moon-outline",
  cookie: "fast-food-outline",
  bed: "bed-outline",
  hand: "hand-left-outline",
  flask: "flask-outline",
  cloud: "cloud-outline",
  activity: "fitness-outline",
};

export function TriggersStep() {
  const { formData, updateFormData } = useLogSkin();

  const handleToggle = (id: SkinTriggerId) => {
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
      <Text style={styles.title}>Any likely culprits?</Text>
      <Text style={styles.subtitle}>Select potential triggers</Text>

      <View style={styles.pillsContainer}>
        {SKIN_TRIGGERS.map((trigger) => {
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
                size={18}
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
          <Text style={styles.emptyText}>No triggers? That's great!</Text>
          <Text style={styles.emptySubtext}>Skip if nothing applies</Text>
        </View>
      )}

      {formData.triggers.length > 0 && (
        <Text style={styles.selectedCount}>
          {formData.triggers.length} trigger{formData.triggers.length !== 1 ? "s" : ""} selected
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
    marginBottom: 24,
    textAlign: "center",
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
    gap: 6,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  pillSelected: {
    backgroundColor: colors.skinAlert,
    borderColor: colors.skinAlert,
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
    marginTop: 32,
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
    color: colors.skinAlert,
    textAlign: "center",
    marginTop: 20,
    fontWeight: "500",
  },
});
