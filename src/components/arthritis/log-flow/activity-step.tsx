import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SymbolView } from "expo-symbols";
import * as Haptics from "expo-haptics";
import { colors, shadows } from "@theme";
import { useLogArthritis } from "./log-arthritis-provider";
import { ActivityTypeId, ACTIVITY_TYPES } from "@/types/arthritis";

const isIOS = process.env.EXPO_OS === "ios";

// Map activity icons to SF Symbols
const ACTIVITY_ICONS: Record<string, string> = {
  chair: "chair.fill",
  dumbbell: "dumbbell.fill",
  "heart-pulse": "heart.fill",
  accessibility: "figure.yoga",
  activity: "waveform.path.ecg",
  package: "shippingbox.fill",
};

function ActivityPill({
  id,
  label,
  icon,
  selected,
  onPress,
}: {
  id: ActivityTypeId;
  label: string;
  icon: string;
  selected: boolean;
  onPress: (id: ActivityTypeId) => void;
}) {
  const symbolName = (ACTIVITY_ICONS[icon] || "circle.fill") as any;

  return (
    <Pressable
      onPress={() => onPress(id)}
      style={[styles.activityPill, selected && styles.activityPillSelected]}
    >
      <View style={styles.iconContainer}>
        <SymbolView
          name={symbolName}
          size={18}
          tintColor={selected ? "#FFFFFF" : colors.arthritisTextSecondary}
          fallback={
            <Text style={[styles.iconFallback, selected && styles.iconFallbackSelected]}>●</Text>
          }
        />
      </View>
      <Text style={[styles.activityText, selected && styles.activityTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ActivityStep() {
  const { formData, updateFormData } = useLogArthritis();

  const handleActivityPress = (id: ActivityTypeId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = formData.activities;
    const updated = current.includes(id)
      ? current.filter((a) => a !== id)
      : [...current, id];
    updateFormData({ activities: updated });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>What has your body done today?</Text>
        <Text style={styles.subtitle}>Select all that apply</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.pillsContainer}
        showsVerticalScrollIndicator={false}
      >
        {ACTIVITY_TYPES.map((activity) => (
          <ActivityPill
            key={activity.id}
            id={activity.id}
            label={activity.label}
            icon={activity.icon}
            selected={formData.activities.includes(activity.id)}
            onPress={handleActivityPress}
          />
        ))}
      </ScrollView>

      <Text style={styles.footerNote}>
        {formData.activities.length === 0
          ? "No activities selected"
          : `${formData.activities.length} activit${formData.activities.length !== 1 ? "ies" : "y"} selected`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 12,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 24,
    fontWeight: "700",
    color: colors.arthritisText,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    color: colors.arthritisTextSecondary,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  pillsContainer: {
    gap: 12,
    paddingHorizontal: 4,
  },
  activityPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEEEEE",
    borderRadius: 16,
    borderCurve: "continuous",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  activityPillSelected: {
    backgroundColor: colors.arthritis,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconFallback: {
    fontSize: 16,
    color: colors.arthritisTextSecondary,
  },
  iconFallbackSelected: {
    color: "#FFFFFF",
  },
  activityText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
    color: colors.arthritisText,
    flex: 1,
  },
  activityTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  footerNote: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    color: colors.arthritisTextSecondary,
    marginTop: 12,
  },
});
