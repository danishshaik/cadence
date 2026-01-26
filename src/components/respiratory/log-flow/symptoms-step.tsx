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
import { RESPIRATORY_SYMPTOMS, RespiratorySymptomId } from "@/types/respiratory";

// Map symptom icons to Ionicons
const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  wind: "leaf-outline",
  cough: "volume-high-outline",
  droplet: "water-outline",
  nose: "body-outline",
  eye: "eye-outline",
  activity: "pulse-outline",
};

export function SymptomsStep() {
  const { formData, updateFormData } = useLogRespiratory();

  const handleToggle = (id: RespiratorySymptomId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = formData.symptoms;
    const updated = current.includes(id)
      ? current.filter((s) => s !== id)
      : [...current, id];
    updateFormData({ symptoms: updated });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>What else are you noticing?</Text>
      <Text style={styles.subtitle}>Select all symptoms that apply</Text>

      <View style={styles.grid}>
        {RESPIRATORY_SYMPTOMS.map((symptom) => {
          const isSelected = formData.symptoms.includes(symptom.id);
          const iconName = ICON_MAP[symptom.icon] || "help-circle-outline";

          return (
            <Pressable
              key={symptom.id}
              onPress={() => handleToggle(symptom.id)}
              style={[styles.pill, isSelected && styles.pillSelected]}
            >
              <View style={styles.pillContent}>
                <Ionicons
                  name={iconName}
                  size={22}
                  color={isSelected ? "#FFFFFF" : colors.textSecondary}
                />
                <View style={styles.pillText}>
                  <Text style={[styles.pillLabel, isSelected && styles.pillLabelSelected]}>
                    {symptom.label}
                  </Text>
                  <Text style={[styles.pillDescription, isSelected && styles.pillDescriptionSelected]}>
                    {symptom.description}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {formData.symptoms.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No additional symptoms</Text>
          <Text style={styles.emptySubtext}>Skip if breathing is your only concern</Text>
        </View>
      )}

      {formData.symptoms.length > 0 && (
        <Text style={styles.selectedCount}>
          {formData.symptoms.length} symptom{formData.symptoms.length !== 1 ? "s" : ""} selected
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
  grid: {
    gap: 10,
  },
  pill: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  pillSelected: {
    backgroundColor: colors.respiratory,
    borderColor: colors.respiratory,
  },
  pillContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pillText: {
    flex: 1,
  },
  pillLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  pillLabelSelected: {
    color: "#FFFFFF",
  },
  pillDescription: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pillDescriptionSelected: {
    color: "rgba(255,255,255,0.8)",
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
    marginTop: 16,
    fontWeight: "500",
  },
});
