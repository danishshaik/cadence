import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors } from "@theme";
import { useLogSkin } from "./log-skin-provider";
import {
  ROUTINE_STEPS,
  TREATMENT_ACTIVES,
  SPOT_TREATMENTS,
  RoutineStepId,
  TreatmentActiveId,
  SpotTreatmentId,
  RoutineTime,
} from "@/types/skin";

export function RoutineStep() {
  const { formData, updateFormData } = useLogSkin();
  const [expandTreatment, setExpandTreatment] = useState(false);

  const handleTimeToggle = (time: RoutineTime) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateFormData({ routineTime: time });
  };

  const handleStepToggle = (id: RoutineStepId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = formData.routineSteps;
    const updated = current.includes(id)
      ? current.filter((s) => s !== id)
      : [...current, id];

    // Expand treatment submenu when treatment is selected
    if (id === "treatment" && !current.includes(id)) {
      setExpandTreatment(true);
    } else if (id === "treatment" && current.includes(id)) {
      setExpandTreatment(false);
      // Clear treatment actives when deselecting treatment
      updateFormData({ routineSteps: updated, treatmentActives: [] });
      return;
    }

    updateFormData({ routineSteps: updated });
  };

  const handleActiveToggle = (id: TreatmentActiveId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = formData.treatmentActives;
    const updated = current.includes(id)
      ? current.filter((a) => a !== id)
      : [...current, id];
    updateFormData({ treatmentActives: updated });
  };

  const handleSpotToggle = (id: SpotTreatmentId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = formData.spotTreatments;
    const updated = current.includes(id)
      ? current.filter((s) => s !== id)
      : [...current, id];
    updateFormData({ spotTreatments: updated });
  };

  const completedSteps = formData.routineSteps.length;
  const totalSteps = ROUTINE_STEPS.length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What did you apply?</Text>
      <Text style={styles.subtitle}>Track your skincare routine</Text>

      {/* AM/PM Toggle */}
      <View style={styles.timeToggle}>
        <Pressable
          onPress={() => handleTimeToggle("am")}
          style={[styles.timeButton, formData.routineTime === "am" && styles.timeButtonSelected]}
        >
          <Ionicons
            name="sunny-outline"
            size={18}
            color={formData.routineTime === "am" ? "#FFFFFF" : colors.textSecondary}
          />
          <Text
            style={[styles.timeText, formData.routineTime === "am" && styles.timeTextSelected]}
          >
            Morning
          </Text>
        </Pressable>
        <Pressable
          onPress={() => handleTimeToggle("pm")}
          style={[styles.timeButton, formData.routineTime === "pm" && styles.timeButtonSelected]}
        >
          <Ionicons
            name="moon-outline"
            size={18}
            color={formData.routineTime === "pm" ? "#FFFFFF" : colors.textSecondary}
          />
          <Text
            style={[styles.timeText, formData.routineTime === "pm" && styles.timeTextSelected]}
          >
            Evening
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Routine Steps Checklist */}
        <View style={styles.checklist}>
          {ROUTINE_STEPS.map((step, index) => {
            const isSelected = formData.routineSteps.includes(step.id);
            const isTreatment = step.id === "treatment";

            return (
              <View key={step.id}>
                <Pressable
                  onPress={() => handleStepToggle(step.id)}
                  style={[styles.checklistItem, index === 0 && styles.checklistItemFirst]}
                >
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                  </View>
                  <Text style={[styles.checklistText, isSelected && styles.checklistTextSelected]}>
                    {step.label}
                  </Text>
                  {isTreatment && isSelected && (
                    <Ionicons
                      name={expandTreatment ? "chevron-up" : "chevron-down"}
                      size={18}
                      color={colors.textSecondary}
                      style={styles.expandIcon}
                    />
                  )}
                </Pressable>

                {/* Treatment Actives Sub-menu */}
                {isTreatment && isSelected && expandTreatment && (
                  <Animated.View
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(150)}
                    style={styles.subMenu}
                  >
                    <Text style={styles.subMenuTitle}>Active ingredient:</Text>
                    <View style={styles.subMenuOptions}>
                      {TREATMENT_ACTIVES.map((active) => {
                        const isActiveSelected = formData.treatmentActives.includes(active.id);
                        return (
                          <Pressable
                            key={active.id}
                            onPress={() => handleActiveToggle(active.id)}
                            style={[styles.subMenuChip, isActiveSelected && styles.subMenuChipSelected]}
                          >
                            <Text
                              style={[
                                styles.subMenuChipText,
                                isActiveSelected && styles.subMenuChipTextSelected,
                              ]}
                            >
                              {active.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </Animated.View>
                )}
              </View>
            );
          })}
        </View>

        {/* Spot Treatments Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spot Treatments</Text>
          <View style={styles.spotTreatments}>
            {SPOT_TREATMENTS.map((treatment) => {
              const isSelected = formData.spotTreatments.includes(treatment.id);
              return (
                <Pressable
                  key={treatment.id}
                  onPress={() => handleSpotToggle(treatment.id)}
                  style={[styles.spotChip, isSelected && styles.spotChipSelected]}
                >
                  <Text style={[styles.spotChipText, isSelected && styles.spotChipTextSelected]}>
                    {treatment.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Routine steps:</Text>
          <Text style={styles.summaryValue}>
            {completedSteps}/{totalSteps}
          </Text>
        </View>
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
    marginBottom: 20,
    textAlign: "center",
  },
  timeToggle: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    marginBottom: 24,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  timeButtonSelected: {
    backgroundColor: colors.skin,
    borderColor: colors.skin,
  },
  timeText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  timeTextSelected: {
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  checklist: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    overflow: "hidden",
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  checklistItemFirst: {
    borderTopWidth: 0,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: colors.skin,
    borderColor: colors.skin,
  },
  checklistText: {
    flex: 1,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    color: colors.textPrimary,
  },
  checklistTextSelected: {
    fontWeight: "600",
  },
  expandIcon: {
    marginLeft: 8,
  },
  subMenu: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  subMenuTitle: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  subMenuOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  subMenuChip: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subMenuChipSelected: {
    backgroundColor: colors.skinLight,
    borderColor: colors.skin,
  },
  subMenuChipText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    color: colors.textSecondary,
  },
  subMenuChipTextSelected: {
    color: colors.skin,
    fontWeight: "500",
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 12,
  },
  spotTreatments: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  spotChip: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  spotChipSelected: {
    backgroundColor: colors.skinLight,
    borderColor: colors.skin,
  },
  spotChipText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    color: colors.textPrimary,
  },
  spotChipTextSelected: {
    color: colors.skin,
    fontWeight: "500",
  },
  summary: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: colors.skin,
  },
});
