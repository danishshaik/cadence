import React from "react";
import { View, Text, Pressable, StyleSheet, Platform, useWindowDimensions } from "react-native";
import Svg, { Circle, Ellipse, Path, G } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { colors } from "@theme";
import { useLogGI } from "./log-gi-provider";
import { BRISTOL_SCALE, BristolType } from "@/types/gi";

function BristolIllustration({ type, isSelected }: { type: string; isSelected: boolean }) {
  const color = isSelected ? colors.gi : colors.textTertiary;
  const fillColor = isSelected ? colors.giLight : "transparent";
  const width = 70;
  const height = 36;

  const illustrations: Record<string, React.ReactNode> = {
    pebbles: (
      <Svg width={width} height={height} viewBox="0 0 70 36">
        <Circle cx={14} cy={14} r={5} fill={fillColor} stroke={color} strokeWidth={1.5} />
        <Circle cx={35} cy={12} r={4} fill={fillColor} stroke={color} strokeWidth={1.5} />
        <Circle cx={54} cy={15} r={5} fill={fillColor} stroke={color} strokeWidth={1.5} />
        <Circle cx={24} cy={26} r={4} fill={fillColor} stroke={color} strokeWidth={1.5} />
        <Circle cx={44} cy={27} r={3.5} fill={fillColor} stroke={color} strokeWidth={1.5} />
      </Svg>
    ),
    cracked: (
      <Svg width={width} height={height} viewBox="0 0 70 36">
        <Ellipse cx={35} cy={18} rx={28} ry={11} fill={fillColor} stroke={color} strokeWidth={1.5} />
        <Path d="M 18 15 L 21 18 L 18 21" stroke={color} strokeWidth={1} fill="none" />
        <Path d="M 35 14 L 35 22" stroke={color} strokeWidth={1} fill="none" />
        <Path d="M 52 15 L 49 18 L 52 21" stroke={color} strokeWidth={1} fill="none" />
      </Svg>
    ),
    smooth: (
      <Svg width={width} height={height} viewBox="0 0 70 36">
        <Ellipse cx={35} cy={18} rx={28} ry={10} fill={fillColor} stroke={color} strokeWidth={1.5} />
        {isSelected && <Path d="M 26 18 L 32 24 L 44 14" stroke={colors.gi} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      </Svg>
    ),
    mushy: (
      <Svg width={width} height={height} viewBox="0 0 70 36">
        <Path d="M 10 20 Q 8 12 20 12 Q 35 8 50 12 Q 62 12 60 20 Q 62 28 50 26 Q 35 30 20 26 Q 8 28 10 20 Z" fill={fillColor} stroke={color} strokeWidth={1.5} />
      </Svg>
    ),
    liquid: (
      <Svg width={width} height={height} viewBox="0 0 70 36">
        <Ellipse cx={35} cy={26} rx={24} ry={7} fill={fillColor} stroke={color} strokeWidth={1.5} />
        <Circle cx={18} cy={10} r={3} fill={fillColor} stroke={color} strokeWidth={1} />
        <Circle cx={48} cy={8} r={2.5} fill={fillColor} stroke={color} strokeWidth={1} />
        <Circle cx={32} cy={6} r={2} fill={fillColor} stroke={color} strokeWidth={1} />
      </Svg>
    ),
    none: (
      <Svg width={width} height={height} viewBox="0 0 70 36">
        <Circle cx={35} cy={18} r={12} fill={fillColor} stroke={color} strokeWidth={1.5} />
        <Path d="M 27 18 L 43 18" stroke={color} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    ),
  };

  return illustrations[type] || null;
}

export function BristolStep() {
  const { formData, updateFormData } = useLogGI();
  const { width } = useWindowDimensions();

  const gridGap = 10;
  const horizontalPadding = 20;
  const cardWidth = Math.floor((width - horizontalPadding * 2 - gridGap) / 2);

  const handleSelect = (id: BristolType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateFormData({ bowelMovement: id });
  };

  const getTypeColor = (id: string) => {
    if (id === "type3" || id === "type4") return colors.gi;
    if (id === "type1" || id === "type2" || id === "type6" || id === "type7") return colors.giSevere;
    return colors.textSecondary;
  };

  // Show simplified options - combine types for cleaner UI
  const simplifiedOptions = [
    { id: "type1" as BristolType, label: "Hard", description: "Lumps", shape: "pebbles" },
    { id: "type3" as BristolType, label: "Normal", description: "Formed", shape: "cracked", ideal: true },
    { id: "type4" as BristolType, label: "Ideal", description: "Smooth", shape: "smooth", ideal: true },
    { id: "type6" as BristolType, label: "Loose", description: "Mushy", shape: "mushy" },
    { id: "type7" as BristolType, label: "Liquid", description: "Watery", shape: "liquid" },
    { id: "none" as BristolType, label: "None", description: "No movement", shape: "none" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bowel movement?</Text>

      <View style={styles.grid}>
        {simplifiedOptions.map((item) => {
          const isSelected = formData.bowelMovement === item.id;
          const typeColor = getTypeColor(item.id);

          return (
            <Pressable
              key={item.id}
              onPress={() => handleSelect(item.id)}
              style={({ pressed }) => [
                styles.card,
                { width: cardWidth },
                isSelected && styles.cardSelected,
                pressed && styles.cardPressed,
              ]}
            >
              {item.ideal && (
                <View style={styles.idealBadge}>
                  <Text style={styles.idealBadgeText}>Ideal</Text>
                </View>
              )}
              <View style={styles.illustrationContainer}>
                <BristolIllustration type={item.shape} isSelected={isSelected} />
              </View>
              <Text style={[styles.cardLabel, isSelected && { color: typeColor }]}>{item.label}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
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
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    padding: 12,
    paddingTop: 18,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  cardSelected: {
    backgroundColor: colors.giLight,
    borderColor: colors.gi,
  },
  cardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  illustrationContainer: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  cardLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  cardDescription: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 11,
    color: colors.textSecondary,
  },
  idealBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.gi,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    minWidth: 36,
    alignItems: "center",
    zIndex: 2,
    elevation: 2,
  },
  idealBadgeText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 9,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
