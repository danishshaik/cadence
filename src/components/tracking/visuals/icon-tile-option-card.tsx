import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "@components/ui";

const isIOS = process.env.EXPO_OS === "ios";

interface IconTileOptionCardProps {
  label: string;
  subtitle?: string;
  icon?: string;
  selected: boolean;
  onPress: () => void;
  width: number;
  height?: number;
  accentColor?: string;
  iconBackgroundColor?: string;
  selectedBackgroundColor?: string;
  glowColor?: string;
  textColor?: string;
  subtitleColor?: string;
}

export function IconTileOptionCard({
  label,
  subtitle,
  icon,
  selected,
  onPress,
  width,
  height = 150,
  accentColor = "#88D8B0",
  iconBackgroundColor = "#E8F5F2",
  selectedBackgroundColor = "#FFFFFF",
  glowColor = "rgba(136, 216, 176, 0.18)",
  textColor = "#2F3A34",
  subtitleColor = "rgba(123, 133, 127, 0.8)",
}: IconTileOptionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          width,
          height,
        },
        selected && {
          borderColor: accentColor,
          borderWidth: 3,
          backgroundColor: selectedBackgroundColor,
          boxShadow: `0 0 16px ${glowColor}`,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconBackgroundColor }]}>
        {icon ? <Icon name={icon} size={24} color={accentColor} /> : null}
      </View>
      <Text selectable style={[styles.title, { color: textColor }]}>
        {label}
      </Text>
      {subtitle ? (
        <Text selectable style={[styles.subtitle, { color: subtitleColor }]}>
          {subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderCurve: "continuous",
    padding: 14,
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5EBE5",
    backgroundColor: "#FFFFFF",
    boxShadow: "0 4px 16px rgba(47, 58, 52, 0.08)",
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 11,
    lineHeight: 15,
    textAlign: "center",
  },
});
