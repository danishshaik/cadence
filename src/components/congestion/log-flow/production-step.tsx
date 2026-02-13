import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "@components/ui";
import { colors, shadows } from "@theme";
import { PHLEGM_COLORS, PhlegmColorId } from "@/types/congestion";
import { useLogCongestion } from "./log-congestion-provider";
import { ResonanceStepHeader } from "./resonance-step-header";

const isIOS = process.env.EXPO_OS === "ios";

const SWATCH_STYLES: Record<
  PhlegmColorId,
  { gradient: [string, string, string]; label: string }
> = {
  clear: {
    gradient: ["#FFFFFF", "#F0F0F0", "#E0E0E0"],
    label: "Clear",
  },
  yellow: {
    gradient: ["#FFF9C4", "#FFEE58", "#F9A825"],
    label: "Yellow",
  },
  green: {
    gradient: ["#C8E6C9", "#81C784", "#4CAF50"],
    label: "Green",
  },
  pink: {
    gradient: ["#FFCDD2", "#EF9A9A", "#E57373"],
    label: "Pink/Rust",
  },
};

const INSIGHT_TEXT: Partial<Record<PhlegmColorId, string>> = {
  clear: "Clear usually indicates low mucus production",
  yellow: "Yellow typically indicates immune response",
  green: "Green may indicate thicker mucus production",
  pink: "If pink/rust persists, contact your provider",
};

function ColorSwatch({
  id,
  selected,
  onPress,
}: {
  id: PhlegmColorId;
  selected: boolean;
  onPress: (id: PhlegmColorId) => void;
}) {
  const swatch = SWATCH_STYLES[id];

  return (
    <Pressable onPress={() => onPress(id)} style={styles.swatchWrap}>
      <LinearGradient
        colors={swatch.gradient}
        start={{ x: 0.2, y: 0.1 }}
        end={{ x: 0.8, y: 0.9 }}
        style={[
          styles.swatch,
          selected ? styles.swatchSelected : styles.swatchIdle,
          selected && { borderColor: colors.restorativeSage, borderWidth: 3 },
        ]}
      />
      <Text selectable style={[styles.swatchLabel, selected && styles.swatchLabelSelected]}>
        {swatch.label}
      </Text>
    </Pressable>
  );
}

export function ProductionStep() {
  const { formData, updateFormData } = useLogCongestion();

  const selected = formData.phlegmColor;
  const insight = selected ? INSIGHT_TEXT[selected] : null;

  const handleSelect = (id: PhlegmColorId) => {
    Haptics.selectionAsync();
    updateFormData({ phlegmColor: id });
  };

  return (
    <View style={styles.container}>
      <ResonanceStepHeader
        title="If productive, what color is it?"
        subtitle="This helps track your recovery"
      />

      <View style={styles.card}>
        <View style={styles.row}>
          {PHLEGM_COLORS.map((option) => (
            <ColorSwatch
              key={option.id}
              id={option.id}
              selected={selected === option.id}
              onPress={handleSelect}
            />
          ))}
        </View>

        {insight ? (
          <View style={styles.insightPill}>
            <Icon name="info" size={16} color="#F9A825" />
            <Text selectable style={styles.insightText}>
              {insight}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 20,
  },
  card: {
    width: "100%",
    borderRadius: 28,
    borderCurve: "continuous",
    backgroundColor: "#FFFFFF",
    padding: 28,
    gap: 24,
    ...shadows.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
    gap: 8,
  },
  swatchWrap: {
    alignItems: "center",
    gap: 8,
  },
  swatch: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  swatchIdle: {
    borderWidth: 1.5,
    borderColor: "#E5EBE5",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
  },
  swatchSelected: {
    boxShadow: "0 6px 16px rgba(249, 168, 37, 0.25)",
  },
  swatchLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    fontWeight: "500",
    color: "#6C7A72",
  },
  swatchLabelSelected: {
    fontWeight: "600",
    color: "#2F3A34",
  },
  insightPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 16,
    borderCurve: "continuous",
    backgroundColor: "rgba(255, 249, 196, 0.18)",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  insightText: {
    flex: 1,
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    fontWeight: "500",
    color: "#6C7A72",
  },
});
