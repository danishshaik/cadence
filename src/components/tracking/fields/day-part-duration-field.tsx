import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "@components/ui";

const isIOS = process.env.EXPO_OS === "ios";

export interface DayPartOption {
  id: string;
  label: string;
  icon: string;
}

export interface DurationOption {
  id: string;
  label: string;
  minutes: number | null;
  ongoing: boolean;
}

interface DayPartDurationFieldProps {
  label?: string;
  description?: string;
  hintText?: string;
  dayParts: DayPartOption[];
  durationOptions: DurationOption[];
  timeOfDay: string;
  isOngoing: boolean;
  durationMinutes: number | null;
  onTimeOfDayChange: (next: string) => void;
  onStartedAtChange: (next: Date) => void;
  onIsOngoingChange: (next: boolean) => void;
  onDurationMinutesChange: (next: number | null) => void;
  disabled?: boolean;
  accentColor?: string;
  accentSoftColor?: string;
  cardColor?: string;
  textPrimaryColor?: string;
  textSecondaryColor?: string;
  textMutedColor?: string;
  hintColor?: string;
  dayPartShadow?: string;
  durationShadow?: string;
}

export function DayPartDurationField({
  label,
  description,
  hintText,
  dayParts,
  durationOptions,
  timeOfDay,
  isOngoing,
  durationMinutes,
  onTimeOfDayChange,
  onStartedAtChange,
  onIsOngoingChange,
  onDurationMinutesChange,
  disabled,
  accentColor = "#0F172A",
  accentSoftColor = "#EEF2FF",
  cardColor = "#FFFFFF",
  textPrimaryColor = "#111827",
  textSecondaryColor = "#6B7280",
  textMutedColor = "#4B5563",
  hintColor = "#6366F1",
  dayPartShadow = "0 4px 16px rgba(15, 23, 42, 0.08)",
  durationShadow = "0 6px 20px rgba(15, 23, 42, 0.08)",
}: DayPartDurationFieldProps) {
  const handleDayPartSelect = (next: string) => {
    if (disabled) return;
    onTimeOfDayChange(next);
    onStartedAtChange(new Date());
  };

  const handleDurationSelect = (option: DurationOption) => {
    if (disabled) return;
    if (option.ongoing) {
      onIsOngoingChange(true);
      onDurationMinutesChange(null);
      return;
    }

    onDurationMinutesChange(option.minutes);
    onIsOngoingChange(false);
  };

  return (
    <View style={styles.container}>
      {(label || description) && (
        <View style={styles.titleArea}>
          {label ? (
            <Text selectable style={[styles.title, { color: textPrimaryColor }]}
            >
              {label}
            </Text>
          ) : null}
          {description ? (
            <Text selectable style={[styles.subtitle, { color: textSecondaryColor }]}
            >
              {description}
            </Text>
          ) : null}
        </View>
      )}

      <View style={styles.dayPartGrid}>
        <View style={styles.dayPartRow}>
          {dayParts.slice(0, 2).map((part) => {
            const isSelected = timeOfDay === part.id;
            return (
              <Pressable
                key={part.id}
                onPress={() => handleDayPartSelect(part.id)}
                style={[
                  styles.dayPartTile,
                  { boxShadow: dayPartShadow, backgroundColor: cardColor },
                  isSelected && { backgroundColor: accentSoftColor },
                ]}
                disabled={disabled}
              >
                <Icon
                  name={part.icon}
                  size={22}
                  color={accentColor}
                />
                <Text
                  selectable
                  style={[
                    styles.dayPartLabel,
                    { color: textMutedColor },
                    isSelected && { color: accentColor },
                  ]}
                >
                  {part.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.dayPartRow}>
          {dayParts.slice(2).map((part) => {
            const isSelected = timeOfDay === part.id;
            return (
              <Pressable
                key={part.id}
                onPress={() => handleDayPartSelect(part.id)}
                style={[
                  styles.dayPartTile,
                  { boxShadow: dayPartShadow, backgroundColor: cardColor },
                  isSelected && { backgroundColor: accentSoftColor },
                ]}
                disabled={disabled}
              >
                <Icon
                  name={part.icon}
                  size={22}
                  color={accentColor}
                />
                <Text
                  selectable
                  style={[
                    styles.dayPartLabel,
                    { color: textMutedColor },
                    isSelected && { color: accentColor },
                  ]}
                >
                  {part.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View
        style={[
          styles.durationCard,
          { backgroundColor: cardColor, boxShadow: durationShadow },
        ]}
      >
        <Text selectable style={[styles.durationLabel, { color: textMutedColor }]}
        >
          How long?
        </Text>
        <Text selectable style={[styles.durationHelper, { color: textSecondaryColor }]}
        >
          Tap one to choose
        </Text>
        <View style={styles.durationSegments}>
          {durationOptions.map((option) => {
            const isSelected = option.ongoing
              ? isOngoing
              : !isOngoing && durationMinutes === option.minutes;
            return (
              <Pressable
                key={option.id}
                onPress={() => handleDurationSelect(option)}
                style={[
                  styles.durationSegment,
                  isSelected && { backgroundColor: accentColor },
                ]}
                disabled={disabled}
              >
                <Text
                  selectable
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

      {hintText ? (
        <Text selectable style={[styles.hintText, { color: hintColor }]}>
          {hintText}
        </Text>
      ) : null}
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
    textAlign: "center",
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
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
    borderRadius: 20,
    borderCurve: "continuous",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dayPartLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
  },
  durationCard: {
    width: "100%",
    borderRadius: 24,
    borderCurve: "continuous",
    padding: 20,
    gap: 12,
  },
  durationLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 18,
    fontWeight: "600",
  },
  durationHelper: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    fontWeight: "500",
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
    textAlign: "center",
  },
});
