import React from "react";
import { View, StyleSheet } from "react-native";
import { BubbleChoiceField, type BubbleChoiceItem } from "@components/tracking/fields/bubble-choice-field";
import { useTrackerFlow } from "@components/tracking/tracker-flow-provider";
import { EmotionId } from "@/types/mood";
import { FlowTitle } from "./flow-title";
import { mentalWeatherColors } from "@theme";
import { MoodFormData } from "./mood-flow-types";

const EMOTION_BUBBLES: BubbleChoiceItem[] = [
  { id: "stress", label: "Stress", icon: "brain" },
  { id: "sleep", label: "Sleep", icon: "moon" },
  { id: "light", label: "Light", icon: "sun" },
  { id: "noise", label: "Noise", icon: "volume-2" },
  { id: "smell", label: "Smell", icon: "wind" },
  { id: "weather", label: "Weather", icon: "cloud-rain" },
  { id: "meals", label: "Meals", icon: "utensils-crossed" },
  { id: "water", label: "Water", icon: "droplets" },
  { id: "alcohol", label: "Alcohol", icon: "wine" },
  { id: "caffeine", label: "Caffeine", icon: "coffee" },
  { id: "hormonal", label: "Hormonal", icon: "heart-pulse" },
  { id: "screen", label: "Screen", icon: "monitor" },
];

export function EmotionsStep() {
  const { formData, updateField } = useTrackerFlow<MoodFormData>();

  const bubbleItems = EMOTION_BUBBLES;

  const handleChange = React.useCallback(
    (next: string[]) => {
      updateField("emotions", next as EmotionId[]);
    },
    [updateField]
  );

  return (
    <View style={styles.container}>
      <FlowTitle
        title="Pick a few words"
        subtitle="How are you feeling right now?"
        align="center"
      />

      <View style={styles.bubbleArea}>
        <BubbleChoiceField
          value={formData.emotions}
          onChange={handleChange}
          items={bubbleItems}
          layoutPreset="pencil"
          accentColor={mentalWeatherColors.accent}
          textPrimaryColor={mentalWeatherColors.textPrimary}
          textSecondaryColor={mentalWeatherColors.textSecondary}
          textMutedColor={mentalWeatherColors.textMuted}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
  },
  bubbleArea: {
    flex: 1,
    paddingHorizontal: 8,
  },
});
