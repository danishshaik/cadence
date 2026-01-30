import React, { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { BottomSheet, Group } from "@expo/ui/swift-ui";
import {
  presentationDetents,
  presentationDragIndicator,
} from "@expo/ui/swift-ui/modifiers";
import { colors } from "@theme";
import { ExpoDateTimePicker } from "@/components/ui";
import { TimeOfDay } from "@/types/migraine";
import { useLogMigraine } from "./log-migraine-provider";

const isIOS = Platform.OS === "ios";

export function WhenStep() {
  const { formData, updateFormData } = useLogMigraine();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(formData.startedAt);

  const getTimeOfDayFromDate = (date: Date): TimeOfDay => {
    const hour = date.getHours();
    if (hour >= 0 && hour < 6) return "night";
    if (hour >= 6 && hour < 12) return "morning";
    if (hour >= 12 && hour < 18) return "afternoon";
    return "evening";
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const handleDateChange = (selectedDate: Date) => {
    const now = new Date();
    const clampedDate = selectedDate > now ? now : selectedDate;
    updateFormData("startedAt", clampedDate);
    updateFormData("timeOfDay", getTimeOfDayFromDate(clampedDate));
  };

  const durationLabel = useMemo(() => {
    if (formData.isOngoing) {
      const diffMs = Date.now() - formData.startedAt.getTime();
      const minutes = Math.max(0, Math.round(diffMs / 60000));
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (hours === 0) return `${mins}m`;
      if (mins === 0) return `${hours}h`;
      return `${hours}h ${mins}m`;
    }
    if (formData.durationMinutes === null) return "--";
    const hours = Math.floor(formData.durationMinutes / 60);
    const mins = formData.durationMinutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }, [formData.durationMinutes, formData.isOngoing, formData.startedAt]);

  const handleStopNow = () => {
    updateFormData("isOngoing", false);
    if (formData.durationMinutes === null) {
      const diffMs = Date.now() - formData.startedAt.getTime();
      updateFormData("durationMinutes", Math.max(0, Math.round(diffMs / 60000)));
    }
  };

  const handleSetOngoing = () => {
    updateFormData("isOngoing", true);
    updateFormData("durationMinutes", null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>When did it start?</Text>
      <Text style={styles.subtitle}>Select the date and time of day</Text>

      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>Started</Text>
          <Text style={styles.cardValue}>
            {formatDate(formData.startedAt)}, {formData.startedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            setTempDate(formData.startedAt);
            setShowDatePicker(true);
          }}
        >
          <Text style={styles.cardAction}>Edit</Text>
        </Pressable>
      </View>

      {!isIOS && showDatePicker && (
        <ExpoDateTimePicker
          value={formData.startedAt}
          mode="datetime"
          display="default"
          maximumDate={new Date()}
          onChange={(selected) => {
            handleDateChange(selected);
            setShowDatePicker(false);
          }}
        />
      )}

      {isIOS && (
        <BottomSheet
          isPresented={showDatePicker}
          onIsPresentedChange={setShowDatePicker}
          fitToContents
        >
          <Group
            modifiers={[
              presentationDetents([{ height: 360 }]),
              presentationDragIndicator("visible"),
            ]}
          >
            <View style={styles.sheetCard}>
              <View style={styles.sheetHeader}>
                <Pressable onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.sheetAction}>Cancel</Text>
                </Pressable>
                <Text style={styles.sheetTitle}>Edit start time</Text>
                <Pressable
                  onPress={() => {
                    setShowDatePicker(false);
                    handleDateChange(tempDate);
                  }}
                >
                  <Text style={styles.sheetAction}>Done</Text>
                </Pressable>
              </View>
              <ExpoDateTimePicker
                value={tempDate}
                mode="datetime"
                display="spinner"
                maximumDate={new Date()}
                accentColor={colors.migraine}
                onChange={(selected) => {
                  setTempDate(selected);
                }}
              />
            </View>
          </Group>
        </BottomSheet>
      )}

      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>Ended</Text>
          <Text style={styles.cardValue}>{formData.isOngoing ? "Ongoing" : "Stopped"}</Text>
        </View>
        {formData.isOngoing ? (
          <Pressable style={styles.stopPill} onPress={handleStopNow}>
            <Text style={styles.stopText}>Stop Now</Text>
          </Pressable>
        ) : (
          <Pressable onPress={handleSetOngoing}>
            <Text style={styles.cardAction}>Resume</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.durationDisplay}>
        <Text style={styles.durationLabel}>Total Duration</Text>
        <Text style={styles.durationValue}>{durationLabel}</Text>
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
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardInfo: {
    gap: 4,
  },
  cardLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    color: colors.textSecondary,
  },
  cardValue: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  cardAction: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
    color: colors.migraine,
  },
  stopPill: {
    backgroundColor: colors.migraineLight,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  stopText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
    color: colors.migraine,
  },
  durationDisplay: {
    alignItems: "center",
    marginTop: 8,
  },
  durationLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    color: colors.textSecondary,
  },
  durationValue: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 40,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  sheetCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitle: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  sheetAction: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: colors.migraine,
  },
});
