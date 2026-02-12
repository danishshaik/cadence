import React from "react";
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { colors, shadows } from "@theme";
import { COUGH_CHARACTERS, CoughCharacterId } from "@/types/congestion";
import { useLogCongestion } from "./log-congestion-provider";

const isIOS = process.env.EXPO_OS === "ios";

const ACCENT_MAP: Record<CoughCharacterId, { accent: string; glow: string }> = {
  dry: { accent: colors.restorativeSage, glow: "rgba(136, 216, 176, 0.28)" },
  barking: { accent: colors.textSecondary, glow: "rgba(44, 62, 80, 0.14)" },
  wet: { accent: colors.restorativeSage, glow: "rgba(136, 216, 176, 0.28)" },
  productive: { accent: colors.honeyAmber, glow: "rgba(255, 193, 7, 0.28)" },
};

function FeatherIcon({ color }: { color: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <Path d="M6 20C12 16 16 10 22 8" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M8 22C10 20 12 19 14 18" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M12 16C14 15 16 14 18 13" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function BarkIcon({ color }: { color: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <Path d="M7 11L16 7V21L7 17V11Z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M18 10C20 12 20 16 18 18" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M21 8C24 12 24 16 21 20" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function WaveIcon({ color }: { color: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <Path d="M4 10C6 8 10 8 12 10C14 12 18 12 20 10C22 8 24 8 26 10" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M4 16C6 14 10 14 12 16C14 18 18 18 20 16C22 14 24 14 26 16" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function DropletIcon({ color }: { color: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <Path
        d="M14 4C14 4 6 12 6 17C6 21.4 9.6 24 14 24C18.4 24 22 21.4 22 17C22 12 14 4 14 4Z"
        stroke={color}
        strokeWidth={2}
      />
      <Circle cx={16.5} cy={18} r={2} fill={color} opacity={0.3} />
    </Svg>
  );
}

type ColorIconElement = React.ReactElement<{ color: string }>;

const ICONS: Record<CoughCharacterId, ColorIconElement> = {
  dry: <FeatherIcon color={colors.restorativeSage} />,
  barking: <BarkIcon color={colors.textSecondary} />,
  wet: <WaveIcon color={colors.restorativeSage} />,
  productive: <DropletIcon color={colors.honeyAmber} />,
};

export function CoughCharacterStep() {
  const { formData, updateFormData } = useLogCongestion();
  const { width, height } = useWindowDimensions();

  const columnGap = 12;
  const horizontalPadding = 48; // 20 container + 4 grid padding on each side
  const columnWidth = Math.min(
    170,
    Math.max(150, (width - horizontalPadding - columnGap) / 2)
  );
  const cardHeight = Math.min(185, Math.max(150, Math.round(height * 0.21)));
  const iconSize = Math.min(34, Math.max(28, Math.round(cardHeight * 0.22)));
  const gridOffset = Math.min(20, Math.max(10, Math.round(height * 0.018)));
  const leftColumn = COUGH_CHARACTERS.filter((_, index) => index % 2 === 0);
  const rightColumn = COUGH_CHARACTERS.filter((_, index) => index % 2 === 1);

  const handleToggle = (id: CoughCharacterId) => {
    const isSelected = formData.coughCharacters.includes(id);
    const updated = isSelected
      ? formData.coughCharacters.filter((c) => c !== id)
      : [...formData.coughCharacters, id];

    if (id === "dry") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (id === "wet") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      Haptics.selectionAsync();
    }

    updateFormData({ coughCharacters: updated });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>What does the cough feel like?</Text>
        <Text style={styles.subtitle}>Select all that apply</Text>
      </View>

      <View style={[styles.grid, { marginTop: gridOffset }]}>
        <View style={[styles.column, { width: columnWidth }]}>
          {leftColumn.map((cough) => {
            const isSelected = formData.coughCharacters.includes(cough.id);
            const { accent: accentColor, glow: glowColor } = ACCENT_MAP[cough.id];
            const icon = React.cloneElement(ICONS[cough.id], {
              color: accentColor,
            });

            return (
              <Pressable
                key={cough.id}
                onPress={() => handleToggle(cough.id)}
                style={({ pressed }) => [
                  styles.card,
                  { height: cardHeight },
                  isSelected && {
                    borderColor: accentColor,
                    borderWidth: 2,
                    boxShadow: `0 0 16px ${glowColor}`,
                  },
                  pressed && styles.cardPressed,
                ]}
              >
                <View style={[styles.iconWrap, { width: iconSize, height: iconSize, borderRadius: iconSize / 2 }]}>
                  {icon}
                </View>
                <Text style={styles.cardTitle}>{cough.label}</Text>
                <Text style={styles.cardDescription}>{cough.description}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={[styles.column, { width: columnWidth }]}>
          {rightColumn.map((cough) => {
            const isSelected = formData.coughCharacters.includes(cough.id);
            const { accent: accentColor, glow: glowColor } = ACCENT_MAP[cough.id];
            const icon = React.cloneElement(ICONS[cough.id], {
              color: accentColor,
            });

            return (
              <Pressable
                key={cough.id}
                onPress={() => handleToggle(cough.id)}
                style={({ pressed }) => [
                  styles.card,
                  { height: cardHeight },
                  isSelected && {
                    borderColor: accentColor,
                    borderWidth: 2,
                    boxShadow: `0 0 16px ${glowColor}`,
                  },
                  pressed && styles.cardPressed,
                ]}
              >
                <View style={[styles.iconWrap, { width: iconSize, height: iconSize, borderRadius: iconSize / 2 }]}>
                  {icon}
                </View>
                <Text style={styles.cardTitle}>{cough.label}</Text>
                <Text style={styles.cardDescription}>{cough.description}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 12,
    paddingTop: 2,
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
  grid: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  column: {
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderCurve: "continuous",
    padding: 16,
    width: "100%",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
    ...shadows.sm,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },
  cardDescription: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
