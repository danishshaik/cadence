import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Icon } from "@components/ui";
import { mentalWeatherColors, mentalWeatherFonts } from "@theme";

interface MentalWeatherHeaderProps {
  title: string;
  onBack?: () => void;
  onClose: () => void;
  showBack?: boolean;
  accentColor?: string;
  titleColor?: string;
}

export function MentalWeatherHeader({
  title,
  onBack,
  onClose,
  showBack = true,
  accentColor = mentalWeatherColors.accent,
  titleColor = mentalWeatherColors.textPrimary,
}: MentalWeatherHeaderProps) {
  const handleBack = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack?.();
  }, [onBack]);

  const handleClose = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [onClose]);

  return (
    <View style={styles.container}>
      {showBack ? (
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
        >
          <Icon name="chevron-back" size={20} color={accentColor} />
        </Pressable>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}

      <Text selectable style={[styles.title, { color: titleColor }]}>
        {title}
      </Text>

      <Pressable
        onPress={handleClose}
        style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
      >
        <Icon name="x" size={18} color={accentColor} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 44,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderCurve: "continuous",
    backgroundColor: mentalWeatherColors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
  },
  title: {
    fontFamily: mentalWeatherFonts.text,
    fontSize: 16,
    fontWeight: "600",
  },
});
