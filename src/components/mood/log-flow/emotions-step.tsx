import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors } from "@theme";
import { useLogMood } from "./log-mood-provider";
import { EMOTIONS, EmotionId } from "@/types/mood";

function EmotionPill({
  emotion,
  isSelected,
  onPress
}: {
  emotion: typeof EMOTIONS[number];
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSpring(0.95, { damping: 15 }, () => {
      scale.value = withSpring(1, { damping: 15 });
    });
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.pill,
          isSelected && styles.pillSelected,
          animatedStyle,
        ]}
      >
        <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
          {emotion.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function EmotionsStep() {
  const { formData, updateFormData } = useLogMood();

  const handleEmotionToggle = (id: EmotionId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const currentEmotions = formData.emotions;
    const newEmotions = currentEmotions.includes(id)
      ? currentEmotions.filter((e) => e !== id)
      : [...currentEmotions, id];
    updateFormData({ emotions: newEmotions });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Which words fit this feeling?</Text>
      <Text style={styles.subtitle}>Select all that apply</Text>

      <View style={styles.cloudContainer}>
        {EMOTIONS.map((emotion) => {
          const isSelected = formData.emotions.includes(emotion.id);
          return (
            <EmotionPill
              key={emotion.id}
              emotion={emotion}
              isSelected={isSelected}
              onPress={() => handleEmotionToggle(emotion.id)}
            />
          );
        })}
      </View>

      {formData.emotions.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {formData.emotions.length} selected
          </Text>
        </View>
      )}
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
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  cloudContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  pill: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: "transparent",
  },
  pillSelected: {
    backgroundColor: colors.moodLight,
    borderColor: colors.mood,
  },
  pillText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  pillTextSelected: {
    fontWeight: "600",
    color: colors.mood,
  },
  summary: {
    alignItems: "center",
    marginTop: "auto",
    paddingTop: 16,
  },
  summaryText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    color: colors.mood,
    fontWeight: "600",
  },
});
