import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import Svg, { Path, Circle, G, Rect, Line } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { colors } from "@theme";
import { useLogGI } from "./log-gi-provider";
import { GI_SYMPTOMS, SymptomId } from "@/types/gi";

function SymptomIcon({ icon, isSelected }: { icon: string; isSelected: boolean }) {
  const color = isSelected ? colors.gi : colors.textSecondary;
  const size = 24;

  const icons: Record<string, React.ReactNode> = {
    balloon: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 2C8 2 5 5.5 5 10C5 14 8 17 12 17C16 17 19 14 19 10C19 5.5 16 2 12 2Z" stroke={color} strokeWidth={1.5} fill={isSelected ? colors.giLight : "none"} />
        <Path d="M12 17V21" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      </Svg>
    ),
    wave: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M2 12C4 8 6 8 8 12C10 16 12 16 14 12C16 8 18 8 20 12" stroke={color} strokeWidth={1.5} strokeLinecap="round" fill="none" />
      </Svg>
    ),
    knot: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={8} stroke={color} strokeWidth={1.5} fill={isSelected ? colors.giLight : "none"} />
        <Path d="M8 10C10 8 14 8 16 10M8 14C10 16 14 16 16 14" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      </Svg>
    ),
    fire: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 2C12 2 8 6 8 11C8 14 10 17 12 17C14 17 16 14 16 11C16 6 12 2 12 2Z" stroke={color} strokeWidth={1.5} fill={isSelected ? colors.giLight : "none"} />
      </Svg>
    ),
    wind: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M2 12H16C18 12 20 10 20 8C20 6 18 4 16 4" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <Path d="M2 7H12C13.5 7 15 5.5 15 4" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      </Svg>
    ),
    stop: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x={4} y={4} width={16} height={16} rx={3} stroke={color} strokeWidth={1.5} fill={isSelected ? colors.giLight : "none"} />
        <Line x1={9} y1={12} x2={15} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    ),
    "arrow-down": (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 4V18" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <Path d="M6 14L12 20L18 14" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  };

  return icons[icon] || null;
}

export function SymptomsStep() {
  const { formData, updateFormData } = useLogGI();

  const handleSymptomToggle = (id: SymptomId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const currentSymptoms = formData.symptoms;
    const newSymptoms = currentSymptoms.includes(id)
      ? currentSymptoms.filter((s) => s !== id)
      : [...currentSymptoms, id];
    updateFormData({ symptoms: newSymptoms });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What are you feeling?</Text>

      <View style={styles.grid}>
        {GI_SYMPTOMS.map((symptom) => {
          const isSelected = formData.symptoms.includes(symptom.id);
          return (
            <Pressable
              key={symptom.id}
              onPress={() => handleSymptomToggle(symptom.id)}
              style={({ pressed }) => [
                styles.symptomCard,
                isSelected && styles.symptomCardSelected,
                pressed && styles.symptomCardPressed,
              ]}
            >
              <SymptomIcon icon={symptom.icon} isSelected={isSelected} />
              <Text style={[styles.symptomLabel, isSelected && styles.symptomLabelSelected]} numberOfLines={1}>
                {symptom.label}
              </Text>
            </Pressable>
          );
        })}
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
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  symptomCard: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: "transparent",
    gap: 10,
  },
  symptomCardSelected: {
    backgroundColor: colors.giLight,
    borderColor: colors.gi,
  },
  symptomCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  symptomLabel: {
    flex: 1,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  symptomLabelSelected: {
    color: colors.gi,
  },
});
