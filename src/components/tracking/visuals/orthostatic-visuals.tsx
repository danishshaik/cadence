import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "@components/ui";

const isIOS = process.env.EXPO_OS === "ios";

interface OrthostaticFactorCardProps {
  label: string;
  subtitle?: string;
  icon: string;
  selected: boolean;
  onPress: () => void;
}

export function OrthostaticFactorCard({
  label,
  subtitle,
  icon,
  selected,
  onPress,
}: OrthostaticFactorCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.factorCard,
        selected && styles.factorCardSelected,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.factorIconWrap}>
        <Icon name={icon} size={20} color="#6C5CE7" />
      </View>
      <View style={styles.factorInfo}>
        <Text selectable style={styles.factorTitle}>
          {label}
        </Text>
        {subtitle ? (
          <Text selectable style={styles.factorSubtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={[styles.factorCheck, selected && styles.factorCheckSelected]}>
        {selected ? <Icon name="checkmark" size={12} color="#FFFFFF" /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  factorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 18,
    borderCurve: "continuous",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6E6F0",
    paddingVertical: 14,
    paddingHorizontal: 16,
    boxShadow: "0 2px 10px rgba(108, 92, 231, 0.03)",
  },
  factorCardSelected: {
    borderColor: "#6C5CE7",
    backgroundColor: "#F9F7FF",
  },
  factorIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderCurve: "continuous",
    backgroundColor: "#F0EDFC",
    alignItems: "center",
    justifyContent: "center",
  },
  factorInfo: {
    flex: 1,
    gap: 2,
  },
  factorTitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: "#2F3A34",
  },
  factorSubtitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    color: "#9AA2A0",
  },
  factorCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1.5,
    borderColor: "#E6E6F0",
    alignItems: "center",
    justifyContent: "center",
  },
  factorCheckSelected: {
    backgroundColor: "#6C5CE7",
    borderColor: "#6C5CE7",
  },
});
