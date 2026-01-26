import React from "react";
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, shadows } from "@theme";
import { PHLEGM_COLORS, PhlegmColorId } from "@/types/congestion";
import { useLogCongestion } from "./log-congestion-provider";

const isIOS = process.env.EXPO_OS === "ios";

const COLOR_MAP: Record<PhlegmColorId, { main: string; glow: string }> = {
  clear: { main: "#E2E8F0", glow: "rgba(226,232,240,0.6)" },
  yellow: { main: colors.honeyAmber, glow: "rgba(255,193,7,0.5)" },
  green: { main: "#7BC67B", glow: "rgba(123,198,123,0.5)" },
  pink: { main: "#E9A3A3", glow: "rgba(233,163,163,0.5)" },
};

function Droplet({
  id,
  label,
  selected,
  onPress,
  size,
}: {
  id: PhlegmColorId;
  label: string;
  selected: boolean;
  onPress: (id: PhlegmColorId) => void;
  size: number;
}) {
  const colorset = COLOR_MAP[id];

  return (
    <Pressable onPress={() => onPress(id)} style={styles.dropletWrap}>
      <LinearGradient
        colors={["rgba(255,255,255,0.9)", colorset.main]}
        start={{ x: 0.2, y: 0.1 }}
        end={{ x: 0.8, y: 0.9 }}
        style={[
          styles.droplet,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: selected ? colorset.main : "#E2E8F0",
            boxShadow: selected
              ? `0 0 14px ${colorset.glow}`
              : "0 2px 8px rgba(0,0,0,0.06)",
          },
        ]}
      />
      <Text style={[styles.dropletLabel, selected && { color: colorset.main }]}>{label}</Text>
    </Pressable>
  );
}

export function ProductionStep() {
  const { formData, updateFormData } = useLogCongestion();
  const { width } = useWindowDimensions();

  const swatchSize = Math.min(62, Math.max(44, width * 0.14));

  const handleSelect = (id: PhlegmColorId) => {
    updateFormData({ phlegmColor: id });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>If productive, what color is it?</Text>
        <Text style={styles.subtitle}>This helps track your recovery</Text>
      </View>

      <View style={styles.palette}>
        {PHLEGM_COLORS.map((color) => (
          <Droplet
            key={color.id}
            id={color.id}
            label={color.label}
            selected={formData.phlegmColor === color.id}
            onPress={handleSelect}
            size={swatchSize}
          />
        ))}
      </View>

      {formData.phlegmColor === "pink" && (
        <View style={styles.alertBox}>
          <Text style={styles.alertText}>
            Please keep an eye on this. If it persists, contact your provider.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  palette: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 14,
  },
  dropletWrap: {
    alignItems: "center",
    gap: 8,
  },
  droplet: {
    borderWidth: 2,
    ...shadows.sm,
  },
  dropletLabel: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: "center",
  },
  alertBox: {
    backgroundColor: "#FFF7F2",
    borderRadius: 14,
    borderCurve: "continuous",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#F6CACA",
    ...shadows.sm,
  },
  alertText: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 12,
    color: "#B45353",
    textAlign: "center",
  },
});
