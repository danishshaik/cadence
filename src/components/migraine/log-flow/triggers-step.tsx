import React from "react";
import { View, Text, Pressable, StyleSheet, Platform, ScrollView } from "react-native";
import * as Haptics from "expo-haptics";
import { Icon } from "@components/ui";
import { colors } from "@theme";
import { useLogMigraine } from "./log-migraine-provider";

const isIOS = Platform.OS === "ios";

const palette = {
  textPrimary: "#2F3A34",
  textSecondary: "#7B857F",
  textMuted: "#4A5A52",
} as const;

const TRIGGER_BUBBLES = [
  { id: "stress", label: "Stress", icon: "brain", size: 100, x: 8, y: 5 },
  { id: "lack_of_sleep", label: "Sleep", icon: "moon", size: 86, x: 132, y: 18 },
  { id: "bright_light", label: "Light", icon: "sun", size: 94, x: 242, y: 40 },
  { id: "loud_noise", label: "Noise", icon: "volume-2", size: 80, x: 52, y: 122 },
  { id: "strong_smell", label: "Smell", icon: "wind", size: 76, x: 162, y: 130 },
  { id: "weather", label: "Weather", icon: "cloud-rain", size: 82, x: 255, y: 160 },
  { id: "skipped_meal", label: "Meals", icon: "utensils-crossed", size: 92, x: 0, y: 225 },
  { id: "dehydration", label: "Water", icon: "droplets", size: 82, x: 115, y: 240 },
  { id: "alcohol", label: "Alcohol", icon: "wine", size: 78, x: 220, y: 265 },
  { id: "caffeine", label: "Caffeine", icon: "coffee", size: 80, x: 40, y: 340 },
  { id: "hormonal", label: "Hormonal", icon: "heart-pulse", size: 88, x: 145, y: 350, labelSize: 10 },
  { id: "screen_time", label: "Screen", icon: "monitor", size: 80, x: 255, y: 368 },
] as const;

export function TriggersStep() {
  const { formData, updateFormData } = useLogMigraine();

  const handleTriggerToggle = (triggerId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newTriggers = formData.triggers.includes(triggerId)
      ? formData.triggers.filter((id) => id !== triggerId)
      : [...formData.triggers, triggerId];
    updateFormData("triggers", newTriggers);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What triggered it?</Text>
      <Text style={styles.subtitle}>Tap bubbles to select</Text>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.bubbleCanvas}>
          {TRIGGER_BUBBLES.map((bubble) => {
            const isSelected = formData.triggers.includes(bubble.id);
            return (
              <Pressable
                key={bubble.id}
                onPress={() => handleTriggerToggle(bubble.id)}
                style={({ pressed }) => [
                  styles.bubble,
                  {
                    width: bubble.size,
                    height: bubble.size,
                    left: bubble.x,
                    top: bubble.y,
                    backgroundColor: isSelected ? colors.migraine : "#FFFFFF",
                  },
                  pressed && styles.bubblePressed,
                ]}
              >
                <Icon
                  name={bubble.icon}
                  size={24}
                  color={isSelected ? "#FFFFFF" : colors.migraine}
                />
                <Text
                  style={[
                    styles.bubbleLabel,
                    bubble.labelSize ? { fontSize: bubble.labelSize } : null,
                    isSelected && styles.bubbleLabelSelected,
                  ]}
                >
                  {bubble.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 24,
    fontWeight: "700",
    color: palette.textPrimary,
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    color: palette.textSecondary,
    textAlign: "center",
    marginBottom: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  bubbleCanvas: {
    position: "relative",
    width: "100%",
    maxWidth: 340,
    minHeight: 430,
    alignSelf: "center",
  },
  bubble: {
    position: "absolute",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  bubblePressed: {
    transform: [{ scale: 0.97 }],
  },
  bubbleLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 11,
    fontWeight: "500",
    color: palette.textMuted,
    textAlign: "center",
  },
  bubbleLabelSelected: {
    color: "#FFFFFF",
  },
});
