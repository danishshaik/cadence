import React from "react";
import { View, Text, Pressable, StyleSheet, Platform, useWindowDimensions, ScrollView } from "react-native";
import Svg, { Path, Circle, Line, G } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { colors } from "@theme";
import { useLogSkin } from "./log-skin-provider";
import { BREAKOUT_TYPES, BreakoutTypeId } from "@/types/skin";

// Abstract icons for each breakout type
function BreakoutIcon({ type, isSelected }: { type: BreakoutTypeId; isSelected: boolean }) {
  const color = isSelected ? "#FFFFFF" : colors.textSecondary;
  const size = 40;

  switch (type) {
    case "whitehead":
      // Small raised bump with white center
      return (
        <Svg width={size} height={size} viewBox="0 0 40 40">
          <Circle cx="20" cy="22" r="8" fill={color} opacity={0.3} />
          <Circle cx="20" cy="22" r="5" fill={color} opacity={0.5} />
          <Circle cx="20" cy="21" r="2" fill={color} />
        </Svg>
      );
    case "blackhead":
      // Dark spot/pore
      return (
        <Svg width={size} height={size} viewBox="0 0 40 40">
          <Circle cx="20" cy="22" r="6" fill={color} opacity={0.2} />
          <Circle cx="20" cy="22" r="3" fill={color} />
          <Circle cx="18" cy="20" r="1" fill={isSelected ? colors.skin : "#FFFFFF"} />
        </Svg>
      );
    case "papule":
      // Red raised bump
      return (
        <Svg width={size} height={size} viewBox="0 0 40 40">
          <Circle cx="20" cy="22" r="10" fill={color} opacity={0.15} />
          <Circle cx="20" cy="22" r="7" fill={color} opacity={0.3} />
          <Circle cx="20" cy="22" r="4" fill={color} opacity={0.6} />
        </Svg>
      );
    case "cystic":
      // Deep bump with dotted underground indication
      return (
        <Svg width={size} height={size} viewBox="0 0 40 40">
          {/* Surface line */}
          <Line x1="8" y1="18" x2="32" y2="18" stroke={color} strokeWidth={1} opacity={0.5} />
          {/* Visible bump above surface */}
          <Path
            d="M 15 18 Q 20 12 25 18"
            fill={color}
            opacity={0.4}
          />
          {/* Deep underground mass (dotted) */}
          <Circle
            cx="20"
            cy="26"
            r="7"
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeDasharray="2,2"
            opacity={0.6}
          />
        </Svg>
      );
    case "texture":
      // Rough texture/scabbing pattern
      return (
        <Svg width={size} height={size} viewBox="0 0 40 40">
          <G opacity={0.6}>
            <Circle cx="14" cy="16" r="2" fill={color} />
            <Circle cx="22" cy="14" r="1.5" fill={color} />
            <Circle cx="26" cy="18" r="2" fill={color} />
            <Circle cx="18" cy="22" r="1.5" fill={color} />
            <Circle cx="24" cy="24" r="2" fill={color} />
            <Circle cx="14" cy="26" r="1.5" fill={color} />
            <Circle cx="20" cy="28" r="2" fill={color} />
          </G>
        </Svg>
      );
    case "scarring":
      // Fading marks
      return (
        <Svg width={size} height={size} viewBox="0 0 40 40">
          <Circle cx="20" cy="20" r="8" fill={color} opacity={0.1} />
          <Circle cx="20" cy="20" r="6" fill={color} opacity={0.15} />
          <Circle cx="20" cy="20" r="4" fill={color} opacity={0.2} />
          <Circle cx="20" cy="20" r="2" fill={color} opacity={0.3} />
        </Svg>
      );
    default:
      return null;
  }
}

export function BreakoutTypeStep() {
  const { formData, updateFormData } = useLogSkin();
  const { width: screenWidth } = useWindowDimensions();

  const cardSize = Math.min((screenWidth - 60 - 12) / 2, 140); // 2 columns, max 140px

  const handleToggle = (id: BreakoutTypeId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = formData.breakoutTypes;
    const updated = current.includes(id)
      ? current.filter((t) => t !== id)
      : [...current, id];
    updateFormData({ breakoutTypes: updated });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>What's the activity today?</Text>
      <Text style={styles.subtitle}>Select all that apply</Text>

      <View style={styles.grid}>
        {BREAKOUT_TYPES.map((type) => {
          const isSelected = formData.breakoutTypes.includes(type.id);
          return (
            <Pressable
              key={type.id}
              onPress={() => handleToggle(type.id)}
              style={[
                styles.card,
                { width: cardSize, height: cardSize * 0.9 },
                isSelected && styles.cardSelected,
              ]}
            >
              <View style={styles.iconContainer}>
                <BreakoutIcon type={type.id} isSelected={isSelected} />
              </View>
              <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
                {type.label}
              </Text>
              <Text style={[styles.cardDescription, isSelected && styles.cardDescriptionSelected]}>
                {type.description}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {formData.breakoutTypes.length === 0 && (
        <Text style={styles.hint}>Tap cards to select breakout types</Text>
      )}

      {formData.breakoutTypes.length > 0 && (
        <Text style={styles.selectedCount}>
          {formData.breakoutTypes.length} type{formData.breakoutTypes.length !== 1 ? "s" : ""} selected
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  title: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  cardSelected: {
    backgroundColor: colors.skin,
    borderColor: colors.skin,
  },
  iconContainer: {
    marginBottom: 8,
  },
  cardLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
  },
  cardLabelSelected: {
    color: "#FFFFFF",
  },
  cardDescription: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 2,
  },
  cardDescriptionSelected: {
    color: "rgba(255,255,255,0.8)",
  },
  hint: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 20,
  },
  selectedCount: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    color: colors.skin,
    textAlign: "center",
    marginTop: 16,
    fontWeight: "500",
  },
});
