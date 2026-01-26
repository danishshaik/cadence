import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform, Modal } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@theme";
import { useLogGI } from "./log-gi-provider";
import { CONTEXT_OPTIONS, ContextType } from "@/types/gi";

export function TimingStep() {
  const { formData, updateFormData } = useLogGI();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const insets = useSafeAreaInsets();

  const handleContextSelect = (context: ContextType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateFormData({ context });
  };

  const handleTimeChange = (_event: unknown, selectedDate?: Date) => {
    if (selectedDate) {
      updateFormData({ startedAt: selectedDate });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>When did it start?</Text>

      {/* Time Button - opens bottom sheet */}
      <Pressable
        onPress={() => setShowTimePicker(true)}
        style={({ pressed }) => [styles.timeButton, pressed && styles.timeButtonPressed]}
      >
        <Text style={styles.timeButtonLabel}>Time</Text>
        <Text style={styles.timeButtonValue}>{formatTime(formData.startedAt)}</Text>
      </Pressable>

      {/* Context Pills */}
      <Text style={styles.sectionLabel}>Context</Text>
      <View style={styles.pillsContainer}>
        {CONTEXT_OPTIONS.map((option) => {
          const isSelected = formData.context === option.id;
          return (
            <Pressable
              key={option.id}
              onPress={() => handleContextSelect(option.id)}
              style={({ pressed }) => [
                styles.pill,
                isSelected && styles.pillSelected,
                pressed && styles.pillPressed,
              ]}
            >
              <Text style={styles.pillIcon}>{option.icon}</Text>
              <Text style={[styles.pillText, isSelected && styles.pillTextSelected]} numberOfLines={1}>
                {option.label}
              </Text>
              {isSelected && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Time Picker Bottom Sheet Modal */}
      <Modal visible={showTimePicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowTimePicker(false)} />
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time</Text>
              <Pressable onPress={() => setShowTimePicker(false)} style={styles.modalDoneButton}>
                <Text style={styles.modalDoneText}>Done</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={formData.startedAt}
              mode="time"
              display="spinner"
              onChange={handleTimeChange}
              style={styles.timePicker}
              textColor={colors.textPrimary}
            />
          </View>
        </View>
      </Modal>
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
    marginBottom: 20,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  timeButtonPressed: {
    opacity: 0.9,
  },
  timeButtonLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    color: colors.textSecondary,
  },
  timeButtonValue: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 18,
    fontWeight: "600",
    color: colors.gi,
  },
  sectionLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pillsContainer: {
    gap: 10,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  pillSelected: {
    backgroundColor: colors.giLight,
    borderColor: colors.gi,
  },
  pillPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  pillIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  pillText: {
    flex: 1,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  pillTextSelected: {
    fontWeight: "600",
  },
  checkmark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.gi,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 17,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  modalDoneButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  modalDoneText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 17,
    fontWeight: "600",
    color: colors.gi,
  },
  timePicker: {
    height: 200,
    width: "100%",
  },
});
