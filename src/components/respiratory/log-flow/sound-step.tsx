import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { colors, shadows } from "@theme";
import { useLogRespiratory } from "./log-respiratory-provider";
import { BREATHING_SOUNDS, BreathingSoundId } from "@/types/respiratory";

const isIOS = process.env.EXPO_OS === "ios";

type WaveType = "smooth" | "jagged" | "bubbly";

function SoundWave({ type, color }: { type: WaveType; color: string }) {
  if (type === "jagged") {
    return (
      <Svg width={90} height={28} viewBox="0 0 90 28" fill="none">
        <Path
          d="M2 20 L12 8 L22 22 L32 6 L42 20 L52 8 L62 22 L72 10 L88 20"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (type === "bubbly") {
    return (
      <Svg width={90} height={28} viewBox="0 0 90 28" fill="none">
        <Path d="M2 18 C14 10, 26 26, 38 18" stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Circle cx={50} cy={16} r={3} fill={color} opacity={0.6} />
        <Circle cx={62} cy={12} r={4} fill={color} opacity={0.45} />
        <Circle cx={74} cy={18} r={3} fill={color} opacity={0.7} />
        <Path d="M68 20 C72 22, 78 22, 88 18" stroke={color} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }

  return (
    <Svg width={90} height={28} viewBox="0 0 90 28" fill="none">
      <Path
        d="M2 18 C12 8, 24 8, 34 18 S56 28, 74 18 S88 8, 88 18"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

const SOUND_WAVES: Record<BreathingSoundId, WaveType> = {
  silent: "smooth",
  wheeze: "jagged",
  rattle: "bubbly",
};

export function SoundStep() {
  const { formData, updateFormData } = useLogRespiratory();

  const handleSelect = (id: BreathingSoundId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateFormData({ breathingSound: id });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>What do you hear when you breathe?</Text>
        <Text style={styles.subtitle}>Tap a card to choose the closest sound</Text>
      </View>

      <View style={styles.cardRow}>
        {BREATHING_SOUNDS.map((sound) => {
          const isSelected = formData.breathingSound === sound.id;
          const waveColor = isSelected ? "#FFFFFF" : colors.respiratoryIndigo;

          return (
            <Pressable
              key={sound.id}
              onPress={() => handleSelect(sound.id)}
              style={({ pressed }) => [
                styles.card,
                isSelected && styles.cardSelected,
                pressed && styles.cardPressed,
              ]}
            >
              <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                {sound.label}
              </Text>
              <SoundWave type={SOUND_WAVES[sound.id]} color={waveColor} />
              <Text style={[styles.cardDescription, isSelected && styles.cardDescriptionSelected]}>
                {sound.description}
              </Text>
              <Text style={[styles.cardHint, isSelected && styles.cardHintSelected]}>
                Tap to choose
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
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  header: {
    alignItems: "center",
  },
  title: {
    fontFamily: isIOS ? "SF Pro Display" : "sans-serif",
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: "center",
  },
  cardRow: {
    gap: 10,
    flex: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderCurve: "continuous",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.respiratoryIndigoLight,
    alignItems: "center",
    ...shadows.sm,
  },
  cardSelected: {
    backgroundColor: colors.respiratoryIndigo,
    borderColor: colors.respiratoryIndigo,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  cardTitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  cardTitleSelected: {
    color: "#FFFFFF",
  },
  cardDescription: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: "center",
  },
  cardDescriptionSelected: {
    color: "rgba(255,255,255,0.8)",
  },
  cardHint: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    color: colors.respiratoryIndigo,
    marginTop: 4,
  },
  cardHintSelected: {
    color: "rgba(255,255,255,0.8)",
  },
});
