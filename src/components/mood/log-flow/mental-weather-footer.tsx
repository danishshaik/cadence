import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { mentalWeatherColors, mentalWeatherFonts } from "./mental-weather-theme";

interface MentalWeatherFooterProps {
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  secondaryWidth?: number;
  variant?: "compact" | "regular";
}

export function MentalWeatherFooter({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  secondaryWidth,
  variant = "regular",
}: MentalWeatherFooterProps) {
  const isCompact = variant === "compact";
  const handlePrimary = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPrimary();
  }, [onPrimary]);

  const handleSecondary = React.useCallback(() => {
    if (!onSecondary) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSecondary();
  }, [onSecondary]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {secondaryLabel ? (
          <Pressable
            onPress={handleSecondary}
            style={({ pressed }) => [
              styles.secondaryButton,
              isCompact ? styles.secondaryButtonCompact : styles.secondaryButtonRegular,
              secondaryWidth ? { width: secondaryWidth } : styles.secondaryButtonFlex,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text selectable style={[styles.secondaryText, isCompact && styles.secondaryTextCompact]}>
              {secondaryLabel}
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={handlePrimary}
          style={({ pressed }) => [
            styles.primaryButton,
            isCompact ? styles.primaryButtonCompact : styles.primaryButtonRegular,
            !secondaryLabel && styles.primaryButtonFull,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text selectable style={[styles.primaryText, isCompact && styles.primaryTextCompact]}>
            {primaryLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: mentalWeatherColors.accent,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonCompact: {
    height: 50,
    borderRadius: 12,
  },
  primaryButtonRegular: {
    height: 52,
    borderRadius: 14,
  },
  primaryButtonFull: {
    flex: 1,
  },
  primaryText: {
    fontFamily: mentalWeatherFonts.text,
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  primaryTextCompact: {
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: mentalWeatherColors.buttonMuted,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  secondaryButtonCompact: {
    height: 50,
    borderRadius: 12,
    borderWidth: 0,
  },
  secondaryButtonRegular: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: mentalWeatherColors.borderMuted,
  },
  secondaryButtonFlex: {
    flex: 1,
  },
  secondaryText: {
    fontFamily: mentalWeatherFonts.text,
    fontSize: 15,
    fontWeight: "600",
    color: "#6C7A72",
  },
  secondaryTextCompact: {
    fontSize: 16,
    color: mentalWeatherColors.textMuted,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
});
