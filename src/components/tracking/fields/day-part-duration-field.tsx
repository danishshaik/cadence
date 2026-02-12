import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "@components/ui";
import { SegmentedSelectionField } from "./segmented-selection-field";
import type { SegmentedSelectionFieldProps } from "./segmented-selection-field";

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
  durationSegmentOverrides?: Omit<
    Partial<SegmentedSelectionFieldProps>,
    "value" | "onChange" | "options" | "label" | "description"
  >;
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
  durationSegmentOverrides,
}: DayPartDurationFieldProps) {
  const useLegacyDurationSegmentStyle = !durationSegmentOverrides;

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

      <SegmentedSelectionField
        label="How long?"
        description="Tap one to choose"
        value={
          durationOptions.find((option) =>
            option.ongoing ? isOngoing : !isOngoing && durationMinutes === option.minutes
          )?.id ?? durationOptions[0]?.id ?? ""
        }
        onChange={(optionId) => {
          const option = durationOptions.find((item) => item.id === optionId);
          if (option) {
            handleDurationSelect(option);
          }
        }}
        options={durationOptions.map((option) => ({
          value: option.id,
          label: option.label,
        }))}
        disabled={disabled}
        accentColor={accentColor}
        cardColor={cardColor}
        segmentSurfaceColor="#F3F4F6"
        textPrimaryColor={textMutedColor}
        textSecondaryColor="#6D6C6A"
        segmentSelectedTextColor="#FFFFFF"
        containerRadius={useLegacyDurationSegmentStyle ? 999 : undefined}
        segmentRadius={useLegacyDurationSegmentStyle ? 999 : undefined}
        segmentMinHeight={useLegacyDurationSegmentStyle ? 34 : undefined}
        showDividers={useLegacyDurationSegmentStyle ? false : undefined}
        cardShadow={useLegacyDurationSegmentStyle ? durationShadow : undefined}
        cardStyle={useLegacyDurationSegmentStyle ? styles.durationCard : undefined}
        style={useLegacyDurationSegmentStyle ? styles.durationSegments : undefined}
        {...durationSegmentOverrides}
      />

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
    width: "100%",
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
    borderRadius: 6,
    borderCurve: "continuous",
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 12,
  },
  durationSegments: {
    alignSelf: "stretch",
  },
  hintText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});
