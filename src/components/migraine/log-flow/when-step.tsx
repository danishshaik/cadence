import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors } from "@theme";
import { TIME_OF_DAY_OPTIONS, TimeOfDay } from "@/types/migraine";
import { useLogMigraine } from "./log-migraine-provider";

export function WhenStep() {
  const { formData, updateFormData } = useLogMigraine();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      updateFormData("startedAt", selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>When did it start?</Text>
      <Text style={styles.subtitle}>Select the date and time of day</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>DATE</Text>
        <Pressable
          style={({ pressed }) => [styles.dateButton, pressed && styles.dateButtonPressed]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{formatDate(formData.startedAt)}</Text>
        </Pressable>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={formData.startedAt}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={handleDateChange}
          maximumDate={new Date()}
          accentColor={colors.migraine}
        />
      )}

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>TIME OF DAY</Text>
        <View style={styles.chipGrid}>
          {TIME_OF_DAY_OPTIONS.map((option) => {
            const isSelected = formData.timeOfDay === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => updateFormData("timeOfDay", option.id as TimeOfDay)}
                style={[styles.chip, isSelected && styles.chipSelected]}
              >
                <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>
                  {option.label}
                </Text>
                <Text style={[styles.chipTime, isSelected && styles.chipTimeSelected]}>
                  {option.timeRange}
                </Text>
              </Pressable>
            );
          })}
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
  dateButton: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  dateButtonPressed: {
    opacity: 0.7,
  },
  dateText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  chip: {
    width: "47%",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  chipSelected: {
    backgroundColor: colors.migraineLight,
    borderColor: colors.migraine,
  },
  chipLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  chipLabelSelected: {
    color: colors.migraine,
  },
  chipTime: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    color: colors.textSecondary,
  },
  chipTimeSelected: {
    color: colors.migraine,
  },
});
